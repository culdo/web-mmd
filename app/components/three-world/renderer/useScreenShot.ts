import useConfigStore from "@/app/stores/useConfigStore";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

function useScreenShot() {
    const scene = useThree(state => state.scene);
    const camera = useThree(state => state.camera);
    const gl = useThree(state => state.gl);

    const getScreenShot = useMemo(() => {
        const getScreenShot = (width: number, height: number) => {
            const target = new THREE.WebGLRenderTarget(width, height, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter
            })
            gl.setRenderTarget(target);
            gl.clear();
            gl.render(scene, camera);
            gl.setRenderTarget(null);

            const imageData = new ImageData(width, height);
            gl.readRenderTargetPixels(target, 0, 0, width, height, imageData.data);
            target.dispose();

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.putImageData(imageData, 0, 0);

            ctx.scale(1, -1);
            ctx.translate(0, -height);
            ctx.drawImage(canvas, 0, 0, width, height);
            return canvas.toDataURL('image/jpeg', 0.5);
        }
        return getScreenShot
    }, [scene, camera, gl])

    const preset = useConfigStore(state => state.preset)
    
    useEffect(() => {
        setTimeout(() => {
            const screenShot = getScreenShot(200, 100)
            useConfigStore.setState(({ presetsInfo }) => ({
                presetsInfo: {
                    ...presetsInfo,
                    [preset]: {
                        screenShot
                    }
                }
            }))
        }, 3000);
    }, [getScreenShot, preset])

}

export default useScreenShot;