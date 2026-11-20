import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SentinelOps — Observe Locally. Understand Globally.",
  description: "Privacy-First, AI-Powered, Two-Tier Observability Platform.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0e1a] text-gray-100 min-h-screen antialiased selection:bg-[#00d2ff]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
