import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { MMDLoader } from './modules/MMDLoader.js';
import { MMDAnimationHelper } from './modules/MMDAnimationHelper.js';
import { MMDGui } from './modules/gui.js'
import { onProgress, loadMusicFromYT, saveCurrTime, streamAsyncIterable, withProgress } from './modules/utils.js'
import path from 'path-browserify';
import localforage from 'localforage';

// for debug
// localforage.clear();
async function getConfig() {

    const configSaver = {
        set: function (target, key, value) {
            const result = Reflect.set(...arguments)
            
            if(globalParams.preset != "Default") {
                localforage.setItem(`${globalParams.preset}_${key}`, value);
            }
            
            return result;
        }
    };

    const resp = await fetch('presets/Default.json')
    
    const res = withProgress(resp, 38204598)

    defaultConfig = await res.json()

    preset = "Default"
    presetsList = new Set(["Default"]);

    let userConfig = defaultConfig;

    const savedPresetName = await localforage.getItem("currentPreset")
    // if we have saved user config
    if (savedPresetName) {
        preset = savedPresetName;
        await localforage.iterate((val, key) => {
            if(key.startsWith(`${preset}_`)) {
                const configKey = key.split(/_(.*)/s)[1]
                userConfig[configKey] = val
            }
        })
        
        const savedPresetsList = await localforage.getItem("presetsList")
        if(savedPresetsList) presetsList = savedPresetsList
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

let api, presetsList, preset;
let runtimeCharacter;

let defaultConfig;

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
        api.currentTime = player.currentTime;
    }

    player.onseeked = () => {
        api.currentTime = player.currentTime;
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
    const characterFile = api.pmxFiles.character[api.character]
    const stageFile = api.pmxFiles.stage[api.stage]

    let stageParams = null;
    if (stageFile.startsWith("data:")) {
        stageParams = {
            modelExtension: path.extname(api.stage).slice(1),
            modelTextures: api.pmxFiles.modelTextures.stage[api.stage],
        };
    }

    // load stage
    loader.load(stageFile, function (mesh) {
        stage = mesh;
        stage.castShadow = true;
        stage.receiveShadow = api['ground shadow'];

        scene.add(stage);
    }, onProgress, null, stageParams)

    let characterParams = {
        enableSdef: api['enable SDEF']
    };
    if (characterFile.startsWith("data:")) {
        characterParams = {
            modelExtension: path.extname(api.character).slice(1),
            modelTextures: api.pmxFiles.modelTextures.character[api.character],
            ...characterParams
        };
    }

    // load character
    loader.loadWithAnimation(characterFile, api.motionFile, function (mmd) {
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
            renderer, presetsList, preset
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

    let currTime = player.currentTime + (api.motionOffset * 0.001)
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