import { auth } from "@/auth";
import { getPostsByFilters } from "@/lib/data/posts/posts-data-actions";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 3;

    const session = await auth();
    const user = session?.user;
    console.log("user", user);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const filters = {}; 
    
    const posts = await getPostsByFilters(filters);

    return Response.json(posts);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
