/**
 * Kitchen3DScene.js - Master 3D Overcooked Engine & Interaction Orchestrator
 * Integrates Three.js rendering, 3D Kitchen environment, 3D Chef, Stations, Food, Audio, and Particle VFX.
 */
import { Chef3D } from './Chef3D.js';
import { Station3D, STATION_TYPES } from './Station3D.js';
import { FoodMeshes } from './FoodMeshes.js';
import { findMatchingRecipe } from '../data/RecipesData.js';

export class Kitchen3DScene {
    constructor({ container, audioManager, vfxManager, eventBus, onOrderDelivered }) {
        this.domContainer = container;
        this.audio = audioManager;
        this.vfx = vfxManager;
        this.eventBus = eventBus;
        this.onOrderDelivered = onOrderDelivered || (() => false);

        // Three.js Core
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Entities
        this.chef = null;
        this.stations = [];
        this.closestStation = null;

        // Particle System
        this.particles = [];

        // Interaction Prompt Callback
        this.onPromptUpdate = null;

        this.init();
    }

    /**
     * Initialize Three.js scene, camera, lights, and kitchen
     */
    init() {
        const THREE = window.THREE;
        if (!THREE) {
            console.error('[Kitchen3DScene] Three.js is not loaded!');
            return;
        }

        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a2332); // Cozy dark slate aesthetic

        // 2. Camera (Top-down tilted Isometric perspective)
        const width = this.domContainer.clientWidth || window.innerWidth;
        const height = this.domContainer.clientHeight || window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        this.camera.position.set(0, 19.8, 14.2);
        this.camera.lookAt(0, 0, 0.5);

        // 3. Renderer with high performance and cinematic tone mapping
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        if (THREE.ACESFilmicToneMapping) {
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.0;
        }

        // Clear existing canvas
        this.domContainer.innerHTML = '';
        this.domContainer.appendChild(this.renderer.domElement);

        // 4. Lighting Setup
        this.setupLights();

        // 5. Kitchen Environment Geometry
        this.setupKitchenEnvironment();

        // 6. Spawn Stations
        this.setupStations();

        // 7. Spawn 3D Chef
        this.chef = new Chef3D();
        this.chef.position.set(0, 0, 0.6);
        this.scene.add(this.chef.group);

        // Resize Listener
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Lighting: Ambient + Warm Directional Sun + Soft Fill
     */
    setupLights() {
        const THREE = window.THREE;

        // Warm ambient light (gentle, not washed out)
        const ambientLight = new THREE.AmbientLight(0xfff6ed, 0.65);
        this.scene.add(ambientLight);

        // Directional Sunlight with soft shadows
        const sunLight = new THREE.DirectionalLight(0xfff8f0, 0.75);
        sunLight.position.set(10, 22, 14);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.camera.near = 5;
        sunLight.shadow.camera.far = 45;
        sunLight.shadow.camera.left = -12;
        sunLight.shadow.camera.right = 12;
        sunLight.shadow.camera.top = 10;
        sunLight.shadow.camera.bottom = -10;
        sunLight.shadow.bias = -0.001;
        this.scene.add(sunLight);

        // Soft back-fill light for rich Overcooked tones
        const fillLight = new THREE.DirectionalLight(0x78909c, 0.3);
        fillLight.position.set(-12, 16, -12);
        this.scene.add(fillLight);
    }

    /**
     * Kitchen Room Floor, Soft Matte Tiles, Back Wall, and Perimeter
     */
    setupKitchenEnvironment() {
        const THREE = window.THREE;

        // 1. Kitchen Floor (Warm matte ceramic checkerboard tiles, not glaring white!)
        const floorGeo = new THREE.PlaneGeometry(16.5, 11.5);
        floorGeo.rotateX(-Math.PI / 2);

        // Procedural Ceramic Tile Canvas Texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const tileSize = 64;
        for (let x = 0; x < 512; x += tileSize) {
            for (let y = 0; y < 512; y += tileSize) {
                const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
                // Soft cream & warm sage-grey tiles
                ctx.fillStyle = isEven ? '#d9dfd7' : '#ced5cc';
                ctx.fillRect(x, y, tileSize, tileSize);
                // Subtle grout line
                ctx.strokeStyle = '#a4aca1';
                ctx.lineWidth = 2.5;
                ctx.strokeRect(x, y, tileSize, tileSize);
            }
        }
        const floorTexture = new THREE.CanvasTexture(canvas);
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(4, 3);

        const floorMat = new THREE.MeshStandardMaterial({
            map: floorTexture,
            roughness: 0.75, // Matte, soft non-glare surface
            metalness: 0.02
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.receiveShadow = true;
        this.scene.add(floor);

        // 2. Kitchen Perimeter Wooden Border Rails
        const borderMat = new THREE.MeshStandardMaterial({ color: 0x5d3a1a, roughness: 0.65 });
        const borderNorthGeo = new THREE.BoxGeometry(16.8, 0.35, 0.4);
        const borderNorth = new THREE.Mesh(borderNorthGeo, borderMat);
        borderNorth.position.set(0, 0.17, -5.8);
        this.scene.add(borderNorth);

        const borderSouth = new THREE.Mesh(borderNorthGeo, borderMat);
        borderSouth.position.set(0, 0.17, 5.8);
        this.scene.add(borderSouth);

        const borderSideGeo = new THREE.BoxGeometry(0.4, 0.35, 12.0);
        const borderWest = new THREE.Mesh(borderSideGeo, borderMat);
        borderWest.position.set(-8.3, 0.17, 0);
        this.scene.add(borderWest);

        const borderEast = new THREE.Mesh(borderSideGeo, borderMat);
        borderEast.position.set(8.3, 0.17, 0);
        this.scene.add(borderEast);

        // 3. Back Wall (Slate blue restaurant wall)
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x243242, roughness: 0.85 });
        const wallGeo = new THREE.BoxGeometry(16.8, 5, 0.4);
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(0, 2.5, -5.9);
        wall.receiveShadow = true;
        this.scene.add(wall);

        // Kitchen splashback wall trim
        const splashMat = new THREE.MeshStandardMaterial({ color: 0x3b4c60, roughness: 0.4 });
        const splashGeo = new THREE.BoxGeometry(16.4, 1.8, 0.05);
        const splash = new THREE.Mesh(splashGeo, splashMat);
        splash.position.set(0, 1.9, -5.68);
        this.scene.add(splash);

        // Metal pan rail on back wall
        const railMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.8, roughness: 0.2 });
        const railGeo = new THREE.CylinderGeometry(0.04, 0.04, 9, 12);
        railGeo.rotateZ(Math.PI / 2);
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.position.set(0, 2.6, -5.65);
        this.scene.add(rail);

        // Hanging frying pans
        for (let i = -3; i <= 3; i += 2) {
            const panGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 16);
            const pan = new THREE.Mesh(panGeo, railMat);
            pan.rotation.x = Math.PI / 2;
            pan.position.set(i * 1.5, 2.3, -5.62);
            this.scene.add(pan);
        }
    }

    /**
     * Spawn all 3D Kitchen Stations
     * North: Potato Crate, Board 1, Stove 1, Fryer, Meat Crate
     * East: Delivery Window, Clean Plate Rack, Sink (Dishwashing)
     * South: Cucumber Crate, Tomato Crate, Board 2, Assembly Counter
     * West: Drink Machine (Coca), Counter, Trash
     */
    setupStations() {
        this.stations = [
            // NORTH WALL
            new Station3D({
                id: 'crate_potato',
                type: STATION_TYPES.CRATE_POTATO,
                x: -5.2,
                z: -4.3,
                width: 1.4,
                depth: 1.4,
                label: 'THÙNG KHOAI TÂY'
            }),
            new Station3D({
                id: 'cutting_board_1',
                type: STATION_TYPES.CUTTING_BOARD,
                x: -2.6,
                z: -4.3,
                width: 1.4,
                depth: 1.4,
                label: 'THỚT THÁI 1'
            }),
            new Station3D({
                id: 'stove_1',
                type: STATION_TYPES.STOVE,
                x: 0,
                z: -4.3,
                width: 1.4,
                depth: 1.4,
                label: 'BẾP NƯỚNG'
            }),
            new Station3D({
                id: 'fryer',
                type: STATION_TYPES.FRYER,
                x: 2.6,
                z: -4.3,
                width: 1.4,
                depth: 1.4,
                label: 'BẾP CHIÊN KHOAI'
            }),
            new Station3D({
                id: 'crate_meat',
                type: STATION_TYPES.CRATE_MEAT,
                x: 5.2,
                z: -4.3,
                width: 1.4,
                depth: 1.4,
                label: 'THÙNG THỊT BÒ'
            }),

            // EAST WALL
            new Station3D({
                id: 'delivery',
                type: STATION_TYPES.DELIVERY,
                x: 6.6,
                z: -2.3,
                width: 1.5,
                depth: 1.8,
                rotationY: -Math.PI / 2,
                label: 'BĂNG CHUYỀN GIAO MÓN'
            }),
            new Station3D({
                id: 'plate_rack',
                type: STATION_TYPES.PLATE_RACK,
                x: 6.6,
                z: 0.1,
                width: 1.5,
                depth: 1.5,
                cleanPlates: 4,
                label: 'KỆ ĐĨA SẠCH'
            }),
            new Station3D({
                id: 'sink',
                type: STATION_TYPES.SINK,
                x: 6.6,
                z: 2.5,
                width: 1.5,
                depth: 1.6,
                dirtyPlates: 0,
                label: 'BỒN RỬA BÁT'
            }),

            // SOUTH WALL
            new Station3D({
                id: 'crate_cucumber',
                type: STATION_TYPES.CRATE_CUCUMBER,
                x: 4.2,
                z: 4.3,
                width: 1.4,
                depth: 1.4,
                label: 'THÙNG DƯA LEO'
            }),
            new Station3D({
                id: 'crate_tomato',
                type: STATION_TYPES.CRATE_TOMATO,
                x: 1.7,
                z: 4.3,
                width: 1.4,
                depth: 1.4,
                label: 'THÙNG CÀ CHUA'
            }),
            new Station3D({
                id: 'cutting_board_2',
                type: STATION_TYPES.CUTTING_BOARD,
                x: -0.8,
                z: 4.3,
                width: 1.4,
                depth: 1.4,
                label: 'THỚT THÁI 2'
            }),
            new Station3D({
                id: 'counter_south',
                type: STATION_TYPES.COUNTER,
                x: -3.3,
                z: 4.3,
                width: 1.5,
                depth: 1.4,
                label: 'BÀN GHÉP MÓN'
            }),

            // WEST WALL
            new Station3D({
                id: 'drink_machine',
                type: STATION_TYPES.DRINK_MACHINE,
                x: -6.6,
                z: -2.1,
                width: 1.5,
                depth: 1.6,
                rotationY: Math.PI / 2,
                label: 'MÁY RÓT COCA'
            }),
            new Station3D({
                id: 'counter_west',
                type: STATION_TYPES.COUNTER,
                x: -6.6,
                z: 0.3,
                width: 1.5,
                depth: 1.5,
                label: 'BÀN ĐẶT ĐỒ'
            }),
            new Station3D({
                id: 'trash',
                type: STATION_TYPES.TRASH,
                x: -6.6,
                z: 2.7,
                width: 1.5,
                depth: 1.5,
                label: 'THÙNG RÁC'
            })
        ];

        this.stations.forEach(station => {
            this.scene.add(station.group);
        });
    }

    /**
     * Get all station obstacle collision boxes
     */
    getObstacles() {
        return this.stations.map(s => s.obstacle);
    }

    /**
     * Find the closest station in front of or near Chef
     */
    updateClosestStation() {
        let nearest = null;
        let minDistSq = 2.4 * 2.4; // Max interaction distance

        for (const station of this.stations) {
            const dx = this.chef.position.x - station.position.x;
            const dz = this.chef.position.z - station.position.z;
            const distSq = dx * dx + dz * dz;

            if (distSq < minDistSq) {
                minDistSq = distSq;
                nearest = station;
            }
        }

        // Update highlight rings
        if (nearest !== this.closestStation) {
            if (this.closestStation) this.closestStation.setHighlight(false);
            if (nearest) nearest.setHighlight(true);
            this.closestStation = nearest;
        }

        // Update contextual UI prompt hint
        this.updateContextualPrompt(nearest);
    }

    /**
     * Update contextual action prompt text for UI with exact PC keybinds: [E], [Space], [Shift]
     */
    updateContextualPrompt(station) {
        if (!this.onPromptUpdate) return;

        const held = this.chef.heldItem;

        if (!station) {
            if (held) {
                this.onPromptUpdate({ text: '👇 NÉM XUỐNG SÀN [E]', station: 'Sàn Nhà' });
            } else {
                this.onPromptUpdate(null);
            }
            return;
        }

        switch (station.type) {
            case STATION_TYPES.CRATE_MEAT:
                this.onPromptUpdate({ text: '✋ CẦM THỊT BÒ [E]', station: station.label });
                break;
            case STATION_TYPES.CRATE_TOMATO:
                this.onPromptUpdate({ text: '🍅 CẦM CÀ CHUA [E]', station: station.label });
                break;
            case STATION_TYPES.CRATE_CUCUMBER:
                this.onPromptUpdate({ text: '🥒 CẦM DƯA LEO [E]', station: station.label });
                break;
            case STATION_TYPES.CRATE_POTATO:
                this.onPromptUpdate({ text: '🥔 CẦM KHOAI TÂY [E]', station: station.label });
                break;
            case STATION_TYPES.DRINK_MACHINE:
                this.onPromptUpdate({ text: '🥤 RÓT COCA TƯƠI [E]', station: station.label });
                break;
            case STATION_TYPES.PLATE_RACK:
                if (station.cleanPlates > 0) {
                    this.onPromptUpdate({ text: `🍽️ LẤY ĐĨA SẠCH [E] (${station.cleanPlates})`, station: station.label });
                } else {
                    this.onPromptUpdate({ text: '⚠️ HẾT ĐĨA SẠCH! HÃY RỬA ĐĨA BẨN Ở BỒN RỬA', station: station.label });
                }
                break;
            case STATION_TYPES.STOVE:
                if (!station.item && held && held.id === 'raw_meat') {
                    this.onPromptUpdate({ text: '🔥 ĐẶT THỊT NƯỚNG [E]', station: station.label });
                } else if (station.item && station.item.id === 'grilled_meat') {
                    this.onPromptUpdate({ text: '🥩 GẮP THỊT CHÍN [E]', station: station.label });
                } else if (station.item && station.item.id === 'burnt_meat') {
                    this.onPromptUpdate({ text: '⚠️ GẮP THỊT CHÁY VỨT [E]', station: station.label });
                } else if (station.item) {
                    this.onPromptUpdate({ text: '⏳ Đang nướng xèo xèo...', station: station.label });
                } else {
                    this.onPromptUpdate({ text: '🔥 Bếp Nướng Trống', station: station.label });
                }
                break;
            case STATION_TYPES.FRYER:
                if (!station.item && held && held.id === 'sliced_potato') {
                    this.onPromptUpdate({ text: '🍟 THẢ KHOAI VÀO CHIÊN [E]', station: station.label });
                } else if (!station.item && held && held.id === 'raw_potato') {
                    this.onPromptUpdate({ text: '⚠️ Cần thái khoai trên thớt trước!', station: station.label });
                } else if (station.item && station.item.id === 'french_fries') {
                    this.onPromptUpdate({ text: '✨ GẮP KHOAI CHIÊN GIÒN [E]', station: station.label });
                } else if (station.item && station.item.id === 'burnt_meat') {
                    this.onPromptUpdate({ text: '⚠️ GẮP KHOAI CHÁY VỨT [E]', station: station.label });
                } else if (station.item) {
                    this.onPromptUpdate({ text: '🫧 Dầu đang sôi xèo xèo...', station: station.label });
                } else {
                    this.onPromptUpdate({ text: '🍟 Bếp Chiên Trống', station: station.label });
                }
                break;
            case STATION_TYPES.CUTTING_BOARD:
                if (!station.item && held && (held.id === 'raw_tomato' || held.id === 'raw_cucumber' || held.id === 'raw_potato')) {
                    this.onPromptUpdate({ text: '🔪 ĐẶT LÊN THỚT [E]', station: station.label });
                } else if (station.item && (station.item.id === 'raw_tomato' || station.item.id === 'raw_cucumber' || station.item.id === 'raw_potato')) {
                    this.onPromptUpdate({ text: '🔪 GIỮ THÁI [Phím Space]', station: station.label });
                } else if (station.item && (station.item.id === 'sliced_tomato' || station.item.id === 'sliced_cucumber' || station.item.id === 'sliced_potato')) {
                    this.onPromptUpdate({ text: '✨ CẦM LÁT ĐÃ THÁI [E]', station: station.label });
                } else {
                    this.onPromptUpdate({ text: '🔪 Thớt Thái Trống', station: station.label });
                }
                break;
            case STATION_TYPES.SINK:
                if (held && held.id === 'dirty_plate') {
                    this.onPromptUpdate({ text: '🍽️ BỎ ĐĨA BẨN VÀO BỒN [E]', station: station.label });
                } else if (station.dirtyPlates > 0) {
                    this.onPromptUpdate({ text: `🧼 GIỮ RỬA ĐĨA [Phím Space] (Còn: ${station.dirtyPlates} đĩa)`, station: station.label });
                } else {
                    this.onPromptUpdate({ text: '✨ Bồn Rửa Sạch Sẽ', station: station.label });
                }
                break;
            case STATION_TYPES.COUNTER:
                if (held && !station.item) {
                    this.onPromptUpdate({ text: '🍽️ ĐẶT XUỐNG BÀN [E]', station: station.label });
                } else if (!held && station.item) {
                    this.onPromptUpdate({ text: '✋ CẦM LÊN [E]', station: station.label });
                } else if (held && station.item) {
                    this.onPromptUpdate({ text: '✨ GHÉP MÓN [E]', station: station.label });
                } else {
                    this.onPromptUpdate({ text: 'Bàn Trống', station: station.label });
                }
                break;
            case STATION_TYPES.DELIVERY:
                if (held && (held.type === 'plate' || held.id === 'coca_drink' || held.id === 'french_fries')) {
                    this.onPromptUpdate({ text: '🛎️ GIAO MÓN CHO KHÁCH [E]', station: station.label });
                } else {
                    this.onPromptUpdate({ text: 'Băng Chuyền Giao Món', station: station.label });
                }
                break;
            case STATION_TYPES.TRASH:
                if (held) {
                    this.onPromptUpdate({ text: '🗑️ VỨT RÁC [E]', station: station.label });
                } else {
                    this.onPromptUpdate({ text: 'Thùng Rác', station: station.label });
                }
                break;
            default:
                this.onPromptUpdate(null);
        }
    }

    /**
     * Primary Interaction Event: CẦM / ĐẶT / RÓT (Key E or On-screen Button)
     */
    handleInteract() {
        let station = this.closestStation;
        const held = this.chef.heldItem;

        // If no station nearby, try to interact with floor
        if (!station) {
            if (held) {
                this.dropItemOnFloor(held);
                this.chef.setHeldItem(null);
                this.audio.playPlateSnap();
            }
            return;
        }

        // 1. INGREDIENT CRATES
        if (station.type === STATION_TYPES.CRATE_MEAT) {
            if (!held) {
                this.chef.setHeldItem({ type: 'ingredient', id: 'raw_meat' });
                this.audio.playPlateSnap();
            }
            return;
        }

        if (station.type === STATION_TYPES.CRATE_TOMATO) {
            if (!held) {
                this.chef.setHeldItem({ type: 'ingredient', id: 'raw_tomato' });
                this.audio.playPlateSnap();
            }
            return;
        }

        if (station.type === STATION_TYPES.CRATE_CUCUMBER) {
            if (!held) {
                this.chef.setHeldItem({ type: 'ingredient', id: 'raw_cucumber' });
                this.audio.playPlateSnap();
            }
            return;
        }

        if (station.type === STATION_TYPES.CRATE_POTATO) {
            if (!held) {
                this.chef.setHeldItem({ type: 'ingredient', id: 'raw_potato' });
                this.audio.playPlateSnap();
            }
            return;
        }

        // 2. DRINK MACHINE (Coca fountain: Chỉ cần ấn E là sẽ có nước!)
        if (station.type === STATION_TYPES.DRINK_MACHINE) {
            if (!held) {
                this.chef.setHeldItem({ type: 'drink', id: 'coca_drink' });
                this.audio.playPlateSnap();
                this.spawnDrinkFizz(station.position);
            } else if (held.type === 'plate') {
                if (!held.ingredients.includes('coca_drink')) {
                    held.ingredients.push('coca_drink');
                    this.chef.setHeldItem(held);
                    this.audio.playPlateSnap();
                    this.spawnDrinkFizz(station.position);
                }
            }
            return;
        }

        // 3. PLATE RACK (Clean Plates)
        if (station.type === STATION_TYPES.PLATE_RACK) {
            if (!held) {
                if (station.cleanPlates > 0) {
                    station.cleanPlates--;
                    station.updatePlateStackVisual();
                    this.chef.setHeldItem({ type: 'plate', id: 'plate', ingredients: [] });
                    this.audio.playPlateSnap();
                } else {
                    if (this.audio) this.audio.playBurnt();
                    const rect = this.domContainer.getBoundingClientRect();
                    this.vfx.floatingText('⚠️ HẾT ĐĨA SẠCH! HÃY RỬA ĐĨA BẨN', rect.width / 2, 130, '#ef4444');
                }
            }
            return;
        }

        // 4. STOVE (Grill raw meat, retrieve cooked steak)
        if (station.type === STATION_TYPES.STOVE) {
            if (!station.item && held && held.id === 'raw_meat') {
                station.setItem({ type: 'ingredient', id: 'raw_meat' });
                this.chef.setHeldItem(null);
                this.audio.playPlateSnap();
            } else if (station.item) {
                if (held && held.type === 'plate') {
                    if (station.item.id === 'grilled_meat') {
                        if (!held.ingredients.includes('grilled_meat')) {
                            held.ingredients.push('grilled_meat');
                            this.chef.setHeldItem(held);
                            station.setItem(null);
                            this.audio.playPlateSnap();
                            this.spawnSparks(station.position);
                        }
                    }
                } else if (!held) {
                    this.chef.setHeldItem({ ...station.item });
                    station.setItem(null);
                    this.audio.playPlateSnap();
                }
            }
            return;
        }

        // 5. FRYER (Deep Fry Potato Strips -> French Fries)
        if (station.type === STATION_TYPES.FRYER) {
            if (!station.item && held && held.id === 'sliced_potato') {
                station.setItem({ type: 'ingredient', id: 'sliced_potato' });
                this.chef.setHeldItem(null);
                this.audio.playPlateSnap();
                this.spawnFryerSteam(station.position);
            } else if (station.item) {
                if (held && held.type === 'plate') {
                    if (station.item.id === 'french_fries') {
                        if (!held.ingredients.includes('french_fries')) {
                            held.ingredients.push('french_fries');
                            this.chef.setHeldItem(held);
                            station.setItem(null);
                            this.audio.playPlateSnap();
                            this.spawnSparks(station.position);
                        }
                    }
                } else if (!held) {
                    this.chef.setHeldItem({ ...station.item });
                    station.setItem(null);
                    this.audio.playPlateSnap();
                }
            }
            return;
        }

        // 6. CUTTING BOARD
        if (station.type === STATION_TYPES.CUTTING_BOARD) {
            if (!station.item && held && (held.id === 'raw_tomato' || held.id === 'raw_cucumber' || held.id === 'raw_potato')) {
                station.setItem({ ...held });
                this.chef.setHeldItem(null);
                this.audio.playPlateSnap();
            } else if (station.item) {
                const isSliced = (station.item.id === 'sliced_tomato' || station.item.id === 'sliced_cucumber' || station.item.id === 'sliced_potato');
                if (isSliced && held && held.type === 'plate') {
                    if (!held.ingredients.includes(station.item.id)) {
                        held.ingredients.push(station.item.id);
                        this.chef.setHeldItem(held);
                        station.setItem(null);
                        this.audio.playPlateSnap();
                        this.spawnSparks(station.position);
                    }
                } else if (!held) {
                    this.chef.setHeldItem({ ...station.item });
                    station.setItem(null);
                    this.audio.playPlateSnap();
                }
            }
            return;
        }

        // 7. PREP COUNTERS
        if (station.type === STATION_TYPES.COUNTER) {
            if (held && !station.item) {
                station.setItem({ ...held });
                this.chef.setHeldItem(null);
                this.audio.playPlateSnap();
            } else if (!held && station.item) {
                this.chef.setHeldItem({ ...station.item });
                station.setItem(null);
                this.audio.playPlateSnap();
            } else if (held && station.item) {
                // Table has Plate, Chef holds ingredient
                if (station.item.type === 'plate' && (held.id === 'grilled_meat' || held.id === 'sliced_tomato' || held.id === 'sliced_cucumber' || held.id === 'french_fries' || held.id === 'coca_drink')) {
                    if (!station.item.ingredients.includes(held.id)) {
                        station.item.ingredients.push(held.id);
                        station.setItem(station.item);
                        this.chef.setHeldItem(null);
                        this.audio.playPlateSnap();
                        this.spawnSparks(station.position);
                    }
                }
                // Chef holds Plate, table has ingredient
                else if (held.type === 'plate' && (station.item.id === 'grilled_meat' || station.item.id === 'sliced_tomato' || station.item.id === 'sliced_cucumber' || station.item.id === 'french_fries' || station.item.id === 'coca_drink')) {
                    if (!held.ingredients.includes(station.item.id)) {
                        held.ingredients.push(station.item.id);
                        this.chef.setHeldItem(held);
                        station.setItem(null);
                        this.audio.playPlateSnap();
                        this.spawnSparks(station.position);
                    }
                }
            }
            return;
        }

        // 8. DELIVERY CONVEYOR BELT (Quy trình: Giao món -> Thành công -> Sinh đĩa bẩn ở bồn rửa)
        if (station.type === STATION_TYPES.DELIVERY) {
            if (held) {
                let delivered = false;
                if (held.type === 'plate' && held.ingredients && held.ingredients.length > 0) {
                    const recipe = findMatchingRecipe(held.ingredients);
                    delivered = this.onOrderDelivered(held.ingredients, recipe);
                } else if (held.id === 'coca_drink' || held.id === 'french_fries') {
                    // Direct delivery of drink or fries if ordered individually
                    const recipe = findMatchingRecipe([held.id]);
                    delivered = this.onOrderDelivered([held.id], recipe);
                }

                if (delivered) {
                    // Order served successfully!
                    const wasPlate = (held.type === 'plate');
                    
                    if (wasPlate) {
                        this.chef.setHeldItem({ type: 'ingredient', id: 'dirty_plate' });
                    } else {
                        this.chef.setHeldItem(null);
                    }
                    
                    this.audio.playPerfect();
                    this.audio.playCoin();
                    this.spawnConfetti(station.position);
                } else {
                    if (this.audio) this.audio.playBurnt();
                }
            }
            return;
        }

        // 9. TRASH
        if (station.type === STATION_TYPES.TRASH) {
            if (held) {
                this.chef.setHeldItem(null);
                this.audio.playPlateSnap();
            }
            return;
        }

        // 10. SINK (Drop dirty plate into sink)
        if (station.type === STATION_TYPES.SINK) {
            if (held && held.id === 'dirty_plate') {
                station.dirtyPlates++;
                station.updateDirtyPlateStackVisual();
                this.chef.setHeldItem(null);
                this.audio.playPlateSnap();
            }
            return;
        }
    }

    /**
     * Dynamically create a floor station to drop items anywhere
     */
    dropItemOnFloor(heldItem) {
        const angle = this.chef.group.rotation.y;
        const dropDist = 0.8;
        const dropX = this.chef.group.position.x + Math.sin(angle) * dropDist;
        const dropZ = this.chef.group.position.z + Math.cos(angle) * dropDist;

        const floorStation = new Station3D({
            id: 'floor_' + Date.now(),
            type: STATION_TYPES.COUNTER,
            x: dropX,
            z: dropZ,
            width: 0.6,
            depth: 0.6,
            label: 'Sàn Nhà'
        });

        // Hide normal counter meshes but keep tray
        floorStation.group.children.forEach(c => {
            if (c.material) {
                c.visible = false;
            }
        });

        // Không tạo khay đen nữa, để đồ rơi thẳng xuống sàn
        if (floorStation.itemAnchor) {
            floorStation.itemAnchor.position.y = 0.05; // Hạ thấp điểm neo (anchor) xuống sát mặt sàn
        }

        this.scene.add(floorStation.group);
        this.stations.push(floorStation);
        floorStation.setItem(heldItem);
    }

    /**
     * Chopping & Dishwashing Action (Continuous while Space key is held down)
     * @param {number} dt Delta time
     */
    handleProcessAction(dt) {
        const station = this.closestStation;
        if (!station) {
            this.chef.setChopping(false);
            return;
        }

        // A. CHOPPING ON CUTTING BOARD
        if (station.type === STATION_TYPES.CUTTING_BOARD && station.item) {
            const item = station.item;
            if (item.id === 'raw_tomato' || item.id === 'raw_cucumber' || item.id === 'raw_potato') {
                this.chef.setChopping(true);
                station.progressBarGroup.visible = true;

                station.chopProgress += dt / 2.2; // 2.2s to chop
                const ratio = Math.min(1.0, station.chopProgress);
                station.progressFillMesh.scale.set(ratio, 1, 1);
                station.progressFillMesh.position.x = (ratio - 1) * 0.42;
                station.progressFillMat.color.setHex(0x00e676);

                if (Math.random() < 0.25) {
                    this.audio.playChop();
                    const color = item.id === 'raw_tomato' ? 0xe52d27 : (item.id === 'raw_cucumber' ? 0x2e7d32 : 0xf59e0b);
                    this.spawnVeggieSlices(station.position, color);
                }

                if (station.chopProgress >= 1.0) {
                    if (item.id === 'raw_tomato') station.setItem({ type: 'ingredient', id: 'sliced_tomato' });
                    else if (item.id === 'raw_cucumber') station.setItem({ type: 'ingredient', id: 'sliced_cucumber' });
                    else if (item.id === 'raw_potato') station.setItem({ type: 'ingredient', id: 'sliced_potato' });

                    station.progressBarGroup.visible = false;
                    this.chef.setChopping(false);
                    this.audio.playPlateSnap();
                    this.spawnSparks(station.position);
                }
                return;
            }
        }

        // B. DISHWASHING AT SINK (Rửa đĩa bẩn -> Chuyển thành đĩa sạch trên kệ)
        if (station.type === STATION_TYPES.SINK && station.dirtyPlates > 0) {
            this.chef.setChopping(true); // Chef uses hands at sink
            station.progressBarGroup.visible = true;

            station.washProgress += dt / 1.8; // 1.8s to wash 1 plate
            const ratio = Math.min(1.0, station.washProgress);
            station.progressFillMesh.scale.set(ratio, 1, 1);
            station.progressFillMesh.position.x = (ratio - 1) * 0.42;
            station.progressFillMat.color.setHex(0x00e5ff); // Cyan water fill

            if (Math.random() < 0.35) {
                this.spawnWaterBubbles(station.position);
            }

            if (station.washProgress >= 1.0) {
                station.dirtyPlates = Math.max(0, station.dirtyPlates - 1);
                station.washProgress = 0;
                station.updateDirtyPlateStackVisual();
                station.progressBarGroup.visible = false;

                // Transfer 1 clean plate to plate rack
                const plateRack = this.stations.find(s => s.type === STATION_TYPES.PLATE_RACK);
                if (plateRack) {
                    plateRack.cleanPlates++;
                    plateRack.updatePlateStackVisual();
                }

                this.audio.playPerfect();
                this.spawnSparks(station.position);
                const rect = this.domContainer.getBoundingClientRect();
                this.vfx.floatingText('✨ 1 ĐĨA SẠCH ĐÃ VỀ KỆ!', rect.width / 2, 140, '#38bdf8');
            }
            return;
        }

        this.chef.setChopping(false);
    }

    /**
     * Particle effect: Water splash & soap bubbles
     */
    spawnWaterBubbles(pos) {
        const THREE = window.THREE;
        for (let i = 0; i < 3; i++) {
            const pGeo = new THREE.SphereGeometry(0.045, 6, 6);
            const pMat = new THREE.MeshBasicMaterial({ color: 0x80d8ff, transparent: true, opacity: 0.8 });
            const p = new THREE.Mesh(pGeo, pMat);
            p.position.set(pos.x + (Math.random() - 0.5) * 0.4, pos.y + 1.1, pos.z + (Math.random() - 0.5) * 0.4);
            p.userData = {
                vx: (Math.random() - 0.5) * 1.5,
                vy: Math.random() * 2 + 0.5,
                vz: (Math.random() - 0.5) * 1.5,
                life: 0.4
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    /**
     * Particle effect: Soda fizz
     */
    spawnDrinkFizz(pos) {
        const THREE = window.THREE;
        for (let i = 0; i < 6; i++) {
            const pGeo = new THREE.SphereGeometry(0.035, 6, 6);
            const pMat = new THREE.MeshBasicMaterial({ color: 0xffd54f });
            const p = new THREE.Mesh(pGeo, pMat);
            p.position.set(pos.x + (Math.random() - 0.5) * 0.3, pos.y + 1.2, pos.z + (Math.random() - 0.5) * 0.3);
            p.userData = {
                vx: (Math.random() - 0.5) * 1.2,
                vy: Math.random() * 2 + 1,
                vz: (Math.random() - 0.5) * 1.2,
                life: 0.35
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    /**
     * Particle effect: Deep fryer vapor & oil sizzle
     */
    spawnFryerSteam(pos) {
        const THREE = window.THREE;
        for (let i = 0; i < 8; i++) {
            const pGeo = new THREE.SphereGeometry(0.05, 6, 6);
            const pMat = new THREE.MeshBasicMaterial({ color: 0xffecb3, transparent: true, opacity: 0.6 });
            const p = new THREE.Mesh(pGeo, pMat);
            p.position.set(pos.x + (Math.random() - 0.5) * 0.4, pos.y + 1.1, pos.z + (Math.random() - 0.5) * 0.4);
            p.userData = {
                vx: (Math.random() - 0.5) * 0.8,
                vy: Math.random() * 1.8 + 1,
                vz: (Math.random() - 0.5) * 0.8,
                life: 0.5
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    /**
     * Particle effect: Veggie slice splatter
     */
    spawnVeggieSlices(pos, colorHex) {
        const THREE = window.THREE;
        for (let i = 0; i < 4; i++) {
            const pGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
            const pMat = new THREE.MeshBasicMaterial({ color: colorHex });
            const p = new THREE.Mesh(pGeo, pMat);
            p.position.set(pos.x + (Math.random() - 0.5) * 0.4, pos.y + 1.0, pos.z + (Math.random() - 0.5) * 0.4);
            p.userData = {
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 3 + 1,
                vz: (Math.random() - 0.5) * 3,
                life: 0.45
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    /**
     * Particle effect: Gold stars & confetti
     */
    spawnConfetti(pos) {
        const THREE = window.THREE;
        const colors = [0xffd700, 0x00e676, 0x00e5ff, 0xff4081, 0xffeb3b];
        for (let i = 0; i < 24; i++) {
            const c = colors[Math.floor(Math.random() * colors.length)];
            const pGeo = new THREE.PlaneGeometry(0.14, 0.14);
            const pMat = new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide });
            const p = new THREE.Mesh(pGeo, pMat);
            p.position.set(pos.x + (Math.random() - 0.5) * 1.5, pos.y + 1.2, pos.z + (Math.random() - 0.5) * 1.5);
            p.userData = {
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 4 + 2,
                vz: (Math.random() - 0.5) * 4,
                rotV: (Math.random() - 0.5) * 10,
                life: 0.9
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    /**
     * Particle effect: Small cooking spark puffs
     */
    spawnSparks(pos) {
        const THREE = window.THREE;
        for (let i = 0; i < 6; i++) {
            const pGeo = new THREE.SphereGeometry(0.04, 4, 4);
            const pMat = new THREE.MeshBasicMaterial({ color: 0xffd54f });
            const p = new THREE.Mesh(pGeo, pMat);
            p.position.set(pos.x + (Math.random() - 0.5) * 0.3, pos.y + 1.1, pos.z + (Math.random() - 0.5) * 0.3);
            p.userData = {
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2 + 1,
                vz: (Math.random() - 0.5) * 2,
                life: 0.35
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    /**
     * Particle update loop
     */
    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.userData.life -= dt;
            p.position.x += p.userData.vx * dt;
            p.position.y += p.userData.vy * dt;
            p.position.z += p.userData.vz * dt;
            p.userData.vy -= 9.8 * dt; // Gravity
            if (p.userData.rotV) p.rotation.z += p.userData.rotV * dt;

            if (p.userData.life <= 0) {
                this.scene.remove(p);
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Window resize handler
     */
    onWindowResize() {
        if (!this.camera || !this.renderer || !this.domContainer) return;
        const width = this.domContainer.clientWidth || window.innerWidth;
        const height = this.domContainer.clientHeight || window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * Master frame update
     * @param {number} dt Delta time
     * @param {Object} input Controller input { moveX, moveZ, isChopping }
     */
    update(dt, input) {
        if (!this.chef) return;

        // 1. Update Chef Movement & Collision
        const obstacles = this.getObstacles();
        this.chef.update(dt, input, obstacles);

        // 2. Handle Action (Chop or Dishwash while Space is held)
        if (input.isChopping) {
            this.handleProcessAction(dt);
        } else {
            this.chef.setChopping(false);
            const sink = this.stations.find(s => s.type === STATION_TYPES.SINK);
            if (sink && sink.progressBarGroup) sink.progressBarGroup.visible = false;
        }

        // 3. Update Stations (Cooking, Frying, Progress Bars)
        for (const station of this.stations) {
            station.update(dt, this.audio, this.vfx);
        }

        // 4. Update Closest Station Highlight and UI Hint
        this.updateClosestStation();

        // 5. Update Particles
        this.updateParticles(dt);

        // 6. Render 3D Frame
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
