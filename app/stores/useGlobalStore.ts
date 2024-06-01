import { Camera, SkinnedMesh } from 'three';
import { OrbitControls } from 'three-stdlib';
import Player from 'video.js/dist/types/player';
import { create } from 'zustand';
import { MMDAnimationHelper } from '../modules/MMDAnimationHelper';
import { MMDCameraWorkHelper } from '../modules/MMDCameraWorkHelper';
import { MMDGui } from '../modules/gui';
import { MMDLoader } from '../modules/MMDLoader';
import { LevaRootProps } from 'leva/dist/declarations/src/components/Leva/LevaRoot';

export type GlobalState = {
    loader: MMDLoader
    helper: MMDAnimationHelper,
    cwHelper: MMDCameraWorkHelper,
    player: Player,
    gui: LevaRootProps,
    camera: Camera,
    runtimeCharacter: any,
    controls: OrbitControls
    character: SkinnedMesh,
    stage: SkinnedMesh,
    loadCamera: Function,
    loadCharacter: Function,
    updateMorphFolder: Function,
    changeToUntitled: Function
}

const useGlobalStore = create<GlobalState>(
    () => ({
        loader: new MMDLoader(),
        helper: null,
        cwHelper: null,
        player: null,
        gui: {},
        character: null,
        stage: null,
        runtimeCharacter: null,
        camera: null,
        controls: null,
        loadCamera: null,
        loadCharacter: null,
        updateMorphFolder: null,
        changeToUntitled: null
    })
)

export default useGlobalStore;