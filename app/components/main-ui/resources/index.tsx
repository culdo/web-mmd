import { Typography, Divider, Box } from "@mui/material";
import CreateResource from "./CreateResource";
import { Children, isValidElement } from "react";
import LocalResources from "./LocalResources";
import PeersResources from "./PeersResources";
import { useResource } from "../context";

function Resources({ children }: { children: React.ReactNode }) {
    const { type: selectedKey } = useResource()
    let local: React.ReactNode;
    let remote: React.ReactNode;

    for (const child of Children.toArray(children)) {
        if (!isValidElement(child)) return;
        if (child.type === LocalResources) {
            local = child;
        } else if (child.type === PeersResources) {
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
                <CreateResource></CreateResource>
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
