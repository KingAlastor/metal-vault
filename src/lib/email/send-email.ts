"use server";

import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import nodemailer from "nodemailer";
import type { TransportOptions } from "nodemailer";
import { getUnsubscribeTokenForUser } from "../data/user-email-settings-data";

export async function sendMail(
  userId: string,
  to: string,
  subject: string,
  text: string,
  html: string
) {
  if (
    !process.env.AWS_REGION ||
    !process.env.AWS_ACCESS_KEY ||
    !process.env.AWS_ACCESS_SECRET ||
    !process.env.AWS_SENDER_EMAIL
  ) {
    console.error("Missing required AWS SES environment variables");
    console.error("AWS SES configuration check:");
    console.error("- Region:", process.env.AWS_REGION);
    console.error(
      "- Access Key:",
      process.env.AWS_ACCESS_KEY ? "Set" : "Missing"
    );
    console.error(
      "- Secret Key:",
      process.env.AWS_ACCESS_SECRET ? "Set" : "Missing"
    );
    console.error("- Sender Email:", process.env.AWS_SENDER_EMAIL);
    return { success: false, error: "Missing AWS SES configuration" };
  }

  const unsubToken = await getUnsubscribeTokenForUser(userId);

  const sesClient = new SESv2Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_ACCESS_SECRET!,
    },
  });

  const transporter = nodemailer.createTransport({
    SES: { sesClient, SendEmailCommand },
  } as TransportOptions);

  try {
    const info = await transporter.sendMail({
      from: `"Metal Vault" <${process.env.AWS_SENDER_EMAIL}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
      headers: {
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "List-Unsubscribe": `<https://www.metal-vault.com/api/email/unsubscribe?token=${unsubToken}>, <mailto:kingalastor@metal-vault.com?subject=unsubscribe:${to}>`,
      },
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
}
