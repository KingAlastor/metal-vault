import { updateEmailAddressStatus } from "@/lib/data/user-email-settings-data";
import { fetchEnvironmentVariables } from "@/lib/general/env-variables";

export async function POST(req: Request) {
  const header = req.headers.get("authorization");
  const token = header?.split("Bearer")[1];
  const bearerToken = await fetchEnvironmentVariables("BEARER_TOKEN");
  console.log(
    "Incoming Lambda function token: ",
    token,
    " Local token: ",
    bearerToken
  );
  if (!token || token != bearerToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  console.log("body: ", body);
  if (body.email && body.status) {
    await updateEmailAddressStatus(body.email, body.status.toUpperCase());
  }

  return Response.json({ status: true });
}
