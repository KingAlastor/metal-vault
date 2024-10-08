import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/home/NavBar";
import LeftSidebar from "@/components/home/LeftSidebar";
import RightSidebar from "@/components/home/RightSidebar";
import Bottombar from "@/components/home/Bottombar";
import { SessionProvider } from "next-auth/react";
import getSession from "@/lib/auth/getSession";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Metal Vault",
  description: "Get latest album release updates",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavBar />
            <main className="flex flex-row">
              <LeftSidebar />
              <section className="main-container">
                <div className="w-full max-w-4xl"> {children}</div>
              </section>
              <RightSidebar />
            </main>
            <Bottombar />
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
