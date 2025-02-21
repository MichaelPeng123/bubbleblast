import * as THREE from "three";

export class BulletSystem {
    constructor(scene, targetSystem) {
        this.scene = scene;
        this.targetSystem = targetSystem;
        this.bullets = [];
        this.BULLET_SPEED = 0.01;
        this.BULLET_RADIUS = 0.15;
    }

    createBullet(position, direction) {
        const geometry = new THREE.SphereGeometry(this.BULLET_RADIUS);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5,
            metalness: 0.5,
            roughness: 0.2,
        });
        const bullet = new THREE.Mesh(geometry, material);

        // Offset the bullet position slightly forward to avoid self-collision
        const offsetPosition = position
            .clone()
            .add(direction.multiplyScalar(0.5));
        bullet.position.copy(offsetPosition);

        bullet.velocity = direction
            .normalize()
            .multiplyScalar(this.BULLET_SPEED);
        bullet.castShadow = true;
        bullet.receiveShadow = true;

        this.scene.add(bullet);
        this.bullets.push(bullet);
    }

    update(roomBounds) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.position.add(bullet.velocity);

            // Check for target collision
            if (this.targetSystem.checkCollision(bullet)) {
                this.targetSystem.incrementScore();
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
                continue;
            }

            // Check if bullet hit walls
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
