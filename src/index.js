import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { MMDLoader } from './modules/MMDLoader.js';
import { MMDAnimationHelper } from './modules/MMDAnimationHelper.js';
import {MMDGui} from './modules/gui.js'
import {onProgress} from './modules/utils.js'
import path from 'path-browserify';

let stats;

let character, camera, scene, renderer, effect, stage;
let helper, ikHelper, physicsHelper;

let globalParams;

let ready = false;
let timeoutID;
let prevTime = 0.0;

const api = {
    'auto camera': true,
    'physics on pause': true,
    'ground shadow': true,
    'self shadow': true,
    'fog color': 0x43a0ad,
    'show outline': true,
    'show IK bones': false,
    'show rigid bodies': false,
    // light
    'Hemisphere sky': 0x666666,
    'Hemisphere ground': 0x482e2e,
    'Directional': 0xffffff,
};
const gui = new MMDGui();

const clock = new THREE.Clock();

Ammo().then( function () {

    init();
    animate();

} );

function init() {
    // Demo files
    const modelFile = 'models/mmd/つみ式ミクさんv4/つみ式ミクさんv4.pmx';
    api.character = path.basename(modelFile);

    const motionFile = 'models/mmd/motions/GimmeGimme_with_emotion.vmd';
    api.motion = path.basename(motionFile);

    const cameraFile = 'models/mmd/cameras/GimmexGimme.vmd';
    api.camera = path.basename(cameraFile);

    const stageFile = 'models/mmd/stages/RedialC_EpRoomDS/EPDS.pmx';
    api.stage = path.basename(stageFile);

    const musicFile = 'models/mmd/audios/GimmexGimme.m4a';
    api.music = path.basename(musicFile);


    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    let player = document.getElementById("player")
    player.src = musicFile;

    player.onplay = () => {
        helper.objects.get( character ).physics.reset();
        gui.close();
    }
    player.onpause = () => {
        gui.open();
    }
    // control bar
    document.addEventListener( 'mousemove', ( e ) => {

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

    const dirLight = new THREE.DirectionalLight( api["Directional"], 0.45 );
    dirLight.position.set( 3, 10, 10 );
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
    scene.add( dirLight );

    // render
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.type = THREE.VSMShadowMap;
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

    helper = new MMDAnimationHelper();
    
    const loader = new MMDLoader();

    // load stage
    loader.load(stageFile, function ( mesh ) {
        stage = mesh;
        stage.castShadow = true;
        stage.receiveShadow = api['ground shadow'];

        scene.add( stage );
    }, onProgress, null)

    // load character
    loader.loadWithAnimation( modelFile, motionFile, function ( mmd ) {

        character = mmd.mesh;
        character.castShadow = true;
        character.receiveShadow = api["self shadow"];
        scene.add(character);

        helper.add( character, {
            animation: mmd.animation,
            physics: true
        } );

        // load camera
        loader.loadAnimation( cameraFile, camera, function ( cameraAnimation ) {

            helper.add( camera, {
                animation: cameraAnimation
            } );

            ready = true;
            loading.style.display = "none";


        }, onProgress, null );
        
        ikHelper = helper.objects.get( character ).ikSolver.createHelper();
        ikHelper.visible = false;
        scene.add( ikHelper );

        physicsHelper = helper.objects.get( character ).physics.createHelper();
        physicsHelper.visible = false;
        scene.add( physicsHelper );

        globalParams = {api, loader, camera, player, helper, scene, character, stage, 
            effect, ikHelper, physicsHelper, dirLight, hemiLight};
        globalParams.animationURL = motionFile;
        globalParams.ready = true;
        gui.initGui(globalParams);
        
        helper.objects.get( character ).physics.reset();

    }, onProgress, null );

    //

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    effect.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

    requestAnimationFrame( animate );

    if(ready && globalParams.ready){
        stats.begin();
        render();
        stats.end();
    }
}

function render() {
    character = globalParams.character;

    let currTime = player.currentTime
    let delta = currTime - prevTime;

    if(Math.abs(delta) > 0) {
        if(Math.abs(delta) > 0.1) {
            helper.enable('physics', false);
        }

        helper.update( delta , currTime);

        if(Math.abs(delta) > 0.1) {
            helper.objects.get( character ).physics.reset();
            helper.enable('physics', true);
            console.log('time seeked. physics reset.')
        }
        prevTime = currTime

    } else if(api['physics on pause']) {

        let delta = clock.getDelta()
        helper.objects.get(character).physics.update( delta );

    }

    // stop when motion is finished
    if(helper.objects.get(character).looped) {
        player.pause();
        player.currentTime = 0.0;
        helper.objects.get(character).looped = false;
    }

    effect.render( scene, camera );

}