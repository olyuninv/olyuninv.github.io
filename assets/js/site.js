﻿// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

import { Detector } from './Detector.js'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import { MTLLoader } from 'three/addons/loaders/MTLLoader';
//import { OBJLoader } from 'three/addons/loaders/OBJLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
//import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
//import Stats from 'three/addons/libs/stats.module'

// Write your JavaScript code.
if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
}

var container;

var camera, controls, scene, renderer;
var lighting, ambient, keyLight, fillLight, backLight;

//const stats = new Stats()
//document.body.appendChild(stats.dom)

var clock;
var action;
var mixer;

init();
animate();

function init() {

    var manager = new THREE.LoadingManager();
    manager.onStart = function (url, itemsLoaded, itemsTotal) {
        console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };

    manager.onLoad = function () {
        console.log('Loading complete!');
    };

    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
        console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };

    manager.onError = function (url) {
        console.log('There was an error loading ' + url);
    };

    //container = document.createElement('div');
    //document.body.appendChild(container);
    container = document.getElementById('canvas-container');
    
    /* Camera */

    camera = new THREE.PerspectiveCamera(45, 1, 1, 250);
    camera.position.z = 3;    

    clock = new THREE.Clock();

    /* Scene */

    scene = new THREE.Scene();
    lighting = false;

    ambient = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambient);

    const light = new THREE.PointLight(0xffffff, 1000)
    light.position.set(2.5, 7.5, 15)
    scene.add(light)    

    /* Model */
    //const loader = new DRACOLoader(manager);
    //loader.setDecoderPath('three/addons/libs/draco/');
    //loader.preload();


    const loader = new GLTFLoader(manager);
    loader.load('assets/images/vologram_20.glb', function (gltf) {
        var model = gltf.scene;
        model.position.y -= 1;
        model.rotation.y += 0.1;
        model.rotation.x += 0.1;
        scene.add(model);
        model.traverse(function (object) {

            if (object.isMesh) object.castShadow = true;

        });

        const animations = gltf.animations;

        mixer = new THREE.AnimationMixer(model);

        action = mixer.clipAction(animations[0]);

        action.play();

    });  

    //var mtlLoader = new MTLLoader();
    //mtlLoader.setPath('MyModels/');
    //mtlLoader.load('Frame_00103_textured_ld_t_s_c_o.mtl', function (materials) {

    //    materials.preload();

    //    materials.materials.material_Frame_00103_textured_ld_t_s_c_o.map.magFilter = THREE.NearestFilter;
    //    materials.materials.material_Frame_00103_textured_ld_t_s_c_o.map.minFilter = THREE.LinearFilter;

    //    var objLoader = new OBJLoader();
    //    objLoader.setMaterials(materials);
    //    objLoader.setPath('MyModels/');
    //    objLoader.load('Frame_00103_textured_ld_t_s_c_o.obj', function (object) {

    //        scene.add(object);

    //    });

    //});

    /* Renderer */
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);    
    //renderer.setSize(window.innerWidth, window.innerHeight); //aspectRatio * 500, 500);    
    var w = container.offsetWidth;
    var h = container.offsetWidth; // container.offsetHeight;
    camera.aspect = w / h;
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(new THREE.Color("hsl(0, 0%, 96%)"));

    container.appendChild(renderer.domElement);

    /* Controls */
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;
    controls.minAzimuthAngle = -0.8;
    controls.maxAzimuthAngle = 0.15;
    controls.minPolarAngle = 0.5; 
    controls.maxPolarAngle = 1.57; // radians

    /* Events */

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

    var aspectRatio = 1; //window.innerWidth / window.innerHeight;
    camera.aspect = aspectRatio;
    var w = container.offsetWidth;
    var h = container.offsetWidth;

    camera.updateProjectionMatrix();

    //renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(w, h);
    render()
}
function animate() {

    requestAnimationFrame(animate);

    controls.update();

    // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)

    let mixerUpdateDelta = clock.getDelta();

    mixer.update(mixerUpdateDelta);

    //stats.update()

    render();
}

function render() {

    renderer.render(scene, camera);

}
