import { LevaRootProps } from 'leva/dist/declarations/src/components/Leva/LevaRoot';
import { MutableRefObject, createRef } from 'react';
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
    playDeltaRef: MutableRefObject<number>
    isMotionUpdating: () => boolean,
    beatsBufferRef: MutableRefObject<HTMLDivElement[]>
    isOrbitControlRef: MutableRefObject<boolean>
    isTransformControlRef: MutableRefObject<boolean>
    bindParentCb: Function,
    presetReady: boolean,
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
    peers: Record<string, JSX.Element>;
    onOfferingRef: MutableRefObject<(data: any) => void>;
    onAnsweringRef: MutableRefObject<(data: any) => void>;
    peerChannels: Record<string, {
        connection: RTCPeerConnection,
        channels: Record<string, RTCDataChannel>
    }>;
    onInitRef: MutableRefObject<(data: any, peer: RTCPeerConnection) => void>;
    qrCodeUrl: string;
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
        peers: {},
        onOfferingRef: createRef(),
        onAnsweringRef: createRef(),
        peerChannels: {},
        onInitRef: createRef(),
        qrCodeUrl: null
    })
)

export default useGlobalStore;