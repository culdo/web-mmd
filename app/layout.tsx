"use client"
import AmmoLib from 'ammojs-typed';
import { useEffect } from "react";
import "./globals.css";

declare global {
  const Ammo: typeof AmmoLib;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => { AmmoLib() }, [])
  return (
    <html lang="en">
      <head>
        <title>Web MMD</title>
        <link rel="icon" href="/icon.png" sizes="any" />
        <meta name="description" content="Play MMD everywhere" />
      </head>
      <body>{children}</body>
    </html>
  );
}
