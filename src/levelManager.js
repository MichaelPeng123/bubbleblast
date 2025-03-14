import * as THREE from "three";

class BubbleParticle {
    constructor(scene, position, size = 0.03) {
        this.scene = scene;
        this.position = position.clone();
        this.age = 0;
        this.lifetime = 1.5;

        const geometry = new THREE.SphereGeometry(size * 1.5);

        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            emissive: 0xaaaaff,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
            metalness: 0.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            transmission: 0.9,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);

        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.015,
            (Math.random() * 0.04),
            (Math.random() - 0.5) * 0.015
        );

        scene.add(this.mesh);
    }

    update(deltaTime) {
        this.age += deltaTime;

        this.mesh.position.add(this.velocity);

        if (this.mesh.material) {
            this.mesh.material.opacity = 0.7 * (1 - this.age / this.lifetime);

            const pulseScale = 1.0 + 0.1 * Math.sin(this.age * 5);
            this.mesh.scale.set(pulseScale, pulseScale, pulseScale);
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

class FloatingScore {
    constructor(scene, position, score = 100) {
        this.scene = scene;
        this.position = position.clone();
        this.age = 0;
        this.lifetime = 1.5;

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = 128;
        canvas.height = 64;

        context.fillStyle = "#FFFFFF";
        context.font = "bold 48px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(score.toString(), canvas.width / 2, canvas.height / 2);
        context.strokeStyle = "#00AAFF";
        context.lineWidth = 3;
        context.strokeText(score.toString(), canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0,
        });
        this.sprite = new THREE.Sprite(material);
        this.sprite.position.copy(this.position);
        this.sprite.scale.set(1.0, 0.5, 1.0);

        scene.add(this.sprite);
    }

    update(deltaTime) {
        this.age += deltaTime;

        this.sprite.position.y += 0.02;

        if (this.sprite.material) {
            this.sprite.material.opacity = 1.0 * (1 - this.age / this.lifetime);
        }

        return this.age < this.lifetime;
    }

    remove() {
        this.scene.remove(this.sprite);
        if (this.sprite.material && this.sprite.material.map) {
            this.sprite.material.map.dispose();
            this.sprite.material.dispose();
        }
    }
}

export class Target {
    constructor(scene, position, velocity, radius = 0.5) {
        this.scene = scene;
        this.radius = radius;
        const geometry = new THREE.CircleGeometry(this.radius, 32);
        const bubbleTexture = new THREE.TextureLoader().load("../assets/dirty-bubble.png");
        const material = new THREE.MeshStandardMaterial({
            emissive: 0x7c602b,
            emissiveIntensity: 0.5,
            map: bubbleTexture,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.velocity = velocity;
        this.scene.add(this.mesh);

        this.initialZ = position.z;
        this.depthMovementEnabled = true;
        this.depthRange = 2;
        this.depthSpeed = 0.01;
        this.depthPhase = Math.random() * Math.PI * 2; // Random starting phase

        this.bubbleEmissionRate = 0.1;
        this.timeSinceLastEmission = Math.random() * this.bubbleEmissionRate;
        this.bubblesPerEmission = Math.ceil(Math.random() * 2); // 1-2 bubbles per emission
    }

    update(bounds, deltaTime, emitBubbles = true) {
        this.mesh.position.add(this.velocity);

        // Bounce off the walls
        if (this.mesh.position.x >= bounds.x || this.mesh.position.x <= -bounds.x) {
            this.velocity.x *= -1;
        }
        if (this.mesh.position.y >= bounds.y || this.mesh.position.y <= -bounds.y) {
            this.velocity.y *= -1;
        }

        if (this.depthMovementEnabled) { // z-axis movement
            this.depthPhase += this.depthSpeed;

            const zOffset = Math.sin(this.depthPhase) * this.depthRange;
            this.mesh.position.z = this.initialZ + zOffset;
        }

        if (emitBubbles) {
            this.timeSinceLastEmission += deltaTime;

            return this.timeSinceLastEmission >= this.bubbleEmissionRate;
        }

        return false;
    }

    emitBubble(scene) {
        this.timeSinceLastEmission = 0;

        const particles = [];
        for (let i = 0; i < this.bubblesPerEmission; i++) {
            const emissionPos = this.mesh.position.clone();
            emissionPos.x += (Math.random() - 0.5) * this.radius;
            emissionPos.y += (Math.random() - 0.5) * this.radius;
            emissionPos.z += (Math.random() - 0.5) * this.radius;

            const size = 0.03 + Math.random() * 0.04;

            particles.push(new BubbleParticle(scene, emissionPos, size));
        }

        return particles;
    }

    checkCollision(bullet) {
        const distance = bullet.position.distanceTo(this.mesh.position);
        const collisionRadius = (this.radius + bullet.geometry.parameters.radius) * 1.5;
        return distance < collisionRadius;
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
        this.floatingScores = [];
        this.bubbleParticles = [];
        this.depthMovementConfig = {
            enabled: true,
            range: 2,
            speed: 0.01,
        };
        this.initLevel();
        this.clock = new THREE.Clock();
    }

    setMovementConfig(config) {
        this.depthMovementConfig = { ...this.depthMovementConfig, ...config };

        this.targets.forEach((target) => {
            target.depthMovementEnabled = this.depthMovementConfig.enabled;
            target.depthRange = this.depthMovementConfig.range;
            target.depthSpeed = this.depthMovementConfig.speed;
        });
    }

    initLevel() {
        this.targets.forEach((target) => target.remove());
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
                -9.9
            );
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.05 * speedMultiplier,
                (Math.random() - 0.5) * 0.05 * speedMultiplier,
                0
            );
            const target = new Target(this.scene, position, velocity);

            target.depthMovementEnabled = this.depthMovementConfig.enabled;
            target.depthRange = this.depthMovementConfig.range;
            target.depthSpeed = this.depthMovementConfig.speed;

            this.targets.push(target);
        }
    }

    update(bounds) {
        const deltaTime = this.clock.getDelta();

        this.targets.forEach((target) => {
            const shouldEmitBubble = target.update(bounds, deltaTime, true);

            if (shouldEmitBubble) {
                const particles = target.emitBubble(this.scene);
                this.bubbleParticles.push(...particles);
            }
        });

        for (let i = this.floatingScores.length - 1; i >= 0; i--) {
            const score = this.floatingScores[i];
            const isAlive = score.update(deltaTime);

            if (!isAlive) {
                score.remove();
                this.floatingScores.splice(i, 1);
            }
        }

        for (let i = this.bubbleParticles.length - 1; i >= 0; i--) {
            const particle = this.bubbleParticles[i];
            const isAlive = particle.update(deltaTime);

            if (!isAlive) {
                particle.remove();
                this.bubbleParticles.splice(i, 1);
            }
        }
    }

    checkCollision(bullet) {
        for (let i = 0; i < this.targets.length; i++) {
            if (this.targets[i].checkCollision(bullet)) {
                const scorePosition = this.targets[i].mesh.position.clone();
                const floatingScore = new FloatingScore(
                    this.scene,
                    scorePosition
                );
                this.floatingScores.push(floatingScore);

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
