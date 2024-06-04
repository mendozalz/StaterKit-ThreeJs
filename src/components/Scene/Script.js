import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import * as dat from "dat.gui"

// Global variables
let currentRef = null;
//const gui = new dat.GUI({with:400});
// Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
scene.add(camera);
camera.position.set(27, 27, 27);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputEncoding = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Agregando los efecto de post-procesamiento

const effectComposer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

// Pass 
const glitchPass = new GlitchPass();
glitchPass.enabled = true;
effectComposer.addPass(glitchPass);

// BloomPass
const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
effectComposer.addPass(bloomPass);

// dat.gui 
/* const params = {
  threshold: 0,
  strength: 1,
  radius: 0,
  exposure: 1.2
}; */

/* gui.add(params, 'exposure', 0.1, 5 ).onChange( function ( value ) {

  renderer.toneMappingExposure = Math.pow( value, 4.0 );

} ); */

// OrbitControls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.25;

// Resize canvas
const resize = () => {
  if (currentRef) {
    renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
    camera.aspect = currentRef.clientWidth / currentRef.clientHeight;
    camera.updateProjectionMatrix();
  }
};
window.addEventListener("resize", resize);

// Animate the scene
const animate = () => {
  orbitControls.update();
 // renderer.render(scene, camera);
 effectComposer.render();
  requestAnimationFrame(animate);
};
animate();

// Cargando GLTF
const gltfLoader = new GLTFLoader()
gltfLoader.load("./House.glb", (gltf) => {
  scene.add(gltf.scene)
})

// Luces
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Luz Ambiental
const luzAmbiental = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(luzAmbiental);

// Init and mount the scene
export const initScene = (mountRef) => {
  currentRef = mountRef.current;
  resize();
  currentRef.appendChild(renderer.domElement);
};

// Dismount and clean up the buffer from the scene
export const cleanUpScene = () => {
  // Recorrer todos los objetos dentro del scene y limpiar recursos
  scene.traverse((object) => {
    if (object.isMesh) {
      // Eliminar la geometría
      if (object.geometry) {
        object.geometry.dispose();
      }
      // Eliminar el material
      if (object.material) {
        // Materiales pueden ser un array (en caso de materiales multi-material)
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    }
  });

  // Limpiar texturas del renderer
  renderer.dispose();

  // Eliminar el canvas del DOM
  if (currentRef) {
    currentRef.removeChild(renderer.domElement);
  }
};
