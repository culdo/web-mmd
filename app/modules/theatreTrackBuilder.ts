import {
	AnimationClip,
	Euler,
	KeyframeTrack,
	NumberKeyframeTrack,
	Quaternion,
	QuaternionKeyframeTrack,
	Vector3,
	VectorKeyframeTrack
} from 'three';
import { MMDParser } from './mmdparser.module';
import { nanoid } from 'nanoid/non-secure';
import MMDState from "@/app/presets/MMD.theatre-project-state.json"

//

class TheatreTrackBuilder {

	/**
	 * @param {Object} vmd - parsed VMD data
	 * @param {SkinnedMesh} mesh - tracks will be fitting to mesh
	 * @return {AnimationClip}
	 */
	build(vmd: any, mesh: any) {

		// combine skeletal and morph animations

		const tracks = this.buildSkeletalAnimation(vmd, mesh).tracks;
		const tracks2 = this.buildMorphAnimation(vmd, mesh).tracks;

		for (let i = 0, il = tracks2.length; i < il; i++) {

			tracks.push(tracks2[i]);

		}

		return new AnimationClip('', - 1, tracks);

	}

	/**
	 * @param {Object} vmd - parsed VMD data
	 * @param {SkinnedMesh} mesh - tracks will be fitting to mesh
	 * @return {AnimationClip}
	 */
	buildSkeletalAnimation(vmd: { metadata: { motionCount: number; }; motions: any[]; }, mesh: { skeleton: { bones: any; getBoneByName: (arg0: string) => { (): any; new(): any; position: { (): any; new(): any; toArray: { (): any; new(): any; }; }; }; }; animationBones: string[]; }) {

		function pushInterpolation(array: any[], interpolation: { [x: string]: number; }, index: number) {

			array.push(interpolation[index + 0] / 127); // x1
			array.push(interpolation[index + 8] / 127); // x2
			array.push(interpolation[index + 4] / 127); // y1
			array.push(interpolation[index + 12] / 127); // y2

		}

		const tracks: KeyframeTrack[] = [];

		const motions: any = {};
		const bones = mesh.skeleton.bones;
		const boneNameDictionary: any = {};

		for (let i = 0, il = bones.length; i < il; i++) {

			boneNameDictionary[bones[i].name] = false;

		}

		for (let i = 0; i < vmd.metadata.motionCount; i++) {

			const motion = vmd.motions[i];
			const boneName = motion.boneName;

			if (boneNameDictionary[boneName] === undefined) continue;
			boneNameDictionary[boneName] = true;

			motions[boneName] = motions[boneName] || [];
			motions[boneName].push(motion);

		}

		for (const key in motions) {

			const array = motions[key];

			array.sort(function (a: { frameNum: number; }, b: { frameNum: number; }) {

				return a.frameNum - b.frameNum;

			});

			const times = [];
			const positions = [];
			const rotations = [];
			const pInterpolations: any[] = [];
			const rInterpolations: any[] = [];

			const basePosition = mesh.skeleton.getBoneByName(key).position.toArray();

			for (let i = 0, il = array.length; i < il; i++) {

				const time = array[i].frameNum / 30;
				const position = array[i].position;
				const rotation = array[i].rotation;
				const interpolation = array[i].interpolation;

				times.push(time);

				for (let j = 0; j < 3; j++) positions.push(basePosition[j] + position[j]);
				for (let j = 0; j < 4; j++) rotations.push(rotation[j]);
				for (let j = 0; j < 3; j++) pushInterpolation(pInterpolations, interpolation, j);

				pushInterpolation(rInterpolations, interpolation, 3);

			}


		}

		mesh.animationBones = Object.entries(boneNameDictionary).filter(item => item[1]).map(item => item[0])

		return new AnimationClip('', - 1, tracks);

	}

	/**
	 * @param {Object} vmd - parsed VMD data
	 * @param {SkinnedMesh} mesh - tracks will be fitting to mesh
	 * @return {AnimationClip}
	 */
	buildMorphAnimation(vmd: { metadata: { morphCount: number; }; morphs: any[]; }, mesh: { morphTargetDictionary: any; }) {

		const tracks = [];

		const morphs: any = {};
		const morphTargetDictionary = mesh.morphTargetDictionary;

		for (let i = 0; i < vmd.metadata.morphCount; i++) {

			const morph = vmd.morphs[i];
			const morphName = morph.morphName;

			if (morphTargetDictionary[morphName] === undefined) continue;

			morphs[morphName] = morphs[morphName] || [];
			morphs[morphName].push(morph);

		}

		for (const key in morphs) {

			const array = morphs[key];

			array.sort(function (a: { frameNum: number; }, b: { frameNum: number; }) {

				return a.frameNum - b.frameNum;

			});

			const times = [];
			const values = [];

			for (let i = 0, il = array.length; i < il; i++) {

				times.push(array[i].frameNum / 30);
				values.push(array[i].weight);

			}

			tracks.push(new NumberKeyframeTrack('.morphTargetInfluences[' + morphTargetDictionary[key] + ']', times, values));

		}

		return new AnimationClip('', - 1, tracks);

	}

	/**
	 * @param {Object} vmd - parsed VMD data
	 * @return {AnimationClip}
	 */
	buildCameraAnimation(vmd: { cameras: any[]; }) {

		function pushVector3(array: any[], vec: Vector3 | Euler) {

			array.push(vec.x);
			array.push(vec.y);
			array.push(vec.z);

		}

		function pushQuaternion(array: any[], q: Quaternion) {

			array.push(q.x);
			array.push(q.y);
			array.push(q.z);
			array.push(q.w);

		}

		function pushInterpolation(array: any[], interpolation: number[], index: number) {

			array.push(interpolation[index * 4 + 0] / 127); // x1
			array.push(interpolation[index * 4 + 2] / 127); // y1
			array.push(interpolation[index * 4 + 1] / 127); // x2
			array.push(interpolation[index * 4 + 3] / 127); // y2

		}

		const cameras = vmd.cameras === undefined ? [] : vmd.cameras.slice() as any[];

		cameras.sort(function (a: { frameNum: number; }, b: { frameNum: number; }) {

			return a.frameNum - b.frameNum;

		});

		const times = [];
		const frameNums = [];
		const centers: any[] = [];
		const quaternions: any[] = [];
		const rotations: any[] = [];
		const positions: any = [];
		const fovs = [];
		const distances = [];

		const targetPosKeyFrames = [new TheaKeyframeTrack(), new TheaKeyframeTrack(), new TheaKeyframeTrack()];
		const rotationKeyFrames = [new TheaKeyframeTrack(), new TheaKeyframeTrack(), new TheaKeyframeTrack()];
		const fovKeyFrames = [new TheaKeyframeTrack()];
		const distanceKeyFrames = [new TheaKeyframeTrack()];

		const quaternion = new Quaternion();
		const rotation = new Euler();
		const position = new Vector3();
		const center = new Vector3();

		const cInterpolations: any[] = [[], [], []];
		const qInterpolations: any[] = [[], [], []];
		const dInterpolations: any[] = [[]];
		const fInterpolations: any[] = [[]];

		for (let i = 0, il = cameras.length; i < il; i++) {

			const motion = cameras[i];


			const pos = motion.position;
			const rot = motion.rotation;
			const distance = motion.distance;
			const fov = motion.fov;
			const interpolation = motion.interpolation;

			times.push(motion.frameNum);

			
			center.set(pos[0], pos[1], pos[2]);
			
			rotation.set(- rot[0], - rot[1], - rot[2]);
			quaternion.setFromEuler(rotation);

			pushVector3(centers, center);
			pushVector3(rotations, rotation);

			fovs.push(fov);
			distances.push(distance);

			for (let j = 0; j < 3; j++) {

				pushInterpolation(cInterpolations[j], interpolation, j);
				pushInterpolation(qInterpolations[j], interpolation, 3);
				
			}
			
			// distance interpolation
			pushInterpolation(dInterpolations[0], interpolation, 4);
			pushInterpolation(fInterpolations[0], interpolation, 5);


		}


		this._createTrack(times, centers, cInterpolations, targetPosKeyFrames)
		this._createTrack(times, rotations, qInterpolations, rotationKeyFrames)
		this._createTrack(times, fovs, fInterpolations, fovKeyFrames)
		this._createTrack(times, distances, dInterpolations, distanceKeyFrames)

		console.log(times[times.length - 1])

		return {
			targetPosKeyFrames,
			distanceKeyFrames,
			rotationKeyFrames,
			fovKeyFrames
		}

	}

	// private method

	_createTrack(frameNums: any[], values: any[], interpolations: any[], tracks: TheaKeyframeTrack[]) {

		// swap interpolations for Theatre
		const interpolationsSwaped = []

		for (const trackInterpolations of interpolations) {
			const lastItems = trackInterpolations.splice(0, 2)
			trackInterpolations.splice(trackInterpolations.length, 0, ...lastItems)
		}

		for (const [idx, _] of frameNums.entries()) {
			for (const trackInterpolations of interpolations) {
				interpolationsSwaped.push(trackInterpolations[idx * 4])
				interpolationsSwaped.push(trackInterpolations[idx * 4 + 1])
				interpolationsSwaped.push(trackInterpolations[idx * 4 + 2])
				interpolationsSwaped.push(trackInterpolations[idx * 4 + 3])
			}
		}

		interpolations = interpolationsSwaped

		/*
			 * optimizes here not to let KeyframeTrackPrototype optimize
			 * because KeyframeTrackPrototype optimizes times and values but
			 * doesn't optimize interpolations.
			 */
		if (frameNums.length > 2) {

			frameNums = frameNums.slice();
			values = values.slice();
			interpolations = interpolations.slice();

			const stride = values.length / frameNums.length;
			const interpolateStride = interpolations.length / frameNums.length;

			let index = 1;

			for (let aheadIndex = 2, endIndex = frameNums.length; aheadIndex < endIndex; aheadIndex++) {

				for (let i = 0; i < stride; i++) {

					if (values[index * stride + i] !== values[(index - 1) * stride + i] ||
						values[index * stride + i] !== values[aheadIndex * stride + i]) {

						index++;
						break;

					}

				}

				if (aheadIndex > index) {

					frameNums[index] = frameNums[aheadIndex];

					for (let i = 0; i < stride; i++) {

						values[index * stride + i] = values[aheadIndex * stride + i];

					}

					for (let i = 0; i < interpolateStride; i++) {

						interpolations[index * interpolateStride + i] = interpolations[aheadIndex * interpolateStride + i];

					}

				}

			}

			frameNums = frameNums.slice(0, index + 1);
		}

		const k = tracks.length
		for (const [idx, frameNum] of frameNums.entries()) {
			const time = frameNum / 30;
			let type: string
			if (frameNums[idx] + 1 == frameNums[idx + 1]) {
				type = "hold"
			} else {
				type = "bezier"
			}

			for (const [j, track] of tracks.entries()) {
				const offset = idx * k + j
				const interpolation = interpolations.slice(offset * 4, (offset + 1) * 4)
				track.keyframes.push(createKeyFrame(time, values[idx * k + j], interpolation, type))

			}
		}

	}

}

function createKeyFrame(time: number, value: number, interpolation: number[], type = "bezier") {
	return {
		id: nanoid(10),
		position: time,
		connectedRight: true,
		handles: interpolation,
		type,
		value
	}
}

export class TheaKeyframeTrack {
	keyframes: ReturnType<typeof createKeyFrame>[];
	id: string
	constructor() {
		this.keyframes = []
		this.id = null
	}
}

const tracksByObject = MMDState.historic.innerState.coreByProject.MMD.sheetsById["MMD UI"].sequence.tracksByObject
type CameraTrackId = keyof typeof tracksByObject.Camera.trackData

export function cameraToTracks(vmdBuffer: ArrayBufferLike) {
	const parser = new MMDParser.Parser()

	const vmd = parser.parseVmd(vmdBuffer, true)
	const animationBuilder = new TheatreTrackBuilder();
	const result = animationBuilder.buildCameraAnimation(vmd)

	result.rotationKeyFrames[0].id = "qqsgCZJ4Oq"
	result.rotationKeyFrames[1].id = "DEMBj3cJ4O"
	result.rotationKeyFrames[2].id = "q9e9PaHR76"
	result.fovKeyFrames[0].id = "PJ2eUTHffE"
	
	result.targetPosKeyFrames[0].id = "XN5bra4VoB"
	result.targetPosKeyFrames[1].id = "WggqUWPgWq"
	result.targetPosKeyFrames[2].id = "cwuGmVbOy7"
	result.distanceKeyFrames[0].id = "ZT23zFM1b9"

	MMDState.historic.innerState.coreByProject.MMD.sheetsById["MMD UI"].sequence.length = 220

	for (const [key, tracks] of Object.entries(result)) {
		for (const track of tracks) {
			tracksByObject.Camera.trackData[track.id as CameraTrackId].keyframes = track.keyframes
		}
	}
	return MMDState
}
