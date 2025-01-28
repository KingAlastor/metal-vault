import { auth } from "@/auth";
import { fetchUserFavBandsFullData } from "@/lib/data/user/followArtists/follow-artists-data-actions";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const favBands = await fetchUserFavBandsFullData();

    return Response.json(favBands);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}