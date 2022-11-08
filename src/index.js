import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';

let camera, scene, renderer, effect;
let mesh, helper;

const vpds = [];

let container;

document.addEventListener("DOMContentLoaded", () => {
    waitForElm('#threejs_canvas').then((elm) => {
        init();
        respondToVisibility(gradioApp().getElementById("tab_3d_poser"), ()=>{
            onWindowResize();
        })
    });
})

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

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( container.clientWidth, container.clientHeight );
    container.appendChild( renderer.domElement );

    // orbit controls
    const controls = new OrbitControls( camera, renderer.domElement );

    effect = new OutlineEffect( renderer );

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

        scene.add( mesh );

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

        const gui = new GUI();

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
        morphs.open();

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

    effect.render( scene, camera );

}