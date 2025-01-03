import Image from "next/image";
import icon from "./fullscreen.svg"
import styles from "./styles.module.css"

function FullScreenButton() {

    const onClick = () => {
        let elem = document.querySelector("body");

        if (!document.fullscreenElement) {
            elem.requestFullscreen()
        } else {
            document.exitFullscreen();
        }
    }
    
    return (
        <div id="fsBtn" className={`${styles.fsBtn} control-bar`} onClick={onClick}>
            <Image src={icon} alt="fullscreen" height="24" width="24" />
        </div>
    );
}

export default FullScreenButton;