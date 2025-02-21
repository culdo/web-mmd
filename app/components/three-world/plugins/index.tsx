import { useControls } from "leva";
import { useState } from "react";

function Plugins() {

    const [importedPlugins, setPlugins] = useState<Record<string, JSX.Element>>({
        "Swing": null
    });

    useControls('Plugins', Object.fromEntries(Object.entries(importedPlugins).map(([key, v]) => {
        return [key, {
            value: v !== null,
            onChange: async (state: boolean) => {
                if (state) {
                    const dynamicModule = await import(`./${key}`);
                    const PluginFile = dynamicModule.default;
                    setPlugins(prev => {
                        const newState = { ...prev }
                        newState[key] = <PluginFile />
                        return newState
                    });
                } else {
                    setPlugins(prev => {
                        const newState = { ...prev }
                        newState[key] = null
                        return newState
                    });
                }
            }
        }]
    })), { order: 400, collapsed: true })

    return (
        <>
            {Object.values(importedPlugins)}
        </>
    );
}

export default Plugins;