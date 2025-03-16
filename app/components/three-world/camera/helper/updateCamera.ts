import { PerspectiveCamera } from "three";

function updateCamera(camera: PerspectiveCamera) {
    const target = camera.userData["target"]
    if(!target) return
    camera.position.set(0, 0, - target.distance);
    camera.position.applyQuaternion(camera.quaternion);
    camera.position.add(target.position);

    camera.updateProjectionMatrix();
}

export default updateCamera;