function SceneTimeline({ children = null }) {
  return (
    <div className="scrolling-bar">
      <hr />
      <div className="hit-point"></div>
      {children}
    </div>
  );
}

export default SceneTimeline;