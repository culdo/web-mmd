import { Perf } from 'r3f-perf';
import usePresetStore from '@/app/stores/usePresetStore';
import { useControls } from 'leva';
import { buildGuiItem, buildGuiObj } from '@/app/utils/gui';
import useGlobalStore from '@/app/stores/useGlobalStore';

function Debug() {
    const showFPS = usePresetStore(state => state['show FPS'])
    const character = useGlobalStore(state => state.character)
    useControls("Debug", {
        ...buildGuiObj("show FPS"),
        ...buildGuiObj("isWebGPU")
    }, { collapsed: true, order: 90 })
    return ( 
        <>
            {character && showFPS && <Perf position='top-left' />}
        </>
     );
}

export default Debug;