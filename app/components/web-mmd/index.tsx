import useConfig from '../default-config/useConfig';
import Camera from './camera/Camera';
import Character from './character';
import Controls from './controls';
import useRenderLoop from './renderLoop/useRenderLoop';
import Stage from './stage';
import useGlobalStore from '@/app/stores/useGlobalStore';
import useHelpers from './helpers/useHelpers';
import { Leva, useControls } from 'leva';
import { useEffect } from 'react';
import { CameraMode } from '@/app/modules/MMDCameraWorkHelper';
import usePreset from './preset/usePreset';

declare global {
    interface Window { Ammo: Function; }
}

function WebMMD() {
    useConfig()
    useHelpers()
    usePreset()
    const { api, player, cwHelper } = useGlobalStore()

    const [, set] = useControls(() => ({
        'camera mode': {
            value: CameraMode.MOTION_FILE,
            options: {
                "Motion File": CameraMode.MOTION_FILE,
                "Composition": CameraMode.COMPOSITION,
                "Fixed Follow": CameraMode.FIXED_FOLLOW
            },
            onChange: (motionType) => {
                const { api } = useGlobalStore.getState()
                if (!api) return
                api["camera mode"] = motionType
            },
        },
    }))

    useEffect(() => {
        if (!api || !player || !cwHelper) return
        // keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.key == " ") {
                if (player.paused()) {
                    player.play()
                } else {
                    player.pause()
                }
            } else if (e.key == "`") {
                const isEditMode = api["camera mode"] != CameraMode.MOTION_FILE
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
    }, [api, player, cwHelper])

    useRenderLoop()
    if (!api) return
    return (
        <>
            <fogExp2 attach="fog" color={api["fog color"]} density={api["fog density"]}></fogExp2>
            <ambientLight intensity={Math.PI / 2} />
            <directionalLight position={[-10, -10, -10]} intensity={Math.PI} />
            <Character></Character>
            <Stage></Stage>
            <Camera></Camera>
            <Controls></Controls>
        </>
    )
}

export default WebMMD
