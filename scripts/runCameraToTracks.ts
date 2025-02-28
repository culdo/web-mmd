import { cameraToTracks, TheaKeyframeTrack } from "@/app/modules/theatreTrackBuilder";
import fs from "fs";
import path from 'path';
import MMDState from "@/app/presets/MMD.theatre-project-state.json"


console.log(process.argv[2])
const result = cameraToTracks(fs.readFileSync(process.argv[2]).buffer)

result.positionKeyFrames.x.id = "ExqIB5_JPK",
result.positionKeyFrames.y.id = "6DwyEsX1Jq",
result.positionKeyFrames.z.id = "xB9b4VLejM",
result.rotationKeyFrames.x.id = "qqsgCZJ4Oq",
result.rotationKeyFrames.y.id = "DEMBj3cJ4O",
result.rotationKeyFrames.z.id = "q9e9PaHR76",
result.fovKeyFrames.id = "PJ2eUTHffE"

const tracksByObject = MMDState.historic.innerState.coreByProject.MMD.sheetsById["MMD UI"].sequence.tracksByObject
MMDState.historic.innerState.coreByProject.MMD.sheetsById["MMD UI"].sequence.length = 220

for(const [key, tracks] of Object.entries(result)) {
    if(key == "targetPosKeyFrames") {
        continue
    }
    if(tracks instanceof TheaKeyframeTrack) {
        tracksByObject.Camera.trackData[tracks.id as "ExqIB5_JPK"].keyframes = tracks.keyframes
    } else {
        for(const track of Object.values(tracks)) {
            tracksByObject.Camera.trackData[track.id as "ExqIB5_JPK"].keyframes = track.keyframes
        }
    }
    
}

result.targetPosKeyFrames.x.id = "XN5bra4VoB",
result.targetPosKeyFrames.y.id = "WggqUWPgWq",
result.targetPosKeyFrames.z.id = "cwuGmVbOy7"

for(const track of Object.values(result.targetPosKeyFrames)) {
    tracksByObject["Camera Target"].trackData[track.id as "XN5bra4VoB"].keyframes = track.keyframes
}

fs.writeFileSync(path.join(process.cwd(), "..", "app", "presets", "MMD.theatre-project-state.json"), JSON.stringify(MMDState))

