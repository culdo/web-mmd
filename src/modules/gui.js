import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

class MMDGui {
    constructor() {
        this.gui = new GUI();
        this.open = this.gui.open;
        this.close = this.gui.close;
        this.mmd = null;
    }

    initGui(params){
        this.mmd = params;

        this.gui.add( this.mmd.api, 'auto camera' ).onChange( (state) => {
            this.mmd.helper.enable( 'cameraAnimation', state );
        } );
        this.gui.add( this.mmd.api, 'physics on pause' );
        
        this._guiColor();
        this._guiLight();
        this._guiShadow();
        this._guiDebug();
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

        folder.addColor( this.mmd.api, 'Directional' ).onChange( handleColorChange( this.mmd.dirLight.color) );
        folder.addColor( this.mmd.api, 'Hemisphere sky' ).onChange( handleColorChange( this.mmd.hemiLight.color) );
        folder.addColor( this.mmd.api, 'Hemisphere ground' ).onChange( handleColorChange( this.mmd.hemiLight.groundColor) );
        folder.close();

        // handle gui color change
        function handleColorChange( color ) {
    
            return ( value  ) => {
    
                if ( typeof value === 'string' ) {
    
                    value = value.replace( '#', '0x' );
    
                }
    
                color.setHex( value );
    
            };
    
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
