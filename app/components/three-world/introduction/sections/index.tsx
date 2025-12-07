import styles from "./styles.module.css"
function Sections() {
    return (
        <>
            <div id="intro-sections" className={styles["sections"]}>
                <div id="section1" className={styles.item}>Web MMD</div>
                <div id="section2" className={styles.item}>What is MMD</div>
                <div id="section3" className={styles.item}>How to make</div>
                <div id="section4" className={styles.item}>Music</div>
                <div id="section5" className={styles.item}>Models</div>
                <div id="section6" className={styles.item}>Motions</div>
                <div id="tryNow" className={`${styles.item} ${styles.tryNow}`}>Try Now!</div>
            </div>
        </>
     );
}

export default Sections;