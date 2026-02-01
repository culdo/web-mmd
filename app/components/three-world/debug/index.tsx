import usePresetStore from '@/app/stores/usePresetStore';
import { useControls } from 'leva';
import { buildGuiObj } from '@/app/utils/gui';
import { Stats } from '@react-three/drei';

function Debug() {
    const showFPS = usePresetStore(state => state['show FPS'])

    useControls("Debug", {
        ...buildGuiObj("show FPS")
    }, { collapsed: true, order: 90 })

    return (
        <>
            {showFPS && <Stats></Stats>}
        </>
    );
}

export default Debug;