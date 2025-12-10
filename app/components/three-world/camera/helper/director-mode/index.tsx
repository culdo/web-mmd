import { createContext, useContext, useEffect, useRef, useState } from "react";
import Following from "./Following";
import BeatCircle from "./BeatCircle";
import useGlobalStore from "@/app/stores/useGlobalStore";
import { PerspectiveCamera, Quaternion, Spherical, Vector2, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import WithModel from "../../../model/helper/WithModel";
import { useModel } from "../../../model/helper/ModelContext";

export const DjContext = createContext<{ showBeat: boolean, deltaSpherical: Spherical }>(null);
export const useDj = () => useContext(DjContext)

const beatsMap: { text: string, theta: number, phi: number }[] = [
    { text: "q", theta: -60, phi: -30 },
    { text: "w", theta: 0, phi: -30 },
    { text: "e", theta: 60, phi: -30 },
    { text: "a", theta: -60, phi: 0 },
    { text: "s", theta: 0, phi: 0 },
    { text: "d", theta: 60, phi: 0 },
    { text: "z", theta: -60, phi: 30 },
    { text: "x", theta: 0, phi: 30 },
    { text: "c", theta: 60, phi: 30 }
]
const _twoPI = 2 * Math.PI

enum MOUSE {
    LEFT,
    MIDDLE,
    RIGHT,
    ROTATE,
    DOLLY,
    PAN,
}

enum MODE {
    NONE,
    SET,
}

function DirectorMode() {
    const [showBeat, setShowBeat] = useState(false)

    const { domElement } = useThree(state => state.gl)
    const camera = useThree(state => state.camera) as PerspectiveCamera

    const cameraPose = useGlobalStore(state => state.cameraOffset)
    const player = useGlobalStore(state => state.player)
    const moveDelta = useRef(new Vector2()).current
    const deltaSpherical = useRef(new Spherical(30)).current
    const spherical = useRef(new Spherical()).current
    const _v = useRef(new Vector3()).current
    const mouseModeRef = useRef<MOUSE>()

    const model = useModel()
    const centerPos = useRef(new Vector3()).current
    const centerRot = useRef(new Quaternion()).current
    const rotVec = useRef(new Vector3(0, 0, 1)).current
    const rotSpherical = useRef(new Spherical()).current
    const rightHandPos = useRef(new Vector3()).current
    const leftHandPos = useRef(new Vector3()).current
    const handPosTemp = useRef(new Vector3()).current
    const trackBoneRef = useRef("上半身")
    const rightHandTarget = useRef(new Vector3()).current
    const leftHandTarget = useRef(new Vector3()).current
    const targetRot = useRef(new Quaternion()).current

    const modeRef = useRef(MODE.SET)
    const trackAngleRef = useRef(false)
    const trackDistanceRef = useRef(true)
    const trackUpRef = useRef(true)
    const trackTargetRef = useRef(true)


    useEffect(() => {
        const onPlay = () => {
            document.getElementById("rawPlayer").style.display = "none"
            document.body.style.cursor = "none"
        }

        const onPause = () => {
            document.getElementById("rawPlayer").style.display = "block"
            document.body.style.cursor = "default"
            mouseModeRef.current = null
            document.exitPointerLock()
        }

        const checkTrackings = (e: KeyboardEvent) => {
            if (e.key == "1") {
                trackAngleRef.current = !trackAngleRef.current
            }
            if (e.key == "2") {
                trackTargetRef.current = !trackTargetRef.current
            }
            if (e.key == "3") {
                trackDistanceRef.current = !trackDistanceRef.current
            }
            if (e.key == "4") {
                trackUpRef.current = !trackUpRef.current
            }

            if (!trackAngleRef.current || modeRef.current == MODE.NONE) {
                centerRot.set(0, 0, 0, 1)
            }
            if (!trackTargetRef.current || modeRef.current == MODE.NONE) {
                cameraPose.target.set(0, 0, 0)
            }
            if (!trackUpRef.current || modeRef.current == MODE.NONE) {
                cameraPose.up.set(0, 1, 0)
            }
        }

        const onKeydown = (e: KeyboardEvent) => {
            e.preventDefault()

            const isSet = modeRef.current == MODE.SET

            if (e.key == "Tab") {
                modeRef.current = isSet ? MODE.NONE : MODE.SET
            }
            if (e.ctrlKey && e.key == "q") {
                trackBoneRef.current = "上半身"
            }
            if (e.ctrlKey && e.key == "w") {
                trackBoneRef.current = "頭"
            }
            checkTrackings(e)
        }

        const onKeyup = (e: KeyboardEvent) => {
            if (modeRef.current == MODE.SET) return
            checkTrackings(e)
        }

        const onMousedown = async (e: MouseEvent) => {
            await domElement.requestPointerLock()
            switch (e.button) {
                case MOUSE.LEFT:
                    mouseModeRef.current = MOUSE.ROTATE
                    break;
                case MOUSE.MIDDLE:
                    break;
                case MOUSE.RIGHT:
                    mouseModeRef.current = MOUSE.PAN
                    break;
            }
        }

        const onMouseup = (e: MouseEvent) => {
            mouseModeRef.current = null
            document.exitPointerLock()
        }

        const onMousemove = (e: MouseEvent) => {
            cameraPose.dampingFactor = 5.0
            if (mouseModeRef.current === null) return

            moveDelta.set(e.movementX, e.movementY)

            switch (mouseModeRef.current) {
                case MOUSE.ROTATE:
                    deltaSpherical.theta -= _twoPI * moveDelta.x / domElement.clientHeight
                    deltaSpherical.phi -= _twoPI * moveDelta.y / domElement.clientHeight
                    break
                case MOUSE.PAN:
                    // half of the fov is center to top of screen
                    const targetDistance = 4 * cameraPose.position.length() * Math.tan((camera.fov / 2) * Math.PI / 180.0);

                    // we use only clientHeight here so aspect ratio does not distort speed
                    const leftDistance = moveDelta.x * targetDistance / domElement.clientHeight
                    _v.setFromMatrixColumn(camera.matrix, 0); // get X column of objectMatrix
                    _v.multiplyScalar(- leftDistance);
                    cameraPose.target.add(_v);

                    const upDistance = moveDelta.y * targetDistance / domElement.clientHeight
                    _v.setFromMatrixColumn(camera.matrix, 1);
                    _v.multiplyScalar(upDistance);
                    cameraPose.target.add(_v);
                    break
            }

        }

        const onWheel = (e: WheelEvent) => {
            e.stopPropagation()
            cameraPose.dampingFactor = 5.0
            deltaSpherical.radius += (e.deltaY + e.deltaX) * 0.5
        }

        const onContextmenu = (e: Event) => {
            e.preventDefault()
        }

        player.addEventListener("play", onPlay)
        player.addEventListener("pause", onPause)
        document.addEventListener("keydown", onKeydown)
        document.addEventListener("keyup", onKeyup)
        domElement.addEventListener("mousemove", onMousemove)
        domElement.addEventListener("mousedown", onMousedown)
        domElement.addEventListener("mouseup", onMouseup)
        domElement.addEventListener("wheel", onWheel)
        domElement.addEventListener("contextmenu", onContextmenu)
        return () => {
            player.removeEventListener("play", onPlay)
            player.removeEventListener("pause", onPause)
            document.removeEventListener("keydown", onKeydown)
            document.removeEventListener("keyup", onKeyup)
            domElement.removeEventListener("mousemove", onMousemove)
            domElement.removeEventListener("mousedown", onMousedown)
            domElement.removeEventListener("mouseup", onMouseup)
            domElement.removeEventListener("wheel", onWheel)
            domElement.removeEventListener("contextmenu", onContextmenu)
        }
    }, [])

    useFrame(() => {
        let handsDistantce = 0.0

        if (modeRef.current != MODE.NONE) {
            if (trackDistanceRef.current) {
                model.skeleton.getBoneByName("上半身").getWorldPosition(centerPos)
                model.skeleton.getBoneByName("右手先").getWorldPosition(rightHandPos)
                model.skeleton.getBoneByName("左手先").getWorldPosition(leftHandPos)
                const rightHandLength = handPosTemp.subVectors(rightHandPos, centerPos).length()
                const leftHandLength = handPosTemp.subVectors(leftHandPos, centerPos).length()
                handsDistantce = (rightHandLength + leftHandLength) * 2 - 20.0
            }
            if (trackAngleRef.current) {
                model.skeleton.getBoneByName(trackBoneRef.current).getWorldQuaternion(centerRot)
            }
            if (trackTargetRef.current) {
                model.skeleton.getBoneByName("右手先").getWorldPosition(rightHandTarget)
                model.skeleton.getBoneByName("左手先").getWorldPosition(leftHandTarget)
                rightHandTarget.sub(cameraPose.center)
                leftHandTarget.sub(cameraPose.center)
                cameraPose.target.addVectors(rightHandTarget, leftHandTarget).multiplyScalar(0.5)
                cameraPose.target.y += 2.0
            }
            if (trackUpRef.current) {
                cameraPose.up.set(0, 1, 0).applyQuaternion(model.skeleton.getBoneByName(trackBoneRef.current).getWorldQuaternion(targetRot))
                cameraPose.up.z = 0
            }
        }

        spherical.setFromVector3(cameraPose.position)

        const radius = handsDistantce + deltaSpherical.radius
        if (radius > 0) {
            spherical.radius = radius
        }

        rotVec.set(0, 0, 1).applyQuaternion(centerRot)
        rotSpherical.setFromVector3(rotVec)

        spherical.theta = rotSpherical.theta + deltaSpherical.theta
        spherical.phi = rotSpherical.phi + deltaSpherical.phi

        cameraPose.position.setFromSpherical(spherical)
    })

    return (
        <>
            <DjContext.Provider value={{ showBeat, deltaSpherical }}>
                {
                    beatsMap.map(b => <BeatCircle key={b.text} text={b.text} theta={b.theta} phi={b.phi}></BeatCircle>)
                }
            </DjContext.Provider>
            <Following></Following>
        </>
    );
}

export default WithModel(DirectorMode);