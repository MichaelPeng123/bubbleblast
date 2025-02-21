import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // White background

// Create and set up camera object
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 8); // Start at the back of the room
camera.lookAt(0, 0, -10); // Look towards the restricted half

// Movement-related setup
const moveSpeed = 0.005;
const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
};
// Movement controls
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

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Create the crosshair image element
const crosshairImg = document.createElement("img");
crosshairImg.src = "assets/crosshair.svg";

// Style the image to be fixed at the center of the screen
crosshairImg.style.position = "fixed";
crosshairImg.style.top = "50%";
crosshairImg.style.left = "50%";
crosshairImg.style.transform = "translate(-50%, -50%)";
crosshairImg.style.width = "30px";
crosshairImg.style.height = "30px";
crosshairImg.style.pointerEvents = "none"; // Ensures it doesn't interfere with mouse events

document.body.appendChild(crosshairImg);

// Room geometry
const roomGeometry = new THREE.BoxGeometry(10, 8, 20);
const roomMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
    roughness: 0.5,
    metalness: 0.5,
});
const room = new THREE.Mesh(roomGeometry, roomMaterial);
scene.add(room);
// Add these constants after room creation
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
controls.pointerSpeed = 2.0; // Increase mouse sensitivity (default is 1.0)

// Variables to store target and current camera positions
// const targetPosition = new THREE.Vector3();
// const currentPosition = new THREE.Vector3();
// const smoothingFactor = 0.1;

// Click to start
// Add import at the top with other imports
import { BulletSystem } from "./bullet.js";
// Add import at the top
import { TargetSystem } from "./target.js";

// Add after scene creation
const targetSystem = new TargetSystem(scene);
const bulletSystem = new BulletSystem(scene, targetSystem);

// Modify the click event listener
// document.addEventListener("click", () => {
//     controls.lock();
// });
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

// function createAxisLine(color, start, end) {
//     const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
//     const material = new THREE.LineBasicMaterial({ color: color });
//     return new THREE.Line(geometry, material);
// }

// Create axis lines
// const xAxis = createAxisLine(
//     0xff0000,
//     new THREE.Vector3(0, 0, 0),
//     new THREE.Vector3(5, 0, 0)
// );
// const yAxis = createAxisLine(
//     0x00ff00,
//     new THREE.Vector3(0, 0, 0),
//     new THREE.Vector3(0, 5, 0)
// );
// const zAxis = createAxisLine(
//     0x0000ff,
//     new THREE.Vector3(0, 0, 0),
//     new THREE.Vector3(0, 0, 5)
// );

// // Add axes to scene
// scene.add(xAxis);
// scene.add(yAxis);
// scene.add(zAxis);

// Handle window resizing
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Simplified animate function
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        // Handle movement
        if (moveState.forward) controls.moveForward(moveSpeed);
        if (moveState.backward) controls.moveForward(-moveSpeed);
        if (moveState.left) controls.moveRight(-moveSpeed);
        if (moveState.right) controls.moveRight(moveSpeed);

        // Check if new position is within bounds
        camera.position.copy(checkBounds(camera.position.clone()));
    }

    // Update bullets
    bulletSystem.update(ROOM_BOUNDS);

    // Update score display
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        const currentScore = targetSystem.getScore();
        scoreElement.textContent = `Score: ${currentScore}`;
    }

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
