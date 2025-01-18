import { useEffect, useState } from "react"
import { SkinnedMesh } from "three"
import { MMDLoader } from "@/app/modules/MMDLoader"
import useGlobalStore from "@/app/stores/useGlobalStore"
import { onProgress } from "@/app/utils/base"
import path from "path"
import { SkinnedMeshProps } from "@react-three/fiber"

type PMXModelProps = {
    url: string,
    modelName: string,
    modelTextures: Record<string, string>,
    enableSdef: boolean,
    enablePBR: boolean,
    children?: JSX.Element | JSX.Element[],
    onCreate?: (mesh: SkinnedMesh) => void,
    onCreatePromise?: (promise: Promise<SkinnedMesh>) => void
} & Partial<SkinnedMeshProps>

function PMXModel({ url, modelName, modelTextures, enableSdef = false, enablePBR = true, children, onCreate, onCreatePromise, ...props }: PMXModelProps) {

    const loader = useGlobalStore(state => state.loader)
    const [initProps, setProps] = useState<Awaited<ReturnType<MMDLoader["loadAsync"]>>>()

    const [resolve, setResolve] = useState<(mesh:SkinnedMesh)=>void>()
    useEffect(() => {
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

        onCreatePromise?.(new Promise(res => setResolve(() => res)))

        const init = async () => {
            const initProps = await loader
                .setModelParams(params)
                .loadAsync(url, onProgress);
            setProps(initProps)
        }
        init()
    }, [url, modelTextures, enableSdef, enablePBR])

    const [mesh, setMesh] = useState<SkinnedMesh>()
    useEffect(() => {
        if (!mesh) return
        onCreate?.(mesh)
        resolve?.(mesh)
    }, [mesh])

    if (!initProps) return

    const { geometry, material, skeleton, rootBones } = initProps
    return (
        <skinnedMesh
            args={[geometry, material]}
            ref={mesh => setMesh(mesh)}
            skeleton={skeleton}
            {...props}>
            {children}
            {
                rootBones.map(rootBone =>
                    <primitive key={rootBone.uuid} object={rootBone}></primitive>
                )
            }
        </skinnedMesh>
    )
}

export default PMXModel;
