import { saveAnalyticsSession } from "@/lib/data/analytics-data";
import { z } from "zod";

const AnalyticsEventSchema = z.object({
  path: z.string().max(200),
  event: z.string().max(50),
  ts: z.number().positive(),
  data: z.record(z.any()).optional(),
});

const AnalyticsSchema = z.object({
  sessionId: z.string().uuid(),
  isUser: z.boolean().optional().default(false),
  startedAt: z.number().positive(),
  endedAt: z.number().positive(),
  clickedSignin: z.boolean().optional().default(false),
  reason: z.string().optional(),
  events: z.array(AnalyticsEventSchema),
});

export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin") || "";
    const isProd = process.env.NODE_ENV === "production";

    // ✅ Origin safety check
    if (isProd) {
      if (!origin.includes("metal-vault.com")) {
        return new Response("Forbidden", { status: 403 });
      }
    } else if (!origin.includes("localhost")) {
      console.warn("Analytics flush called from unexpected origin:", origin);
    }

    // ✅ Safely read raw text body
    const raw = await req.text();

    if (!raw) {
      console.warn("Received empty analytics payload");
      return Response.json({ success: false, error: "Empty body" }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(raw);
    } catch (err) {
      console.warn("Malformed analytics payload:", raw);
      return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    // ✅ Validate with Zod
    const data = AnalyticsSchema.parse(body);

    // ✅ Persist
    await saveAnalyticsSession(data);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Analytics flush error:", error);

    if (error instanceof z.ZodError) {
      return Response.json({ success: false, error: error.flatten() }, { status: 400 });
    }

    return Response.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
