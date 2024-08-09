import { LevaRootProps } from 'leva/dist/declarations/src/components/Leva/LevaRoot';
import { MutableRefObject, createRef } from 'react';
import { PerspectiveCamera, SkinnedMesh } from 'three';
import { OrbitControls } from 'three-stdlib';
import Player from 'video.js/dist/types/player';
import { create } from 'zustand';
import { MMDAnimationHelper } from '../modules/MMDAnimationHelper';
import { MMDLoader } from '../modules/MMDLoader';

export const CameraMode = {
    MOTION_FILE: 0,
    COMPOSITION: 1,
    FIXED_FOLLOW: 2
}

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
    stagePromise: Promise<SkinnedMesh>,
    isMotionUpdating: MutableRefObject<boolean>
    beatsBufferRef: MutableRefObject<HTMLDivElement[]>
    isOrbitControl: MutableRefObject<boolean>
    isTransformControl: MutableRefObject<boolean>
    bindParentCb: Function,
    presetReady: boolean,
    presetInit: boolean,
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
        stagePromise: new Promise(() => { }),
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
        isTransformControl: (() => {
            const ref: MutableRefObject<boolean> = createRef()
            ref.current = false
            return ref
        })(),
        bindParentCb: null,
        presetReady: false,
        presetInit: false,
        selectedName: null,
        enabledTransform: true
    })
)

export default useGlobalStore;