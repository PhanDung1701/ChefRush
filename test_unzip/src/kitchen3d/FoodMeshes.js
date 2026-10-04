/**
 * FoodMeshes.js - Procedural 3D Models for Overcooked Ingredients & Dishes
 * Generates stylized 3D food meshes using Three.js primitives and vibrant materials.
 */

// Cached materials for high performance and smooth rendering
let materialsCache = null;

function getMaterials() {
    if (materialsCache) return materialsCache;
    const THREE = window.THREE;
    if (!THREE) return null;

    materialsCache = {
        // Raw meat: marbled reddish-pink
        rawMeat: new THREE.MeshStandardMaterial({
            color: 0xc43c35,
            roughness: 0.4,
            metalness: 0.1
        }),
        rawMeatFat: new THREE.MeshStandardMaterial({
            color: 0xf5d0c5,
            roughness: 0.5
        }),
        // Grilled meat: rich caramelized brown with grill marks
        grilledMeat: new THREE.MeshStandardMaterial({
            color: 0x5a2d0c,
            roughness: 0.6,
            metalness: 0.05
        }),
        grillMarks: new THREE.MeshBasicMaterial({
            color: 0x221105
        }),
        // Tomato: glossy vibrant red and fresh green calyx
        tomatoRed: new THREE.MeshStandardMaterial({
            color: 0xe52d27,
            roughness: 0.25,
            metalness: 0.1
        }),
        tomatoSliceInner: new THREE.MeshStandardMaterial({
            color: 0xdb3236,
            roughness: 0.3
        }),
        tomatoSliceSeed: new THREE.MeshStandardMaterial({
            color: 0xffcb05,
            roughness: 0.4
        }),
        leafGreen: new THREE.MeshStandardMaterial({
            color: 0x2e7d32,
            roughness: 0.5
        }),
        // Cucumber: crisp dark green rind and translucent light green flesh
        cucumberSkin: new THREE.MeshStandardMaterial({
            color: 0x2e7d32,
            roughness: 0.45
        }),
        cucumberFlesh: new THREE.MeshStandardMaterial({
            color: 0xc8e6c9,
            roughness: 0.35
        }),
        // Plate: porcelain white with subtle sheen
        plateCeramic: new THREE.MeshStandardMaterial({
            color: 0xfafafa,
            roughness: 0.2,
            metalness: 0.15
        }),
        plateRim: new THREE.MeshStandardMaterial({
            color: 0xe0e0e0,
            roughness: 0.3
        }),
        // Potato & Fries materials
        potatoSkin: new THREE.MeshStandardMaterial({
            color: 0x9e7146,
            roughness: 0.85
        }),
        potatoFlesh: new THREE.MeshStandardMaterial({
            color: 0xfff59d,
            roughness: 0.4
        }),
        fryGolden: new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            roughness: 0.35,
            metalness: 0.05
        }),
        fryBoxRed: new THREE.MeshStandardMaterial({
            color: 0xd32f2f,
            roughness: 0.3
        }),
        // Coca Drink materials
        cocaCupRed: new THREE.MeshStandardMaterial({
            color: 0xd32f2f,
            roughness: 0.2
        }),
        cocaCupWhite: new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2
        }),
        cocaStraw: new THREE.MeshStandardMaterial({
            color: 0xffeb3b,
            roughness: 0.2
        }),
        // Dirty plate residue
        dirtySauce: new THREE.MeshStandardMaterial({
            color: 0x6d4c41,
            roughness: 0.7
        }),
        // Burnt: charcoal black
        burnt: new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9
        })
    };
    return materialsCache;
}

export class FoodMeshes {
    /**
     * Create Raw Meat 3D Mesh (🥩)
     */
    static createRawMeat() {
        const THREE = window.THREE;
        const mats = getMaterials();
        const group = new THREE.Group();

        // Main steak patty/slab
        const slabGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.16, 12);
        slabGeo.scale(1.25, 1, 0.85);
        const slab = new THREE.Mesh(slabGeo, mats.rawMeat);
        slab.castShadow = true;
        slab.receiveShadow = true;
        group.add(slab);

        // Fat marbling strips
        const fatGeo = new THREE.BoxGeometry(0.12, 0.17, 0.45);
        const fat = new THREE.Mesh(fatGeo, mats.rawMeatFat);
        fat.rotation.y = 0.4;
        fat.position.set(-0.1, 0, 0);
        group.add(fat);

        group.userData = { foodType: 'raw_meat' };
        return group;
    }

    /**
     * Create Grilled Meat 3D Mesh (🥩🔥)
     */
    static createGrilledMeat() {
        const THREE = window.THREE;
        const mats = getMaterials();
        const group = new THREE.Group();

        // Grilled browned steak
        const slabGeo = new THREE.CylinderGeometry(0.35, 0.37, 0.15, 12);
        slabGeo.scale(1.25, 1, 0.85);
        const slab = new THREE.Mesh(slabGeo, mats.grilledMeat);
        slab.castShadow = true;
        slab.receiveShadow = true;
        group.add(slab);

        // Charred grill sear marks on top
        for (let i = -2; i <= 2; i++) {
            const markGeo = new THREE.BoxGeometry(0.04, 0.155, 0.6);
            const mark = new THREE.Mesh(markGeo, mats.grillMarks);
            mark.position.set(i * 0.14, 0.005, 0);
            mark.rotation.y = 0.5;
            group.add(mark);
        }

        group.userData = { foodType: 'grilled_meat' };
        return group;
    }

    /**
     * Create Raw Tomato 3D Mesh (🍅)
     */
    static createRawTomato() {
        const THREE = window.THREE;
        const mats = getMaterials();
        const group = new THREE.Group();

        // Plump glossy tomato body
        const tomatoGeo = new THREE.SphereGeometry(0.32, 14, 12);
        tomatoGeo.scale(1.05, 0.9, 1.05);
        const tomato = new THREE.Mesh(tomatoGeo, mats.tomatoRed);
        tomato.position.y = 0.28;
        tomato.castShadow = true;
        tomato.receiveShadow = true;
        group.add(tomato);

        // Green calyx leaves on top
        for (let i = 0; i < 5; i++) {
            const leafGeo = new THREE.ConeGeometry(0.07, 0.22, 4);
            const leaf = new THREE.Mesh(leafGeo, mats.leafGreen);
            const angle = (i / 5) * Math.PI * 2;
            leaf.position.set(Math.cos(angle) * 0.12, 0.54, Math.sin(angle) * 0.12);
            leaf.rotation.x = Math.sin(angle) * 0.5;
            leaf.rotation.z = -Math.cos(angle) * 0.5;
            group.add(leaf);
        }

        // Stem
        const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6);
        const stem = new THREE.Mesh(stemGeo, mats.leafGreen);
        stem.position.set(0, 0.6, 0);
        group.add(stem);

        group.userData = { foodType: 'raw_tomato' };
        return group;
    }

    /**
     * Create Sliced Tomato 3D Mesh (🍅✨)
     */
    static createSlicedTomato() {
        const THREE = window.THREE;
        const mats = getMaterials();
        const group = new THREE.Group();

        // 3 overlapping fresh slices
        const sliceOffsets = [
            { x: -0.16, z: -0.08, rot: 0.1, y: 0.04 },
            { x: 0.02, z: 0.06, rot: -0.15, y: 0.08 },
            { x: 0.18, z: -0.04, rot: 0.25, y: 0.12 }
        ];

        sliceOffsets.forEach((pos) => {
            const sliceGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 14);
            const slice = new THREE.Mesh(sliceGeo, mats.tomatoRed);
            slice.position.set(pos.x, pos.y, pos.z);
            slice.rotation.z = pos.rot;
            slice.castShadow = true;
            group.add(slice);

            // Inner slice flesh
            const innerGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.052, 12);
            const inner = new THREE.Mesh(innerGeo, mats.tomatoSliceInner);
            slice.add(inner);

            // Seed spots
            for (let s = 0; s < 4; s++) {
                const sAngle = (s / 4) * Math.PI * 2;
                const seedGeo = new THREE.SphereGeometry(0.03, 6, 6);
                const seed = new THREE.Mesh(seedGeo, mats.tomatoSliceSeed);
                seed.position.set(Math.cos(sAngle) * 0.1, 0.028, Math.sin(sAngle) * 0.1);
                slice.add(seed);
            }
        });

        group.userData = { foodType: 'sliced_tomato' };
        return group;
    }

    /**
     * Create Raw Cucumber 3D Mesh (🥒)
     */
    static createRawCucumber() {
        const THREE = window.THREE;
        const mats = getMaterials();
        const group = new THREE.Group();

        // Cylindrical cucumber with rounded ends
        const bodyGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.8, 12);
        bodyGeo.rotateZ(Math.PI / 2);
        const body = new THREE.Mesh(bodyGeo, mats.cucumberSkin);
        body.position.y = 0.18;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Rounded tips
        const tipGeo1 = new THREE.SphereGeometry(0.18, 8, 8);
        const tip1 = new THREE.Mesh(tipGeo1, mats.cucumberSkin);
        tip1.position.set(-0.4, 0.18, 0);
        group.add(tip1);

        const tipGeo2 = new THREE.SphereGeometry(0.19, 8, 8);
        const tip2 = new THREE.Mesh(tipGeo2, mats.cucumberSkin);
        tip2.position.set(0.4, 0.18, 0);
        group.add(tip2);

        // Small stem
        const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 6);
        const stem = new THREE.Mesh(stemGeo, mats.leafGreen);
        stem.position.set(-0.52, 0.2, 0);
        stem.rotation.z = Math.PI / 3;
        group.add(stem);

        group.rotation.y = 0.4;
        group.userData = { foodType: 'raw_cucumber' };
        return group;
    }

    /**
     * Create Sliced Cucumber 3D Mesh (🥒✨)
     */
    static createSlicedCucumber() {
        const THREE = window.THREE;
        const mats = getMaterials();
        const group = new THREE.Group();

        // 4 crisp green circular slices
        const sliceOffsets = [
            { x: -0.22, z: -0.06, rot: 0.1, y: 0.04 },
            { x: -0.08, z: 0.08, rot: -0.12, y: 0.07 },
            { x: 0.08, z: -0.05, rot: 0.18, y: 0.10 },
            { x: 0.22, z: 0.06, rot: -0.08, y: 0.13 }
        ];

        sliceOffsets.forEach((pos) => {
            const outerGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 12);
            const outer = new THREE.Mesh(outerGeo, mats.cucumberSkin);
            outer.position.set(pos.x, pos.y, pos.z);
            outer.rotation.z = pos.rot;
            outer.castShadow = true;
            group.add(outer);

            // Light green crisp flesh center
            const innerGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.042, 12);
            const inner = new THREE.Mesh(innerGeo, mats.cucumberFlesh);
            outer.add(inner);
        });

        group.userData = { foodType: 'sliced_cucumber' };
        return group;
    }

    /**
     * Create Clean Ceramic Plate 3D Mesh (🍽️)
     */
    static createPlate() {
        const THREE = window.THREE;
        const mats = getMaterials();
        const group = new THREE.Group();

        // Plate base
        const baseGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.06, 24);
        const base = new THREE.Mesh(baseGeo, mats.plateCeramic);
        base.position.y = 0.03;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        // Raised outer rim
        const rimGeo = new THREE.TorusGeometry(0.53, 0.05, 8, 24);
        rimGeo.rotateX(Math.PI / 2);
        const rim = new THREE.Mesh(rimGeo, mats.plateRim);
        rim.position.y = 0.06;
        rim.castShadow = true;
        group.add(rim);

        group.userData = { isPlate: true, ingredients: [] };
        return group;
    }

    /**
     * Create Raw Potato 3D Mesh (🥔)
     */
    static createRawPotato() {
        const THREE = window.THREE;
        const mats = getMaterials();
        const group = new THREE.Group();

        // Plump rustic potato body
        const potatoGeo = new THREE.SphereGeometry(0.24, 12, 10);
        potatoGeo.scale(1.4, 0.95, 1.0);
        const potato = new THREE.Mesh(potatoGeo, mats.potatoSkin);
        potato.position.y = 0.2;
        potato.castShadow = true;
        potato.receiveShadow = true;
        group.add(potato);

        // A few eye spots on potato
        for (let i = 0; i < 3; i++) {
            const eyeGeo = new THREE.SphereGeometry(0.03, 6, 6);
            const eye = new THREE.Mesh(eyeGeo, mats.dirtySauce);
            const angle = (i / 3) * Math.PI * 2;
            eye.position.set(Math.cos(angle) * 0.24, 0.22, Math.sin(angle) * 0.16);
            group.add(eye);
        }

        group.userData = { foodType: 'raw_potato' };
        return group;
    }

    /**
     * Create Sliced Potato Strips 3D Mesh (🍟 Raw prepped strips)
     */
    static createSlicedPotato() {
        const THREE = window.THREE;
        const mats = getMaterials();
        const group = new THREE.Group();

        // 6 rectangular yellow fry cut strips
        const positions = [
            { x: -0.15, z: -0.06, rot: 0.15 },
            { x: -0.05, z: 0.08, rot: -0.1 },
            { x: 0.08, z: -0.04, rot: 0.2 },
            { x: 0.18, z: 0.05, rot: -0.15 },
            { x: 0.0, z: 0.0, rot: 0.05 }
        ];

        positions.forEach((pos, idx) => {
            const stripGeo = new THREE.BoxGeometry(0.06, 0.06, 0.48);
            const strip = new THREE.Mesh(stripGeo, mats.potatoFlesh);
            strip.position.set(pos.x, 0.05 + idx * 0.02, pos.z);
            strip.rotation.y = pos.rot;
            strip.castShadow = true;
            group.add(strip);
        });

        group.userData = { foodType: 'sliced_potato' };
        return group;
    }

    /**
     * Create Crispy French Fries 3D Mesh (🍟 in iconic red carton sleeve)
     */
    static createFrenchFries() {
        const THREE = window.THREE;
        const mats = getMaterials();
        const group = new THREE.Group();

        // Red french fry box sleeve
        const boxGeo = new THREE.BoxGeometry(0.36, 0.42, 0.22);
        const box = new THREE.Mesh(boxGeo, mats.fryBoxRed);
        box.position.y = 0.22;
        box.castShadow = true;
        group.add(box);

        // Golden french fries protruding from carton
        const fryOffsets = [
            { x: -0.1, y: 0.45, z: -0.04, rotX: -0.1, rotZ: -0.15, len: 0.45 },
            { x: -0.04, y: 0.48, z: 0.03, rotX: 0.1, rotZ: -0.05, len: 0.5 },
            { x: 0.04, y: 0.5, z: -0.02, rotX: -0.05, rotZ: 0.08, len: 0.52 },
            { x: 0.1, y: 0.46, z: 0.04, rotX: 0.12, rotZ: 0.18, len: 0.46 },
            { x: -0.08, y: 0.42, z: 0.05, rotX: 0.15, rotZ: -0.1, len: 0.42 },
            { x: 0.07, y: 0.44, z: -0.05, rotX: -0.12, rotZ: 0.12, len: 0.44 }
        ];

        fryOffsets.forEach(fo => {
            const fGeo = new THREE.BoxGeometry(0.065, fo.len, 0.065);
            const fry = new THREE.Mesh(fGeo, mats.fryGolden);
            fry.position.set(fo.x, fo.y, fo.z);
            fry.rotation.x = fo.rotX;
            fry.rotation.z = fo.rotZ;
            fry.castShadow = true;
            group.add(fry);
        });

        group.userData = { foodType: 'french_fries' };
        return group;
    }

    /**
     * Create Ice-Cold Coca 3D Mesh (🥤 Cup with straw)
     */
    static createCocaDrink() {
        const THREE = window.THREE;
        const mats = getMaterials();
        const group = new THREE.Group();

        // Tapered Red Cup
        const cupGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.55, 18);
        const cup = new THREE.Mesh(cupGeo, mats.cocaCupRed);
        cup.position.y = 0.28;
        cup.castShadow = true;
        group.add(cup);

        // White brand wave ribbon
        const ribbonGeo = new THREE.CylinderGeometry(0.242, 0.22, 0.1, 18);
        const ribbon = new THREE.Mesh(ribbonGeo, mats.cocaCupWhite);
        ribbon.position.y = 0.28;
        group.add(ribbon);

        // White Cup Lid
        const lidGeo = new THREE.CylinderGeometry(0.255, 0.255, 0.05, 18);
        const lid = new THREE.Mesh(lidGeo, mats.cocaCupWhite);
        lid.position.y = 0.56;
        lid.castShadow = true;
        group.add(lid);

        // Yellow/White Drinking Straw
        const strawGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8);
        const straw = new THREE.Mesh(strawGeo, mats.cocaStraw);
        straw.position.set(0.05, 0.7, 0.02);
        straw.rotation.z = 0.2;
        straw.rotation.x = 0.1;
        group.add(straw);

        group.userData = { foodType: 'coca_drink' };
        return group;
    }

    /**
     * Create Dirty Plate 3D Mesh (🍽️💧)
     */
    static createDirtyPlate() {
        const mats = getMaterials();
        const group = FoodMeshes.createPlate();
        group.userData = { isDirtyPlate: true, foodType: 'dirty_plate' };

        // Brown / reddish sauce stains
        const stainGeo1 = new window.THREE.CylinderGeometry(0.22, 0.25, 0.02, 10);
        const stain1 = new window.THREE.Mesh(stainGeo1, mats.dirtySauce);
        stain1.position.set(0.08, 0.065, -0.04);
        group.add(stain1);

        const stainGeo2 = new window.THREE.CylinderGeometry(0.12, 0.14, 0.02, 8);
        const stain2 = new window.THREE.Mesh(stainGeo2, mats.rawMeat);
        stain2.position.set(-0.12, 0.065, 0.1);
        group.add(stain2);

        return group;
    }

    /**
     * Create Plated Dish with stacked ingredients (🥩 + 🍟 + 🥤 + 🍅 + 🥒)
     * @param {string[]} ingredientIds 
     */
    static createPlatedDish(ingredientIds = []) {
        const THREE = window.THREE;
        const group = FoodMeshes.createPlate();
        group.userData.ingredients = [...ingredientIds];

        const hasMeat = ingredientIds.includes('grilled_meat') || ingredientIds.includes('beef_patty');
        const hasTomato = ingredientIds.includes('sliced_tomato') || ingredientIds.includes('tomato_slice');
        const hasCucumber = ingredientIds.includes('sliced_cucumber');
        const hasFries = ingredientIds.includes('french_fries');
        const hasCoca = ingredientIds.includes('coca_drink');

        let currentY = 0.07;

        // 1. Steak on plate
        if (hasMeat) {
            const meat = FoodMeshes.createGrilledMeat();
            meat.scale.set(0.8, 0.8, 0.8);
            const posX = (hasFries || hasTomato || hasCucumber) ? -0.16 : 0;
            meat.position.set(posX, currentY + 0.06, 0);
            group.add(meat);
        }

        // 2. French fries on plate
        if (hasFries) {
            const fries = FoodMeshes.createFrenchFries();
            fries.scale.set(0.65, 0.65, 0.65);
            const posX = hasMeat ? 0.18 : (hasTomato || hasCucumber ? -0.14 : 0);
            fries.position.set(posX, currentY, 0);
            group.add(fries);
        }

        // 3. Tomato slices on plate
        if (hasTomato) {
            const tomato = FoodMeshes.createSlicedTomato();
            tomato.scale.set(0.65, 0.65, 0.65);
            const posX = (hasMeat || hasFries) ? 0.14 : (hasCucumber ? -0.14 : 0);
            const posZ = hasCucumber ? -0.12 : 0.08;
            tomato.position.set(posX, currentY + 0.02, posZ);
            group.add(tomato);
        }

        // 4. Cucumber slices on plate
        if (hasCucumber) {
            const cucumber = FoodMeshes.createSlicedCucumber();
            cucumber.scale.set(0.65, 0.65, 0.65);
            const posX = (hasMeat || hasFries) ? 0.12 : (hasTomato ? 0.14 : 0);
            const posZ = hasTomato ? 0.14 : -0.05;
            cucumber.position.set(posX, currentY + 0.02, posZ);
            group.add(cucumber);
        }

        // 5. Coca cup standing beside food on plate
        if (hasCoca) {
            const cup = FoodMeshes.createCocaDrink();
            cup.scale.set(0.55, 0.55, 0.55);
            cup.position.set(0.24, currentY, -0.18);
            group.add(cup);
        }

        return group;
    }

    /**
     * Create generic 3D food item by ID
     * @param {string} id 
     */
    static createMeshById(id) {
        switch (id) {
            case 'raw_meat':
                return FoodMeshes.createRawMeat();
            case 'grilled_meat':
                return FoodMeshes.createGrilledMeat();
            case 'raw_tomato':
                return FoodMeshes.createRawTomato();
            case 'sliced_tomato':
                return FoodMeshes.createSlicedTomato();
            case 'raw_cucumber':
                return FoodMeshes.createRawCucumber();
            case 'sliced_cucumber':
                return FoodMeshes.createSlicedCucumber();
            case 'raw_potato':
                return FoodMeshes.createRawPotato();
            case 'sliced_potato':
                return FoodMeshes.createSlicedPotato();
            case 'french_fries':
                return FoodMeshes.createFrenchFries();
            case 'coca_drink':
                return FoodMeshes.createCocaDrink();
            case 'dirty_plate':
                return FoodMeshes.createDirtyPlate();
            case 'plate':
                return FoodMeshes.createPlate();
            default:
                return FoodMeshes.createRawMeat();
        }
    }
}
