import Image from "next/image";
import LoadingOverlay from "./components/loading-overlay";
import SceneTimeline from "./components/scene-timeline";
import WebMMDComp from "./components/web-mmd";
import fullscreen from "./components/fullscreen/fullscreen.svg"

export default function Home() {

  return (
    <>
      <LoadingOverlay></LoadingOverlay>
      <SceneTimeline></SceneTimeline>
      <WebMMDComp></WebMMDComp>
      <audio
        id="rawPlayer"
        className="video-js vjs-default-skin"
        controls
      >
      </audio>
      <input id="selectFile" type="file" />
      <div id="button">
        <Image src={fullscreen} alt="fullscreen" height="24" width="24" />
      </div>
    </>
  );
}
