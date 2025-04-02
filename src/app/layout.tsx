import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "./ReactQueryProvider";
import ThemeWrapper from "./ThemeProvider";

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <ReactQueryProvider>
              <ThemeWrapper>{children}</ThemeWrapper>
            </ReactQueryProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
