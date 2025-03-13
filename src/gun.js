import * as THREE from "three";

export class Gun {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.createGunModel();
        this.bobAmount = 0;
        this.recoilAmount = 0;
    }

    createGunModel() {
        // Create gun body
        const bodyGeometry = new THREE.BoxGeometry(0.3, 0.3, 1);
        const barrelGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.6);
        const gunMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            metalness: 1.0,
            roughness: 0.2,
            envMapIntensity: 1.5,
        });

        this.body = new THREE.Mesh(bodyGeometry, gunMaterial);
        this.barrel = new THREE.Mesh(barrelGeometry, gunMaterial);

        // Position barrel relative to body
        this.barrel.position.y = 0.25;
        this.barrel.position.z = -0.3;

        // Create gun group
        this.gunGroup = new THREE.Group();
        this.gunGroup.add(this.body);
        this.gunGroup.add(this.barrel);

        // Initial position
        this.updatePosition();

        this.scene.add(this.gunGroup);
    }

    updatePosition() {
        // Base position relative to camera
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);

        // Position gun in bottom right of view
        this.gunGroup.position.copy(this.camera.position);
        this.gunGroup.rotation.copy(this.camera.rotation);

        // Offset from camera
        this.gunGroup.translateX(0.4);
        this.gunGroup.translateY(-0.3);
        this.gunGroup.translateZ(-1);

        // Apply bob and recoil
        this.gunGroup.position.y += Math.sin(this.bobAmount) * 0.02;
        this.gunGroup.rotation.x += this.recoilAmount;

        // Decay recoil
        this.recoilAmount *= 0.9;
    }

    triggerRecoil() {
        this.recoilAmount = 0.1;
    }

    updateBob(isMoving) {
        if (isMoving) {
            this.bobAmount += 0.1;
        }
    }
}
