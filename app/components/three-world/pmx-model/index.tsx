import { ReactNode, useEffect, useRef, useState } from "react"
import { Skeleton, SkinnedMesh } from "three"
import { initBones, MMDLoader } from "@/app/modules/MMDLoader"
import useGlobalStore from "@/app/stores/useGlobalStore"
import { onProgress } from "@/app/utils/base"
import { SkinnedMeshProps, useThree } from "@react-three/fiber"
import { ModelContext } from "../ModelHelper/ModelContext"

type PMXModelProps = {
    url: string,
    modelTextures: Record<string, string>,
    enableSdef: boolean,
    enablePBR: boolean,
    children?: ReactNode,
    onCreate?: (mesh: SkinnedMesh) => void,
    onDispose?: () => void
} & Partial<SkinnedMeshProps>

function PMXModel({ url, modelTextures, enableSdef = false, enablePBR = true, children, onCreate, onDispose, ...props }: PMXModelProps) {

    const loader = useGlobalStore(state => state.loader)
    const [initProps, setProps] = useState<Awaited<ReturnType<MMDLoader["loadAsync"]>>>()

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

        const init = async () => {
            const initProps = await loader
                .setModelParams(params)
                .loadAsync(url, onProgress);
            setProps(initProps)
        }
        init()

        return () => {
            setInited(false)
            onDispose?.()
        }
    }, [url, modelTextures, enableSdef, enablePBR])

    const [mesh, setMesh] = useState<SkinnedMesh>()
    const [inited, setInited] = useState<boolean>()
    useEffect(() => {
        if (!mesh) return
        const [bones, rootBones] = initBones(geometry)
        for (const root of rootBones) {
            mesh.add(root)
        }
        const skeleton = new Skeleton(bones);
        mesh.bind(skeleton);
        onCreate?.(mesh)
        setInited(true)
    }, [mesh])

    const runtimeHelper = useRef({})

    if (!initProps) return

    const { data, geometry, material } = initProps

    return (
        <skinnedMesh
            name={data.metadata.modelName}
            args={[geometry, material]}
            ref={mesh => mesh && setMesh(mesh)}
            {...props}>
            <ModelContext.Provider value={{ mesh: mesh, runtimeHelper }}>
                {inited && children}
            </ModelContext.Provider>
        </skinnedMesh>
    )
}

export default PMXModel;
