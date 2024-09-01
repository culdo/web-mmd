import { useControls } from "leva";
import { useState } from "react";

function Plugins() {

    const [importedComponents, setImportedComponents] = useState<Record<string, JSX.Element>>({
        "Swing": null
    });

    useControls('Plugins', Object.fromEntries(Object.entries(importedComponents).map(([key, v]) => {
        return [key, {
            value: v !== null,
            onChange: async (state: boolean) => {
                if (state) {
                    const module = await import(`./${key}`);
                    const PluginFile = module.default;
                    setImportedComponents(prev => {
                        const newState = { ...prev }
                        newState[key] = <PluginFile />
                        return newState
                    });
                } else {
                    setImportedComponents(prev => {
                        const newState = { ...prev }
                        newState[key] = null
                        return newState
                    });
                }
            }
        }]
    })), { order: 4, collapsed: true })

    return (
        <>
            {Object.values(importedComponents)}
        </>
    );
}

export default Plugins;