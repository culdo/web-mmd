import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MMDLoader } from './MMDLoader.js';
import { MMDAnimationHelper } from './MMDAnimationHelper.js';
import { MMDGui } from './gui.js'
import { onProgress, loadMusicFromYT, withProgress } from './utils.js'
import { PostProcessor } from './postProcessor.js'

import path from 'path-browserify';
import localforage from 'localforage';
import { CameraMode, MMDCameraWorkHelper } from './MMDCameraWorkHelper.js';
import logging from 'webpack/lib/logging/runtime'

class WebMMD {
    constructor() {
        // Global properties

        // main helper
        this.helper = new MMDAnimationHelper();

        // Private properties
        this._timeoutID;
        this._prevTime = 0.0;
        this._clock = new THREE.Clock();
        this._gui = new MMDGui();

        this._logger = logging.getLogger("WebMMD")
    }

    async start() {
        await Promise.all([this._getConfig(), Ammo()]);
        await this._setup();
        await this._loadFiles();
        this._loadGui();

        this._animate();
    }

    async _getConfig() {
        const configSep = "."
        this.configSep = configSep

        const scope = this
        const configSaver = {
            set: function (target, key, value) {
                scope._gui.panel.title("Controls (Saving...)");
                const saveAsync = async () => {
                    const targetPreset = scope.preset == "Default" ? "Untitled" : scope.preset;
                    await localforage.setItem(`${targetPreset}${configSep}${key}`, value)
                    if(scope.preset == "Default" && scope._gui.changeToUntitled) {
                        await scope._gui.changeToUntitled()
                    }
                    scope._gui.panel.title("Controls");
                };
                saveAsync();
                // need to put this outside of async func(above) to set back to api for reading
                const result = Reflect.set(...arguments)
                return result
            }
        };

        const configResp = await fetch('presets/Default_config.json')

        const defaultConfig = await configResp.json()

        let userConfig = defaultConfig;

        const savedPresetName = await localforage.getItem("currentPreset")
        const preset = savedPresetName ?? "Default"
        if(!savedPresetName) {
            await localforage.setItem("currentPreset", "Default")
        }

        const savedPresetsList = await localforage.getItem("presetsList")
        const presetsList = savedPresetsList ?? new Set(["Default"])

        // always loads config from localforage (include data)
        await localforage.iterate((val, key) => {
            if (key.startsWith(`${preset}${configSep}`)) {
                const configKey = key.split(`${preset}${configSep}`)[1]
                userConfig[configKey] = val
            }
        })

        // if loaded config not includes data, we loads from Default data json.
        if (!savedPresetName || !("pmxFiles" in userConfig)) {
            const dataResp = withProgress(await fetch('presets/Default_data.json'), 38204932)
            const defaultData = await dataResp.json()
            for (const [key, val] of Object.entries(defaultData)) {
                await localforage.setItem(`${preset}${configSep}${key}`, val);
                userConfig[key] = val
            }
        }

        this._logger.info(userConfig)
        const api = new Proxy(userConfig, configSaver);

        Object.assign(this, { defaultConfig, api, preset, presetsList })
    }

    async _setup() {
        const { api } = this

        // music player
        if (api.musicURL.startsWith("data:")) {
            player.src = api.musicURL
        } else {
            loadMusicFromYT(api);
        }

        player.currentTime = api["currentTime"];
        player.volume = api['volume'];

        // Threejs container
        const container = document.createElement('div');
        document.body.appendChild(container);

        // scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(api['fog color'], 10, 500);

        // camera
        const camera = new THREE.PerspectiveCamera(api.fov, window.innerWidth / window.innerHeight, api.near, 2000);
        camera.zoom = api.zoom
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
        controls.autoRotate = api["auto rotate"]
        controls.autoRotateSpeed = api["auto rotate speed"]
        controls.target.set(0, 10, 0);

        // effect composer
        const postprocessor = new PostProcessor(scene, camera, renderer, { isSdefEnabled: api["enable SDEF"] })

        const composer = postprocessor.composer
        composer.setPixelRatio(api['set pixelratio 1.0'] ? 1.0 : window.devicePixelRatio);

        // FPS stats
        const stats = new Stats();
        stats.dom.id = "fps";
        stats.dom.style.display = api["show FPS"] ? "block" : "none";
        container.appendChild(stats.dom);

        Object.assign(this, {
            camera, player, controls, scene, stats,
            postprocessor, dirLight, hemiLight, renderer, composer
        })
    }

    // get current time for motions (character, camera...etc)
    get motionTime() {
        const currTime = player.currentTime + (this.api.motionOffset * 0.001)
        if(currTime < 0) {
            return 0
        }
        return currTime
    }

    async _loadFiles() {
        const { api, scene, camera, controls, helper, postprocessor } = this

        // loader
        const loader = new MMDLoader();

        // load stage
        const _loadStage = async () => {
            const stageFile = api.pmxFiles.stage[api.stage]
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
        const _loadCamera = async () => {
            const cameraAnimation = await loader.loadAnimation(api.cameraFile, camera, onProgress, null);
            helper.add(camera, {
                animation: cameraAnimation,
                enabled: api["camera mode"] == CameraMode.MOTION_FILE
            });

            this.cwHelper = new MMDCameraWorkHelper(this);
            await this.cwHelper.init();

            controls.domElement.addEventListener('mousedown', () => {
                camera.up.set(0, 1, 0);
                camera.updateProjectionMatrix();
            });
            controls.addEventListener('start', () => {
                this.cwHelper.isOrbitControl = true;
            });
            controls.addEventListener('end', () => {
                this.cwHelper.orbitCameraPos = camera.position;
                this.cwHelper.isOrbitControl = false;
            });

            overlay.style.display = "none";
        }

        // load character
        const _loadCharacter = async () => {
            const characterFile = api.pmxFiles.character[api.character]
            let characterParams = {
                enableSdef: api['enable SDEF'],
                followSmooth: api["follow smooth"]
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
                loader,
                character,
                runtimeCharacter,
                ikHelper,
                physicsHelper,
                skeletonHelper
            })
        }

        await Promise.all([_loadStage(), _loadCharacter()]);
        // load camera at last let camera work clips durations be not changed ( because helper._syncDuration() )
        await _loadCamera();
    }

    _loadGui() {
        this.ready = true;
        this._gui.init(this);
    }

    _animate() {
        if (this.ready) {
            this.stats.begin();
            this._render();
            this.stats.end();
        }

        requestAnimationFrame(this._animate.bind(this));
    }

    _render() {
        const {
            api,
            runtimeCharacter, helper, cwHelper,
            composer, scene, camera, controls
        } = this;

        const currTime = this.motionTime
        // player has a bug that sometime jump to end(duration)
        // so we just skip that frame
        if (player.currentTime == player.duration) {
            return
        }
        const delta = currTime - this._prevTime;

        controls.update();
        if (Math.abs(delta) > 0) {
            // for time seeking using player control
            if (Math.abs(delta) > 0.1) {
                helper.enable('physics', false);
            }

            // camera updating
            cwHelper.setTime(currTime);
            // animation updating
            helper.update(delta, currTime);

            // for time seeking using player control
            if (Math.abs(delta) > 0.1) {
                runtimeCharacter.physics.reset();
                helper.enable('physics', api['physics']);
                this._logger.info('time seeked. physics reset.')
            }
            this._prevTime = currTime

        } else if (api['physics']) {

            let delta = this._clock.getDelta()
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

export default WebMMD
