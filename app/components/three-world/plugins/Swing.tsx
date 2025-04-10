import useGlobalStore from "@/app/stores/useGlobalStore";
import { useFrame, useThree } from "@react-three/fiber";
import AmmoCls from "ammojs-typed";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import WithModel from "../ModelHelper/WithModel";

type MeshWithPhys = THREE.Mesh & {
    userData: {
        physicsBody?: AmmoCls.btRigidBody
    }
}

function Swing() {
    // Graphics variables
    const scene = useThree(state => state.scene);
    const isTransformControl = useGlobalStore(state => state.isTransformControlRef)
    const runtimeCharacter = useGlobalStore(state => state.runtimeCharacter)
    const character = useGlobalStore(state => state.character)

    // Physics variables
    const rigidBodiesRef = useRef<MeshWithPhys[]>([]);
    const margin = 0.05;
    const transformAux1Ref = useRef(new Ammo.btTransform());
    const ridgidPosBuf = useRef(new Ammo.btVector3());

    const armMovementRef = useRef(0);

    const readyRef = useRef(false)
    const hingeRef = useRef<AmmoCls.btHingeConstraint>(null);

    const physicsWorldRef = useRef<AmmoCls.btDiscreteDynamicsWorld>(null);
    const ballRef = useRef<THREE.Mesh>(null)

    // harmonic motion
    const maxPendulumAngleRef = useRef(0.25 * Math.PI)
    const directionRef = useRef(1)
    const isSetDirectionRef = useRef(true)
    
    const [grip, setGrip] = useState<THREE.Mesh>(null)
    //Ball
    const ballMass = 60;
    const ballRadius = 3;

    const pervTime = useRef(performance.now())

    useEffect(() => {
        if (!runtimeCharacter) return
        physicsWorldRef.current = runtimeCharacter.physics.world
        createObjects();
        initInput();
        readyRef.current = true
    }, [runtimeCharacter])

    function createObjects() {

        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();

        // Ball
        const ball = ballRef.current
        ball.castShadow = true;
        ball.receiveShadow = true;
        const ballShape = new Ammo.btSphereShape(ballRadius);
        ballShape.setMargin(margin);
        pos.set(20, 8, 0);
        quat.set(0, 0, 0, 1);
        const ballBody = createRigidBody(ball, ballShape, ballMass, pos, quat);
        ballBody.setGravity(new Ammo.btVector3(0, 0, 0))
        ballBody.setDamping(5000, 5000)

        // The base
        const basePos = new THREE.Vector3(0, 8, 3);
        const armLength = 15;
        const pylonHeight = 30;
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x606060 });
        pos.set(basePos.x - armLength, 0.1, basePos.z);
        quat.set(0, 0, 0, 1);
        const base = createParalellepiped(1, 0.2, 1, 0, pos, quat, baseMaterial);
        base.castShadow = true;
        base.receiveShadow = true;
        pos.set(basePos.x - armLength, 0.5 * pylonHeight, basePos.z);
        const pylon = createParalellepiped(0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial);
        pylon.castShadow = true;
        pylon.receiveShadow = true;
        pos.set(basePos.x - 0.5 * armLength, pylonHeight + 0.2, basePos.z);
        const arm = createParalellepiped(armLength + 0.4, 0.4, 0.4, 0, pos, quat, baseMaterial);
        arm.castShadow = true;
        arm.receiveShadow = true;

        //Swing
        const gripHeight = 20;

        const swing = createSwingShapes(gripHeight, pos, quat, baseMaterial)
        swing.castShadow = true;
        swing.receiveShadow = true;

        // Hinge constraint to move the arm
        const pivotA = new Ammo.btVector3(armLength * 0.5, 0, 0);
        const pivotB = new Ammo.btVector3(0, gripHeight * 0.5, 0);
        const axis = new Ammo.btVector3(1, 0, 0);
        const hinge = new Ammo.btHingeConstraint(arm.userData.physicsBody, swing.userData.physicsBody, pivotA, pivotB, axis, axis, true);
        physicsWorldRef.current.addConstraint(hinge, true);
        hingeRef.current = hinge

    }

    function createParalellepiped(sx: number, sy: number, sz: number, mass: number, pos: THREE.Vector3, quat: THREE.Quaternion, material: THREE.MeshStandardMaterial, parent?: THREE.Mesh) {

        const [geo, shape] = createShapes(sx, sy, sz)

        const threeObject = new THREE.Mesh(geo, material);
        shape.setMargin(margin);

        createRigidBody(threeObject, shape, mass, pos, quat, parent);

        return threeObject;

    }

    function createShapes(sx: number, sy: number, sz: number) {

        const threeObject = new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1);
        const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));

        return [threeObject, shape] as const;
    }

    function createSwingShapes(gripHeight: number, pos: THREE.Vector3, quat: THREE.Quaternion, material: THREE.MeshStandardMaterial, parent?: THREE.Mesh) {
        const gripThick = 0.2

        const mass = 200
        const sitLength = 6
        const sitWidth = 3

        const [threeGripA, ammoGripA] = createShapes(gripThick, gripHeight, gripThick)
        threeGripA.translate(-sitLength, 0, 0)
        // pos.set(-sitLength + indent, 0, 0);
        const [threeGripB, ammoGripB] = createShapes(gripThick, gripHeight, gripThick)
        // pos.set(-sitLength * 0.5 + indent * 0.5, -gripHeight * 0.5 - 0.2, 0);        
        const [threeSit, ammoSit] = createShapes(sitLength, 0.2, sitWidth)
        threeSit.translate(-sitLength * 0.5, -gripHeight * 0.5, 0)
        const geo = BufferGeometryUtils.mergeGeometries([threeGripA, threeGripB, threeSit])

        const ammoPos = ridgidPosBuf.current
        const transform = transformAux1Ref.current

        const compundShape = new Ammo.btCompoundShape()
        transform.setIdentity()
        ammoPos.setValue(-sitLength, 0, 0)
        transform.setOrigin(ammoPos)
        compundShape.addChildShape(transform, ammoGripA)
        ammoPos.setValue(0, 0, 0)
        transform.setOrigin(ammoPos)
        compundShape.addChildShape(transform, ammoGripB)
        ammoPos.setValue(-sitLength * 0.5, -gripHeight * 0.5, 0)
        transform.setOrigin(ammoPos)
        compundShape.addChildShape(transform, ammoSit)


        const threeObject = new THREE.Mesh(geo, material);
        compundShape.setMargin(margin);

        createRigidBody(threeObject, compundShape, mass, pos, quat, parent);

        setGrip(threeObject)
        useGlobalStore.setState({
            bindParentCb: () => {
                threeObject.add(character.skeleton.bones[0])
                character.skeleton.bones[0].position.x = -sitLength * 0.5 - 1
                character.skeleton.bones[0].position.y = -gripHeight - 1.0
                runtimeCharacter.physics.reset()
            }
        })

        return threeObject
    }

    function createRigidBody(threeObject: THREE.Mesh, physicsShape: AmmoCls.btCollisionShape, mass: number, pos: THREE.Vector3, quat: THREE.Quaternion, parent?: THREE.Mesh) {

        threeObject.position.copy(pos);
        threeObject.quaternion.copy(quat);

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        const motionState = new Ammo.btDefaultMotionState(transform);

        const localInertia = new Ammo.btVector3(0, 0, 0);
        physicsShape.calculateLocalInertia(mass, localInertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);

        threeObject.userData.physicsBody = body;

        if (parent) {
            parent.add(threeObject)
        } else {
            scene.add(threeObject);
        }

        if (mass > 0) {
            rigidBodiesRef.current.push(threeObject);

            // Disable deactivation
            body.setActivationState(4);
        }

        physicsWorldRef.current.addRigidBody(body);
        return body
    }

    function initInput() {

        window.addEventListener('keydown', function (event) {

            switch (event.keyCode) {

                // Q
                case 81:
                    armMovementRef.current = 1;
                    break;

                // A
                case 65:
                    armMovementRef.current = - 1;
                    break;

            }

        });

        window.addEventListener('keyup', function () {

            armMovementRef.current = 0;

        });

    }


    useFrame((_, delta) => {
        if (!readyRef.current || isTransformControl.current) return
        updatePhysics(delta);
    }, 0)

    function updatePhysics(delta: number) {
        // Hinge control
        if (armMovementRef.current == 0) {
            // simulate pendulum behavior

            if(grip) {
                const ratio = 3.10 / 1.84
                const vel = ratio * directionRef.current * maxPendulumAngleRef.current * Math.sin(Math.acos(grip?.rotation.x / maxPendulumAngleRef.current))
                if(vel) {
                    hingeRef.current.enableAngularMotor(true, vel, 10000);
                    isSetDirectionRef.current = false
                } else if(!isSetDirectionRef.current) {
                    directionRef.current *= -1
                    hingeRef.current.enableAngularMotor(false, 0, 0);
                    isSetDirectionRef.current = true;
                }
            } else {
                hingeRef.current.enableAngularMotor(false, 0, 0);
            }
        } else {
            hingeRef.current.enableAngularMotor(true, 2 * armMovementRef.current, 10000);
            maxPendulumAngleRef.current = grip?.rotation.x
        }

        // Update rigid bodies
        for (const objThree of rigidBodiesRef.current) {
            const objPhys = objThree.userData.physicsBody;
            const ms = objPhys.getMotionState();
            if (ms) {
                const transformAux1 = transformAux1Ref.current
                ms.getWorldTransform(transformAux1);
                const p = transformAux1.getOrigin();
                const q = transformAux1.getRotation();
                objThree.position.set(p.x(), p.y(), p.z());
                objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
            }

        }

    }

    return (
        <>
            <mesh
                name="ball"
                ref={ballRef}
                onClick={(e) => {
                    e.stopPropagation()
                    useGlobalStore.setState(({ selectedName: "ball" }))
                }}
                onPointerMissed={(e: Event) => {
                    e.type === 'click' && useGlobalStore.setState({ selectedName: null })

                }}
            >
                <sphereGeometry args={[ballRadius, 20, 20]} ></sphereGeometry>
                <meshPhongMaterial color={0x202020}></meshPhongMaterial>
            </mesh>
            {
                grip &&
                <primitive name="grip" object={grip}
                    onClick={(e: Event) => {
                        e.stopPropagation()
                        useGlobalStore.setState(({ selectedName: "grip" }))
                    }}
                    onPointerMissed={(e: Event) => {
                        e.type === 'click' && useGlobalStore.setState({ selectedName: null })

                    }}>
                </primitive>
            }
        </>
    );
}

export default WithModel(Swing, "character");