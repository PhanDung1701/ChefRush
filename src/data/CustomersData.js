/**
 * CustomersData - Customer Archetypes and Personality Traits
 * Expanded to 12 richly diverse character archetypes with distinct pacing and rewards.
 */
export const CUSTOMER_ARCHETYPES = {
    casual_diner: {
        id: 'casual_diner',
        name: 'Alex',
        title: 'Lập Trình Viên',
        description: 'Chàng coder hiền lành, thích vừa nhâm nhi burger vừa gõ phím.',
        basePatience: 64,          // Seconds of patience
        patienceRate: 1.0,         // Normal decay rate
        tipMultiplier: 1.0,
        avatarColor: '#3B82F6',
        avatarEmoji: '🧑‍💻'
    },
    busy_exec: {
        id: 'busy_exec',
        name: 'Sarah',
        title: 'Nữ Doanh Nhân',
        description: 'Giám đốc bận rộn nhiều cuộc họp, vội vàng nhưng tip cực đậm!',
        basePatience: 46,          // Shorter patience
        patienceRate: 1.25,        // Fast decay
        tipMultiplier: 1.6,        // 60% bonus tips
        avatarColor: '#EC4899',
        avatarEmoji: '💼'
    },
    grandma_joy: {
        id: 'grandma_joy',
        name: 'Bà Joy',
        title: 'Bà Cụ Nhân Từ',
        description: 'Bà cụ phúc hậu với lòng kiên nhẫn vô tận, luôn ủng hộ đầu bếp trẻ.',
        basePatience: 84,          // Very patient
        patienceRate: 0.72,        // Slow decay
        tipMultiplier: 1.15,
        avatarColor: '#F59E0B',
        avatarEmoji: '👵'
    },
    foodie_ben: {
        id: 'foodie_ben',
        name: 'Ben Sành Ăn',
        title: 'Nhà Phê Bình',
        description: 'Chuyên gia ẩm thực Michelin, chấm điểm khắt khe và chuộng combo.',
        basePatience: 54,
        patienceRate: 1.1,
        tipMultiplier: 1.35,
        avatarColor: '#8B5CF6',
        avatarEmoji: '🕶️'
    },
    gordon_chef: {
        id: 'gordon_chef',
        name: 'Bếp Trưởng Gordon',
        title: 'Vua Ẩm Thực',
        description: 'Bếp trưởng huyền thoại ghé thăm! Phục vụ nhanh sẽ nhận tiền tip khủng!',
        basePatience: 44,
        patienceRate: 1.3,
        tipMultiplier: 1.8,        // 80% bonus tips!
        avatarColor: '#EF4444',
        avatarEmoji: '👨‍🍳'
    },
    sakura_foodie: {
        id: 'sakura_foodie',
        name: 'Sakura',
        title: 'Food Reviewer',
        description: 'Cô nàng hot tiktoker thích chụp ảnh đồ ăn đẹp mắt và dễ thương.',
        basePatience: 68,
        patienceRate: 0.95,
        tipMultiplier: 1.2,
        avatarColor: '#F472B6',
        avatarEmoji: '👧'
    },
    leo_skater: {
        id: 'leo_skater',
        name: 'Leo',
        title: 'Skater Năng Động',
        description: 'Vận động viên trượt ván tuổi teen, đói cồn cào sau buổi tập.',
        basePatience: 56,
        patienceRate: 1.05,
        tipMultiplier: 1.1,
        avatarColor: '#10B981',
        avatarEmoji: '🛹'
    },
    jack_rocker: {
        id: 'jack_rocker',
        name: 'Jack',
        title: 'Guitarist Rock',
        description: 'Tay rocker cá tính, thích combo burger phô mai đẫm sốt và nước ngọt.',
        basePatience: 58,
        patienceRate: 1.0,
        tipMultiplier: 1.25,
        avatarColor: '#6366F1',
        avatarEmoji: '🎸'
    },
    arthur_detective: {
        id: 'arthur_detective',
        name: 'Arthur',
        title: 'Thám Tử Tư',
        description: 'Thám tử trầm lặng luôn ngồi góc bàn suy ngẫm phá án.',
        basePatience: 72,
        patienceRate: 0.85,
        tipMultiplier: 1.2,
        avatarColor: '#64748B',
        avatarEmoji: '🕵️'
    },
    lisa_fitness: {
        id: 'lisa_fitness',
        name: 'Lisa',
        title: 'HLV Thể Hình',
        description: 'Huấn luyện viên gym chuộng burger giàu đạm thịt bò tươi ngon.',
        basePatience: 60,
        patienceRate: 1.0,
        tipMultiplier: 1.2,
        avatarColor: '#14B8A6',
        avatarEmoji: '🏋️'
    },
    ken_gamer: {
        id: 'ken_gamer',
        name: 'Ken',
        title: 'Pro Gamer',
        description: 'Game thủ esports cần nạp năng lượng nhanh giữa các trận đấu căng thẳng.',
        basePatience: 50,
        patienceRate: 1.18,
        tipMultiplier: 1.3,
        avatarColor: '#06B6D4',
        avatarEmoji: '🎮'
    },
    maya_florist: {
        id: 'maya_florist',
        name: 'Maya',
        title: 'Nghệ Nhân Hoa',
        description: 'Cô chủ tiệm hoa tươi vui vẻ, yêu thích burger rau củ thanh đạm.',
        basePatience: 70,
        patienceRate: 0.9,
        tipMultiplier: 1.15,
        avatarColor: '#EAB308',
        avatarEmoji: '🌻'
    }
};

/**
 * Pick a random customer archetype
 * @returns {Object}
 */
export function getRandomCustomerArchetype() {
    const archetypes = Object.values(CUSTOMER_ARCHETYPES);
    const randomIndex = Math.floor(Math.random() * archetypes.length);
    return JSON.parse(JSON.stringify(archetypes[randomIndex]));
}

