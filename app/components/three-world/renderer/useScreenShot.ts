import useGlobalStore from "@/app/stores/useGlobalStore";
import { useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";

function useScreenShot() {
    const screenShotArgs = useGlobalStore(state => state.screenShotArgs)
    const [width, height] = screenShotArgs;
    const target = useMemo(() => {
        const target = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter
        })
        return target;
    }, [])

    useLayoutEffect(() => {
        target.setSize(width, height)
    }, [target, width, height])

    useEffect(() => {
        return () => target.dispose()
    }, [])

    const scene = useThree(state => state.scene);
    const camera = useThree(state => state.camera);
    const gl = useThree(state => state.gl);

    useEffect(() => {
        const getScreenShot = () => {
            gl.setRenderTarget(target);
            gl.clear();
            gl.render(scene, camera);
            gl.setRenderTarget(null);

            const imageData = new ImageData(width, height);
            gl.readRenderTargetPixels(target, 0, 0, width, height, imageData.data);

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
        useGlobalStore.setState({ getScreenShot })
    }, [screenShotArgs, scene, camera, gl])
}

export default useScreenShot;