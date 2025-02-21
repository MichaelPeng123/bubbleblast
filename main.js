import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { BulletSystem } from "./bullet.js";
import { TargetSystem } from "./target.js";

// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // White background

// Set up the camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 0);
camera.lookAt(0, 0, -10); // Look towards the restricted half

// Movement-related setup
const moveSpeed = 0.005;
const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
};
document.addEventListener("keydown", (event) => {
    switch (event.code) {
        case "KeyW":
            moveState.forward = true;
            break;
        case "KeyS":
            moveState.backward = true;
            break;
        case "KeyA":
            moveState.left = true;
            break;
        case "KeyD":
            moveState.right = true;
            break;
    }
});
document.addEventListener("keyup", (event) => {
    switch (event.code) {
        case "KeyW":
            moveState.forward = false;
            break;
        case "KeyS":
            moveState.backward = false;
            break;
        case "KeyA":
            moveState.left = false;
            break;
        case "KeyD":
            moveState.right = false;
            break;
    }
});

// Set up the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Create and style the crosshair image element
const crosshairImg = document.createElement("img");
crosshairImg.src = "assets/crosshair.svg";
crosshairImg.style.position = "fixed";
crosshairImg.style.top = "50%";
crosshairImg.style.left = "50%";
crosshairImg.style.transform = "translate(-50%, -50%)";
crosshairImg.style.width = "30px";
crosshairImg.style.height = "30px";
crosshairImg.style.pointerEvents = "none";
document.body.appendChild(crosshairImg);

// Create room geometry and add it to the scene
const roomGeometry = new THREE.BoxGeometry(10, 8, 20);
const roomMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
    roughness: 0.7,
    metalness: 0.1,
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

// Room bounds and boundary check function
const ROOM_BOUNDS = {
    x: 4.5, // Half room width - buffer
    y: 3.5, // Half room height - buffer
    z: {
        min: 0, // Restrict movement to not cross the middle
        max: 9.5, // Back wall boundary
    },
};
function checkBounds(position) {
    position.x = Math.max(-ROOM_BOUNDS.x, Math.min(ROOM_BOUNDS.x, position.x));
    position.y = Math.max(-ROOM_BOUNDS.y, Math.min(ROOM_BOUNDS.y, position.y));
    position.z = Math.max(
        ROOM_BOUNDS.z.min,
        Math.min(ROOM_BOUNDS.z.max, position.z)
    );
    return position;
}

// Corner lights with increased intensity and adjusted range
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

// Initialize Target and Bullet systems
const targetSystem = new TargetSystem(scene);
const bulletSystem = new BulletSystem(scene, targetSystem);

// Define custom sensitivity (increases responsiveness of mouse movements)
const sensitivity = 0.01;

// Set up PointerLockControls for FPS-style controls (single instance)
const controls = new PointerLockControls(camera, renderer.domElement);

// Override onMouseMove to apply custom sensitivity
controls.onMouseMove = function (event) {
    if (!this.isLocked) return;
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;
    // Adjust horizontal rotation (yaw)
    this.yawObject.rotation.y -= movementX * sensitivity;
    // Adjust vertical rotation (pitch) and clamp between -90° and 90°
    this.pitchObject.rotation.x -= movementY * sensitivity;
    this.pitchObject.rotation.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, this.pitchObject.rotation.x)
    );
};

// Click to start or shoot a bullet if already locked
document.addEventListener("click", () => {
    if (controls.isLocked) {
        const bulletPosition = camera.position.clone();
        const bulletDirection = new THREE.Vector3();
        camera.getWorldDirection(bulletDirection);
        bulletSystem.createBullet(bulletPosition, bulletDirection);
    } else {
        controls.lock();
    }
});

// Handle window resizing
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop using renderer.setAnimationLoop
function animate() {
    //requestAnimationFrame(animate);

    if (controls.isLocked) {
        // Handle movement
        if (moveState.forward) controls.moveForward(moveSpeed);
        if (moveState.backward) controls.moveForward(-moveSpeed);
        if (moveState.left) controls.moveRight(-moveSpeed);
        if (moveState.right) controls.moveRight(moveSpeed);

        // Ensure camera remains within defined bounds
        camera.position.copy(checkBounds(camera.position.clone()));
    }

    // Update bullets
    bulletSystem.update(ROOM_BOUNDS);

    targetSystem.update(ROOM_BOUNDS);

    // Update score display
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        const currentScore = targetSystem.getScore();
        scoreElement.textContent = `Score: ${currentScore}`;
    }

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
