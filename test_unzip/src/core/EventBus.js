/**
 * EventBus - Centralized Pub/Sub Event System
 * Decouples game systems, preventing circular dependencies and spaghetti code.
 */
export class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} event 
     * @param {Function} callback 
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (typeof callback !== 'function') {
            console.error(`[EventBus] Callback for event "${event}" must be a function.`);
            return () => {};
        }

        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        const eventSet = this.listeners.get(event);
        eventSet.add(callback);

        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event once
     * @param {string} event 
     * @param {Function} callback 
     */
    once(event, callback) {
        const wrapper = (data) => {
            this.off(event, wrapper);
            callback(data);
        };
        this.on(event, wrapper);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event 
     * @param {Function} callback 
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const eventSet = this.listeners.get(event);
        eventSet.delete(callback);
        if (eventSet.size === 0) {
            this.listeners.delete(event);
        }
    }

    /**
     * Emit an event with data
     * @param {string} event 
     * @param {*} data 
     */
    emit(event, data) {
        if (!this.listeners.has(event)) return;

        // Clone set to prevent mutation issues if a callback unregisters during dispatch
        const callbacks = Array.from(this.listeners.get(event));
        for (const cb of callbacks) {
            try {
                cb(data);
            } catch (err) {
                console.error(`[EventBus] Error in listener for event "${event}":`, err);
            }
        }
    }

    /**
     * Clear all event listeners or listeners for a specific event
     * @param {string} [event] 
     */
    clear(event) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}

// Global instance for convenience
export const globalEventBus = new EventBus();
