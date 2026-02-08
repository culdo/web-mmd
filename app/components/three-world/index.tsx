import Camera from './camera';
import Controls from './controls';
import Lights from './lights';

import Plugins from './plugins';
import Skybox from './skybox/Skybox';
import Debug from './debug';
import Effects from '../effects';
import useRenderer from './renderer/useRenderer';
import CreditsList from './credits';
import Models from './model';
import RunMode from './run-modes';

function ThreeWorld() {
    useRenderer()
    return (
        <>
            <Plugins></Plugins>
            <Lights></Lights>
            <Models></Models>
            <RunMode></RunMode>
            <Camera></Camera>
            <Controls></Controls>
            <Effects></Effects>
            <Skybox hdrUrl='BRDF.hdr'></Skybox>
            <Debug></Debug>
            <CreditsList></CreditsList>
        </>
    )
}

export default ThreeWorld
