import useGlobalStore from "@/app/stores/useGlobalStore"
import { useEffect } from "react"
import WithModel from "../../model/helper/WithModel"
import { useModel } from "../../model/helper/ModelContext"

const Poses = {
    menu: {
        position: [3.4, 10.1, 11.1],
        target: [-3.3, 8.3, -0.9,]
    },
    game: {
        position: [0, 30, -50],
        target: [0, 0, 0]
    }
}

function Camera() {
    const creditsPose = useGlobalStore(state => state.creditsPose)
    const cameraPose = useGlobalStore(state => state.cameraPose)
    const showGameMenu = useGlobalStore(state => state.showGameMenu)
    const targetModel = useModel()

    useEffect(() => {
        const camOrig = cameraPose.position.clone()
        const targetOrig = cameraPose.target.clone()
        cameraPose.position.fromArray(showGameMenu ? Poses.menu.position : Poses.game.position)
        cameraPose.target.fromArray(showGameMenu ? Poses.menu.target : Poses.game.target)
        if (creditsPose) {
            cameraPose.position.y -= 5
            cameraPose.target.y -= 5
            cameraPose.position.z += 40
        }
        cameraPose.position.applyQuaternion(targetModel.quaternion)
        cameraPose.target.applyQuaternion(targetModel.quaternion)
        return () => {
            cameraPose.position = camOrig
            cameraPose.target = targetOrig
        }
    }, [creditsPose, showGameMenu])

    return <></>;
}

export default WithModel(Camera);