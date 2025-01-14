import { createRef, ForwardedRef, forwardRef, MutableRefObject, use, useEffect, useRef } from "react"
import WithSuspense from "../../suspense"
import { Bone, BufferGeometry, Material, SkinnedMesh } from "three"
import { MMDLoader } from "@/app/modules/MMDLoader"

function PMXModel({ geometry, material, rootBones, children, onCreate, ...props }: { geometry: BufferGeometry, material: Material | Material[], rootBones: Bone[], children?: JSX.Element | JSX.Element[], onCreate?: (mesh: SkinnedMesh) => void }, ref: ForwardedRef<SkinnedMesh>) {
    const meshRef = useRef<SkinnedMesh>()
    useEffect(() => {
        if(!rootBones) return
        for (const root of rootBones) {
            meshRef.current.add(root)
        }
        onCreate?.(meshRef.current)
    }, [rootBones, onCreate])
    if (!geometry || !material) return
    return (
        <skinnedMesh
            args={[geometry, material]}
            ref={(mesh) => {
                meshRef.current = mesh;
                if (typeof ref === 'function') {
                    ref(mesh);
                } else if (ref) {
                    ref.current = mesh;
                }
            }}
            {...props}>
            {children}
        </skinnedMesh>
    )
}

export default WithSuspense(forwardRef(PMXModel));
