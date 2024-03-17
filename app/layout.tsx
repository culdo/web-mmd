import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web MMD",
  description: "Play MMD everywhere",
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
