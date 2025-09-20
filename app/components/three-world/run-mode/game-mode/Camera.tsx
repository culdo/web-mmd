import useGlobalStore from "@/app/stores/useGlobalStore"
import { useEffect } from "react"
import { useModel } from "../../model/helper/ModelContext"

const Poses = {
    inMenu: {
        position: [1.8, 0.0, 6.9],
        target: [-1.4, 9.0, -0.9,]
    },
    inGame: {
        position: [0, 30, -50],
        target: [0, 0, 0]
    }
}

function Camera() {
    const creditsPose = useGlobalStore(state => state.creditsPose)
    const cameraPose = useGlobalStore(state => state.cameraPose)
    const showGameMenu = useGlobalStore(state => state.showGameMenu)

    useEffect(() => {
        const camOrig = cameraPose.position.clone()
        const targetOrig = cameraPose.target.clone()
        cameraPose.position.fromArray(showGameMenu ? Poses.inMenu.position : Poses.inGame.position)
        cameraPose.target.fromArray(showGameMenu ? Poses.inMenu.target : Poses.inGame.target)
        if (creditsPose) {
            cameraPose.position.y -= 5
            cameraPose.target.y -= 5
            cameraPose.position.z += 40
        }
        return () => {
            cameraPose.position = camOrig
            cameraPose.target = targetOrig
        }
    }, [creditsPose, showGameMenu])

    return <></>;
}

export default Camera;