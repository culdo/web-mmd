import { ReactNode, Suspense } from "react";

function WithSuspense(Component: (props: any) => ReactNode) {
    return function WrappedComponent(props: any) {
        return (
            <Suspense fallback={null}>
                <Component {...props}></Component>
            </Suspense>
        )
    };
}

export default WithSuspense