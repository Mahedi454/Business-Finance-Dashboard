import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business Finance Dashboard",
  description: "Business finance management dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
