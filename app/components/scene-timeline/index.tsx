import styles from "./styles.module.css"

function SceneTimeline({ children = null }: 
  { children?: React.ReactNode }) {
  return (
    <div className={`scrolling-bar ${styles["scrolling-bar"]}`}>
      <hr />
      <div className={`hit-point ${styles["hit-point"]}`}></div>
      {children}
    </div>
  );
}

export default SceneTimeline;