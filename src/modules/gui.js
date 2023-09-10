import * as THREE from 'three';

import localforage from 'localforage';
import path from 'path-browserify';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { onProgress, loadMusicFromYT } from './utils';

class MMDGui {
    constructor() {
        this.gui = new GUI();
        this.open = () => this.gui.open();
        this.close = () => this.gui.close();
        this.mmd = null;
        this.modelTextures = {
            character: {},
            stage: {},
        };
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
        this._guiFile();
        this._guiColor();
        this._guiLight();
        this._guiShadow();
        this._guiDebug();
    }

    _guiFile() {
        const folder = this.gui.addFolder('Files');
        const mmd = this.mmd;
        let pmxDropdowns = this.pmxDropdowns;
        let modelTextures = this.modelTextures;

        const loadCharacter = (url, filename) => {
            mmd.ready = false;
            mmd.helper.objects.get(mmd.character).mixer.uncacheRoot(mmd.character);
            mmd.scene.remove(mmd.character);
            mmd.scene.remove(mmd.ikHelper);
            mmd.scene.remove(mmd.physicsHelper);
            mmd.scene.remove(mmd.skeletonHelper);
            mmd.helper.remove(mmd.character);

            console.log("character removed")
            let params = null;
            if (url.startsWith("blob:")) {
                params = {
                    modelExtension: path.extname(filename).slice(1),
                    modelTextures: modelTextures[filename],
                };
            }
            // load character
            loading.style.display = 'block';
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

                mmd.ikHelper = mmd.helper.objects.get(character).ikSolver.createHelper();
                mmd.ikHelper.visible = mmd.api["show IK bones"];
                mmd.scene.add(mmd.ikHelper);

                mmd.physicsHelper = mmd.helper.objects.get(character).physics.createHelper();
                mmd.physicsHelper.visible = mmd.api["show rigid bodies"];
                mmd.scene.add(mmd.physicsHelper);

                mmd.skeletonHelper = new THREE.SkeletonHelper(character);
                mmd.skeletonHelper.visible = mmd.api['show skeleton'];
                mmd.scene.add(mmd.skeletonHelper);

                mmd.character = character;

                mmd.helper.objects.get(character).physics.reset();
                console.log("loaded reset")
                mmd.ready = true;
                loading.style.display = 'none';

            }, onProgress, null, params)
            mmd.api.character = filename;
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
            let params = {
                modelExtension: path.extname(filename).slice(1),
                modelTextures: modelTextures[filename],
            };
            // load stage
            loading.style.display = 'block';
            mmd.loader.load(url, function (mesh) {
                console.log("load stage");

                mesh.castShadow = true;
                mesh.receiveShadow = mmd.api['ground shadow'];

                mmd.scene.add(mesh);
                mmd.stage = mesh;
                loading.style.display = 'none';
            }, onProgress, null, params);
            mmd.api.stage = filename;
        }
        // TODO: same above
        this.guiFn.selectStage = () => {
            selectFile.webkitdirectory = true;
            selectFile.onchange = _makeLoadModelFn('stage', loadStage);
            selectFile.click();
            selectFile.webkitdirectory = false;
        }

        this.guiFn.selectMusic = () => {
            loadMusicFromYT(mmd.api.music);
        }
        this.guiFn.selectCamera = () => {
            selectFile.onchange = _makeLoadFileFn('camera', (url, filename) => {
                mmd.helper.remove(mmd.camera);
                mmd.loader.loadAnimation(url, mmd.camera, function (cameraAnimation) {

                    mmd.helper.add(mmd.camera, {
                        animation: cameraAnimation
                    });

                }, onProgress, null);
                mmd.api.cameraFile = url;
                mmd.api.camera = filename;
            });
            selectFile.click();
        }
        this.guiFn.selectMotion = () => {
            selectFile.onchange = _makeLoadFileFn('motion', (url, filename) => {
                mmd.helper.objects.get(mmd.character).mixer.uncacheRoot(mmd.character);
                mmd.helper.remove(mmd.character);
                mmd.api.motionFile = url;
                mmd.loader.loadAnimation(url, mmd.character, function (mmdAnimation) {
                    mmd.helper.add(mmd.character, {
                        animation: mmdAnimation,
                        physics: true
                    });

                }, onProgress, null);
                mmd.api.motion = filename;
            });
            selectFile.click();
        }
        
        // add folder to avoid ordering problem when change character
        var characterFolder = folder.addFolder('character');
        var characterDropdown = characterFolder.add(mmd.api, 'character', Object.keys(mmd.pmxFiles.character)).listen().name("model").onChange(value => {
            console.log(value);
            loadCharacter(mmd.pmxFiles.character[value], value);
        });
        characterFolder.open();
        folder.add(this.guiFn, 'selectChar').name('select character pmx directory...')

        var stageFolder = folder.addFolder('stage');
        var stageDropdown = stageFolder.add(mmd.api, 'stage', mmd.pmxFiles.stage).listen().name("model").onChange(value => {
            console.log(value);
            loadStage(mmd.pmxFiles.stage[value], value);
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
                localforage.removeItem(itemName);
                await localforage.setItem(itemName, this.files[0])
                cb(URL.createObjectURL(this.files[0]), this.files[0].name);
            }
        }

        function _makeLoadModelFn(itemType, cb) {
            return async function () {
                let pmxFilesByType = mmd.pmxFiles[itemType];

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

                    await localforage.setItem(relativePath, f)
                    const blob = await localforage.getItem(relativePath)
                    let url = URL.createObjectURL(blob);

                    // save modelTextures
                    resourceMap[resourcePath] = url;

                    if (blob.name.includes(".pmx") || blob.name.includes(".pmd")) {
                        const modelName = blob.name
                        modelTextures[modelName] = resourceMap;

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
                mmd.pmxFiles[itemType] = pmxFilesByType;
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
        folder.add(this.mmd.api, 'auto hide GUI');
        folder.close();
    }

}

export { MMDGui };
