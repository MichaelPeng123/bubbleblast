import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { BulletSystem } from "./bullet.js";
import { LevelManager } from "./levelManager.js";
import { StoryManager } from "./storyManager.js";
import { EndScreen } from "./endScreen.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 0, 0);
camera.lookAt(0, 0, -12);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Level Info: Level, Bubbles Left, Time
const levelInfo = document.createElement('div');
levelInfo.id = "hud";
levelInfo.style.position = "absolute";
levelInfo.style.top = "10px";
levelInfo.style.right = "10px";
levelInfo.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
levelInfo.style.color = "black";
levelInfo.style.padding = "10px 20px";
levelInfo.style.fontSize = "24px";
levelInfo.style.borderRadius = "5px";
levelInfo.style.fontFamily = "Arial, sans-serif";
levelInfo.style.zIndex = "1000";
document.body.appendChild(levelInfo);

const levelText = document.createElement('div');
levelText.id = "levelText";
levelInfo.appendChild(levelText);

const bubblesLeftText = document.createElement('div');
bubblesLeftText.id = "bubblesLeftText";
levelInfo.appendChild(bubblesLeftText);

const timeText = document.createElement('div');
timeText.id = "timeText";
levelInfo.appendChild(timeText);

// Crosshair
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

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let gameRunning = false;
let levelCompleted = false;
let gameStats = {
  shotsFired: 0,
  shotsHit: 0,
  levelTimes: [0, 0, 0],
  levelStartTime: 0,
  totalTime: 0
};

//const moveSpeed = 0.005;
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

const roomGeometry = new THREE.BoxGeometry(18, 8, 24);
const textureLoader = new THREE.TextureLoader();
const materials = [
  new THREE.MeshStandardMaterial({ 
    map: textureLoader.load('assets/spongebob-view1.jpg'),
    side: THREE.BackSide 
  }), // Right 
  new THREE.MeshStandardMaterial({ 
    map: textureLoader.load('assets/spongebob-view1.jpg'),
    side: THREE.BackSide 
  }), // Left 
  new THREE.MeshStandardMaterial({ 
    map: textureLoader.load('assets/spongebob-sky.jpg'),
    side: THREE.BackSide 
  }), // Top 
  new THREE.MeshStandardMaterial({ 
    map: textureLoader.load('assets/spongebob-sand.jpg'),
    side: THREE.BackSide 
  }), // Bottom 
  new THREE.MeshStandardMaterial({ 
    map: textureLoader.load('assets/spongebob-backdrop.jpg'),
    side: THREE.BackSide 
  }), // Front
  new THREE.MeshStandardMaterial({ 
    map: textureLoader.load('assets/spongebob-barren.gif'),
    side: THREE.BackSide 
  }), // Back
];
const room = new THREE.Mesh(roomGeometry, materials);
scene.add(room);

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

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

const levelManager = new LevelManager(scene);
const bulletSystem = new BulletSystem(scene, levelManager);
const storyManager = new StoryManager(document.body);
const endScreen = new EndScreen(document.body, gameStats, restartGame);

// Configure bubble depth movement
levelManager.setMovementConfig({
  enabled: true,     // Turn on depth movement
  range: 2,          // How far bubbles can move in z-direction (back and forth)
  speed: 0.015       // Speed of the depth movement
});

const originalCreateBullet = bulletSystem.createBullet;
const originalCheckCollision = levelManager.checkCollision;
bulletSystem.createBullet = function(position, direction) {
  gameStats.shotsFired++;
  originalCreateBullet.call(this, position, direction);
};
levelManager.checkCollision = function(bullet) {
  const hit = originalCheckCollision.call(this, bullet);
  if (hit) gameStats.shotsHit++;
  return hit;
};

// Setup for FPS feel and mouse controls
const controls = new PointerLockControls(camera, renderer.domElement);
const sensitivity = 0.005;
controls.onMouseMove = function (event) {
  if (!this.isLocked) return;
  const movementX = event.movementX || 0;
  const movementY = event.movementY || 0;
  this.yawObject.rotation.y -= movementX * sensitivity;
  this.pitchObject.rotation.x -= movementY * sensitivity;
  this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
};

// Create an audio listener and attach it to the camera
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

// Create audio source for blast sound 
const blastSound = new THREE.Audio(audioListener);

// Create audio source for level complete sound
const levelCompleteSound = new THREE.Audio(audioListener);

// Add flags to track if sounds are loaded
let soundLoaded = false;
let levelCompleteSoundLoaded = false;

// Load the blast sound with explicit error handling
const audioLoader = new THREE.AudioLoader();
audioLoader.load(
  'assets/blast.mp3',
  function(buffer) {
    blastSound.setBuffer(buffer);
    blastSound.setVolume(1.0); // Increased volume to maximum
    blastSound.setLoop(false);
    soundLoaded = true;
    console.log("Blast sound loaded successfully"); // Debug message
  },
  function(xhr) {
    console.log("Blast sound: " + (xhr.loaded / xhr.total * 100) + '% loaded'); // Show loading progress
  },
  function(error) {
    console.error('Error loading blast sound:', error); // Show loading errors
  }
);

// Load the level complete sound with explicit error handling
audioLoader.load(
  'assets/level_complete.mp3',
  function(buffer) {
    levelCompleteSound.setBuffer(buffer);
    levelCompleteSound.setVolume(0.6); // Full volume for level complete
    levelCompleteSound.setLoop(false);
    levelCompleteSoundLoaded = true;
    console.log("Level complete sound loaded successfully");
  },
  function(xhr) {
    console.log("Level complete sound: " + (xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function(error) {
    console.error('Error loading level complete sound:', error);
  }
);

// Initialize audio context with explicit user interaction
document.addEventListener('click', function initAudio() {
  // Resume audio context on first click
  if (audioListener.context.state === 'suspended') {
    audioListener.context.resume().then(() => {
      console.log('AudioContext resumed');
    });
    document.removeEventListener('click', initAudio);
  }
}, { once: false });

// Modified click handler with debugging
document.addEventListener("click", () => {
  if (controls.isLocked && gameRunning && !storyManager.isActive() && !endScreen.isActive()) {
    const bulletPosition = camera.position.clone();
    const bulletDirection = new THREE.Vector3();
    camera.getWorldDirection(bulletDirection);
    bulletSystem.createBullet(bulletPosition, bulletDirection);
    
    // Play blast sound with debugging
    console.log("Attempting to play sound, loaded:", soundLoaded);
    
    if (soundLoaded) {
      // Make sure audio context is running
      if (audioListener.context.state !== 'running') {
        audioListener.context.resume();
      }
      
      if (blastSound.isPlaying) {
        blastSound.stop(); // Stop and reset the sound
      }
      
      // Play with explicit error handling
      try {
        blastSound.play();
        console.log("Sound play() called");
      } catch (e) {
        console.error("Error playing sound:", e);
      }
    } else {
      console.warn("Sound not loaded yet");
    }
  } else if (!storyManager.isActive() && !endScreen.isActive()) {
    controls.lock();
  }
});

function restartGame() {
    gameRunning = false;
    levelCompleted = false;
    gameStats = {
        shotsFired: 0,
        shotsHit: 0,
        levelTimes: [0, 0, 0],
        levelStartTime: performance.now(),
        totalTime: 0,
        finalScore: 0
    };

    // Remove all bullets
    bulletSystem.bullets.forEach(bullet => bulletSystem.scene.remove(bullet));
    bulletSystem.bullets = [];
    // Reset level
    levelManager.currentLevel = 1;
    levelManager.initLevel();
    if (endScreen.isActive()) {
        endScreen.hide();
    }

    updateHUD();
    startGame();
}

function startGame() {
  storyManager.showStory("intro", () => {
    gameRunning = true;
    controls.lock();
    gameStats.levelStartTime = performance.now();
  });
}

function handleLevelComplete() {
    gameRunning = false;
    levelCompleted = true;
    controls.unlock();
    
    const currentLevel = levelManager.getCurrentLevel();
    
    const levelEndTime = performance.now();
    const levelTime = levelEndTime - gameStats.levelStartTime;
    gameStats.levelTimes[currentLevel - 1] = levelTime;
    gameStats.totalTime += levelTime;
    
    if (currentLevel === 3) {
        storyManager.showStory("level3Complete", () => {
            showEndScreen();
        });
    } else {
        let storyKey = currentLevel === 1 ? "level1Complete" : "level2Complete";
        
        storyManager.showStory(storyKey, () => {
            levelManager.nextLevel();
            gameRunning = true;
            levelCompleted = false;
            controls.lock();
            
            gameStats.levelStartTime = performance.now();
        });
    }
}

function showEndScreen() {
    let accuracy = gameStats.shotsFired > 0 ? (gameStats.shotsHit / gameStats.shotsFired) * 100 : 0;
  
    let baseScore = 1000;
    let accuracyBonus = accuracy * 10;
    let timePenalty = gameStats.totalTime / 100;
    gameStats.finalScore = Math.max(0, baseScore + accuracyBonus - timePenalty);
  
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
    if (!controls.isLocked) return;

    let moveSpeed = 0.05;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, direction).normalize();

    if (moveState.forward) camera.position.addScaledVector(direction, moveSpeed);
    if (moveState.backward) camera.position.addScaledVector(direction, -moveSpeed);
    if (moveState.left) camera.position.addScaledVector(right, moveSpeed);
    if (moveState.right) camera.position.addScaledVector(right, -moveSpeed);

    checkBounds(camera.position);
}

function animate() {
    if (gameRunning && !storyManager.isActive() && !endScreen.isActive()) {
        bulletSystem.update(ROOM_BOUNDS);
        levelManager.update(ROOM_BOUNDS);
        updateMovement();
        updateHUD();
        
        if (levelManager.allTargetsCleared() && !levelCompleted) {
            console.log("Level completed! Attempting to play LEVEL COMPLETE sound");
            
            if (soundLoaded) {
                if (audioListener.context.state !== 'running') {
                    audioListener.context.resume();
                }
                
                if (blastSound.isPlaying) {
                    blastSound.stop();
                }
                
                try {
                    levelCompleteSound.play();
                    console.log("Level complete sound played successfully");
                } catch (e) {
                    console.error("Error playing level complete sound:", e);
                }
            } else {
                console.warn("Level complete sound not loaded yet");
            }
            
            handleLevelComplete();
        }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

startGame();
animate();