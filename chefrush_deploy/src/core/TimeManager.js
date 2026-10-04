/**
 * TimeManager - Centralized Clock and Safe Timer Management
 * Provides stable delta time, pause/resume capabilities, and tracked timers with cancellation.
 */
export class TimeManager {
    constructor() {
        this.lastTime = 0;
        this.deltaTime = 0;
        this.timeScale = 1.0;
        this.isPaused = false;
        this.timers = new Map();
        this.nextTimerId = 1;
        this.rafId = null;
        this.updateCallbacks = new Set();
    }

    /**
     * Start the master update loop
     */
    start() {
        this.lastTime = performance.now();
        const loop = (currentTime) => {
            const rawDelta = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            // Cap delta time to prevent huge jumps when tab was inactive
            this.deltaTime = Math.min(rawDelta, 0.1) * (this.isPaused ? 0 : this.timeScale);

            if (!this.isPaused && this.deltaTime > 0) {
                this.updateTimers(this.deltaTime);
                for (const cb of this.updateCallbacks) {
                    try {
                        cb(this.deltaTime);
                    } catch (err) {
                        console.error('[TimeManager] Error in update callback:', err);
                    }
                }
            }

            this.rafId = requestAnimationFrame(loop);
        };

        this.rafId = requestAnimationFrame(loop);
    }

    /**
     * Stop the master update loop
     */
    stop() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * Pause or resume the time manager
     * @param {boolean} paused 
     */
    setPaused(paused) {
        this.isPaused = !!paused;
    }

    /**
     * Set time scale (e.g. 1.0 normal, 0.5 slow-mo, 1.5 frenzy)
     * @param {number} scale 
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0, scale);
    }

    /**
     * Register a per-frame update callback
     * @param {Function} callback 
     * @returns {Function} Unregister callback
     */
    registerUpdate(callback) {
        this.updateCallbacks.add(callback);
        return () => this.updateCallbacks.delete(callback);
    }

    /**
     * Add a tracked timer that executes once after duration
     * @param {number} durationSeconds 
     * @param {Function} callback 
     * @returns {number} Timer ID
     */
    addTimer(durationSeconds, callback) {
        const id = this.nextTimerId++;
        this.timers.set(id, {
            timeRemaining: Math.max(0, durationSeconds),
            duration: durationSeconds,
            callback,
            isRepeating: false
        });
        return id;
    }

    /**
     * Add a repeating interval timer
     * @param {number} intervalSeconds 
     * @param {Function} callback 
     * @returns {number} Timer ID
     */
    addInterval(intervalSeconds, callback) {
        const id = this.nextTimerId++;
        this.timers.set(id, {
            timeRemaining: Math.max(0, intervalSeconds),
            duration: intervalSeconds,
            callback,
            isRepeating: true
        });
        return id;
    }

    /**
     * Cancel an active timer
     * @param {number} id 
     */
    clearTimer(id) {
        this.timers.delete(id);
    }

    /**
     * Clear all active timers (e.g. on scene switch or level reset)
     */
    clearAllTimers() {
        this.timers.clear();
    }

    /**
     * Update active timers based on elapsed delta time
     * @private
     * @param {number} dt 
     */
    updateTimers(dt) {
        for (const [id, timer] of Array.from(this.timers.entries())) {
            timer.timeRemaining -= dt;
            if (timer.timeRemaining <= 0) {
                try {
                    timer.callback();
                } catch (err) {
                    console.error('[TimeManager] Error in timer callback:', err);
                }

                if (timer.isRepeating) {
                    timer.timeRemaining = timer.duration;
                } else {
                    this.timers.delete(id);
                }
            }
        }
    }
}

export const globalTimeManager = new TimeManager();
