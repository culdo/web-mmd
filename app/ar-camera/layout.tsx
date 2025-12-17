"use client"

import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import React from "react";
import type { PropsWithChildren } from "react";

const store = createXRStore({ meshDetection: false, handTracking: false, bounded: false, emulate: false, controller: false });

export default function ARCameraLayout({ children }: PropsWithChildren) {
    
    return (
        <>
            <button onClick={() => store.enterAR()}>Enter AR</button>
            <Canvas>
                <XR store={store}>
                    {children}
                </XR>
            </Canvas>
        </>
    );
}