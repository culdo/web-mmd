import * as THREE from 'three';

import localforage from 'localforage';
import path from 'path-browserify';
import { GUI } from 'lil-gui';
import { onProgress, loadMusicFromYT, blobToBase64, startFileDownload, createAudioLink, withTimeElapse } from './utils';
import { CameraMode } from './MMDCameraWorkHelper';
import logging from 'webpack/lib/logging/runtime'

class MMDGui {
    constructor() {
        this.panel = new GUI({ closeFolders: true });
        this._mmd = null;
        this._guiFn = {};
        this._pmxDropdowns = {};
        this._logger = logging.getLogger("MMDGui")
    }

    init(params) {
        this._mmd = params;
        this._addEventHandlers();

        this._checkCameraMode = this._mmd.cwHelper.checkCameraMode.bind(this._mmd.cwHelper)
        this.panel.add(this._mmd.api, 'camera mode', {
            "Motion File": CameraMode.MOTION_FILE,
            "Composition": CameraMode.COMPOSITION,
            "Fixed Follow": CameraMode.FIXED_FOLLOW
        }).listen().onChange((_) => {
            this._checkCameraMode()
        });

        this._guiPhysic();
        this._guiEffect();
        this._guiCamera();
        this._guiMorph();
        if(this._mmd.api["enable PBR"]) {
            this._guiMaterial();
        }
        this._guiFile();
        this._guiSync();
        this._guiColor();
        this._guiLight();
        this._guiShadow();
        this._guiDebug();
        this.changeToUntitled = this._guiPreset();
    }

    enableAll(state = true) {
        for (const controller of this.panel.controllersRecursive()) {
            controller.enable(state)
        }
    }

    _addEventHandlers() {
        const { api, camera, composer, renderer, controls, cwHelper } = this._mmd
        const scope = this._mmd

        player.onvolumechange = () => {
            api['volume'] = player.volume;
            if (player.muted) {
                api['volume'] = 0.0;
            }
        }

        player.onplay = () => {
            scope.runtimeCharacter.physics.reset();
            if (api["auto hide GUI"]) this.panel.hide();
        }
        player.onpause = () => {
            this.panel.show();
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

        // orbit control
        controls.domElement.addEventListener('mousedown', () => {
            camera.up.set(0, 1, 0);
            camera.updateProjectionMatrix();
        });
        controls.addEventListener('start', () => {
            cwHelper.isOrbitControl = true;
        });
        controls.addEventListener('end', () => {
            cwHelper.orbitCameraPos = camera.position;
            cwHelper.isOrbitControl = false;
        });

        // control bar
        document.addEventListener('mousemove', (e) => {

            player.style.opacity = 0.5;
            button.style.opacity = 0.5;
            document.body.style.cursor = "default"
            if (this._timeoutID !== undefined) {
                clearTimeout(this._timeoutID);
            }

            this._timeoutID = setTimeout(function () {
                player.style.opacity = 0;
                button.style.opacity = 0;
                if (!player.paused) {
                    document.body.style.cursor = "none"
                }
            }, 1000);
        });

        // window resize
        window.addEventListener('resize', (e) => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            composer.setSize(window.innerWidth, window.innerHeight);
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.key == " ") {
                if (player.paused) {
                    player.play()
                } else {
                    player.pause()
                }
            } else if (e.key == "`") {
                const isEditMode = this._mmd.api["camera mode"] != CameraMode.MOTION_FILE
                if (isEditMode) {
                    this._mmd.api["camera mode"] = CameraMode.MOTION_FILE
                } else {
                    this._mmd.api["camera mode"] = CameraMode.COMPOSITION
                }

                this._checkCameraMode()
            }
        })
    }

    _guiPhysic() {
        const folder = this.panel.addFolder('Physic');
        folder.add(this._mmd.api, 'physics').onChange((state) => {
            this._mmd.helper.enable('physics', state)
        });
        folder.add(this._mmd.api, 'gravity', -50, 50, 0.1).onChange((val) => {
            this._mmd.helper.get(this._mmd.character).physics.setGravity(new THREE.Vector3(0, val, 0))
        });
    }

    _guiEffect() {

        const folder = this.panel.addFolder('Effect');

        const api = this._mmd.api
        const postprocessor = this._mmd.postprocessor

        const bokehFolder = folder.addFolder('Bokeh');
        const matChanger = postprocessor.bokeh.buildMatChanger(api)
        const shaderUpdate = postprocessor.bokeh.buildShaderUpdate(api)

        matChanger();
        shaderUpdate();

        bokehFolder.add(api, 'bokeh enabled').onChange(matChanger);
        bokehFolder.add(api, 'bokeh shaderFocus').onChange(matChanger);
        bokehFolder.add(api, 'bokeh focalDepth', 0.0, 200.0).listen().onChange(matChanger);

        bokehFolder.add(api, 'bokeh fstop', 0.1, 22, 0.001).onChange(matChanger);
        bokehFolder.add(api, 'bokeh maxblur', 0.0, 5.0, 0.025).onChange(matChanger);

        bokehFolder.add(api, 'bokeh showFocus').onChange(matChanger);
        bokehFolder.add(api, 'bokeh manualdof').onChange(matChanger);
        bokehFolder.add(api, 'bokeh vignetting').onChange(matChanger);

        bokehFolder.add(api, 'bokeh depthblur').onChange(matChanger);

        bokehFolder.add(api, 'bokeh threshold', 0, 1, 0.001).onChange(matChanger);
        bokehFolder.add(api, 'bokeh gain', 0, 100, 0.001).onChange(matChanger);
        bokehFolder.add(api, 'bokeh bias', 0, 3, 0.001).onChange(matChanger);
        bokehFolder.add(api, 'bokeh fringe', 0, 5, 0.001).onChange(matChanger);

        bokehFolder.add(api, 'bokeh focalLength', 16, 80, 0.001).onChange(matChanger);

        bokehFolder.add(api, 'bokeh noise').onChange(matChanger);

        bokehFolder.add(api, 'bokeh dithering', 0, 0.001, 0.0001).onChange(matChanger);

        bokehFolder.add(api, 'bokeh pentagon').onChange(matChanger);

        bokehFolder.add(api, 'bokeh rings', 1, 8).step(1).onChange(shaderUpdate);
        bokehFolder.add(api, 'bokeh samples', 1, 13).step(1).onChange(shaderUpdate);


        const outlineFolder = folder.addFolder('Outline');
        postprocessor.outline.enabled = api['show outline']

        outlineFolder.add(api, 'show outline').onChange((state) => {
            postprocessor.outline.enabled = state;
        });
    }

    _guiCamera() {
        const camera = this._mmd.camera

        const folder = this.panel.addFolder('Camera');
        const guiFn = {
            reset: () => {
                this._mmd.api.fov = 45;
                this._mmd.api.zoom = 1;
                this._mmd.api.near = 0.1;
                camera.fov = 45;
                camera.zoom = 1;
                camera.near = 0.1;

                camera.updateProjectionMatrix();
            }
        }
        folder.add(this._mmd.api, "fov", 0, 100, 1).listen().onChange((value) => {
            camera.fov = value
            camera.updateProjectionMatrix();
        })
        folder.add(this._mmd.api, "zoom", 0, 5, 0.1).listen().onChange((value) => {
            camera.zoom = value
            camera.updateProjectionMatrix();
        })
        folder.add(this._mmd.api, "near", 0, 100, 0.1).listen().onChange((value) => {
            camera.near = value
            camera.updateProjectionMatrix();
        })
        folder.add(guiFn, "reset")

        folder.add(this._mmd.api, 'auto rotate',).onChange((state) => {
            this._mmd.controls.autoRotate = state
            this.rotateSpeedControl.enable(state)
        });
        this.rotateSpeedControl = folder.add(this._mmd.api, 'auto rotate speed', 2, 100, 1).onChange((val) => {
            this._mmd.controls.autoRotateSpeed = val
        }).enable(this._mmd.api['auto rotate']);

        const cameraWorkFolder = folder.addFolder('Composition Mode');

        cameraWorkFolder.add(this._mmd.api, 'collectionKeys').onChange((value) => {
            this._mmd.cwHelper.updateKeyBinding()
        });
        cameraWorkFolder.add(this._mmd.api, 'cutKeys').onChange((value) => {
            this._mmd.cwHelper.updateKeyBinding()
        });

        const fixFollowFolder = folder.addFolder('Fix-Follow Mode');
        fixFollowFolder.add(this._mmd.api, 'follow smooth', 3, 101, 1).onChange(() => {
            setTimeout(() => location.reload(), 2000)
        });

    }

    _guiMaterial() {
        const data = {
            targetMaterial: 0
        }

        const materialMap = {}
        for (const [i, material] of this._mmd.character.material.entries()) {
            materialMap[material.name] = i
        }
        const folder = this.panel.addFolder('Material');

        function needsUpdate(material, geometry) {
            return function () {
                material.side = parseInt(material.side); //Ensure number
                material.needsUpdate = true;
                geometry.attributes.position.needsUpdate = true;
                geometry.attributes.normal.needsUpdate = true;
            };
        }
        const constants = {
            side: {
                'THREE.FrontSide': THREE.FrontSide,
                'THREE.BackSide': THREE.BackSide,
                'THREE.DoubleSide': THREE.DoubleSide
            }
        }
        const updateControls = (idx) => {
            const material = this._mmd.character.material[idx]
            const geometry = this._mmd.character.geometry
            folder.add(material, 'transparent');
            folder.add(material, 'opacity', 0, 1).step(0.01);
            folder.add(material, 'depthTest');
            folder.add(material, 'depthWrite');
            folder.add(material, 'alphaTest', 0, 1).step(0.01);
            folder.add(material, 'alphaHash');
            folder.add(material, 'visible');
            folder.add(material, 'side', constants.side);

            const data = {
                color: material.color.getHex(),
                emissive: material.emissive.getHex(),
                // envMaps: envMapKeys[ 0 ],
                // map: diffuseMapKeys[ 0 ],
                // roughnessMap: roughnessMapKeys[ 0 ],
                // alphaMap: alphaMapKeys[ 0 ],
                // metalnessMap: alphaMapKeys[ 0 ],
                sheenColor: material.sheenColor.getHex(),
                specularColor: material.specularColor.getHex(),
                // iridescenceMap: alphaMapKeys[ 0 ]
            };

            folder.addColor(data, 'color').onChange(hex => material.color.setHex(hex));
            folder.addColor(data, 'emissive').onChange(hex => material.emissive.setHex(hex));

            folder.add(material, 'roughness', 0, 1);
            folder.add(material, 'metalness', 0, 1);
            folder.add(material, 'ior', 1, 2.333);
            folder.add(material, 'reflectivity', 0, 1);
            folder.add(material, 'iridescence', 0, 1);
            folder.add(material, 'iridescenceIOR', 1, 2.333);
            folder.add(material, 'sheen', 0, 1);
            folder.add(material, 'sheenRoughness', 0, 1);
            folder.addColor(data, 'sheenColor').onChange(hex => material.sheenColor.setHex(hex));
            folder.add(material, 'clearcoat', 0, 1).step(0.01);
            folder.add(material, 'clearcoatRoughness', 0, 1).step(0.01);
            folder.add(material, 'specularIntensity', 0, 1);
            folder.addColor(data, 'specularColor').onChange(hex => material.specularColor.setHex(hex));
            folder.add(material, 'flatShading').onChange(needsUpdate(material, geometry));
            folder.add(material, 'wireframe');
            folder.add(material, 'vertexColors').onChange(needsUpdate(material, geometry));
            folder.add(material, 'fog').onChange(needsUpdate(material, geometry));
            // folder.add( data, 'envMaps', envMapKeysPBR ).onChange( updateTexture( material, 'envMap', envMaps ) );
            // folder.add( data, 'map', diffuseMapKeys ).onChange( updateTexture( material, 'map', diffuseMaps ) );
            // folder.add( data, 'roughnessMap', roughnessMapKeys ).onChange( updateTexture( material, 'roughnessMap', roughnessMaps ) );
            // folder.add( data, 'alphaMap', alphaMapKeys ).onChange( updateTexture( material, 'alphaMap', alphaMaps ) );
            // folder.add( data, 'metalnessMap', alphaMapKeys ).onChange( updateTexture( material, 'metalnessMap', alphaMaps ) );
            // folder.add( data, 'iridescenceMap', alphaMapKeys ).onChange( updateTexture( material, 'iridescenceMap', alphaMaps ) );

        }
        folder.add(data, "targetMaterial", materialMap).onChange((idx) => {
            for (const [i, controls] of [...folder.controllers].entries()) {
                if (i > 0) {
                    controls.destroy()
                }
            }
            updateControls(idx)
        })
        updateControls(data.targetMaterial)
    }

    _guiFile() {
        const folder = this.panel.addFolder('MMD files');
        const mmd = this._mmd;
        let pmxDropdowns = this._pmxDropdowns;

        const pmxFiles = mmd.api.pmxFiles;
        const modelTextures = pmxFiles.modelTextures;

        const loadCharacter = async (url, filename) => {
            mmd.runtimeCharacter.mixer.uncacheRoot(mmd.character);
            mmd.scene.remove(mmd.character);
            mmd.scene.remove(mmd.ikHelper);
            mmd.scene.remove(mmd.physicsHelper);
            mmd.scene.remove(mmd.skeletonHelper);
            mmd.helper.remove(mmd.character);
            this._logger.info("character removed")

            await mmd.loadCharacter(url, filename);
        };
        // TODO: use unzip tools to unzip model files, because it has many texture images
        this._guiFn.selectChar = () => {
            selectFile.webkitdirectory = true;
            selectFile.onchange = _buildLoadModelFn('character', loadCharacter)
            selectFile.click();
            selectFile.webkitdirectory = false;
        }

        const loadStage = async (url, filename) => {
            mmd.scene.remove(mmd.stage);
            this._logger.info("remove stage");

            await mmd.loadStage(url, filename)
        }
        // TODO: same above
        this._guiFn.selectStage = () => {
            selectFile.webkitdirectory = true;
            selectFile.onchange = _buildLoadModelFn('stage', loadStage);
            selectFile.click();
            selectFile.webkitdirectory = false;
        }

        this._guiFn.changeYtMusic = () => {
            loadMusicFromYT(mmd.api);
        }

        this._guiFn.saveMusic = () => { }

        this._guiFn.selectMusic = () => {
            selectFile.onchange = _buildLoadFileFn((url, filename) => {
                player.src = url;
                mmd.api.musicURL = url;
                mmd.api.musicName = filename;
            });
            selectFile.click();
        }

        this._guiFn.selectCamera = () => {
            selectFile.onchange = _buildLoadFileFn(async (url, filename) => {
                mmd.helper.remove(mmd.camera);

                mmd.cwHelper._compositeClips = []
                await mmd.loadCamera(url, filename)
            });
            selectFile.click();
        }
        this._guiFn.selectMotion = () => {
            selectFile.onchange = _buildLoadFileFn(async (url, filename) => {
                mmd.runtimeCharacter.mixer.uncacheRoot(mmd.character);
                mmd.helper.remove(mmd.character);
                mmd.api.motionFile = url;

                const mmdAnimation = await mmd.loader.loadAnimation(url, mmd.character, onProgress, null);
                mmd.helper.add(mmd.character, {
                    animation: mmdAnimation,
                    physics: true
                });
                mmd.runtimeCharacter = mmd.helper.objects.get(mmd.character);

                mmd.api.motion = filename;
                mmd.api.motionFile = url;
            });
            selectFile.click();
        }

        // add folder to avoid ordering problem when change character
        var characterFolder = folder.addFolder('character');
        var characterDropdown = characterFolder.add(mmd.api, 'character', Object.keys(pmxFiles.character)).listen().name("model").onChange(value => {
            loadCharacter(pmxFiles.character[value], value);
        });
        characterFolder.open();
        folder.add(this._guiFn, 'selectChar').name('select character pmx directory...')

        var stageFolder = folder.addFolder('stage');
        var stageDropdown = stageFolder.add(mmd.api, 'stage', Object.keys(pmxFiles.stage)).listen().name("model").onChange(value => {
            loadStage(pmxFiles.stage[value], value);
        });
        stageFolder.open();
        folder.add(this._guiFn, 'selectStage').name('select stage pmx directory...')

        pmxDropdowns = { character: characterDropdown, stage: stageDropdown };

        folder.add(mmd.api, 'musicName').name('music').listen()
        folder.add(mmd.api, 'musicYtURL').name('music from YT').listen()

        const saveBt = folder.add(this._guiFn, 'saveMusic').name('save music')
        const a = createAudioLink();
        saveBt.domElement.replaceWith(a)

        folder.add(this._guiFn, 'changeYtMusic').name('change use above url...')
        folder.add(this._guiFn, 'selectMusic').name('select audio file...')

        folder.add(mmd.api, 'camera').listen()
        folder.add(this._guiFn, 'selectCamera').name('select camera vmd file...')
        folder.add(mmd.api, 'motion').listen()
        folder.add(this._guiFn, 'selectMotion').name('select motion vmd file...')

        function _buildLoadFileFn(cb) {
            return async function () {
                if (this.files.length < 1) return;
                cb(await blobToBase64(this.files[0]), this.files[0].name);
            }
        }

        function _buildLoadModelFn(itemType, cb) {
            const cbWrapper = (...args) => {
                // start loading
                mmd.ready = false;
                overlay.style.display = 'flex';

                cb(...args)

                // done
                mmd.ready = true;
                overlay.style.display = 'none';

            }
            return async function () {
                if (this.files.length < 1) return;
                let pmxFilesByType = pmxFiles[itemType] = {};
                let texFilesByType = modelTextures[itemType] = {};

                // load model and textures from unzipped folder
                let firstKey;
                const resourceMap = {};
                for (const f of this.files) {
                    let relativePath = f.webkitRelativePath;
                    const resourcePath = relativePath.split("/").slice(1).join("/")

                    let url = await blobToBase64(f);

                    // save model file
                    if (f.name.includes(".pmx") || f.name.includes(".pmd")) {
                        const modelName = f.name
                        texFilesByType[modelName] = resourceMap;

                        if (!firstKey) firstKey = modelName
                        pmxFilesByType[modelName] = url;
                        // save model textures
                    } else {
                        resourceMap[resourcePath] = url;
                    }
                }
                // full replace the old dropdown
                pmxDropdowns[itemType] = pmxDropdowns[itemType]
                    .options(Object.keys(pmxFilesByType))
                    .listen()
                    .onChange(value => {
                        cbWrapper(pmxFilesByType[value], value);
                    });

                // select first pmx as default
                cbWrapper(pmxFilesByType[firstKey], firstKey);

                // trigger Proxy
                mmd.api.pmxFiles = pmxFiles;
            }
        }
    }

    _guiMorph() {

        const _buildOnChangeMorph = (key) => {
            return () =>
                this._mmd.character.morphTargetInfluences[this._mmd.character.morphTargetDictionary[key]] = this._mmd.api[key];
        }

        const folder = this.panel.addFolder('Morph');


        this.updateMorphFolder = () => {
            const controllers = [...folder.controllers]
            for (const controller of controllers) {
                controller.destroy()
            }
            for (const key in this._mmd.character.morphTargetDictionary) {
                if (!(key in this._mmd.api)) {
                    this._mmd.api[key] = 0.0;
                }
                const onChangeMorph = _buildOnChangeMorph(key)
                onChangeMorph()
                folder.add(this._mmd.api, key, 0.0, 1.0, 0.01).onChange(onChangeMorph)
            }
        }
        this.updateMorphFolder();
    }

    _guiSync() {
        const folder = this.panel.addFolder('Sync');
        folder.add(this._mmd.api, "motionOffset", -1000, 1000, 10).name("motion offset (ms)")
    }

    _guiColor() {
        const folder = this.panel.addFolder('Color');
        folder.addColor(this._mmd.api, 'fog color').onChange((value) => {
            this._mmd.scene.fog.color.setHex(value);
        });
    }

    _guiShadow() {
        const folder = this.panel.addFolder('Shadow');
        folder.add(this._mmd.api, 'ground shadow').onChange((state) => {
            this._mmd.stage.receiveShadow = state;
        });
        folder.add(this._mmd.api, 'self shadow').onChange((state) => {
            this._mmd.character.receiveShadow = state;
        });
    }

    _guiLight() {
        const folder = this.panel.addFolder('Light');

        const directLightFolder = folder.addFolder("Directional")
        directLightFolder.addColor(this._mmd.api, 'Directional').name("Color").onChange(setColor(this._mmd.dirLight.color));
        directLightFolder.add(this._mmd.api, 'Directional intensity', 0, 10, 0.1).name("Intensity").onChange(
            (value) => {
                this._mmd.dirLight.intensity = value
            }
        );

        const hemisphereLightFolder = folder.addFolder("Hemisphere")
        hemisphereLightFolder.addColor(this._mmd.api, 'Hemisphere sky').onChange(setColor(this._mmd.hemiLight.color));
        hemisphereLightFolder.addColor(this._mmd.api, 'Hemisphere ground').onChange(setColor(this._mmd.hemiLight.groundColor));
        hemisphereLightFolder.add(this._mmd.api, 'Hemisphere intensity', 0, 30, 0.1).name("Intensity").onChange(
            (value) => {
                this._mmd.hemiLight.intensity = value
            }
        );

        // handle gui color change
        function setColor(color) {
            return (value) => {
                color.setHex(value);
            }
        }
    }

    _guiRefresh(parentFolder) {
        const folder = parentFolder.addFolder('Need Refresh');
        folder.add(this._mmd.api, 'enable SDEF').onChange((state) => {
            location.reload()
        })
        folder.add(this._mmd.api, 'enable PBR').onChange((state) => {
            location.reload()
        })
        folder.add({
            'clear localforage': () => {
                if (confirm("Be careful!! You will lost all your Models files、Presets...etc.")) {
                    localforage.clear(() => {
                        location.reload();
                    });
                }
            }
        }, 'clear localforage')
    }

    _guiDebug() {
        const folder = this.panel.addFolder('Debug');

        folder.add(this._mmd.api, 'show FPS').onChange((state) => {
            document.getElementById("fps").style.display = state ? "block" : "none";
        });
        folder.add(this._mmd.api, 'show IK bones').onChange((state) => {
            this._mmd.ikHelper.visible = state;
        });
        folder.add(this._mmd.api, 'show rigid bodies').onChange((state) => {
            if (this._mmd.physicsHelper !== undefined) this._mmd.physicsHelper.visible = state;
        });
        folder.add(this._mmd.api, 'show skeleton').onChange((state) => {
            if (this._mmd.skeletonHelper !== undefined) this._mmd.skeletonHelper.visible = state;
        });
        folder.add(this._mmd.api, 'auto hide GUI').onChange((state) => {
            if (!this._mmd.player.paused) this.panel.hide();
        });
        folder.add(this._mmd.api, 'set pixelratio 1.0').onChange((state) => {
            if (state) {
                this._mmd.renderer.setPixelRatio(1.0);
                postprocessor.composer.setPixelRatio(1.0);
            } else {
                this._mmd.renderer.setPixelRatio(window.devicePixelRatio);
                postprocessor.composer.setPixelRatio(window.devicePixelRatio);
            }
        });
        this._guiRefresh(folder);

    }

    _guiPreset() {
        const mmd = this._mmd

        const folder = this.panel.addFolder('Preset');

        const _setPreset = async (name) => {
            mmd.preset = name;
            await localforage.setItem("currentPreset", name);
        }
        const _loadPreset = async (name) => {
            await _setPreset(name);
            location.reload();
        }

        const updateDropdown = () => {
            if (mmd.preset == "Default") {
                deleteBt.disable();
            } else {
                deleteBt.enable();
            }
            presetDropdown = presetDropdown
                .options(Array.from(mmd.presetsList))
                .listen()
                .onChange(_loadPreset);
        }

        const _updatePresetList = async (newName) => {
            mmd.presetsList.add(newName)
            await localforage.setItem("presetsList", mmd.presetsList)
        }

        const presetFn = {
            newPreset: async () => {
                let newName = prompt("New preset name:");
                if (newName) {
                    await _updatePresetList(newName)
                    await _loadPreset(newName);
                }
            },
            copyPreset: async () => {
                let newName = prompt("New preset name:");
                if (newName) {
                    mmd.preset = newName;
                    Object.assign(mmd.api, mmd.api);
                    await _setPreset(newName);
                    await _updatePresetList(newName)
                    updateDropdown();
                }
            },
            deletePreset: async () => {
                if (confirm("Are you sure?")) {
                    await localforage.iterate(function (value, key, iterationNumber) {
                        if (key.startsWith(mmd.preset)) {
                            localforage.removeItem(key)
                        }
                    })
                    mmd.presetsList.delete(mmd.preset)
                    await localforage.setItem("presetsList", mmd.presetsList)

                    const presetsArr = Array.from(mmd.presetsList)
                    await _loadPreset(presetsArr[presetsArr.length - 1]);
                }
            },
            savePreset: () => {
                const presetBlob = new Blob([JSON.stringify(mmd.api)], { type: 'application/json' })
                const dlUrl = URL.createObjectURL(presetBlob)
                startFileDownload(dlUrl, `${mmd.preset}.json`)
            },
            loadPreset: () => {
                selectFile.onchange = async function (e) {
                    const presetFile = this.files[0]
                    const newName = path.parse(presetFile.name).name
                    await _updatePresetList(newName)

                    let reader = new FileReader();
                    reader.readAsText(presetFile);
                    reader.onloadend = async () => {
                        mmd.preset = newName;
                        Object.assign(mmd.api, JSON.parse(reader.result));
                        await _loadPreset(newName);
                    }
                };
                selectFile.click();
            }
        }

        const changeToUntitled = async () => {
            await _updatePresetList("Untitled")
            await _setPreset("Untitled")
            updateDropdown()
        }
        const presetsFolder = folder.addFolder('presets');
        let presetDropdown = presetsFolder.add(
            mmd,
            'preset',
            Array.from(mmd.presetsList)
        )
        presetsFolder.open()

        folder.add(presetFn, 'newPreset').name('New preset...');
        folder.add(presetFn, 'copyPreset').name('Copy preset...');
        const deleteBt = folder.add(presetFn, 'deletePreset').name('Delete current preset...');
        folder.add(presetFn, 'savePreset').name('Save preset...');
        folder.add(presetFn, 'loadPreset').name('Load preset...');

        // init dropdown
        updateDropdown();
        return changeToUntitled
    }

}

export { MMDGui };
