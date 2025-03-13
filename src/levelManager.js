import * as THREE from "three";

export class Target {
  constructor(scene, position, velocity, radius = 0.5) {
    this.scene = scene;
    this.radius = radius;
    const geometry = new THREE.CircleGeometry(this.radius, 32);
    const bubbleTexture = new THREE.TextureLoader().load('../assets/dirty-bubble.png');
    const material = new THREE.MeshStandardMaterial({
      emissive: 0x7c602b,
      emissiveIntensity: 0.5,
      map: bubbleTexture
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    this.velocity = velocity;
    this.scene.add(this.mesh);
    
    // Add depth movement properties
    this.initialZ = position.z;
    this.depthMovementEnabled = true;
    this.depthRange = 2;
    this.depthSpeed = 0.01;
    this.depthPhase = Math.random() * Math.PI * 2; // Random starting phase
  }

  update(bounds) {
    // Apply regular XY movement
    this.mesh.position.add(this.velocity);

    // Bounce off the walls (X and Y limits)
    if (this.mesh.position.x >= bounds.x || this.mesh.position.x <= -bounds.x) {
      this.velocity.x *= -1;
    }
    if (this.mesh.position.y >= bounds.y || this.mesh.position.y <= -bounds.y) {
      this.velocity.y *= -1;
    }
    
    // Add explicit Z-axis movement
    if (this.depthMovementEnabled) {
      // Update the phase for this frame
      this.depthPhase += this.depthSpeed;
      
      // Calculate new Z position using sine wave
      const zOffset = Math.sin(this.depthPhase) * this.depthRange;
      this.mesh.position.z = this.initialZ + zOffset;
      
      // Debug: Verify z-movement is happening
      // console.log(`Bubble Z: ${this.mesh.position.z}, Initial Z: ${this.initialZ}, Offset: ${zOffset}`);
    }
  }

  checkCollision(bullet) {
    const distance = bullet.position.distanceTo(this.mesh.position);
    return distance < this.radius + bullet.geometry.parameters.radius;
  }

  remove() {
    this.scene.remove(this.mesh);
  }
}

export class LevelManager {
  constructor(scene) {
    this.scene = scene;
    this.currentLevel = 1;
    this.targets = [];
    this.depthMovementConfig = {
      enabled: true,
      range: 2,
      speed: 0.01
    };
    this.initLevel();
  }

  setMovementConfig(config) {
    this.depthMovementConfig = {...this.depthMovementConfig, ...config};
    // Apply to existing targets
    this.targets.forEach(target => {
      target.depthMovementEnabled = this.depthMovementConfig.enabled;
      target.depthRange = this.depthMovementConfig.range;
      target.depthSpeed = this.depthMovementConfig.speed;
    });
  }

  initLevel() {
    this.targets.forEach(target => target.remove());
    this.targets = [];

    // Dynamic Level Difficulty
    let numberOfTargets, speedMultiplier;
    if (this.currentLevel === 1) {
      numberOfTargets = 3;
      speedMultiplier = 1;
    } else if (this.currentLevel === 2) {
      numberOfTargets = 5;
      speedMultiplier = 1.5;
    } else if (this.currentLevel === 3) {
      numberOfTargets = 7;
      speedMultiplier = 2;
    } else {
      numberOfTargets = 7;
      speedMultiplier = 2;
    }

    // Create dirty bubbles
    for (let i = 0; i < numberOfTargets; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        -9.9 // Start at back wall position
      );
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.05 * speedMultiplier,
        (Math.random() - 0.5) * 0.05 * speedMultiplier,
        0
      );
      const target = new Target(this.scene, position, velocity);
      
      // Apply depth movement settings
      target.depthMovementEnabled = this.depthMovementConfig.enabled;
      target.depthRange = this.depthMovementConfig.range;
      target.depthSpeed = this.depthMovementConfig.speed;
      
      this.targets.push(target);
    }
  }

  update(bounds) {
    // Make sure we call update on each target
    this.targets.forEach(target => target.update(bounds));
  }

  checkCollision(bullet) {
    for (let i = 0; i < this.targets.length; i++) {
      if (this.targets[i].checkCollision(bullet)) {
        this.targets[i].remove();
        this.targets.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  getScore() {
    return this.targets.length;
  }

  allTargetsCleared() {
    return this.targets.length === 0;
  }

  nextLevel() {
    if (this.currentLevel < 3) {
      this.currentLevel++;
    } else {
      this.currentLevel = 1;
    }
    this.initLevel();
  }

  getCurrentLevel() {
    return this.currentLevel;
  }
}
