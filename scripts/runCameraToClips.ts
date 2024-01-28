import fs from "fs";
import path from 'path';
import { cameraToClips } from "../src/modules/cameraClipsBuilder.js";

const result = cameraToClips(fs.readFileSync("/Users/junhu/self/mmd/cameras/ラビットホール(mobiusP様モーション)_カメラ/ラビットホール_camera.vmd").buffer)

fs.writeFileSync(path.join(process.cwd(), "dist", "camera-clips", 'rabbit-hole.json'), JSON.stringify(result))

