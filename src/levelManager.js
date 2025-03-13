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

  // When a bullet collides with a target, remove that target.
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

  // Score is the number of bubbles left
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
      console.log("Game complete! Restarting the game.");
      // Restart the game: reset to level 1
      this.currentLevel = 1;
    }
    this.initLevel();
  }

  getCurrentLevel() {
    return this.currentLevel;
  }
}
