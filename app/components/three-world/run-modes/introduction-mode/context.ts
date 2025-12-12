import { createContext, MutableRefObject } from "react"
import { Quaternion } from "three"

const ContentContext = createContext<{
    sectionTimesRef?: MutableRefObject<number[]>
    camRot?: Quaternion
}>({})

export default ContentContext
