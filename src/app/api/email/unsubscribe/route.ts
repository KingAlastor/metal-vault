import { unsubscribeUser } from "@/lib/data/user-email-settings-data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("id");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing ID" },
      { status: 400 }
    );
  }

  await unsubscribeUser(userId);

  return new NextResponse("<h1>Unsubscribed!</h1>", {
    headers: { "Content-Type": "text/html" },
  });
}
