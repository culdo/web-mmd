import useGlobalStore from '@/app/stores/useGlobalStore';
import usePresetStore from '@/app/stores/usePresetStore';

export const useTargetModel = () => {
    const targetModelId = usePresetStore(state => state.targetModelId)
    const mesh = useGlobalStore(state => state.models)[targetModelId]
    return mesh
};

export function WithTargetModel<T>(Component: React.ComponentType<T>) {
    return function WrappedComponent(props: T) {
        const mesh = useTargetModel()
        if (!mesh) return <></>
        return (
            <Component {...props}></Component>
        )
    };
};
