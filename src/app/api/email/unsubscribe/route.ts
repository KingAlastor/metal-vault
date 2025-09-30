import { unsubscribeUser } from "@/lib/data/user-email-settings-data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const unsub_token = request.nextUrl.searchParams.get("token");

  if (!unsub_token) {
    return NextResponse.json(
      { error: "Missing ID" },
      { status: 400 }
    );
  }

  await unsubscribeUser(unsub_token);

  return new NextResponse("<h1>Unsubscribed!</h1>", {
    headers: { "Content-Type": "text/html" },
  });
}
