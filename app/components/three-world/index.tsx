import Camera from './camera';
import Character from './character';
import Controls from './controls';
import Lights from './lights';

import Stage from './stage';
import Plugins from './plugins';
import Skybox from './skybox/Skybox';
import Debug from './debug';
import { WebGLRenderer } from 'three';
import Effects from '../effects';
import { useThree } from '@react-three/fiber';
import useRenderer from './renderer/useRenderer';

function ThreeWorld() {
    useRenderer()
    const gl = useThree(state => state.gl)
    return (
        <>
            <Plugins></Plugins>
            <Lights></Lights>
            <Character></Character>
            <Stage></Stage>
            <Camera></Camera>
            <Controls></Controls>
            {
                gl instanceof WebGLRenderer && <Effects></Effects>
            }
            <Skybox hdrUrl='BRDF.hdr'></Skybox>
            <Debug></Debug>
        </>
    )
}

export default ThreeWorld
