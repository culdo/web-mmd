import { useEffect, useState } from "react"
import { Skeleton, SkinnedMesh } from "three"
import { initBones, MMDLoader } from "@/app/modules/MMDLoader"
import useGlobalStore from "@/app/stores/useGlobalStore"
import { onProgress } from "@/app/utils/base"
import { SkinnedMeshProps, useThree } from "@react-three/fiber"

type PMXModelProps = {
    url: string,
    modelTextures: Record<string, string>,
    enableSdef: boolean,
    enablePBR: boolean,
    children?: JSX.Element | JSX.Element[],
    onCreate?: (mesh: SkinnedMesh) => void,
    onCreatePromise?: (promise: Promise<SkinnedMesh>) => void
    onDispose?: () => void
} & Partial<SkinnedMeshProps>

function PMXModel({ url, modelTextures, enableSdef = false, enablePBR = true, children, onCreate, onCreatePromise, onDispose, ...props }: PMXModelProps) {

    const loader = useGlobalStore(state => state.loader)
    const [initProps, setProps] = useState<Awaited<ReturnType<MMDLoader["loadAsync"]>>>()
    const [resolve, setResolve] = useState<(mesh:SkinnedMesh)=>void>()
    const camera = useThree(state => state.camera)

    useEffect(() => {
        const params = {
            enableSdef,
            enablePBR
        }
        if (url.startsWith("data:")) {
            Object.assign(params, {
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

        if(onDispose) 
            return onDispose
    }, [url, modelTextures, enableSdef, enablePBR, camera])

    const [mesh, setMesh] = useState<SkinnedMesh>()
    useEffect(() => {
        if (!mesh) return
        const [bones, rootBones] = initBones(geometry)
		for (const root of rootBones) {
			mesh.add(root)
		}
		const skeleton = new Skeleton(bones);
		mesh.bind(skeleton);
        onCreate?.(mesh)
        resolve?.(mesh)
    }, [mesh])

    if (!initProps) return

    const { data, geometry, material } = initProps
    return (
        <skinnedMesh
            name={data.metadata.modelName}
            args={[geometry, material]}
            ref={mesh => mesh && setMesh(mesh)}
            {...props}>
            {children}
        </skinnedMesh>
    )
}

export default PMXModel;
