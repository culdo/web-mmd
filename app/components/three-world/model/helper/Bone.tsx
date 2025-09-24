import { button, useControls } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import { useEffect, useState } from "react";
import { useModel } from "./ModelContext";
import { Vector3Tuple } from "three";
import isRenderGui from "./useRenderGui";

function Bone() {
    const model = useModel()

    const [controllers, setControllers] = useState<Schema>({})

    const updateBoneFolder = () => {
        const newControllers: Schema = {}
        for (const bone of model.skeleton.bones) {
            if(!bone.name.startsWith("右腕")) continue
            newControllers[`${bone.name}-rotation`] = 
                {
                    value: bone.rotation.toArray().slice(0, 3) as Vector3Tuple,
                    onChange: (value: Vector3Tuple, path, context) => {
                        if(!context.initial) {
                            bone.rotation.fromArray(value)
                        } else {
                            try {
                                set({[`${bone.name}-rotation`]: bone.rotation.toArray().slice(0, 3) as Vector3Tuple})
                            } catch (error) {
                                console.log(error)
                            }
                        }
                    }
                }
            
            newControllers[`${bone.name}-position`] = {
                    value: bone.position.toArray() as Vector3Tuple,
                    onChange: (value: Vector3Tuple, path, context) => {
                        if(!context.initial) {
                            bone.position.fromArray(value)
                        } else {
                            try {
                                set({[`${bone.name}-position`]: bone.position.toArray()})
                            } catch (error) {
                                console.log(error)
                            }
                        }
                    }
                }
        }
        setControllers(newControllers)
    }

    const [_, set] = useControls(`Model-${model.name}.Bones`, () => {
        return {
            ...controllers,
            "update": button(() => {
                updateBoneFolder()
            })
        }
    }, { collapsed: true, render: () => isRenderGui(model.name) }, [controllers])

    useEffect(() => {
        updateBoneFolder();
    })

    return <></>
}

export default Bone;