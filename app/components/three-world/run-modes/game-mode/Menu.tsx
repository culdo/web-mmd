import { ButtonHTMLAttributes, DetailedHTMLProps, useEffect, useState } from "react";
import styles from "./styles.module.css"
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { Vector3 } from "three";
import { RunModes } from "..";

function Button({ children, ...props }: { children: React.ReactNode } & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
    return (
        <button className={styles.button} {...props} >{children}</button>
    );
}

function GameMenu() {
    const creditsList = useGlobalStore(state => state.creditsList)
    const cameraPose = useGlobalStore(state => state.cameraOffset)

    const onNewGame = () => {
        useGlobalStore.setState({ showGameMenu: false })
    }
    const onExit = () => {
        if (creditsList.visible) {
            creditsList.visible = false
            setIsShowCredits(false)
            cameraPose.position.y += 5
            cameraPose.target.y += 5
            cameraPose.position.z -= 40
            return
        }
        usePresetStore.setState({ "run mode": RunModes.PLAYER_MODE })
    }
    const [isShowCredits, setIsShowCredits] = useState(false)

    const onCredits = () => {
        const { targetModelId } = usePresetStore.getState()
        const { models } = useGlobalStore.getState()
        const model = models[targetModelId]
        cameraPose.position.y -= 5
        cameraPose.target.y -= 5
        cameraPose.position.z += 40
        creditsList.position.set(0, 10, 10)
        creditsList.position.applyAxisAngle(new Vector3(0, 1, 0), model.rotation.y)
        creditsList.position.add(model.position)
        creditsList.visible = true
        setIsShowCredits(true)
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.menu}>
                {
                    !isShowCredits && <>
                        <Button onClick={onNewGame}>New Game</Button>
                        <Button onClick={onCredits}>Credits</Button>
                    </>
                }
                <Button onClick={onExit}>Exit</Button>
            </div>
        </div>
    );
}

function Wrapper() {
    const showGameMenu = useGlobalStore(state => state.showGameMenu)
    const runMode = usePresetStore(state => state["run mode"])

    useEffect(() => {
        const onKeydown = (e: KeyboardEvent) => {
            if (e.key == "Escape") {
                useGlobalStore.setState(({ showGameMenu }) => {
                    return { showGameMenu: !showGameMenu }
                })
            }
        }
        document.addEventListener("keydown", onKeydown)
        return () => {
            document.removeEventListener("keydown", onKeydown)
        }
    })

    if (!showGameMenu || runMode != RunModes.GAME_MODE) return <></>
    return <GameMenu></GameMenu>
}

export default Wrapper;