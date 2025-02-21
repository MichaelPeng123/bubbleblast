import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);  // White background

// Set up the camera
const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);
camera.position.set(0, 0, 0);

// Set up the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Create and style the crosshair image element
const crosshairImg = document.createElement('img');
crosshairImg.src = 'assets/crosshair.svg';
crosshairImg.style.position = 'fixed';
crosshairImg.style.top = '50%';
crosshairImg.style.left = '50%';
crosshairImg.style.transform = 'translate(-50%, -50%)';
crosshairImg.style.width = '30px';
crosshairImg.style.height = '30px';
crosshairImg.style.pointerEvents = 'none';
document.body.appendChild(crosshairImg);

// Create room geometry and add it to the scene
const roomGeometry = new THREE.BoxGeometry(10, 8, 20);
const roomMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.BackSide,
  roughness: 0.7,
  metalness: 0.1
});
const room = new THREE.Mesh(roomGeometry, roomMaterial);
scene.add(room);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(0, 8, 0);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Corner lights
const createPointLight = (x, y, z) => {
  const light = new THREE.PointLight(0xffffff, 0.5, 8);
  light.position.set(x, y, z);
  light.decay = 2;
  return light;
};
scene.add(createPointLight(3.5, 3, -7));
scene.add(createPointLight(-3.5, 3, -7));
scene.add(createPointLight(3.5, 3, 7));
scene.add(createPointLight(-3.5, 3, 7));

// Set up PointerLockControls for FPS-style controls
const controls = new PointerLockControls(camera, renderer.domElement);

// Define custom sensitivity (increase to make mouse movements more responsive)
const sensitivity = 0.005;

// Override onMouseMove to apply custom sensitivity
controls.onMouseMove = function (event) {
  if (this.isLocked === false) return;

  const movementX = event.movementX || 0;
  const movementY = event.movementY || 0;

  // Adjust horizontal rotation (yaw)
  this.yawObject.rotation.y -= movementX * sensitivity;
  
  // Adjust vertical rotation (pitch) and clamp between -90° and 90°
  this.pitchObject.rotation.x -= movementY * sensitivity;
  this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
};

// Lock the pointer on click
document.addEventListener('click', () => {
  controls.lock();
});

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop using renderer.setAnimationLoop
function animate() {
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
