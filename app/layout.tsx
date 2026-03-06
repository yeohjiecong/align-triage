import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ALIGN ICU Triage Tool",
  description: "ICU triage support tool based on the ALIGN workflow",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ALIGN Triage",
  },
};

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