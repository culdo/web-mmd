import { AnimationClip, KeyframeTrack } from "three";

/**
 * Merge clips by order with tracks overriding
 */

function mergeClips(...clips: AnimationClip[]) {
    const pendingTracks: Record<string, KeyframeTrack> = {}
    for (const clip of clips) {
        for (const track of clip.tracks) {
            pendingTracks[track.name] = track
        }
    }
    return new AnimationClip('', -1, Object.values(pendingTracks));
}

export default mergeClips;