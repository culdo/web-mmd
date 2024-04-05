import { Canvas } from '@react-three/fiber';
import useConfig from '../default-config/useConfig';
import useGUI from '../mmd-gui/useGUI';
import Camera from './camera';
import Character from './character';
import Controls from './controls';
import Helpers from './helpers';
import Stage from './stage';
import useGlobalStore from '@/app/stores/useGlobalStore';
import useHelpers from './helpers/useHelpers';
import Ammo from './ammo';

declare global {
    interface Window { Ammo: Function; }
}

function WebMMD() {
    useConfig()
    useGUI()
    useHelpers()
    const { api } = useGlobalStore()
    if(!api) return
    return (
        <>
            <Canvas>
                <fogExp2 attach="fog" color={api["fog color"]} density={api["fog density"]}></fogExp2>
                <ambientLight intensity={Math.PI / 2} />
                <directionalLight position={[-10, -10, -10]} intensity={Math.PI} />
                <Character></Character>
                <Stage></Stage>
                <Helpers></Helpers>
                <Camera></Camera>
                <Controls></Controls>
            </Canvas>
        </>
    )
}

export default WebMMD
