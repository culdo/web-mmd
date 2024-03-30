import WebMMD from "@/app/modules/WebMMD";
import localforage from "localforage";
import Script from "next/script";
import { useEffect } from "react";

function WebMMDLegacy() {
    useEffect(() => {
        // localforage.clear()
        const app = new WebMMD()
        app.start()
    }, [])
    return (
        <Script strategy="beforeInteractive" src="./ammo.wasm.js"></Script>
    );
}

export default WebMMDLegacy;