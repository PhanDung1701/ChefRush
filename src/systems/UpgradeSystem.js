/**
 * UpgradeSystem - Shop and Equipment Enhancement Logic
 * Handles upgrade validation, tiered purchasing, and gameplay modifier application.
 */
import { globalEventBus } from '../core/EventBus.js';
import { globalSaveManager } from '../core/SaveManager.js';
import { UPGRADES, getUpgrade } from '../data/UpgradesData.js';

export class UpgradeSystem {
    constructor(eventBus = globalEventBus, saveManager = globalSaveManager, economySystem = null) {
        this.eventBus = eventBus;
        this.saveManager = saveManager;
        this.economySystem = economySystem;
    }

    setEconomySystem(economySystem) {
        this.economySystem = economySystem;
    }

    /**
     * Get player's current level for an upgrade
     * @param {string} upgradeId 
     * @returns {number}
     */
    getCurrentLevel(upgradeId) {
        const upgrades = this.saveManager.get('upgrades') || {};
        return upgrades[upgradeId] || 0;
    }

    /**
     * Get upgrade details including cost for next level
     * @param {string} upgradeId 
     * @returns {Object|null}
     */
    getUpgradeInfo(upgradeId) {
        const config = getUpgrade(upgradeId);
        if (!config) return null;

        const currentLvl = this.getCurrentLevel(upgradeId);
        const isMaxLevel = currentLvl >= config.maxLevel;
        const nextCost = isMaxLevel ? null : config.costs[currentLvl];
        const currentModifier = config.modifiers[currentLvl];
        const nextModifier = isMaxLevel ? null : config.modifiers[currentLvl + 1];

        return {
            ...config,
            currentLevel: currentLvl,
            isMaxLevel,
            nextCost,
            currentModifier,
            nextModifier
        };
    }

    /**
     * Check if player can purchase upgrade
     * @param {string} upgradeId 
     * @returns {boolean}
     */
    canPurchase(upgradeId) {
        const info = this.getUpgradeInfo(upgradeId);
        if (!info || info.isMaxLevel) return false;
        if (!this.economySystem) return false;
        return this.economySystem.canAfford(info.nextCost);
    }

    /**
     * Buy next level of upgrade
     * @param {string} upgradeId 
     * @returns {boolean}
     */
    purchaseUpgrade(upgradeId) {
        if (!this.canPurchase(upgradeId)) return false;

        const info = this.getUpgradeInfo(upgradeId);
        const success = this.economySystem.spendCoins(info.nextCost, `upgrade_${upgradeId}`);
        if (!success) return false;

        const upgrades = this.saveManager.get('upgrades') || {};
        const newLevel = (upgrades[upgradeId] || 0) + 1;
        upgrades[upgradeId] = newLevel;
        this.saveManager.set('upgrades', upgrades);

        this.eventBus.emit('UPGRADE_PURCHASED', {
            upgradeId,
            newLevel,
            modifier: info.modifiers[newLevel]
        });

        return true;
    }

    /**
     * Get cooking speed multiplier (e.g., 0.85 = 15% faster cooking)
     * @returns {number}
     */
    getCookingSpeedMultiplier() {
        const lvl = this.getCurrentLevel('cookingSpeed');
        return UPGRADES.cookingSpeed.modifiers[lvl] || 1.0;
    }

    /**
     * Get customer patience multiplier (e.g., 1.20 = 20% longer wait time)
     * @returns {number}
     */
    getCustomerPatienceMultiplier() {
        const lvl = this.getCurrentLevel('customerPatience');
        return UPGRADES.customerPatience.modifiers[lvl] || 1.0;
    }

    /**
     * Get food value coin multiplier
     * @returns {number}
     */
    getFoodValueMultiplier() {
        const lvl = this.getCurrentLevel('foodValue');
        return UPGRADES.foodValue.modifiers[lvl] || 1.0;
    }

    /**
     * Get total grill slots
     * @returns {number}
     */
    getGrillSlotsCount() {
        const lvl = this.getCurrentLevel('stoveSlots');
        return UPGRADES.stoveSlots.modifiers[lvl] || 2;
    }

    /**
     * Get total assembly plate slots
     * @returns {number}
     */
    getAssemblySlotsCount() {
        const lvl = this.getCurrentLevel('assemblySlots');
        return UPGRADES.assemblySlots.modifiers[lvl] || 2;
    }
}
