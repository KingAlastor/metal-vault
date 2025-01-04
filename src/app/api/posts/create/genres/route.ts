import { auth } from "@/auth";
import { getGenres } from "@/lib/data/genres/genre-data-actions";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const genreTags = await getGenres();

    return Response.json(genreTags);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
