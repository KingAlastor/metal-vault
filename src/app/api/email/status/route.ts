import { updateEmailAddressStatus } from "@/lib/data/user-email-settings-data";

export async function POST(req: Request) {
  const header = req.headers.get("authorization");
  const token = header?.split("Bearer")[1];
  const bearerToken = process.env.BEARER_TOKEN;

  if (!token || token != bearerToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  if (body.email && body.status) {
    await updateEmailAddressStatus(body.email, body.status);
  }

  return Response.json({status: true})
}
