"use server";

import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import nodemailer from 'nodemailer';

export async function sendMail(to: string, subject: string, text: string, html: string) {
  const sesClient = new SESClient({ 
    region: process.env.AWS_SES_REGION,
    credentials: {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SES_ACCESS_SECRET!
    }
  });

  const transporter = nodemailer.createTransport({
    SES: { ses: sesClient, aws: { SendRawEmailCommand } }
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
