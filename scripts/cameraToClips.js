import { CameraAnimationBuilder } from "./cameraAnimationBuilder.js";
import { MMDParser } from "../src/modules/mmdparser.module.js";
import fs from "fs"

const parser = new MMDParser.Parser()

const vmd = parser.parseVmd(fs.readFileSync("/Users/junhu/self/mmd/cameras/ラビットホール(mobiusP様モーション)_カメラ/ラビットホール_camera.vmd").buffer)
const animationBuilder = new CameraAnimationBuilder();
animationBuilder.buildCameraAnimation(vmd)
