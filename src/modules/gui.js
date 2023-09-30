import * as THREE from 'three';

import localforage from 'localforage';
import path from 'path-browserify';
import { GUI } from 'lil-gui';
import { onProgress, loadMusicFromYT, blobToBase64 } from './utils';

class MMDGui {
    constructor() {
        this.gui = new GUI();
        this.open = () => this.gui.open();
        this.close = () => this.gui.close();
        this.mmd = null;
        this.guiFn = {};
        this.pmxDropdowns = {};
    }

    initGui(params) {
        this.mmd = params;

        this.gui.add(this.mmd.api, 'camera motion').onChange((state) => {
            if (!state) {
                this.mmd.camera.up.set(0, 1, 0);
                this.mmd.camera.updateProjectionMatrix();
            }
            this.mmd.helper.enable('cameraAnimation', state);
        });
        this.gui.add(this.mmd.api, 'physics').onChange((state) => {
            this.mmd.helper.enable('physics', state)
        });
        this._guiFile();
        this._guiColor();
        this._guiLight();
        this._guiShadow();
        this._guiDebug();
        this._guiPreset();
    }

    _guiPreset() {
        const mmd = this.mmd

        const folder = this.gui.addFolder('Preset');

        const _setPreset = (name) => {
            mmd.preset = name;
            localforage.setItem("currentPreset", name);
        }
        const _loadPreset = (name) => {
            _setPreset(name);
            location.reload();
        }

        const updateDropdown = () => {
            if (mmd.preset == "Default") {
                deleteBt.disable();
            } else {
                deleteBt.enable();
            }
            presetDropdown = presetDropdown
                .options(Object.keys(mmd.presets))
                .listen()
                .onChange(_loadPreset);
        }

        const presetFn = {
            newPreset: () => {
                let newName = prompt("New preset name:");
                if (newName) {
                    mmd.presets[newName] = mmd.defaultConfig;
                    // trigger Proxy
                    mmd.api.currentTime = mmd.api.currentTime

                    _loadPreset(newName);
                }
            },
            copyPreset: () => {
                let newName = prompt("New preset name:");
                if (newName) {
                    // avoid prev preset shared with new preset
                    mmd.presets[mmd.preset] = JSON.parse(JSON.stringify(mmd.api));

                    _setPreset(newName);
                    mmd.presets[newName] = mmd.api;
                    // trigger Proxy
                    mmd.api.currentTime = mmd.api.currentTime
                    updateDropdown();
                }
            },
            deletePreset: () => {
                if (confirm("Are you sure?")) {
                    delete mmd.presets[mmd.preset]
                    // trigger Proxy
                    mmd.api.currentTime = mmd.api.currentTime

                    const presetNames = Object.keys(mmd.presets);
                    _loadPreset(presetNames[presetNames.length - 1]);
                }
            },
            savePreset: () => {
                const presetBlob = new Blob([JSON.stringify(mmd.api)], {type: 'application/json'})
                const dlUrl = URL.createObjectURL(presetBlob)
                const a = document.createElement('a')
                a.href = dlUrl
                a.download = `${mmd.preset}.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
            }
        }

        this.gui.onChange((event)=>{
            if(event.property !="preset" && mmd.preset == "Default") {
                _setPreset("Untitled");
                mmd.presets["Untitled"] = mmd.api;
                // trigger Proxy
                mmd.api.currentTime = mmd.api.currentTime
                updateDropdown();
            }
        })
        const presetsFolder = folder.addFolder('Presets');
        let presetDropdown = presetsFolder.add(
            mmd,
            'preset',
            Object.keys(mmd.presets)
        )

        folder.add(presetFn, 'newPreset').name('New preset...');
        folder.add(presetFn, 'copyPreset').name('Copy preset...');
        const deleteBt = folder.add(presetFn, 'deletePreset').name('Delete current preset...');
        folder.add(presetFn, 'savePreset').name('Save preset...');

        // init dropdown
        updateDropdown();
    }

    _guiFile() {
        const folder = this.gui.addFolder('MMD files');
        const mmd = this.mmd;
        let pmxDropdowns = this.pmxDropdowns;

        const pmxFiles = mmd.api.pmxFiles;
        const modelTextures = pmxFiles.modelTextures;

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

                mmd.runtimeCharacter.physics.reset();
                console.log("loaded reset")
                mmd.ready = true;
                overlay.style.display = 'none';

            }, onProgress, null, params)
            mmd.api.character = filename;
            mmd.api.characterFile = url;
        };
        // TODO: use unzip tools to unzip model files, because it has many texture images
        this.guiFn.selectChar = () => {
            selectFile.webkitdirectory = true;
            selectFile.onchange = _makeLoadModelFn('character', loadCharacter)
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
            mmd.api.stageFile = url;
        }
        // TODO: same above
        this.guiFn.selectStage = () => {
            selectFile.webkitdirectory = true;
            selectFile.onchange = _makeLoadModelFn('stage', loadStage);
            selectFile.click();
            selectFile.webkitdirectory = false;
        }

        this.guiFn.selectMusic = () => {
            loadMusicFromYT(mmd.api.musicURL);
        }
        this.guiFn.selectCamera = () => {
            selectFile.onchange = _makeLoadFileFn('camera', (url, filename) => {
                mmd.helper.remove(mmd.camera);
                mmd.loader.loadAnimation(url, mmd.camera, function (cameraAnimation) {

                    mmd.helper.add(mmd.camera, {
                        animation: cameraAnimation
                    });

                }, onProgress, null);
                mmd.api.camera = filename;
                mmd.api.cameraFile = url;
            });
            selectFile.click();
        }
        this.guiFn.selectMotion = () => {
            selectFile.onchange = _makeLoadFileFn('motion', (url, filename) => {
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

        folder.add(mmd.api, 'musicURL').name('music from YT').listen()
        folder.add(this.guiFn, 'selectMusic').name('change use above url...')
        folder.add(mmd.api, 'camera').listen()
        folder.add(this.guiFn, 'selectCamera').name('select camera vmd file...')
        folder.add(mmd.api, 'motion').listen()
        folder.add(this.guiFn, 'selectMotion').name('select motion vmd file...')
        folder.close();

        function _makeLoadFileFn(itemName, cb) {
            return async function () {
                cb(await blobToBase64(this.files[0]), this.files[0].name);
            }
        }

        function _makeLoadModelFn(itemType, cb) {
            return async function () {
                let pmxFilesByType = pmxFiles[itemType] = {};
                let texFilesByType = modelTextures[itemType] = {};

                // load model and textures from unzipped folder
                let firstKey;
                const resourceMap = {};
                if (this.files.length < 1) {
                    alert('Please choose an file to be uploaded.');
                    return;
                }
                for (const f of this.files) {
                    let relativePath = f.webkitRelativePath;
                    const resourcePath = relativePath.split("/").slice(1).join("/")

                    let url = await blobToBase64(f);

                    // save modelTextures
                    resourceMap[resourcePath] = url;

                    if (f.name.includes(".pmx") || f.name.includes(".pmd")) {
                        const modelName = f.name
                        texFilesByType[modelName] = resourceMap;

                        if (!firstKey) firstKey = modelName
                        pmxFilesByType[modelName] = url;
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

    _guiColor() {
        const folder = this.gui.addFolder('Color');
        folder.addColor(this.mmd.api, 'fog color').onChange((value) => {
            this.mmd.scene.fog.color.setHex(value);
        });
        folder.close();
    }

    _guiShadow() {
        const folder = this.gui.addFolder('Shadow');
        folder.add(this.mmd.api, 'ground shadow').onChange((state) => {
            this.mmd.stage.receiveShadow = state;
        });
        folder.add(this.mmd.api, 'self shadow').onChange((state) => {
            this.mmd.character.receiveShadow = state;
        });
        folder.close();
    }

    _guiLight() {
        const folder = this.gui.addFolder('Light');

        folder.addColor(this.mmd.api, 'Directional').onChange(setColor(this.mmd.dirLight.color));
        folder.addColor(this.mmd.api, 'Hemisphere sky').onChange(setColor(this.mmd.hemiLight.color));
        folder.addColor(this.mmd.api, 'Hemisphere ground').onChange(setColor(this.mmd.hemiLight.groundColor));
        folder.close();

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
                    localforage.clear();
                    location.reload();
                }
            }
        }, 'clear localforage')
    }

    _guiDebug() {
        const folder = this.gui.addFolder('Debug');

        folder.add(this.mmd.api, 'show FPS').onChange((state) => {
            document.getElementById("fps").style.display = state ? "block" : "none";
        });
        folder.add(this.mmd.api, 'show outline').onChange((state) => {
            this.mmd.effect.enabled = state;
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
            } else {
                this.mmd.renderer.setPixelRatio(window.devicePixelRatio);
            }
        });
        this._guiRefresh(folder);

        folder.close();
    }

}

export { MMDGui };
