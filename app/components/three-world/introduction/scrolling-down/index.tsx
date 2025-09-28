import styles from "./styles.module.css"
function ScrollingDown() {
    return (
        <>
            <div id="scroll-down" className={styles["scroll-down"]}>
                Scroll down
                <div className={styles.arrow}></div>
            </div>
        </>
     );
}

export default ScrollingDown;