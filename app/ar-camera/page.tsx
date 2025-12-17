"use client";

import { useXR, useXRHitTest } from "@react-three/xr";
import { useEffect, useRef } from "react";
import { Matrix4, Mesh } from "three";
import { useGLTF } from '@react-three/drei'
import useWebRTC from "./useWebrtc";
import { useFrame, useThree } from "@react-three/fiber";

const matrixHelper = new Matrix4()

function ObjectPlacement() {
  const previewRef = useRef<Mesh>(null)
  const targetRef = useRef<Mesh>(null)

  const domOverlayRoot = useXR(state => state.domOverlayRoot)
  const reticle = useGLTF('./gltf/reticle.gltf')
  const target = useGLTF('./gltf/target.gltf')
  const dataChannel = useWebRTC()
  const camera = useThree(state => state.camera)

  useXRHitTest(
    (results, getWorldMatrix) => {
      if (results.length === 0) return

      getWorldMatrix(matrixHelper, results[0])
      previewRef.current.matrixWorld.copy(matrixHelper)
    },

    'viewer',
    'plane'
  )

  const placeObject = async () => {
    targetRef.current?.matrixWorld.copy(previewRef.current!.matrixWorld)
  }

  useEffect(() => {
    domOverlayRoot?.addEventListener('click', placeObject)
    return () => {
      domOverlayRoot?.removeEventListener('click', placeObject)
    }
  }, [domOverlayRoot])

  useFrame(() => {
    if(!targetRef.current) return;
    dataChannel?.send(JSON.stringify(targetRef.current?.modelViewMatrix.invert().elements))
  })

  return (
    <>
      {/* Preview object at hit test position */}
      <mesh
        matrixWorldAutoUpdate={false}
        ref={previewRef}
        geometry={(reticle.nodes.Torus as Mesh).geometry}
        material={reticle.materials["Material.001"]}
        material-transparent={true}
        material-opacity={0.7}
      >
      </mesh>

      {/* Target object */}
      <mesh
        matrixWorldAutoUpdate={false}
        ref={targetRef}
        geometry={(target.nodes.Torus as Mesh).geometry}
        material={target.materials["Material.001"]}
        material-transparent={true}
        material-opacity={0.7}
      >
      </mesh>
    </>
  )
}

export default ObjectPlacement;