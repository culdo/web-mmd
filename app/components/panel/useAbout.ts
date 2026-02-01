import { button, useControls } from "leva";

function useAbout() {
    useControls('About', () => ({
        version: {
            value: process.env.COMMIT ?? "dev",
            editable: false
        },
        'View Docs': button(() => window.open('https://github.com/culdo/web-mmd#Web-MMD', '_blank')),
        'View Source Code': button(() => window.open('https://github.com/culdo/web-mmd', '_blank'))
    }), { order: 1100, collapsed: true })
}

export default useAbout;