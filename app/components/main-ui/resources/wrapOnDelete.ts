import { use } from "react";
import { ResourceTypeContext } from "../context";
import useConfigStore from "@/app/stores/useConfigStore";

function wrapOnDelete(onDelete: (name: string) => void) {
    return () => {
        const type = use(ResourceTypeContext)
        return (name: string) => {
            onDelete(name)
            console.log(`delete ${type}/${name} hash`)
            useConfigStore.setState(({ preset, fileHashes }) => {
                delete fileHashes[preset][`${type}/${name}`]
                return { fileHashes: { ...fileHashes } }
            })
        }
    }
}

export default wrapOnDelete;