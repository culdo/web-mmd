import fs from "fs";
import path from 'path';
import { cameraToClips } from "../app/modules/cameraClipsBuilder.js";

const result = cameraToClips(fs.readFileSync(process.argv[1]).buffer)

fs.writeFileSync(path.join(process.cwd(), "public", "camera-clips", 'rabbit-hole.json'), JSON.stringify(result))

