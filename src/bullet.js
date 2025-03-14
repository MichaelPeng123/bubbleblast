import * as THREE from "three";

class TrailBubble {
    constructor(scene, position, size) {
        this.scene = scene;
        this.lifetime = 1.0; // bubble lifetime
        this.age = 0;

        const geometry = new THREE.SphereGeometry(size);

        const material = new THREE.MeshPhysicalMaterial({
            color: 0xb8e2ff, // light blue
            transparent: true,
            opacity: 0.6,
            roughness: 0.1,
            metalness: 0.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            envMapIntensity: 1.0,
            refractionRatio: 0.98,
            transmission: 0.98,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);

        // natural movement
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01
        );

        scene.add(this.mesh);
    }

    update(deltaTime) {
        this.age += deltaTime;

        this.mesh.position.add(this.velocity);

        if (this.mesh.material) {
            this.mesh.material.opacity = 0.6 * (1 - this.age / this.lifetime); // fade

            const scale = 1 + (this.age / this.lifetime) * 0.3; // grow bubbles with age
            this.mesh.scale.set(scale, scale, scale);
        }

        return this.age < this.lifetime;
    }

    remove() {
        this.scene.remove(this.mesh);
        if (this.mesh.material) {
            this.mesh.material.dispose();
        }
        if (this.mesh.geometry) {
            this.mesh.geometry.dispose();
        }
    }
}

export class BulletSystem {
    constructor(scene, levelManager) {
        this.scene = scene;
        this.levelManager = levelManager;
        this.bullets = [];
        this.trailBubbles = [];
        this.BULLET_SPEED = 0.25;
        this.BULLET_RADIUS = 0.15;

        this.trailSpawnRate = 0.05;
        this.lastTrailTime = 0;
        this.trailBubbleSize = 0.015;
        this.clock = new THREE.Clock();
    }

    createBullet(position, direction) {
        const geometry = new THREE.SphereGeometry(this.BULLET_RADIUS);
        const bubbleTexture = new THREE.TextureLoader().load("../assets/bubble.png");

        const material = new THREE.MeshPhysicalMaterial({
            color: 0x26f7fd,
            emissive: 0x26f7fd,
            emissiveIntensity: 0.3,
            map: bubbleTexture,
            transparent: true,
            opacity: 0.9,
            roughness: 0.2,
            metalness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
        });

        const bullet = new THREE.Mesh(geometry, material);

        const offsetPosition = position.clone().add(direction.clone().multiplyScalar(0.5));
        bullet.position.copy(offsetPosition);
        bullet.velocity = direction.normalize().multiplyScalar(this.BULLET_SPEED);

        bullet.lastTrailTime = 0;

        this.scene.add(bullet);
        this.bullets.push(bullet);

        this.lastTrailTime = 0;
    }

    update(roomBounds) {
        const deltaTime = this.clock.getDelta();
        this.lastTrailTime += deltaTime;

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.position.add(bullet.velocity);

            if (this.lastTrailTime >= this.trailSpawnRate) {
                const trailPosition = bullet.position.clone();

                trailPosition.x += (Math.random() - 0.5) * 0.05;
                trailPosition.y += (Math.random() - 0.5) * 0.05;
                trailPosition.z += (Math.random() - 0.5) * 0.05;

                const size = this.trailBubbleSize * (0.7 + Math.random() * 0.6);

                const trailBubble = new TrailBubble(this.scene, trailPosition, size);
                this.trailBubbles.push(trailBubble);
                this.lastTrailTime = 0;
            }

            if (this.levelManager.checkCollision(bullet)) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
                continue;
            }

            if (Math.abs(bullet.position.x) > roomBounds.x || Math.abs(bullet.position.y) > roomBounds.y || Math.abs(bullet.position.z) > 10) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
            }
        }

        for (let i = this.trailBubbles.length - 1; i >= 0; i--) {
            const trailBubble = this.trailBubbles[i];
            const alive = trailBubble.update(deltaTime);

            if (!alive) {
                trailBubble.remove();
                this.trailBubbles.splice(i, 1);
            }
        }
    }
}
