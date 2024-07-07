import { Suspense } from "react";

function WithSuspense(Component: (props: any) => JSX.Element) {
    return function WrappedComponent(props: any) {
        return (
            <Suspense fallback={null}>
                <Component {...props}></Component>
            </Suspense>
        )
    };
}

export default WithSuspense