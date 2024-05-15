import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerficationEmail = async (email: string, token: string) => {
  console.log("api key", process.env.RESEND_API_KEY)
  const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`;

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Please verify your email",
      text: `Please click the link below to verify your email: ${confirmLink}`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:3000/auth/new-password?token=${token}`;

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Reset your password",
      text: `Click ${resetLink} to reset your password`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
