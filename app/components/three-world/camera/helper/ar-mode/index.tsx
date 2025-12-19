import useWebRTC from "@/app/ar-camera/useWebrtc";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { useControls } from "leva";
import { buildGuiItem } from "@/app/utils/gui";

function ARCameraMode() {
    const dataChannel = useWebRTC();
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
    useEffect(() => {
        enqueueSnackbar("Waiting for AR session...", { persist: true, key: "ar-webrtc-connect" });
        if (!dataChannel) return () => closeSnackbar("ar-webrtc-connect");

        closeSnackbar("ar-webrtc-connect");
        camera.matrixWorldAutoUpdate = false;
        window.history.pushState(null, "", "./");

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