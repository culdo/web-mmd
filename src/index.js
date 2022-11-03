import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper.js';

let stats;

let mesh, camera, scene, renderer, effect, stage;
let helper, ikHelper, physicsHelper;

let ready = false;
let timeoutID;
let prevTime = 0.0;

const api = {
    'camera': true,
    'physics on pause': true,
    'ground shadow': true,
    'fog color': 0x43a0ad,
    'self shadow': false,
    'show outline': true,
    'show IK bones': false,
    'show rigid bodies': false,
    // light
    'Hemisphere sky': 0x666666,
    'Hemisphere ground': 0x482e2e,
    'Directional': 0xffffff,
};
const gui = new GUI();

const clock = new THREE.Clock();


Ammo().then( function () {

    init();
    animate();

} );

function init() {


    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    let player = document.getElementById("player")
    // control bar
    document.addEventListener( 'mousemove', function ( event ) {

        player.style.opacity = 0.5;
        if ( timeoutID !== undefined ) {
            clearTimeout( timeoutID );
        }

        timeoutID = setTimeout( function () {
            player.style.opacity = 0;
        }, 1000 );
    } );

    // scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( api['fog color'], 10, 500 );
    
    // camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.set( 0, 20, 30 );
    scene.add( camera );
    
    const listener = new THREE.AudioListener();
    scene.add( listener );
    
    // light
    const hemiLight = new THREE.HemisphereLight( api["Hemisphere sky"], api["Hemisphere ground"] );
    hemiLight.position.set( 0, 40, 0 );
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( api["Directional"], 0.5 );
    dirLight.position.set( 3, 10, 10 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 1024;
    scene.add( dirLight );

    // render
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 10, 0 );

    // outline
    effect = new OutlineEffect( renderer );
    effect.enabled = api['show outline']

    // FPS stats
    stats = new Stats();
    container.appendChild( stats.dom );

    // log asset downloading progress

    function onProgress( xhr ) {

        if ( xhr.lengthComputable ) {

            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

        }

    }

    // handle gui color change
    function handleColorChange( color, converSRGBToLinear = false ) {

        return function ( value ) {

            if ( typeof value === 'string' ) {

                value = value.replace( '#', '0x' );

            }

            color.setHex( value );

            if ( converSRGBToLinear === true ) color.convertSRGBToLinear();

        };

    }

    const modelFile = 'models/mmd/つみ式ミクさんv4/つみ式ミクさんv4.pmx';
    const vmdFiles = [ 'models/mmd/motions/GimmeGimme_with_emotion.vmd'];
    const cameraFiles = [ 'models/mmd/cameras/GimmexGimme.vmd' ];

    helper = new MMDAnimationHelper();
    
    const loader = new MMDLoader();

    // load stage
    loader.load('models/mmd/stages/RedialC_EpRoomDS/EPDS.pmx', function ( mesh ) {
        mesh.castShadow = true;
        mesh.receiveShadow = api['ground shadow'];

        scene.add( mesh );
        stage = mesh;
    }, onProgress, null)

    // load character
    loader.loadWithAnimation( modelFile, vmdFiles, function ( mmd ) {

        mesh = mmd.mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = api["self shadow"];

        helper.add( mesh, {
            animation: mmd.animation,
            physics: true
        } );

        loader.loadAnimation( cameraFiles, camera, function ( cameraAnimation ) {

            helper.add( camera, {
                animation: cameraAnimation
            } );

            scene.add(mesh);
            ready = true;


        }, onProgress, null );
        
        ikHelper = helper.objects.get( mesh ).ikSolver.createHelper();
        ikHelper.visible = false;
        scene.add( ikHelper );

        physicsHelper = helper.objects.get( mesh ).physics.createHelper();
        physicsHelper.visible = false;
        scene.add( physicsHelper );

        initGui();

    }, onProgress, null );

    //

    window.addEventListener( 'resize', onWindowResize );

    function initGui() {
        gui.add( api, 'camera' ).onChange( function (state) {
            helper.enable( 'cameraAnimation', state );
        } );
        gui.add( api, 'physics on pause' )

        guiColor(gui);
        guiLight(gui);
        guiShadow(gui);
        guiDebug(gui);
    }
    function guiColor( gui) {
        const folder = gui.addFolder( 'Color' );
        folder.addColor( api, 'fog color' ).onChange( function ( value ) {
            scene.fog.color.setHex( value );
        });
        folder.close();
    }

    function guiShadow( gui) {
        const folder = gui.addFolder( 'Shadow' );
        folder.add( api, 'ground shadow' ).onChange( function (state) {
            stage.receiveShadow = state;
        } );
        folder.add( api, 'self shadow' ).onChange( function (state) {
            mesh.receiveShadow = state;
        } );
        folder.close();
    }
    function guiLight( gui) {
        const folder = gui.addFolder( 'Light' );

        folder.addColor( api, 'Directional' ).onChange( handleColorChange( dirLight.color) );
        folder.addColor( api, 'Hemisphere sky' ).onChange( handleColorChange( hemiLight.color) );
        folder.addColor( api, 'Hemisphere ground' ).onChange( handleColorChange( hemiLight.groundColor) );
        folder.close();
    }
    function guiDebug(gui) {
        const folder = gui.addFolder( 'Debug' );

        folder.add( api, 'show outline' ).onChange( function (state) {
            effect.enabled = state;
        } );
        folder.add( api, 'show IK bones' ).onChange( function (state) {
            ikHelper.visible = state;
        } );
        folder.add( api, 'show rigid bodies' ).onChange( function (state) {
            if ( physicsHelper !== undefined ) physicsHelper.visible = state;
        } );
        folder.close();
    }

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    effect.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

    requestAnimationFrame( animate );

    stats.begin();
    render();
    stats.end();
}

function render() {
    if(ready){
        // only loop once
        if ( player.duration > 0 && player.currentTime === player.duration ){
            gui.open();
        }
        let currTime = player.currentTime
        let delta = currTime - prevTime;

        if(Math.abs(delta) > 0) {

            helper.update( delta , currTime);
            prevTime = currTime

        } else if(api['physics on pause']) {

            let delta = clock.getDelta()
            helper.objects.get(mesh).physics.update( delta );

        }
        if(helper.objects.get(mesh).looped) {
            player.pause();
            player.currentTime = 0.0;
        }
    }
    effect.render( scene, camera );

}