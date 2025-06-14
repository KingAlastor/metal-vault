"use server";

// Load environment variables using @next/env for consistent loading
// Only load if not already in Next.js runtime
if (typeof window === "undefined" && !process.env.NEXT_RUNTIME) {
  const { loadEnvConfig } = require("@next/env");
  loadEnvConfig(process.cwd());
}

import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import nodemailer from "nodemailer";

export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html: string
) {
  if (
    !process.env.AWS_SES_REGION ||
    !process.env.AWS_SES_ACCESS_KEY ||
    !process.env.AWS_SES_ACCESS_SECRET ||
    !process.env.AWS_SES_SENDER_EMAIL
  ) {
    console.error("Missing required AWS SES environment variables");
    console.error("AWS SES configuration check:");
    console.error("- Region:", process.env.AWS_SES_REGION);
    console.error(
      "- Access Key:",
      process.env.AWS_SES_ACCESS_KEY ? "Set" : "Missing"
    );
    console.error(
      "- Secret Key:",
      process.env.AWS_SES_ACCESS_SECRET ? "Set" : "Missing"
    );
    console.error("- Sender Email:", process.env.AWS_SES_SENDER_EMAIL);
    return { success: false, error: "Missing AWS SES configuration" };
  }

  const sesClient = new SESClient({
    region: process.env.AWS_SES_REGION,
    credentials: {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SES_ACCESS_SECRET!,
    },
  });

  const transporter = nodemailer.createTransport({
    SES: { ses: sesClient, aws: { SendRawEmailCommand } },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.AWS_SES_SENDER_EMAIL,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
}
