import GrantSolver from "@/app/modules/GrantSolver";
import { Quaternion, SkinnedMesh } from "three";
import { CCDIKSolver } from "three/examples/jsm/animation/CCDIKSolver.js";

function buildUpdatePMX(mesh: SkinnedMesh) {
    const grantSolver = new GrantSolver(mesh, mesh.geometry.userData.MMD.grants)
    const ikSolver = new CCDIKSolver(mesh, mesh.geometry.userData.MMD.iks)

    // Save rotation whose grant and IK are already applied
    // used by grant children
    const _grantResultMap = new Map();

    function updateOne(boneIndex: number) {

        const bones = mesh.skeleton.bones;
        const bonesData = mesh.geometry.userData.MMD.bones;
        const boneData = bonesData[boneIndex];
        const bone = bones[boneIndex];

        // Return if already updated by being referred as a grant parent.
        if (_grantResultMap.has(boneIndex)) return;

        const quaternion = getQuaternion();

        // Initialize grant result here to prevent infinite loop.
        // If it's referred before updating with actual result later
        // result without applyting IK or grant is gotten
        // but better than composing of infinite loop.
        _grantResultMap.set(boneIndex, quaternion.copy(bone.quaternion));

        // @TODO: Support global grant and grant position
        if (grantSolver && boneData.grant &&
            !boneData.grant.isLocal && boneData.grant.affectRotation) {

            const parentIndex = boneData.grant.parentIndex;
            const ratio = boneData.grant.ratio;

            if (!_grantResultMap.has(parentIndex)) {

                updateOne(parentIndex);

            }

            // console.log("grant bone:")
            // console.log(boneData.index)
            // console.log("parent:")
            // console.log(bonesData[parentIndex].index)
            grantSolver.addGrantRotation(bone, _grantResultMap.get(parentIndex), ratio);

        }

        if (ikSolver && boneData.ik) {

            // console.log("ik bone:")
            // console.log(boneData.index)
            // console.log(boneData.ik)
            // @TODO: Updating world matrices every time solving an IK bone is
            // costly. Optimize if possible.
            mesh.updateMatrixWorld(true);
            ikSolver.updateOne(boneData.ik);

            // No confident, but it seems the grant results with ik links should be updated?
            const links = boneData.ik.links;

            for (let i = 0, il = links.length; i < il; i++) {
                const link = links[i];
                if (link.enabled === false) continue;
                const linkIndex = link.index;
                if (_grantResultMap.has(linkIndex)) {
                    _grantResultMap.get(linkIndex).copy(bones[linkIndex].quaternion);
                }
            }
        }

        // Update with the actual result here
        quaternion.copy(bone.quaternion);

    }

    // Keep working quaternions for less GC
    const _quaternions: any[] = [];
    let _quaternionIndex = 0;

    function getQuaternion() {
        if (_quaternionIndex >= _quaternions.length) {
            _quaternions.push(new Quaternion());
        }
        return _quaternions[_quaternionIndex++];
    }

    const sortBoneDataArray = () => {
        const boneDataArray = mesh.geometry.userData.MMD.bones.slice()
        return boneDataArray.sort(function (a: { transformationClass: number; index: number; }, b: { transformationClass: number; index: number; }) {
            if (a.transformationClass !== b.transformationClass) {
                return a.transformationClass - b.transformationClass;
            } else {
                return a.index - b.index;
            }
        });
    }

    const sortedBonesData = sortBoneDataArray();

    return () => {
        _quaternionIndex = 0
        _grantResultMap.clear()

        for (let i = 0, il = sortedBonesData.length; i < il; i++) {
            updateOne(sortedBonesData[i].index)
        }

        mesh.updateMatrixWorld(true)
    }
}

export default buildUpdatePMX;