import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper.js';

let stats;

let mesh, camera, scene, renderer, effect;
let helper, ikHelper, physicsHelper;

let ready = false;

const clock = new THREE.Clock();


Ammo().then( function () {

    init();
    animate();

} );

function init() {


    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    
    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa0a0a0 );
    // scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );
    
    // camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.set( 0, 20, 30 );
    scene.add( camera );
    
    // scene.add( new THREE.PolarGridHelper( 30, 0 ) );
        
    
    const listener = new THREE.AudioListener();
    scene.add( listener );
    
    // light
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 20, 0 );
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff );
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

    // ground
    const ground = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add( ground );

    // render
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );
    const controls = new OrbitControls( camera, renderer.domElement );


    effect = new OutlineEffect( renderer );

    // FPS stats

    stats = new Stats();
    container.appendChild( stats.dom );

    // Log asset downloading progress

    function onProgress( xhr ) {

        if ( xhr.lengthComputable ) {

            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

        }

    }

    const modelFile = 'models/mmd/miku/miku_v2.pmd';
    const vmdFiles = [ 'models/mmd/motions/wavefile_v2.vmd' ];
    const cameraFiles = [ 'models/mmd/cameras/wavefile_camera.vmd' ];
    const audioFile = 'models/mmd/audios/wavefile_short.mp3';
    const audioParams = { delayTime: 160 * 1 / 30 };

    helper = new MMDAnimationHelper();

    const loader = new MMDLoader();

    loader.loadWithAnimation( modelFile, vmdFiles, function ( mmd ) {

        mesh = mmd.mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        helper.add( mesh, {
            animation: mmd.animation,
            physics: true
        } );

        loader.loadAnimation( cameraFiles, camera, function ( cameraAnimation ) {

            helper.add( camera, {
                animation: cameraAnimation
            } );

            new THREE.AudioLoader().load( audioFile, function ( buffer ) {

                const audio = new THREE.Audio( listener ).setBuffer( buffer );

                helper.add( audio, audioParams );
                scene.add( mesh );

                ready = true;

            }, onProgress, null );

        }, onProgress, null );
        
        ikHelper = helper.objects.get( mesh ).ikSolver.createHelper();
        ikHelper.visible = false;
        scene.add( ikHelper );

        physicsHelper = helper.objects.get( mesh ).physics.createHelper();
        physicsHelper.visible = false;
        scene.add( physicsHelper );

        initGui();
        helper.enable( 'animation', false );
        helper.enable( 'cameraAnimation', false );

    }, onProgress, null );

    //

    window.addEventListener( 'resize', onWindowResize );

    function initGui() {

        const api = {
            'play/pause': false,
            'camera motion': true,
            'show outline': true,
            'show IK bones': false,
            'show rigid bodies': false
        };

        const gui = new GUI();
        gui.add( api, 'play/pause' ).onChange( function () {
            helper.enable( 'animation', api[ 'play/pause' ] );
            helper.enable( 'cameraAnimation', api[ 'play/pause' ] );
            if(helper.audio.isPlaying) {
                helper.audio.pause()
            }else{
                helper.audio.play()
            }
        } );
        gui.add( api, 'show outline' ).onChange( function () {
            effect.enabled = api[ 'show outline' ];
        } );
        gui.add( api, 'show IK bones' ).onChange( function () {
            ikHelper.visible = api[ 'show IK bones' ];
        } );
        gui.add( api, 'show rigid bodies' ).onChange( function () {
            if ( physicsHelper !== undefined ) physicsHelper.visible = api[ 'show rigid bodies' ];
        } );
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

    if ( ready ) {

        helper.update( clock.getDelta() );

    }

    effect.render( scene, camera );

}