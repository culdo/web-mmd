import localforage from 'localforage';
import path from 'path-browserify';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { onProgress } from './utils';

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
    }

    initGui(params){
        this.mmd = params;

        this.gui.add( this.mmd.api, 'auto camera' ).onChange( (state) => {
            this.mmd.helper.enable( 'cameraAnimation', state );
        } );
        this.gui.add( this.mmd.api, 'physics on pause' );
        this._guiFile();
        this._guiColor();
        this._guiLight();
        this._guiShadow();
        this._guiDebug();
    }

    _guiFile() {
        const folder = this.gui.addFolder( 'Files' );
        let mmd = this.mmd;
        let modelTextures = this.modelTextures;

        // TODO: use unzip tools to unzip model files, because it has many texture images
        mmd.api.selectChar = () => {
            selectFile.webkitdirectory = true;
            selectFile.onchange = _makeLoadModel('character', (url, filename)=>{
                mmd.ready = false;
                mmd.helper.objects.get( mmd.character ).mixer.uncacheRoot(mmd.character);
                mmd.scene.remove(mmd.character);
                mmd.helper.remove(mmd.character);

                console.log("remove character")
                let params = {
                    modelExtension: path.extname(filename).slice(1),
                    modelTextures: modelTextures['character'],
                }
                // load character
                loading.style.display = 'block';
                mmd.loader.loadWithAnimation(url, mmd.animationURL, function ( obj ) {
                    console.log("loading character...")

                    let character = obj.mesh;
                    character.castShadow = true;
                    character.receiveShadow = mmd.api["self shadow"];
                    mmd.scene.add(character);

                    mmd.helper.add( character, {
                        animation: obj.animation,
                        physics: true
                    } );

                    mmd.character = character;

                    setTimeout(() => {
                        mmd.helper.objects.get( character ).physics.reset();
                        console.log("loaded reset")
                        mmd.ready = true;
                        loading.style.display = 'none';
                    }, 100); 

                }, onProgress, null, params)
                mmd.api.character = filename;
            });
            selectFile.click();
            selectFile.webkitdirectory = false;
        }
        // TODO: same above
        mmd.api.selectStage = () => {
            selectFile.webkitdirectory = true;
            selectFile.onchange = _makeLoadModel('stage', (url, filename)=>{
                mmd.scene.remove(mmd.stage);
                console.log("remove stage")
                let params = {
                    modelExtension: path.extname(filename).slice(1),
                    modelTextures: modelTextures['stage'],
                }
                // load stage
                loading.style.display = 'block';
                mmd.loader.load(url, function ( mesh ) {
                    console.log("load stage")

                    mesh.castShadow = true;
                    mesh.receiveShadow = mmd.api['ground shadow'];
                    
                    mmd.scene.add( mesh );
                    mmd.stage = mesh;
                    loading.style.display = 'none';
                }, onProgress, null, params)
                mmd.api.stage = filename;
                
            });
            selectFile.click();
            selectFile.webkitdirectory = false;
        }

        mmd.api.selectMusic = () => {
            selectFile.onchange = _makeLoadFn('music', (url, filename)=>{
                mmd.player.src = url;
                mmd.api.music = filename;
            });
            selectFile.click();
        }
        mmd.api.selectCamera = () => {
            selectFile.onchange = _makeLoadFn('camera', (url, filename)=>{
                mmd.helper.remove(mmd.camera);
                mmd.loader.loadAnimation( url, mmd.camera, function ( cameraAnimation ) {

                    mmd.helper.add( mmd.camera, {
                        animation: cameraAnimation
                    } );
        
                }, onProgress, null );
                mmd.api.camera = filename;
            });
            selectFile.click();
        }
        mmd.api.selectMotion = () => {
            selectFile.onchange = _makeLoadFn('motion', (url, filename)=>{
                mmd.helper.objects.get( mmd.character ).mixer.uncacheRoot(mmd.character);
                mmd.helper.remove(mmd.character);
                mmd.animationURL = url;
                mmd.loader.loadAnimation( url, mmd.character, function ( mmdAnimation ) {
                    mmd.helper.add( mmd.character, {
                        animation: mmdAnimation,
                        physics: true
                    } );
        
                }, onProgress, null );
                mmd.api.motion = filename;
            });
            selectFile.click();
        }
        folder.add(mmd.api, 'character').listen()
        folder.add(mmd.api, 'selectChar').name('select character..')
        folder.add(mmd.api, 'stage').listen()
        folder.add(mmd.api, 'selectStage').name('select stage...')
        folder.add(mmd.api, 'music').listen()
        folder.add(mmd.api, 'selectMusic').name('select music...')
        folder.add(mmd.api, 'camera').listen()
        folder.add(mmd.api, 'selectCamera').name('select camera...')
        folder.add(mmd.api, 'motion').listen()
        folder.add(mmd.api, 'selectMotion').name('select motion...')
        folder.close();

        function _makeLoadFn(itemName, cb) {
            return function() {
                localforage.removeItem(itemName);
                localforage.setItem(itemName, this.files[0]).then(_ => {
                    localforage.getItem(itemName).then(blob => {
                        if (!blob) {
                            alert('Please choose an file to be uploaded.');
                            return;
                        }
                        cb(URL.createObjectURL(blob), blob.name);
                    }).catch(e => console.log(e));
                })
            }
        }

        function _makeLoadModel(itemName, cb) {
            return function() {
                let textures = modelTextures[itemName];
                // clear textures
                for( const key of Object.keys(textures)) {
                    localforage.removeItem(key);
                    for (var item in textures) delete textures[item];
                }
                // load model and textures from unzipped folder
                for(const f of this.files) {
                    let relativePath = f.webkitRelativePath.split( '/' ).slice( 1 ).join( '/' );
                    localforage.setItem(relativePath, f).then(_ => {
                        localforage.getItem(relativePath).then(blob => {
                            if (!blob) {
                                alert('Please choose an file to be uploaded.');
                                return;
                            }
                            let url = URL.createObjectURL(blob);

                            textures[relativePath] = url;

                            if(blob.name.includes(".pmx") || blob.name.includes(".pmd")) {
                                cb(url, blob.name);
                            }
                        }).catch(e => console.log(e));
                    })
                }
            }
        }
    }

    _guiColor() {
        const folder = this.gui.addFolder( 'Color' );
        folder.addColor( this.mmd.api, 'fog color' ).onChange( ( value ) => {
            this.mmd.scene.fog.color.setHex( value );
        });
        folder.close();
    }

    _guiShadow() {
        const folder = this.gui.addFolder( 'Shadow' );
        folder.add( this.mmd.api, 'ground shadow' ).onChange( (state) => {
            this.mmd.stage.receiveShadow = state;
        } );
        folder.add( this.mmd.api, 'self shadow' ).onChange( (state) => {
            this.mmd.character.receiveShadow = state;
        } );
        folder.close();
    }

    _guiLight() {
        const folder = this.gui.addFolder( 'Light' );

        folder.addColor( this.mmd.api, 'Directional' ).onChange( setColor( this.mmd.dirLight.color) );
        folder.addColor( this.mmd.api, 'Hemisphere sky' ).onChange( setColor( this.mmd.hemiLight.color) );
        folder.addColor( this.mmd.api, 'Hemisphere ground' ).onChange( setColor( this.mmd.hemiLight.groundColor) );
        folder.close();

        // handle gui color change
        function setColor( color ) {
            return ( value  ) => {
                color.setHex( value );
            }
        }
    }

    _guiDebug() {
        const folder = this.gui.addFolder( 'Debug' );

        folder.add( this.mmd.api, 'show outline' ).onChange( (state) => {
            this.mmd.effect.enabled = state;
        } );
        folder.add( this.mmd.api, 'show IK bones' ).onChange( (state) => {
            this.mmd.ikHelper.visible = state;
        } );
        folder.add( this.mmd.api, 'show rigid bodies' ).onChange( (state) => {
            if ( this.mmd.physicsHelper !== undefined ) this.mmd.physicsHelper.visible = state;
        } );
        folder.close();
    }

}

export {MMDGui};
