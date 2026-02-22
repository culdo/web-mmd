import NamesListener from "./NamesListener";

function WithResourceNames(useNames: () => string[]) {
    return function WithResources(Component: React.ComponentType<{ name: string }>, listenerType?: ResourceType) {
        return function WrappedComponent() {
            const names = useNames()
            return (
                <>
                    {
                        names.map(name => <Component key={name} name={name}></Component>)
                    }
                    {
                        listenerType ?
                            <NamesListener type={listenerType} names={names}></NamesListener>
                            : null
                    }
                </>
            );
        }
    }
}

export default WithResourceNames;
