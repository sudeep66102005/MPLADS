import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MPLADS | AI Monitoring & Audit Intelligence",
  description:
    "An explainable AI decision-support layer on top of eSAKSHI / MPLADS — smarter oversight, greater impact."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-slate-900">{children}</body>
    </html>
  );
}
