import { Typography, Divider, Box } from "@mui/material";
import CreateResource from "./CreateResource";

function Resource({ selectedKey, children, onLoad }: { selectedKey: string, children: React.ReactNode, onLoad: () => void }) {
    return (
        <>
            <Typography variant="h4">My {selectedKey}</Typography>
            <Box
                sx={{
                    gap: 2,
                    display: "flex",
                    flexWrap: "wrap",
                    alignContent: "flex-start"
                }}
            >
                <CreateResource type={selectedKey} onLoad={onLoad}></CreateResource>
                {children}
            </Box>
            <Divider></Divider>
            <Typography variant="h4">Community {selectedKey}</Typography>
        </>
    );
}

export default Resource;