import type { Metadata } from "next";
import "./globals.css";

// Metadata is optional but good practice
export const metadata: Metadata = {
  title: "Reputation Manager",
  description: "Manage your business reputation",
};

// FIX: Added type definition for 'children'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}