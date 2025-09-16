import { LevaRootProps } from 'leva/dist/declarations/src/components/Leva/LevaRoot';
import { MutableRefObject, createRef } from 'react';
import { AnimationMixer, PerspectiveCamera, SkinnedMesh } from 'three';
import { GrantSolver, MMDPhysics, OrbitControls } from 'three-stdlib';
import { create } from 'zustand';
import { MMDLoader } from '../modules/MMDLoader';
import CustomVideoElement from 'youtube-video-element';
import { CCDIKSolver } from 'three/examples/jsm/Addons.js';
import { ISheetObject } from '@theatre/core';
import { CameraObj } from '../types/camera';
import { IStudio } from '@theatre/studio';

export type Gui = LevaRootProps & { _timeoutID?: NodeJS.Timeout }
export type GlobalState = {
    loader: MMDLoader,
    player: CustomVideoElement,
    gui: Gui,
    camera: PerspectiveCamera,
    cameraObj: ISheetObject<CameraObj>,
    runtimeCharacter: {
        mixer: AnimationMixer,
        ikSolver: CCDIKSolver,
        grantSolver: GrantSolver,
        physics: MMDPhysics,
        looped: boolean
    },
    models: Record<string, SkinnedMesh>,
    playDeltaRef: MutableRefObject<number>
    isMotionUpdating: () => boolean,
    beatsBufferRef: MutableRefObject<HTMLDivElement[]>
    isOrbitControlRef: MutableRefObject<boolean>
    isTransformControlRef: MutableRefObject<boolean>
    bindParentCb: Function,
    presetReady: boolean,
    selectedName: string,
    enabledTransform: boolean,
    presetReadyPromise: Promise<void>
    theatreStudio: IStudio,
    creditsPose: {
        position: [number, number, number],
        rotation: [number, number, number]
    },
    showGameMenu: boolean
}

const useGlobalStore = create<GlobalState>(
    (set, get) => ({
        loader: new MMDLoader(),
        player: null,
        gui: {},
        models: {},
        runtimeCharacter: null,
        camera: null,
        cameraObj: null,
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
        isOrbitControlRef: (() => {
            const ref: MutableRefObject<boolean> = createRef()
            ref.current = false
            return ref
        })(),
        isTransformControlRef: (() => {
            const ref: MutableRefObject<boolean> = createRef()
            ref.current = false
            return ref
        })(),
        bindParentCb: null,
        presetReady: false,
        selectedName: null,
        enabledTransform: true,
        presetReadyPromise: new Promise(() => { }),
        theatreStudio: null,
        creditsPose: null,
        showGameMenu: true
    })
)

export default useGlobalStore;