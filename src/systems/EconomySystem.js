/**
 * EconomySystem - Centralized Financial and Score Management
 * Single source of truth for Coins, Score, and Combo Multipliers.
 * Prevents unauthorized or direct state mutation.
 */
import { globalEventBus } from '../core/EventBus.js';
import { globalSaveManager } from '../core/SaveManager.js';

export class EconomySystem {
    constructor(eventBus = globalEventBus, saveManager = globalSaveManager) {
        this.eventBus = eventBus;
        this.saveManager = saveManager;

        this.levelCoins = 0;       // Coins earned during current level
        this.levelScore = 0;       // Score earned during current level
        this.combo = 1;            // Current combo counter (1, 2, 3, 4, 5)
        this.comboTimer = 0;       // Remaining time to keep combo active
        this.comboTimeout = 5.0;   // 5 seconds window between dishes
        this.maxCombo = 5;
        this.scoreMultiplier = 1.0;

        // Listen for order fulfillment to record revenue
        this.eventBus.on('ORDER_ITEM_FULFILLED', (data) => {
            this.recordDishServed({
                baseCoins: data.baseEarned,
                tipCoins: data.tipEarned,
                baseScore: data.scoreEarned,
                isPerfect: data.isPerfect
            });
        });
    }

    /**
     * Total persistent wallet coins
     * @returns {number}
     */
    getTotalCoins() {
        return this.saveManager.get('coins') || 0;
    }

    /**
     * Score earned in current active run
     * @returns {number}
     */
    getLevelScore() {
        return this.levelScore;
    }

    /**
     * Coins earned in current active run
     * @returns {number}
     */
    getLevelCoins() {
        return this.levelCoins;
    }

    /**
     * Current combo count
     * @returns {number}
     */
    getCombo() {
        return this.combo;
    }

    /**
     * Set score multiplier (e.g. from difficulty preset)
     * @param {number} multiplier
     */
    setScoreMultiplier(multiplier = 1.0) {
        this.scoreMultiplier = Math.max(0.1, multiplier);
    }

    /**
     * Reset per-level session economy
     */
    resetLevelSession(scoreMultiplier = 1.0) {
        this.levelCoins = 0;
        this.levelScore = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.scoreMultiplier = scoreMultiplier;
        this.eventBus.emit('ECONOMY_SESSION_RESET');
    }

    /**
     * Process earnings from serving a dish
     * @param {Object} param0 
     */
    recordDishServed({ baseCoins, tipCoins, baseScore, isPerfect }) {
        const comboMultiplier = 1 + (this.combo - 1) * 0.25; // 1.0x, 1.25x, 1.5x, 1.75x, 2.0x
        const earnedCoins = Math.round((baseCoins + tipCoins) * comboMultiplier);
        const earnedScore = Math.round((baseScore + (isPerfect ? 50 : 0)) * comboMultiplier * (this.scoreMultiplier || 1.0));

        this.levelCoins += earnedCoins;
        this.levelScore += earnedScore;

        // Advance combo
        if (this.combo < this.maxCombo) {
            this.combo++;
        }
        this.comboTimer = this.comboTimeout;

        // Update statistics
        const stats = this.saveManager.get('statistics') || {};
        stats.totalDishesServed = (stats.totalDishesServed || 0) + 1;
        stats.totalCoinsEarned = (stats.totalCoinsEarned || 0) + earnedCoins;
        if (isPerfect) stats.totalPerfectDishes = (stats.totalPerfectDishes || 0) + 1;
        if (this.combo > (stats.highestCombo || 0)) stats.highestCombo = this.combo;
        this.saveManager.set('statistics', stats);

        this.eventBus.emit('EARNINGS_RECORDED', {
            earnedCoins,
            earnedScore,
            totalLevelCoins: this.levelCoins,
            totalLevelScore: this.levelScore,
            combo: this.combo,
            comboMultiplier,
            isPerfect
        });

        return { earnedCoins, earnedScore, comboMultiplier };
    }

    /**
     * Break active combo streak (e.g. food burnt or customer left angry)
     * @param {string} reason 
     */
    breakCombo(reason = 'timeout') {
        if (this.combo > 1) {
            const brokenCombo = this.combo;
            this.combo = 1;
            this.comboTimer = 0;
            this.eventBus.emit('COMBO_BROKEN', { brokenCombo, reason });
        }
    }

    /**
     * Deduct coins from current level earnings (e.g. thief escaped)
     * @param {number} amount
     */
    deductLevelCoins(amount) {
        if (typeof amount !== 'number' || amount <= 0) return;
        this.levelCoins = Math.max(0, this.levelCoins - amount);
        this.eventBus.emit('LEVEL_COINS_DEDUCTED', {
            amount,
            totalLevelCoins: this.levelCoins
        });
    }

    /**
     * Check if player has enough coins to purchase
     * @param {number} cost 
     * @returns {boolean}
     */
    canAfford(cost) {
        if (typeof cost !== 'number' || cost < 0) return false;
        return this.getTotalCoins() >= cost;
    }

    /**
     * Spend persistent wallet coins (e.g. for upgrades)
     * @param {number} amount 
     * @param {string} reason 
     * @returns {boolean}
     */
    spendCoins(amount, reason = 'purchase') {
        if (!this.canAfford(amount)) return false;

        const currentTotal = this.getTotalCoins();
        const newTotal = currentTotal - amount;
        this.saveManager.set('coins', newTotal);

        this.eventBus.emit('COINS_SPENT', {
            amount,
            newTotal,
            reason
        });

        return true;
    }

    /**
     * Add persistent coins to wallet (e.g. level completion reward)
     * @param {number} amount 
     * @param {string} reason 
     */
    addWalletCoins(amount, reason = 'reward') {
        if (typeof amount !== 'number' || amount <= 0) return;

        const currentTotal = this.getTotalCoins();
        const newTotal = currentTotal + amount;
        this.saveManager.set('coins', newTotal);

        this.eventBus.emit('WALLET_COINS_ADDED', {
            amount,
            newTotal,
            reason
        });
    }

    /**
     * Update combo countdown timer
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        if (this.combo > 1) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.breakCombo('timeout');
            }
        }
    }
}
