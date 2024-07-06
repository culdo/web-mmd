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
    cwHelper: MMDCameraWorkHelper,
    player: Player,
    gui: Gui,
    camera: PerspectiveCamera,
    runtimeCharacter: any,
    controls: OrbitControls
    character: SkinnedMesh,
    stage: SkinnedMesh,
    loadCharacter: Function,
    loadStage: Function,
    updateMorphFolder: Function,
    isMotionUpdating: MutableRefObject<boolean>
    beatsBufferRef: MutableRefObject<HTMLDivElement[]>
    isOrbitControl: MutableRefObject<boolean>
}

const useGlobalStore = create<GlobalState>(
    () => ({
        loader: new MMDLoader(),
        helper: new MMDAnimationHelper(),
        cwHelper: new MMDCameraWorkHelper(),
        player: null,
        gui: {},
        character: null,
        stage: null,
        runtimeCharacter: null,
        camera: null,
        controls: null,
        loadCharacter: null,
        loadStage: null,
        updateMorphFolder: null,
        isMotionUpdating: (() => {
            const ref: MutableRefObject<boolean> = createRef()
            ref.current = false
            return ref
        })(),
        beatsBufferRef: null,
        isOrbitControl: (() => {
            const ref: MutableRefObject<boolean> = createRef()
            ref.current = false
            return ref
        })()
    })
)

export default useGlobalStore;