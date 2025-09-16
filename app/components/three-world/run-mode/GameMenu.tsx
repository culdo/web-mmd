import { ButtonHTMLAttributes, DetailedHTMLProps, useEffect } from "react";
import styles from "./styles.module.css"
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { CameraMode } from "@/app/types/camera";
import defaultConfig from '@/app/presets/Default_config.json';
import { Vector3 } from "three";

function Button({ children, ...props }: { children: React.ReactNode } & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
    return (
        <button className={styles.button} {...props} >{children}</button>
    );
}

function GameMenu() {
    const creditsPos = useGlobalStore(state => state.creditsPose)
    const onNewGame = () => {
        useGlobalStore.setState({ showGameMenu: false })
    }
    const onExit = () => {
        if (creditsPos) {
            useGlobalStore.setState({ creditsPose: null })
            return
        }
        usePresetStore.setState(({ models, targetModelId }) => {
            models[targetModelId].motionNames = defaultConfig.models[targetModelId as "character"]?.motionNames ?? []
            return { models: { ...models }, "camera mode": CameraMode.MOTION_FILE }
        })
        useGlobalStore.setState({ gui: { hidden: false }, showGameMenu: false })
        document.getElementById("rawPlayer").style.display = "block"
    }
    const onCredits = () => {
        const { targetModelId } = usePresetStore.getState()
        const { models } = useGlobalStore.getState()
        const model = models[targetModelId]
        const creditPos = new Vector3(0, 10, 10)
        creditPos.applyAxisAngle(new Vector3(0, 1, 0), model.rotation.y)
        creditPos.add(model.position)
        useGlobalStore.setState({ creditsPose: {
            position: creditPos.toArray(),
            rotation: [model.rotation.x, model.rotation.y, model.rotation.z]
        } })
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.menu}>
                {
                    creditsPos === null && <>
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

    if (!showGameMenu) return <></>
    return <GameMenu></GameMenu>
}

export default Wrapper;