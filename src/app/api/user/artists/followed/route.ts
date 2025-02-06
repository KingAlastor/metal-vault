import { auth } from "@/lib/auth/auth";
import { fetchUserFavBandsFullData } from "@/lib/data/user/followArtists/follow-artists-data-actions";
import { headers } from "next/headers";

export async function GET() {
  try {
    const { user } =
      (await auth.api.getSession({ headers: await headers() })) ?? {};

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
