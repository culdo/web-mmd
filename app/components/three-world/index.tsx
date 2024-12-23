import Camera from './camera';
import Character from './character';
import Controls from './controls';
import Lights from './lights';
import useRenderLoop from './renderLoop/useRenderLoop';

import Stage from './stage';
import Plugins from './plugins';
import Skybox from './skybox/Skybox';

function ThreeWorld() {
    useRenderLoop()
    return (
        <>
            <Plugins></Plugins>
            <Lights></Lights>
            <Character></Character>
            <Stage></Stage>
            <Camera></Camera>
            <Controls></Controls>
            <Skybox hdrUrl='BRDF.hdr'></Skybox>
        </>
    )
}

export default ThreeWorld
