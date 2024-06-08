import { CameraMode } from '@/app/modules/MMDCameraWorkHelper';
import useGlobalStore from '@/app/stores/useGlobalStore';
import usePresetStore from '@/app/stores/usePresetStore';
import { useControls } from 'leva';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import Camera from './camera';
import Character from './character';
import Controls from './controls';
import useRenderLoop from './renderLoop/useRenderLoop';
import Stage from './stage';

declare global {
    interface Window { Ammo: Function; }
}

function ThreeWorld() {
    const fogColor = usePresetStore(state => state["fog color"])
    const fogDensity = usePresetStore(state => state["fog density"])

    const getCameraMode = () => usePresetStore.getState()['camera mode']
    const setCameraMode = (val: number) => usePresetStore.setState({"camera mode": val})
    
    const player = useGlobalStore(useShallow(state => state.player))
    const cwHelper = useGlobalStore(state => state.cwHelper)

    const [, set] = useControls(() => ({
        'camera mode': {
            value: getCameraMode(),
            options: {
                "Motion File": CameraMode.MOTION_FILE,
                "Composition": CameraMode.COMPOSITION,
                "Fixed Follow": CameraMode.FIXED_FOLLOW
            },
            onChange: (motionType, _, options) => {
                if(!options.initial) {
                    setCameraMode(motionType)
                }
            },
            order: 0,
        },
    }))

    useEffect(() => {
        if (!player || !cwHelper) return
        // keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.key == " ") {
                if (player.paused()) {
                    player.play()
                } else {
                    player.pause()
                }
            } else if (e.key == "`") {
                const isEditMode = getCameraMode() != CameraMode.MOTION_FILE
                let targetMode;
                if (isEditMode) {
                    targetMode = CameraMode.MOTION_FILE
                } else {
                    targetMode = CameraMode.COMPOSITION
                }
                set({ "camera mode": targetMode })
                
                cwHelper.checkCameraMode()
            }
        })
    }, [player, cwHelper])

    useRenderLoop()
    return (
        <>
            <fogExp2 attach="fog" color={fogColor} density={fogDensity}></fogExp2>
            <ambientLight intensity={Math.PI / 2} />
            <directionalLight position={[-10, -10, -10]} intensity={Math.PI} />
            <Character></Character>
            <Stage></Stage>
            <Camera></Camera>
            <Controls></Controls>
        </>
    )
}

export default ThreeWorld
