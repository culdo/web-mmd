import Camera from './camera';
import Character from './character';
import Controls from './controls';
import Lights from './lights';

import Stage from './stage';
import Plugins from './plugins';
import Skybox from './skybox/Skybox';
import Debug from './debug';
import Effects from '../effects';
import useRenderer from './renderer/useRenderer';

function ThreeWorld() {
    useRenderer()
    return (
        <>
            <Plugins></Plugins>
            <Lights></Lights>
            <Character></Character>
            <Stage></Stage>
            <Camera></Camera>
            <Controls></Controls>
            <Effects></Effects>
            <Skybox hdrUrl='BRDF.hdr'></Skybox>
            <Debug></Debug>
        </>
    )
}

export default ThreeWorld
