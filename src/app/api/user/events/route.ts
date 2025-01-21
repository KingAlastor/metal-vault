import { auth } from "@/auth";
import { getUserOwnedEvents } from "@/lib/data/events/events-data-actions";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await getUserOwnedEvents();

    return Response.json(events);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
