import { useFrame } from "@react-three/fiber";
import { GroupChannelContext } from "@/app/components/multiplayer/peer/channel/GroupChannel";
import { useTargetModel, WithTargetModel } from "@/app/components/three-world/model/helper/useTargetModel";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { useContext, useEffect } from "react";
import usePresetStore from "@/app/stores/usePresetStore";
import { RunModes } from "../../run-modes";
import RemoteModel from "./remote-model";

function Models() {
    const channel = useContext(GroupChannelContext)
    const model = useTargetModel()
    const peerChannels = useGlobalStore(state => state.peerChannels)

    useEffect(() => {
        const { "run mode": prevMode } = usePresetStore.getState()
        usePresetStore.setState({ "run mode": RunModes.GAME_MODE })
        return () => {
            useGlobalStore.setState({ showGameMenu: false })
            usePresetStore.setState({ "run mode": prevMode })
        }
    }, [])

    useEffect(() => {
        channel.onOpen = (sender) => {
            useGlobalStore.setState(({ remoteModels }) => {
                remoteModels[sender] = {
                    fileName: "つみ式ミクさんv4/つみ式ミクさんv4.pmx",
                    motionNames: [],
                    enablePhysics: true,
                    enableMaterial: true,
                    enableMorph: true
                }
                return { remoteModels: { ...remoteModels } }
            })
        }
        channel.onClose = (sender) => {
            useGlobalStore.setState(({ remoteModels }) => {
                delete remoteModels[sender]
                return { remoteModels: { ...remoteModels } }
            })
        }
    }, [channel])

    // send model keyboard control in game mode
    useEffect(() => {
        const onPress = (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.repeat) return
            channel.send({
                type: "keydown",
                payload: e.key
            })
        }

        const onRelease = (e: KeyboardEvent) => {
            channel.send({
                type: "keyup",
                payload: e.key
            })
        }

        document.addEventListener("keydown", onPress)
        document.addEventListener("keyup", onRelease)

        return () => {
            document.removeEventListener("keydown", onPress)
            document.removeEventListener("keyup", onRelease)
        }
    }, [])

    useFrame(() => {
        channel.send({
            type: "pose",
            payload: model.matrixWorld.elements
        })
    })
    return (
        <>
            {
                Object.entries(peerChannels)
                    .filter(([_, pc]) => pc.channels["model"])
                    .map(([sender, _]) => <RemoteModel key={sender} sender={sender}></RemoteModel>)
            }
        </>
    );
}

export default WithTargetModel(Models);