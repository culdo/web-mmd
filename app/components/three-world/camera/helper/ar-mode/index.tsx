import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { useControls } from "leva";
import { buildGuiItem } from "@/app/utils/gui";
import useChannel from "@/app/components/multiplayer/room/useChannel";
import { nanoid } from "nanoid";
import useConfigStore from "@/app/stores/useConfigStore";
import useGlobalStore from "@/app/stores/useGlobalStore";

function ARCameraMode() {
    const camera = useThree(state => state.camera);
    const scaleRef = useRef<number>()
    useControls("AR Camera", {
        scale: {
            ...buildGuiItem("ar camera scale"),
            min: 100,
            max: 1000,
            onChange: (value) => {
                scaleRef.current = value
            }
        }
    })
    const uid = useConfigStore(state => state.uid)
    const [initCode, _] = useState(nanoid(10))
    const dataChannel = useChannel("ARCamera", 1, initCode)

    useEffect(() => {
        if (!dataChannel) {
            enqueueSnackbar("Waiting for AR session...", { persist: true, key: "ar-webrtc-connect" });
            const qrCodeUrl = new URL(window.location.origin)
            qrCodeUrl.pathname = "/ar-camera.html"
            qrCodeUrl.searchParams.append("initUid", uid)
            qrCodeUrl.searchParams.append("initCode", initCode)
            useGlobalStore.setState({ qrCodeUrl: qrCodeUrl.href })
            return () => {
                useGlobalStore.setState({ qrCodeUrl: null })
                closeSnackbar("ar-webrtc-connect")
            };
        }

        camera.matrixWorldAutoUpdate = false;

        const handleMessage = (event: MessageEvent) => {
            camera.matrixWorld.fromArray(JSON.parse(event.data));
            camera.matrixWorld.elements[12] *= scaleRef.current
            camera.matrixWorld.elements[13] *= scaleRef.current
            camera.matrixWorld.elements[14] *= scaleRef.current
        };

        dataChannel?.addEventListener('message', handleMessage);
        return () => {
            dataChannel?.removeEventListener('message', handleMessage);
            camera.matrixWorldAutoUpdate = true;
        };
    }, [dataChannel]);
    return (
        <></>
    );
}

export default ARCameraMode;