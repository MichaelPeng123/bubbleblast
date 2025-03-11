import * as THREE from "three";

export class TargetSystem {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.TARGET_RADIUS = 0.5;

        // Set movement properties
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.05, // Random X speed
            (Math.random() - 0.5) * 0.05, // Random Y speed
            0 // No Z movement (stays on the front wall)
        );

        this.createTarget();
    }

    createTarget() {
        const geometry = new THREE.CircleGeometry(this.TARGET_RADIUS, 32);

        const bubbleTexture = new THREE.TextureLoader().load('assets/bubble.png');
        const material = new THREE.MeshStandardMaterial({
            // color: 0x1ddce3,
            emissive: 0xffffff,
            emissiveIntensity: 0.075,
            side: THREE.DoubleSide,
            map: bubbleTexture
        });
        this.target = new THREE.Mesh(geometry, material);

        // Initial position on the front wall
        this.target.position.set(0, 0, -9.9);
        this.scene.add(this.target);
    }

    update(bounds) {
        // Move the target
        this.target.position.add(this.velocity);

        // Bounce off the walls (keep within X and Y limits)
        if (this.target.position.x >= bounds.x || this.target.position.x <= -bounds.x) {
            this.velocity.x *= -1; // Reverse X direction
        }
        if (this.target.position.y >= bounds.y || this.target.position.y <= -bounds.y) {
            this.velocity.y *= -1; // Reverse Y direction
        }
    }

    checkCollision(bullet) {
        const distance = bullet.position.distanceTo(this.target.position);
        if (distance < this.TARGET_RADIUS + bullet.geometry.parameters.radius) {
            console.log("Target hit!"); // Add debug logging
            return true;
        }
        return false;
    }

    getScore() {
        return this.score;
    }

    incrementScore() {
        this.score++;
    }
}
