import { auth } from "@/lib/auth/auth";
import { getGenres } from "@/lib/data/genres-data";
import { headers } from "next/headers";

export async function GET() {
  try {
    const { user } =
      (await auth.api.getSession({ headers: await headers() })) ?? {};

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
