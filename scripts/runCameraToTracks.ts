import { cameraToTracks } from "@/app/modules/theatreTrackBuilder";
import fs from "fs";
import path from 'path';

console.log(process.argv[2])
const MMDState = cameraToTracks(fs.readFileSync(process.argv[2]).buffer)

fs.writeFileSync(path.join(process.cwd(), "..", "app", "presets", "MMD.theatre-project-state.json"), JSON.stringify(MMDState))

