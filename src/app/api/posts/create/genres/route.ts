import { getSession } from "@/lib/session/server-actions";
import { getGenres } from "@/lib/data/genres-data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const genreTags = await getGenres();

    return NextResponse.json(genreTags);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
