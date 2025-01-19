import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { buildGuiItem, buildLoadFileFn, buildLoadModelFn } from "@/app/utils/gui";
import { button, useControls } from "leva";
import * as THREE from 'three';
import PmxModel from "../pmx-model";
import { ThreeEvent } from "@react-three/fiber";
import WithReady from "@/app/stores/WithReady";

function Model() {
    const characterName = usePresetStore(state => state.character)
    const motionName = usePresetStore(state => state.motion)
    const pmxFiles = usePresetStore(state => state.pmxFiles)
    const enableSdef = usePresetStore(state => state["enable SDEF"])
    const enablePBR = usePresetStore(state => state["enable PBR"])
    const selfShadow = usePresetStore(state => state["self shadow"])

    const positionKey = "Character.position"
    const position = usePresetStore(state => state[positionKey])

    const url = pmxFiles.character[characterName]

    const [_, set] = useControls('Character', () => ({
        "model": {
            value: characterName,
            options: Object.keys(pmxFiles.character),
            onChange: (value, path, options) => {
                if (!options.initial) {
                    usePresetStore.setState({ character: value })
                }
            },
        },
        "select character folder": button(() => {
            const selectFile = document.getElementById("selectFile") as HTMLInputElement
            selectFile.webkitdirectory = true;
            selectFile.onchange = buildLoadModelFn("character")
            selectFile.click();
            selectFile.webkitdirectory = false;
        }),
        "position": buildGuiItem(positionKey),
        "reset": button(() => {
            set({ position: [0, 0, 0] })
        }),
        "motion name": {
            value: motionName,
            editable: false
        },
        "select motion file": button(() => {
            const selectFile = document.getElementById("selectFile") as HTMLInputElement
            selectFile.onchange = buildLoadFileFn((motionFile, motion) => {
                usePresetStore.setState({ motionFile, motion })
                set({ "motion name": motion })
            })
            selectFile.click();
        }),
    }), { collapsed: true, order: 2 }, [pmxFiles.character, motionName])

    return (
        <PmxModel
            position={position}
            url={url}
            modelTextures={pmxFiles.modelTextures.character[characterName]}
            enableSdef={enableSdef}
            enablePBR={enablePBR}
            receiveShadow={selfShadow}
            castShadow={true}
            onCreate={(mesh: THREE.SkinnedMesh) => useGlobalStore.setState({
                character: mesh
            })}
            onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation()
                useGlobalStore.setState(({ selectedName: positionKey }))
            }}
            onPointerMissed={(e: Event) => {
                e.type === 'click' && useGlobalStore.setState({ selectedName: null })
            }}
        >
            <object3D name="smoothCenter"></object3D>
        </PmxModel>
    );
}

export default WithReady(Model);