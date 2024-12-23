import { Perf } from 'r3f-perf';
import usePresetStore from '@/app/stores/usePresetStore';
import { useControls } from 'leva';
import { buildGuiItem } from '@/app/utils/gui';
import useGlobalStore from '@/app/stores/useGlobalStore';

function Debug() {
    const showFPS = usePresetStore(state => state['show FPS'])
    const character = useGlobalStore(state => state.character)
    useControls("Debug", {
        "show FPS": buildGuiItem("show FPS")
    }, { collapsed: true, order: 90 })
    return ( 
        <>
            {character && showFPS && <Perf position='top-left' />}
        </>
     );
}

export default Debug;