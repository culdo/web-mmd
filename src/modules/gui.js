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

        // TODO: use unzip tools to unzip model files, because it has many texture images
        mmd.api.selectChar = () => {
            selectFile.onchange = _makeLoadFn('character', (url)=>{
            });
            selectFile.click();
        }
        // TODO: same above
        mmd.api.selectStage = () => {
            selectFile.onchange = _makeLoadFn('stage', (url, filename)=>{
                mmd.scene.remove(mmd.stage);
                console.log("remove stage")
                // load stage
                mmd.loader.load(url, function ( mesh ) {
                    console.log("load stage")

                    mesh.castShadow = true;
                    mesh.receiveShadow = mmd.api['ground shadow'];
                    
                    mmd.scene.add( mesh );
                    mmd.stage = mesh;
                }, onProgress, null, path.extname(filename).slice(1))
                mmd.api.stage = filename;
            });
            selectFile.click();
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
                        console.log(blob.name);
                        if (!blob) {
                            alert('Please choose an file to be uploaded.');
                            return;
                        }
                        cb(URL.createObjectURL(blob), blob.name);
                    }).catch(e => console.log(e));
                })
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
