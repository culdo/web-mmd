import AmmoLib from 'ammojs-typed';
import Camera from './camera';
import Character from './character';
import Controls from './controls';
import Lights from './lights';
import useRenderLoop from './renderLoop/useRenderLoop';
import Swing from './specials/Swing';
import Stage from './stage';

function ThreeWorld() {
    useRenderLoop()
    return (
        <>
            <Swing></Swing>
            <Lights></Lights>
            <Character></Character>
            <Stage></Stage>
            <Camera></Camera>
            <Controls></Controls>
        </>
    )
}

export default ThreeWorld
