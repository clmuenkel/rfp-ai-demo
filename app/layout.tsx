import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ironflow AI — RFP Intelligence",
  description: "AI-powered bid/no-bid decisions and RFP response drafting for Ironflow Mechanical",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
