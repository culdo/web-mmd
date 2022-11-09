import * as THREE from 'three';

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper.js';

let camera, scene, renderer, effect;
let mesh, helper;
let clock = new THREE.Clock();

const vpds = [];

let container, gui;

document.addEventListener("DOMContentLoaded", () => {
    waitForElm('#threejs_canvas').then((elm) => {
        init();
        respondToVisibility(gradioApp().getElementById("tab_3d_poser"), (opened)=>{
            onWindowResize();
            if(opened) {
                gui.open();
            }else if(gui){
                gui.close();
            }
        })
    });
})

function submit_model2img(){
    requestProgress('img2img')

    res = create_submit_args(arguments)

    res[0] = get_tab_index('mode_model2img')
    res[5] = renderer.domElement.toDataURL();
    console.log(res)

    return res
}

window.submit_model2img = submit_model2img

function waitForElm(selector) {
    return new Promise(resolve => {
        if (gradioApp().querySelector(selector)) {
            return resolve(gradioApp().querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (gradioApp().querySelector(selector)) {
                resolve(gradioApp().querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(gradioApp(), {
            childList: true,
            subtree: true
        });
    });
}

function respondToVisibility(element, callback) {
    var options = {
      root: gradioApp().documentElement,
    };
  
    var observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        callback(entry.intersectionRatio > 0);
      });
    }, options);
  
    observer.observe(element);
  }

function init() {

    container = gradioApp().getElementById( 'threejs_canvas' );

    camera = new THREE.PerspectiveCamera( 45, container.clientWidth / container.clientHeight, 1, 2000 );
    camera.position.z = 25;

    // scene

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    const ambient = new THREE.AmbientLight( 0x666666 );
    scene.add( ambient );

    const directionalLight = new THREE.DirectionalLight( 0x887766 );
    directionalLight.position.set( - 1, 1, 1 ).normalize();
    scene.add( directionalLight );

    // render

    renderer = new THREE.WebGLRenderer( { antialias: true , preserveDrawingBuffer: true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( container.clientWidth, container.clientHeight );
    container.appendChild( renderer.domElement );

    // orbit controls
    const orbitControls = new OrbitControls( camera, renderer.domElement );

    effect = new OutlineEffect( renderer );

    // bone transformer
    const transformControls = new TransformControls( camera, renderer.domElement );
    transformControls.size = .75;
    scene.add( transformControls );
    // disable orbitControls while using transformControls
    transformControls.addEventListener( 'mouseDown', () => orbitControls.enabled = false );
    transformControls.addEventListener( 'mouseUp', () => orbitControls.enabled = true );

    // model

    function onProgress( xhr ) {

        if ( xhr.lengthComputable ) {

            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

        }

    }

    const modelFile = 'models/mmd/つみ式ミクさんv4/つみ式ミクさんv4.pmx';
    const vpdFiles = [
        'models/mmd/motions/vpds/01.vpd',
        'models/mmd/motions/vpds/02.vpd',
        'models/mmd/motions/vpds/03.vpd',
        'models/mmd/motions/vpds/04.vpd',
        'models/mmd/motions/vpds/05.vpd',
        'models/mmd/motions/vpds/06.vpd',
        'models/mmd/motions/vpds/07.vpd',
        'models/mmd/motions/vpds/08.vpd',
        //'models/mmd/motions/vpds/09.vpd',
        //'models/mmd/motions/vpds/10.vpd',
        'models/mmd/motions/vpds/11.vpd'
    ];

    helper = new MMDAnimationHelper();

    const loader = new MMDLoader();

    loader.load( modelFile, function ( object ) {

        mesh = object;
        mesh.position.y = - 10;
        helper.add( mesh , {
            physics: false
        });
        scene.add( mesh );
        
        helper.enable( 'physics', false )
        let ikHelper = helper.objects.get( mesh ).ikSolver.createHelper();
        ikHelper.visible = false;
        scene.add( ikHelper );

        for(let i=0; i<mesh.skeleton.bones.length; i++ ) {
            console.log(mesh.skeleton.bones[i].name);
            if(mesh.skeleton.bones[i].name === "左手首IK") {
                transformControls.attach( mesh.skeleton.bones[i] );
            }
        }

        let vpdIndex = 0;

        function loadVpd() {

            const vpdFile = vpdFiles[ vpdIndex ];

            loader.loadVPD( vpdFile, false, function ( vpd ) {

                vpds.push( vpd );

                vpdIndex ++;

                if ( vpdIndex < vpdFiles.length ) {

                    loadVpd();

                } else {
                    
                    initGui();
                    animate();

                }

            }, onProgress, null );

        }

        loadVpd();

    }, onProgress, null );

    //

    window.addEventListener( 'resize', onWindowResize );

    function initGui() {

        gui = new GUI();
        gui.close();

        const dictionary = mesh.morphTargetDictionary;

        const controls = {};
        const keys = [];

        const poses = gui.addFolder( 'Poses' );
        const morphs = gui.addFolder( 'Morphs' );

        function getBaseName( s ) {

            return s.slice( s.lastIndexOf( '/' ) + 1 );

        }

        function initControls() {

            for ( const key in dictionary ) {

                controls[ key ] = 0.0;

            }

            controls.pose = - 1;

            for ( let i = 0; i < vpdFiles.length; i ++ ) {

                controls[ getBaseName( vpdFiles[ i ] ) ] = false;

            }

        }

        function initKeys() {

            for ( const key in dictionary ) {

                keys.push( key );

            }

        }

        function initPoses() {

            const files = { default: - 1 };

            for ( let i = 0; i < vpdFiles.length; i ++ ) {

                files[ getBaseName( vpdFiles[ i ] ) ] = i;

            }

            poses.add( controls, 'pose', files ).onChange( onChangePose );

        }

        function initMorphs() {

            for ( const key in dictionary ) {

                morphs.add( controls, key, 0.0, 1.0, 0.01 ).onChange( onChangeMorph );

            }

        }

        function onChangeMorph() {

            for ( let i = 0; i < keys.length; i ++ ) {

                const key = keys[ i ];
                const value = controls[ key ];
                mesh.morphTargetInfluences[ i ] = value;

            }

        }

        function onChangePose() {

            const index = parseInt( controls.pose );

            if ( index === - 1 ) {

                mesh.pose();

            } else {

                helper.pose( mesh, vpds[ index ] );

            }

        }

        initControls();
        initKeys();
        initPoses();
        initMorphs();

        onChangeMorph();
        onChangePose();

        poses.open();
        morphs.close();

    }

}

function onWindowResize() {

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    effect.setSize( container.clientWidth, container.clientHeight );

}

//

function animate() {

    requestAnimationFrame( animate );
    render();

}

function render() {
    // mesh.updateMatrixWorld( true );
    helper.objects.get( mesh ).ikSolver.update();
    helper.update( clock.getDelta() );

    effect.render( scene, camera );

}