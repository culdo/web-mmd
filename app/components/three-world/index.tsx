import Camera from './camera';
import Character from './character';
import Controls from './controls';
import Env from './env';
import Stage from './stage';

declare global {
    interface Window { Ammo: Function; }
}

function ThreeWorld() {
    return (
        <>
            <Env></Env>
            <Character></Character>
            <Stage></Stage>
            <Camera></Camera>
            <Controls></Controls>
        </>
    )
}

export default ThreeWorld
