"use client"

import WebMMD from "@/app/modules/WebMMD";
import Script from "next/script";
import { useEffect } from "react";

function WebMMDComp() {
    useEffect(() => {
        const app = new WebMMD()
        app.start()
    }, [])
    return (
        <Script strategy="beforeInteractive" src="./ammo.wasm.js"></Script>
    );
}

export default WebMMDComp;