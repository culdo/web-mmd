import { Perf } from 'r3f-perf';
import usePresetStore from '@/app/stores/usePresetStore';
import { useControls } from 'leva';
import { buildGuiItem, buildGuiObj } from '@/app/utils/gui';
import useGlobalStore from '@/app/stores/useGlobalStore';

function Debug() {
    const showFPS = usePresetStore(state => state['show FPS'])
    const targetModelId = usePresetStore(state => state.targetModelId)
    const targetModel = useGlobalStore(state => state.models)[targetModelId]
    
    useControls("Debug", {
        ...buildGuiObj("show FPS")
    }, { collapsed: true, order: 90 })
    return ( 
        <>
            {targetModel && showFPS && <Perf position='top-left' />}
        </>
     );
}

export default Debug;