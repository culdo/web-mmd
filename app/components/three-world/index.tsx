import Camera from './camera';
import Controls from './controls';
import Lights from './lights';

import Plugins from './plugins';
import Skybox from './skybox/Skybox';
import Debug from './debug';
import Effects from '../effects';
import useRenderer from './renderer/useRenderer';
import CreditsList from './html/CreditsList';
import Models from './model';

function ThreeWorld() {
    useRenderer()
    return (
        <>
            <Plugins></Plugins>
            <Lights></Lights>
            <Models></Models>
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
