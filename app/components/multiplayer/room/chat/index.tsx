import useGlobalStore from "@/app/stores/useGlobalStore";
import BroadcastChannel from "../../peer/channel/BroadcastChannel";
import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css"

function Chat() {
    const channel = useGlobalStore(state => state.broadcastChannels)["chat"]
    const [texts, setTexts] = useState("")
    const inputRef = useRef<HTMLInputElement>()
    const textareaRef = useRef<HTMLTextAreaElement>()

    useEffect(() => {
        if (!channel) return
        channel.onMessage = (msg) => {
            const text = `${msg.sender}: ${msg.data}`
            setTexts((prevText) => {
                return prevText + text + "\n"
            })
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight
        }
        inputRef.current.onkeydown = (e) => {
            if (e.key == "Enter") {
                const text = inputRef.current.value
                if (!text) return
                setTexts((prevText) => {
                    return prevText + `me: ${text}` + "\n"
                })
                channel.send(text)
                inputRef.current.value = ""
                textareaRef.current.scrollTop = textareaRef.current.scrollHeight
            }
        }
    }, [channel])
    return (
        <>
            <BroadcastChannel label="chat"></BroadcastChannel>
            <div className={styles.chat}>
                <textarea ref={textareaRef} readOnly value={texts}></textarea>
                <input ref={inputRef} placeholder="typing here..." type="text"></input>
            </div>
        </>
    );
}

export default Chat;