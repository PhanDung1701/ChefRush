/**
 * LevelsData - Level Goals, Customer Waves, Time Limits, and Star Thresholds
 * Redesigned for the new Overcooked 3D gameplay: Cooking, Frying, Beverages, Assembly & Dishwashing.
 */
export const LEVELS = {
    1: {
        id: 1,
        title: "Khởi Đầu Bếp Trưởng",
        subtitle: "Làm quen nướng bò trên bếp & thái rau củ tươi trên thớt",
        timeLimit: 75,
        customerCount: 6,
        spawnInterval: 12.0,
        maxActiveCustomers: 2,
        availableRecipes: ['grilled_steak', 'garden_salad'],
        targetScore: 350,
        starThresholds: [250, 450, 650],
        targetCoins: 80,
        bonusFirstClear: 50,
        hasPlateWashing: false,
        hasMultiOrder: false,
        hasBreakdowns: false,
        hasDineAndDash: false,
        shuffleIngredients: false
    },
    2: {
        id: 2,
        title: "Máy Nước Ngọt & Coca Mát Lạnh",
        subtitle: "Sử dụng máy nước ngọt rót Coca tươi mát kèm Salad giải nhiệt",
        timeLimit: 80,
        customerCount: 7,
        spawnInterval: 11.0,
        maxActiveCustomers: 3,
        availableRecipes: ['coca_drink', 'garden_salad', 'grilled_steak'],
        targetScore: 500,
        starThresholds: [400, 600, 850],
        targetCoins: 120,
        bonusFirstClear: 75,
        hasPlateWashing: false,
        hasMultiOrder: false,
        hasBreakdowns: false,
        hasDineAndDash: false,
        shuffleIngredients: false
    },
    3: {
        id: 3,
        title: "Bếp Chiên Giòn Rụm",
        subtitle: "Thái khoai tây thành que, thả vào bếp chiên vàng giòn rụm",
        timeLimit: 85,
        customerCount: 8,
        spawnInterval: 10.0,
        maxActiveCustomers: 3,
        availableRecipes: ['french_fries', 'grilled_steak', 'coca_drink'],
        targetScore: 700,
        starThresholds: [550, 800, 1100],
        targetCoins: 160,
        bonusFirstClear: 100,
        hasPlateWashing: false,
        hasMultiOrder: false,
        hasBreakdowns: false,
        hasDineAndDash: false,
        shuffleIngredients: false
    },
    4: {
        id: 4,
        title: "Combo Bò & Khoai Chiên",
        subtitle: "Kết hợp bò nướng xèo xèo và khoai tây chiên phục vụ cùng Coca",
        timeLimit: 90,
        customerCount: 10,
        spawnInterval: 9.0,
        maxActiveCustomers: 3,
        availableRecipes: ['steak_fries', 'fries_coca', 'garden_salad'],
        targetScore: 1000,
        starThresholds: [800, 1200, 1600],
        targetCoins: 220,
        bonusFirstClear: 120,
        hasPlateWashing: false,
        hasMultiOrder: false,
        hasBreakdowns: false,
        hasDineAndDash: false,
        shuffleIngredients: false
    },
    5: {
        id: 5,
        title: "Quy Trình Hoàn Hảo - Rửa Đĩa Bẩn",
        subtitle: "Giao món -> Đĩa bẩn xuất hiện! Mang ra bồn rửa giữ phím Space để rửa đĩa",
        timeLimit: 100,
        customerCount: 11,
        spawnInterval: 8.4,
        maxActiveCustomers: 3,
        availableRecipes: ['steak_fries', 'steak_salad_deluxe', 'fries_coca'],
        targetScore: 1300,
        starThresholds: [1000, 1500, 2000],
        targetCoins: 280,
        bonusFirstClear: 150,
        hasPlateWashing: true,
        hasMultiOrder: false,
        hasBreakdowns: false,
        hasDineAndDash: false,
        shuffleIngredients: false
    },
    6: {
        id: 6,
        title: "Đại Tiệc Thượng Hạng",
        subtitle: "Thực hiện món Đại Tiệc kết hợp cả Bò, Khoai chiên và Ly Coca",
        timeLimit: 110,
        customerCount: 12,
        spawnInterval: 8.0,
        maxActiveCustomers: 4,
        availableRecipes: ['deluxe_combo', 'steak_fries', 'french_fries', 'coca_drink'],
        targetScore: 1700,
        starThresholds: [1300, 1900, 2500],
        targetCoins: 360,
        bonusFirstClear: 180,
        hasPlateWashing: true,
        hasMultiOrder: false,
        hasBreakdowns: false,
        hasDineAndDash: false,
        shuffleIngredients: false
    },
    7: {
        id: 7,
        title: "Giờ Cao Điểm Bếp 3D",
        subtitle: "Khách gọi liên tục, quản lý nướng bò, chiên khoai và rửa đĩa nhịp nhàng",
        timeLimit: 115,
        customerCount: 14,
        spawnInterval: 7.6,
        maxActiveCustomers: 4,
        availableRecipes: ['deluxe_combo', 'steak_salad_deluxe', 'steak_fries', 'garden_salad'],
        targetScore: 2100,
        starThresholds: [1600, 2300, 3000],
        targetCoins: 420,
        bonusFirstClear: 200,
        hasPlateWashing: true,
        hasMultiOrder: false,
        hasBreakdowns: false,
        hasDineAndDash: false,
        shuffleIngredients: false
    },
    8: {
        id: 8,
        title: "Dây Chuyền Tốc Độ",
        subtitle: "Phối hợp ăn ý: sơ chế sẵn nguyên liệu và rửa đĩa ngay khi có đĩa bẩn",
        timeLimit: 120,
        customerCount: 15,
        spawnInterval: 7.0,
        maxActiveCustomers: 4,
        availableRecipes: ['deluxe_combo', 'steak_fries', 'fries_coca', 'steak_salad_deluxe'],
        targetScore: 2500,
        starThresholds: [2000, 2800, 3600],
        targetCoins: 500,
        bonusFirstClear: 250,
        hasPlateWashing: true,
        hasMultiOrder: false,
        hasBreakdowns: false,
        hasDineAndDash: false,
        shuffleIngredients: false
    },
    9: {
        id: 9,
        title: "Bếp Trưởng Đỉnh Cao",
        subtitle: "Thử thách tay nghề với thực đơn thượng hạng dồn dập",
        timeLimit: 120,
        customerCount: 16,
        spawnInterval: 6.4,
        maxActiveCustomers: 4,
        availableRecipes: ['deluxe_combo', 'steak_salad_deluxe', 'steak_fries', 'garden_salad', 'coca_drink'],
        targetScore: 2900,
        starThresholds: [2300, 3200, 4200],
        targetCoins: 600,
        bonusFirstClear: 300,
        hasPlateWashing: true,
        hasMultiOrder: false,
        hasBreakdowns: false,
        hasDineAndDash: false,
        shuffleIngredients: false
    },
    10: {
        id: 10,
        title: "Vua Đầu Bếp Huyền Thoại",
        subtitle: "Chinh phục đỉnh cao nhà hàng Overcooked với điểm số kỷ lục!",
        timeLimit: 130,
        customerCount: 18,
        spawnInterval: 6.0,
        maxActiveCustomers: 4,
        availableRecipes: ['deluxe_combo', 'steak_fries', 'fries_coca', 'steak_salad_deluxe', 'garden_salad'],
        targetScore: 3500,
        starThresholds: [2800, 3800, 5000],
        targetCoins: 750,
        bonusFirstClear: 500,
        hasPlateWashing: true,
        hasMultiOrder: false,
        hasBreakdowns: false,
        hasDineAndDash: false,
        shuffleIngredients: false
    }
};

/**
 * Validate level existence
 * @param {number} levelNumber 
 * @returns {boolean}
 */
export function isValidLevel(levelNumber) {
    return Boolean(levelNumber && LEVELS[levelNumber]);
}

/**
 * Get level configuration
 * @param {number} levelNumber 
 * @returns {Object|null}
 */
export function getLevelConfig(levelNumber) {
    if (!isValidLevel(levelNumber)) {
        console.warn(`[LevelsData] Invalid level number: ${levelNumber}`);
        return null;
    }
    return { ...LEVELS[levelNumber] };
}

/**
 * Calculate stars earned for score
 * @param {number} levelNumber 
 * @param {number} score 
 * @returns {number} 0, 1, 2, or 3 stars
 */
export function calculateStars(levelNumber, score) {
    const config = getLevelConfig(levelNumber);
    if (!config) return 0;
    const [star1, star2, star3] = config.starThresholds;
    if (score >= star3) return 3;
    if (score >= star2) return 2;
    if (score >= star1) return 1;
    return 0;
}

export const getLevel = getLevelConfig;
export const getTotalLevels = () => Object.keys(LEVELS).length;

