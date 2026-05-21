import { LevaRootProps } from 'leva/dist/declarations/src/components/Leva/LevaRoot';
import { RefObject, createRef } from 'react';
import { AnimationMixer, Euler, PerspectiveCamera, SkinnedMesh, Vector3 } from 'three';
import { GrantSolver, MMDPhysics } from 'three-stdlib';
import { create } from 'zustand';
import { MMDLoader } from '../modules/MMDLoader';
import { CCDIKSolver } from 'three/examples/jsm/Addons.js';
import { ISheetObject } from '@theatre/core';
import { CameraObj } from '../types/camera';
import { IStudio } from '@theatre/studio';

export type Gui = LevaRootProps & { _timeoutID?: NodeJS.Timeout }
export type GlobalState = {
    loader: MMDLoader,
    player: HTMLVideoElement,
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
    playAbsDeltaRef: RefObject<number>
    beatsBufferRef: RefObject<HTMLDivElement[]>
    isOrbitControlRef: RefObject<boolean>
    isTransformControlRef: RefObject<boolean>
    bindParentCb: Function,
    storeReady: boolean,
    presetReady: boolean,
    configReady: boolean,
    selectedName: string,
    enabledTransform: boolean,
    theatreStudio: IStudio,
    creditsPose: {
        position: Vector3,
        rotation: Euler
    },
    cameraOffset: {
        center: Vector3,
        // target relative to center
        target: Vector3,
        // position relative to center
        position: Vector3,
        up: Vector3,
        dampingFactor: number
    },
    showGameMenu: boolean,
    // MultiPlayer
    onOfferingRef: RefObject<Record<string, (data: ConnectionInfo) => void>>;
    onAnsweringRef: RefObject<(data: ConnectionInfo) => void>;
    peerChannels: Record<string, PeerChannel>;
    groupChannels: Record<string, GroupChannel>;
    onInitRef: RefObject<(code: string, peerId: string) => void>;
    qrCodeUrl: string;
    remoteModels: Record<string, {
        fileName: string,
        motionNames: string[],
        enableMorph: boolean,
        enablePhysics: boolean,
        enableMaterial: boolean
    }>
    modelsObject: Record<string, React.ReactNode>
    getScreenShot: (width: number, height: number) => string
    openMainUI: boolean
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
        playAbsDeltaRef: (() => {
            const ref: RefObject<number> = createRef()
            ref.current = 0.0
            return ref
        })(),
        beatsBufferRef: (() => {
            const ref: RefObject<HTMLDivElement[]> = createRef()
            ref.current = []
            return ref
        })(),
        isOrbitControlRef: (() => {
            const ref: RefObject<boolean> = createRef()
            ref.current = false
            return ref
        })(),
        isTransformControlRef: (() => {
            const ref: RefObject<boolean> = createRef()
            ref.current = false
            return ref
        })(),
        bindParentCb: null,
        storeReady: false,
        presetReady: false,
        configReady: false,
        selectedName: null,
        enabledTransform: true,
        theatreStudio: null,
        creditsPose: null,
        cameraOffset: {
            position: new Vector3(0, 10, 50),
            up: new Vector3(0, 1, 0),
            target: new Vector3(),
            center: new Vector3(),
            dampingFactor: 5
        },
        showGameMenu: true,
        onOfferingRef: (() => {
            const ref: RefObject<{}> = createRef()
            ref.current = {}
            return ref
        })(),
        onAnsweringRef: createRef(),
        peerChannels: {},
        onInitRef: createRef(),
        qrCodeUrl: null,
        groupChannels: {},
        remoteModels: {},
        modelsObject: {},
        getScreenShot: null,
        openMainUI: false
    })
)

export default useGlobalStore;