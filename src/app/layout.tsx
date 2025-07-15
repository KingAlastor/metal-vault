import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "./ReactQueryProvider";
import ThemeWrapper from "./ThemeProvider";
import GoogleProvider from "./GoogleProvider";

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleProvider>
          <ReactQueryProvider>
            <ThemeWrapper>{children}</ThemeWrapper>
          </ReactQueryProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
