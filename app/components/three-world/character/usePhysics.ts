import useGlobalStore from "@/app/stores/useGlobalStore";
import { RootState, useFrame } from "@react-three/fiber";
import { use, useMemo } from "react";
import { MMDPhysics } from "three/examples/jsm/animation/MMDPhysics.js";

function usePhysics() {
    const mesh = use(useGlobalStore(state => state.characterPromise))
    const playDeltaRef = useGlobalStore(state => state.playDeltaRef)
    const isMotionUpdating = useGlobalStore(state => state.isMotionUpdating)
    const onUpdate = useMemo(() => {

        const physics = new MMDPhysics(
            mesh,
            mesh.geometry.userData.MMD.rigidBodies,
            mesh.geometry.userData.MMD.constraints,
            {
                unitStep: 1 / 60,
                maxStepNum: 1,
            }
        );

        const zeroVector = new Ammo.btVector3()

        const optimizeIK = (physicsEnabled: boolean) => {
            const iks = mesh.geometry.userData.MMD.iks;
            const bones = mesh.geometry.userData.MMD.bones;
            for (let i = 0, il = iks.length; i < il; i++) {
                const ik = iks[i];
                const links = ik.links;
                for (let j = 0, jl = links.length; j < jl; j++) {
                    const link = links[j];
                    if (physicsEnabled === true) {
                        // disable IK of the bone the corresponding rigidBody type of which is 1 or 2
                        // because its rotation will be overriden by physics
                        link.enabled = bones[link.index].rigidBodyType > 0 ? false : true;
                    } else {
                        link.enabled = true;
                    }
                }
            }
        }

        const reset = () => {
            physics.reset();
            for(const rigidBody of physics.bodies as any[]) {
                rigidBody.body.clearForces()
                rigidBody.body.setLinearVelocity(zeroVector)
                rigidBody.body.setAngularVelocity(zeroVector)
            }
        }

        physics.warmup(60);
        optimizeIK(true);
        reset();

        return (_: RootState, delta: number) => {
            // reset physic when time seeking
			if (Math.abs(playDeltaRef.current) > 1.0) {
				reset();
			}
			physics.update(isMotionUpdating() ? playDeltaRef.current: delta);
        }

    }, [mesh])
    // Physics need to be updated after the motion updating to make reset work
    // So the priority set to 2
    useFrame(onUpdate, 2)
}

export default usePhysics;