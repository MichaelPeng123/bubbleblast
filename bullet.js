import * as THREE from "three";

export class BulletSystem {
  constructor(scene, levelManager) {
    this.scene = scene;
    this.levelManager = levelManager;
    this.bullets = [];
    this.BULLET_SPEED = 0.25;
    this.BULLET_RADIUS = 0.15;
  }

  createBullet(position, direction) {
    const geometry = new THREE.SphereGeometry(this.BULLET_RADIUS);
    const material = new THREE.MeshStandardMaterial({
      color: 0xefbf04,
      emissive: 0xefbf04,
      emissiveIntensity: 0.5,
      metalness: 0.5,
      roughness: 0.2,
    });
    const bullet = new THREE.Mesh(geometry, material);

    // Offset the bullet position slightly forward
    const offsetPosition = position.clone().add(direction.clone().multiplyScalar(0.5));
    bullet.position.copy(offsetPosition);

    bullet.velocity = direction.normalize().multiplyScalar(this.BULLET_SPEED);
    bullet.castShadow = true;
    bullet.receiveShadow = true;

    this.scene.add(bullet);
    this.bullets.push(bullet);
  }

  update(roomBounds) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.position.add(bullet.velocity);

      // Check for collision with any target
      if (this.levelManager.checkCollision(bullet)) {
        this.scene.remove(bullet);
        this.bullets.splice(i, 1);
        continue;
      }

      // Remove bullet if it leaves the room bounds
      if (
        Math.abs(bullet.position.x) > roomBounds.x ||
        Math.abs(bullet.position.y) > roomBounds.y ||
        Math.abs(bullet.position.z) > 10
      ) {
        this.scene.remove(bullet);
        this.bullets.splice(i, 1);
      }
    }
  }
}
