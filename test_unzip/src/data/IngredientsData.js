/**
 * IngredientsData - Catalog of raw and cookable items
 * Data-driven architecture enables adding 100+ ingredients without modifying core code.
 */
export const INGREDIENT_STATES = {
    RAW: 'RAW',
    PREPPED: 'PREPPED',
    COOKING: 'COOKING',
    COOKED: 'COOKED',
    BURNT: 'BURNT',
    READY: 'READY'
};

export const INGREDIENTS = {
    raw_meat: {
        id: 'raw_meat',
        name: 'Thịt Bò Tươi',
        nameEn: 'Raw Beef',
        category: 'meat',
        cookable: true,
        appliance: 'grill',
        prepTime: 0,
        cookTime: 4.5,
        burnTime: 12.0,
        cost: 5,
        icon: '🥩',
        defaultState: INGREDIENT_STATES.RAW
    },
    grilled_meat: {
        id: 'grilled_meat',
        name: 'Thịt Bò Nướng Chín',
        nameEn: 'Grilled Beef Steak',
        category: 'meat',
        cookable: false,
        prepTime: 0,
        cookTime: 0,
        burnTime: 0,
        cost: 15,
        icon: '🥩🔥',
        defaultState: INGREDIENT_STATES.COOKED
    },
    raw_tomato: {
        id: 'raw_tomato',
        name: 'Cà Chua Nguyên Quả',
        nameEn: 'Whole Tomato',
        category: 'vegetable',
        chopTime: 3.0,
        cost: 2,
        icon: '🍅',
        defaultState: INGREDIENT_STATES.RAW
    },
    sliced_tomato: {
        id: 'sliced_tomato',
        name: 'Cà Chua Thái Lát',
        nameEn: 'Sliced Tomato',
        category: 'vegetable',
        cost: 8,
        icon: '🍅✨',
        defaultState: INGREDIENT_STATES.READY
    },
    raw_cucumber: {
        id: 'raw_cucumber',
        name: 'Dưa Chuột Nguyên Trái',
        nameEn: 'Whole Cucumber',
        category: 'vegetable',
        chopTime: 3.0,
        cost: 2,
        icon: '🥒',
        defaultState: INGREDIENT_STATES.RAW
    },
    sliced_cucumber: {
        id: 'sliced_cucumber',
        name: 'Dưa Chuột Thái Lát',
        nameEn: 'Sliced Cucumber',
        category: 'vegetable',
        cost: 8,
        icon: '🥒✨',
        defaultState: INGREDIENT_STATES.READY
    },
    plate: {
        id: 'plate',
        name: 'Đĩa Sạch',
        nameEn: 'Clean Plate',
        category: 'plate',
        cost: 0,
        icon: '🍽️',
        defaultState: INGREDIENT_STATES.READY
    },
    raw_potato: {
        id: 'raw_potato',
        name: 'Khoai Tây Nguyên Củ',
        nameEn: 'Raw Potato',
        category: 'vegetable',
        chopTime: 2.2,
        cost: 2,
        icon: '🥔',
        defaultState: INGREDIENT_STATES.RAW
    },
    sliced_potato: {
        id: 'sliced_potato',
        name: 'Khoai Tây Cắt Que',
        nameEn: 'Potato Strips',
        category: 'vegetable',
        cookable: true,
        appliance: 'fryer',
        cookTime: 3.5,
        burnTime: 12.0,
        cost: 5,
        icon: '🍟',
        defaultState: INGREDIENT_STATES.PREPPED
    },
    french_fries: {
        id: 'french_fries',
        name: 'Khoai Tây Chiên Giòn',
        nameEn: 'Crispy French Fries',
        category: 'snack',
        cost: 15,
        icon: '🍟',
        defaultState: INGREDIENT_STATES.COOKED
    },
    coca_drink: {
        id: 'coca_drink',
        name: 'Ly Nước Coca Mát Lạnh',
        nameEn: 'Ice-Cold Coca',
        category: 'drink',
        cost: 12,
        icon: '🥤',
        defaultState: INGREDIENT_STATES.READY
    },
    dirty_plate: {
        id: 'dirty_plate',
        name: 'Đĩa Bẩn Cần Rửa',
        nameEn: 'Dirty Plate',
        category: 'plate',
        washTime: 1.8,
        cost: 0,
        icon: '🍽️💧',
        defaultState: INGREDIENT_STATES.RAW
    },
    // Keep legacy items for fallback compatibility
    beef_patty: {
        id: 'beef_patty',
        name: 'Beef Patty',
        category: 'meat',
        cookable: true,
        appliance: 'grill',
        prepTime: 0,
        cookTime: 4.8,
        burnTime: 16.0,
        cost: 5,
        icon: 'beef_patty',
        defaultState: INGREDIENT_STATES.RAW
    },
    tomato_slice: {
        id: 'tomato_slice',
        name: 'Ripe Tomato',
        category: 'topping',
        cookable: false,
        cost: 2,
        icon: 'tomato_slice',
        defaultState: INGREDIENT_STATES.READY
    }
};

/**
 * Validate ingredient data existence
 * @param {string} id 
 * @returns {boolean}
 */
export function isValidIngredient(id) {
    return Boolean(id && INGREDIENTS[id]);
}

/**
 * Safe getter for ingredient data
 * @param {string} id 
 * @returns {Object|null}
 */
export function getIngredient(id) {
    if (!isValidIngredient(id)) {
        console.warn(`[IngredientsData] Invalid ingredient ID: "${id}"`);
        return null;
    }
    return { ...INGREDIENTS[id] };
}
