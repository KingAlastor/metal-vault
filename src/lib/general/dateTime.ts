import { monthsArray } from "../enums";

export function convertDateToISO(dateString: string) {
  const cleanedDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, "$1");
  const date = new Date(cleanedDateString);

  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);

  return `${year}-${month}-${day}`;
}

export const formatDateAndTime = (date: Date) => {
  const d = new Date(date);

  const month = monthsArray[d.getMonth()];
  const day = d.getDate();
  const hour = d.getHours().toString().padStart(2, "0");
  const minute = d.getMinutes().toString().padStart(2, "0");

  return `${month} ${day} ${hour}:${minute}`;
};

export const formatDateWithNamedMonth = (date: Date) => {
  const d = new Date(date);

  const month = monthsArray[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  return `${month} ${day} ${year}`;
};

export function formatTimeToSeconds(timeString: string): number {
  if (!timeString) {
    return 0;
  }

  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}

export function formatTimeFromSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function parseMetalArchivesDate(dateString: string): Date | null {
  if (!dateString) {
    return null;
  }

  // Handle "YYYY" format
  if (/^\d{4}$/.test(dateString)) {
    return new Date(Date.UTC(parseInt(dateString), 0, 1)); // January 1st of the year
  }

  // Handle "Month YYYY" format
  if (/^[a-zA-Z]+ \d{4}$/.test(dateString)) {
    const [month, year] = dateString.split(" ");
    const monthIndex = getMonthIndex(month);
    if (monthIndex === -1) {
      console.warn(`Could not parse month: ${month}`);
      return null;
    }
    return new Date(Date.UTC(parseInt(year), monthIndex, 1));
  }

  // Handle "Month Day, YYYY" format (e.g., "August 11th, 2023" or "January 2nd, 1996")
  if (/^[a-zA-Z]+ \d{1,2}(?:st|nd|rd|th)?(?:,)? \d{4}$/.test(dateString)) {
    // Clean up the date string by removing ordinal suffixes and commas, then normalize spaces
    const cleanedDateString = dateString
      .replace(/(st|nd|rd|th)/g, "")
      .replace(/,/g, "")
      .replace(/\s+/g, " ")
      .trim();
    
    const parts = cleanedDateString.split(" ");
    
    if (parts.length !== 3) {
      console.warn(`Expected 3 parts, got ${parts.length}: ${parts}`);
      return null;
    }
    
    const [month, day, year] = parts;
    const monthIndex = getMonthIndex(month);

    if (monthIndex === -1) {
      console.warn(`Could not parse month: ${month}`);
      return null;
    }
    return new Date(Date.UTC(parseInt(year), monthIndex, parseInt(day)));
  }

  console.warn(`Could not parse date string: ${dateString}`);
  return null;
}

function getMonthIndex(month: string): number {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // First try exact match
  let index = months.findIndex(m => m.toLowerCase() === month.toLowerCase());
  if (index !== -1) return index;
  
  // Handle truncated months (e.g., "Augu" -> "August")
  const truncatedMonths = months.map(m => m.substring(0, 4).toLowerCase());
  index = truncatedMonths.findIndex(m => m === month.toLowerCase());
  if (index !== -1) return index;
  
  // Handle even shorter truncations (e.g., "Aug" -> "August")
  const shortMonths = months.map(m => m.substring(0, 3).toLowerCase());
  index = shortMonths.findIndex(m => m === month.toLowerCase());
  if (index !== -1) return index;
  
  console.warn(`Could not parse month: ${month}`);
  return -1;
}

export function getFromAndToDates(period: string): { from: Date, to: Date } {
  const today = new Date();
  const utcYear = today.getUTCFullYear();
  const utcMonth = today.getUTCMonth();
  const utcDate = today.getUTCDate();

  const toDate = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0, 0));

  if (period === 'W') {
    const fromDate = new Date(Date.UTC(utcYear, utcMonth, utcDate - 7, 0, 0, 0, 0));
    return {
      from: fromDate,
      to: toDate
    };
  } else if (period === 'M') {
    const fromDate = new Date(Date.UTC(utcYear, utcMonth - 1, 1, 0, 0, 0, 0));
    const lastDateOfPreviousMonth = new Date(Date.UTC(utcYear, utcMonth, 0, 0, 0, 0));
    return {
      from: fromDate,
      to: lastDateOfPreviousMonth
    };
  }

  throw new Error('Invalid period specified');
}