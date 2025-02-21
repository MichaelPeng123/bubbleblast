import * as THREE from "three";

export class TargetSystem {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.TARGET_RADIUS = 0.5;
        this.createTarget();
    }

    createTarget() {
        const geometry = new THREE.CircleGeometry(this.TARGET_RADIUS, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.3,
            side: THREE.DoubleSide,
        });
        this.target = new THREE.Mesh(geometry, material);

        // Position the target on the front wall
        this.target.position.set(0, 0, -9.9);
        this.scene.add(this.target);
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
