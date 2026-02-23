import { createContext, useContext } from "react"

export const ResourceTypeContext = createContext<ResourceType>(null)
export const useResourceType = () => useContext(ResourceTypeContext)