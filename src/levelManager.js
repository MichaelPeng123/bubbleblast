import * as THREE from "three";

export class Target {
    constructor(scene, position, velocity, radius = 0.5) {
        this.scene = scene;
        this.radius = radius;
        const geometry = new THREE.CircleGeometry(this.radius, 32);
        const targetTexture = new THREE.TextureLoader().load(
            "../assets/bubble.png"
        );
        const material = new THREE.MeshStandardMaterial({
            emissive: 0xffffff,
            emissiveIntensity: 0.1,
            side: THREE.DoubleSide,
            map: targetTexture,
            transparent: true,
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
        if (
            this.mesh.position.x >= bounds.x ||
            this.mesh.position.x <= -bounds.x
        ) {
            this.velocity.x *= -1;
        }
        if (
            this.mesh.position.y >= bounds.y ||
            this.mesh.position.y <= -bounds.y
        ) {
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
        this.levelDifficultyMultipliers = {
            1: 1.0,
            2: 1.0,
            3: 1.0,
            4: 1.0,
            5: 1.0,
        };
        this.initLevel();
    }

    calculatePerformanceScore(accuracy, timeSpent) {
        const maxExpectedTime = 60000; // 60 seconds as baseline for each level
        const timeScore = Math.max(0, 1 - timeSpent / maxExpectedTime);
        const accuracyWeight = 0.6; // Accuracy is weighted more heavily
        const timeWeight = 0.4; // Time is weighted less

        return accuracy * accuracyWeight + timeScore * timeWeight;
    }

    // Add method to adjust difficulty
    adjustDifficulty(accuracy, timeSpent) {
        const performanceScore = this.calculatePerformanceScore(
            accuracy,
            timeSpent
        );
        const nextLevel = this.currentLevel + 1;

        if (nextLevel <= 3) {
            // Only adjust if there's a next level
            // Reset multiplier for next level
            this.levelDifficultyMultipliers[nextLevel] = 1.0;

            // Adjust difficulty based on performance
            if (performanceScore > 0.8) {
                this.levelDifficultyMultipliers[nextLevel] += 0.4;
            } else if (performanceScore > 0.6) {
                this.levelDifficultyMultipliers[nextLevel] += 0.25;
            } else if (performanceScore > 0.4) {
                this.levelDifficultyMultipliers[nextLevel] += 0.15;
            }

            console.log(
                `Performance score: ${performanceScore.toFixed(
                    2
                )}, Next level difficulty: ${this.levelDifficultyMultipliers[
                    nextLevel
                ].toFixed(2)}x`
            );
        }
    }

    initLevel() {
        // Remove any existing targets
        this.targets.forEach((target) => target.remove());
        this.targets = [];

        // Set different properties based on level
        let numberOfTargets, baseSpeedMultiplier;
        if (this.currentLevel === 1) {
            numberOfTargets = 3;
            baseSpeedMultiplier = 1;
        } else if (this.currentLevel === 2) {
            numberOfTargets = 5;
            baseSpeedMultiplier = 1.5;
        } else if (this.currentLevel === 3) {
            numberOfTargets = 7;
            baseSpeedMultiplier = 2;
        } else if (this.currentLevel === 4) {
            numberOfTargets = 7;
            baseSpeedMultiplier = 2.5;
        } else if (this.currentLevel === 5) {
            numberOfTargets = 7;
            baseSpeedMultiplier = 3;
        } else {
            numberOfTargets = 7;
            baseSpeedMultiplier = 3;
        }

        // Apply level-specific difficulty multiplier to speed
        const finalSpeedMultiplier =
            baseSpeedMultiplier *
            this.levelDifficultyMultipliers[this.currentLevel];

        // Create the targets for the current level
        for (let i = 0; i < numberOfTargets; i++) {
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 6,
                -9.9
            );
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.05 * finalSpeedMultiplier,
                (Math.random() - 0.5) * 0.05 * finalSpeedMultiplier,
                0
            );
            const target = new Target(this.scene, position, velocity);
            this.targets.push(target);
        }
    }

    update(bounds) {
        this.targets.forEach((target) => target.update(bounds));
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
        if (this.currentLevel < 5) {
            // Changed from 3 to 5
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
