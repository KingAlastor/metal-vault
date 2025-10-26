import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "./ReactQueryProvider";
import ThemeWrapper from "./ThemeProvider";
import GoogleProvider from "./GoogleProvider";
import { SessionProvider } from "./SessionProvider";
import { getSession } from "@/lib/session/server-actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Metal Vault",
  description: "Get latest album release updates",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  const userSessionData = session
    ? {
        userId: session.userId ?? null,
        userShard: session.userShard ?? null,
      }
    : null;

  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleProvider>
          <ReactQueryProvider>
            <SessionProvider initialSession={userSessionData}>
              <ThemeWrapper>{children}</ThemeWrapper>
            </SessionProvider>
          </ReactQueryProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
