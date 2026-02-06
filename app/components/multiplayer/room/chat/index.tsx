import useGlobalStore from "@/app/stores/useGlobalStore";
import BroadcastChannel from "../../peer/channel/BroadcastChannel";
import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css"
import useConfigStore from "@/app/stores/useConfigStore";

function Chat() {
    const channel = useGlobalStore(state => state.broadcastChannels)["chat"]
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

    useEffect(() => {
        if (!channel) return
        channel.onMessage = (msg) => {
            setTexts((texts) => {
                texts.push({
                    node: `${msg.sender}: ${msg.data}`,
                    style: ""
                })
                return [...texts]
            })
        }
        inputRef.current.onkeydown = (e) => {
            if (e.key == "Enter") {
                const text = inputRef.current.value
                if (!text) return
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
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }, [texts])

    return (
        <>
            <BroadcastChannel label="chat"></BroadcastChannel>
            <div id="chat" className={styles.chat}>
                <div ref={textareaRef} className="px-2 h-full bg-white bg-opacity-10 rounded-t-lg hover:overflow-auto overflow-hidden flex flex-col">
                    {
                        Object.entries(texts).map(
                            ([i, text]) => <div key={i} className={text.style}>{text.node}</div>
                        )
                    }
                </div>
                <input name="input" ref={inputRef} className="px-2 rounded-b-md" placeholder="sending message..." type="text"></input>
            </div>
        </>
    );
}

export default Chat;