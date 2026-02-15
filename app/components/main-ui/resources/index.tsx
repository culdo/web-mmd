import { Typography, Divider, Box } from "@mui/material";
import CreateResource from "./CreateResource";
import { Children, isValidElement } from "react";

export function LocalResources({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function RemoteResources({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

function Resources({ selectedKey, children, onLoad }: { selectedKey: string, children: React.ReactNode, onLoad: () => void }) {
    let local: React.ReactNode;
    let remote: React.ReactNode;

    for (const child of Children.toArray(children)) {
        if (!isValidElement(child)) return;
        if (child.type === LocalResources) {
            local = child;
        } else if (child.type === RemoteResources) {
            remote = child;
        } 
    }
    return (
        <>
            <Typography variant="h4">Local {selectedKey}</Typography>
            <Box
                sx={{
                    gap: 2,
                    display: "flex",
                    flexWrap: "wrap",
                    alignContent: "flex-start"
                }}
            >
                <CreateResource type={selectedKey} onLoad={onLoad}></CreateResource>
                {local}
            </Box>
            <Divider></Divider>
            <Typography variant="h4">Remote {selectedKey}</Typography>
            <Box
                sx={{
                    gap: 2,
                    display: "flex",
                    flexWrap: "wrap",
                    alignContent: "flex-start"
                }}
            >
                {remote}
            </Box>
        </>
    );
}

export default Resources;