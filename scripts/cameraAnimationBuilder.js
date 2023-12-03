import {
	AnimationClip,
	Euler,
	Interpolant,
	NumberKeyframeTrack,
	Quaternion,
	QuaternionKeyframeTrack,
	Vector3,
	VectorKeyframeTrack
} from 'three';
import fs from "fs"
import path from 'path';

//

export class CameraAnimationBuilder {

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
		let prevFrameNum = -2;
		let clipIdx = 0;

		const cutTimes = []
		cutTimes.push(0.0)

		for (let i = 0, il = cameras.length; i < il; i++) {

			const motion = cameras[i];

			if ((motion.frameNum - prevFrameNum) <= 1) {
				cutTimes.push(motion.frameNum / 30)

				const tracks = [];

				// I expect an object whose name 'target' exists under THREE.Camera
				tracks.push(this._createTrack('target.position', VectorKeyframeTrack, times, centers, cInterpolations, true));

				tracks.push(this._createTrack('.quaternion', QuaternionKeyframeTrack, times, quaternions, qInterpolations, true));
				tracks.push(this._createTrack('.position', VectorKeyframeTrack, times, positions, pInterpolations, true));
				tracks.push(this._createTrack('.fov', NumberKeyframeTrack, times, fovs, fInterpolations, true));

				const clip = new AnimationClip('', - 1, tracks);
				const jsonStr = JSON.stringify(
					{
						clip: AnimationClip.toJSON(clip),
						interpolations: {
							'target.position': cInterpolations,
							'.quaternion': qInterpolations,
							'.position': pInterpolations,
							'.fov': fInterpolations
						}
					}
				);
				fs.writeFileSync(path.join(process.cwd(), "dist", "camera-clips", `${clipIdx}.json`), jsonStr)

				clipIdx++;

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
			prevFrameNum = motion.frameNum

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

		}
		const tracks = [];

		// I expect an object whose name 'target' exists under THREE.Camera
		tracks.push(this._createTrack('target.position', VectorKeyframeTrack, times, centers, cInterpolations, true));

		tracks.push(this._createTrack('.quaternion', QuaternionKeyframeTrack, times, quaternions, qInterpolations, true));
		tracks.push(this._createTrack('.position', VectorKeyframeTrack, times, positions, pInterpolations, true));
		tracks.push(this._createTrack('.fov', NumberKeyframeTrack, times, fovs, fInterpolations, true));

		const clip = new AnimationClip('', - 1, tracks);

		const jsonStr = JSON.stringify(
			{
				clip: AnimationClip.toJSON(clip),
				interpolations: {
					'target.position': cInterpolations,
					'.quaternion': qInterpolations,
					'.position': pInterpolations,
					'.fov': fInterpolations
				}
			}
		);
		fs.writeFileSync(path.join(process.cwd(), "dist", "camera-clips", `${clipIdx}.json`), jsonStr)
		// fs.writeFileSync(path.join(process.cwd(), "dist", "camera-clips", "cut-times.json"), JSON.stringify(cutTimes))
		if (clipIdx + 1 != cutTimes.length) {
			throw "error: clipNum not equles cutimes length"
		}

	}

	// private method

	_createTrack(node, typedKeyframeTrack, times, values, interpolations, isCamera = false) {

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

		const track = new typedKeyframeTrack(node, times, values);

		track.createInterpolant = function (result) {

			return new CubicBezierInterpolation(this.times, this.values, this.getValueSize(), result, new Float32Array(interpolations), isCamera);

		};
		console.log(track.createInterpolant)

		return track;

	}

	createInterpolant(track) {
		track.createInterpolant = function (result) {

			return new CubicBezierInterpolation(this.times, this.values, this.getValueSize(), result, new Float32Array(interpolations), isCamera);

		};
	}

}

// interpolation

class CubicBezierInterpolation extends Interpolant {

	constructor(parameterPositions, sampleValues, sampleSize, resultBuffer, params, isCamera = false) {

		super(parameterPositions, sampleValues, sampleSize, resultBuffer);

		this.interpolationParams = params;
		this.isCamera = isCamera;

	}

	interpolate_(i1, t0, t, t1) {

		const result = this.resultBuffer;
		const values = this.sampleValues;
		const stride = this.valueSize;
		const params = this.interpolationParams;

		const offset1 = i1 * stride;
		const offset0 = offset1 - stride;

		// No interpolation if next camera key frame is in one frame in 30fps.
		// This is from MMD animation spec.
		// '1.5' is for precision loss. times are Float32 in Three.js Animation system.
		const weight1 = (((t1 - t0) < 1 / 30 * 1.5) && this.isCamera) ? 0.0 : (t - t0) / (t1 - t0);

		if (stride === 4) { // Quaternion

			const x1 = params[i1 * 4 + 0];
			const x2 = params[i1 * 4 + 1];
			const y1 = params[i1 * 4 + 2];
			const y2 = params[i1 * 4 + 3];

			const ratio = this._calculate(x1, x2, y1, y2, weight1);

			Quaternion.slerpFlat(result, 0, values, offset0, values, offset1, ratio);

		} else if (stride === 3) { // Vector3

			for (let i = 0; i !== stride; ++i) {

				const x1 = params[i1 * 12 + i * 4 + 0];
				const x2 = params[i1 * 12 + i * 4 + 1];
				const y1 = params[i1 * 12 + i * 4 + 2];
				const y2 = params[i1 * 12 + i * 4 + 3];

				const ratio = this._calculate(x1, x2, y1, y2, weight1);

				result[i] = values[offset0 + i] * (1 - ratio) + values[offset1 + i] * ratio;

			}

		} else { // Number

			const x1 = params[i1 * 4 + 0];
			const x2 = params[i1 * 4 + 1];
			const y1 = params[i1 * 4 + 2];
			const y2 = params[i1 * 4 + 3];

			const ratio = this._calculate(x1, x2, y1, y2, weight1);

			result[0] = values[offset0] * (1 - ratio) + values[offset1] * ratio;

		}

		return result;

	}

	_calculate(x1, x2, y1, y2, x) {

		/*
			 * Cubic Bezier curves
			 *   https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B.C3.A9zier_curves
			 *
			 * B(t) = ( 1 - t ) ^ 3 * P0
			 *      + 3 * ( 1 - t ) ^ 2 * t * P1
			 *      + 3 * ( 1 - t ) * t^2 * P2
			 *      + t ^ 3 * P3
			 *      ( 0 <= t <= 1 )
			 *
			 * MMD uses Cubic Bezier curves for bone and camera animation interpolation.
			 *   http://d.hatena.ne.jp/edvakf/20111016/1318716097
			 *
			 *    x = ( 1 - t ) ^ 3 * x0
			 *      + 3 * ( 1 - t ) ^ 2 * t * x1
			 *      + 3 * ( 1 - t ) * t^2 * x2
			 *      + t ^ 3 * x3
			 *    y = ( 1 - t ) ^ 3 * y0
			 *      + 3 * ( 1 - t ) ^ 2 * t * y1
			 *      + 3 * ( 1 - t ) * t^2 * y2
			 *      + t ^ 3 * y3
			 *      ( x0 = 0, y0 = 0 )
			 *      ( x3 = 1, y3 = 1 )
			 *      ( 0 <= t, x1, x2, y1, y2 <= 1 )
			 *
			 * Here solves this equation with Bisection method,
			 *   https://en.wikipedia.org/wiki/Bisection_method
			 * gets t, and then calculate y.
			 *
			 * f(t) = 3 * ( 1 - t ) ^ 2 * t * x1
			 *      + 3 * ( 1 - t ) * t^2 * x2
			 *      + t ^ 3 - x = 0
			 *
			 * (Another option: Newton's method
			 *    https://en.wikipedia.org/wiki/Newton%27s_method)
			 */

		let c = 0.5;
		let t = c;
		let s = 1.0 - t;
		const loop = 15;
		const eps = 1e-5;
		const math = Math;

		let sst3, stt3, ttt;

		for (let i = 0; i < loop; i++) {

			sst3 = 3.0 * s * s * t;
			stt3 = 3.0 * s * t * t;
			ttt = t * t * t;

			const ft = (sst3 * x1) + (stt3 * x2) + (ttt) - x;

			if (math.abs(ft) < eps) break;

			c /= 2.0;

			t += (ft < 0) ? c : - c;
			s = 1.0 - t;

		}

		return (sst3 * y1) + (stt3 * y2) + ttt;

	}

}

