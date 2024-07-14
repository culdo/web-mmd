import Camera from './camera';
import Character from './character';
import Controls from './controls';
import Lights from './lights';
import Stage from './stage';

declare global {
    interface Window { Ammo: Function; }
}

function ThreeWorld() {
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
