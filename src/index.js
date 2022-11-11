import * as THREE from 'three';

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper.js';
import { Clock, SkinnedMesh } from 'three';
import { Skeleton } from 'three';

let camera, scene, renderer, effect;
let mesh, helper, ikHelper;
const vpds = [];

let container, gui;
let transformControls = [];
let arcBallControls;
let clock = new Clock();
const controls = {};

const boneCaches = {};


document.addEventListener("DOMContentLoaded", () => {
    waitForElm('#threejs_canvas').then((elm) => {
        Ammo().then( function () {
            init();
            respondToVisibility(gradioApp().getElementById("tab_3d_poser"), (opened)=>{
                onWindowResize();
                if(opened) {
                    gui.open();
                    // I was trying hard to make working, idk why ArcballControls can't init successfully(blank when left click)
                    arcBallControls.setScale();
                    arcBallControls.applyTransformMatrix( arcBallControls.scale( 1.0006, arcBallControls._gizmos.position ) );
                    arcBallControls.setIdel();                    
                    
                }else if(gui){
                    gui.close();
                }
            })
        } );
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

    // arcball controls
    arcBallControls = new ArcballControls( camera, renderer.domElement, scene );
    arcBallControls.setGizmosVisible(false);

    effect = new OutlineEffect( renderer );

    // bone transformer
    function addTransformControl(bone, mode = 'translate') {
        let transformControl = new TransformControls(camera, renderer.domElement);
        transformControl.attach( bone );
        transformControl.mode = mode;
        if(mode==="rotate"){
            transformControl.size = .5;
        }
        transformControl.visible = false;
        transformControl.enabled = false;
        scene.add(transformControl);

        // disable orbitControls while using transformControls
        transformControl.addEventListener('mouseDown', (e) => {
            for(const tfc of transformControls) {
                if(tfc !== e.target){
                    tfc.visible = false;
                    tfc.enabled = false;
                }
            }
            arcBallControls.enabled = false;
        });
        transformControl.addEventListener('mouseUp', (e) => {
            for(const tfc of transformControls) {
                if(tfc !== e.target){
                    tfc.visible = true;
                    tfc.enabled = true;
                }
            }
            arcBallControls.enabled = true;
        });
        transformControls.push(transformControl);
    }

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
            physics: true
        });
        scene.add( mesh );
        window.mesh = mesh;

        console.log(mesh.geometry.userData.MMD.iks);
        console.log(mesh.geometry.userData.MMD.grants);
        
        ikHelper = helper.objects.get( mesh ).ikSolver.createHelper();
        ikHelper.visible = false;
        scene.add( ikHelper );

        setupIK();
        console.log(mesh.skeleton.bones);

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
                    onChangePose();
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

        const keys = [];

        const poses = gui.addFolder( 'Poses' );
        const morphs = gui.addFolder( 'Morphs' );
        const cameraGUI = gui.addFolder( 'Camera' );
        const debugs = gui.addFolder( 'Debugs' );

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
            controls["reset pose"] = () => onChangePose();
            poses.add(controls, "reset pose");

            controls["adjust pose"] = false;
            poses.add(controls, "adjust pose").onChange( (state) => {
                for(const tfc of transformControls) {
                    tfc.visible = state;
                    tfc.enabled = state;
                }
            })

            const files = { default: -1 };

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

        function initCamera() {
            cameraGUI.add(camera.rotation, 'z', -Math.PI, Math.PI, 0.1)
        }

        function initDebugs() {
            debugs.add(ikHelper, "visible").name("ikHelper");
            controls.gizmoVisible = false;
            debugs.add(controls, "gizmoVisible").onChange((state)=>{
                arcBallControls.setGizmosVisible(state);
            })
            controls.physics = true;
            debugs.add(controls, "physics").onChange((state)=>{
                helper.enable("physics", state);
            })

        }

        function onChangeMorph() {

            for ( let i = 0; i < keys.length; i ++ ) {

                const key = keys[ i ];
                const value = controls[ key ];
                mesh.morphTargetInfluences[ i ] = value;

            }

        }

        initControls();
        initKeys();
        initPoses();
        initMorphs();
        initCamera();
        initDebugs();

        onChangeMorph();
        onChangePose();

        poses.open();
        morphs.close();
        debugs.close();

    }

    function setupIK() {
        // setArmIK( '左' );
        // setArmIK( '右' );

        addTransformControl( getBoneByName( '首' ), 'rotate' );

        addTransformControl( getBoneByName( '左腕' ), 'rotate' );

        addTransformControl( getBoneByName( '右腕' ), 'rotate' );

        addTransformControl( getBoneByName( '左ひじ' ), 'rotate' );

        addTransformControl( getBoneByName( '右ひじ' ), 'rotate' );

        addTransformControl( getBoneByName( '左手首' ), 'rotate' );

        addTransformControl( getBoneByName( '右手首' ), 'rotate' );

        addTransformControl( getBoneByName( '左足ＩＫ' ) );

        addTransformControl( getBoneByName( '左つま先ＩＫ' ) );

        addTransformControl( getBoneByName( '右足ＩＫ' ) );

        addTransformControl( getBoneByName( '右つま先ＩＫ' ) );

        addTransformControl( getBoneByName( 'センター' ) );

    }

    function setArmIK( side ) {

        var bones = mesh.skeleton.bones;
        let iksIdx;

        if(side === "左") {
            iksIdx = 7;
        }else{
            iksIdx = 9;
        }

        var links = mesh.geometry.userData.MMD.iks[iksIdx].links;
        var linkBone = bones[links[0].index].parent;

        for ( var i = 0; i < 0; i ++ ) {

            console.log( linkBone.name );

            var link = {};
            link.index = bones.indexOf( linkBone );


            links.push( link );

            linkBone = linkBone.parent;

        }

    }
}

function onChangePose() {

    const index = parseInt( controls.pose );
    if ( index === - 1 ) {
        // idk why this work, I just used try & error to found out
        helper.enable("physics", false);
        helper.objects.get(mesh).physics.reset();
        mesh.pose();
        setTimeout(() => {
            helper.objects.get(mesh).physics.reset();
            helper.enable("physics", controls.physics);
        }, 100);
        
    
    } else {
        // also this
        helper.objects.get(mesh).physics.reset();
        helper.pose( mesh, vpds[ index ] );
        helper.objects.get(mesh).physics.reset();

    }

}

function solveIK() {

    helper.objects.get( mesh ).ikSolver.update();

    // updateArmBones( '左' );
    // updateArmBones( '右' );

}

function updateArmBones( side ) {

    getBoneByName( side + '腕' ).quaternion.copy(
        getBoneByName( side + '腕S' ).quaternion );
    getBoneByName( side + '腕' ).quaternion.copy(
        getBoneByName( side + 'ひじS' ).quaternion );
    getBoneByName( side + '手首' ).quaternion.copy(
        getBoneByName( side + 'ひじS' ).quaternion );

}

function getBoneByName( name ) {

    if ( boneCaches[ name ] === undefined ) {

        boneCaches[ name ] = mesh.skeleton.getBoneByName( name );

    }

    return boneCaches[ name ];

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
    solveIK();
    helper.objects.get( mesh ).grantSolver.update();
    helper.update(clock.getDelta());

    effect.render( scene, camera );

}