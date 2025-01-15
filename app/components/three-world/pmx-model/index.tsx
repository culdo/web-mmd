import { createRef, ForwardedRef, forwardRef, MutableRefObject, use, useEffect, useMemo, useRef, useState } from "react"
import WithSuspense from "../../suspense"
import { Bone, BufferGeometry, Material, SkinnedMesh } from "three"
import { MMDLoader } from "@/app/modules/MMDLoader"
import useGlobalStore from "@/app/stores/useGlobalStore"
import { onProgress } from "@/app/utils/base"
import path from "path"
import * as THREE from 'three';

type PMXModelProps = {
    url: string,
    modelName: string,
    modelTextures: Record<string, string>,
    enableSdef: boolean,
    enablePBR: boolean,
    children?: JSX.Element | JSX.Element[],
    onCreate?: (mesh: SkinnedMesh) => void,
    onCreatePromise?: (promise: Promise<SkinnedMesh>) => void
}

function PMXModel({ url, modelName, modelTextures, enableSdef = false, enablePBR = true, children, onCreate, onCreatePromise, ...props }: PMXModelProps) {

    const loader = useGlobalStore(state => state.loader)
    const [initProps, setProps] = useState<Awaited<ReturnType<MMDLoader["loadAsync"]>>>()

    const afterCreate = useMemo(() => {
        const params = {
            enableSdef,
            enablePBR
        }
        if (url.startsWith("data:")) {
            Object.assign(params, {
                modelExtension: path.extname(modelName).slice(1),
                modelTextures: modelTextures
            });
        }

        let resolve: (mesh: THREE.SkinnedMesh) => void;
        onCreatePromise?.(new Promise(res => resolve = res))

        const init = async () => {
            const initProps = await loader
                .setModelParams(params)
                .loadAsync(url, onProgress);
            setProps(initProps)
        }
        init()
        return (mesh: THREE.SkinnedMesh) => {
            onCreate?.(mesh)
            resolve?.(mesh)
        }
    }, [url, modelTextures, enableSdef, enablePBR])

    const [mesh, setMesh] = useState<SkinnedMesh>()
    useEffect(() => {
        if (!mesh) return
        const { rootBones } = initProps
        for (const root of rootBones) {
            mesh.add(root)
        }
        afterCreate(mesh)
    }, [mesh])

    if (!initProps) return
    const { geometry, material, skeleton } = initProps
    return (
        <skinnedMesh
            args={[geometry, material]}
            ref={(mesh) => {
                setMesh(mesh);
            }}
            skeleton={skeleton}
            {...props}>
            {children}
        </skinnedMesh>
    )
}

export default WithSuspense(PMXModel);
