/**
 * UpgradesData - Upgrade specifications, tiered costs, and gameplay modifiers
 */
export const UPGRADES = {
    cookingSpeed: {
        id: 'cookingSpeed',
        name: 'Faster Grilling',
        icon: 'flame',
        description: 'Increases cooking and frying speed by 15% per level.',
        maxLevel: 3,
        costs: [80, 150, 250],
        // Multiplier applied to cookTime (e.g., 0.85 = 15% faster)
        modifiers: [1.0, 0.85, 0.72, 0.60]
    },
    customerPatience: {
        id: 'customerPatience',
        name: 'Cozy Atmosphere',
        icon: 'heart',
        description: 'Customers wait 20% longer before getting impatient.',
        maxLevel: 3,
        costs: [60, 120, 200],
        // Multiplier applied to customer patience duration
        modifiers: [1.0, 1.20, 1.45, 1.70]
    },
    foodValue: {
        id: 'foodValue',
        name: 'Premium Ingredients',
        icon: 'star',
        description: 'Earn +20% bonus coins and score on every served dish.',
        maxLevel: 3,
        costs: [100, 200, 350],
        // Multiplier applied to basePrice and score
        modifiers: [1.0, 1.20, 1.40, 1.65]
    },
    stoveSlots: {
        id: 'stoveSlots',
        name: 'Extra Grill Burner',
        icon: 'pan',
        description: 'Adds an extra burner to your grill (up to 3 simultaneous slots).',
        maxLevel: 2,
        costs: [120, 280],
        // Total slots available
        modifiers: [2, 3, 4]
    },
    assemblySlots: {
        id: 'assemblySlots',
        name: 'Extra Plating Tray',
        icon: 'plate',
        description: 'Adds an extra prep plate to assemble multiple orders simultaneously.',
        maxLevel: 2,
        costs: [90, 220],
        // Total plating slots available
        modifiers: [2, 3, 4]
    }
};

/**
 * Get upgrade specification
 * @param {string} id 
 * @returns {Object|null}
 */
export function getUpgrade(id) {
    if (!UPGRADES[id]) {
        console.warn(`[UpgradesData] Invalid upgrade ID: "${id}"`);
        return null;
    }
    return JSON.parse(JSON.stringify(UPGRADES[id]));
}
