import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "MPLADS Field Inspections",
  manifest: (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/field.webmanifest",
  icons: {apple: (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/field-192.png"},
  appleWebApp: { capable: true, title: "MPLADS Field", statusBarStyle: "default" },
};
export default function FieldLayout({ children }: {children: React.ReactNode}) { return children; }
