import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MMDLoader } from './modules/MMDLoader.js';
import { MMDAnimationHelper } from './modules/MMDAnimationHelper.js';
import { MMDGui } from './modules/gui.js'
import { onProgress, loadMusicFromYT, withProgress } from './modules/utils.js'
import { PostProcessor } from './modules/postProcessor.js'

import path from 'path-browserify';
import localforage from 'localforage';
import { CameraMode, MMDCameraWorkHelper } from './modules/MMDCameraWorkHelper.js';

// for debug
// localforage.clear();

class WebMMD {
    constructor() {
        this.timeoutID;
        this.prevTime = 0.0;

        this.clock = new THREE.Clock();
    }

    async start() {
        await Promise.all([this.getConfig(), Ammo()]);
        await this.init();
        this.animate();
    }

    async getConfig() {
        const configSep = "."

        const scope = this
        const configSaver = {
            set: function (target, key, value) {
                const result = Reflect.set(...arguments)

                if (scope.preset != "Default") {
                    localforage.setItem(`${scope.preset}${configSep}${key}`, value);
                }

                return result;
            }
        };

        const configResp = await fetch('presets/Default_config.json')

        const defaultConfig = await configResp.json()

        let userConfig = defaultConfig;

        const savedPresetName = await localforage.getItem("currentPreset")
        const preset = savedPresetName ?? "Default"

        const savedPresetsList = await localforage.getItem("presetsList")
        const presetsList = savedPresetsList ?? new Set(["Default"])

        if (!savedPresetName) {
            await localforage.setItem("currentPreset", "Default")

            const dataResp = withProgress(await fetch('presets/Default_data.json'), 38204932)
            const defaultData = await dataResp.json()
            for (const [key, val] of Object.entries(defaultData)) {
                await localforage.setItem(`Default${configSep}${key}`, val);
            }
        }

        // always loads config from localforage (include data)
        await localforage.iterate((val, key) => {
            if (key.startsWith(`${preset}${configSep}`)) {
                const configKey = key.split(`${preset}${configSep}`)[1]
                userConfig[configKey] = val
            }
        })

        if (!("pmxFiles" in userConfig)) {
            await localforage.clear()
            location.reload()
        }

        console.log(userConfig)
        const api = new Proxy(userConfig, configSaver);

        Object.assign(this, { defaultConfig, api, preset, presetsList })
    }
    async init() {
        const { api } = this
        const scope = this

        const gui = new MMDGui();

        const container = document.createElement('div');
        document.body.appendChild(container);

        if (api.musicURL.startsWith("data:")) {
            player.src = api.musicURL
        } else {
            // old version fallback
            if (api.musicURL.startsWith("http")) {
                api.musicYtURL = api.musicURL;
            }
            loadMusicFromYT(api);
        }

        player.currentTime = api["currentTime"];
        player.volume = api['volume'];

        player.onvolumechange = () => {
            api['volume'] = player.volume;
            if (player.muted) {
                api['volume'] = 0.0;
            }
        }

        player.onplay = () => {
            scope.runtimeCharacter.physics.reset();
            if (api["auto hide GUI"]) gui.gui.hide();
        }
        player.onpause = () => {
            gui.gui.show();
            api.currentTime = player.currentTime;
        }

        player.onseeked = () => {
            api.currentTime = player.currentTime;
        }
        button.onclick = () => {
            let elem = document.querySelector("body");

            if (!document.fullscreenElement) {
                elem.requestFullscreen()
            } else {
                document.exitFullscreen();
            }
        }
        // control bar
        document.addEventListener('mousemove', (e) => {

            player.style.opacity = 0.5;
            button.style.opacity = 0.5;
            document.body.style.cursor = "default"
            if (this.timeoutID !== undefined) {
                clearTimeout(this.timeoutID);
            }

            this.timeoutID = setTimeout(function () {
                player.style.opacity = 0;
                button.style.opacity = 0;
                if (!player.paused) {
                    document.body.style.cursor = "none"
                }
            }, 1000);
        });

        // scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(api['fog color'], 10, 500);

        // camera
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.set(0, 20, 30);
        scene.add(camera);

        // light
        const hemiLight = new THREE.HemisphereLight(api["Hemisphere sky"], api["Hemisphere ground"], api["Hemisphere intensity"]);
        hemiLight.position.set(0, 40, 0);
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(api["Directional"], api["Directional intensity"]);
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
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        // recover to legacy colorspaces
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace

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

        // effect composer
        const postprocessor = new PostProcessor(scene, camera, renderer, { isSdefEnabled: api["enable SDEF"] })

        const composer = postprocessor.composer
        composer.setPixelRatio(api['set pixelratio 1.0'] ? 1.0 : window.devicePixelRatio);

        window.addEventListener('resize', (e) => {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            composer.setSize(window.innerWidth, window.innerHeight);
            renderer.setSize(window.innerWidth, window.innerHeight);

        });

        // FPS stats
        const stats = new Stats();
        stats.dom.id = "fps";
        stats.dom.style.display = api["show FPS"] ? "block" : "none";
        container.appendChild(stats.dom);

        // Helpers
        const helper = new MMDAnimationHelper();

        const loader = new MMDLoader();
        const characterFile = api.pmxFiles.character[api.character]
        const stageFile = api.pmxFiles.stage[api.stage]

        Object.assign(this, {
            loader, camera, player, helper, scene, stats,
            postprocessor, dirLight, hemiLight, renderer, composer
        })

        // load stage
        const loadStage = async () => {
            let stageParams = null;
            if (stageFile.startsWith("data:")) {
                stageParams = {
                    modelExtension: path.extname(api.stage).slice(1),
                    modelTextures: api.pmxFiles.modelTextures.stage[api.stage],
                };
            }

            const mesh = await loader.load(stageFile, onProgress, null, stageParams)
            const stage = mesh;
            stage.castShadow = true;
            stage.receiveShadow = api['ground shadow'];

            scene.add(stage);
            this.stage = stage
        }

        // load camera
        const loadCamera = async () => {
            const cameraAnimation = await loader.loadAnimation(api.cameraFile, camera, onProgress, null);
            helper.add(camera, {
                animation: cameraAnimation,
                enabled: api["camera mode"] == CameraMode.MOTION_FILE
            });

            this.cwHelper = await MMDCameraWorkHelper.init(helper.get(camera), api);

            overlay.style.display = "none";
        }

        // load character
        const loadCharacter = async () => {
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

            const mmd = await loader.loadWithAnimation(characterFile, api.motionFile, onProgress, null, characterParams);
            const character = mmd.mesh;
            character.castShadow = true;
            character.receiveShadow = api["self shadow"];
            scene.add(character);

            postprocessor.outline.selectedObjects = [character]

            helper.add(character, {
                animation: mmd.animation
            });
            const runtimeCharacter = helper.objects.get(character)

            const ikHelper = runtimeCharacter.ikSolver.createHelper();
            ikHelper.visible = api['show IK bones'];
            scene.add(ikHelper);

            const physicsHelper = runtimeCharacter.physics.createHelper();
            physicsHelper.visible = api['show rigid bodies'];
            helper.enable('physics', api['physics']);
            scene.add(physicsHelper);

            const skeletonHelper = new THREE.SkeletonHelper(character);
            skeletonHelper.visible = api['show skeleton'];
            scene.add(skeletonHelper);

            runtimeCharacter.physics.reset();

            Object.assign(this, {
                character,
                runtimeCharacter,
                ikHelper,
                physicsHelper,
                skeletonHelper
            })
        }

        await Promise.all([loadStage(), loadCharacter()]);
        // load camera at last let camera work clips durations be not changed ( because helper._syncDuration() )
        await loadCamera();

        // load gui
        this.ready = true;
        gui.initGui(this);
    }

    animate() {
        if (this.ready) {
            this.stats.begin();
            this.render();
            this.stats.end();
        }

        requestAnimationFrame(this.animate.bind(this));
    }

    render() {
        const {
            api,
            runtimeCharacter, helper, cwHelper,
            composer, scene, camera
        } = this;

        let currTime = player.currentTime + (api.motionOffset * 0.001)
        // player has a bug that sometime jump to end(duration)
        // so we just skip that frame
        if (player.currentTime == player.duration) {
            return
        }
        let delta = currTime - this.prevTime;


        if (Math.abs(delta) > 0) {
            // for time seeking using player control
            if (Math.abs(delta) > 0.1) {
                helper.enable('physics', false);
            }

            cwHelper.setTime(currTime);
            // animation updating
            helper.update(delta, currTime);

            // for time seeking using player control
            if (Math.abs(delta) > 0.1) {
                runtimeCharacter.physics.reset();
                helper.enable('physics', api['physics']);
                console.log('time seeked. physics reset.')
            }
            this.prevTime = currTime

        } else if (api['physics']) {

            let delta = this.clock.getDelta()
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

        composer.render(scene, camera);

    }
}

const app = new WebMMD()

app.start()
