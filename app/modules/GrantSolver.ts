import { Quaternion } from "three";

const _q = new Quaternion();

/**
 * Solver for Grant (Fuyo in Japanese. I just google translated because
 * Fuyo may be MMD specific term and may not be common word in 3D CG terms.)
 * Grant propagates a bone's transform to other bones transforms even if
 * they are not children.
 * @param {THREE.SkinnedMesh} mesh
 * @param {Array<Object>} grants
 */
class GrantSolver {
    mesh: any;
    grants: never[];

    constructor(mesh: any, grants: any = []) {

        this.mesh = mesh;
        this.grants = grants;

    }

    /**
     * Solve all the grant bones
     * @return {GrantSolver}
     */
    update(): GrantSolver {

        const grants = this.grants;

        for (let i = 0, il = grants.length; i < il; i++) {

            this.updateOne(grants[i]);

        }

        return this;

    }

    /**
     * Solve a grant bone
     * @param {Object} grant - grant parameter
     * @return {GrantSolver}
     */
    updateOne(grant: any): GrantSolver {

        const bones = this.mesh.skeleton.bones;
        const bone = bones[grant.index];
        const parentBone = bones[grant.parentIndex];

        if (grant.isLocal) {

            // TODO: implement
            if (grant.affectPosition) {

            }

            // TODO: implement
            if (grant.affectRotation) {

            }

        } else {

            // TODO: implement
            if (grant.affectPosition) {

            }

            if (grant.affectRotation) {

                this.addGrantRotation(bone, parentBone.quaternion, grant.ratio);

            }

        }

        return this;

    }

    addGrantRotation(bone: { quaternion: { multiply: (arg0: Quaternion) => void; }; }, q: Quaternion, ratio: number) {

        _q.set(0, 0, 0, 1);
        _q.slerp(q, ratio);
        bone.quaternion.multiply(_q);

        return this;

    }

}

export default GrantSolver;