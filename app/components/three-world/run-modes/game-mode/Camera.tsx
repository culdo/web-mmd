import useGlobalStore from "@/app/stores/useGlobalStore"
import { useEffect } from "react"

const Poses = {
    inMenu: {
        position: [1.8, 0.0, 6.9],
        target: [-1.4, 4.0, -0.9,]
    },
    inGame: {
        position: [0, 30, -50],
        target: [0, 0, 0]
    }
}

function Camera() {
    const creditsList = useGlobalStore(state => state.creditsList)
    const cameraPose = useGlobalStore(state => state.cameraOffset)
    const showGameMenu = useGlobalStore(state => state.showGameMenu)

    useEffect(() => {
        const camOrig = cameraPose.position.clone()
        const targetOrig = cameraPose.target.clone()
        cameraPose.position.fromArray(showGameMenu ? Poses.inMenu.position : Poses.inGame.position)
        cameraPose.target.fromArray(showGameMenu ? Poses.inMenu.target : Poses.inGame.target)
        return () => {
            cameraPose.position = camOrig
            cameraPose.target = targetOrig
        }
    }, [creditsList, showGameMenu])

    return <></>;
}

export default Camera;