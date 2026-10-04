/**
 * Chef3D.js - Stylized Overcooked 3D Chef Character
 * Controls character meshes, walking animations, chopping animation, holding item slot, and physics.
 */
import { FoodMeshes } from './FoodMeshes.js';

export class Chef3D {
    constructor() {
        this.group = new window.THREE.Group();

        // Physics & Movement properties
        this.position = new window.THREE.Vector3(0, 0, 0);
        this.velocity = new window.THREE.Vector2(0, 0);
        this.targetRotation = 0;
        this.currentRotation = 0;
        this.moveSpeed = 7.5;
        this.dashSpeedMultiplier = 2.4;
        this.dashCooldown = 0;
        this.dashDuration = 0;
        this.isDashing = false;

        // Interaction state
        this.heldItem = null; // { type: 'ingredient' | 'plate', id: string, ingredients: [] }
        this.isChopping = false;
        this.chopTimer = 0;
        this.walkTimer = 0;

        // Collision radius
        this.radius = 0.55;

        // Visual parts references
        this.bodyMesh = null;
        this.hatMesh = null;
        this.knifeMesh = null;
        this.handsGroup = null;
        this.heldItemSlot = null;
        this.shadowMesh = null;

        this.buildMesh();
    }

    /**
     * Build the stylized 3D Chef character mesh
     */
    buildMesh() {
        const THREE = window.THREE;

        // Materials
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfc4, roughness: 0.6 });
        const whiteCoatMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
        const hatMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        const scarfMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.5 }); // Red scarf
        const apronMat = new THREE.MeshStandardMaterial({ color: 0x1976d2, roughness: 0.5 }); // Blue apron
        const darkMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const knifeBladeMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.8, roughness: 0.2 });
        const knifeHandleMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 });

        // 1. Soft Floor Shadow
        const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
        shadowGeo.rotateX(-Math.PI / 2);
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.28,
            depthWrite: false
        });
        this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        this.shadowMesh.position.y = 0.02;
        this.group.add(this.shadowMesh);

        // 2. Character Model Root
        this.modelRoot = new THREE.Group();
        this.group.add(this.modelRoot);

        // 3. Chef Torso & Apron
        const bodyGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.85, 16);
        this.bodyMesh = new THREE.Mesh(bodyGeo, whiteCoatMat);
        this.bodyMesh.position.y = 0.55;
        this.bodyMesh.castShadow = true;
        this.bodyMesh.receiveShadow = true;
        this.modelRoot.add(this.bodyMesh);

        // Blue Apron skirt wrap
        const apronGeo = new THREE.CylinderGeometry(0.40, 0.46, 0.45, 16, 1, false, -Math.PI * 0.75, Math.PI * 1.5);
        const apron = new THREE.Mesh(apronGeo, apronMat);
        apron.position.y = 0.4;
        apron.castShadow = true;
        this.modelRoot.add(apron);

        // Chef jacket double-breasted buttons
        for (let row = 0; row < 3; row++) {
            const btnGeo = new THREE.SphereGeometry(0.035, 6, 6);
            const btnLeft = new THREE.Mesh(btnGeo, darkMat);
            btnLeft.position.set(-0.1, 0.5 + row * 0.14, 0.38);
            this.modelRoot.add(btnLeft);

            const btnRight = new THREE.Mesh(btnGeo, darkMat);
            btnRight.position.set(0.1, 0.5 + row * 0.14, 0.38);
            this.modelRoot.add(btnRight);
        }

        // 4. Red Neckerchief Scarf
        const scarfGeo = new THREE.TorusGeometry(0.28, 0.07, 8, 16);
        scarfGeo.rotateX(Math.PI / 2);
        const scarf = new THREE.Mesh(scarfGeo, scarfMat);
        scarf.position.y = 0.98;
        this.modelRoot.add(scarf);

        // Scarf knot
        const knotGeo = new THREE.SphereGeometry(0.09, 8, 8);
        const knot = new THREE.Mesh(knotGeo, scarfMat);
        knot.position.set(0, 0.96, 0.28);
        this.modelRoot.add(knot);

        // 5. Stylized Cute Head
        const headGeo = new THREE.SphereGeometry(0.38, 16, 14);
        headGeo.scale(1.05, 0.98, 1.0);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.34;
        head.castShadow = true;
        this.modelRoot.add(head);

        // Cute shiny eyes
        const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const leftEye = new THREE.Mesh(eyeGeo, darkMat);
        leftEye.position.set(-0.13, 1.36, 0.34);
        this.modelRoot.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, darkMat);
        rightEye.position.set(0.13, 1.36, 0.34);
        this.modelRoot.add(rightEye);

        // Cute round nose
        const noseGeo = new THREE.SphereGeometry(0.065, 8, 8);
        const nose = new THREE.Mesh(noseGeo, skinMat);
        nose.position.set(0, 1.3, 0.38);
        this.modelRoot.add(nose);

        // Cute French Chef Mustache
        const mustacheGeo = new THREE.TorusGeometry(0.1, 0.035, 6, 12, Math.PI);
        const mustache = new THREE.Mesh(mustacheGeo, darkMat);
        mustache.position.set(0, 1.23, 0.36);
        mustache.rotation.z = Math.PI;
        this.modelRoot.add(mustache);

        // 6. Iconic Puffy Chef Toque (Hat)
        this.hatGroup = new THREE.Group();
        this.hatGroup.position.set(0, 1.62, 0);

        // Hat band base
        const hatBaseGeo = new THREE.CylinderGeometry(0.32, 0.34, 0.18, 16);
        const hatBase = new THREE.Mesh(hatBaseGeo, hatMat);
        hatBase.position.y = 0.08;
        hatBase.castShadow = true;
        this.hatGroup.add(hatBase);

        // Hat puffy bulbous top
        const hatTopGeo = new THREE.SphereGeometry(0.48, 16, 12);
        hatTopGeo.scale(1.1, 0.85, 1.1);
        const hatTop = new THREE.Mesh(hatTopGeo, hatMat);
        hatTop.position.y = 0.34;
        hatTop.castShadow = true;
        this.hatGroup.add(hatTop);

        this.modelRoot.add(this.hatGroup);

        // 7. Hands & Carrying Slot
        this.handsGroup = new THREE.Group();
        this.handsGroup.position.set(0, 0.85, 0.35);

        // Left Hand
        const handGeo = new THREE.SphereGeometry(0.09, 8, 8);
        const leftHand = new THREE.Mesh(handGeo, skinMat);
        leftHand.position.set(-0.35, 0, 0.15);
        leftHand.castShadow = true;
        this.handsGroup.add(leftHand);

        // Right Hand
        const rightHand = new THREE.Mesh(handGeo, skinMat);
        rightHand.position.set(0.35, 0, 0.15);
        rightHand.castShadow = true;
        this.handsGroup.add(rightHand);

        // 8. Held Item Slot (Positioned proudly in hands / overhead)
        this.heldItemSlot = new THREE.Group();
        this.heldItemSlot.position.set(0, 0.35, 0.15);
        this.handsGroup.add(this.heldItemSlot);

        this.modelRoot.add(this.handsGroup);

        // 9. Chopping Knife (Hidden until chopping)
        this.knifeGroup = new THREE.Group();
        this.knifeGroup.position.set(0.38, 0.85, 0.45);
        this.knifeGroup.visible = false;

        // Blade
        const bladeGeo = new THREE.BoxGeometry(0.03, 0.22, 0.42);
        const blade = new THREE.Mesh(bladeGeo, knifeBladeMat);
        blade.position.set(0, 0, 0.15);
        this.knifeGroup.add(blade);

        // Handle
        const handleGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.2, 8);
        handleGeo.rotateX(Math.PI / 2);
        const handle = new THREE.Mesh(handleGeo, knifeHandleMat);
        handle.position.set(0, 0, -0.1);
        this.knifeGroup.add(handle);

        this.modelRoot.add(this.knifeGroup);
    }

    /**
     * Pick up or set held item
     * @param {Object|null} itemData 
     */
    setHeldItem(itemData) {
        this.heldItem = itemData;

        // Clear existing held mesh
        while (this.heldItemSlot.children.length > 0) {
            this.heldItemSlot.remove(this.heldItemSlot.children[0]);
        }

        if (!itemData) return;

        let mesh = null;
        if (itemData.type === 'plate') {
            mesh = FoodMeshes.createPlatedDish(itemData.ingredients || []);
        } else {
            mesh = FoodMeshes.createMeshById(itemData.id);
        }

        if (mesh) {
            mesh.scale.set(0.9, 0.9, 0.9);
            this.heldItemSlot.add(mesh);
        }
    }

    /**
     * Start/stop chopping animation
     * @param {boolean} chopping 
     */
    setChopping(chopping) {
        this.isChopping = !!chopping;
        this.knifeGroup.visible = this.isChopping;
    }

    /**
     * Trigger Dash burst
     */
    dash() {
        if (this.dashCooldown > 0) return false;
        this.isDashing = true;
        this.dashDuration = 0.22;
        this.dashCooldown = 0.85;
        return true;
    }

    /**
     * Update physics, movement, and animations
     * @param {number} dt Delta time in seconds
     * @param {Object} input { moveX, moveZ } normalized vector (-1 to 1)
     * @param {Array} obstacles List of bounding boxes for collision
     */
    update(dt, input = { moveX: 0, moveZ: 0 }, obstacles = []) {
        // Cooldowns
        if (this.dashCooldown > 0) {
            this.dashCooldown -= dt;
        }

        if (this.isDashing) {
            this.dashDuration -= dt;
            if (this.dashDuration <= 0) {
                this.isDashing = false;
            }
        }

        // 1. Movement Calculations
        const isMoving = (Math.abs(input.moveX) > 0.05 || Math.abs(input.moveZ) > 0.05) && !this.isChopping;
        const currentSpeed = this.moveSpeed * (this.isDashing ? this.dashSpeedMultiplier : 1.0);

        if (isMoving) {
            const targetAngle = Math.atan2(input.moveX, input.moveZ);
            this.targetRotation = targetAngle;

            // Smooth rotation interpolation
            let diff = this.targetRotation - this.currentRotation;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            this.currentRotation += diff * Math.min(1.0, dt * 18);
            this.group.rotation.y = this.currentRotation;

            // Target velocity
            const targetVx = input.moveX * currentSpeed;
            const targetVz = input.moveZ * currentSpeed;

            // Smooth acceleration
            this.velocity.x += (targetVx - this.velocity.x) * Math.min(1.0, dt * 20);
            this.velocity.y += (targetVz - this.velocity.y) * Math.min(1.0, dt * 20);
        } else {
            // Smooth braking
            this.velocity.x *= Math.max(0, 1.0 - dt * 25);
            this.velocity.y *= Math.max(0, 1.0 - dt * 25);
        }

        // 2. Position Integration & Collision Handling
        const nextX = this.position.x + this.velocity.x * dt;
        const nextZ = this.position.z + this.velocity.y * dt;

        // Kitchen Room Bounds
        const minX = -6.8, maxX = 6.8;
        const minZ = -4.5, maxZ = 4.2;

        let resolvedX = Math.max(minX, Math.min(maxX, nextX));
        let resolvedZ = Math.max(minZ, Math.min(maxZ, nextZ));

        // Check against station obstacle boxes
        for (const obs of obstacles) {
            // Circle-AABB collision check
            const closestX = Math.max(obs.minX, Math.min(resolvedX, obs.maxX));
            const closestZ = Math.max(obs.minZ, Math.min(resolvedZ, obs.maxZ));

            const distX = resolvedX - closestX;
            const distZ = resolvedZ - closestZ;
            const distSq = distX * distX + distZ * distZ;

            if (distSq < this.radius * this.radius) {
                const dist = Math.sqrt(distSq);
                if (dist > 0.0001) {
                    const overlap = this.radius - dist;
                    resolvedX += (distX / dist) * overlap;
                    resolvedZ += (distZ / dist) * overlap;
                } else {
                    resolvedZ += this.radius;
                }
            }
        }

        this.position.x = resolvedX;
        this.position.z = resolvedZ;
        this.group.position.set(this.position.x, 0, this.position.z);

        // 3. Dynamic Animations
        if (this.isChopping) {
            // Rapid chopping knife motion
            this.chopTimer += dt * 24;
            const chopAngle = Math.sin(this.chopTimer) * 0.45;
            this.knifeGroup.rotation.x = chopAngle - 0.2;
            this.modelRoot.position.y = Math.abs(Math.sin(this.chopTimer * 0.5)) * 0.06;
            this.modelRoot.rotation.z = Math.sin(this.chopTimer * 0.5) * 0.03;
        } else if (isMoving) {
            // Overcooked running wobble & hat bounce
            this.walkTimer += dt * (this.isDashing ? 24 : 14);
            this.modelRoot.rotation.z = Math.sin(this.walkTimer) * 0.12;
            this.modelRoot.position.y = Math.abs(Math.sin(this.walkTimer)) * 0.1;
            this.hatGroup.position.y = 1.62 + Math.abs(Math.sin(this.walkTimer)) * 0.08;
            this.handsGroup.position.y = 0.85 + Math.sin(this.walkTimer) * 0.05;
        } else {
            // Gentle idle breathing
            this.walkTimer += dt * 3;
            this.modelRoot.rotation.z = 0;
            this.modelRoot.position.y = Math.sin(this.walkTimer) * 0.02;
            this.hatGroup.position.y = 1.62;
            this.handsGroup.position.y = 0.85;
        }
    }
}
