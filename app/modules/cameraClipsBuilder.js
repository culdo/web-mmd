import {
	AnimationClip,
	Euler,
	NumberKeyframeTrack,
	Quaternion,
	QuaternionKeyframeTrack,
	Vector3,
	VectorKeyframeTrack
} from 'three';
import { MMDParser } from './mmdparser.module.js';

//

export class CameraClipsBuilder {

	/**
	 * @param {Object} vmd - parsed VMD data
	 * @return {AnimationClip}
	 */
	buildCameraAnimation(vmd) {

		function pushVector3(array, vec) {

			array.push(vec.x);
			array.push(vec.y);
			array.push(vec.z);

		}

		function pushQuaternion(array, q) {

			array.push(q.x);
			array.push(q.y);
			array.push(q.z);
			array.push(q.w);

		}

		function pushInterpolation(array, interpolation, index) {

			array.push(interpolation[index * 4 + 0] / 127); // x1
			array.push(interpolation[index * 4 + 1] / 127); // x2
			array.push(interpolation[index * 4 + 2] / 127); // y1
			array.push(interpolation[index * 4 + 3] / 127); // y2

		}

		const cameras = vmd.cameras === undefined ? [] : vmd.cameras.slice();

		cameras.sort(function (a, b) {

			return a.frameNum - b.frameNum;

		});

		const times = [];
		const centers = [];
		const quaternions = [];
		const positions = [];
		const fovs = [];

		const cInterpolations = [];
		const qInterpolations = [];
		const pInterpolations = [];
		const fInterpolations = [];

		const quaternion = new Quaternion();
		const euler = new Euler();
		const position = new Vector3();
		const center = new Vector3();

		const clips = []
		const cutTimes = []
		const jsonResult = { clips, cutTimes };

		cutTimes.push(0.0)

		for (let i = 0, il = cameras.length; i < il; i++) {

			const motion = cameras[i];
			const time = motion.frameNum / 30;
			const pos = motion.position;
			const rot = motion.rotation;
			const distance = motion.distance;
			const fov = motion.fov;
			const interpolation = motion.interpolation;

			// push normalize time (start from 0s)
			times.push(time - cutTimes[cutTimes.length - 1]);

			position.set(0, 0, - distance);

			center.set(pos[0], pos[1], pos[2]);

			euler.set(- rot[0], - rot[1], - rot[2]);
			quaternion.setFromEuler(euler);

			position.applyQuaternion(quaternion);
			position.add(center);

			pushVector3(centers, center);
			pushQuaternion(quaternions, quaternion);
			pushVector3(positions, position);

			fovs.push(fov);

			for (let j = 0; j < 3; j++) {

				pushInterpolation(cInterpolations, interpolation, j);

			}

			pushInterpolation(qInterpolations, interpolation, 3);

			// use the same parameter for x, y, z axis.
			for (let j = 0; j < 3; j++) {

				pushInterpolation(pInterpolations, interpolation, 4);

			}

			pushInterpolation(fInterpolations, interpolation, 5);

			if (i == cameras.length - 1 || (cameras[i + 1].frameNum - motion.frameNum) <= 1) {
				if (i < cameras.length - 1) {
					cutTimes.push(cameras[i + 1].frameNum / 30)
				}

				const tracks = [];

				// I expect an object whose name 'target' exists under THREE.Camera
				const tTrack = this._createTrack('target.position', VectorKeyframeTrack, times, centers, cInterpolations)
				const qTrack = this._createTrack('.quaternion', QuaternionKeyframeTrack, times, quaternions, qInterpolations)
				const pTrack = this._createTrack('.position', VectorKeyframeTrack, times, positions, pInterpolations)
				const fTrack = this._createTrack('.fov', NumberKeyframeTrack, times, fovs, fInterpolations)

				tracks.push(tTrack.track);
				tracks.push(qTrack.track);
				tracks.push(pTrack.track);
				tracks.push(fTrack.track);

				const clip = new AnimationClip('', - 1, tracks);
				clips.push({
					clip: AnimationClip.toJSON(clip),
					interpolations: {
						'target.position': tTrack.interpolations.slice(),
						'.quaternion': qTrack.interpolations.slice(),
						'.position': pTrack.interpolations.slice(),
						'.fov': fTrack.interpolations.slice()
					}
				})

				times.length = 0
				centers.length = 0
				quaternions.length = 0
				positions.length = 0
				fovs.length = 0

				cInterpolations.length = 0
				qInterpolations.length = 0
				pInterpolations.length = 0
				fInterpolations.length = 0
			}
		}

		if (clips.length != cutTimes.length) {
			throw `clips.length: ${clips.length} != cutTimes.length: ${cutTimes.length}`
		}
		return jsonResult
	}

	// private method

	_createTrack(node, typedKeyframeTrack, times, values, interpolations) {

		/*
			 * optimizes here not to let KeyframeTrackPrototype optimize
			 * because KeyframeTrackPrototype optimizes times and values but
			 * doesn't optimize interpolations.
			 */
		if (times.length > 2) {

			times = times.slice();
			values = values.slice();
			interpolations = interpolations.slice();

			const stride = values.length / times.length;
			const interpolateStride = interpolations.length / times.length;

			let index = 1;

			for (let aheadIndex = 2, endIndex = times.length; aheadIndex < endIndex; aheadIndex++) {

				for (let i = 0; i < stride; i++) {

					if (values[index * stride + i] !== values[(index - 1) * stride + i] ||
						values[index * stride + i] !== values[aheadIndex * stride + i]) {

						index++;
						break;

					}

				}

				if (aheadIndex > index) {

					times[index] = times[aheadIndex];

					for (let i = 0; i < stride; i++) {

						values[index * stride + i] = values[aheadIndex * stride + i];

					}

					for (let i = 0; i < interpolateStride; i++) {

						interpolations[index * interpolateStride + i] = interpolations[aheadIndex * interpolateStride + i];

					}

				}

			}

		}

		return { track: new typedKeyframeTrack(node, times, values), interpolations };
	}

}

export function cameraToClips(vmdBuffer) {
	const parser = new MMDParser.Parser()

	const vmd = parser.parseVmd(vmdBuffer, true)
	const animationBuilder = new CameraClipsBuilder();
	return animationBuilder.buildCameraAnimation(vmd)
}
