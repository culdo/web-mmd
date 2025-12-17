import useWebRTC from "@/app/ar-camera/useWebrtc";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

function ARCameraMode() {
    const dataChannel = useWebRTC();
    const camera = useThree(state => state.camera);
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            console.log("Received message via data channel:", event.data);
            camera.matrix.elements = JSON.parse(event.data);
        };

        dataChannel?.addEventListener('message', handleMessage);

        return () => {
            dataChannel?.removeEventListener('message', handleMessage);
        };
    }, [dataChannel]);
    return (
        <></>
    );
}

export default ARCameraMode;