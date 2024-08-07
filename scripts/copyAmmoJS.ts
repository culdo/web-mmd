import fse from "fs-extra";
import path from 'path';

const topDir = path.join(__dirname, '..')
const ammoBuildDir = path.join(topDir, 'node_modules', 'ammo.js', 'builds');
fse.copySync(path.join(ammoBuildDir, 'ammo.wasm.js'), path.join(topDir, 'public', 'ammo.wasm.js'), { overwrite: true });
fse.copySync(path.join(ammoBuildDir, 'ammo.wasm.wasm'), path.join(topDir, 'public', 'ammo.wasm.wasm'), { overwrite: true });