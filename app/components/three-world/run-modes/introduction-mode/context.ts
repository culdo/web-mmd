import { createContext, RefObject } from "react"
import { Quaternion } from "three"

const ContentContext = createContext<{
    sectionTimesRef?: RefObject<number[]>
    camRot?: Quaternion
}>({})

export default ContentContext
