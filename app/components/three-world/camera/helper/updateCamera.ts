import { PerspectiveCamera } from "three";
import { OrbitControls } from "three-stdlib";

function updateCamera(camera: PerspectiveCamera, controls: OrbitControls) {
    const target = camera.getObjectByName("target")
    if(!target) return
    controls.target.copy(target.position)
    camera.position.set(0, 0, - target.userData.distance);
    camera.position.applyQuaternion(camera.quaternion);
    camera.position.add(target.position);

    camera.updateProjectionMatrix();
}

export default updateCamera;