/**
 * SaveManager - Local Storage Persistence with Schema Validation and Fallback Protection
 */
export class SaveManager {
    static STORAGE_KEY = 'chefs_rush_save_v1';
    static CURRENT_VERSION = 1;

    /**
     * Default state template ensures all required fields exist
     */
    static DEFAULT_DATA = {
        version: 1,
        coins: 100,
        gems: 5,
        currentLevel: 1,
        maxUnlockedLevel: 1,
        levelStars: {
            "1": 0
        },
        upgrades: {
            cookingSpeed: 0,
            customerPatience: 0,
            foodValue: 0,
            stoveSlots: 0,
            assemblySlots: 0
        },
        unlockedRecipes: [
            "classic_burger",
            "cheese_burger"
        ],
        settings: {
            bgmVolume: 0.7,
            sfxVolume: 0.8,
            isMuted: false,
            isBgmEnabled: true,
            isSfxEnabled: true,
            language: 'vi',
            vibration: true,
            difficulty: 'normal'
        },
        statistics: {
            totalDishesServed: 0,
            totalCoinsEarned: 0,
            totalPerfectDishes: 0,
            totalBurntDishes: 0,
            highestCombo: 0
        }
    };

    constructor() {
        this.data = this.load();
    }

    /**
     * Load and validate data from storage
     * @returns {Object} Validated game data
     */
    load() {
        try {
            const raw = localStorage.getItem(SaveManager.STORAGE_KEY);
            if (!raw) {
                console.log('[SaveManager] No existing save found. Initializing with default data.');
                return JSON.parse(JSON.stringify(SaveManager.DEFAULT_DATA));
            }

            const parsed = JSON.parse(raw);
            return this.validateAndMigrate(parsed);
        } catch (err) {
            console.error('[SaveManager] Failed to load save data, recovering with defaults:', err);
            return JSON.parse(JSON.stringify(SaveManager.DEFAULT_DATA));
        }
    }

    /**
     * Validate loaded data against the current schema and fill missing keys
     * @param {Object} loaded 
     * @returns {Object} Sanitized data
     */
    validateAndMigrate(loaded) {
        if (!loaded || typeof loaded !== 'object') {
            return JSON.parse(JSON.stringify(SaveManager.DEFAULT_DATA));
        }

        // Deep merge with default data to guarantee missing properties are populated
        const validated = JSON.parse(JSON.stringify(SaveManager.DEFAULT_DATA));

        if (typeof loaded.coins === 'number' && !isNaN(loaded.coins)) validated.coins = Math.max(0, loaded.coins);
        if (typeof loaded.gems === 'number' && !isNaN(loaded.gems)) validated.gems = Math.max(0, loaded.gems);
        if (typeof loaded.currentLevel === 'number') validated.currentLevel = Math.max(1, loaded.currentLevel);
        if (typeof loaded.maxUnlockedLevel === 'number') validated.maxUnlockedLevel = Math.max(1, loaded.maxUnlockedLevel);

        if (loaded.levelStars && typeof loaded.levelStars === 'object') {
            validated.levelStars = { ...validated.levelStars, ...loaded.levelStars };
        }

        if (loaded.upgrades && typeof loaded.upgrades === 'object') {
            for (const key of Object.keys(validated.upgrades)) {
                if (typeof loaded.upgrades[key] === 'number') {
                    validated.upgrades[key] = Math.max(0, loaded.upgrades[key]);
                }
            }
        }

        if (Array.isArray(loaded.unlockedRecipes)) {
            validated.unlockedRecipes = Array.from(new Set([...validated.unlockedRecipes, ...loaded.unlockedRecipes]));
        }

        if (loaded.settings && typeof loaded.settings === 'object') {
            validated.settings = { ...validated.settings, ...loaded.settings };
        }

        if (loaded.statistics && typeof loaded.statistics === 'object') {
            validated.statistics = { ...validated.statistics, ...loaded.statistics };
        }

        validated.version = SaveManager.CURRENT_VERSION;
        return validated;
    }

    /**
     * Save current game data (debounced to avoid frame drop)
     * @param {boolean} [immediate]
     * @returns {boolean} Success status
     */
    save(immediate = false) {
        if (immediate) {
            if (this._saveTimeout) {
                clearTimeout(this._saveTimeout);
                this._saveTimeout = null;
            }
            return this._writeToStorage();
        }

        if (this._saveTimeout) return true;
        this._saveTimeout = setTimeout(() => {
            this._saveTimeout = null;
            this._writeToStorage();
        }, 120);
        return true;
    }

    _writeToStorage() {
        try {
            const serialized = JSON.stringify(this.data);
            localStorage.setItem(SaveManager.STORAGE_KEY, serialized);
            return true;
        } catch (err) {
            console.error('[SaveManager] Failed to write to localStorage:', err);
            return false;
        }
    }


    /**
     * Get a top-level property
     * @param {string} key 
     * @returns {*}
     */
    get(key) {
        return this.data[key];
    }

    /**
     * Set a top-level property and auto-save
     * @param {string} key 
     * @param {*} value 
     */
    set(key, value) {
        this.data[key] = value;
        this.save();
    }

    /**
     * Reset data to default (useful for testing or full wipe)
     */
    reset() {
        this.data = JSON.parse(JSON.stringify(SaveManager.DEFAULT_DATA));
        this.save();
    }
}

export const globalSaveManager = new SaveManager();
