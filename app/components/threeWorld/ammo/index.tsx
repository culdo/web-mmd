import Script from "next/script";
import { useEffect } from "react";

function Ammo() {
    useEffect(() => {
        window.Ammo();
    }, [window.Ammo])
    return (
        <Script strategy="beforeInteractive" src="./ammo.wasm.js"></Script>
    );
}

export default Ammo;