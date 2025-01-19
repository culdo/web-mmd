import { LevaRootProps } from 'leva/dist/declarations/src/components/Leva/LevaRoot';
import { MutableRefObject, createRef } from 'react';
import { AnimationMixer, PerspectiveCamera, SkinnedMesh } from 'three';
import { OrbitControls } from 'three-stdlib';
import { create } from 'zustand';
import { MMDAnimationHelper } from '../modules/MMDAnimationHelper';
import { MMDLoader } from '../modules/MMDLoader';
import CustomVideoElement from 'youtube-video-element';
import { CCDIKSolver, GrantSolver, MMDPhysics } from 'three/examples/jsm/Addons.js';

export type Gui = LevaRootProps & { _timeoutID?: NodeJS.Timeout }
export type GlobalState = {
    loader: MMDLoader
    helper: MMDAnimationHelper,
    player: CustomVideoElement,
    gui: Gui,
    camera: PerspectiveCamera,
    runtimeCharacter: {
        mixer: AnimationMixer,
        ikSolver: CCDIKSolver,
        grantSolver: GrantSolver,
        physics: MMDPhysics,
        looped: boolean
    },
    controls: OrbitControls
    character: SkinnedMesh,
    stage: SkinnedMesh,
    playDeltaRef: MutableRefObject<number>
    isMotionUpdating: () => boolean,
    beatsBufferRef: MutableRefObject<HTMLDivElement[]>
    isOrbitControl: MutableRefObject<boolean>
    isTransformControl: MutableRefObject<boolean>
    bindParentCb: Function,
    presetReady: boolean,
    selectedName: string,
    enabledTransform: boolean,
    presetReadyPromise: Promise<void>
}

const useGlobalStore = create<GlobalState>(
    (set, get) => ({
        loader: new MMDLoader(),
        helper: new MMDAnimationHelper(),
        player: null,
        gui: {},
        character: null,
        stage: null,
        runtimeCharacter: null,
        camera: null,
        controls: null,
        playDeltaRef: (() => {
            const ref: MutableRefObject<number> = createRef()
            ref.current = 0.0
            return ref
        })(),
        isMotionUpdating: () => Math.abs(get().playDeltaRef.current) > 0,
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
        selectedName: null,
        enabledTransform: true,
        presetReadyPromise: new Promise(() => { }),
    })
)

export default useGlobalStore;