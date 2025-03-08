import { PerspectiveCamera } from "three";

function updateCamera(camera: PerspectiveCamera) {
    const target = camera.getObjectByName("target")
    if(!target) return
    camera.position.set(0, 0, - target.userData.distance);
    camera.position.applyQuaternion(camera.quaternion);
    camera.position.add(target.position);

    camera.up.set(0, 1, 0);
    camera.up.applyQuaternion(camera.quaternion);
    camera.lookAt(target.position);

    camera.updateProjectionMatrix();
}

export default updateCamera;