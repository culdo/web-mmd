import { useModel } from "./ModelContext";
import { useEffect, useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import buildUpdatePMX from "./buildUpdatePMX";

function Pose(vpd: any, afterCb: Function) {
    const mesh = useModel()

    const updatePmx = useMemo(() => buildUpdatePMX(mesh), [mesh])
    useEffect(() => {
        mesh.pose();

        const bones = mesh.skeleton.bones;
        const boneParams = vpd.bones;

        const boneNameDictionary: Record<string, number> = {};

        for (let i = 0, il = bones.length; i < il; i++) {

            boneNameDictionary[bones[i].name] = i;

        }

        const vector = new Vector3();
        const quaternion = new Quaternion();

        for (let i = 0, il = boneParams.length; i < il; i++) {

            const boneParam = boneParams[i];
            const boneIndex = boneNameDictionary[boneParam.name];

            if (boneIndex === undefined) continue;

            const bone = bones[boneIndex];
            bone.position.add(vector.fromArray(boneParam.translation));
            bone.quaternion.multiply(quaternion.fromArray(boneParam.quaternion));

        }

        mesh.updateMatrixWorld(true);
        updatePmx()

        if(afterCb) afterCb()
    }, [mesh])
    return <></>
}

export default Pose;