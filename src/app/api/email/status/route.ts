import { updateEmailAddressStatus } from "@/lib/data/user-email-settings-data";
import { fetchEnvironmentVariables } from "@/lib/general/env-variables";

export async function POST(req: Request) {
  const header = req.headers.get("authorization");
  const token = header?.replace("Bearer", "").trim();
  const bearerToken = await fetchEnvironmentVariables("BEARER_TOKEN");

  if (!token || token != bearerToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  if (body.email && body.status) {
    const result = await updateEmailAddressStatus(
      body.email,
      body.status.toUpperCase()
    );
    return Response.json({ status: result.status, message: result.message });
  } else {
    return Response.json({
      status: false,
      message: `Missing body email or status. Email: ${body.email}, Status: ${body.status}`,
    });
  }
}
