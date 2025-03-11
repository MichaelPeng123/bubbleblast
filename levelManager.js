import * as THREE from "three";

export class Target {
  constructor(scene, position, velocity, radius = 0.5) {
    this.scene = scene;
    this.radius = radius;
    const geometry = new THREE.CircleGeometry(this.radius, 32);
    const bubbleTexture = new THREE.TextureLoader().load('assets/bubble.png');
    const material = new THREE.MeshStandardMaterial({
      emissive: 0xffffff,
      emissiveIntensity: 0.075,
      side: THREE.DoubleSide,
      map: bubbleTexture
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    this.velocity = velocity;
    this.scene.add(this.mesh);
  }

  update(bounds) {
    // Move the target
    this.mesh.position.add(this.velocity);

    // Bounce off the walls (X and Y limits)
    if (this.mesh.position.x >= bounds.x || this.mesh.position.x <= -bounds.x) {
      this.velocity.x *= -1;
    }
    if (this.mesh.position.y >= bounds.y || this.mesh.position.y <= -bounds.y) {
      this.velocity.y *= -1;
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
    this.score = 0;
    this.initLevel();
  }

  initLevel() {
    // Remove any existing targets
    this.targets.forEach(target => target.remove());
    this.targets = [];

    // Set different properties based on level
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

    // Create the targets for the current level
    for (let i = 0; i < numberOfTargets; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 8,  // X position range
        (Math.random() - 0.5) * 6,  // Y position range
        -9.9                      // Always on the front wall
      );
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.05 * speedMultiplier,
        (Math.random() - 0.5) * 0.05 * speedMultiplier,
        0
      );
      const target = new Target(this.scene, position, velocity);
      this.targets.push(target);
    }
  }

  update(bounds) {
    this.targets.forEach(target => target.update(bounds));
  }

  checkCollision(bullet) {
    // Check each target – if a collision is detected, remove that target and add to score
    for (let i = 0; i < this.targets.length; i++) {
      if (this.targets[i].checkCollision(bullet)) {
        this.targets[i].remove();
        this.targets.splice(i, 1);
        this.score++;
        return true;
      }
    }
    return false;
  }

  allTargetsCleared() {
    return this.targets.length === 0;
  }

  nextLevel() {
    if (this.currentLevel < 3) {
      this.currentLevel++;
      this.initLevel();
    } else {
      console.log("Game complete! Final score:", this.score);
      // Optionally, you might reset the game or show a game over screen here.
    }
  }

  getScore() {
    return this.score;
  }

  getCurrentLevel() {
    return this.currentLevel;
  }
}
