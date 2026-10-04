/**
 * DishwashingSystem - Plate Cycling and Sink Station Management
 * Tracks clean plates in reserve and dirty plates piling up in the sink basin.
 * Prevents burger assembly when clean plates run out.
 */
import { globalEventBus } from '../core/EventBus.js';

export class DishwashingSystem {
    constructor(eventBus = globalEventBus) {
        this.eventBus = eventBus;
        this.enabled = false;
        this.maxPlates = 3;
        this.cleanPlates = 3;
        this.dirtyPlates = 0;
        this.isWashing = false;
        this.washDuration = 1.5; // 1.5s to wash all dirty plates
        this.washElapsed = 0;
    }

    /**
     * Configure dishwashing station for current level/upgrades
     * @param {Object} options 
     */
    configure({ maxPlates = 3, enabled = false } = {}) {
        this.enabled = Boolean(enabled);
        this.maxPlates = Math.max(2, Math.min(5, maxPlates));
        this.cleanPlates = this.maxPlates;
        this.dirtyPlates = 0;
        this.isWashing = false;
        this.washElapsed = 0;
        this.emitState();
    }

    /**
     * Reset station
     */
    reset() {
        this.cleanPlates = this.maxPlates;
        this.dirtyPlates = 0;
        this.isWashing = false;
        this.washElapsed = 0;
        this.emitState();
    }

    /**
     * Check if a clean plate is available to assemble a burger
     * @returns {boolean}
     */
    canAssembleDish() {
        if (!this.enabled) return true;
        return this.cleanPlates > 0;
    }

    /**
     * Consume 1 clean plate when starting a new burger assembly
     * @returns {boolean}
     */
    consumeCleanPlate() {
        if (!this.enabled) return true;
        if (this.cleanPlates <= 0) return false;

        this.cleanPlates--;
        this.emitState();
        return true;
    }

    /**
     * Return an unused plate if a plate assembly is cancelled/trashed
     */
    returnPlate() {
        if (!this.enabled) return;
        if (this.cleanPlates + this.dirtyPlates < this.maxPlates) {
            this.cleanPlates++;
            this.emitState();
        }
    }

    /**
     * Deposit dirty plate into sink after serving or trashing
     */
    addDirtyPlate() {
        if (!this.enabled) return;
        this.dirtyPlates = Math.min(this.maxPlates, this.dirtyPlates + 1);
        this.emitState();
    }

    /**
     * Begin washing dirty plates in sink
     * @returns {boolean}
     */
    startWashing() {
        if (!this.enabled) return false;
        if (this.isWashing) return false;
        if (this.dirtyPlates <= 0) return false;

        this.isWashing = true;
        this.washElapsed = 0;
        this.eventBus.emit('SINK_WASH_STARTED', {
            dirtyPlates: this.dirtyPlates,
            duration: this.washDuration
        });
        this.emitState();
        return true;
    }

    /**
     * Advance washing timer
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        if (!this.isWashing) return;

        this.washElapsed += dt;
        if (this.washElapsed >= this.washDuration) {
            const washedCount = this.dirtyPlates;
            this.cleanPlates = Math.min(this.maxPlates, this.cleanPlates + this.dirtyPlates);
            this.dirtyPlates = 0;
            this.isWashing = false;
            this.washElapsed = 0;

            this.eventBus.emit('SINK_WASH_COMPLETED', {
                washedCount,
                cleanPlates: this.cleanPlates
            });
            this.emitState();
        } else {
            this.eventBus.emit('SINK_WASH_TICK', {
                progress: this.washElapsed / this.washDuration
            });
        }
    }

    /**
     * Get wash progress 0.0 -> 1.0
     * @returns {number}
     */
    getWashProgress() {
        if (!this.isWashing) return 0;
        return Math.min(1.0, this.washElapsed / this.washDuration);
    }

    /**
     * Emit state change event
     */
    emitState() {
        this.eventBus.emit('SINK_STATE_CHANGED', {
            enabled: this.enabled,
            cleanPlates: this.cleanPlates,
            dirtyPlates: this.dirtyPlates,
            maxPlates: this.maxPlates,
            isWashing: this.isWashing,
            progress: this.getWashProgress()
        });
    }
}
