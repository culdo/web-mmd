import Camera from './camera';
import Character from './character';
import Controls from './controls';
import Lights from './lights';
import useRenderLoop from './renderLoop/useRenderLoop';
import Stage from './stage';

declare global {
    interface Window { Ammo: Function; }
}

function ThreeWorld() {
    useRenderLoop()
    return (
        <>
            <Lights></Lights>
            <Character></Character>
            <Stage></Stage>
            <Camera></Camera>
            <Controls></Controls>
        </>
    )
}

export default ThreeWorld
