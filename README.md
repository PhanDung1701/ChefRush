# Chef's Rush: Kitchen Frenzy 🍔🔥

A juicy, modern casual cooking simulation and time-management restaurant game built with high visual polish, rock-solid architecture, and zero external dependencies.

---

## 🎮 How to Play & Run

### Running Locally
To launch the game locally on your Windows machine:
1. Open PowerShell in this folder.
2. Run the included static server:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\server.ps1
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```
*(You can also double click `index.html` in any modern web browser).*

---

## 🍳 Gameplay Mechanics
1. **Grill Patties & Fry Items**: Tap raw patties or potatoes from the bottom ingredient bar to place them on the grill or fryer. Watch the cooking progress!
2. **Timing is Key**:
   - **Cooking**: Wait until the food reaches golden brown (`COOKED`).
   - **Burnt Alarm**: If you leave it on the grill too long, it turns black (`BURNT`). Burnt food must be trashed and breaks your combo!
3. **Assemble Dishes**: Tap the bottom bun to place it on an assembly plate, then tap the cooked patty to stack it. Add cheese, lettuce, or tomato as demanded by customer orders.
4. **Serve Diners**: Tap the assembled plate or customer to serve before their patience timer runs out. Fast service yields **PERFECT!** bonuses, high tips, and combo multipliers (`x2`, `x3`, `FRENZY x5`)!
5. **Upgrade Your Kitchen**: Earn coins to buy upgrades:
   - **Faster Grilling**: Speeds up cooking & frying.
   - **Cozy Atmosphere**: Increases customer patience.
   - **Premium Ingredients**: Boosts coin earnings and tips.
   - **Extra Grill Burners & Plating Trays**: Multi-task simultaneously.

---

## 🏗️ Architecture & Decoupled Design

The game follows strict **SOLID** and **Data-Driven Architecture** principles:

```
/
├── index.html                   # Semantic HTML5 container & SEO metadata
├── server.ps1                  # Ultra-reliable zero-npm local static server
├── css/
│   ├── main.css                # Color tokens, typography, tactile button states
│   ├── gameplay.css            # Kitchen layout, counter, speech bubbles, slots
│   └── ui.css                  # Modals (Menu, Level Select, Victory, Shop)
└── src/
    ├── main.js                 # Master entry point & dependency injection
    ├── core/
    │   ├── EventBus.js         # Decoupled Pub/Sub messaging
    │   ├── TimeManager.js      # RAF loop, delta-time clamping, safe timers
    │   ├── SaveManager.js      # LocalStorage with schema validation & fallback
    │   └── GameManager.js      # Game lifecycle & high-level state machine
    ├── audio/
    │   └── AudioManager.js     # Web Audio API procedural synthesizer (SFX & BGM)
    ├── data/
    │   ├── IngredientsData.js  # Catalog of raw & cookable items
    │   ├── RecipesData.js      # Dish combinations & auto-matching engine
    │   ├── LevelsData.js       # Wave pacing, targets, time limits, 1-3 stars
    │   ├── UpgradesData.js     # Tiered costs & gameplay stat multipliers
    │   └── CustomersData.js    # Archetypes, patience rates, tip bonuses
    ├── systems/
    │   ├── CookingSystem.js    # Appliance state machines & burn guards
    │   ├── AssemblySystem.js   # Plating station & recipe matcher
    │   ├── OrderSystem.js      # Urgency-based order ticketing & fulfillment
    │   ├── CustomerSystem.js   # Counter seat allocation & patience decay
    │   ├── EconomySystem.js    # Single source of truth for Coins, Scores, Combos
    │   ├── UpgradeSystem.js    # Purchase validation & stat modifier provider
    │   └── LevelSystem.js      # Wave spawner & star evaluation
    ├── ui/
    │   ├── SVGAssets.js        # Crisp inline vector food & UI illustrations
    │   └── UIManager.js        # Reactive DOM orchestrator with juice
    └── vfx/
        └── VFXManager.js       # 2D Canvas engine for steam, confetti, floaters
```

---

## 🚀 Data-Driven Extensibility

Want to add 100 new recipes or ingredients? **You do not need to touch core gameplay logic!**

### Adding a New Ingredient:
Add an entry to [`src/data/IngredientsData.js`](file:///d:/New%20folder/src/data/IngredientsData.js):
```javascript
bacon: {
    id: 'bacon',
    name: 'Crispy Bacon',
    category: 'topping',
    cookable: false,
    cost: 3,
    icon: 'bacon',
    defaultState: INGREDIENT_STATES.READY
}
```

### Adding a New Recipe:
Add an entry to [`src/data/RecipesData.js`](file:///d:/New%20folder/src/data/RecipesData.js):
```javascript
bacon_deluxe: {
    id: 'bacon_deluxe',
    name: 'Bacon Deluxe',
    ingredients: ['bun_bottom', 'beef_patty', 'cheese_slice', 'bacon'],
    basePrice: 40,
    tipMax: 20,
    scoreReward: 200
}
```
The assembly station and order system will instantly and automatically recognize, match, and validate the new recipe!

---

## 🧪 Automated Test Suites
Run and verify all unit and integration tests anytime via:
- `http://localhost:8080/test_phase2.html` (Core Systems: 21/21 passed)
- `http://localhost:8080/test_phase3.html` (Gameplay Systems: 30/30 passed)
- `http://localhost:8080/test_phase4.html` (Progression & Economy: 25/25 passed)
- `http://localhost:8080/test_integration.html` (End-to-End Simulation: 29/29 passed)
- `http://localhost:8080/test_settings_i18n.html` (Settings, Audio & i18n: 22/22 passed)

---

## 🌐 Language & Audio Settings (Cài Đặt Ngôn Ngữ & Âm Thanh)
- **Hỗ trợ Song ngữ**: Chuyển đổi mượt mà giữa **Tiếng Việt 🇻🇳** và **English 🇬🇧** trực tiếp trong game không cần tải lại trang.
- **Bật / Tắt Nhạc Nền (BGM)** & Điều chỉnh âm lượng từ 0% đến 100%.
- **Bật / Tắt Hiệu Ứng (SFX)** & Điều chỉnh âm lượng từ 0% đến 100%.
- Tự động ghi nhớ và lưu cấu hình vào `SaveManager` (LocalStorage).
- Nút Cài đặt (⚙️) có mặt ở cả Màn hình chính, thanh HUD trong trận và Menu Tạm dừng.
