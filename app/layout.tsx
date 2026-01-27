import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 1. IMPORT THE PROVIDER
import { Providers } from "./providers"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reputation Dashboard",
  description: "Manage your reviews",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 2. WRAP THE CHILDREN IN PROVIDERS */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}