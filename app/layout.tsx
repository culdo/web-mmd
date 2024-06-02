"use client"
import "./globals.css";
import Script from "next/script";
import LoadingOverlay from "./components/loading-overlay";
import { useState } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const init = () => window.Ammo()
  return (
    <html lang="en">
      <head>
        <title>Web MMD</title>
        <link rel="icon" href="/icon.png" sizes="any" />
        <meta name="description" content="Play MMD everywhere" />
      </head>
      <body>{children}</body>
      <Script src="./ammo.wasm.js" onLoad={init}></Script>
    </html>
  );
}
