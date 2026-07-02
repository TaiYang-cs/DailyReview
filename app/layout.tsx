import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DailyReview",
  description: "A collaborative daily review and task tracking system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
