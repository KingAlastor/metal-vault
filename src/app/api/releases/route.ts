import { NextResponse } from "next/server";
import { getReleasesByFilters } from "@/lib/data/release-filters-data";

export async function GET() {
  try {
    const releases = await getReleasesByFilters();
    return NextResponse.json(releases);
  } catch (error) {
    console.error("Error fetching releases:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
