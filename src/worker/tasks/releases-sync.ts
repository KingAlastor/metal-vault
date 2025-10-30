import { convertDateToISO } from "@/lib/general/dateTime";
import {
	updateUpcomingReleasesTableData,
	getBandByArchivesLink,
	type UpcomingReleaseRecord,
} from "@/lib/data/admin/latest-releases-data-actions";
import {
	updateBandsTableData,
	type BandsData,
} from "@/lib/data/admin/band-data-actions";
import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";
import { Browser, Page } from "puppeteer-core";
import * as cheerio from "cheerio";

const USER_AGENTS = [
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
];

const JSON_HEADERS = {
	Accept: "application/json, text/javascript, */*; q=0.01",
	"Accept-Language": "en-US,en;q=0.9",
	"Cache-Control": "no-cache",
	Pragma: "no-cache",
	"X-Requested-With": "XMLHttpRequest",
	Referer: "https://www.metal-archives.com/",
};

const HTML_HEADERS = {
	Accept:
		"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
	"Accept-Language": "en-US,en;q=0.9",
	"Cache-Control": "no-cache",
	Pragma: "no-cache",
	Referer: "https://www.metal-archives.com/",
};

const COOKIE_HEADER =
	process.env.METAL_ARCHIVES_COOKIES || process.env.METAL_ARCHIVES_COOKIE || "";
const CF_CLEARANCE = process.env.METAL_ARCHIVES_CF_CLEARANCE || "";

const JSON_PAGE_SIZE = 100;
const JSON_RETRIES = 3;
const HTML_RETRIES = 3;

export async function syncUpcomingReleaseDataFromArchives(): Promise<void> {
	console.log("[releases-sync] Starting upcoming release data sync from Metal Archives");

	let browser: Browser | null = null;
	const today = new Date().toISOString().split("T")[0];
	const baseUrl =
		"https://www.metal-archives.com/release/ajax-upcoming/json/1?sEcho=1&iColumns=6&sColumns=&iDisplayStart=";
	const commonParams =
		`&iDisplayLength=${JSON_PAGE_SIZE}` +
		"&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2&mDataProp_3=3&mDataProp_4=4&mDataProp_5=5" +
		"&iSortCol_0=4&sSortDir_0=asc&iSortingCols=1" +
		"&bSortable_0=false&bSortable_1=true&bSortable_2=true&bSortable_3=true&bSortable_4=true&bSortable_5=false" +
		"&sSearch=&bRegex=false&sSearch_0=&bRegex_0=false&bSearchable_0=false" +
		"&sSearch_1=&bRegex_1=false&bSearchable_1=true" +
		"&sSearch_2=&bRegex_2=false&bSearchable_2=true" +
		"&sSearch_3=&bRegex_3=false&bSearchable_3=true" +
		"&sSearch_4=&bRegex_4=false&bSearchable_4=true" +
		"&sSearch_5=&bRegex_5=false&bSearchable_5=false" +
		"&includeVersions=0" +
		`&fromDate=${today}&toDate=0000-00-00`;

	let offset = 0;
	let pageNumber = 0;
	let totalProcessed = 0;
	let hasMoreData = true;

	try {
		browser = await launchBrowser();

		while (hasMoreData) {
			pageNumber += 1;
			const url = `${baseUrl}${offset}${commonParams}&_=${Date.now()}`;
			console.log(
				`[releases-sync] Processing page ${pageNumber} (offset ${offset}) -> ${url}`
			);

			try {
				const json = await fetchJsonData(browser, url, JSON_RETRIES);
				const rows: any[] = Array.isArray(json?.aaData) ? json.aaData : [];
				console.log(
					`[releases-sync] Retrieved ${rows.length} releases from Metal Archives`
				);

				const releases: UpcomingReleaseRecord[] = [];

				for (let index = 0; index < rows.length; index++) {
					const row = rows[index];
					console.log(
						`[releases-sync] Processing release ${index + 1}/${rows.length} on page ${pageNumber}`
					);
					const record = await extractReleaseRecord(row, browser);
					if (record) {
						releases.push(record);
						console.log(
							`[releases-sync] Prepared ${record.band_name} - ${record.album_name}`
						);
					} else {
						console.log("[releases-sync] Skipped release due to missing data");
					}
				}

				if (releases.length > 0) {
					await updateUpcomingReleasesTableData(releases);
					totalProcessed += releases.length;
					console.log(
						`[releases-sync] Upserted ${releases.length} releases (total processed ${totalProcessed})`
					);
				} else {
					console.log("[releases-sync] No releases to persist for this page");
				}

				if (rows.length < JSON_PAGE_SIZE) {
					hasMoreData = false;
					console.log("[releases-sync] Fetched final page of data");
				} else {
					offset += JSON_PAGE_SIZE;
				}
					} catch (error) {
						console.error(
							`[releases-sync] Error while processing page ${pageNumber}:`,
							error
						);
						throw error;
					}

			const wait = getRespectfulDelay();
			console.log(`[releases-sync] Waiting ${wait}ms before next request...`);
			await delay(wait);
		}

		console.log(
			`[releases-sync] Sync complete. Pages: ${pageNumber}, Releases processed: ${totalProcessed}`
		);
		} catch (error) {
		console.error(
			"[releases-sync] Critical error encountered during upcoming releases sync:",
			error
		);
		throw error;
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}

async function extractReleaseRecord(
	row: any,
	browser: Browser
): Promise<UpcomingReleaseRecord | null> {
	try {
		if (!Array.isArray(row) || row.length < 5) {
			console.warn("[releases-sync] Unexpected row format encountered");
			return null;
		}

		const [bandLinkHtml, albumLinkHtml, typeRaw, genresRaw, dateRaw] = row;

		const releaseType = typeof typeRaw === "string" ? typeRaw.trim() : "";
		if (releaseType.toLowerCase() === "split") {
			console.log("[releases-sync] Skipping Split release");
			return null;
		}

		const bandAnchor = cheerio.load(String(bandLinkHtml))("a").first();
		const bandHref = bandAnchor.attr("href");
		const bandNamePretty = bandAnchor.text().trim();

		if (!bandHref) {
			console.warn("[releases-sync] Missing band href, skipping row");
			return null;
		}

		const bandSlugMatch = bandHref.match(/\/bands\/([^/]+)\//);
		const bandSlug = bandSlugMatch ? decodeURIComponent(bandSlugMatch[1]) : bandNamePretty;

		const bandIdMatch = bandHref.match(/\/(\d+)(?:[#?].*)?$/);
		const bandArchivesLink = bandIdMatch ? parseInt(bandIdMatch[1], 10) : undefined;

		if (!bandArchivesLink) {
			console.warn("[releases-sync] Unable to determine band archives link");
			return null;
		}

		const albumAnchor = cheerio.load(String(albumLinkHtml))("a").first();
		const albumHref = albumAnchor.attr("href");
		const albumNamePretty = albumAnchor.text().trim();

		if (!albumHref) {
			console.warn("[releases-sync] Missing album href, skipping row");
			return null;
		}

		const albumMatch = albumHref.match(/\/albums\/[^/]+\/[^/]+\/(\d+)/);
		const albumArchivesLink = albumMatch ? parseInt(albumMatch[1], 10) : undefined;

		if (!albumArchivesLink) {
			console.warn("[releases-sync] Unable to determine album archives link");
			return null;
		}

		const existingBand = await getBandByArchivesLink(bandArchivesLink);

		let bandId: number | undefined = existingBand?.id;
		let bandName = existingBand?.name_pretty || existingBand?.name || bandNamePretty;
		let genreTags: string[] = Array.isArray(existingBand?.genre_tags)
			? (existingBand?.genre_tags as string[])
			: [];

		const parsedGenres = parseGenres(typeof genresRaw === "string" ? genresRaw : "");

		if (!existingBand) {
			console.log(
				`[releases-sync] Band not found for archives link ${bandArchivesLink}, creating`
			);
			const country = await getBandOriginFromArchives(bandHref, browser);
			const bandPayload: BandsData = [
				{
					name: bandSlug,
					name_pretty: bandNamePretty || bandSlug,
					genre_tags: parsedGenres,
					country,
					status: "Active",
					archives_link: bandArchivesLink,
				},
			];

			await updateBandsTableData(bandPayload);
			const refreshedBand = await getBandByArchivesLink(bandArchivesLink);
			bandId = refreshedBand?.id;
			bandName =
				refreshedBand?.name_pretty || refreshedBand?.name || bandNamePretty || bandSlug;
			genreTags = Array.isArray(refreshedBand?.genre_tags)
				? (refreshedBand?.genre_tags as string[])
				: parsedGenres;
		} else if (genreTags.length === 0) {
			genreTags = parsedGenres;
		}

		if (!bandId) {
			console.warn(
				`[releases-sync] Could not resolve band ID for archives link ${bandArchivesLink}`
			);
			return null;
		}

		const isoDateRaw = convertDateToISO(String(dateRaw ?? ""));
		const releaseDate = isoDateRaw.includes("NaN") ? undefined : isoDateRaw;

		return {
			band_id: bandId,
			band_name: bandName || bandSlug,
			album_name: albumNamePretty,
			type: releaseType,
			band_archives_link: bandArchivesLink,
			album_archives_link: albumArchivesLink,
			genre_tags: genreTags,
			release_date: releaseDate,
			updated_at: new Date().toISOString(),
		};
	} catch (error) {
			console.error("[releases-sync] Failed to extract release record:", error);
			throw error;
	}
}

async function getBandOriginFromArchives(
	bandUrl: string,
	browser: Browser
): Promise<string> {
	if (!bandUrl) {
		return "Unknown";
	}

	await delay(3000 + Math.floor(Math.random() * 1000));

	try {
		const html = await fetchHtmlContent(browser, bandUrl, HTML_RETRIES);
		const $ = cheerio.load(html);
		const country = $("dt")
			.filter(function () {
				return $(this).text().trim() === "Country of origin:";
			})
			.next("dd")
			.text()
			.trim();

		return country || "Unknown";
	} catch (error) {
		console.error(
			`[releases-sync] Failed to fetch band origin from ${bandUrl}:`,
			error
		);
		return "Unknown";
	}
}

async function fetchJsonData(
	browser: Browser,
	url: string,
	retries: number
): Promise<any> {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			return await withPage(browser, async (page) => {
				await preparePage(page, JSON_HEADERS);
				await delay(1200 + Math.floor(Math.random() * 800));

				const response = await page.goto(url, {
					waitUntil: "networkidle0",
					timeout: 45000,
				});

				if (!response) {
					throw new Error("No response received from Metal Archives");
				}

				const status = response.status();
				if (status >= 400) {
					const body = await response.text();
					throw new Error(
						`HTTP ${status}: ${response.statusText()} - Body snippet: ${body.slice(0, 400)}`
					);
				}

				const contentType = response.headers()["content-type"] || "";
				if (!contentType.includes("application/json")) {
					const body = await response.text();
					throw new Error(
						`Unexpected content-type ${contentType}. Body snippet: ${body.slice(0, 400)}`
					);
				}

				return response.json();
			});
		} catch (error) {
			console.error(
				`[releases-sync] JSON fetch attempt ${attempt} failed for ${url}:`,
				error
			);
			if (attempt < retries) {
				const wait = getBackoffDelay(attempt);
				console.log(`[releases-sync] Waiting ${wait}ms before retrying JSON fetch`);
				await delay(wait);
			} else {
				throw error;
			}
		}
	}

	throw new Error("Failed to fetch JSON data");
}

async function fetchHtmlContent(
	browser: Browser,
	url: string,
	retries: number
): Promise<string> {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			return await withPage(browser, async (page) => {
				await preparePage(page, HTML_HEADERS);
				await delay(1500 + Math.floor(Math.random() * 1200));

				const response = await page.goto(url, {
					waitUntil: "domcontentloaded",
					timeout: 45000,
				});

				if (!response) {
					throw new Error("No response received from Metal Archives");
				}

				const status = response.status();
				if (status >= 400) {
					throw new Error(`HTTP ${status}: ${response.statusText()}`);
				}

				return page.content();
			});
		} catch (error) {
			console.error(
				`[releases-sync] HTML fetch attempt ${attempt} failed for ${url}:`,
				error
			);
			if (attempt < retries) {
				const wait = getBackoffDelay(attempt);
				console.log(`[releases-sync] Waiting ${wait}ms before retrying HTML fetch`);
				await delay(wait);
			} else {
				throw error;
			}
		}
	}

	throw new Error("Failed to fetch HTML content");
}

async function withPage<T>(browser: Browser, handler: (page: Page) => Promise<T>) {
	const page = await browser.newPage();
	try {
		page.setDefaultNavigationTimeout(45000);
		page.setDefaultTimeout(45000);
		return await handler(page);
	} finally {
		if (!page.isClosed()) {
			await page.close();
		}
	}
}

async function preparePage(page: Page, headers: Record<string, string>) {
	const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
	await page.setUserAgent(userAgent);
	await page.setExtraHTTPHeaders(headers);
	await page.setViewport({
		width: 1280 + Math.floor(Math.random() * 120),
		height: 720 + Math.floor(Math.random() * 120),
	});
	await applyCloudflareBypass(page);
}

async function applyCloudflareBypass(page: Page) {
	const cookies = parseCookieHeader(COOKIE_HEADER);

	if (CF_CLEARANCE && !cookies.some((cookie) => cookie.name === "cf_clearance")) {
		cookies.push({ name: "cf_clearance", value: CF_CLEARANCE });
	}

	if (cookies.length === 0) {
		return;
	}

	for (const cookie of cookies) {
		if (!cookie.name || !cookie.value) continue;
		try {
			await page.setCookie({
				name: cookie.name,
				value: cookie.value,
				domain: ".metal-archives.com",
				path: "/",
				secure: true,
				httpOnly: false,
				sameSite: "None",
			});
		} catch (error) {
			console.warn(
				`[releases-sync] Failed to set cookie ${cookie.name} for Metal Archives:`,
				error
			);
		}
	}
}

function parseCookieHeader(header: string): { name: string; value: string }[] {
	if (!header) {
		return [];
	}

	return header
		.split(";")
		.map((part) => part.trim())
		.map((part) => {
			const index = part.indexOf("=");
			if (index === -1) {
				return null;
			}
			const name = part.slice(0, index).trim();
			const value = part.slice(index + 1).trim();
			if (!name || !value) {
				return null;
			}
			return { name, value };
		})
		.filter((cookie): cookie is { name: string; value: string } => Boolean(cookie));
}

async function launchBrowser(): Promise<Browser> {
	const launchOptions: any = {
		args: [
			...chrome.args,
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-dev-shm-usage",
			"--disable-accelerated-2d-canvas",
			"--no-first-run",
			"--no-zygote",
			"--disable-gpu",
		],
		headless: true,
	};

	try {
		const execPath = await chrome.executablePath;
		if (execPath) {
			launchOptions.executablePath = execPath;
		} else {
			throw new Error("chrome-aws-lambda returned empty executable path");
		}
	} catch (error) {
		console.log(
			"[releases-sync] chrome-aws-lambda executable not available, trying system Chrome..."
		);
		const systemPaths = [
			"/usr/bin/google-chrome-stable",
			"/usr/bin/google-chrome",
			"/usr/bin/chromium-browser",
			"/usr/bin/chromium",
		];

		const fs = require("fs");

		for (const path of systemPaths) {
			try {
				if (fs.existsSync(path)) {
					launchOptions.executablePath = path;
					console.log(`[releases-sync] Using system Chrome at: ${path}`);
					break;
				}
			} catch (_) {
				// Ignore and continue checking remaining paths
			}
		}

		if (!launchOptions.executablePath) {
			throw new Error(
				"No Chrome executable found. Install Chrome/Chromium or configure chrome-aws-lambda."
			);
		}
	}

	return puppeteer.launch(launchOptions);
}

function parseGenres(genres: string): string[] {
	if (!genres) {
		return [];
	}

	const cleaned = genres
		.replace(/\(.*?\)/gi, "")
		.replace(/-/g, " ")
		.replace(/\bmetal\b/gi, "")
		.replace(/\band\b/gi, "/")
		.replace(/\bwith\b/gi, "/")
		.replace(/\binfluences\b/gi, "")
		.replace(/\belements\b/gi, "")
		.replace(/\bgarde\b/gi, "Garde")
		.replace(/\s+/g, " ")
		.trim();

	return cleaned
		.split(/\/|;|,/)
		.map((tag) => tag.trim())
		.filter((tag) => tag.length > 0);
}

function getRespectfulDelay(): number {
	return 3000 + Math.floor(Math.random() * 2000);
}

function getBackoffDelay(attempt: number): number {
	return Math.min(5000 * attempt, 45000);
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
