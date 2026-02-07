import { useFrame } from "@react-three/fiber";
import { GroupChannelContext } from "@/app/components/multiplayer/peer/channel/GroupChannel";
import { useTargetModel, WithTargetModel } from "@/app/components/three-world/model/helper/useTargetModel";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { useContext, useEffect } from "react";
import usePresetStore from "@/app/stores/usePresetStore";
import { RunModes } from "../../run-modes";

function RemoteModel() {
    const channel = useContext(GroupChannelContext)
    const model = useTargetModel()
    const meshs = useGlobalStore(state => state.models)

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
        channel.onMessage = ({ sender, data }) => {
            if(meshs[sender] && meshs[sender].matrixWorldAutoUpdate) {
                meshs[sender].matrixWorldAutoUpdate = false
            }
            meshs[sender]?.matrixWorld.fromArray(JSON.parse(data));
        }
        channel.onClose = (sender) => {
            useGlobalStore.setState(({ remoteModels }) => {
                delete remoteModels[sender]
                return { remoteModels: { ...remoteModels } }
            })
        }
    }, [channel, meshs])

    useFrame(() => {
        channel.send(JSON.stringify(model.matrixWorld.elements))
    })
    return (
        <>
        </>
    );
}

export default WithTargetModel(RemoteModel);