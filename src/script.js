import * as THREE from 'three';
import { Wood } from './wood.js';
import { Map } from './map.js';
import { Affect } from './affect.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
// import { Firework } from './firework.js';

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(15, 12, -10);
camera.lookAt(new THREE.Vector3(10, 0, -10));
scene.add(camera);

/*const directionalLight = new THREE.DirectionalLight( 0xffffff, 10.0);
directionalLight.target.position.set(0, 0, 0);
directionalLight.position.set(20, 20, -20);
directionalLight.castShadow = true;
directionalLight.shadowBias = 0.001;
scene.add(directionalLight);
scene.add(directionalLight.target);
*/

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera);
renderer.shadowMap.enabled = true;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.background = new THREE.Color(0x404040);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
const map = new Map(scene);
const wood = new Wood(scene, window, map);

(async () => {
    try {
        await wood.start();
        await map.load();
    } catch (e) {
        // 避免 top-level await
    }
})();

const affect = new Affect(scene, renderer, camera, window);

const clock = new THREE.Clock();
renderer.setAnimationLoop(
    () => {
		    const delta = clock.getDelta();
        wood.update(delta);
        renderer.render(scene, camera);
        affect.updateRenderer();
    }
);

window.addEventListener( 'resize', function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  affect.updateWindow();
  renderer.setSize(width, height);
}, false );
