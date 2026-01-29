import { ButtonHTMLAttributes, DetailedHTMLProps, useEffect } from "react";
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
    const creditsPose = useGlobalStore(state => state.creditsPose)
    const onNewGame = () => {
        useGlobalStore.setState({ showGameMenu: false })
    }
    const onExit = () => {
        if (creditsPose) {
            useGlobalStore.setState({ creditsPose: null })
            return
        }
        usePresetStore.setState({ "run mode": RunModes.PLAYER_MODE })
    }
    const onCredits = () => {
        const { targetModelId } = usePresetStore.getState()
        const { models } = useGlobalStore.getState()
        const model = models[targetModelId]
        const creditPos = new Vector3(0, 10, 10)
        creditPos.applyAxisAngle(new Vector3(0, 1, 0), model.rotation.y)
        creditPos.add(model.position)
        useGlobalStore.setState({
            creditsPose: {
                position: creditPos.clone(),
                rotation: model.rotation.clone()
            }
        })
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.menu}>
                {
                    creditsPose === null && <>
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