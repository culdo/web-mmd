import { ButtonHTMLAttributes, DetailedHTMLProps, useEffect } from "react";
import styles from "./styles.module.css"
import useGlobalStore from "@/app/stores/useGlobalStore";
import usePresetStore from "@/app/stores/usePresetStore";
import { CameraMode } from "@/app/types/camera";
import defaultConfig from '@/app/presets/Default_config.json';

function Button({ children, ...props }: { children: React.ReactNode } & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
    return (
        <button className={styles.button} {...props} >{children}</button>
    );
}

function GameMenu() {
    const onNewGame = () => {
        useGlobalStore.setState({ showGameMenu: false })
    }
    const onExit = () => {
        usePresetStore.setState(({ models, targetModelId }) => {
            models[targetModelId].motionNames = defaultConfig.models[targetModelId as "character"]?.motionNames ?? []
            return { models: { ...models }, "camera mode": CameraMode.MOTION_FILE }
        })
        useGlobalStore.setState({ gui: { hidden: false }, showGameMenu: false })
        document.getElementById("rawPlayer").style.display = "block"
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.menu}>
                <Button onClick={onNewGame}>New Game</Button>
                <Button onClick={onExit}>Exit</Button>
            </div>
        </div>
    );
}

function Wrapper() {
    const showGameMenu = useGlobalStore(state => state.showGameMenu)
    const models = useGlobalStore(state => state.models)

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