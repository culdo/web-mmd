import { ReactNode, useEffect, useState } from "react"
import { Skeleton, SkinnedMesh } from "three"
import { initBones, MMDLoader } from "@/app/modules/MMDLoader"
import useGlobalStore from "@/app/stores/useGlobalStore"
import { ThreeElement } from "@react-three/fiber"
import { ModelContext } from "./helper/ModelContext"
import usePresetStore from "@/app/stores/usePresetStore"

type PMXModelProps = {
    url: string,
    modelTextures: Record<string, string>,
    enableSdef?: boolean,
    enablePBR?: boolean,
    children?: ReactNode,
    onCreate?: (mesh: SkinnedMesh) => void,
    onDispose?: () => void
} & Partial<ThreeElement<typeof SkinnedMesh>>

function PMXModel({ url, modelTextures, enableSdef = true, enablePBR = true, children, onCreate, onDispose, ...props }: PMXModelProps) {

    const loader = useGlobalStore(state => state.loader)
    const isWebGPU = usePresetStore(state => state.isWebGPU)
    const [initProps, setProps] = useState<Awaited<ReturnType<MMDLoader["loadAsync"]>>>()

    useEffect(() => {
        const params = {
            enableSdef,
            enablePBR,
            isWebGPU
        }
        if (url.startsWith("data:")) {
            Object.assign(params, {
                modelTextures
            });
        }

        const init = async () => {
            const initProps = await loader
                .setModelParams(params)
                .loadAsync(url);
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
        const origPos = mesh.position.clone()
        mesh.position.set(0, 0, 0)
        const [bones, rootBones] = initBones(geometry)
        for (const root of rootBones) {
            mesh.add(root)
        }
        const skeleton = new Skeleton(bones);
        mesh.bind(skeleton);
        mesh.position.copy(origPos)

        const boneBasePos: Record<string, [number, number, number]> = {}
        for(const bone of bones) {
            boneBasePos[bone.name] = bone.position.toArray()
        }
        mesh.userData["boneBasePos"] = boneBasePos

        onCreate?.(mesh)
        setInited(true)
    }, [mesh])

    if (!initProps) return

    const { data, geometry, material } = initProps

    return (
        <skinnedMesh
            name={data.metadata.modelName}
            args={[geometry, material]}
            ref={mesh => mesh && setMesh(mesh)}
            {...props}>
            <ModelContext.Provider value={{ mesh: mesh }}>
                {inited && children}
            </ModelContext.Provider>
        </skinnedMesh>
    )
}

export default PMXModel;
