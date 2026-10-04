/**
 * RecipesData - Declarative Recipe Book
 * Decouples dish composition from cooking and serving logic.
 */
export const RECIPES = {
    // Overcooked 3D Recipes
    steak_salad_deluxe: {
        id: 'steak_salad_deluxe',
        name: 'Deluxe Steak Salad',
        nameVi: 'Bò Nướng & Salad Thượng Hạng',
        category: 'main',
        ingredients: ['grilled_meat', 'sliced_tomato', 'sliced_cucumber'],
        ingredientDetails: [
            { id: 'grilled_meat', name: 'Thịt Bò Nướng', icon: '🥩' },
            { id: 'sliced_tomato', name: 'Cà Chua Thái', icon: '🍅' },
            { id: 'sliced_cucumber', name: 'Dưa Chuột Thái', icon: '🥒' }
        ],
        basePrice: 50,
        tipMax: 20,
        scoreReward: 200,
        icon: '🥩🥗',
        description: 'Thịt bò nướng thơm lừng kết hợp cà chua và dưa chuột thái tươi giòn.'
    },
    garden_salad: {
        id: 'garden_salad',
        name: 'Fresh Garden Salad',
        nameVi: 'Salad Cà Chua Dưa Chuột',
        category: 'salad',
        ingredients: ['sliced_tomato', 'sliced_cucumber'],
        ingredientDetails: [
            { id: 'sliced_tomato', name: 'Cà Chua Thái', icon: '🍅' },
            { id: 'sliced_cucumber', name: 'Dưa Chuột Thái', icon: '🥒' }
        ],
        basePrice: 30,
        tipMax: 12,
        scoreReward: 120,
        icon: '🥗',
        description: 'Đĩa salad tươi mát thanh đạm từ cà chua và dưa chuột giòn rụm.'
    },
    steak_tomato: {
        id: 'steak_tomato',
        name: 'Steak & Sliced Tomato',
        nameVi: 'Bò Nướng Kèm Cà Chua',
        category: 'main',
        ingredients: ['grilled_meat', 'sliced_tomato'],
        ingredientDetails: [
            { id: 'grilled_meat', name: 'Thịt Bò Nướng', icon: '🥩' },
            { id: 'sliced_tomato', name: 'Cà Chua Thái', icon: '🍅' }
        ],
        basePrice: 40,
        tipMax: 15,
        scoreReward: 150,
        icon: '🥩🍅',
        description: 'Bò nướng xèo xèo ăn kèm cà chua thái lát mọng nước.'
    },
    steak_cucumber: {
        id: 'steak_cucumber',
        name: 'Steak & Cucumber',
        nameVi: 'Bò Nướng Kèm Dưa Chuột',
        category: 'main',
        ingredients: ['grilled_meat', 'sliced_cucumber'],
        ingredientDetails: [
            { id: 'grilled_meat', name: 'Thịt Bò Nướng', icon: '🥩' },
            { id: 'sliced_cucumber', name: 'Dưa Chuột Thái', icon: '🥒' }
        ],
        basePrice: 40,
        tipMax: 15,
        scoreReward: 150,
        icon: '🥩🥒',
        description: 'Bò nướng chín tới cùng lát dưa chuột thanh mát.'
    },
    grilled_steak: {
        id: 'grilled_steak',
        name: 'Grilled Beef Steak',
        nameVi: 'Bò Bít Tết Nướng',
        category: 'main',
        ingredients: ['grilled_meat'],
        ingredientDetails: [
            { id: 'grilled_meat', name: 'Thịt Bò Nướng', icon: '🥩' }
        ],
        basePrice: 28,
        tipMax: 10,
        scoreReward: 100,
        icon: '🥩🔥',
        description: 'Miếng thịt bò nướng vàng rộm xèo xèo trên đĩa sứ trắng.'
    },
    sliced_tomato_plate: {
        id: 'sliced_tomato_plate',
        name: 'Sliced Tomato Plate',
        nameVi: 'Đĩa Cà Chua Thái Lát',
        category: 'side',
        ingredients: ['sliced_tomato'],
        ingredientDetails: [
            { id: 'sliced_tomato', name: 'Cà Chua Thái', icon: '🍅' }
        ],
        basePrice: 20,
        tipMax: 8,
        scoreReward: 80,
        icon: '🍅✨',
        description: 'Cà chua đỏ mọng được thái lát mỏng bày đẹp mắt trên đĩa.'
    },
    sliced_cucumber_plate: {
        id: 'sliced_cucumber_plate',
        name: 'Sliced Cucumber Plate',
        nameVi: 'Đĩa Dưa Chuột Thái Lát',
        category: 'side',
        ingredients: ['sliced_cucumber'],
        ingredientDetails: [
            { id: 'sliced_cucumber', name: 'Dưa Chuột Thái', icon: '🥒' }
        ],
        basePrice: 20,
        tipMax: 8,
        scoreReward: 80,
        icon: '🥒✨',
        description: 'Dưa chuột thanh mát tươi xanh thái lát tròn đều.'
    },

    // French Fries Recipe
    french_fries: {
        id: 'french_fries',
        name: 'Crispy French Fries',
        nameVi: 'Khoai Tây Chiên Giòn',
        category: 'snack',
        ingredients: ['french_fries'],
        ingredientDetails: [
            { id: 'french_fries', name: 'Khoai Tây Chiên', icon: '🍟' }
        ],
        basePrice: 25,
        tipMax: 10,
        scoreReward: 120,
        icon: '🍟',
        description: 'Khoai tây cắt que chiên ngập dầu vàng ươm giòn rụm.'
    },
    // Ice-Cold Coca Recipe
    coca_drink: {
        id: 'coca_drink',
        name: 'Ice-Cold Coca Cola',
        nameVi: 'Ly Coca Mát Lạnh',
        category: 'drink',
        ingredients: ['coca_drink'],
        ingredientDetails: [
            { id: 'coca_drink', name: 'Nước Ngọt Coca', icon: '🥤' }
        ],
        basePrice: 20,
        tipMax: 8,
        scoreReward: 90,
        icon: '🥤',
        description: 'Ly nước ngọt có ga mát lạnh với đá viên sảng khoái.'
    },
    // Steak & French Fries Combo
    steak_fries: {
        id: 'steak_fries',
        name: 'Steak & Crispy Fries',
        nameVi: 'Bò Bít Tết & Khoai Chiên',
        category: 'main',
        ingredients: ['grilled_meat', 'french_fries'],
        ingredientDetails: [
            { id: 'grilled_meat', name: 'Thịt Bò Nướng', icon: '🥩' },
            { id: 'french_fries', name: 'Khoai Chiên Giòn', icon: '🍟' }
        ],
        basePrice: 55,
        tipMax: 20,
        scoreReward: 220,
        icon: '🥩🍟',
        description: 'Bò nướng xèo xèo thơm phức ăn cùng khoai tây chiên giòn tan.'
    },
    // Fries & Coca Combo
    fries_coca: {
        id: 'fries_coca',
        name: 'Fries & Coca Set',
        nameVi: 'Khoai Chiên Kèm Coca',
        category: 'snack',
        ingredients: ['french_fries', 'coca_drink'],
        ingredientDetails: [
            { id: 'french_fries', name: 'Khoai Chiên Giòn', icon: '🍟' },
            { id: 'coca_drink', name: 'Ly Coca Lạnh', icon: '🥤' }
        ],
        basePrice: 42,
        tipMax: 15,
        scoreReward: 180,
        icon: '🍟🥤',
        description: 'Combo khoai tây chiên giòn rụm và ly Coca tươi mát sủi bọt.'
    },
    // Deluxe Combo: Steak + Fries + Coca
    deluxe_combo: {
        id: 'deluxe_combo',
        name: 'Master Deluxe Feast',
        nameVi: 'Đại Tiệc Bò, Khoai & Coca',
        category: 'main',
        ingredients: ['grilled_meat', 'french_fries', 'coca_drink'],
        ingredientDetails: [
            { id: 'grilled_meat', name: 'Thịt Bò Nướng', icon: '🥩' },
            { id: 'french_fries', name: 'Khoai Chiên Giòn', icon: '🍟' },
            { id: 'coca_drink', name: 'Ly Coca Lạnh', icon: '🥤' }
        ],
        basePrice: 75,
        tipMax: 30,
        scoreReward: 320,
        icon: '🥩🍟🥤',
        description: 'Set ăn thượng hạng kết hợp trọn vẹn Bò Bít Tết, Khoai Chiên và Coca mát lạnh.'
    },
    // Legacy fallbacks
    classic_burger: {
        id: 'classic_burger',
        name: 'Classic Burger',
        nameVi: 'Burger Bò Cổ Điển',
        category: 'burger',
        ingredients: ['grilled_meat'],
        ingredientDetails: [
            { id: 'grilled_meat', name: 'Thịt Bò Nướng', icon: '🥩' }
        ],
        basePrice: 20,
        tipMax: 10,
        scoreReward: 100,
        icon: '🍔',
        description: 'Bò nướng thơm phức.'
    }
};

/**
 * Validate recipe existence
 * @param {string} id 
 * @returns {boolean}
 */
export function isValidRecipe(id) {
    return Boolean(id && RECIPES[id]);
}

/**
 * Get a recipe definition
 * @param {string} id 
 * @returns {Object|null}
 */
export function getRecipe(id) {
    if (!isValidRecipe(id)) {
        console.warn(`[RecipesData] Invalid recipe ID: "${id}"`);
        return null;
    }
    return { ...RECIPES[id], ingredients: [...RECIPES[id].ingredients] };
}

/**
 * Match a set of assembled ingredients with known recipes
 * @param {string[]} ingredientIds Array of ingredient IDs present on a plate
 * @returns {Object|null} Matching recipe or null if incomplete/mismatched
 */
export function findMatchingRecipe(ingredientIds) {
    if (!Array.isArray(ingredientIds) || ingredientIds.length === 0) return null;

    const sortedInput = [...ingredientIds].sort();

    for (const recipe of Object.values(RECIPES)) {
        if (recipe.ingredients.length !== sortedInput.length) continue;

        const sortedRecipe = [...recipe.ingredients].sort();
        const isMatch = sortedRecipe.every((ingId, idx) => ingId === sortedInput[idx]);
        if (isMatch) {
            return { ...recipe };
        }
    }
    return null;
}

/**
 * Step-by-step detailed preparation guides for each dish
 */
export const DISH_TUTORIAL_GUIDES = {
    classic_burger: {
        id: 'classic_burger',
        nameVi: 'Burger Bò Cổ Điển',
        nameEn: 'Classic Beef Burger',
        price: 20,
        score: 100,
        difficultyVi: 'Cơ Bản (2 Nguyên liệu)',
        difficultyEn: 'Basic (2 Ingredients)',
        iconKey: 'classic_burger',
        stepsVi: [
            { num: 1, action: '🥩 Nướng Thịt Bò', desc: 'Chạm khay Thịt Bò ở thanh dưới để đặt lên bếp nướng. Chờ thịt chín vàng đến khi xuất hiện nhãn "✨ ĐÃ CHÍN".' },
            { num: 2, action: '🍞 Đặt Bánh Mì Đáy', desc: 'Chạm khay Bánh Mì ở thanh dưới để đặt lên một đĩa sạch trên Bàn Ghép Món.' },
            { num: 3, action: '✨ Gắp Thịt Lên Bánh', desc: 'Chạm vào miếng thịt bò đã chín trên bếp để gắp đặt lên miếng bánh mì đáy.' },
            { num: 4, action: '🛎️ Phục Vụ Khách Hàng', desc: 'Chạm vào đĩa burger hoàn chỉnh hoặc chạm vào thực khách đang đợi để giao món và nhận tiền vàng!' }
        ],
        stepsEn: [
            { num: 1, action: '🥩 Grill Beef Patty', desc: 'Tap raw beef patty from the bottom bar to place on grill. Watch it cook until "READY" appears.' },
            { num: 2, action: '🍞 Place Bottom Bun', desc: 'Tap bottom bun from the bottom bar to place onto a clean assembly tray.' },
            { num: 3, action: '✨ Stack Cooked Patty', desc: 'Tap the cooked patty on the stove to stack it on top of the bottom bun.' },
            { num: 4, action: '🛎️ Serve Customer', desc: 'Tap the finished burger plate or waiting diner to deliver and collect your coins!' }
        ],
        proTipVi: '💡 Mẹo: Có thể nướng sẵn 2 miếng thịt bò trên vỉ trước khi khách tới để giao món nhanh như chớp!',
        proTipEn: '💡 Pro Tip: Pre-grill patties in advance so you can serve hungry diners instantly!'
    },
    cheese_burger: {
        id: 'cheese_burger',
        nameVi: 'Burger Phô Mai Tan Chảy',
        nameEn: 'Golden Cheeseburger',
        price: 25,
        score: 130,
        difficultyVi: 'Trung Bình (3 Nguyên liệu)',
        difficultyEn: 'Medium (3 Ingredients)',
        iconKey: 'cheese_burger',
        stepsVi: [
            { num: 1, action: '🥩 Nướng Bò & Bánh Mì', desc: 'Thao tác tương tự Burger Bò: Nướng thịt bò chín tới và đặt bánh mì đáy lên đĩa sạch.' },
            { num: 2, action: '🥩 Gắp Thịt Chín Lên Bánh', desc: 'Chạm vào thịt bò chín để gắp đặt lên bánh mì đáy.' },
            { num: 3, action: '🧀 Thêm Lát Phô Mai', desc: 'Chạm vào khay Phô Mai ở thanh dưới để xếp một lát phô mai cheddar vàng óng lên miếng thịt nóng.' },
            { num: 4, action: '🛎️ Giao Món Cheeseburger', desc: 'Chạm vào đĩa bánh hoàn chỉnh để phục vụ khách, nhận $25 và điểm combo!' }
        ],
        stepsEn: [
            { num: 1, action: '🥩 Grill Patty & Place Bun', desc: 'Grill patty to perfection and place bottom bun on a clean tray.' },
            { num: 2, action: '🥩 Stack Cooked Patty', desc: 'Tap cooked patty to stack it onto the bottom bun.' },
            { num: 3, action: '🧀 Add Golden Cheese', desc: 'Tap cheddar cheese slice from the bottom bar to melt over the hot beef patty.' },
            { num: 4, action: '🛎️ Serve Cheeseburger', desc: 'Tap the completed cheeseburger plate to serve, earning $25 and combo bonuses!' }
        ],
        proTipVi: '💡 Mẹo: Nhớ đặt thịt bò lên bánh mì trước thì mới cho được phô mai vào đĩa.',
        proTipEn: '💡 Pro Tip: Always stack the patty onto the bun before adding cheese.'
    },
    french_fries: {
        id: 'french_fries',
        nameVi: 'Khoai Tây Chiên Giòn Rụm',
        nameEn: 'Crispy French Fries',
        price: 15,
        score: 80,
        difficultyVi: 'Rất Dễ (Phục vụ trực tiếp)',
        difficultyEn: 'Very Easy (Direct Serve)',
        iconKey: 'french_fries',
        stepsVi: [
            { num: 1, action: '🍟 Thả Khoai Vào Bếp Chiên', desc: 'Chạm vào khay Khoai Tây ở thanh dưới để thả phần khoai tươi vào giỏ bếp chiên.' },
            { num: 2, action: '🫧 Canh Khoai Chín Vàng', desc: 'Dầu sôi xèo xèo. Hãy quan sát thanh tiến trình cho đến khi hiện chữ "✨ ĐÃ CHÍN".' },
            { num: 3, action: '🛎️ Giao Trực Tiếp Cho Khách', desc: 'Chạm trực tiếp vào bếp chiên (hoặc khách đang gọi khoai) để giao ngay mà KHÔNG CẦN đĩa sạch!' }
        ],
        stepsEn: [
            { num: 1, action: '🍟 Drop into Deep Fryer', desc: 'Tap raw potatoes from the bottom bar to drop them into the deep fryer basket.' },
            { num: 2, action: '🫧 Watch It Fry', desc: 'Oil sizzles with bubbles. Watch the progress bar until it shows "READY".' },
            { num: 3, action: '🛎️ Serve Directly to Diner', desc: 'Tap deep fryer directly to serve to diner without needing a clean plate!' }
        ],
        proTipVi: '💡 Mẹo: Khoai chiên không bao giờ tốn đĩa sạch ở bàn ghép món. Nhưng nhớ gắp ra kẻo bị cháy khét nhé!',
        proTipEn: '💡 Pro Tip: Fries never consume clean plates, but remember to collect them before they burn!'
    },
    fizzy_soda: {
        id: 'fizzy_soda',
        nameVi: 'Nước Ngọt Có Ga Mát Lạnh',
        nameEn: 'Ice-Cold Fizzy Soda',
        price: 12,
        score: 60,
        difficultyVi: 'Rất Dễ (Không bao giờ cháy)',
        difficultyEn: 'Very Easy (Never Burns)',
        iconKey: 'fizzy_soda',
        stepsVi: [
            { num: 1, action: '🥤 Đặt Ly Vào Máy Rót', desc: 'Chạm vào khay Ly Nước ở thanh dưới để đặt ly rỗng vào vòi máy rót nước ngọt.' },
            { num: 2, action: '💧 Tự Động Rót Đầy', desc: 'Máy tự động rót dòng nước mát lạnh sủi bọt, đợi vài giây cho đến khi hiện chữ "🥤 ĐẦY LY".' },
            { num: 3, action: '🛎️ Phục Vụ Khách Hàng', desc: 'Chạm trực tiếp vào máy nước để giao ly nước ngọt cho thực khách.' }
        ],
        stepsEn: [
            { num: 1, action: '🥤 Place Cup in Dispenser', desc: 'Tap empty soda cup from the bottom bar to place into soda dispenser.' },
            { num: 2, action: '💧 Automatic Pouring', desc: 'Dispenser automatically pours refreshing bubbly soda until "FULL" appears.' },
            { num: 3, action: '🛎️ Serve to Diner', desc: 'Tap the dispenser directly to deliver refreshing drink to customer.' }
        ],
        proTipVi: '💡 Mẹo: Nước ngọt KHÔNG BAO GIỜ BỊ CHÁY! Hãy luôn luôn rót sẵn một ly để khách gọi là giao được ngay!',
        proTipEn: '💡 Pro Tip: Soda NEVER burns! Always keep a cup poured and ready to deliver instantly.'
    },
    deluxe_burger: {
        id: 'deluxe_burger',
        nameVi: 'Burger Thượng Hạng (Deluxe)',
        nameEn: 'Master Deluxe Burger',
        price: 35,
        score: 180,
        difficultyVi: 'Thử Thách Cao Cấp (5 Tầng Topping)',
        difficultyEn: 'Master Tier (5 Layers)',
        iconKey: 'deluxe_burger',
        stepsVi: [
            { num: 1, action: '🍞 Đặt Bánh Mì Đáy', desc: 'Chạm khay Bánh Mì đặt lên đĩa sạch trên Bàn Ghép Món.' },
            { num: 2, action: '🥩 Nướng & Xếp Thịt Bò', desc: 'Nướng thịt bò chín tới trên bếp rồi gắp đặt lên bánh mì.' },
            { num: 3, action: '🧀 Thêm Lát Phô Mai', desc: 'Chạm Phô Mai ở khay dưới để xếp lên thịt.' },
            { num: 4, action: '🥬 Thêm Rau Diếp Tươi', desc: 'Chạm khay Rau Diếp ở thanh dưới để xếp tầng rau xanh giòn ngọt mát.' },
            { num: 5, action: '🍅 Thêm Lát Cà Chua', desc: 'Chạm khay Cà Chua ở thanh dưới để hoàn thiện lát cà chua mọng nước đỏ tươi.' },
            { num: 6, action: '🛎️ Giao Siêu Phẩm Thượng Hạng', desc: 'Chạm đĩa hoàn chỉnh để phục vụ khách, nhận tới $35 và điểm thưởng combo khổng lồ!' }
        ],
        stepsEn: [
            { num: 1, action: '🍞 Place Bottom Bun', desc: 'Tap bottom bun to place on a clean prep tray.' },
            { num: 2, action: '🥩 Grill & Stack Patty', desc: 'Grill patty to perfection and place onto the bun.' },
            { num: 3, action: '🧀 Add Cheese Slice', desc: 'Tap cheese slice to place on top of the hot patty.' },
            { num: 4, action: '🥬 Add Crispy Lettuce', desc: 'Tap fresh lettuce to add a crisp green layer.' },
            { num: 5, action: '🍅 Add Ripe Tomato', desc: 'Tap tomato slice to complete the supreme burger.' },
            { num: 6, action: '🛎️ Deliver Deluxe Feast', desc: 'Tap completed plate to serve, earning $35 and massive combo score!' }
        ],
        proTipVi: '💡 Mẹo: Món ăn đắt giá nhất nhà hàng! Hãy nướng thịt trước và chuẩn bị sẵn đĩa sạch để ghép thật nhanh khi khách gọi.',
        proTipEn: '💡 Pro Tip: The highest earning recipe in the restaurant! Pre-grill patties to assemble rapidly when ordered.'
    }
};
