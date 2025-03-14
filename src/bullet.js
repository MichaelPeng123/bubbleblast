import * as THREE from "three";

// New class for trail bubble particles
class TrailBubble {
    constructor(scene, position, size) {
        this.scene = scene;
        this.lifetime = 1.0; // Seconds the bubble will live
        this.age = 0;
        
        // Create bubble geometry (smaller than main bullet)
        const geometry = new THREE.SphereGeometry(size);
        
        // Translucent material with proper shading - lighter color and more transparent
        const material = new THREE.MeshPhysicalMaterial({
        color: 0xb8e2ff, // Lighter blue color (was 0x88ccff)
        transparent: true,
        opacity: 0.6, // Slightly reduced opacity (was 0.7)
        roughness: 0.1, // Reduced roughness for more shine (was 0.2)
        metalness: 0.0, // Reduced metalness (was 0.1)
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.0,
        refractionRatio: 0.98,
        transmission: 0.98 // Increased transmission for more transparency (was 0.95)
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        
        // Add some random velocity for natural movement
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
            // Fade out based on age
            this.mesh.material.opacity = 0.6 * (1 - this.age / this.lifetime);
            
            // Slightly grow the bubble as it ages
            const scale = 1 + (this.age / this.lifetime) * 0.3;
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
        
        // Trail effect settings
        this.trailSpawnRate = 0.05;
        this.lastTrailTime = 0;
        this.trailBubbleSize = 0.015;
        this.clock = new THREE.Clock();
    }

    createBullet(position, direction) {
        const geometry = new THREE.SphereGeometry(this.BULLET_RADIUS);
        const bubbleTexture = new THREE.TextureLoader().load("../assets/bubble.png");
        
        // Enhanced material for main bullet
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
            clearcoatRoughness: 0.1
        });
        
        const bullet = new THREE.Mesh(geometry, material);

        // Offset bullet slightly forward
        const offsetPosition = position.clone().add(direction.clone().multiplyScalar(0.5));
        bullet.position.copy(offsetPosition);
        bullet.velocity = direction.normalize().multiplyScalar(this.BULLET_SPEED);
        
        // Add trail properties
        bullet.lastTrailTime = 0;

        this.scene.add(bullet);
        this.bullets.push(bullet);
        
        // Reset clock for new bullet
        this.lastTrailTime = 0;
    }

    update(roomBounds) {
        const deltaTime = this.clock.getDelta();
        this.lastTrailTime += deltaTime;
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.position.add(bullet.velocity);
            
            // Create trail bubbles at regular intervals
            if (this.lastTrailTime >= this.trailSpawnRate) {
                const trailPosition = bullet.position.clone();
                
                // Add slight random offset for more natural look
                trailPosition.x += (Math.random() - 0.5) * 0.05;
                trailPosition.y += (Math.random() - 0.5) * 0.05;
                trailPosition.z += (Math.random() - 0.5) * 0.05;
                
                // Slightly randomize size
                const size = this.trailBubbleSize * (0.7 + Math.random() * 0.6);
                
                const trailBubble = new TrailBubble(this.scene, trailPosition, size);
                this.trailBubbles.push(trailBubble);
                this.lastTrailTime = 0;
            }

            // Check for collision with a dirty bubble
            if (this.levelManager.checkCollision(bullet)) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
                continue;
            }

            // Remove bullet if it leaves the room bounds
            if (Math.abs(bullet.position.x) > roomBounds.x || 
                Math.abs(bullet.position.y) > roomBounds.y || 
                Math.abs(bullet.position.z) > 10) {
                    this.scene.remove(bullet);
                    this.bullets.splice(i, 1);
            }
        }
        
        // Update trail bubbles
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
