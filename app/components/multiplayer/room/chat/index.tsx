import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./styles.module.css"
import useConfigStore from "@/app/stores/useConfigStore";
import { GroupChannelContext } from "../../peer/channel/GroupChannel";
import useGlobalStore from "@/app/stores/useGlobalStore";
import useAutoHide from "@/app/components/control-bar/audio-player/useAutoHide";

function Chat() {
    const channel = useContext(GroupChannelContext)
    const uid = useConfigStore(state => state.uid)
    const [texts, setTexts] = useState<{
        node: React.ReactNode,
        style?: string
    }[]>([
        {
            node: "Wellcome to Chat!",
            style: "text-sky-300 self-center"
        }
    ])
    const inputRef = useRef<HTMLInputElement>()
    const textareaRef = useRef<HTMLDivElement>()
    const groupChannels = useGlobalStore(state => state.groupChannels)

    useEffect(() => {
        channel.onMessage = ({ sender, data }) => {
            if (groupChannels["model"]) {
                groupChannels["model"].sharedObjects.remoteTextRefs[sender].current.text = data
            }
            setTexts((texts) => {
                texts.push({
                    node: `${sender}: ${data}`,
                    style: ""
                })
                return [...texts]
            })
        }
        inputRef.current.onkeydown = (e) => {
            e.stopPropagation()
            if (e.key == "Enter") {
                const text = inputRef.current.value
                if (!text) {
                    inputRef.current.classList.add("invisible")
                    inputRef.current.blur()
                    return
                }
                if (groupChannels["model"]) {
                    groupChannels["model"].sharedObjects.chatTextRef.current.text = text
                }
                setTexts((texts) => {
                    texts.push({
                        node: `${uid}(me): ${text}`,
                        style: "text-yellow-300"
                    })
                    return [...texts]
                })
                channel.send(text)
                inputRef.current.value = ""
            }
        }
    }, [channel])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key == "Enter") {
                inputRef.current.classList.remove("invisible")
                inputRef.current.focus()
            }
        }
        document.addEventListener("keydown", onKeyDown)
        return () => document.removeEventListener("keydown", onKeyDown)
    }, [])

    useEffect(() => {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }, [texts])

    const containerRef = useRef<HTMLDivElement>(null)
    const onPlay = () => {
        containerRef.current.style.display = "none";
    }
    const onPause = () => {
        containerRef.current.style.display = "flex";
    }
    useAutoHide(onPlay, onPause)

    return (
        <>
            <div tabIndex={-1} ref={containerRef} className={`${styles.chat} group`}>
                <div ref={textareaRef} className="px-2 min-h-10 bg-white bg-opacity-0 group-focus:bg-opacity-10 rounded-t-lg group-focus:overflow-auto overflow-hidden flex flex-col">
                    {
                        Object.entries(texts).map(
                            ([i, text]) => <div key={i} className={text.style}>{text.node}</div>
                        )
                    }
                </div>
                <input name="input" ref={inputRef} className="px-2 rounded-b-md invisible hover:visible focus:visible group-focus:visible" placeholder="sending message..." type="text"></input>
            </div>
        </>
    );
}

export default Chat;