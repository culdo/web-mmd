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
			array.push(interpolation[index * 4 + 1] / 127); // x2
			array.push(interpolation[index * 4 + 2] / 127); // y1
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

		const targetPosKeyFrames = {
			x: new TheaKeyframeTrack(),
			y: new TheaKeyframeTrack(),
			z: new TheaKeyframeTrack(),
		};
		const positionKeyFrames = {
			x: new TheaKeyframeTrack(),
			y: new TheaKeyframeTrack(),
			z: new TheaKeyframeTrack(),
		};
		const rotationKeyFrames = {
			x: new TheaKeyframeTrack(),
			y: new TheaKeyframeTrack(),
			z: new TheaKeyframeTrack(),
		};
		const fovKeyFrames = new TheaKeyframeTrack();


		const quaternion = new Quaternion();
		const rotation = new Euler();
		const position = new Vector3();
		const center = new Vector3();

		const cInterpolations: any[] = [];
		const qInterpolations: any[] = [];
		const pInterpolations: any[] = [];
		const fInterpolations: any[] = [];

		for (let i = 0, il = cameras.length; i < il; i++) {

			const motion = cameras[i];

			
			const pos = motion.position;
			const rot = motion.rotation;
			const distance = motion.distance;
			const fov = motion.fov;
			const interpolation = motion.interpolation;

			times.push(motion.frameNum);

			position.set(0, 0, - distance);

			center.set(pos[0], pos[1], pos[2]);

			rotation.set(- rot[0], - rot[1], - rot[2]);
			quaternion.setFromEuler(rotation);

			position.applyQuaternion(quaternion);
			position.add(center);

			pushVector3(centers, center);
			pushQuaternion(quaternions, quaternion);
			pushVector3(positions, position);
			pushVector3(rotations, rotation);

			fovs.push(fov);

			for (let j = 0; j < 3; j++) {

				pushInterpolation(cInterpolations, interpolation, j);

			}

			pushInterpolation(qInterpolations, interpolation, 3);

			pushInterpolation(pInterpolations, interpolation, 4);

			pushInterpolation(fInterpolations, interpolation, 5);

		}

		const idxMap = ["x", "y", "z", ] as const

		type OnBuild = (idx: number, time: number, values: number[], interpolations: number[], type?: string) => void

		const swapInterpolation = (interpolation: number[]) => {
			const temp = interpolation[1]
			interpolation[1] = interpolation[2]
			interpolation[2] = temp
		}
		// centers
		const onCbuild: OnBuild = (idx, time, values, interpolations, type) => {
			for (let j = 0; j < 3; j++) {
				const prop = idxMap[j]
				const interpolation = interpolations.slice(idx * 12 + (j * 4), idx * 12 + ((j + 1) * 4))
				swapInterpolation(interpolation)
				targetPosKeyFrames[prop].keyframes.push(createKeyFrame(time, values[idx * 3 + j], interpolation, type))
			}
		}
		this._createTrack(times, centers, cInterpolations, onCbuild)
		
		// positions
		const onPbuild: OnBuild = (idx, time, values, interpolations, type) => {
			for (let j = 0; j < 3; j++) {
				const prop = idxMap[j]
				const interpolation = interpolations.slice(idx * 4, (idx + 1) * 4)
				swapInterpolation(interpolation)
				positionKeyFrames[prop].keyframes.push(createKeyFrame(time, values[idx * 3 + j], interpolation, type))
			}
		}
		this._createTrack(times, positions, pInterpolations, onPbuild)
		
		// rotations
		const onRbuild: OnBuild = (idx, time, values, interpolations, type) => {
			for (let j = 0; j < 3; j++) {
				const prop = idxMap[j]
				const interpolation = interpolations.slice(idx * 4, (idx + 1) * 4)
				swapInterpolation(interpolation)
				rotationKeyFrames[prop].keyframes.push(createKeyFrame(time, values[idx * 3 + j], interpolation, type))
			}
		}
		this._createTrack(times, rotations, qInterpolations, onRbuild)
		
		// fovs
		const onFbuild: OnBuild = (idx, time, values, interpolations, type) => {
			const interpolation = interpolations.slice(idx * 4, (idx + 1) * 4)
			swapInterpolation(interpolation)
			fovKeyFrames.keyframes.push(createKeyFrame(time, values[idx], interpolation, type))
		}
		this._createTrack(times, fovs, fInterpolations, onFbuild)
			
		console.log(times[times.length - 1])

		return {
			targetPosKeyFrames,
			positionKeyFrames,
			rotationKeyFrames,
			fovKeyFrames
		}

	}

	// private method

	_createTrack(frameNums: any[], values: any[], interpolations: any[], onBuild: Function) {

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

		}

		for (const [idx, frameNum] of frameNums.entries()) {
			const time = frameNum / 30;
			let type: string
			if(frameNums[idx] + 1 == frameNums[idx+1]) {
				type = "hold"
			} else {
				type = "bezier"
			}
			onBuild(idx, time, values, interpolations, type)
		}

	}

}

function createKeyFrame(frameNum: number, value: number, interpolation: number[], type="bezier") {
	return {
		id: nanoid(10),
		position: frameNum,
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

export function cameraToTracks(vmdBuffer: ArrayBufferLike) {
	const parser = new MMDParser.Parser()

	const vmd = parser.parseVmd(vmdBuffer, true)
	const animationBuilder = new TheatreTrackBuilder();
	return animationBuilder.buildCameraAnimation(vmd)
}
