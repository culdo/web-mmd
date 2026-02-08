import { useFrame } from "@react-three/fiber";
import { GroupChannelContext } from "@/app/components/multiplayer/peer/channel/GroupChannel";
import { useTargetModel, WithTargetModel } from "@/app/components/three-world/model/helper/useTargetModel";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { createRef, useContext, useEffect } from "react";
import usePresetStore from "@/app/stores/usePresetStore";
import { RunModes } from "../../..";
import RemoteModel from "./remote-model";
import useConfigStore from "@/app/stores/useConfigStore";
import { Text } from "@react-three/drei";
// @ts-ignore
import { Text as TextMeshImpl } from 'troika-three-text'

function Models() {
    const channel = useContext(GroupChannelContext)
    const model = useTargetModel()
    const peerChannels = useGlobalStore(state => state.peerChannels)
    const uid = useConfigStore(state => state.uid)

    useEffect(() => {
        useGlobalStore.setState(({ modelsObject, groupChannels }) => {
            const chatTextRef = createRef<TextMeshImpl>()
            modelsObject[model.name] = (
                <>
                    <Text depthOffset={-900} position={[0, -2, 0]}>{uid}</Text>
                    <Text ref={chatTextRef} position={[0, 20, 0]}>
                        Wellcome to Web MMD!
                    </Text>
                </>
            )
            groupChannels["model"].sharedObjects = {
                chatTextRef,
                remoteTextRefs: {}
            }
            return { groupChannels: { ...groupChannels }, modelsObject: {...modelsObject} }
        })
        return () => {
            useGlobalStore.setState({ showGameMenu: false, modelsObject: {} })
        }
    }, [])

    useEffect(() => {
        channel.onOpen = (sender) => {
            useGlobalStore.setState(({ remoteModels, modelsObject, groupChannels }) => {
                remoteModels[sender] = {
                    fileName: "つみ式ミクさんv4/つみ式ミクさんv4.pmx",
                    motionNames: [],
                    enablePhysics: true,
                    enableMaterial: true,
                    enableMorph: true
                }
                const chatTextRef = createRef<TextMeshImpl>()
                modelsObject[sender] = (
                    <>
                        <Text depthOffset={-900} position={[0, -2, 0]}>{sender}</Text>
                        <Text ref={chatTextRef} position={[0, 20, 0]}>
                            Wellcome to Web MMD!
                        </Text>
                    </>
                )
                groupChannels["model"].sharedObjects.remoteTextRefs[sender] = chatTextRef
                return { remoteModels: { ...remoteModels }, modelsObject: {...modelsObject}, groupChannels: {...groupChannels} }
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