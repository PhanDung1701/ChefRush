/**
 * AssemblySystem - Plating and Food Assembly Station
 * Validates recipe composition, tracks multi-plate workstations, and manages trashing.
 */
import { globalEventBus } from '../core/EventBus.js';
import { findMatchingRecipe } from '../data/RecipesData.js';
import { isValidIngredient } from '../data/IngredientsData.js';

export class Plate {
    constructor(index) {
        this.index = index;
        this.ingredients = []; // Array of ingredient IDs
        this.matchedRecipe = null;
    }

    reset() {
        this.ingredients = [];
        this.matchedRecipe = null;
    }

    add(ingredientId) {
        this.ingredients.push(ingredientId);
        this.matchedRecipe = findMatchingRecipe(this.ingredients);
    }
}

export class AssemblySystem {
    constructor(eventBus = globalEventBus) {
        this.eventBus = eventBus;
        this.plates = [
            new Plate(0),
            new Plate(1)
        ];
    }

    /**
     * Configure number of assembly plates (from upgrades)
     * @param {number} count 
     */
    configure(count = 2) {
        const targetCount = Math.max(1, Math.min(4, count));
        while (this.plates.length < targetCount) {
            this.plates.push(new Plate(this.plates.length));
        }
        while (this.plates.length > targetCount && this.plates.length > 2) {
            this.plates.pop();
        }
        this.resetAll();
    }

    /**
     * Reset all plates
     */
    resetAll() {
        this.plates.forEach(p => p.reset());
    }

    /**
     * Get specific plate
     * @param {number} plateIndex 
     * @returns {Plate|null}
     */
    getPlate(plateIndex) {
        if (plateIndex < 0 || plateIndex >= this.plates.length) return null;
        return this.plates[plateIndex];
    }

    /**
     * Check if an ingredient can be added to a plate
     * @param {number} plateIndex 
     * @param {string} ingredientId 
     * @returns {boolean}
     */
    canAddIngredient(plateIndex, ingredientId) {
        const plate = this.getPlate(plateIndex);
        if (!plate) return false;
        if (!isValidIngredient(ingredientId)) return false;

        // Max 6 ingredients on a single burger/dish
        if (plate.ingredients.length >= 6) return false;

        // Burgers must start with bun_bottom
        if (plate.ingredients.length === 0 && ingredientId !== 'bun_bottom') {
            return false;
        }

        // Disallow duplicate ingredients on the same plate (bun_bottom, beef_patty, cheese_slice, lettuce, tomato_slice)
        if (plate.ingredients.includes(ingredientId)) {
            return false;
        }

        return true;
    }

    /**
     * Add ingredient to plate
     * @param {number} plateIndex 
     * @param {string} ingredientId 
     * @returns {boolean}
     */
    addIngredient(plateIndex, ingredientId) {
        if (!this.canAddIngredient(plateIndex, ingredientId)) return false;

        const plate = this.getPlate(plateIndex);
        plate.add(ingredientId);

        this.eventBus.emit('PLATE_UPDATED', {
            plateIndex,
            ingredients: [...plate.ingredients],
            matchedRecipe: plate.matchedRecipe
        });

        return true;
    }

    /**
     * Find an empty plate suitable for starting a new burger with bun_bottom
     * @param {number} [preferredIndex]
     * @returns {number|null} Plate index or null
     */
    findAvailablePlateForBun(preferredIndex = 0) {
        const safePreferred = (typeof preferredIndex === 'number' && preferredIndex >= 0) ? preferredIndex : 0;

        // First check preferred plate
        const prefPlate = this.getPlate(safePreferred);
        if (prefPlate && prefPlate.ingredients.length === 0) {
            return safePreferred;
        }

        // Search for any other completely empty plate
        for (let i = 0; i < this.plates.length; i++) {
            if (this.plates[i].ingredients.length === 0) {
                return i;
            }
        }
        return null;
    }

    /**
     * Find best plate that can accept this ingredient
     * @param {string} ingredientId
     * @param {number} [preferredIndex]
     * @returns {number|null} Plate index or null
     */
    findPlateForIngredient(ingredientId, preferredIndex = 0) {
        const safePreferred = (typeof preferredIndex === 'number' && preferredIndex >= 0) ? preferredIndex : 0;

        // If it's bun_bottom, prioritize an empty plate
        if (ingredientId === 'bun_bottom') {
            return this.findAvailablePlateForBun(safePreferred);
        }

        // Check preferred plate first
        if (this.canAddIngredient(safePreferred, ingredientId)) {
            return safePreferred;
        }

        // Otherwise find any active plate that can accept this ingredient
        for (let i = 0; i < this.plates.length; i++) {
            if (i !== safePreferred && this.canAddIngredient(i, ingredientId)) {
                return i;
            }
        }
        return null;
    }


    /**
     * Check if plate has contents to trash
     * @param {number} plateIndex 
     * @returns {boolean}
     */
    canTrashPlate(plateIndex) {
        const plate = this.getPlate(plateIndex);
        return Boolean(plate && plate.ingredients.length > 0);
    }

    /**
     * Discard plate contents
     * @param {number} plateIndex 
     * @returns {boolean}
     */
    trashPlate(plateIndex) {
        if (!this.canTrashPlate(plateIndex)) return false;

        const plate = this.getPlate(plateIndex);
        plate.reset();

        this.eventBus.emit('PLATE_TRASHED', { plateIndex });
        return true;
    }

    /**
     * Clear plate after successful customer serve
     * @param {number} plateIndex 
     */
    clearPlate(plateIndex) {
        const plate = this.getPlate(plateIndex);
        if (plate) {
            plate.reset();
            this.eventBus.emit('PLATE_CLEARED', { plateIndex });
        }
    }
}
