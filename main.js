import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);  // White background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Create the crosshair image element
const crosshairImg = document.createElement('img');
crosshairImg.src = 'assets/crosshair.svg';

// Style the image to be fixed at the center of the screen
crosshairImg.style.position = 'fixed';
crosshairImg.style.top = '50%';
crosshairImg.style.left = '50%';
crosshairImg.style.transform = 'translate(-50%, -50%)';
crosshairImg.style.width = '30px';
crosshairImg.style.height = '30px';
crosshairImg.style.pointerEvents = 'none'; // Ensures it doesn't interfere with mouse events

document.body.appendChild(crosshairImg);

// Room geometry
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
directionalLight.castShadow = false;
scene.add(directionalLight);

// Corner lights with increased intensity and adjusted range
const createPointLight = (x, y, z) => {
    const light = new THREE.PointLight(0xffffff, 0.5, 8);
    light.position.set(x, y, z);
    light.decay = 2;
    return light;
};

// Adjusted corner light positions slightly inward
scene.add(createPointLight(3.5, 3, -7));
scene.add(createPointLight(-3.5, 3, -7));
scene.add(createPointLight(3.5, 3, 7));
scene.add(createPointLight(-3.5, 3, 7));

// Replace OrbitControls with PointerLockControls
const controls = new PointerLockControls(camera, document.body);

// Variables to store target and current camera positions
const targetPosition = new THREE.Vector3();
const currentPosition = new THREE.Vector3();
const smoothingFactor = 0.1;

// Click to start
document.addEventListener('click', () => {
    controls.lock();
});

let lastUpdateTime = 0;
const updateInterval = 16; // Update every 16ms (~60fps)
document.addEventListener('mousemove', (event) => {
    const now = performance.now();
    if (now - lastUpdateTime >= updateInterval) {
        lastUpdateTime = now;

        // Normalize mouse position to a range of -1 to 1
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        // Set the target position based on mouse movement
        targetPosition.set(mouseX * 5, mouseY * 5, camera.position.z);
    }
});

// function createAxisLine(color, start, end) {
//     const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
//     const material = new THREE.LineBasicMaterial({ color: color });
//     return new THREE.Line(geometry, material);
// }

// // Create axis lines
// const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 0, 0));
// const yAxis = createAxisLine(0x00ff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 5, 0));
// const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 5));

// // Add axes to scene
// scene.add(xAxis);
// scene.add(yAxis);
// scene.add(zAxis);

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Simplified animate function
function animate() {
    requestAnimationFrame(animate);

    // Smoothly interpolate the camera's position towards the target position
    currentPosition.lerp(targetPosition, smoothingFactor);
    camera.position.copy(currentPosition);

    // Ensure the camera looks at the center of the scene
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
