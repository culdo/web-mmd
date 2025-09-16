import { createTrackInterpolant, CubicBezierInterpolation } from "@/app/modules/MMDLoader";
import { AnimationClip } from "three";

function makeClipLoopable(clip: AnimationClip) {
    const tracks = clip.tracks
    for (const track of tracks) {
        const times = track.times
        const values = track.values
        const strides = track.getValueSize()
        
        const interpolations = (track.createInterpolant() as CubicBezierInterpolation).interpolationParams
        if(interpolations === undefined) continue

        const intpStrides = interpolations.length / times.length
        if (times[0] != 0.0) {
            const aRange = clip.duration - times[times.length - 1]
            const bRange = times[0]
            const aValues = values.slice(values.length - strides, values.length)
            const bValues = values.slice(0, strides)
            const aIntp = interpolations.slice(interpolations.length - intpStrides, interpolations.length)
            const bIntp = interpolations.slice(0, intpStrides)

            const interpolat = new CubicBezierInterpolation([0, aRange + bRange], [...aValues, ...bValues], strides, new Float32Array([...aIntp, ...bIntp]), false);

            interpolat.evaluate(aRange)

            const newTimes = [...track.times]
            newTimes.splice(0, 0, 0)
            newTimes.push(clip.duration)
            track.times = new Float32Array(newTimes)

            const newValues = [...track.values]
            newValues.splice(0, 0, ...interpolat.resultBuffer)
            newValues.push(...interpolat.resultBuffer)
            track.values = new Float32Array(newValues)
            
            const newIntp = [...interpolations]
            newIntp.splice(0, 0, ...bIntp)
            newIntp.push(...bIntp)
            createTrackInterpolant(track, new Float32Array(newIntp), false)
        }
    }
}

export default makeClipLoopable;