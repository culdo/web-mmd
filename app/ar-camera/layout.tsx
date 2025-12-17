"use client"

import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import React from "react";
import type { PropsWithChildren } from "react";
import styles from './styles.module.css';

const store = createXRStore({ meshDetection: false, handTracking: false, bounded: false, emulate: false });

export default function ARCameraLayout({ children }: PropsWithChildren) {
    
    return (
        <>
            <div id="chatlog" className={styles.chatlog}></div>
            <input id="chatinput" type="text" placeholder="type here" />
            <button id="chatbutton">send</button>
            <p>
                <button id="resetbutton">reset</button>
            </p>
            <button onClick={() => store.enterAR()}>Enter AR</button>
            <Canvas>
                <XR store={store}>
                    {children}
                </XR>
            </Canvas>
        </>
    );
}