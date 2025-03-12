import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { BulletSystem } from "./bullet.js";
import { LevelManager } from "./levelManager.js";
import { StoryManager } from "./storyManager.js";
import { EndScreen } from "./endScreen.js";

// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // White background

// Create HUD container
const hudContainer = document.createElement('div');
hudContainer.id = "hud";
hudContainer.style.position = "absolute";
hudContainer.style.top = "10px";
hudContainer.style.right = "10px";
hudContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
hudContainer.style.color = "black";
hudContainer.style.padding = "10px 20px";
hudContainer.style.fontSize = "18px";
hudContainer.style.borderRadius = "5px";
hudContainer.style.fontFamily = "Arial, sans-serif";
hudContainer.style.zIndex = "1000";
document.body.appendChild(hudContainer);

// Create Level Display
const levelText = document.createElement('div');
levelText.id = "levelText";
hudContainer.appendChild(levelText);

// Create Bubbles Left Display
const bubblesLeftText = document.createElement('div');
bubblesLeftText.id = "bubblesLeftText";
hudContainer.appendChild(bubblesLeftText);

// Create Time Display
const timeText = document.createElement('div');
timeText.id = "timeText";
hudContainer.appendChild(timeText);


// Set up the camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 0);
camera.lookAt(0, 0, -10); // Look towards the restricted half

// Game state management
let gameRunning = false;
let levelCompleted = false;
let gameStats = {
  shotsFired: 0,
  shotsHit: 0,
  levelTimes: [0, 0, 0],  // Time per level
  levelStartTime: 0,      // Timestamp when level started
  totalTime: 0            // Total gameplay time (excluding story screens)
};

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

// Crosshair setup
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

// Create room geometry
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

// Room bounds
const ROOM_BOUNDS = {
  x: 4.5,
  y: 3.5,
  z: { min: 0, max: 9.5 }
};

function checkBounds(position) {
  position.x = Math.max(-ROOM_BOUNDS.x, Math.min(ROOM_BOUNDS.x, position.x));
  position.y = Math.max(-ROOM_BOUNDS.y, Math.min(ROOM_BOUNDS.y, position.y));
  position.z = Math.max(ROOM_BOUNDS.z.min, Math.min(ROOM_BOUNDS.z.max, position.z));
  return position;
}

// Optional: additional point lights for extra brightness
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

// Initialize Level and Bullet systems
const levelManager = new LevelManager(scene);
const bulletSystem = new BulletSystem(scene, levelManager);

// Initialize UI Managers
const storyManager = new StoryManager(document.body);
const endScreen = new EndScreen(document.body, gameStats, restartGame);

// Custom BulletSystem extension to track hits
const originalCreateBullet = bulletSystem.createBullet;
bulletSystem.createBullet = function(position, direction) {
  gameStats.shotsFired++;
  originalCreateBullet.call(this, position, direction);
};

// Custom LevelManager extension to track hits
const originalCheckCollision = levelManager.checkCollision;
levelManager.checkCollision = function(bullet) {
  const hit = originalCheckCollision.call(this, bullet);
  if (hit) {
    gameStats.shotsHit++;
  }
  return hit;
};

// PointerLockControls setup
const controls = new PointerLockControls(camera, renderer.domElement);
const sensitivity = 0.01;
controls.onMouseMove = function (event) {
  if (!this.isLocked) return;
  const movementX = event.movementX || 0;
  const movementY = event.movementY || 0;
  this.yawObject.rotation.y -= movementX * sensitivity;
  this.pitchObject.rotation.x -= movementY * sensitivity;
  this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
};

document.addEventListener("click", () => {
  // Only create bullets when the game is running and no UI is showing
  if (controls.isLocked && gameRunning && !storyManager.isActive() && !endScreen.isActive()) {
    const bulletPosition = camera.position.clone();
    const bulletDirection = new THREE.Vector3();
    camera.getWorldDirection(bulletDirection);
    bulletSystem.createBullet(bulletPosition, bulletDirection);
  } else if (!storyManager.isActive() && !endScreen.isActive()) {
    // Only lock controls if no UI is showing
    controls.lock();
  }
});

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Restart the game
function restartGame() {
    gameRunning = false;
    levelCompleted = false;

    // Reset game stats
    gameStats = {
        shotsFired: 0,
        shotsHit: 0,
        levelTimes: [0, 0, 0],
        levelStartTime: performance.now(), // Start new timer
        totalTime: 0,
        finalScore: 0
    };

    // Clear all bullets from the scene
    bulletSystem.bullets.forEach(bullet => bulletSystem.scene.remove(bullet));
    bulletSystem.bullets = [];

    // Reset level manager
    levelManager.currentLevel = 1;
    levelManager.initLevel();

    // Hide end screen if active
    if (endScreen.isActive()) {
        endScreen.hide();
    }

    updateHUD();

    startGame();
}

// Start the game with intro story
function startGame() {
  // Show intro story
  storyManager.showStory("intro", () => {
    gameRunning = true;
    controls.lock();  // Lock controls after intro
    
    // Start timing for level 1
    gameStats.levelStartTime = performance.now();
  });
}

// Handle level completion
function handleLevelComplete() {
  gameRunning = false;
  levelCompleted = true;
  controls.unlock();  // Unlock controls to show story
  
  const currentLevel = levelManager.getCurrentLevel();
  
  // Record time for this level
  const levelEndTime = performance.now();
  const levelTime = levelEndTime - gameStats.levelStartTime;
  gameStats.levelTimes[currentLevel - 1] = levelTime;
  gameStats.totalTime += levelTime;
  
  // Show end screen after level 3
  if (currentLevel === 3) {
    storyManager.showStory("level3Complete", () => {
      showEndScreen();
    });
  } else {
    // Show level completion story
    let storyKey = currentLevel === 1 ? "level1Complete" : "level2Complete";
    
    storyManager.showStory(storyKey, () => {
      levelManager.nextLevel();
      gameRunning = true;
      levelCompleted = false;
      controls.lock();  // Lock controls after story
      
      // Start timing for next level
      gameStats.levelStartTime = performance.now();
    });
  }
}

// Show the end screen with game stats
function showEndScreen() {
    // Calculate accuracy (avoid division by zero)
    let accuracy = gameStats.shotsFired > 0 ? (gameStats.shotsHit / gameStats.shotsFired) * 100 : 0;
  
    // Calculate score
    let baseScore = 1000;
    let accuracyBonus = accuracy * 10;
    let timePenalty = gameStats.totalTime / 100; // Reduces score slightly based on time
    gameStats.finalScore = Math.max(0, baseScore + accuracyBonus - timePenalty); // Ensures score never goes negative
  
    // Update and show the end screen
    endScreen.updateStats(gameStats);
    endScreen.show();
  }

  function updateHUD() {
    let level = levelManager.getCurrentLevel();
    let bubblesLeft = levelManager.getScore();
    let elapsedTime = (performance.now() - gameStats.levelStartTime) / 1000;
    let minutes = Math.floor(elapsedTime / 60);
    let seconds = Math.floor(elapsedTime % 60);

    document.getElementById("levelText").innerText = `Level: ${level}`;
    document.getElementById("bubblesLeftText").innerText = `Bubbles Left: ${bubblesLeft}`;
    document.getElementById("timeText").innerText = `Time: ${minutes}m ${seconds}s`;
}

function updateMovement() {
    if (!controls.isLocked) return; // Only move if Pointer Lock is active

    let moveSpeed = 0.05; // Adjust movement speed

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0; // Prevent vertical movement

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, direction).normalize();

    if (moveState.forward) camera.position.addScaledVector(direction, moveSpeed);
    if (moveState.backward) camera.position.addScaledVector(direction, -moveSpeed);
    if (moveState.left) camera.position.addScaledVector(right, moveSpeed);  // Switched sign
    if (moveState.right) camera.position.addScaledVector(right, -moveSpeed); // Switched sign

    checkBounds(camera.position);
}



// Animation loop
function animate() {
    if (gameRunning && !storyManager.isActive() && !endScreen.isActive()) {
        bulletSystem.update(ROOM_BOUNDS);
        levelManager.update(ROOM_BOUNDS);

        updateMovement();

        updateHUD();  // Keep HUD updated dynamically

        if (levelManager.allTargetsCleared() && !levelCompleted) {
            handleLevelComplete();
        }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Start everything up
startGame();
animate();