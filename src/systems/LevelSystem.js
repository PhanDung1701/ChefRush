/**
 * LevelSystem - Level Progression, Wave Pacing, and Win/Loss Conditions
 * Evaluates completion quotas, star ratings (1 to 3), and level unlocks.
 */
import { globalEventBus } from '../core/EventBus.js';
import { globalSaveManager } from '../core/SaveManager.js';
import { getLevel } from '../data/LevelsData.js';


export const LEVEL_STATES = {
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
    WON: 'WON',
    LOST: 'LOST'
};

export class LevelSystem {
    constructor(eventBus = globalEventBus, saveManager = globalSaveManager) {
        this.eventBus = eventBus;
        this.saveManager = saveManager;

        this.currentLevelNumber = 1;
        this.config = null;
        this.state = LEVEL_STATES.IDLE;

        this.timeRemaining = 0;
        this.customersSpawned = 0;
        this.customersServed = 0;
        this.customersLost = 0;
        this.spawnTimer = 0;
        this.currentCoins = 0;
        this.currentScore = 0;
        this.difficulty = 'normal';
    }

    /**
     * Start a level
     * @param {number} levelNumber 
     * @returns {boolean}
     */
    startLevel(levelNumber, difficulty) {
        const config = getLevel(levelNumber);
        if (!config) {
            console.error(`[LevelSystem] Cannot start nonexistent level ${levelNumber}`);
            return false;
        }

        this.difficulty = 'normal';
        const diffConfig = { scoreMultiplier: 1.0 };

        this.currentLevelNumber = levelNumber;
        this.config = {
            ...config
        };
        this.state = LEVEL_STATES.RUNNING;

        this.timeRemaining = this.config.timeLimit;
        this.customersSpawned = 0;
        this.customersServed = 0;
        this.customersLost = 0;
        this.spawnTimer = 0; // First customer arrives immediately
        this.currentCoins = 0;
        this.currentScore = 0;

        this.eventBus.emit('LEVEL_STARTED', {
            levelNumber,
            config: { ...this.config }
        });

        console.log(`[LevelSystem] Level ${levelNumber} started. state=${this.state}, timeLimit=${this.config.timeLimit}, spawnInterval=${this.config.spawnInterval}, recipes=${JSON.stringify(this.config.availableRecipes)}`);

        return true;
    }

    /**
     * Record a customer successfully served
     * @param {number} [currentCoins]
     * @param {number} [currentScore]
     */
    recordCustomerServed(currentCoins, currentScore) {
        this.customersServed++;
        if (currentCoins !== undefined) this.currentCoins = currentCoins;
        if (currentScore !== undefined) this.currentScore = currentScore;
        this.checkEndConditions(this.currentCoins, this.currentScore);
    }

    /**
     * Record an angry customer who walked out
     * @param {number} [currentCoins]
     * @param {number} [currentScore]
     */
    recordCustomerLost(currentCoins, currentScore) {
        this.customersLost++;
        if (currentCoins !== undefined) this.currentCoins = currentCoins;
        if (currentScore !== undefined) this.currentScore = currentScore;
        this.checkEndConditions(this.currentCoins, this.currentScore);
    }

    /**
     * Check if a new customer wave can be triggered
     * @param {boolean} canSpawnInSeat 
     * @returns {boolean}
     */
    shouldSpawnCustomer(canSpawnInSeat) {
        if (this.state !== LEVEL_STATES.RUNNING) {
            return false;
        }
        if (!canSpawnInSeat) {
            return false;
        }
        // Do not spawn if level time has run out
        if (this.timeRemaining <= 0) return false;

        // If quota is already met AND target customers served, no need to spawn more (level won)
        const quotaMet = (this.currentCoins >= this.config.targetCoins) || (this.currentScore >= this.config.targetScore);
        if (quotaMet && this.customersServed >= this.config.customerCount) return false;

        const result = this.spawnTimer <= 0;
        if (result) {
            console.log(`[LevelSystem] Customer spawn triggered! spawnTimer=${this.spawnTimer}`);
        }
        return result;
    }

    /**
     * Notify that customer was spawned
     */
    notifyCustomerSpawned() {
        this.customersSpawned++;
        // Reset spawn timer with slight random jitter for natural pacing
        this.spawnTimer = this.config.spawnInterval * (0.8 + Math.random() * 0.4);
    }

    /**
     * Calculate 0 to 3 stars based on score thresholds
     * @param {number} score 
     * @returns {number} 1, 2, or 3
     */
    calculateStars(score) {
        if (!this.config || !this.config.starThresholds) return 1;
        const [s1, s2, s3] = this.config.starThresholds;
        if (score >= s3) return 3;
        if (score >= s2) return 2;
        if (score >= s1) return 1;
        return 1; // Minimum 1 star if passed
    }

    /**
     * Evaluate completion conditions
     * Defeat can ONLY occur if timeRemaining <= 0. Never lose while time is still remaining!
     * @param {number} [currentCoins] 
     * @param {number} [currentScore] 
     */
    checkEndConditions(currentCoins, currentScore) {
        if (this.state !== LEVEL_STATES.RUNNING) return;
        if (!this.config) return;

        if (currentCoins !== undefined) this.currentCoins = currentCoins;
        if (currentScore !== undefined) this.currentScore = currentScore;

        const coins = this.currentCoins;
        const score = this.currentScore;

        const quotaMet = (coins >= this.config.targetCoins) || (score >= this.config.targetScore);
        const timeExpired = this.timeRemaining <= 0;
        const targetCustomersHandled = this.customersServed >= this.config.customerCount;

        // 1. VICTORY:
        // A. Target customer count served AND quota met
        // OR B. Shift timer expired AND quota met
        if (quotaMet && (targetCustomersHandled || timeExpired)) {
            this.state = LEVEL_STATES.WON;
            const stars = this.calculateStars(score);

            // Update persistent progress
            const savedStars = this.saveManager.get('levelStars') || {};
            const prevStars = savedStars[this.currentLevelNumber] || 0;
            savedStars[this.currentLevelNumber] = Math.max(prevStars, stars);
            this.saveManager.set('levelStars', savedStars);

            // Unlock next level
            const maxUnlocked = this.saveManager.get('maxUnlockedLevel') || 1;
            if (this.currentLevelNumber >= maxUnlocked) {
                this.saveManager.set('maxUnlockedLevel', this.currentLevelNumber + 1);
            }

            // Check first clear bonus
            let bonusReward = 0;
            if (prevStars === 0 && this.config.bonusFirstClear) {
                bonusReward = this.config.bonusFirstClear;
            }

            this.eventBus.emit('LEVEL_WON', {
                levelNumber: this.currentLevelNumber,
                stars,
                score,
                coinsEarned: coins,
                bonusReward,
                customersServed: this.customersServed,
                customersLost: this.customersLost
            });
            return;
        }

        // 2. DEFEAT:
        // Player can ONLY LOSE when time has expired and quota is not met!
        // Never trigger defeat while time remaining > 0!
        if (timeExpired && !quotaMet) {
            this.state = LEVEL_STATES.LOST;
            this.eventBus.emit('LEVEL_LOST', {
                levelNumber: this.currentLevelNumber,
                score,
                targetScore: this.config.targetScore,
                coinsEarned: coins,
                targetCoins: this.config.targetCoins,
                reason: 'TIME_EXPIRED'
            });
            return;
        }
    }

    /**
     * Update level timer and customer wave pacing
     * @param {number} dt Delta time in seconds
     * @param {number} currentCoins 
     * @param {number} currentScore 
     */
    update(dt, currentCoins = 0, currentScore = 0) {
        if (this.state !== LEVEL_STATES.RUNNING) return;

        this.currentCoins = currentCoins;
        this.currentScore = currentScore;

        this.timeRemaining = Math.max(0, this.timeRemaining - dt);
        if (this.spawnTimer > 0) {
            this.spawnTimer -= dt;
        }

        this.eventBus.emit('LEVEL_TIMER_TICK', {
            timeRemaining: Math.ceil(this.timeRemaining),
            timeRatio: this.timeRemaining / this.config.timeLimit
        });

        this.checkEndConditions(currentCoins, currentScore);
    }
}
