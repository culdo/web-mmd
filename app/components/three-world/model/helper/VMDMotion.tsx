import useVMD from "../../animation/useVMD";

function VMDMotion({ args }: { args: Parameters<typeof useVMD> }) {
    useVMD(...args)
    return (
        <></>
    );
}

export default VMDMotion;