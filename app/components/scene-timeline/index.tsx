function SceneTimeline({ children = null }: 
  { children?: React.ReactNode }) {
  return (
    <div className="scrolling-bar">
      <hr />
      <div className="hit-point"></div>
      {children}
    </div>
  );
}

export default SceneTimeline;