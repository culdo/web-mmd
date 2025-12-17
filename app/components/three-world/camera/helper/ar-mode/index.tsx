import useWebRTC from "@/app/ar-camera/useWebrtc";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { closeSnackbar, enqueueSnackbar } from "notistack";

function ARCameraMode() {
    const dataChannel = useWebRTC();
    const camera = useThree(state => state.camera);

    useEffect(() => {
        enqueueSnackbar("Waiting for AR session...", { persist: true, key: "ar-webrtc-connect" });
        if (!dataChannel) return;

        closeSnackbar("ar-webrtc-connect");
        camera.matrixWorldAutoUpdate = false;
        window.history.pushState(null, "", "/");

        const handleMessage = (event: MessageEvent) => {
            camera.matrixWorld.fromArray(JSON.parse(event.data));
            camera.matrixWorld.elements[12] *= 100
            camera.matrixWorld.elements[13] *= 100
            camera.matrixWorld.elements[14] *= 100
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