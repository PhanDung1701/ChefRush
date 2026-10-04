/**
 * Station3D.js - Interactive 3D Kitchen Workstations
 * Defines Crates, Stoves, Fryers, Drink Machines, Cutting Boards, Plate Racks, Sinks, Counters, Delivery, and Trash.
 */
import { FoodMeshes } from './FoodMeshes.js';

export const STATION_TYPES = {
    CRATE_MEAT: 'CRATE_MEAT',
    CRATE_TOMATO: 'CRATE_TOMATO',
    CRATE_CUCUMBER: 'CRATE_CUCUMBER',
    CRATE_POTATO: 'CRATE_POTATO',
    STOVE: 'STOVE',
    FRYER: 'FRYER',
    DRINK_MACHINE: 'DRINK_MACHINE',
    CUTTING_BOARD: 'CUTTING_BOARD',
    PLATE_RACK: 'PLATE_RACK',
    SINK: 'SINK',
    COUNTER: 'COUNTER',
    DELIVERY: 'DELIVERY',
    TRASH: 'TRASH'
};

export class Station3D {
    constructor({ id, type, x, z, width = 1.4, depth = 1.4, rotationY = 0, label = '', cleanPlates = 4, dirtyPlates = 0 }) {
        this.id = id;
        this.type = type;
        this.position = new window.THREE.Vector3(x, 0, z);
        this.width = width;
        this.depth = depth;
        this.rotationY = rotationY;
        this.label = label;

        // Collision Obstacle Bounding Box
        this.obstacle = {
            minX: x - width / 2,
            maxX: x + width / 2,
            minZ: z - depth / 2,
            maxZ: z + depth / 2
        };

        // Station Content State
        this.item = null; // Stored food item or plate
        this.cookProgress = 0; // 0 to 1
        this.fryProgress = 0; // 0 to 1
        this.chopProgress = 0; // 0 to 1
        this.washProgress = 0; // 0 to 1
        this.isBurnt = false;
        this.burnProgress = 0; // 0 to 1
        this.cleanPlates = cleanPlates;
        this.dirtyPlates = dirtyPlates;
        this.isWashing = false;

        // 3D Objects References
        this.group = new window.THREE.Group();
        this.group.position.set(x, 0, z);
        this.group.rotation.y = rotationY;

        this.itemAnchor = null;
        this.progressBarGroup = null;
        this.progressFillMesh = null;
        this.highlightRing = null;
        this.plateStackGroup = null;
        this.dirtyPlateStackGroup = null;

        this.buildMesh();
    }

    /**
     * Build the physical 3D mesh based on station type
     */
    buildMesh() {
        const THREE = window.THREE;

        // Warm cozy restaurant kitchen materials matching reference style
        const woodCabinetMat = new THREE.MeshStandardMaterial({ color: 0x8d522c, roughness: 0.65 }); // Warm honey oak
        const woodTopMat = new THREE.MeshStandardMaterial({ color: 0xb56d3b, roughness: 0.45 });     // Polished mahogany top
        const steelTopMat = new THREE.MeshStandardMaterial({ color: 0xd0d7de, metalness: 0.75, roughness: 0.25 }); // Brushed stainless
        const handleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });

        // 1. Counter Body
        const tableHeight = 0.95;
        const cabinetGeo = new THREE.BoxGeometry(this.width - 0.08, tableHeight - 0.1, this.depth - 0.08);
        const cabinet = new THREE.Mesh(cabinetGeo, woodCabinetMat);
        cabinet.position.y = (tableHeight - 0.1) / 2;
        cabinet.castShadow = true;
        cabinet.receiveShadow = true;
        this.group.add(cabinet);

        // Cabinet Front Handles (like the cabinets in reference photo)
        const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8);
        handleGeo.rotateX(Math.PI / 2);
        const leftHandle = new THREE.Mesh(handleGeo, handleMat);
        leftHandle.position.set(-0.15, tableHeight * 0.55, (this.depth - 0.08) / 2 + 0.02);
        this.group.add(leftHandle);

        const rightHandle = new THREE.Mesh(handleGeo, handleMat);
        rightHandle.position.set(0.15, tableHeight * 0.55, (this.depth - 0.08) / 2 + 0.02);
        this.group.add(rightHandle);

        // Counter Top Slab
        const isSteel = (this.type === STATION_TYPES.STOVE ||
                         this.type === STATION_TYPES.FRYER ||
                         this.type === STATION_TYPES.SINK ||
                         this.type === STATION_TYPES.DELIVERY ||
                         this.type === STATION_TYPES.TRASH);

        const topGeo = new THREE.BoxGeometry(this.width, 0.1, this.depth);
        const counterTop = new THREE.Mesh(topGeo, isSteel ? steelTopMat : woodTopMat);
        counterTop.position.y = tableHeight - 0.05;
        counterTop.castShadow = true;
        counterTop.receiveShadow = true;
        this.group.add(counterTop);

        // 2. Item Anchor (where food sits on top)
        this.itemAnchor = new THREE.Group();
        this.itemAnchor.position.set(0, tableHeight, 0);
        this.group.add(this.itemAnchor);

        // 3. Station Specific 3D Props
        this.buildStationProps(tableHeight);

        // 4. Floating 3D Progress Bar (for Stoves, Fryers, Cutting Boards, Sink)
        this.buildProgressBar(tableHeight);

        // 5. Floor Highlight Ring (lights up when Chef is close)
        const ringGeo = new THREE.RingGeometry(0.75, 0.9, 24);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffea00,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0
        });
        this.highlightRing = new THREE.Mesh(ringGeo, ringMat);
        this.highlightRing.position.y = 0.03;
        this.group.add(this.highlightRing);
    }

    /**
     * Build station unique decorative details
     */
    buildStationProps(tableHeight) {
        const THREE = window.THREE;
        const crateWoodMat = new THREE.MeshStandardMaterial({ color: 0x7c4a24, roughness: 0.85 });

        switch (this.type) {
            case STATION_TYPES.CRATE_MEAT: {
                this.buildCrateMesh(crateWoodMat);
                for (let i = 0; i < 3; i++) {
                    const meat = FoodMeshes.createRawMeat();
                    meat.scale.set(0.7, 0.7, 0.7);
                    meat.position.set((i - 1) * 0.24, tableHeight + 0.08, 0);
                    this.group.add(meat);
                }
                break;
            }
            case STATION_TYPES.CRATE_TOMATO: {
                this.buildCrateMesh(crateWoodMat);
                const coords = [
                    [-0.2, -0.15], [0.2, -0.15],
                    [-0.2, 0.15], [0.2, 0.15], [0, 0]
                ];
                coords.forEach(([px, pz]) => {
                    const tomato = FoodMeshes.createRawTomato();
                    tomato.scale.set(0.65, 0.65, 0.65);
                    tomato.position.set(px, tableHeight, pz);
                    this.group.add(tomato);
                });
                break;
            }
            case STATION_TYPES.CRATE_CUCUMBER: {
                this.buildCrateMesh(crateWoodMat);
                for (let i = -1; i <= 1; i++) {
                    const cucumber = FoodMeshes.createRawCucumber();
                    cucumber.scale.set(0.75, 0.75, 0.75);
                    cucumber.position.set(i * 0.22, tableHeight + 0.05, 0);
                    cucumber.rotation.y = 0.2 * i;
                    this.group.add(cucumber);
                }
                break;
            }
            case STATION_TYPES.CRATE_POTATO: {
                this.buildCrateMesh(crateWoodMat);
                const potCoords = [
                    [-0.18, -0.12], [0.18, -0.12],
                    [-0.18, 0.14], [0.18, 0.14], [0, 0.02]
                ];
                potCoords.forEach(([px, pz]) => {
                    const potato = FoodMeshes.createRawPotato();
                    potato.scale.set(0.7, 0.7, 0.7);
                    potato.position.set(px, tableHeight, pz);
                    this.group.add(potato);
                });
                break;
            }
            case STATION_TYPES.STOVE: {
                const burnerMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.4 });
                const panMat = new THREE.MeshStandardMaterial({ color: 0x37474f, metalness: 0.7, roughness: 0.3 });
                const heatGlowMat = new THREE.MeshBasicMaterial({ color: 0xff3d00 });

                const coilGeo = new THREE.TorusGeometry(0.35, 0.04, 8, 24);
                coilGeo.rotateX(Math.PI / 2);
                const coil = new THREE.Mesh(coilGeo, burnerMat);
                coil.position.y = tableHeight + 0.02;
                this.group.add(coil);

                this.stoveGlow = new THREE.Mesh(coilGeo, heatGlowMat);
                this.stoveGlow.position.y = tableHeight + 0.025;
                this.stoveGlow.visible = false;
                this.group.add(this.stoveGlow);

                const panGeo = new THREE.CylinderGeometry(0.42, 0.38, 0.1, 24);
                const pan = new THREE.Mesh(panGeo, panMat);
                pan.position.y = tableHeight + 0.06;
                pan.castShadow = true;
                this.group.add(pan);

                const handleGeo = new THREE.BoxGeometry(0.08, 0.05, 0.45);
                const handle = new THREE.Mesh(handleGeo, burnerMat);
                handle.position.set(0, tableHeight + 0.08, 0.52);
                this.group.add(handle);
                break;
            }
            case STATION_TYPES.FRYER: {
                // Stainless Steel Deep Fryer Station
                const steelMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, metalness: 0.8, roughness: 0.2 });
                const oilMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, transparent: true, opacity: 0.85 });
                const wireBasketMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, wireframe: true });
                const handleMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.5 });

                // Fryer Rim & Sunken Tank
                const tankGeo = new THREE.BoxGeometry(0.8, 0.25, 0.8);
                const tank = new THREE.Mesh(tankGeo, steelMat);
                tank.position.set(0, tableHeight + 0.1, 0);
                this.group.add(tank);

                // Golden Bubbling Oil Plane
                const oilGeo = new THREE.PlaneGeometry(0.7, 0.7);
                oilGeo.rotateX(-Math.PI / 2);
                this.fryerOil = new THREE.Mesh(oilGeo, oilMat);
                this.fryerOil.position.set(0, tableHeight + 0.16, 0);
                this.group.add(this.fryerOil);

                // Wire Mesh Basket with Handle
                const basketGeo = new THREE.BoxGeometry(0.65, 0.2, 0.65);
                const basket = new THREE.Mesh(basketGeo, wireBasketMat);
                basket.position.set(0, tableHeight + 0.18, 0);
                this.group.add(basket);

                const fryHandleGeo = new THREE.BoxGeometry(0.08, 0.05, 0.5);
                const fryHandle = new THREE.Mesh(fryHandleGeo, handleMat);
                fryHandle.position.set(0, tableHeight + 0.22, 0.48);
                this.group.add(fryHandle);
                break;
            }
            case STATION_TYPES.DRINK_MACHINE: {
                // Coca-Cola Beverage Fountain Dispenser
                const redBodyMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.3 });
                const whiteRibbonMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
                const chromeMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9, roughness: 0.15 });
                const blackTrayMat = new THREE.MeshStandardMaterial({ color: 0x1e232f, roughness: 0.5 });

                // Machine Main Tower
                const towerGeo = new THREE.BoxGeometry(0.85, 0.95, 0.5);
                const tower = new THREE.Mesh(towerGeo, redBodyMat);
                tower.position.set(0, tableHeight + 0.48, -0.15);
                tower.castShadow = true;
                this.group.add(tower);

                // Iconic Coca White Wave on Tower
                const waveGeo = new THREE.BoxGeometry(0.86, 0.18, 0.51);
                const wave = new THREE.Mesh(waveGeo, whiteRibbonMat);
                wave.position.set(0, tableHeight + 0.65, -0.15);
                this.group.add(wave);

                // Drip Tray Grate
                const trayGeo = new THREE.BoxGeometry(0.75, 0.06, 0.4);
                const tray = new THREE.Mesh(trayGeo, blackTrayMat);
                tray.position.set(0, tableHeight + 0.03, 0.15);
                this.group.add(tray);

                // Chrome Dispenser Taps / Nozzles
                for (let i = -1; i <= 1; i += 2) {
                    const tapGeo = new THREE.CylinderGeometry(0.035, 0.025, 0.18, 12);
                    const tap = new THREE.Mesh(tapGeo, chromeMat);
                    tap.position.set(i * 0.18, tableHeight + 0.42, 0.06);
                    this.group.add(tap);

                    const leverGeo = new THREE.BoxGeometry(0.04, 0.12, 0.02);
                    const lever = new THREE.Mesh(leverGeo, chromeMat);
                    lever.position.set(i * 0.18, tableHeight + 0.36, 0.02);
                    this.group.add(lever);
                }

                // Sample pre-dispensed cup on tray for visual cue
                const sampleCup = FoodMeshes.createCocaDrink();
                sampleCup.scale.set(0.65, 0.65, 0.65);
                sampleCup.position.set(0, tableHeight + 0.06, 0.14);
                this.group.add(sampleCup);
                break;
            }
            case STATION_TYPES.CUTTING_BOARD: {
                const boardMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.6 });
                const boardGeo = new THREE.BoxGeometry(0.9, 0.08, 0.75);
                const board = new THREE.Mesh(boardGeo, boardMat);
                board.position.y = tableHeight + 0.04;
                board.castShadow = true;
                this.group.add(board);

                const knifeMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.8, roughness: 0.2 });
                const knifeGeo = new THREE.BoxGeometry(0.04, 0.08, 0.55);
                const knife = new THREE.Mesh(knifeGeo, knifeMat);
                knife.position.set(0.35, tableHeight + 0.08, 0);
                knife.rotation.y = 0.1;
                this.group.add(knife);
                break;
            }
            case STATION_TYPES.PLATE_RACK: {
                this.plateStackGroup = new THREE.Group();
                this.plateStackGroup.position.set(0, tableHeight, 0);
                this.group.add(this.plateStackGroup);
                this.updatePlateStackVisual();
                break;
            }
            case STATION_TYPES.SINK: {
                // Dishwashing Sink Basin & Faucet
                const basinMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.8, roughness: 0.3 });
                const faucetMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9, roughness: 0.2 });
                const waterMat = new THREE.MeshStandardMaterial({ color: 0x29b6f6, roughness: 0.1, transparent: true, opacity: 0.8 });

                // Basin Inner Depression Rim
                const rimGeo = new THREE.BoxGeometry(0.85, 0.15, 0.85);
                const basinRim = new THREE.Mesh(rimGeo, basinMat);
                basinRim.position.set(0, tableHeight + 0.05, 0.05);
                this.group.add(basinRim);

                // Water inside basin
                const waterGeo = new THREE.PlaneGeometry(0.72, 0.72);
                waterGeo.rotateX(-Math.PI / 2);
                const water = new THREE.Mesh(waterGeo, waterMat);
                water.position.set(0, tableHeight + 0.08, 0.05);
                this.group.add(water);

                // Chrome Gooseneck Faucet
                const faucetBaseGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.3, 12);
                const faucetBase = new THREE.Mesh(faucetBaseGeo, faucetMat);
                faucetBase.position.set(0, tableHeight + 0.25, -0.28);
                this.group.add(faucetBase);

                const neckGeo = new THREE.TorusGeometry(0.14, 0.03, 8, 16, Math.PI);
                const faucetNeck = new THREE.Mesh(neckGeo, faucetMat);
                faucetNeck.position.set(0, tableHeight + 0.4, -0.15);
                faucetNeck.rotation.y = Math.PI / 2;
                this.group.add(faucetNeck);

                // Dirty plates pile beside basin
                this.dirtyPlateStackGroup = new THREE.Group();
                this.dirtyPlateStackGroup.position.set(-0.35, tableHeight, -0.2);
                this.group.add(this.dirtyPlateStackGroup);
                this.updateDirtyPlateStackVisual();
                break;
            }
            case STATION_TYPES.DELIVERY: {
                const beltMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.4 });
                const beltGeo = new THREE.BoxGeometry(this.width - 0.2, 0.03, this.depth - 0.2);
                const belt = new THREE.Mesh(beltGeo, beltMat);
                belt.position.y = tableHeight + 0.02;
                this.group.add(belt);

                // Directional service arrow on conveyor
                const arrowGeo = new THREE.ConeGeometry(0.2, 0.35, 3);
                arrowGeo.rotateX(Math.PI / 2);
                const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
                const arrow = new THREE.Mesh(arrowGeo, arrowMat);
                arrow.position.set(0, tableHeight + 0.04, 0);
                this.group.add(arrow);

                // Service bell
                const bellMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.8, roughness: 0.2 });
                const bellGeo = new THREE.SphereGeometry(0.12, 12, 8);
                const bell = new THREE.Mesh(bellGeo, bellMat);
                bell.position.set(this.width * 0.35, tableHeight + 0.12, 0);
                this.group.add(bell);
                break;
            }
            case STATION_TYPES.TRASH: {
                const binMat = new THREE.MeshStandardMaterial({ color: 0x78909c, metalness: 0.5, roughness: 0.4 });
                const binGeo = new THREE.CylinderGeometry(0.48, 0.42, 0.9, 18);
                const bin = new THREE.Mesh(binGeo, binMat);
                bin.position.y = tableHeight / 2;
                bin.castShadow = true;
                this.group.add(bin);

                const lidMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.5 });
                const lidGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.08, 18);
                const lid = new THREE.Mesh(lidGeo, lidMat);
                lid.position.y = tableHeight + 0.04;
                this.group.add(lid);
                break;
            }
        }
    }

    /**
     * Visual update for clean plates stack
     */
    updatePlateStackVisual() {
        if (!this.plateStackGroup) return;
        while (this.plateStackGroup.children.length > 0) {
            this.plateStackGroup.remove(this.plateStackGroup.children[0]);
        }
        const count = Math.max(0, Math.min(6, this.cleanPlates));
        for (let i = 0; i < count; i++) {
            const plate = FoodMeshes.createPlate();
            plate.position.set(0, i * 0.08, 0);
            this.plateStackGroup.add(plate);
        }
    }

    /**
     * Visual update for dirty plates stack at sink
     */
    updateDirtyPlateStackVisual() {
        if (!this.dirtyPlateStackGroup) return;
        while (this.dirtyPlateStackGroup.children.length > 0) {
            this.dirtyPlateStackGroup.remove(this.dirtyPlateStackGroup.children[0]);
        }
        const count = Math.max(0, Math.min(5, this.dirtyPlates));
        for (let i = 0; i < count; i++) {
            const p = FoodMeshes.createDirtyPlate();
            p.scale.set(0.65, 0.65, 0.65);
            p.position.set(0, i * 0.06, 0);
            this.dirtyPlateStackGroup.add(p);
        }
    }

    /**
     * Helper to create wooden crate edges
     */
    buildCrateMesh(mat) {
        const THREE = window.THREE;
        const w = this.width - 0.2;
        const d = this.depth - 0.2;
        const h = 0.35;
        const y = 0.95 + h / 2;

        const slatThickness = 0.06;
        const s1 = new THREE.Mesh(new THREE.BoxGeometry(w, h, slatThickness), mat);
        s1.position.set(0, y, d / 2);
        this.group.add(s1);

        const s2 = new THREE.Mesh(new THREE.BoxGeometry(w, h, slatThickness), mat);
        s2.position.set(0, y, -d / 2);
        this.group.add(s2);

        const s3 = new THREE.Mesh(new THREE.BoxGeometry(slatThickness, h, d), mat);
        s3.position.set(w / 2, y, 0);
        this.group.add(s3);

        const s4 = new THREE.Mesh(new THREE.BoxGeometry(slatThickness, h, d), mat);
        s4.position.set(-w / 2, y, 0);
        this.group.add(s4);
    }

    /**
     * Build floating 3D Progress Bar (Billboard above station)
     */
    buildProgressBar(tableHeight) {
        const THREE = window.THREE;
        this.progressBarGroup = new THREE.Group();
        this.progressBarGroup.position.set(0, tableHeight + 0.95, 0);
        this.progressBarGroup.visible = false;

        const bgGeo = new THREE.BoxGeometry(0.9, 0.16, 0.04);
        const bgMat = new THREE.MeshBasicMaterial({ color: 0x1e232f });
        const bg = new THREE.Mesh(bgGeo, bgMat);
        this.progressBarGroup.add(bg);

        const fillGeo = new THREE.BoxGeometry(0.84, 0.11, 0.05);
        this.progressFillMat = new THREE.MeshBasicMaterial({ color: 0x00e676 });
        this.progressFillMesh = new THREE.Mesh(fillGeo, this.progressFillMat);
        this.progressFillMesh.position.z = 0.01;
        this.progressBarGroup.add(this.progressFillMesh);

        this.group.add(this.progressBarGroup);
    }

    /**
     * Set station item content and sync 3D model
     * @param {Object|null} itemData 
     */
    setItem(itemData) {
        this.item = itemData;

        while (this.itemAnchor.children.length > 0) {
            this.itemAnchor.remove(this.itemAnchor.children[0]);
        }

        if (!itemData) {
            this.cookProgress = 0;
            this.fryProgress = 0;
            this.chopProgress = 0;
            this.burnProgress = 0;
            this.isBurnt = false;
            this.progressBarGroup.visible = false;
            if (this.stoveGlow) this.stoveGlow.visible = false;
            return;
        }

        let mesh = null;
        if (itemData.type === 'plate') {
            mesh = FoodMeshes.createPlatedDish(itemData.ingredients || []);
        } else {
            mesh = FoodMeshes.createMeshById(itemData.id);
        }

        if (mesh) {
            this.itemAnchor.add(mesh);
        }
    }

    /**
     * Highlight station when Chef approaches
     * @param {boolean} active 
     */
    setHighlight(active) {
        if (this.highlightRing) {
            this.highlightRing.material.opacity = active ? 0.85 : 0;
        }
    }

    /**
     * Update station timers (cooking on stove, fryer, dishwashing progress)
     * @param {number} dt 
     * @param {Object} audioManager
     * @param {Object} vfxManager
     */
    update(dt, audioManager, vfxManager) {
        if (this.progressBarGroup && this.progressBarGroup.visible) {
            this.progressBarGroup.rotation.x = -Math.PI / 6;
        }

        // 1. STOVE COOKING
        if (this.type === STATION_TYPES.STOVE && this.item) {
            if (this.item.id === 'raw_meat') {
                this.stoveGlow.visible = true;
                this.progressBarGroup.visible = true;
                this.cookProgress += dt / 4.2;

                this.progressFillMat.color.setHex(0xff9100);
                const ratio = Math.min(1.0, this.cookProgress);
                this.progressFillMesh.scale.set(ratio, 1, 1);
                this.progressFillMesh.position.x = (ratio - 1) * 0.42;

                if (this.cookProgress >= 1.0) {
                    this.item.id = 'grilled_meat';
                    this.setItem(this.item);
                    this.cookProgress = 1.0;
                    this.progressFillMat.color.setHex(0x00e676);
                    if (audioManager) audioManager.playPlateSnap();
                }
            } else if (this.item.id === 'grilled_meat') {
                this.stoveGlow.visible = true;
                this.burnProgress += dt / 14.0;

                if (this.burnProgress > 0.6) {
                    this.progressBarGroup.visible = true;
                    this.progressFillMat.color.setHex(Math.sin(performance.now() * 0.02) > 0 ? 0xff1744 : 0x212121);
                }

                if (this.burnProgress >= 1.0) {
                    this.isBurnt = true;
                    this.item.id = 'burnt_meat';
                    this.setItem(this.item);
                    this.progressBarGroup.visible = false;
                    this.stoveGlow.visible = false;
                    if (audioManager) audioManager.playBurnt();
                }
            }
        }

        // 2. FRYER COOKING (Deep Frying Potato Strips -> French Fries)
        if (this.type === STATION_TYPES.FRYER && this.item) {
            if (this.item.id === 'sliced_potato') {
                this.progressBarGroup.visible = true;
                this.fryProgress += dt / 3.6; // 3.6s to fry golden

                this.progressFillMat.color.setHex(0xf59e0b); // Golden amber
                const ratio = Math.min(1.0, this.fryProgress);
                this.progressFillMesh.scale.set(ratio, 1, 1);
                this.progressFillMesh.position.x = (ratio - 1) * 0.42;

                if (this.fryProgress >= 1.0) {
                    this.item.id = 'french_fries';
                    this.setItem(this.item);
                    this.fryProgress = 1.0;
                    this.progressFillMat.color.setHex(0x00e676);
                    if (audioManager) audioManager.playPlateSnap();
                }
            } else if (this.item.id === 'french_fries') {
                this.burnProgress += dt / 14.0;
                if (this.burnProgress > 0.6) {
                    this.progressBarGroup.visible = true;
                    this.progressFillMat.color.setHex(Math.sin(performance.now() * 0.02) > 0 ? 0xff1744 : 0x212121);
                }
                if (this.burnProgress >= 1.0) {
                    this.isBurnt = true;
                    this.item.id = 'burnt_meat';
                    this.setItem(this.item);
                    this.progressBarGroup.visible = false;
                    if (audioManager) audioManager.playBurnt();
                }
            }
        }
    }
}
