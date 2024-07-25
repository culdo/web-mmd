import { LevaRootProps } from 'leva/dist/declarations/src/components/Leva/LevaRoot';
import { MutableRefObject, createRef } from 'react';
import { PerspectiveCamera, SkinnedMesh } from 'three';
import { OrbitControls } from 'three-stdlib';
import Player from 'video.js/dist/types/player';
import { create } from 'zustand';
import { MMDAnimationHelper } from '../modules/MMDAnimationHelper';
import { MMDCameraWorkHelper } from '../modules/MMDCameraWorkHelper';
import { MMDLoader } from '../modules/MMDLoader';

export type Gui = LevaRootProps & { _timeoutID?: NodeJS.Timeout }
export type GlobalState = {
    loader: MMDLoader
    helper: MMDAnimationHelper,
    player: Player,
    gui: Gui,
    camera: PerspectiveCamera,
    runtimeCharacter: any,
    controls: OrbitControls
    character: SkinnedMesh,
    characterPromise: Promise<SkinnedMesh>,
    stage: SkinnedMesh,
    isMotionUpdating: MutableRefObject<boolean>
    beatsBufferRef: MutableRefObject<HTMLDivElement[]>
    isOrbitControl: MutableRefObject<boolean>
    presetReady: boolean,
    selectedName: string,
    enabledTransform: boolean
}

const useGlobalStore = create<GlobalState>(
    () => ({
        loader: new MMDLoader(),
        helper: new MMDAnimationHelper(),
        player: null,
        gui: {},
        character: null,
        characterPromise: new Promise(() => { }),
        stage: null,
        runtimeCharacter: null,
        camera: null,
        controls: null,
        isMotionUpdating: (() => {
            const ref: MutableRefObject<boolean> = createRef()
            ref.current = false
            return ref
        })(),
        beatsBufferRef: (() => {
            const ref: MutableRefObject<HTMLDivElement[]> = createRef()
            ref.current = []
            return ref
        })(),
        isOrbitControl: (() => {
            const ref: MutableRefObject<boolean> = createRef()
            ref.current = false
            return ref
        })(),
        presetReady: false,
        selectedName: null,
        enabledTransform: true
    })
)

export default useGlobalStore;