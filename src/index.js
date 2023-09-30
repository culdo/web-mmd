import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { MMDLoader } from './modules/MMDLoader.js';
import { MMDAnimationHelper } from './modules/MMDAnimationHelper.js';
import { MMDGui } from './modules/gui.js'
import { onProgress, loadMusicFromYT, saveCurrTime } from './modules/utils.js'
import path from 'path-browserify';
import localforage from 'localforage';

// for debug
// localforage.clear();
async function getConfig() {

    const configSaver = {
        set: function (target, key, value) {
            const result = Reflect.set(...arguments)

            localforage.setItem("presets", JSON.stringify(presets));
            
            return result;
        }
    };
    
    async function parseBlob(obj) {
        for (const [key2, value2] of Object.entries(obj)) {
            if (value2 instanceof Object) {
                await parseBlob(value2)
            } else if (value2.startsWith("blob:")) {
                let blob = await localforage.getItem(key2);
                obj[key2] = URL.createObjectURL(blob)
            }
        }
    }

    const savedPresetName = await localforage.getItem("currentPreset")
    
    preset = "Default"
    presets = {
        Default: defaultConfig
    };
    let userConfig = defaultConfig;

    // if we have saved user config
    if (savedPresetName) {
        const savedPresets = await localforage.getItem("presets")
        if(savedPresets) {
            presets = JSON.parse(savedPresets)
            // keep Default preset unchanged
            if(savedPresetName != "Default") {
                userConfig = presets[savedPresetName];
            }
            preset = savedPresetName;
        }

        // update prev version config already saved in browser
        const aKeys = Object.keys(userConfig)
        const bKeys = Object.keys(defaultConfig)
        let newKeys = bKeys.filter(x => !aKeys.includes(x));
        for (const key of newKeys) {
            userConfig[key] = defaultConfig[key]
        }

        for (const [key, value] of Object.entries(userConfig.pmxFiles)) {
            await parseBlob(value)
        }

        if(userConfig.characterFile.startsWith("blob:")) {
            userConfig.characterFile = userConfig.pmxFiles.character[userConfig.character]
        }

        if(userConfig.stageFile.startsWith("blob:")) {
            userConfig.stageFile = userConfig.pmxFiles.stage[userConfig.stage]
        }

        if(userConfig.cameraFile.startsWith("blob:")) {
            const cameraBlob = await localforage.getItem(`${savedPresetName}_camera`);
            userConfig.cameraFile = URL.createObjectURL(cameraBlob)
        }

        if(userConfig.motionFile.startsWith("blob:")) {
            const motionBlob = await localforage.getItem(`${savedPresetName}_motion`);
            userConfig.motionFile = URL.createObjectURL(motionBlob)
        }

        // if we not have saved user config
    } else {
        await localforage.setItem("currentPreset", "Default");
    }
    console.log(userConfig)
    api = new Proxy(userConfig, configSaver);

}

let stats;

let character, camera, scene, renderer, effect, stage;
let helper, ikHelper, physicsHelper;

let globalParams = {};

let ready = false;
let timeoutID;
let prevTime = 0.0;

let api, presets, preset;
let runtimeCharacter;

const defaultConfig = {
    // files
    'characterFile': "models/mmd/つみ式ミクさんv4/つみ式ミクさんv4.pmx",
    'motionFile': 'models/mmd/motions/GimmeGimme_with_emotion.vmd',
    'cameraFile': 'models/mmd/cameras/GimmexGimme.vmd',
    'stageFile': 'models/mmd/stages/RedialC_EpRoomDS/EPDS.pmx',
    'musicURL': 'https://www.youtube.com/watch?v=ERo-sPa1a5g',
    'character': 'つみ式ミクさんv4.pmx',
    'motion': 'GimmeGimme_with_emotion.vmd',
    'camera': 'GimmexGimme.vmd',
    'stage': 'EPDS.pmx',
    //pmx files
    'pmxFiles': { 
        character: {
            'つみ式ミクさんv4.pmx': "models/mmd/つみ式ミクさんv4/つみ式ミクさんv4.pmx"
        }, 
        stage: {
            'EPDS.pmx': 'models/mmd/stages/RedialC_EpRoomDS/EPDS.pmx'
        }, 
        modelTextures: {
            character: {}, 
            stage: {}
        } 
    },
    //player
    'currentTime': 0.0,
    'volume': 0.2,
    // basic
    'camera motion': true,
    'physics': true,
    'ground shadow': true,
    'self shadow': true,
    'fog color': 0x43a0ad,
    // light
    'Hemisphere sky': 0x666666,
    'Hemisphere ground': 0x482e2e,
    'Directional': 0xffffff,
    // need refresh
    'enable SDEF': true,
    // debug
    'show FPS': false,
    'show outline': true,
    'show IK bones': false,
    'show rigid bodies': false,
    'show skeleton': false,
    'auto hide GUI': true,
    'set pixelratio 1.0': false
}

const gui = new MMDGui();

const clock = new THREE.Clock();

async function main() {
    await getConfig();
    await Ammo();
    init();
    animate();
}

main();

function init() {

    const container = document.createElement('div');
    document.body.appendChild(container);

    loadMusicFromYT(api.musicURL);

    player.currentTime = api["currentTime"];
    player.volume = api['volume'];

    player.onvolumechange = () => {
        api['volume'] = player.volume;
        if (player.muted) {
            api['volume'] = 0.0;
        }
    }

    player.onplay = () => {
        globalParams.runtimeCharacter.physics.reset();
        if (api["auto hide GUI"]) gui.gui.hide();
    }
    player.onpause = () => {
        gui.gui.show();
    }
    // control bar
    document.addEventListener('mousemove', (e) => {

        player.style.opacity = 0.5;
        if (timeoutID !== undefined) {
            clearTimeout(timeoutID);
        }

        timeoutID = setTimeout(function () {
            player.style.opacity = 0;
        }, 1000);
    });

    // scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(api['fog color'], 10, 500);

    // camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 20, 30);
    scene.add(camera);

    // light
    const hemiLight = new THREE.HemisphereLight(api["Hemisphere sky"], api["Hemisphere ground"]);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(api["Directional"], 0.45);
    dirLight.position.set(3, 10, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.015;
    scene.add(dirLight);

    // render
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(api['set pixelratio 1.0'] ? 1.0 : window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 10, 0);

    controls.domElement.addEventListener('mousedown', () => {
        camera.up.set(0, 1, 0);
        camera.updateProjectionMatrix();
    });

    // outline
    effect = new OutlineEffect(renderer);
    effect.enabled = api['show outline']

    // FPS stats
    stats = new Stats();
    stats.dom.id = "fps";
    stats.dom.style.display = api["show FPS"] ? "block" : "none";
    container.appendChild(stats.dom);

    helper = new MMDAnimationHelper();

    const loader = new MMDLoader();

    let stageParams = null;
    if (api.stageFile.startsWith("blob:") || api.stageFile.startsWith("data:")) {
        stageParams = {
            modelExtension: path.extname(api.stage).slice(1),
            modelTextures: api.pmxFiles.modelTextures.stage[api.stage],
        };
    }

    // load stage
    loader.load(api.stageFile, function (mesh) {
        stage = mesh;
        stage.castShadow = true;
        stage.receiveShadow = api['ground shadow'];

        scene.add(stage);
    }, onProgress, null, stageParams)

    let characterParams = {
        enableSdef: api['enable SDEF']
    };
    if (api.characterFile.startsWith("blob:") || api.characterFile.startsWith("data:")) {
        characterParams = {
            modelExtension: path.extname(api.character).slice(1),
            modelTextures: api.pmxFiles.modelTextures.character[api.character],
            ...characterParams
        };
    }

    // load character
    loader.loadWithAnimation(api.characterFile, api.motionFile, function (mmd) {
        character = mmd.mesh;
        character.castShadow = true;
        character.receiveShadow = api["self shadow"];
        scene.add(character);

        helper.add(character, {
            animation: mmd.animation
        });
        runtimeCharacter = helper.objects.get(character)

        // load camera
        loader.loadAnimation(api.cameraFile, camera, function (cameraAnimation) {

            helper.add(camera, {
                animation: cameraAnimation
            });
            helper.enable('cameraAnimation', api["camera motion"]);

            ready = true;
            overlay.style.display = "none";


        }, onProgress, null);

        ikHelper = runtimeCharacter.ikSolver.createHelper();
        ikHelper.visible = api['show IK bones'];
        scene.add(ikHelper);

        physicsHelper = runtimeCharacter.physics.createHelper();
        physicsHelper.visible = api['show rigid bodies'];
        helper.enable('physics', api['physics']);
        scene.add(physicsHelper);

        const skeletonHelper = new THREE.SkeletonHelper(character);
        skeletonHelper.visible = api['show skeleton'];
        scene.add(skeletonHelper);

        globalParams = {
            api, defaultConfig, loader, camera, player, helper, scene, character, stage,
            effect, ikHelper, physicsHelper, skeletonHelper, dirLight, hemiLight, runtimeCharacter,
            renderer, presets, preset,
        };
        globalParams.ready = true;
        gui.initGui(globalParams);

        runtimeCharacter.physics.reset();

    }, onProgress, null, characterParams);

    //

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    effect.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    if (ready && globalParams.ready) {
        stats.begin();
        render();
        stats.end();
    }

    requestAnimationFrame(animate);
}

function render() {
    const runtimeCharacter = globalParams.runtimeCharacter;

    let currTime = player.currentTime
    // player has a bug that sometime jump to end(duration)
    // so we just skip that frame
    if (currTime == player.duration) {
        return
    }
    let delta = currTime - prevTime;

    if (Math.abs(delta) > 0) {
        // for time seeking using player control
        if (Math.abs(delta) > 0.1) {
            helper.enable('physics', false);
        }

        // animation updating
        helper.update(delta, currTime);
        
        saveCurrTime(api, currTime);

        // for time seeking using player control
        if (Math.abs(delta) > 0.1) {
            runtimeCharacter.physics.reset();
            helper.enable('physics', api['physics']);
            console.log('time seeked. physics reset.')
        }
        prevTime = currTime

    } else if (api['physics']) {

        let delta = clock.getDelta()
        runtimeCharacter.physics.update(delta);

    }

    // stop when motion is finished then fix physics
    if (runtimeCharacter.looped) {
        player.pause();
        player.currentTime = 0.0;

        runtimeCharacter.physics.reset();
        runtimeCharacter.physics.update(0.1)

        runtimeCharacter.looped = false;
    }

    effect.render(scene, camera);

}