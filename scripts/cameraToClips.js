import { CameraAnimationBuilder } from "../src/modules/cameraAnimationBuilder.js";
import { MMDParser } from "../src/modules/mmdparser.module.js";
import fs from "fs"
import path from 'path';

const parser = new MMDParser.Parser()

const vmd = parser.parseVmd(fs.readFileSync("/Users/junhu/self/mmd/cameras/ラビットホール(mobiusP様モーション)_カメラ/ラビットホール_camera.vmd").buffer)
const animationBuilder = new CameraAnimationBuilder();
const result = animationBuilder.buildCameraAnimation(vmd)

fs.writeFileSync(path.join(process.cwd(), "dist", "camera-clips", 'rabbit-hole.json'), JSON.stringify(result))

