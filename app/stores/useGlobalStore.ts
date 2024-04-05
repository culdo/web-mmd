import { Camera, SkinnedMesh } from 'three';
import { OrbitControls } from 'three-stdlib';
import Player from 'video.js/dist/types/player';
import { create } from 'zustand';
import { MMDAnimationHelper } from '../modules/MMDAnimationHelper';
import { MMDCameraWorkHelper } from '../modules/MMDCameraWorkHelper';
import { MMDGui } from '../modules/gui';
import { MMDLoader } from '../modules/MMDLoader';

export type GlobalState = {
    loader: MMDLoader
    helper: MMDAnimationHelper,
    cwHelper: MMDCameraWorkHelper,
    player: Player,
    defaultConfig: any,
    api: any,
    preset: string,
    presetsList: any,
    gui: MMDGui,
    camera: Camera,
    runtimeCharacter: any,
    controls: OrbitControls
    character: SkinnedMesh,
    stage: SkinnedMesh,
    loadCamera: Function
}

const useGlobalStore = create<GlobalState>(
    () => ({
        loader: new MMDLoader(),
        helper: null,
        cwHelper: null,
        player: null,
        defaultConfig: null,
        api: null,
        preset: null,
        presetsList: null,
        gui: null,
        character: null,
        stage: null,
        runtimeCharacter: null,
        camera: null,
        controls: null,
        loadCamera: null
    })
)

export default useGlobalStore;