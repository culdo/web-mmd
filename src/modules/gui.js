import localforage from 'localforage';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

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
        this.mmd.api.selectChar = () => {}
        this.mmd.api.selectStage = () => {}
        this.mmd.api.selectMusic = () => {
            selectFile.onchange = _makeLoad('music');
            selectFile.click();
        }
        this.mmd.api.selectCamera = () => {}
        this.mmd.api.selectMotion = () => {}
        folder.add(this.mmd.api, 'character')
        folder.add(this.mmd.api, 'selectChar').name('select character..')
        folder.add(this.mmd.api, 'stage')
        folder.add(this.mmd.api, 'selectStage').name('select stage...')
        folder.add(this.mmd.api, 'music')
        folder.add(this.mmd.api, 'selectMusic').name('select music...')
        folder.add(this.mmd.api, 'camera')
        folder.add(this.mmd.api, 'selectCamera').name('select camera...')
        folder.add(this.mmd.api, 'motion')
        folder.add(this.mmd.api, 'selectMotion').name('select motion...')
        folder.close();

        let player = this.mmd.player;
        function _makeLoad(itemName) {
            return function() {
                localforage.removeItem(itemName);
                if (this.files[0].type.indexOf('audio/') !== 0) {
                    alert('Not an audio file...');
                    return;
                }
                localforage.setItem(itemName, this.files[0]).then(_ => {
                    localforage.getItem(itemName).then(blob => {
                        if (!blob) {
                            alert('Please choose an file to be uploaded.');
                            return;
                        }
                        player.src = URL.createObjectURL(blob);
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
