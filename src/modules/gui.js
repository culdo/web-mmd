import * as THREE from 'three';

import localforage from 'localforage';
import path from 'path-browserify';
import { GUI } from 'lil-gui';
import { onProgress, loadMusicFromYT, blobToBase64, startFileDownload, createAudioLink } from './utils';

class MMDGui {
    constructor() {
        this.gui = new GUI({ closeFolders: true });
        this.open = () => this.gui.open();
        this.close = () => this.gui.close();
        this.mmd = null;
        this.guiFn = {};
        this.pmxDropdowns = {};
    }

    initGui(params) {
        this.mmd = params;

        this.gui.add(this.mmd.api, 'camera motion').onChange((state) => {
            this.mmd.helper.enable('cameraAnimation', state);
        });
        this.gui.add(this.mmd.api, 'physics').onChange((state) => {
            this.mmd.helper.enable('physics', state)
        });
        this._guiEffect();
        this._guiCamera();
        this._guiMorph();
        this._guiFile();
        this._guiSync();
        this._guiColor();
        this._guiLight();
        this._guiShadow();
        this._guiDebug();
        this._guiPreset();
    }

    _guiEffect() {

        const folder = this.gui.addFolder('Effect');

        const api = this.mmd.api
        const postprocessor = this.mmd.postprocessor

        const bokehFolder = folder.addFolder('Bokeh');
        const matChanger = postprocessor.bokeh.buildMatChanger(api)
        const shaderUpdate = postprocessor.bokeh.buildShaderUpdate(api)

        for (const key in postprocessor.bokeh.effectController) {
            if (!(`bokeh ${key}` in api)) {
                api[`bokeh ${key}`] = postprocessor.bokeh.effectController[key]
            }
        }

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
        const camera = this.mmd.camera

        if (this.mmd.api.fov && this.mmd.api.zoom) {
            camera.fov = this.mmd.api.fov
            camera.zoom = this.mmd.api.zoom
            camera.updateProjectionMatrix();
        } else {
            this.mmd.api["fov"] = camera.fov
            this.mmd.api["zoom"] = camera.zoom
        }

        const folder = this.gui.addFolder('Camera');
        const guiFn = {
            reset: () => {
                this.mmd.api.fov = 50;
                this.mmd.api.zoom = 1;
                camera.fov = 50;
                camera.zoom = 1;
                camera.updateProjectionMatrix();
            }
        }
        folder.add(this.mmd.api, "fov", 0, 100, 1).listen().onChange((value) => {
            camera.fov = value
            camera.updateProjectionMatrix();
        })
        folder.add(this.mmd.api, "zoom", 0, 5, 0.1).listen().onChange((value) => {
            camera.zoom = value
            camera.updateProjectionMatrix();
        })
        folder.add(guiFn, "reset")

    }

    _guiFile() {
        const folder = this.gui.addFolder('MMD files');
        const mmd = this.mmd;
        let pmxDropdowns = this.pmxDropdowns;

        const pmxFiles = mmd.api.pmxFiles;
        const modelTextures = pmxFiles.modelTextures;
        const updateMorphFolder = this.updateMorphFolder

        const loadCharacter = (url, filename) => {
            mmd.ready = false;
            mmd.runtimeCharacter.mixer.uncacheRoot(mmd.character);
            mmd.scene.remove(mmd.character);
            mmd.scene.remove(mmd.ikHelper);
            mmd.scene.remove(mmd.physicsHelper);
            mmd.scene.remove(mmd.skeletonHelper);
            mmd.helper.remove(mmd.character);

            console.log("character removed")
            let params = {
                enableSdef: mmd.api['enable SDEF']
            };
            if (url.startsWith("data:")) {
                params = {
                    modelExtension: path.extname(filename).slice(1),
                    modelTextures: modelTextures.character[filename],
                    ...params
                };
            }
            // load character
            overlay.style.display = 'flex';
            mmd.loader.loadWithAnimation(url, mmd.api.motionFile, function (obj) {
                console.log("loading character...")

                let character = obj.mesh;
                character.castShadow = true;
                character.receiveShadow = mmd.api["self shadow"];
                mmd.scene.add(character);

                mmd.helper.add(character, {
                    animation: obj.animation,
                    physics: true
                });
                mmd.runtimeCharacter = mmd.helper.objects.get(character)

                mmd.ikHelper = mmd.runtimeCharacter.ikSolver.createHelper();
                mmd.ikHelper.visible = mmd.api["show IK bones"];
                mmd.scene.add(mmd.ikHelper);

                mmd.physicsHelper = mmd.runtimeCharacter.physics.createHelper();
                mmd.physicsHelper.visible = mmd.api["show rigid bodies"];
                mmd.scene.add(mmd.physicsHelper);

                mmd.skeletonHelper = new THREE.SkeletonHelper(character);
                mmd.skeletonHelper.visible = mmd.api['show skeleton'];
                mmd.scene.add(mmd.skeletonHelper);

                mmd.character = character;

                mmd.helper.enable('physics', false);
                mmd.helper.update(0.0, player.currentTime)
                mmd.runtimeCharacter.physics.reset();
                mmd.helper.enable('physics', true);

                console.log("loaded reset")

                mmd.ready = true;
                overlay.style.display = 'none';

                updateMorphFolder();
            }, onProgress, null, params)
            mmd.api.character = filename;
        };
        // TODO: use unzip tools to unzip model files, because it has many texture images
        this.guiFn.selectChar = () => {
            selectFile.webkitdirectory = true;
            selectFile.onchange = _buildLoadModelFn('character', loadCharacter)
            selectFile.click();
            selectFile.webkitdirectory = false;
        }

        const loadStage = (url, filename) => {
            mmd.scene.remove(mmd.stage);
            console.log("remove stage");
            let params = null;
            if (url.startsWith("data:")) {
                params = {
                    modelExtension: path.extname(filename).slice(1),
                    modelTextures: modelTextures.stage[filename],
                };
            }
            // load stage
            overlay.style.display = 'flex';
            mmd.loader.load(url, function (mesh) {
                console.log("load stage");

                mesh.castShadow = true;
                mesh.receiveShadow = mmd.api['ground shadow'];

                mmd.scene.add(mesh);
                mmd.stage = mesh;
                overlay.style.display = 'none';
            }, onProgress, null, params);
            mmd.api.stage = filename;
        }
        // TODO: same above
        this.guiFn.selectStage = () => {
            selectFile.webkitdirectory = true;
            selectFile.onchange = _buildLoadModelFn('stage', loadStage);
            selectFile.click();
            selectFile.webkitdirectory = false;
        }

        this.guiFn.changeYtMusic = () => {
            loadMusicFromYT(mmd.api);
        }

        this.guiFn.saveMusic = () => { }

        this.guiFn.selectMusic = () => {
            selectFile.onchange = _buildLoadFileFn((url, filename) => {
                player.src = url;
                mmd.api.musicURL = url;
                mmd.api.musicName = filename;
            });
            selectFile.click();
        }

        this.guiFn.selectCamera = () => {
            selectFile.onchange = _buildLoadFileFn((url, filename) => {
                mmd.helper.remove(mmd.camera);
                mmd.loader.loadAnimation(url, mmd.camera, function (cameraAnimation) {

                    mmd.helper.add(mmd.camera, {
                        animation: cameraAnimation,
                        enabled: mmd.api["camera motion"]
                    });

                }, onProgress, null);
                mmd.api.camera = filename;
                mmd.api.cameraFile = url;
            });
            selectFile.click();
        }
        this.guiFn.selectMotion = () => {
            selectFile.onchange = _buildLoadFileFn((url, filename) => {
                mmd.runtimeCharacter.mixer.uncacheRoot(mmd.character);
                mmd.helper.remove(mmd.character);
                mmd.api.motionFile = url;
                mmd.loader.loadAnimation(url, mmd.character, function (mmdAnimation) {
                    mmd.helper.add(mmd.character, {
                        animation: mmdAnimation,
                        physics: true
                    });
                    mmd.runtimeCharacter = mmd.helper.objects.get(mmd.character);

                }, onProgress, null);
                mmd.api.motion = filename;
                mmd.api.motionFile = url;
            });
            selectFile.click();
        }

        // add folder to avoid ordering problem when change character
        var characterFolder = folder.addFolder('character');
        var characterDropdown = characterFolder.add(mmd.api, 'character', Object.keys(pmxFiles.character)).listen().name("model").onChange(value => {
            console.log(value);
            loadCharacter(pmxFiles.character[value], value);
        });
        characterFolder.open();
        folder.add(this.guiFn, 'selectChar').name('select character pmx directory...')

        var stageFolder = folder.addFolder('stage');
        var stageDropdown = stageFolder.add(mmd.api, 'stage', Object.keys(pmxFiles.stage)).listen().name("model").onChange(value => {
            console.log(value);
            loadStage(pmxFiles.stage[value], value);
        });
        stageFolder.open();
        folder.add(this.guiFn, 'selectStage').name('select stage pmx directory...')

        pmxDropdowns = { character: characterDropdown, stage: stageDropdown };

        folder.add(mmd.api, 'musicName').name('music').listen()
        folder.add(mmd.api, 'musicYtURL').name('music from YT').listen()

        const saveBt = folder.add(this.guiFn, 'saveMusic').name('save music')
        const a = createAudioLink();
        saveBt.domElement.replaceWith(a)

        folder.add(this.guiFn, 'changeYtMusic').name('change use above url...')
        folder.add(this.guiFn, 'selectMusic').name('select audio file...')

        folder.add(mmd.api, 'camera').listen()
        folder.add(this.guiFn, 'selectCamera').name('select camera vmd file...')
        folder.add(mmd.api, 'motion').listen()
        folder.add(this.guiFn, 'selectMotion').name('select motion vmd file...')

        function _buildLoadFileFn(cb) {
            return async function () {
                if (this.files.length < 1) return;
                cb(await blobToBase64(this.files[0]), this.files[0].name);
            }
        }

        function _buildLoadModelFn(itemType, cb) {
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
                        cb(pmxFilesByType[value], value);
                    });

                // select first pmx as default
                cb(pmxFilesByType[firstKey], firstKey);

                // trigger Proxy
                mmd.api.pmxFiles = pmxFiles;
            }
        }
    }

    _guiMorph() {

        const buildOnChangeMorph = (key) => {
            return () =>
                this.mmd.character.morphTargetInfluences[this.mmd.character.morphTargetDictionary[key]] = this.mmd.api[key];
        }

        const folder = this.gui.addFolder('Morph');


        const updateMorphFolder = () => {
            const controllers = [...folder.controllers]
            for (const controller of controllers) {
                controller.destroy()
            }
            for (const key in this.mmd.character.morphTargetDictionary) {
                if (!(key in this.mmd.api)) {
                    this.mmd.api[key] = 0.0;
                }
                const onChangeMorph = buildOnChangeMorph(key)
                onChangeMorph()
                folder.add(this.mmd.api, key, 0.0, 1.0, 0.01).onChange(onChangeMorph)
            }
        }
        updateMorphFolder();

        this.updateMorphFolder = updateMorphFolder;
    }

    _guiSync() {
        const folder = this.gui.addFolder('Sync');
        folder.add(this.mmd.api, "motionOffset", -1000, 1000, 10).name("motion offset (ms)")
    }

    _guiColor() {
        const folder = this.gui.addFolder('Color');
        folder.addColor(this.mmd.api, 'fog color').onChange((value) => {
            this.mmd.scene.fog.color.setHex(value);
        });
    }

    _guiShadow() {
        const folder = this.gui.addFolder('Shadow');
        folder.add(this.mmd.api, 'ground shadow').onChange((state) => {
            this.mmd.stage.receiveShadow = state;
        });
        folder.add(this.mmd.api, 'self shadow').onChange((state) => {
            this.mmd.character.receiveShadow = state;
        });
    }

    _guiLight() {
        const folder = this.gui.addFolder('Light');

        const directLightFolder = folder.addFolder("Directional")
        directLightFolder.addColor(this.mmd.api, 'Directional').name("Color").onChange(setColor(this.mmd.dirLight.color));
        directLightFolder.add(this.mmd.api, 'Directional intensity', 0, 10, 0.1).name("Intensity").onChange(
            (value) => {
                this.mmd.dirLight.intensity = value
            }
        );

        const hemisphereLightFolder = folder.addFolder("Hemisphere")
        hemisphereLightFolder.addColor(this.mmd.api, 'Hemisphere sky').onChange(setColor(this.mmd.hemiLight.color));
        hemisphereLightFolder.addColor(this.mmd.api, 'Hemisphere ground').onChange(setColor(this.mmd.hemiLight.groundColor));
        hemisphereLightFolder.add(this.mmd.api, 'Hemisphere intensity', 0, 30, 0.1).name("Intensity").onChange(
            (value) => {
                this.mmd.hemiLight.intensity = value
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
        folder.add(this.mmd.api, 'enable SDEF').onChange((state) => {
            location.reload()
        })
        folder.add({
            'clear localforage': () => {
                if (confirm("Be carful!! You will lost all your Models files、Presets...etc.")) {
                    localforage.clear(() => {
                        location.reload();
                    });
                }
            }
        }, 'clear localforage')
    }

    _guiDebug() {
        const folder = this.gui.addFolder('Debug');

        folder.add(this.mmd.api, 'show FPS').onChange((state) => {
            document.getElementById("fps").style.display = state ? "block" : "none";
        });
        folder.add(this.mmd.api, 'show IK bones').onChange((state) => {
            this.mmd.ikHelper.visible = state;
        });
        folder.add(this.mmd.api, 'show rigid bodies').onChange((state) => {
            if (this.mmd.physicsHelper !== undefined) this.mmd.physicsHelper.visible = state;
        });
        folder.add(this.mmd.api, 'show skeleton').onChange((state) => {
            if (this.mmd.skeletonHelper !== undefined) this.mmd.skeletonHelper.visible = state;
        });
        folder.add(this.mmd.api, 'auto hide GUI').onChange((state) => {
            if (!this.mmd.player.paused) this.gui.hide();
        });
        folder.add(this.mmd.api, 'set pixelratio 1.0').onChange((state) => {
            if (state) {
                this.mmd.renderer.setPixelRatio(1.0);
                postprocessor.composer.setPixelRatio(1.0);
            } else {
                this.mmd.renderer.setPixelRatio(window.devicePixelRatio);
                postprocessor.composer.setPixelRatio(window.devicePixelRatio);
            }
        });
        this._guiRefresh(folder);

    }

    _guiPreset() {
        const mmd = this.mmd

        const folder = this.gui.addFolder('Preset');

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

        this.gui.onChange(async (event) => {
            if (event.property != "preset" && mmd.preset == "Default") {
                if (!(event.value instanceof Function)) {
                    await localforage.setItem(`Untitled_${event.property}`, event.value);
                }
                await _updatePresetList("Untitled");
                await _setPreset("Untitled");
                updateDropdown();
            }
        })
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
    }

}

export { MMDGui };
