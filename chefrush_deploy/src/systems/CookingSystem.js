/**
 * CookingSystem - Appliance Cooking State Machine
 * Manages Grill burners, Fryers, and Drink dispensers with anti-bug guarantees.
 * Prevents duplicate timers, negative time, and state corruption.
 */
import { globalEventBus } from '../core/EventBus.js';
import { getIngredient, INGREDIENT_STATES } from '../data/IngredientsData.js';

export const APPLIANCE_SLOT_STATES = {
    EMPTY: 'EMPTY',
    COOKING: 'COOKING',
    COOKED: 'COOKED',    // Ready for pickup (Golden / Perfect)
    BURNT: 'BURNT',       // Charred / Overcooked
    BROKEN: 'BROKEN'      // Malfunctioned, requires repair clicks
};

export class CookingSlot {
    constructor(index, applianceType) {
        this.index = index;
        this.applianceType = applianceType; // 'grill' | 'fryer' | 'dispenser'
        this.state = APPLIANCE_SLOT_STATES.EMPTY;
        this.ingredientId = null;
        this.cookTimeTotal = 0;
        this.cookTimeElapsed = 0;
        this.burnTimeTotal = 0;
        this.burnTimeElapsed = 0;
        this.speedMultiplier = 1.0;
        this.repairTaps = 0;
        this.repairTapsMax = 3;
        this.canBurn = true;
    }

    reset() {
        this.state = APPLIANCE_SLOT_STATES.EMPTY;
        this.ingredientId = null;
        this.cookTimeTotal = 0;
        this.cookTimeElapsed = 0;
        this.burnTimeTotal = 0;
        this.burnTimeElapsed = 0;
        this.repairTaps = 0;
        this.canBurn = true;
    }
}

export class CookingSystem {
    constructor(eventBus = globalEventBus) {
        this.eventBus = eventBus;
        this.speedMultiplier = 1.0;
        this.overcookMultiplier = 1.0;
        this.breakdownEnabled = false;
        this.breakdownInterval = 20.0;
        this.breakdownTimer = 10.0; // First possible breakdown after 10s

        // Appliances: Grills (2 to 4 slots), Fryer (1 to 2 slots), Dispenser (1 to 2 slots)
        this.grillSlots = [
            new CookingSlot(0, 'grill'),
            new CookingSlot(1, 'grill')
        ];
        this.fryerSlots = [
            new CookingSlot(0, 'fryer')
        ];
        this.dispenserSlots = [
            new CookingSlot(0, 'dispenser')
        ];
    }

    /**
     * Configure slot count and speed multipliers (from upgrades)
     * @param {Object} options 
     */
    configure({ grillCount = 2, speedMultiplier = 1.0, overcookMultiplier = 1.0 } = {}) {
        this.speedMultiplier = Math.max(0.1, speedMultiplier);
        this.overcookMultiplier = Math.max(0.2, overcookMultiplier);

        while (this.grillSlots.length < grillCount) {
            this.grillSlots.push(new CookingSlot(this.grillSlots.length, 'grill'));
        }
        while (this.grillSlots.length > grillCount && this.grillSlots.length > 2) {
            this.grillSlots.pop();
        }

        this.resetAll();
    }

    /**
     * Reset all appliances to clean state
     */
    resetAll() {
        [...this.grillSlots, ...this.fryerSlots, ...this.dispenserSlots].forEach(slot => slot.reset());
    }

    /**
     * Get specific slot collection
     * @param {string} applianceType 
     * @returns {CookingSlot[]}
     */
    getSlots(applianceType) {
        if (applianceType === 'grill') return this.grillSlots;
        if (applianceType === 'fryer') return this.fryerSlots;
        if (applianceType === 'dispenser') return this.dispenserSlots;
        return [];
    }

    /**
     * Get specific slot by appliance type and index
     * @param {string} applianceType 
     * @param {number} slotIndex 
     * @returns {CookingSlot|null}
     */
    getSlot(applianceType, slotIndex) {
        const slots = this.getSlots(applianceType);
        return (slots && slotIndex >= 0 && slotIndex < slots.length) ? slots[slotIndex] : null;
    }

    /**
     * Check if item can be placed on slot
     * @param {string} applianceType 
     * @param {number} slotIndex 
     * @param {string} ingredientId 
     * @returns {boolean}
     */
    canPlaceItem(applianceType, slotIndex, ingredientId) {
        const slots = this.getSlots(applianceType);
        if (!slots || slotIndex < 0 || slotIndex >= slots.length) return false;

        const slot = slots[slotIndex];
        if (slot.state !== APPLIANCE_SLOT_STATES.EMPTY) return false;

        const ingredient = getIngredient(ingredientId);
        if (!ingredient || !ingredient.cookable) return false;
        if (ingredient.appliance !== applianceType) return false;

        return true;
    }

    /**
     * Place raw ingredient onto cooking appliance
     * @param {string} applianceType 
     * @param {number} slotIndex 
     * @param {string} ingredientId 
     * @returns {boolean}
     */
    placeItem(applianceType, slotIndex, ingredientId) {
        if (!this.canPlaceItem(applianceType, slotIndex, ingredientId)) return false;

        const slot = this.getSlots(applianceType)[slotIndex];
        const ingredient = getIngredient(ingredientId);

        slot.state = APPLIANCE_SLOT_STATES.COOKING;
        slot.ingredientId = ingredientId;
        slot.cookTimeTotal = Math.max(0.5, ingredient.cookTime * this.speedMultiplier);
        slot.cookTimeElapsed = 0;

        // Dispenser drinks and non-burnable ingredients never burn or emit burn warnings
        if (applianceType === 'dispenser' || ingredient.burnTime === 0 || ingredient.canBurn === false) {
            slot.burnTimeTotal = 0;
            slot.canBurn = false;
        } else {
            slot.burnTimeTotal = ingredient.burnTime * (this.overcookMultiplier || 1.0);
            slot.canBurn = true;
        }
        slot.burnTimeElapsed = 0;

        this.eventBus.emit('COOKING_STARTED', {
            applianceType,
            slotIndex,
            ingredientId,
            cookTimeTotal: slot.cookTimeTotal
        });

        return true;
    }

    /**
     * Check if cooked food is ready to collect
     * @param {string} applianceType 
     * @param {number} slotIndex 
     * @returns {boolean}
     */
    canCollectCookedItem(applianceType, slotIndex) {
        const slots = this.getSlots(applianceType);
        if (!slots || slotIndex < 0 || slotIndex >= slots.length) return false;
        return slots[slotIndex].state === APPLIANCE_SLOT_STATES.COOKED;
    }

    /**
     * Collect cooked food from appliance
     * @param {string} applianceType 
     * @param {number} slotIndex 
     * @returns {string|null} Harvested cooked ingredient ID
     */
    collectCookedItem(applianceType, slotIndex) {
        if (!this.canCollectCookedItem(applianceType, slotIndex)) return null;

        const slot = this.getSlots(applianceType)[slotIndex];
        const harvestedId = slot.ingredientId;
        slot.reset();

        this.eventBus.emit('COOKING_COLLECTED', {
            applianceType,
            slotIndex,
            ingredientId: harvestedId
        });

        return harvestedId;
    }

    /**
     * Check if burnt item can be trashed
     * @param {string} applianceType 
     * @param {number} slotIndex 
     * @returns {boolean}
     */
    canTrashBurntItem(applianceType, slotIndex) {
        const slots = this.getSlots(applianceType);
        if (!slots || slotIndex < 0 || slotIndex >= slots.length) return false;
        return slots[slotIndex].state === APPLIANCE_SLOT_STATES.BURNT;
    }

    /**
     * Discard burnt item from appliance
     * @param {string} applianceType 
     * @param {number} slotIndex 
     * @returns {boolean}
     */
    trashBurntItem(applianceType, slotIndex) {
        if (!this.canTrashBurntItem(applianceType, slotIndex)) return false;

        const slot = this.getSlots(applianceType)[slotIndex];
        const trashedId = slot.ingredientId;
        slot.reset();

        this.eventBus.emit('COOKING_TRASHED', {
            applianceType,
            slotIndex,
            ingredientId: trashedId
        });

        return true;
    }

    /**
     * Configure breakdown hazards for current level
     * @param {Object} options
     */
    configureBreakdowns({ enabled = false, interval = 22.0 } = {}) {
        this.breakdownEnabled = false;
        this.breakdownInterval = 999999;
        this.breakdownTimer = 0;
    }

    /**
     * Trigger a breakdown on a grill slot
     * @param {string} applianceType
     * @param {number} [slotIndex]
     * @returns {boolean}
     */
    triggerBreakdown(applianceType = 'grill', slotIndex = null) {
        // Permanently disabled per Requirement 1 (no broken stove mechanics)
        return false;
    }

    /**
     * Tap to repair broken slot
     * @param {string} applianceType
     * @param {number} slotIndex
     * @returns {boolean} True if fully repaired
     */
    repairSlot(applianceType, slotIndex) {
        const slot = this.getSlot(applianceType, slotIndex);
        if (!slot || slot.state !== APPLIANCE_SLOT_STATES.BROKEN) return false;

        slot.repairTaps--;
        if (slot.repairTaps <= 0) {
            slot.state = APPLIANCE_SLOT_STATES.EMPTY;
            slot.repairTaps = 0;
            this.eventBus.emit('APPLIANCE_REPAIRED', {
                applianceType,
                slotIndex
            });
            return true;
        }

        this.eventBus.emit('APPLIANCE_REPAIR_TAP', {
            applianceType,
            slotIndex,
            remainingTaps: slot.repairTaps
        });
        return false;
    }

    /**
     * Update cooking timers across all active appliances
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        if (dt <= 0) return;

        // Periodic breakdown check
        if (this.breakdownEnabled) {
            this.breakdownTimer += dt;
            if (this.breakdownTimer >= this.breakdownInterval) {
                this.breakdownTimer = 0;
                this.triggerBreakdown('grill');
            }
        }

        const allSlots = [...this.grillSlots, ...this.fryerSlots, ...this.dispenserSlots];

        for (const slot of allSlots) {
            if (slot.state === APPLIANCE_SLOT_STATES.COOKING) {
                slot.cookTimeElapsed += dt;
                const progress = Math.min(1.0, slot.cookTimeElapsed / slot.cookTimeTotal);

                this.eventBus.emit('COOKING_PROGRESS', {
                    applianceType: slot.applianceType,
                    slotIndex: slot.index,
                    progress,
                    state: slot.state
                });

                if (slot.cookTimeElapsed >= slot.cookTimeTotal) {
                    slot.state = APPLIANCE_SLOT_STATES.COOKED;
                    this.eventBus.emit('COOKING_FINISHED', {
                        applianceType: slot.applianceType,
                        slotIndex: slot.index,
                        ingredientId: slot.ingredientId
                    });
                }
            } else if (slot.state === APPLIANCE_SLOT_STATES.COOKED) {
                // If it can burn (burnTime > 0, appliance is not dispenser, and canBurn is true)
                if (slot.applianceType !== 'dispenser' && slot.canBurn && slot.burnTimeTotal > 0 && slot.burnTimeTotal < 900) {
                    slot.burnTimeElapsed += dt;
                    const burnProgress = Math.min(1.0, slot.burnTimeElapsed / slot.burnTimeTotal);

                    // Emit burn progress every tick so the burn progress bar runs gradually from 0% to 100%!
                    this.eventBus.emit('COOKING_BURN_PROGRESS', {
                        applianceType: slot.applianceType,
                        slotIndex: slot.index,
                        burnProgress
                    });

                    // Emit warning when food enters danger zone (>= 65% elapsed)
                    if (burnProgress >= 0.65) {
                        this.eventBus.emit('COOKING_BURN_WARNING', {
                            applianceType: slot.applianceType,
                            slotIndex: slot.index,
                            burnProgress
                        });
                    }

                    if (slot.burnTimeElapsed >= slot.burnTimeTotal) {
                        slot.state = APPLIANCE_SLOT_STATES.BURNT;
                        this.eventBus.emit('COOKING_BURNT', {
                            applianceType: slot.applianceType,
                            slotIndex: slot.index,
                            ingredientId: slot.ingredientId
                        });
                    }
                }
            }
        }
    }
}
