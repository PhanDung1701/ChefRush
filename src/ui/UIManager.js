/**
 * UIManager - High-Level DOM Presentation and User Interaction Orchestrator
 * Connects Game Systems, EventBus, Audio, and VFX with reactive visual components.
 */
import { SVG_ICONS, SVG_FOOD, getAssembledDishSvg } from './SVGAssets.js';
import { getCustomerCharacterSvg } from './CustomerAvatars.js';
import { GAME_STATES } from '../core/GameManager.js';
import { APPLIANCE_SLOT_STATES } from '../systems/CookingSystem.js';
import { CUSTOMER_STATES } from '../systems/CustomerSystem.js';
import { UPGRADES } from '../data/UpgradesData.js';
import { getTotalLevels, getLevel } from '../data/LevelsData.js';
import { globalLocalizationManager } from '../core/LocalizationManager.js';

import { DishwashingSystem } from '../systems/DishwashingSystem.js';
import { DISH_TUTORIAL_GUIDES, findMatchingRecipe } from '../data/RecipesData.js';
import { Kitchen3DScene } from '../kitchen3d/Kitchen3DScene.js';
import { InputController } from '../kitchen3d/InputController.js';

export class UIManager {
    constructor({ gameManager, cookingSystem, assemblySystem, dishwashingSystem, orderSystem, customerSystem, economySystem, levelSystem, upgradeSystem, audioManager, vfxManager, localizationManager = globalLocalizationManager }) {
        this.gm = gameManager;
        this.cookingSystem = cookingSystem;
        this.assemblySystem = assemblySystem;
        this.dishwashingSystem = dishwashingSystem || new DishwashingSystem(this.gm?.eventBus);
        this.orderSystem = orderSystem;
        this.customerSystem = customerSystem;
        this.economySystem = economySystem;
        this.levelSystem = levelSystem;
        this.upgradeSystem = upgradeSystem;
        this.audio = audioManager;
        this.vfx = vfxManager;
        this.loc = localizationManager;

        this.container = null;
        this.selectedPlateIndex = 0;
        this.currentGuideDishId = 'classic_burger';
        this.tutorialGuideDishes = ['classic_burger', 'cheese_burger', 'french_fries', 'fizzy_soda', 'deluxe_burger'];
        this.currentTutorialDishIndex = 0;

        // 3D Overcooked System References
        this.kitchen3D = null;
        this.inputController = null;
    }

    /**
     * Mount UIManager onto the root DOM container
     * @param {HTMLElement} container 
     */
    init(container) {
        this.container = container;
        this.renderShell();
        this.bindEvents();
        this.bindSystemEvents();
        this.updateAllTexts();
        this.updateSettingsControls();
        this.renderDishGuideDetail('classic_burger');
        this.init3DKitchen();
    }

    /**
     * Render base semantic layout inside container
     */
    renderShell() {
        this.container.innerHTML = `
            <!-- Floating Mobile Landscape Tip (chỉ hiện khi cầm dọc điện thoại) -->
            <div class="mobile-rotate-pill" id="mobile-rotate-pill">
                <span>🔄 Xoay ngang máy để chơi đã hơn!</span>
                <button class="rotate-pill-close" id="btn-close-rotate-pill" title="Đóng">✕</button>
            </div>

            <!-- Floating In-Game Real-Time Mechanic Alert Banner -->
            <div class="gameplay-mechanic-callout" id="gameplay-mechanic-callout" style="display: none;">
                <div class="callout-inner">
                    <span class="callout-icon" id="callout-icon">💡</span>
                    <div class="callout-body">
                        <div class="callout-title" id="callout-title">THÔNG BÁO CƠ CHẾ</div>
                        <div class="callout-desc" id="callout-desc">Hướng dẫn thao tác</div>
                    </div>
                    <button class="callout-dismiss-btn" id="callout-dismiss-btn">✕</button>
                </div>
            </div>

            <!-- Top HUD Bar -->
            <header class="game-hud" id="game-hud">
                <div class="hud-group">
                    <button class="btn btn-icon" id="btn-pause" title="Pause">${SVG_ICONS.clock}</button>
                    <div class="hud-badge coins">
                        ${SVG_ICONS.coin}
                        <span id="hud-coins">0</span>

                    </div>
                    <div class="hud-badge score">
                        ${SVG_ICONS.star}
                        <span id="hud-score">0</span>
                    </div>
                </div>

                <div class="hud-group">
                    <div class="combo-badge" id="hud-combo" style="display: none;">
                        COMBO <span id="hud-combo-val">x1</span>
                    </div>
                </div>

                <div class="hud-group">
                    <div class="hud-badge timer" id="hud-timer-badge">
                        ${SVG_ICONS.clock}
                        <span id="hud-timer">60</span>s
                    </div>
                    <button class="btn btn-icon" id="btn-controls-guide-hud" title="Hướng dẫn phím điều khiển">❓</button>
                    <button class="btn btn-icon" id="btn-settings-hud" title="Cài đặt">⚙️</button>
                    <button class="btn btn-icon" id="btn-sound" title="Âm thanh">🔊</button>
                </div>
            </header>

            <!-- 3D Overcooked Kitchen Canvas Viewport -->
            <div id="kitchen-3d-viewport"></div>

            <!-- Overcooked Active Orders Bar with Recipe Ingredients (Left Sidebar) -->
            <div class="overcooked-orders-bar" id="overcooked-orders-bar"></div>

            <!-- Contextual Station Action Prompt Hint -->
            <div class="station-prompt-pill" id="station-prompt-pill" style="display: none;">
                <span class="station-prompt-text" id="station-prompt-text"></span>
                <span class="station-prompt-badge" id="station-prompt-badge"></span>
            </div>

            <!-- Multi-directional Virtual Joystick (Bottom Left) -->
            <div class="virtual-joystick-container" id="virtual-joystick-container">
                <div class="joystick-base" id="joystick-base">
                    <div class="joystick-thumb" id="joystick-thumb">🕹️</div>
                </div>
                <div class="joystick-guide-label">DI CHUYỂN (WASD)</div>
            </div>

            <!-- Virtual Action Buttons (Bottom Right) -->
            <div class="virtual-actions-container" id="virtual-actions-container">
                <div class="action-btn-wrapper">
                    <button class="action-round-btn btn-dash" id="btn-action-dash" title="Tăng tốc chạy (Shift)">
                        <span class="action-btn-icon">⚡</span>
                    </button>
                    <span class="action-btn-label">TĂNG TỐC</span>
                    <span class="action-key-hint">Phím Shift</span>
                </div>
                <div class="action-btn-wrapper">
                    <button class="action-round-btn btn-chop" id="btn-action-chop" title="Thái rau củ & Rửa đĩa (Space)">
                        <span class="action-btn-icon">🔪</span>
                    </button>
                    <span class="action-btn-label">THÁI / RỬA</span>
                    <span class="action-key-hint">Phím Space</span>
                </div>
                <div class="action-btn-wrapper">
                    <button class="action-round-btn btn-interact" id="btn-action-interact" title="Cầm / Đặt / Lấy đồ (Phím E)">
                        <span class="action-btn-icon">✋</span>
                    </button>
                    <span class="action-btn-label">CẦM / ĐẶT</span>
                    <span class="action-key-hint">Phím E</span>
                </div>
            </div>

            <!-- Hidden container for legacy DOM element bindings to prevent null errors -->
            <div id="legacy-dom-hidden" style="display: none;">
                <section class="customer-counter" id="customer-counter">
                    <div class="counter-seat" data-seat="0" id="seat-0"></div>
                    <div class="counter-seat" data-seat="1" id="seat-1"></div>
                    <div class="counter-seat" data-seat="2" id="seat-2"></div>
                </section>
                <div class="tutorial-guide-bar" id="tutorial-guide-bar">
                    <span id="tut-step-num"></span><span id="tut-guide-text"></span>
                </div>
                <main class="kitchen-area" id="kitchen-area">
                    <div id="grill-slots"></div>
                    <div id="fryer-slots"></div>
                    <div id="dispenser-slots"></div>
                    <div id="assembly-plates"></div>
                    <div id="sink-station">
                        <span id="sink-clean-badge"></span>
                        <span id="sink-dirty-badge"></span>
                        <div id="sink-progress-fill"></div>
                    </div>
                    <div id="trash-bin"></div>
                </main>
                <nav class="ingredients-bar" id="ingredients-bar"></nav>
            </div>

            <!-- UI OVERLAYS -->
            <!-- 1. Main Menu -->
            <div class="ui-overlay" id="overlay-main-menu">
                <div class="modal-card">
                    <div class="main-menu-logo">
                        <div class="logo-icon">${SVG_FOOD.deluxe_burger || SVG_FOOD.beef_patty_cooked}</div>
                        <h1 class="logo-text">CHEF'S RUSH</h1>
                        <span class="logo-subtext" id="game-subtitle">Bếp Trưởng Tài Ba</span>
                    </div>
                    <div class="menu-actions">
                        <button class="btn btn-primary" id="btn-play-game">CHƠI NGAY</button>
                        <button class="btn btn-gold" id="btn-open-shop">NÂNG CẤP</button>
                        <button class="btn btn-mint" id="btn-how-to-play">CÁCH CHƠI</button>
                        <button class="btn btn-mint" id="btn-open-settings">⚙️ CÀI ĐẶT</button>
                    </div>
                </div>
            </div>

            <!-- 2. Level Select -->
            <div class="ui-overlay" id="overlay-level-select">
                <div class="modal-card">
                    <h2 class="modal-title" id="level-select-title">CHỌN MÀN CHƠI</h2>
                    <p class="modal-subtitle" id="level-select-subtitle">Chọn màn để bắt đầu vào bếp</p>

                    <!-- Dedicated Tutorial Level 0 Banner -->
                    <div class="tutorial-level-banner" id="tutorial-level-banner">
                        <div class="tut-banner-left">
                            <span class="tut-banner-badge">🎓 MÀN HƯỚNG DẪN</span>
                            <h3 class="tut-banner-title" id="tut-banner-title">Bếp Tập Sự (Kitchen Academy)</h3>
                            <p class="tut-banner-sub" id="tut-banner-sub">Làm quen toàn bộ thao tác nướng thịt, ghép món, rửa bát & phục vụ không áp lực!</p>
                        </div>
                        <button class="btn btn-mint btn-sm" id="btn-start-tutorial" style="white-space: nowrap; font-weight: 800;">VÀO BẾP TẬP SỰ</button>
                    </div>

                    <div class="levels-grid" id="levels-grid"></div>
                    <button class="btn btn-mint" id="btn-back-to-menu">QUAY LẠI</button>
                </div>
            </div>

            <!-- 3. Level Intro & Controls Guide (Requirement 8) -->
            <div class="ui-overlay" id="overlay-level-intro">
                <div class="controls-guide-card">
                    <div class="controls-guide-header">
                        <h2 class="controls-guide-title" id="intro-title">MÀN 1</h2>
                        <p class="controls-guide-subtitle" id="intro-subtitle">Mục tiêu màn chơi</p>
                    </div>

                    <div class="stats-summary-box" style="margin: 0;">
                        <div class="stat-item">
                            <span class="stat-label" id="intro-target-coins-label">Chỉ Tiêu Tiền</span>
                            <span class="stat-value" id="intro-target-coins">60</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label" id="intro-time-limit-label">Thời Gian</span>
                            <span class="stat-value" id="intro-time-limit">60s</span>
                        </div>
                    </div>

                    <!-- PC Keys Grid -->
                    <div class="pc-keys-grid">
                        <div class="pc-key-card">
                            <div class="key-cap">W A S D</div>
                            <div class="key-desc">
                                <span class="key-desc-title">Di Chuyển</span>
                                <span class="key-desc-detail">Hoặc 4 phím mũi tên</span>
                            </div>
                        </div>
                        <div class="pc-key-card">
                            <div class="key-cap">Phím E</div>
                            <div class="key-desc">
                                <span class="key-desc-title">Cầm / Đặt / Rót Coca</span>
                                <span class="key-desc-detail">Cầm đĩa, nướng bò, thả khoai</span>
                            </div>
                        </div>
                        <div class="pc-key-card">
                            <div class="key-cap">Space</div>
                            <div class="key-desc">
                                <span class="key-desc-title">Thái Cắt & Rửa Đĩa</span>
                                <span class="key-desc-detail">Giữ để thái rau củ hoặc rửa đĩa</span>
                            </div>
                        </div>
                        <div class="pc-key-card">
                            <div class="key-cap">Shift</div>
                            <div class="key-desc">
                                <span class="key-desc-title">Tăng Tốc Chạy</span>
                                <span class="key-desc-detail">Lướt chạy nhanh trong bếp</span>
                            </div>
                        </div>
                    </div>

                    <!-- 5-Step Workflow -->
                    <div class="workflow-guide-box">
                        <div class="workflow-title">📋 QUY TRÌNH NẤU ĂN 5 BƯỚC</div>
                        <div class="workflow-steps-list">
                            <div class="workflow-step-item">
                                <span class="step-num-badge">1</span>
                                <div><strong>Làm nguyên liệu:</strong> Thái củ quả/khoai trên thớt (Space); Nướng bò trên bếp; Chiên khoai que trong bếp chiên; Rót Coca từ máy nước (E).</div>
                            </div>
                            <div class="workflow-step-item">
                                <span class="step-num-badge">2</span>
                                <div><strong>Đặt lên đĩa:</strong> Lấy đĩa sạch từ Kệ Đĩa và gắp nguyên liệu đã làm chín xếp lên đĩa.</div>
                            </div>
                            <div class="workflow-step-item">
                                <span class="step-num-badge">3</span>
                                <div><strong>Thành món:</strong> Món ăn hoàn chỉnh sẽ sáng bừng trên đĩa theo công thức.</div>
                            </div>
                            <div class="workflow-step-item">
                                <span class="step-num-badge">4</span>
                                <div><strong>Giao băng chuyền:</strong> Mang đĩa đến Băng Chuyền giao món theo đơn chờ bên trái.</div>
                            </div>
                            <div class="workflow-step-item">
                                <span class="step-num-badge">5</span>
                                <div><strong>Mang đĩa đi rửa:</strong> Sau khi giao, đĩa bẩn xuất hiện ở Bồn Rửa. Đến bồn rửa giữ <strong>Space</strong> để rửa sạch!</div>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 12px; width: 100%;">
                        <button class="controls-start-btn" id="btn-start-cooking" style="flex: 2;">🍳 VÀO BẾP NGAY!</button>
                        <button class="btn btn-mint" id="btn-cancel-intro" style="flex: 1;">QUAY LẠI</button>
                    </div>
                </div>
            </div>

            <!-- 4. Victory Overlay -->
            <div class="ui-overlay" id="overlay-victory">
                <div class="modal-card">
                    <h2 class="modal-title" id="victory-title" style="color: var(--color-gold);">HOÀN THÀNH XUẤT SẮC!</h2>
                    <p class="modal-subtitle" id="victory-subtitle">Thực khách cực kỳ ưng ý với món ăn của bạn!</p>
                    <div class="stars-reveal-container" id="victory-stars">
                        <div class="reveal-star" id="v-star-1">${SVG_ICONS.star}</div>
                        <div class="reveal-star" id="v-star-2">${SVG_ICONS.star}</div>
                        <div class="reveal-star" id="v-star-3">${SVG_ICONS.star}</div>
                    </div>
                    <div class="stats-summary-box">
                        <div class="stat-item">
                            <span class="stat-label" id="v-score-label">Điểm Số</span>
                            <span class="stat-value" id="v-score">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label" id="v-coins-label">Tiền Kiếm Được</span>
                            <span class="stat-value" id="v-coins">+0</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-primary" id="btn-next-level">MÀN TIẾP THEO</button>
                        <button class="btn btn-gold" id="btn-shop-from-victory">NÂNG CẤP</button>
                    </div>
                </div>
            </div>

            <!-- 5. Defeat Overlay -->
            <div class="ui-overlay" id="overlay-defeat">
                <div class="modal-card">
                    <h2 class="modal-title" id="defeat-title" style="color: var(--color-crimson);">CHƯA ĐẠT CHỈ TIÊU!</h2>
                    <p class="modal-subtitle" id="defeat-reason">Bạn chưa đạt chỉ tiêu yêu cầu.</p>
                    <div style="display: flex; gap: 12px; margin-top: 14px;">
                        <button class="btn btn-primary" id="btn-retry-level">THỬ LẠI</button>
                        <button class="btn btn-mint" id="btn-menu-from-defeat">TRANG CHỦ</button>
                    </div>
                </div>
            </div>

            <!-- 6. Upgrade Shop -->
            <div class="ui-overlay" id="overlay-shop">
                <div class="modal-card" style="width: 520px;">
                    <h2 class="modal-title" id="shop-title">NÂNG CẤP NHÀ HÀNG</h2>
                    <div class="hud-badge coins" style="margin-bottom: 16px;">
                        ${SVG_ICONS.coin} <span id="shop-wallet-coins">0</span>
                    </div>
                    <div class="shop-items-list" id="shop-items-list"></div>
                    <button class="btn btn-mint" id="btn-close-shop">ĐÓNG</button>
                </div>
            </div>

            <!-- 7. How to Play Modal -->
            <div class="ui-overlay" id="overlay-how-to-play">
                <div class="modal-card how-to-modal">
                    <h2 class="modal-title" id="how-to-title">HƯỚNG DẪN CÁCH CHƠI</h2>
                    
                    <button class="btn btn-gold btn-play-tutorial" id="btn-play-tutorial-from-how-to" style="width: 100%; margin: 6px 0 10px 0; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        🎓 VÀO BẾP TẬP SỰ (CHƠI THỬ)
                    </button>

                    <!-- Segmented Tabs -->
                    <div class="how-tabs-bar">
                        <button class="how-tab-btn active" id="tab-btn-rules">📖 CÁCH CHƠI</button>
                        <button class="how-tab-btn" id="tab-btn-recipes">🍔 SÁCH CÔNG THỨC</button>
                        <button class="how-tab-btn" id="tab-btn-mechanics">⚡ TẤT CẢ CƠ CHẾ</button>
                    </div>

                    <!-- Tab 1: Rules & Controls -->
                    <div class="how-tab-pane active" id="tab-pane-rules">
                        <div class="how-steps-list">
                            <p id="how-step-1">1. 🥩 <strong>Nướng Thịt</strong>: Chạm vào thịt bò ở thanh dưới để đặt lên vỉ nướng. Canh chừng khi chín tới!</p>
                            <p id="how-step-2">2. 🍽️ <strong>Ghép Bánh</strong>: Chạm bánh mì đáy đặt lên đĩa, sau đó chạm thịt chín để xếp lên.</p>
                            <p id="how-step-3">3. 🧀 <strong>Thêm Topping</strong>: Thêm phô mai, rau diếp hoặc cà chua theo đúng yêu cầu của khách!</p>
                            <p id="how-step-4">4. 🛎️ <strong>Phục Vụ</strong>: Chạm đĩa hoàn chỉnh hoặc khách hàng để đưa món, nhận tiền thưởng và combo!</p>
                            <p id="how-step-5">5. ⚠️ <strong>Tránh Cháy</strong>: Gắp thịt ra trước khi bị khét, nếu khét hãy vứt vào thùng rác kẻo đứt combo!</p>
                        </div>
                    </div>

                    <!-- Tab 2: Dish-by-Dish Guide -->
                    <div class="how-tab-pane" id="tab-pane-recipes">
                        <!-- Dish Selector Pills -->
                        <div class="dish-stepper-nav" id="dish-stepper-nav">
                            <button class="dish-pill-btn active" data-dish="classic_burger">🍔 Burger Bò</button>
                            <button class="dish-pill-btn" data-dish="cheese_burger">🧀 Burger Phô Mai</button>
                            <button class="dish-pill-btn" data-dish="french_fries">🍟 Khoai Tây Chiên</button>
                            <button class="dish-pill-btn" data-dish="fizzy_soda">🥤 Nước Ngọt</button>
                            <button class="dish-pill-btn" data-dish="deluxe_burger">👑 Burger Deluxe</button>
                        </div>

                        <!-- Active Dish Detail Card Container -->
                        <div class="dish-guide-detail-card" id="dish-guide-detail-card">
                            <!-- Rendered dynamically by this.renderDishGuideDetail(dishId) -->
                        </div>

                        <!-- Dish Stepper Navigation Footer -->
                        <div class="dish-stepper-footer">
                            <button class="btn btn-mint dish-nav-btn" id="btn-prev-dish">⬅ Món Trước</button>
                            <div class="dish-stepper-indicator" id="dish-stepper-indicator">Món 1 / 5</div>
                            <button class="btn btn-primary dish-nav-btn" id="btn-next-dish">Món Kế Tiếp ➔</button>
                        </div>
                    </div>

                    <!-- Tab 3: All Mechanics Guide -->
                    <div class="how-tab-pane" id="tab-pane-mechanics">
                        <div class="mechanics-guide-list">
                            <div class="mech-guide-card">
                                <div class="mech-guide-icon">🥩</div>
                                <div class="mech-guide-info">
                                    <strong class="mech-guide-title">1. Nướng Thịt & Thanh Cháy</strong>
                                    <p class="mech-guide-desc">Chạm thịt đặt lên vỉ nướng. Khi chín sẽ hiện <strong>ĐÃ CHÍN</strong>. Đừng để quá lâu kẻo thanh cháy chuyển đỏ rực và cháy khét!</p>
                                </div>
                            </div>
                            <div class="mech-guide-card">
                                <div class="mech-guide-icon">🍽️</div>
                                <div class="mech-guide-info">
                                    <strong class="mech-guide-title">2. Bàn Ghép Món & Đĩa Sạch</strong>
                                    <p class="mech-guide-desc">Mỗi burger cần 1 đĩa sạch để ghép. Đặt bánh mì đáy ➔ gắp thịt chín ➔ thêm phô mai, rau, cà chua theo yêu cầu khách!</p>
                                </div>
                            </div>
                            <div class="mech-guide-card">
                                <div class="mech-guide-icon">🧼</div>
                                <div class="mech-guide-info">
                                    <strong class="mech-guide-title">3. Bồn Rửa Bát & Rửa Đĩa Dơ</strong>
                                    <p class="mech-guide-desc">Phục vụ xong khách sẽ trả đĩa dơ về bồn. Khi hết đĩa sạch, chạm vào <strong>Bồn Rửa Bát</strong> để rửa sạch đĩa dơ thì mới có thể lên món tiếp theo!</p>
                                </div>
                            </div>
                            <div class="mech-guide-card">
                                <div class="mech-guide-icon">🍟🥤</div>
                                <div class="mech-guide-info">
                                    <strong class="mech-guide-title">4. Bếp Chiên & Máy Nước Ngọt</strong>
                                    <p class="mech-guide-desc">Thả khoai vào bếp chiên hoặc đặt ly vào máy rót nước. Khi chín vàng hoặc đầy ly, chạm trực tiếp để phục vụ khách!</p>
                                </div>
                            </div>
                            <div class="mech-guide-card">
                                <div class="mech-guide-icon">👥</div>
                                <div class="mech-guide-info">
                                    <strong class="mech-guide-title">5. Khách Hàng Gọi 2 Món</strong>
                                    <p class="mech-guide-desc">Từ Màn 6, thực khách bắt đầu gọi combo 2 món cùng lúc! Hãy chuẩn bị và giao đủ cả 2 món trước khi khách hết kiên nhẫn.</p>
                                </div>
                            </div>
                            <div class="mech-guide-card">
                                <div class="mech-guide-icon">🔧</div>
                                <div class="mech-guide-info">
                                    <strong class="mech-guide-title">6. Sự Cố Bếp Nướng Hỏng</strong>
                                    <p class="mech-guide-desc">Bếp nướng thỉnh thoảng sẽ bị hỏng bốc khói đen! Hãy chạm liên tục 3 lần vào biểu tượng cờ-lê trên bếp để sửa chữa ngay.</p>
                                </div>
                            </div>
                            <div class="mech-guide-card highlight-thief">
                                <div class="mech-guide-icon">🦹</div>
                                <div class="mech-guide-info">
                                    <strong class="mech-guide-title">7. Cảnh Giác Kẻ Quỵt Tiền</strong>
                                    <p class="mech-guide-desc">Có khách hàng quỵt tiền! Khi thấy biểu tượng kẻ trộm trên đầu khách, hãy <strong>ấn ngay vào họ trên bàn ăn để đòi lại tiền</strong> trước khi họ trốn thoát!</p>
                                </div>
                            </div>
                            <div class="mech-guide-card">
                                <div class="mech-guide-icon">🔀</div>
                                <div class="mech-guide-info">
                                    <strong class="mech-guide-title">8. Khay Nguyên Liệu Đổi Chỗ</strong>
                                    <p class="mech-guide-desc">Thứ tự các khay nguyên liệu ở kệ dưới đã bị hoán đổi vị trí! Hãy quan sát kỹ biểu tượng và tên khay trước khi bấm.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button class="btn btn-mint" id="btn-close-how-to" style="margin-top: 14px;">ĐÃ HIỂU!</button>
                </div>
            </div>

            <!-- 8. Pause Overlay -->
            <div class="ui-overlay" id="overlay-pause">
                <div class="modal-card">
                    <h2 class="modal-title" id="pause-title">TẠM DỪNG TRÒ CHƠI</h2>
                    <div class="menu-actions" style="margin-top: 20px;">
                        <button class="btn btn-primary" id="btn-resume">TIẾP TỤC</button>
                        <button class="btn btn-mint" id="btn-settings-pause">⚙️ CÀI ĐẶT</button>
                        <button class="btn btn-mint" id="btn-restart-level">CHƠI LẠI</button>
                        <button class="btn btn-gold" id="btn-quit-to-menu">VỀ TRANG CHỦ</button>
                    </div>
                </div>
            </div>

            <!-- 9. Settings Modal -->
            <div class="ui-overlay" id="overlay-settings">
                <div class="modal-card settings-modal">
                    <h2 class="modal-title" id="settings-title">CÀI ĐẶT TRÒ CHƠI</h2>
                    <p class="modal-subtitle" id="settings-subtitle">Tùy chỉnh độ khó, ngôn ngữ & âm thanh</p>
                    <div class="settings-box">
                        <!-- Language Selector -->
                        <div class="setting-card">
                            <div class="setting-header">
                                <span class="setting-label">🌐 <span id="label-setting-lang">Ngôn Ngữ</span></span>
                            </div>
                            <div class="lang-picker-group">
                                <button class="lang-btn active" id="btn-lang-vi" data-lang="vi">🇻🇳 Tiếng Việt</button>
                                <button class="lang-btn" id="btn-lang-en" data-lang="en">🇬🇧 English</button>
                            </div>
                        </div>

                        <!-- BGM Music -->
                        <div class="setting-card">
                            <div class="setting-header">
                                <span class="setting-label">🎵 <span id="label-setting-bgm">Nhạc Nền (BGM)</span></span>
                                <button class="toggle-switch-btn active" id="btn-toggle-bgm">BẬT</button>
                            </div>
                            <div class="slider-row">
                                <input type="range" min="0" max="100" value="50" class="volume-slider" id="slider-bgm">
                                <span class="slider-val-label" id="val-bgm">50%</span>
                            </div>
                        </div>

                        <!-- SFX Sound -->
                        <div class="setting-card">
                            <div class="setting-header">
                                <span class="setting-label">🔊 <span id="label-setting-sfx">Hiệu Ứng (SFX)</span></span>
                                <button class="toggle-switch-btn active" id="btn-toggle-sfx">BẬT</button>
                            </div>
                            <div class="slider-row">
                                <input type="range" min="0" max="100" value="80" class="volume-slider" id="slider-sfx">
                                <span class="slider-val-label" id="val-sfx">80%</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-primary" id="btn-close-settings">LƯU & ĐÓNG</button>
                </div>
            </div>
        `;

        this.initVFX();
        this.renderApplianceSlots();
        this.renderAssemblyPlates();
    }

    initVFX() {
        this.vfx.init(this.container);
    }

    /**
     * Initialize 3D Overcooked Scene & Virtual Input Controllers
     */
    init3DKitchen() {
        const viewportEl = document.getElementById('kitchen-3d-viewport');
        if (!viewportEl) {
            console.warn('[UIManager] #kitchen-3d-viewport not found in DOM.');
            return;
        }

        try {
            this.kitchen3D = new Kitchen3DScene({
                container: viewportEl,
                audioManager: this.audio,
                vfxManager: this.vfx,
                eventBus: this.gm.eventBus,
                onOrderDelivered: (ingredients, recipe) => {
                    return this.handleOrderDelivered(ingredients, recipe);
                }
            });

            // Initialize Virtual Controller
            this.inputController = new InputController({
                onInteract: () => {
                    if (this.kitchen3D && this.gm.currentState === GAME_STATES.GAMEPLAY) {
                        this.kitchen3D.handleInteract();
                        this.renderOvercookedOrders();
                    }
                },
                onChopStart: () => {},
                onChopEnd: () => {
                    if (this.kitchen3D && this.kitchen3D.chef) {
                        this.kitchen3D.chef.setChopping(false);
                    }
                },
                onDash: () => {
                    if (this.kitchen3D && this.kitchen3D.chef && this.gm.currentState === GAME_STATES.GAMEPLAY) {
                        const dashed = this.kitchen3D.chef.dash();
                        if (dashed) {
                            this.kitchen3D.spawnSparks(this.kitchen3D.chef.position);
                        }
                    }
                },
                onThrow: () => {
                    if (this.kitchen3D && this.gm.currentState === GAME_STATES.GAMEPLAY) {
                        this.kitchen3D.handleThrow();
                        this.renderOvercookedOrders();
                    }
                }
            });
            this.inputController.bindVirtualControls(this.container);

            // Contextual Station Prompt Binding
            const promptEl = document.getElementById('station-prompt-pill');
            const promptTextEl = document.getElementById('station-prompt-text');
            const promptBadgeEl = document.getElementById('station-prompt-badge');
            this.kitchen3D.onPromptUpdate = (prompt) => {
                if (!promptEl) return;
                if (prompt && this.gm.currentState === GAME_STATES.GAMEPLAY) {
                    promptEl.style.display = 'flex';
                    promptTextEl.textContent = prompt.text;
                    promptBadgeEl.textContent = prompt.station || '';
                } else {
                    promptEl.style.display = 'none';
                }
            };

            console.log('[UIManager] 3D Overcooked Engine mounted successfully!');
        } catch (err) {
            console.error('[UIManager] Failed to initialize 3D Kitchen:', err);
        }
    }

    /**
     * Handle order delivery matching
     * @param {string[]} ingredients 
     * @param {Object} recipe 
     */
    handleOrderDelivered(ingredients, recipe) {
        if (!recipe) return false;

        const matchingOrder = this.orderSystem.findMatchingOrder(recipe.id);
        if (!matchingOrder) return false;

        const result = this.orderSystem.fulfillOrderItem(matchingOrder.orderId, recipe.id);
        if (result) {
            this.economySystem.recordSale(result.totalEarned, result.scoreEarned, result.tipEarned);
            this.customerSystem.deliverItemToCustomer(matchingOrder.customerId, recipe.id);
            if (matchingOrder.isAllFulfilled()) {
                this.customerSystem.completeCustomer(matchingOrder.customerId, {
                    totalEarned: result.totalEarned,
                    tipEarned: result.tipEarned,
                    scoreEarned: result.scoreEarned
                });
            }
            this.updateHUDStats();
            this.renderOvercookedOrders();

            // Celebratory Floating Text
            const rect = this.container.getBoundingClientRect();
            this.vfx.floatingText(
                result.isPerfect ? `✨ HOÀN HẢO! +$${result.totalEarned}` : `👍 XONG MÓN! +$${result.totalEarned}`,
                rect.width / 2,
                110,
                result.isPerfect ? '#ffd700' : '#00e676'
            );
            return true;
        }
        return false;
    }

    /**
     * Render Overcooked order cards with recipe ingredients on Left Sidebar (Image 2 style)
     */
    renderOvercookedOrders() {
        const ordersBar = document.getElementById('overcooked-orders-bar');
        if (!ordersBar) return;

        const activeOrders = this.orderSystem.getActiveOrders();
        const held = this.kitchen3D?.chef?.heldItem;
        const heldIngredients = (held && held.type === 'plate') ? (held.ingredients || []) : (held ? [held.id] : []);

        const stateKey = activeOrders.map(o => o.orderId).join(',') + '|' + heldIngredients.join(',');

        if (this._lastOrdersStateKey !== stateKey) {
            this._lastOrdersStateKey = stateKey;

            if (activeOrders.length === 0) {
                ordersBar.innerHTML = `
                    <div style="font-size: 11px; color: #94a3b8; font-style: italic; padding: 6px;">Đang đợi thực khách...</div>
                `;
                return;
            }

            const cardsHtml = activeOrders.map(order => {
                const recipe = order.recipe;
                if (!recipe) return '';

                const ratio = Math.max(0, Math.min(1, order.remainingPatience / order.basePatience));
                const percent = Math.round(ratio * 100);
                const warnClass = ratio < 0.25 ? 'danger' : (ratio < 0.5 ? 'warning' : '');
                const isUrgent = ratio < 0.25;

                const details = recipe.ingredientDetails || [];
                const chipsHtml = details.map(d => {
                    const isPresent = (heldIngredients || []).includes(d.id);
                    return `
                        <div class="recipe-ingredient-chip ${isPresent ? 'present' : ''}" title="${d.name}">
                            <span class="chip-icon">${d.icon}</span>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="overcooked-order-card ${isUrgent ? 'urgent' : ''}" data-order-id="${order.orderId}">
                        <div class="order-dish-header">
                            <div class="order-dish-title">${recipe.nameVi || recipe.name}</div>
                            <div class="order-dish-reward">+$${recipe.basePrice}</div>
                        </div>
                        <div class="order-recipe-formula">
                            ${chipsHtml}
                        </div>
                        <div class="order-patience-wrapper">
                            <div class="order-patience-fill ${warnClass}" style="width: ${percent}%;"></div>
                        </div>
                    </div>
                `;
            }).join('');

            ordersBar.innerHTML = cardsHtml;
        } else {
            // Fast update: only update patience bars
            activeOrders.forEach(order => {
                const card = ordersBar.querySelector(`[data-order-id="${order.orderId}"]`);
                if (card) {
                    const ratio = Math.max(0, Math.min(1, order.remainingPatience / order.basePatience));
                    const percent = Math.round(ratio * 100);
                    const warnClass = ratio < 0.25 ? 'danger' : (ratio < 0.5 ? 'warning' : '');
                    const isUrgent = ratio < 0.25;
                    
                    if (isUrgent) card.classList.add('urgent');
                    else card.classList.remove('urgent');

                    const fill = card.querySelector('.order-patience-fill');
                    if (fill) {
                        fill.style.width = `${percent}%`;
                        fill.className = `order-patience-fill ${warnClass}`;
                    }
                }
            });
        }
    }

    /**
     * Render dynamic slots for Grills, Fryers, Dispensers
     */
    renderApplianceSlots() {
        const grillContainer = document.getElementById('grill-slots');
        grillContainer.innerHTML = '';
        this.cookingSystem.getSlots('grill').forEach(slot => {
            const el = document.createElement('div');
            el.className = 'appliance-slot grill';
            el.id = `slot-grill-${slot.index}`;
            el.innerHTML = `
                <div class="cooking-fx-overlay"></div>
                <div class="slot-status-chip"></div>
                <div class="slot-content"></div>
                <div class="slot-progress-bar"><div class="slot-progress-fill"></div></div>
            `;
            el.addEventListener('click', (e) => this.handleSlotClick('grill', slot.index, e));
            grillContainer.appendChild(el);
        });

        const fryerContainer = document.getElementById('fryer-slots');
        fryerContainer.innerHTML = '';
        this.cookingSystem.getSlots('fryer').forEach(slot => {
            const el = document.createElement('div');
            el.className = 'appliance-slot fryer';
            el.id = `slot-fryer-${slot.index}`;
            el.innerHTML = `
                <div class="cooking-fx-overlay"></div>
                <div class="slot-status-chip"></div>
                <div class="slot-content"></div>
                <div class="slot-progress-bar"><div class="slot-progress-fill"></div></div>
            `;
            el.addEventListener('click', (e) => this.handleSlotClick('fryer', slot.index, e));
            fryerContainer.appendChild(el);
        });

        const dispenserContainer = document.getElementById('dispenser-slots');
        dispenserContainer.innerHTML = '';
        this.cookingSystem.getSlots('dispenser').forEach(slot => {
            const el = document.createElement('div');
            el.className = 'appliance-slot dispenser';
            el.id = `slot-dispenser-${slot.index}`;
            el.innerHTML = `
                <div class="cooking-fx-overlay"></div>
                <div class="slot-status-chip"></div>
                <div class="slot-content"></div>
                <div class="slot-progress-bar"><div class="slot-progress-fill"></div></div>
            `;
            el.addEventListener('click', (e) => this.handleSlotClick('dispenser', slot.index, e));
            dispenserContainer.appendChild(el);
        });
    }

    /**
     * Render assembly plates
     */
    renderAssemblyPlates() {
        const container = document.getElementById('assembly-plates');
        container.innerHTML = '';
        this.assemblySystem.plates.forEach(plate => {
            const el = document.createElement('div');
            el.className = `assembly-tray ${plate.index === this.selectedPlateIndex ? 'selected' : ''}`;
            el.id = `plate-${plate.index}`;
            el.innerHTML = `<div class="plate-content" id="plate-content-${plate.index}"></div>`;
            el.addEventListener('click', (e) => this.handlePlateClick(plate.index, e));
            container.appendChild(el);
        });
    }

    /**
     * Select a specific assembly plate and update UI highlight
     * @param {number} plateIndex 
     */
    selectPlate(plateIndex) {
        this.selectedPlateIndex = plateIndex;
        document.querySelectorAll('.assembly-tray').forEach((el, idx) => {
            el.classList.toggle('selected', idx === plateIndex);
        });
    }

    /**
     * Bind DOM button clicks
     */
    bindEvents() {
        // Mobile Rotate Pill Dismiss
        const closeRotateBtn = document.getElementById('btn-close-rotate-pill');
        if (closeRotateBtn) {
            closeRotateBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pill = document.getElementById('mobile-rotate-pill');
                if (pill) pill.style.display = 'none';
            });
        }

        // Audio Toggle
        const soundBtn = document.getElementById('btn-sound');
        soundBtn.addEventListener('click', () => {
            this.audio.init();
            const muted = !this.audio.isMuted;
            this.audio.setMuted(muted);
            soundBtn.textContent = muted ? '🔇' : '🔊';
        });


        // Pause
        document.getElementById('btn-pause').addEventListener('click', () => {
            this.audio.playClick();
            this.gm.pauseGame();
        });

        document.getElementById('btn-resume').addEventListener('click', () => {
            this.audio.playClick();
            this.gm.resumeGame();
        });

        document.getElementById('btn-restart-level').addEventListener('click', () => {
            this.audio.playClick();
            this.gm.startLevel(this.gm.selectedLevelNumber);
        });

        document.getElementById('btn-quit-to-menu').addEventListener('click', () => {
            this.audio.playClick();
            this.gm.transitionTo(GAME_STATES.MAIN_MENU);
        });

        // Settings Buttons (HUD, Main Menu, Pause Menu)
        const openSettingsHandler = () => {
            this.audio.playClick();
            this.showSettings();
        };

        const btnSettingsMenu = document.getElementById('btn-open-settings');
        if (btnSettingsMenu) btnSettingsMenu.addEventListener('click', openSettingsHandler);

        const btnSettingsHud = document.getElementById('btn-settings-hud');
        if (btnSettingsHud) btnSettingsHud.addEventListener('click', openSettingsHandler);

        const btnControlsGuideHud = document.getElementById('btn-controls-guide-hud');
        if (btnControlsGuideHud) {
            btnControlsGuideHud.addEventListener('click', () => {
                this.audio.playClick();
                this.showOverlay('overlay-level-intro');
            });
        }

        const btnSettingsPause = document.getElementById('btn-settings-pause');
        if (btnSettingsPause) btnSettingsPause.addEventListener('click', openSettingsHandler);

        // Difficulty Selectors
        ['easy', 'normal', 'hard', 'expert'].forEach(diffKey => {
            const btn = document.getElementById(`btn-diff-${diffKey}`);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.audio.playClick();
                    this.gm.setDifficulty(diffKey);
                    this.updateSettingsControls();
                });
            }
        });

        // How to Play Tabs (3 Tabs: Rules, Recipes, Mechanics)
        const tabRulesBtn = document.getElementById('tab-btn-rules');
        const tabRecipesBtn = document.getElementById('tab-btn-recipes');
        const tabMechanicsBtn = document.getElementById('tab-btn-mechanics');
        const tabRulesPane = document.getElementById('tab-pane-rules');
        const tabRecipesPane = document.getElementById('tab-pane-recipes');
        const tabMechanicsPane = document.getElementById('tab-pane-mechanics');

        const switchHowToTab = (activeTab) => {
            this.audio.playClick();
            if (tabRulesBtn) tabRulesBtn.classList.toggle('active', activeTab === 'rules');
            if (tabRecipesBtn) tabRecipesBtn.classList.toggle('active', activeTab === 'recipes');
            if (tabMechanicsBtn) tabMechanicsBtn.classList.toggle('active', activeTab === 'mechanics');

            if (tabRulesPane) tabRulesPane.classList.toggle('active', activeTab === 'rules');
            if (tabRecipesPane) tabRecipesPane.classList.toggle('active', activeTab === 'recipes');
            if (tabMechanicsPane) tabMechanicsPane.classList.toggle('active', activeTab === 'mechanics');
        };

        if (tabRulesBtn) tabRulesBtn.addEventListener('click', () => switchHowToTab('rules'));
        if (tabRecipesBtn) tabRecipesBtn.addEventListener('click', () => switchHowToTab('recipes'));
        if (tabMechanicsBtn) tabMechanicsBtn.addEventListener('click', () => switchHowToTab('mechanics'));

        // Dish-by-Dish Stepper Navigation
        document.querySelectorAll('.dish-pill-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.audio.playClick();
                const dishId = btn.dataset.dish;
                this.renderDishGuideDetail(dishId);
            });
        });

        const dishKeys = ['classic_burger', 'cheese_burger', 'french_fries', 'fizzy_soda', 'deluxe_burger'];
        const btnPrevDish = document.getElementById('btn-prev-dish');
        if (btnPrevDish) {
            btnPrevDish.addEventListener('click', () => {
                this.audio.playClick();
                const curIdx = dishKeys.indexOf(this.currentGuideDishId);
                const nextIdx = (curIdx - 1 + dishKeys.length) % dishKeys.length;
                this.renderDishGuideDetail(dishKeys[nextIdx]);
            });
        }

        const btnNextDish = document.getElementById('btn-next-dish');
        if (btnNextDish) {
            btnNextDish.addEventListener('click', () => {
                this.audio.playClick();
                const curIdx = dishKeys.indexOf(this.currentGuideDishId);
                const nextIdx = (curIdx + 1) % dishKeys.length;
                this.renderDishGuideDetail(dishKeys[nextIdx]);
            });
        }

        // Play Tutorial Quick Action (from How To Play and Level Select)
        const btnPlayTutHowTo = document.getElementById('btn-play-tutorial-from-how-to');
        if (btnPlayTutHowTo) {
            btnPlayTutHowTo.addEventListener('click', () => {
                this.audio.playClick();
                this.hideOverlay('overlay-how-to-play');
                this.gm.startLevel(0);
            });
        }

        const btnStartTut = document.getElementById('btn-start-tutorial');
        if (btnStartTut) {
            btnStartTut.addEventListener('click', () => {
                this.audio.playClick();
                this.gm.startLevel(0);
            });
        }

        const btnDismissCallout = document.getElementById('callout-dismiss-btn');
        if (btnDismissCallout) {
            btnDismissCallout.addEventListener('click', () => {
                this.audio.playClick();
                this.dismissGameplayCallout();
            });
        }

        // Language Selectors
        const btnLangVi = document.getElementById('btn-lang-vi');
        if (btnLangVi) {
            btnLangVi.addEventListener('click', () => {
                this.audio.playClick();
                this.loc.setLanguage('vi');
            });
        }

        const btnLangEn = document.getElementById('btn-lang-en');
        if (btnLangEn) {
            btnLangEn.addEventListener('click', () => {
                this.audio.playClick();
                this.loc.setLanguage('en');
            });
        }

        // BGM Toggle
        const btnToggleBgm = document.getElementById('btn-toggle-bgm');
        if (btnToggleBgm) {
            btnToggleBgm.addEventListener('click', () => {
                this.audio.init();
                const next = !this.audio.isBgmEnabled;
                this.audio.setBgmEnabled(next);
                this.saveAudioSetting('isBgmEnabled', next);
                this.updateSettingsControls();
            });
        }

        // BGM Slider
        const sliderBgm = document.getElementById('slider-bgm');
        if (sliderBgm) {
            sliderBgm.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) / 100;
                this.audio.setBGMVolume(val);
                this.saveAudioSetting('bgmVolume', val);
                const valBgm = document.getElementById('val-bgm');
                if (valBgm) valBgm.textContent = `${e.target.value}%`;
            });
        }

        // SFX Toggle
        const btnToggleSfx = document.getElementById('btn-toggle-sfx');
        if (btnToggleSfx) {
            btnToggleSfx.addEventListener('click', () => {
                this.audio.init();
                const next = !this.audio.isSfxEnabled;
                this.audio.setSfxEnabled(next);
                this.saveAudioSetting('isSfxEnabled', next);
                this.updateSettingsControls();
                if (next) this.audio.playCoin();
            });
        }

        // SFX Slider
        const sliderSfx = document.getElementById('slider-sfx');
        if (sliderSfx) {
            sliderSfx.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) / 100;
                this.audio.setSFXVolume(val);
                this.saveAudioSetting('sfxVolume', val);
                const valSfx = document.getElementById('val-sfx');
                if (valSfx) valSfx.textContent = `${e.target.value}%`;
            });
        }

        // Close Settings
        const btnCloseSettings = document.getElementById('btn-close-settings');
        if (btnCloseSettings) {
            btnCloseSettings.addEventListener('click', () => {
                this.audio.playClick();
                this.hideOverlay('overlay-settings');
                if (this.gm.currentState === GAME_STATES.MAIN_MENU) {
                    this.showOverlay('overlay-main-menu');
                } else if (this.gm.currentState === GAME_STATES.PAUSED) {
                    this.showOverlay('overlay-pause');
                }
            });
        }

        // Main Menu Play Game -> Go straight to Level Select
        const btnPlay = document.getElementById('btn-play-game');
        if (btnPlay) {
            btnPlay.addEventListener('click', () => {
                this.audio.playClick();
                this.gm.transitionTo(GAME_STATES.LEVEL_SELECT);
            });
        }

        document.getElementById('btn-open-shop').addEventListener('click', () => {
            this.audio.playClick();
            this.gm.transitionTo(GAME_STATES.UPGRADE_SHOP);
        });

        document.getElementById('btn-how-to-play').addEventListener('click', () => {
            this.audio.playClick();
            this.showOverlay('overlay-how-to-play');
        });

        document.getElementById('btn-close-how-to').addEventListener('click', () => {
            this.audio.playClick();
            this.hideOverlay('overlay-how-to-play');
        });

        document.getElementById('btn-back-to-menu').addEventListener('click', () => {
            this.audio.playClick();
            this.gm.transitionTo(GAME_STATES.MAIN_MENU);
        });

        document.getElementById('btn-start-cooking').addEventListener('click', () => {
            this.audio.playClick();
            this.gm.beginLevelGameplay();
        });

        document.getElementById('btn-cancel-intro').addEventListener('click', () => {
            this.audio.playClick();
            this.gm.transitionTo(GAME_STATES.LEVEL_SELECT);
        });

        document.getElementById('btn-next-level').addEventListener('click', () => {
            this.audio.playClick();
            const nextLvl = this.gm.selectedLevelNumber + 1;
            if (nextLvl <= getTotalLevels()) {
                this.gm.startLevel(nextLvl);
            } else {
                this.gm.transitionTo(GAME_STATES.MAIN_MENU);
            }
        });

        document.getElementById('btn-shop-from-victory').addEventListener('click', () => {
            this.audio.playClick();
            this.gm.transitionTo(GAME_STATES.UPGRADE_SHOP);
        });

        document.getElementById('btn-retry-level').addEventListener('click', () => {
            this.audio.playClick();
            this.gm.startLevel(this.gm.selectedLevelNumber);
        });

        document.getElementById('btn-menu-from-defeat').addEventListener('click', () => {
            this.audio.playClick();
            this.gm.transitionTo(GAME_STATES.MAIN_MENU);
        });

        document.getElementById('btn-close-shop').addEventListener('click', () => {
            this.audio.playClick();
            this.hideOverlay('overlay-shop');
            if (this.gm.currentState === GAME_STATES.MAIN_MENU) {
                this.showOverlay('overlay-main-menu');
            }
        });

        // Sink Station Click to Wash
        const sinkEl = document.getElementById('sink-station');
        if (sinkEl) {
            sinkEl.addEventListener('click', () => {
                this.handleSinkClick();
            });
        }

        // Counter Seats Click to Catch Thief
        document.querySelectorAll('.counter-seat').forEach((seatEl, idx) => {
            seatEl.addEventListener('click', (e) => {
                this.handleSeatClick(idx, e);
            });
        });

        // Trash Can
        document.getElementById('trash-bin').addEventListener('click', () => {
            if (this.assemblySystem.canTrashPlate(this.selectedPlateIndex)) {
                this.audio.playTrash();
                this.vfx.shake(0.15, 3);
                this.assemblySystem.trashPlate(this.selectedPlateIndex);
                this.dishwashingSystem.addDirtyPlate();
                this.updatePlateView(this.selectedPlateIndex);
                this.updateSinkView();
            }
        });

        // Ingredient Bins
        document.querySelectorAll('.ingredient-bin').forEach(bin => {
            bin.addEventListener('click', () => {
                const ingredientId = bin.dataset.ingredient;
                this.handleIngredientTap(ingredientId, bin);
            });
        });
    }

    /**
     * Handle ingredient tap from bottom bar
     * @param {string} ingredientId 
     * @param {HTMLElement} element 
     */
    handleIngredientTap(ingredientId, element) {
        if (this.gm.currentState !== GAME_STATES.GAMEPLAY) return;

        // Visual feedback
        element.style.transform = 'scale(0.92)';
        setTimeout(() => { element.style.transform = ''; }, 120);

        if (ingredientId === 'beef_patty') {
            // Find empty grill slot
            const slots = this.cookingSystem.getSlots('grill');
            const emptySlot = slots.find(s => s.state === APPLIANCE_SLOT_STATES.EMPTY);
            if (emptySlot) {
                this.audio.playPlateSnap();
                this.cookingSystem.placeItem('grill', emptySlot.index, 'beef_patty');
                this.audio.startSizzle();
                this.updateSlotView('grill', emptySlot.index);
            } else {
                this.audio.playFail();
            }
        } else if (ingredientId === 'potatoes') {
            const slots = this.cookingSystem.getSlots('fryer');
            const emptySlot = slots.find(s => s.state === APPLIANCE_SLOT_STATES.EMPTY);
            if (emptySlot) {
                this.audio.playPlateSnap();
                this.cookingSystem.placeItem('fryer', emptySlot.index, 'potatoes');
                this.audio.startSizzle();
                this.updateSlotView('fryer', emptySlot.index);
            } else {
                this.audio.playFail();
            }
        } else if (ingredientId === 'soda_cup') {
            const slots = this.cookingSystem.getSlots('dispenser');
            const emptySlot = slots.find(s => s.state === APPLIANCE_SLOT_STATES.EMPTY);
            if (emptySlot) {
                this.audio.playPlateSnap();
                this.cookingSystem.placeItem('dispenser', emptySlot.index, 'soda_cup');
                this.updateSlotView('dispenser', emptySlot.index);
            } else {
                this.audio.playFail();
            }
        } else {
            // Check plate requirement when placing bun_bottom (start of burger)
            if (ingredientId === 'bun_bottom') {
                const targetPlateIndex = this.assemblySystem.findAvailablePlateForBun(this.selectedPlateIndex);
                if (targetPlateIndex === null || targetPlateIndex === undefined || targetPlateIndex === -1) {
                    this.audio.playFail();
                    this.vfx.shake(0.1, 2);
                    const rect = element.getBoundingClientRect();
                    this.vfx.spawnFloatingText(this.loc.t('plates_full_of_buns') || 'CÁC ĐĨA ĐÃ ĐẦY BÁNH! 🍽️', rect.left, rect.top - 20, '#F59E0B', 1.0);
                    return;
                }

                this.selectPlate(targetPlateIndex);

                if (!this.dishwashingSystem.canAssembleDish()) {
                    this.audio.playFail();
                    this.vfx.shake(0.2, 4);
                    const sinkEl = document.getElementById('sink-station');
                    if (sinkEl) sinkEl.classList.add('needs-wash');
                    const rect = element.getBoundingClientRect();
                    this.vfx.spawnFloatingText(this.loc.t('no_clean_plates'), rect.left, rect.top - 20, '#EF4444', 1.2);
                    if (this.gm.selectedLevelNumber <= 7) {
                        this.showGameplayCallout(
                            '🧼',
                            this.loc.t('callout_sink_title') || 'HẾT ĐĨA SẠCH!',
                            this.loc.t('callout_sink_desc') || 'Chạm vào Bồn Rửa Bát để rửa sạch đĩa dơ ngay!',
                            'sink',
                            4500
                        );
                    }
                    return;
                }

                this.dishwashingSystem.consumeCleanPlate();
                this.updateSinkView();
                this.audio.playChop();
                this.assemblySystem.addIngredient(targetPlateIndex, 'bun_bottom');
                this.updatePlateView(targetPlateIndex);

                if (this.gm.selectedLevelNumber === 0 && this.tutorialStep === 2) {
                    this.updateTutorialGuideStep(3);
                }
            } else {
                // Toppings: cheese_slice, lettuce, tomato_slice
                const targetPlateIndex = this.assemblySystem.findPlateForIngredient(ingredientId, this.selectedPlateIndex);
                if (targetPlateIndex !== null && targetPlateIndex !== undefined && targetPlateIndex !== -1) {
                    this.selectPlate(targetPlateIndex);
                    this.audio.playChop();
                    this.assemblySystem.addIngredient(targetPlateIndex, ingredientId);
                    this.updatePlateView(targetPlateIndex);
                } else {
                    this.audio.playFail();
                    this.vfx.shake(0.1, 2);
                    const rect = element.getBoundingClientRect();
                    const selectedPlate = this.assemblySystem.getPlate(this.selectedPlateIndex);
                    const anyPlateHasTopping = this.assemblySystem.plates.some(p => p.ingredients && p.ingredients.includes(ingredientId));
                    const anyPlateHasBun = this.assemblySystem.plates.some(p => p.ingredients && p.ingredients.includes('bun_bottom'));
                    const toppingName = this.loc.t(`ingredient_${ingredientId}`) || ingredientId;

                    if ((selectedPlate && selectedPlate.ingredients && selectedPlate.ingredients.includes(ingredientId)) || anyPlateHasTopping) {
                        this.vfx.spawnFloatingText(`BÁNH ĐÃ CÓ ${toppingName.toUpperCase()}! ⚠️`, rect.left, rect.top - 20, '#EF4444', 1.1);
                    } else if (!anyPlateHasBun) {
                        this.vfx.spawnFloatingText(this.loc.t('need_bun_first') || 'CẦN ĐẶT BÁNH MÌ TRÊN ĐĨA TRƯỚC! 🍞', rect.left, rect.top - 20, '#EF4444', 1.1);
                    } else {
                        this.vfx.spawnFloatingText(this.loc.t('burger_already_has_topping') || 'BÁNH ĐÃ CÓ TOPPING NÀY! ⚠️', rect.left, rect.top - 20, '#EF4444', 1.0);
                    }
                }
            }
        }
    }

    /**
     * Handle click on cooking appliance slot
     * @param {string} applianceType 
     * @param {number} slotIndex 
     */
    handleSlotClick(applianceType, slotIndex, event) {
        if (this.gm.currentState !== GAME_STATES.GAMEPLAY) return;

        const slots = this.cookingSystem.getSlots(applianceType);
        const slot = slots[slotIndex];
        if (!slot) return;

        if (slot.state === APPLIANCE_SLOT_STATES.BROKEN) {
            const repaired = this.cookingSystem.repairSlot(applianceType, slotIndex);
            this.audio.playClick();
            this.vfx.shake(0.1, 2);
            if (repaired) {
                this.audio.playPlateSnap();
                this.vfx.spawnFloatingText(this.loc.t('repaired_alert'), event.clientX || 300, event.clientY || 200, '#4ADE80', 1.2);
            } else {
                this.vfx.spawnFloatingText(`SỬA: ${slot.repairTaps}x 🔨`, event.clientX || 300, event.clientY || 200, '#F59E0B', 0.9);
            }
            this.updateSlotView(applianceType, slotIndex);
            return;
        }

        if (slot.state === APPLIANCE_SLOT_STATES.COOKED) {
            // If it's a grill slot (cooked beef patty), target the ready assembly plate!
            if (applianceType === 'grill') {
                const targetPlateIndex = this.assemblySystem.findPlateForIngredient('beef_patty', this.selectedPlateIndex);
                if (targetPlateIndex === null || targetPlateIndex === undefined || targetPlateIndex === -1) {
                    this.audio.playFail();
                    this.vfx.shake(0.1, 2);

                    const selectedPlate = this.assemblySystem.getPlate(this.selectedPlateIndex);
                    const anyPlateHasPatty = this.assemblySystem.plates.some(p => p.ingredients && p.ingredients.includes('beef_patty'));
                    const anyPlateHasBun = this.assemblySystem.plates.some(p => p.ingredients && p.ingredients.includes('bun_bottom'));

                    if ((selectedPlate && selectedPlate.ingredients && selectedPlate.ingredients.includes('beef_patty')) || anyPlateHasPatty) {
                        this.vfx.spawnFloatingText(this.loc.t('burger_has_patty') || 'BÁNH ĐÃ CÓ THỊT! 🥩', event.clientX || 300, event.clientY || 200, '#EF4444', 1.3);
                    } else if (!anyPlateHasBun) {
                        this.vfx.spawnFloatingText(this.loc.t('need_bun_first') || 'CẦN ĐẶT BÁNH MÌ TRÊN ĐĨA TRƯỚC! 🍞', event.clientX || 300, event.clientY || 200, '#EF4444', 1.2);
                    } else {
                        this.vfx.spawnFloatingText(this.loc.t('burger_has_patty') || 'BÁNH ĐÃ CÓ THỊT! 🥩', event.clientX || 300, event.clientY || 200, '#EF4444', 1.2);
                    }
                    return;
                }

                this.selectPlate(targetPlateIndex);
                const harvested = this.cookingSystem.collectCookedItem(applianceType, slotIndex);
                this.audio.stopSizzle();
                this.audio.playPlateSnap();
                if (harvested) {
                    this.assemblySystem.addIngredient(targetPlateIndex, harvested);
                    this.updatePlateView(targetPlateIndex);
                    if (this.gm.selectedLevelNumber === 0 && this.tutorialStep === 3) {
                        this.updateTutorialGuideStep(4);
                    }
                }
                this.updateSlotView(applianceType, slotIndex);
                return;
            }

            // Fryer or Dispenser
            const harvested = this.cookingSystem.collectCookedItem(applianceType, slotIndex);
            this.audio.stopSizzle();
            this.audio.playPlateSnap();

            if (harvested) {
                if (harvested === 'potatoes') {
                    this.tryServeDish('french_fries', event);
                } else if (harvested === 'soda_cup') {
                    this.tryServeDish('fizzy_soda', event);
                }
            }
            this.updateSlotView(applianceType, slotIndex);
        } else if (slot.state === APPLIANCE_SLOT_STATES.BURNT) {
            // Discard burnt item
            this.cookingSystem.trashBurntItem(applianceType, slotIndex);
            this.audio.stopSizzle();
            this.audio.playTrash();
            this.economySystem.breakCombo('burnt_food');
            this.vfx.shake(0.2, 5);
            this.updateSlotView(applianceType, slotIndex);
        }
    }

    /**
     * Handle click on assembly plate
     * @param {number} plateIndex 
     */
    handlePlateClick(plateIndex, event) {
        if (this.gm.currentState !== GAME_STATES.GAMEPLAY) return;

        this.selectPlate(plateIndex);

        const plate = this.assemblySystem.getPlate(plateIndex);
        if (plate && plate.matchedRecipe) {
            // Try serving this dish to an active waiting customer!
            this.tryServePlate(plateIndex, event);
        }
    }

    /**
     * Try to serve dish to an active customer
     * @param {number} plateIndex 
     */
    tryServePlate(plateIndex, event) {
        const plate = this.assemblySystem.getPlate(plateIndex);
        if (!plate || !plate.matchedRecipe) return;

        const recipeId = plate.matchedRecipe.id;
        const matchingOrder = this.orderSystem.findMatchingOrder(recipeId);

        if (matchingOrder) {
            const result = this.orderSystem.fulfillOrderItem(matchingOrder.orderId, recipeId);
            this.customerSystem.deliverItemToCustomer(matchingOrder.customerId, recipeId);

            this.assemblySystem.clearPlate(plateIndex);
            this.dishwashingSystem.addDirtyPlate();
            this.updatePlateView(plateIndex);
            this.updateSinkView();

            if (result.isComplete) {
                const earnings = this.economySystem.recordDishServed({
                    baseCoins: result.totalBaseCoins || result.baseEarned,
                    tipCoins: result.totalTipCoins || result.tipEarned,
                    baseScore: result.totalScore || result.scoreEarned,
                    isPerfect: result.isPerfect
                });

                const customer = this.customerSystem.serveCustomer(matchingOrder.customerId, earnings);

                this.levelSystem.recordCustomerServed(
                    this.economySystem.getLevelCoins(),
                    this.economySystem.getLevelScore()
                );

                if (customer && customer.isThief) {
                    this.vfx.shake(0.2, 5);
                    this.vfx.spawnFloatingText(this.loc.t('thief_alert') + ' 🦹', event.clientX || 300, event.clientY || 200, '#EF4444', 1.4);
                } else if (result.isPerfect) {
                    this.audio.playPerfect();
                    this.vfx.spawnFloatingText(`PERFECT! +$${earnings.earnedCoins}`, event.clientX || 300, event.clientY || 200, '#2EC4B6', 1.2);
                } else {
                    this.audio.playCoin();
                    this.vfx.spawnFloatingText(`+$${earnings.earnedCoins}`, event.clientX || 300, event.clientY || 200, '#FFD166', 1.0);
                }
            } else {
                // Partial item delivered for multi-item order
                this.audio.playPlateSnap();
                const partialMsg = this.loc.currentLang === 'vi' ? 'MÓN 1/2 XONG! ✓' : 'ITEM DELIVERED! ✓';
                this.vfx.spawnFloatingText(partialMsg, event.clientX || 300, event.clientY || 200, '#4EE2D5', 1.0);
            }

            this.updateHUD();
            const customerObj = this.customerSystem.getCustomerById(matchingOrder.customerId);
            if (customerObj) this.updateSeatView(customerObj.seatIndex);
        } else {
            // Wrong dish / no customer ordered this right now
            this.audio.playFail();
            this.vfx.shake(0.1, 3);
        }
    }

    /**
     * Try serving standalone dish (fries, soda)
     * @param {string} recipeId 
     * @param {Event} event 
     */
    tryServeDish(recipeId, event) {
        const matchingOrder = this.orderSystem.findMatchingOrder(recipeId);
        if (matchingOrder) {
            const result = this.orderSystem.fulfillOrderItem(matchingOrder.orderId, recipeId);
            this.customerSystem.deliverItemToCustomer(matchingOrder.customerId, recipeId);

            if (result.isComplete) {
                const earnings = this.economySystem.recordDishServed({
                    baseCoins: result.totalBaseCoins || result.baseEarned,
                    tipCoins: result.totalTipCoins || result.tipEarned,
                    baseScore: result.totalScore || result.scoreEarned,
                    isPerfect: result.isPerfect
                });

                const customer = this.customerSystem.serveCustomer(matchingOrder.customerId, earnings);

                this.levelSystem.recordCustomerServed(
                    this.economySystem.getLevelCoins(),
                    this.economySystem.getLevelScore()
                );

                if (customer && customer.isThief) {
                    this.vfx.shake(0.2, 5);
                    this.vfx.spawnFloatingText(this.loc.t('thief_alert') + ' 🦹', event.clientX || 300, event.clientY || 200, '#EF4444', 1.4);
                } else if (result.isPerfect) {
                    this.audio.playPerfect();
                    this.vfx.spawnFloatingText(`PERFECT! +$${earnings.earnedCoins}`, event.clientX || 300, event.clientY || 200, '#2EC4B6', 1.2);
                } else {
                    this.audio.playCoin();
                    this.vfx.spawnFloatingText(`+$${earnings.earnedCoins}`, event.clientX || 300, event.clientY || 200, '#FFD166', 1.0);
                }
            } else {
                this.audio.playPlateSnap();
                const partialMsg = this.loc.currentLang === 'vi' ? 'MÓN 1/2 XONG! ✓' : 'ITEM DELIVERED! ✓';
                this.vfx.spawnFloatingText(partialMsg, event.clientX || 300, event.clientY || 200, '#4EE2D5', 1.0);
            }

            this.updateHUD();
            const customerObj = this.customerSystem.getCustomerById(matchingOrder.customerId);
            if (customerObj) this.updateSeatView(customerObj.seatIndex);
        } else {
            this.audio.playFail();
        }
    }

    /**
     * Handle delivery from 3D Kitchen Conveyor Belt
     * @param {string[]} ingredients 
     * @param {Object} recipe 
     * @returns {boolean} True if delivered successfully
     */
    handleOrderDelivered(ingredients, recipe) {
        if (!recipe) return false;
        const matchingOrder = this.orderSystem.findMatchingOrder(recipe.id);
        
        if (matchingOrder) {
            const result = this.orderSystem.fulfillOrderItem(matchingOrder.orderId, recipe.id);
            this.customerSystem.deliverItemToCustomer(matchingOrder.customerId, recipe.id);

            const fakeEvent = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };

            if (result.isComplete) {
                const earnings = this.economySystem.recordDishServed({
                    baseCoins: result.totalBaseCoins || result.baseEarned,
                    tipCoins: result.totalTipCoins || result.tipEarned,
                    baseScore: result.totalScore || result.scoreEarned,
                    isPerfect: result.isPerfect
                });

                const customer = this.customerSystem.serveCustomer(matchingOrder.customerId, earnings);

                this.levelSystem.recordCustomerServed(
                    this.economySystem.getLevelCoins(),
                    this.economySystem.getLevelScore()
                );

                if (customer && customer.isThief) {
                    this.vfx.shake(0.2, 5);
                    this.vfx.spawnFloatingText(this.loc.t('thief_alert') + ' 🦹', fakeEvent.clientX, fakeEvent.clientY, '#EF4444', 1.4);
                } else if (result.isPerfect) {
                    this.audio.playPerfect();
                    this.vfx.spawnFloatingText(`PERFECT! +$${earnings.earnedCoins}`, fakeEvent.clientX, fakeEvent.clientY, '#2EC4B6', 1.2);
                } else {
                    this.audio.playCoin();
                    this.vfx.spawnFloatingText(`+$${earnings.earnedCoins}`, fakeEvent.clientX, fakeEvent.clientY, '#FFD166', 1.0);
                }
            } else {
                this.audio.playPlateSnap();
                const partialMsg = this.loc.currentLang === 'vi' ? 'MÓN 1/2 XONG! ✓' : 'ITEM DELIVERED! ✓';
                this.vfx.spawnFloatingText(partialMsg, fakeEvent.clientX, fakeEvent.clientY, '#4EE2D5', 1.0);
            }

            this.updateHUD();
            
            // Clean up 2D plate state if in hybrid mode
            this.dishwashingSystem.addDirtyPlate();
            this.updateSinkView();
            
            return true;
        }
        
        return false;
    }

    /**
     * Update visual presentation of a cooking slot
     * @param {string} applianceType 
     * @param {number} slotIndex 
     */
    updateSlotView(applianceType, slotIndex) {
        const slotEl = document.getElementById(`slot-${applianceType}-${slotIndex}`);
        if (!slotEl) return;

        const slot = this.cookingSystem.getSlots(applianceType)[slotIndex];
        if (!slot) return;

        const contentEl = slotEl.querySelector('.slot-content');
        const fillEl = slotEl.querySelector('.slot-progress-fill');
        const fxOverlay = slotEl.querySelector('.cooking-fx-overlay');
        const chipEl = slotEl.querySelector('.slot-status-chip');

        slotEl.className = `appliance-slot ${applianceType}`;
        if (fxOverlay) fxOverlay.innerHTML = '';
        if (chipEl) {
            chipEl.className = 'slot-status-chip';
            chipEl.innerHTML = '';
        }

        if (slot.state === APPLIANCE_SLOT_STATES.EMPTY) {
            contentEl.innerHTML = '';
            fillEl.style.width = '0%';
            fillEl.classList.remove('burnt-warning');
        } else if (slot.state === APPLIANCE_SLOT_STATES.COOKING) {
            slotEl.classList.add('cooking');
            const progress = slot.cookTimeTotal > 0 ? Math.min(1.0, slot.cookTimeElapsed / slot.cookTimeTotal) : 0;
            const pct = Math.round(progress * 100);

            // Dynamic food visual based on stage
            if (slot.ingredientId === 'beef_patty') {
                contentEl.innerHTML = (progress < 0.45) ? SVG_FOOD.beef_patty_raw : SVG_FOOD.beef_patty_cooking;
            } else if (slot.ingredientId === 'potatoes') {
                contentEl.innerHTML = SVG_FOOD.potatoes_raw;
            } else if (slot.ingredientId === 'soda_cup') {
                contentEl.innerHTML = SVG_FOOD.soda_empty;
            }

            // Floating status chip badge
            if (chipEl) {
                chipEl.className = 'slot-status-chip cooking';
                let actionText = this.loc.t(`cooking_${applianceType}`) || 'Đang nấu...';
                let icon = applianceType === 'grill' ? '🔥' : (applianceType === 'fryer' ? '🫧' : '🥤');
                chipEl.innerHTML = `<span class="chip-icon">${icon}</span> <span class="chip-text">${actionText}</span> <span class="chip-pct">${pct}%</span>`;
            }

            fillEl.style.width = `${pct}%`;
            fillEl.classList.remove('burnt-warning');

            // Render dynamic appliance-specific active animations
            if (fxOverlay) {
                if (applianceType === 'grill') {
                    fxOverlay.innerHTML = `
                        <div class="fx-sizzle-heat"></div>
                        <div class="fx-steam-cloud s1"></div>
                        <div class="fx-steam-cloud s2"></div>
                        <div class="fx-steam-cloud s3"></div>
                        <span class="cooking-status-tag tag-grill">🔥</span>
                    `;
                } else if (applianceType === 'fryer') {
                    fxOverlay.innerHTML = `
                        <div class="fx-oil-shimmer"></div>
                        <div class="fx-oil-bubble b1"></div>
                        <div class="fx-oil-bubble b2"></div>
                        <div class="fx-oil-bubble b3"></div>
                        <div class="fx-oil-bubble b4"></div>
                        <span class="cooking-status-tag tag-fryer">🫧</span>
                    `;
                } else if (applianceType === 'dispenser') {
                    fxOverlay.innerHTML = `
                        <div class="fx-dispenser-spout"></div>
                        <div class="fx-liquid-stream"></div>
                        <div class="fx-liquid-splash"></div>
                        <span class="cooking-status-tag tag-dispenser">💧</span>
                    `;
                }
            }
        } else if (slot.state === APPLIANCE_SLOT_STATES.COOKED) {
            slotEl.classList.remove('cooking', 'warning-burn', 'burnt');
            slotEl.classList.add('cooked');
            
            if (applianceType === 'dispenser') {
                fillEl.classList.remove('burnt-warning');
                fillEl.style.width = '100%';
            } else {
                fillEl.classList.add('burnt-warning');
                fillEl.style.width = '0%';
            }

            if (slot.ingredientId === 'beef_patty') contentEl.innerHTML = SVG_FOOD.beef_patty_cooked;
            if (slot.ingredientId === 'potatoes') contentEl.innerHTML = SVG_FOOD.potatoes_cooked;
            if (slot.ingredientId === 'soda_cup') contentEl.innerHTML = SVG_FOOD.soda_full;

            if (chipEl) {
                chipEl.className = 'slot-status-chip ready';
                let readyText = (applianceType === 'dispenser')
                    ? (this.loc.t('food_pour_ready') || 'ĐẦY LY!')
                    : (this.loc.t('food_cooked_ready') || 'ĐÃ CHÍN!');
                let icon = applianceType === 'dispenser' ? '🥤' : '✨';
                chipEl.innerHTML = `<span class="chip-icon">${icon}</span> <span class="chip-text">${readyText}</span>`;
            }
        } else if (slot.state === APPLIANCE_SLOT_STATES.BURNT) {
            slotEl.classList.add('burnt');
            if (slot.ingredientId === 'beef_patty') contentEl.innerHTML = SVG_FOOD.beef_patty_burnt;
            if (slot.ingredientId === 'potatoes') contentEl.innerHTML = SVG_FOOD.potatoes_burnt;

            fillEl.style.width = '100%';
            fillEl.classList.add('burnt-warning');

            if (chipEl) {
                chipEl.className = 'slot-status-chip burnt';
                let burntText = this.loc.t('food_burnt') || 'BỊ CHÁY!';
                chipEl.innerHTML = `<span class="chip-icon">💀</span> <span class="chip-text">${burntText}</span>`;
            }
        } else if (slot.state === APPLIANCE_SLOT_STATES.BROKEN) {
            slotEl.className = `appliance-slot ${applianceType} broken`;
            contentEl.innerHTML = '';
            fillEl.style.width = '0%';
            if (fxOverlay) {
                fxOverlay.innerHTML = `
                    <div class="broken-overlay">
                        ${SVG_ICONS.wrench}
                        <span class="repair-taps-badge">SỬA: ${slot.repairTaps}x</span>
                    </div>
                `;
            }
        }
    }

    /**
     * Update plate content visual
     * @param {number} plateIndex 
     */
    updatePlateView(plateIndex) {
        const contentEl = document.getElementById(`plate-content-${plateIndex}`);
        const plateEl = document.getElementById(`plate-${plateIndex}`);
        if (!contentEl || !plateEl) return;

        const plate = this.assemblySystem.getPlate(plateIndex);
        if (!plate || plate.ingredients.length === 0) {
            contentEl.innerHTML = '';
            plateEl.classList.remove('has-dish');
        } else {
            plateEl.classList.add('has-dish');
            let badge = '';
            if (plate.matchedRecipe) {
                const recipeName = this.loc.t(`recipe_${plate.matchedRecipe.id}`) || plate.matchedRecipe.name;
                badge = `<div class="dish-badge">${recipeName}</div>`;
            }
            contentEl.innerHTML = getAssembledDishSvg(plate.ingredients) + badge;
        }
    }

    /**
     * Update customer seat DOM
     * @param {number} seatIndex 
     */
    updateSeatView(seatIndex) {
        const seatEl = document.getElementById(`seat-${seatIndex}`);
        if (!seatEl) return;

        const customer = this.customerSystem.getCustomerBySeat(seatIndex);
        if (!customer) {
            seatEl.innerHTML = '';
            seatEl.className = 'counter-seat';
            return;
        }

        const isThiefLeaving = customer.state === CUSTOMER_STATES.THIEF_LEAVING;
        seatEl.className = `counter-seat ${isThiefLeaving ? 'has-thief' : ''}`;

        if (isThiefLeaving) {
            const thiefRatio = Math.max(0, customer.leaveTimer / customer.thiefTimer);
            seatEl.innerHTML = `
                <div class="customer-card thief">
                    <div class="thief-escape-bubble">
                        ${SVG_ICONS.thief}
                        <span>${this.loc.t('thief_alert')}</span>
                        <div class="thief-timer-bar">
                            <div class="thief-timer-fill" style="width: ${Math.round(thiefRatio * 100)}%;"></div>
                        </div>
                    </div>
                    <div class="customer-avatar-figure thief">
                        ${getCustomerCharacterSvg(customer, 0, CUSTOMER_STATES.THIEF_LEAVING)}
                        <span class="customer-nametag thief-tag">🦹 KẺ QUỴT TIỀN!</span>
                    </div>
                </div>
            `;
            return;
        }

        const order = this.orderSystem.getOrderByCustomerId(customer.id);
        let orderContentHtml = '';

        if (order && order.items && order.items.length > 1) {
            const itemsHtml = order.items.map(item => {
                const name = this.loc.t(`recipe_${item.recipeId}`) || item.recipe?.name || item.recipeId;
                return `
                    <div class="order-subitem ${item.fulfilled ? 'delivered' : ''}">
                        <span>${name}</span>
                    </div>
                `;
            }).join('');

            orderContentHtml = `
                <div class="order-bubble multi">
                    ${itemsHtml}
                    <div class="patience-bar-container">
                        <div class="patience-bar-fill" id="pbar-${customer.id}" style="width: ${Math.round(customer.patienceRatio * 100)}%;"></div>
                    </div>
                </div>
            `;
        } else {
            const orderRecipeName = order ? (this.loc.t(`recipe_${order.recipeId}`) || order.recipe?.name) : 'Food';
            orderContentHtml = `
                <div class="order-bubble">
                    <span>${orderRecipeName}</span>
                    <div class="patience-bar-container">
                        <div class="patience-bar-fill" id="pbar-${customer.id}" style="width: ${Math.round(customer.patienceRatio * 100)}%;"></div>
                    </div>
                </div>
            `;
        }

        const isUrgent = customer.patienceRatio < 0.35;
        const charSvg = getCustomerCharacterSvg(customer, customer.patienceRatio, customer.state);
        const customerName = customer.archetype?.name || 'Thực Khách';

        seatEl.innerHTML = `
            <div class="customer-card ${isUrgent ? 'urgent' : ''} ${customer.state === CUSTOMER_STATES.HAPPY_LEAVING ? 'happy' : (customer.state === CUSTOMER_STATES.ANGRY_LEAVING ? 'angry' : '')}">
                ${orderContentHtml}
                <div class="customer-avatar-figure" id="cust-fig-${customer.id}" title="${customer.archetype?.title || customerName}">
                    ${charSvg}
                    <span class="customer-nametag">${customerName}</span>
                </div>
            </div>
        `;
    }

    /**
     * Handle sink click to wash dirty plates
     */
    handleSinkClick() {
        if (this.gm.currentState !== GAME_STATES.GAMEPLAY) return;
        if (!this.dishwashingSystem.enabled) return;

        if (this.dishwashingSystem.dirtyPlates > 0 && !this.dishwashingSystem.isWashing) {
            this.audio.playPlateSnap();
            this.dishwashingSystem.startWashing();
            this.updateSinkView();
        } else if (this.dishwashingSystem.isWashing) {
            this.vfx.spawnFloatingText(this.loc.t('washing_in_progress'), 400, 300, '#38BDF8');
        } else {
            this.vfx.spawnFloatingText('KHÔNG CÓ ĐĨA BẨN ✨', 400, 300, '#4EE2D5');
        }
    }

    /**
     * Update dishwashing sink visual
     */
    updateSinkView() {
        const sinkEl = document.getElementById('sink-station');
        if (!sinkEl) return;

        if (!this.dishwashingSystem.enabled) {
            sinkEl.style.opacity = '0.4';
            return;
        }
        sinkEl.style.opacity = '1.0';

        const iconContainer = document.getElementById('sink-icon-container');
        const cleanBadge = document.getElementById('sink-clean-badge');
        const dirtyBadge = document.getElementById('sink-dirty-badge');
        const progressFill = document.getElementById('sink-progress-fill');

        if (cleanBadge) cleanBadge.textContent = `✨ ${this.dishwashingSystem.cleanPlates}`;
        if (dirtyBadge) dirtyBadge.textContent = `🍽️ ${this.dishwashingSystem.dirtyPlates}`;

        if (this.dishwashingSystem.isWashing) {
            sinkEl.classList.add('washing');
            sinkEl.classList.remove('needs-wash');
            if (iconContainer) iconContainer.innerHTML = SVG_ICONS.sink_washing;
            if (progressFill) progressFill.style.width = `${Math.round(this.dishwashingSystem.getWashProgress() * 100)}%`;
        } else {
            sinkEl.classList.remove('washing');
            if (iconContainer) iconContainer.innerHTML = SVG_ICONS.sink;
            if (progressFill) progressFill.style.width = '0%';

            if (this.dishwashingSystem.cleanPlates === 0 && this.dishwashingSystem.dirtyPlates > 0) {
                sinkEl.classList.add('needs-wash');
            } else {
                sinkEl.classList.remove('needs-wash');
            }
        }
    }

    /**
     * Player taps seat to catch fleeing thief
     * @param {number} seatIndex 
     */
    handleSeatClick(seatIndex, event) {
        const customer = this.customerSystem.getCustomerBySeat(seatIndex);
        if (!customer) return;

        if (customer.state === CUSTOMER_STATES.THIEF_LEAVING) {
            const caught = this.customerSystem.catchThief(customer.id);
            if (caught) {
                this.audio.playPerfect();
                this.vfx.shake(0.2, 5);
                const bounty = Math.round((caught.recoveredEarnings?.earnedCoins || 20) * 0.5);
                this.economySystem.recordDishServed({
                    baseCoins: bounty,
                    tipCoins: 0,
                    baseScore: 150,
                    isPerfect: true
                });
                const catchMsg = this.loc.currentLang === 'vi' 
                    ? `BẮT ĐƯỢC KẺ TRỘM! +$${bounty} 💰✨` 
                    : `THIEF CAUGHT! +$${bounty} 💰✨`;
                this.vfx.spawnFloatingText(catchMsg, event.clientX || 300, event.clientY || 200, '#2EC4B6', 1.4);
                this.levelSystem.recordCustomerServed(
                    this.economySystem.getLevelCoins(),
                    this.economySystem.getLevelScore()
                );
                this.updateSeatView(seatIndex);
                this.updateHUD();
            }
        }
    }

    /**
     * Update HUD values
     */
    updateHUD() {
        document.getElementById('hud-coins').textContent = this.economySystem.getLevelCoins();
        document.getElementById('hud-score').textContent = this.economySystem.getLevelScore();

        const comboEl = document.getElementById('hud-combo');
        const comboVal = document.getElementById('hud-combo-val');
        const combo = this.economySystem.getCombo();

        if (combo > 1) {
            comboEl.style.display = 'flex';
            comboVal.textContent = `x${combo}`;
            comboEl.classList.toggle('frenzy', combo >= 5);
        } else {
            comboEl.style.display = 'none';
        }
    }

    /**
     * Bind system event subscriptions
     */
    bindSystemEvents() {
        const eb = this.gm.eventBus;

        eb.on('GAME_STATE_CHANGED', ({ previousState, currentState, payload }) => {
            this.handleStateChange(currentState, payload, previousState);
        });

        eb.on('COOKING_STARTED', ({ applianceType, slotIndex }) => {
            this.updateSlotView(applianceType, slotIndex);
        });

        eb.on('COOKING_PROGRESS', ({ applianceType, slotIndex, progress }) => {
            const slotEl = document.getElementById(`slot-${applianceType}-${slotIndex}`);
            if (slotEl) {
                const fillEl = slotEl.querySelector('.slot-progress-fill');
                if (fillEl) fillEl.style.width = `${Math.round(progress * 100)}%`;

                const chipEl = slotEl.querySelector('.slot-status-chip');
                if (chipEl && chipEl.classList.contains('cooking')) {
                    const pctEl = chipEl.querySelector('.chip-pct');
                    if (pctEl) pctEl.textContent = `${Math.round(progress * 100)}%`;
                }

                // If beef patty reaches >= 45% progress, visually switch to sizzling browned patty!
                if (applianceType === 'grill' && progress >= 0.45) {
                    const contentEl = slotEl.querySelector('.slot-content');
                    if (contentEl && !contentEl.querySelector('.patty-cooking-svg')) {
                        contentEl.innerHTML = SVG_FOOD.beef_patty_cooking;
                    }
                }
            }
        });

        eb.on('COOKING_FINISHED', ({ applianceType, slotIndex }) => {
            this.updateSlotView(applianceType, slotIndex);
            this.audio.playPerfect();
        });

        eb.on('COOKING_BURN_PROGRESS', ({ applianceType, slotIndex, burnProgress }) => {
            if (applianceType === 'dispenser') return;

            const slotEl = document.getElementById(`slot-${applianceType}-${slotIndex}`);
            if (slotEl) {
                const fillEl = slotEl.querySelector('.slot-progress-fill');
                if (fillEl) {
                    fillEl.classList.add('burnt-warning');
                    fillEl.style.width = `${Math.round(burnProgress * 100)}%`;
                }

                const chipEl = slotEl.querySelector('.slot-status-chip');
                if (chipEl) {
                    if (burnProgress >= 0.65) {
                        slotEl.classList.add('warning-burn');
                        chipEl.className = 'slot-status-chip warning';
                        let warnText = this.loc.t('food_burn_warning') || 'SẮP CHÁY!';
                        chipEl.innerHTML = `<span class="chip-icon">⚠️</span> <span class="chip-text">${warnText}</span>`;
                    } else {
                        slotEl.classList.remove('warning-burn');
                        chipEl.className = 'slot-status-chip ready';
                        let readyText = this.loc.t('food_cooked_ready') || 'ĐÃ CHÍN!';
                        chipEl.innerHTML = `<span class="chip-icon">✨</span> <span class="chip-text">${readyText}</span>`;
                    }
                }
            }
        });

        eb.on('COOKING_BURN_WARNING', ({ applianceType, slotIndex, burnProgress }) => {
            if (applianceType === 'dispenser') return; // Drinks never burn or show burn warnings

            const slotEl = document.getElementById(`slot-${applianceType}-${slotIndex}`);
            if (slotEl) {
                slotEl.classList.add('warning-burn');
                const fillEl = slotEl.querySelector('.slot-progress-fill');
                if (fillEl) {
                    fillEl.classList.add('burnt-warning');
                    fillEl.style.width = `${Math.round(burnProgress * 100)}%`;
                }
                const chipEl = slotEl.querySelector('.slot-status-chip');
                if (chipEl) {
                    chipEl.className = 'slot-status-chip warning';
                    let warnText = this.loc.t('food_burn_warning') || 'SẮP CHÁY!';
                    chipEl.innerHTML = `<span class="chip-icon">⚠️</span> <span class="chip-text">${warnText}</span>`;
                }
            }
        });

        eb.on('COOKING_BURNT', ({ applianceType, slotIndex }) => {
            if (applianceType === 'dispenser') return; // Drinks never burn
            this.updateSlotView(applianceType, slotIndex);
            this.audio.playFail();
            this.vfx.shake(0.2, 6);
        });

        eb.on('CUSTOMER_ARRIVED', ({ customer }) => {
            this.orderSystem.createOrder(customer.id, customer.orderRecipes || customer.orderRecipeId, customer.totalPatience);
            this.updateSeatView(customer.seatIndex);
            this.renderOvercookedOrders();
        });

        eb.on('APPLIANCE_BROKEN', ({ applianceType, slotIndex }) => {
            this.updateSlotView(applianceType, slotIndex);
        });

        eb.on('APPLIANCE_REPAIRED', ({ applianceType, slotIndex }) => {
            this.updateSlotView(applianceType, slotIndex);
        });

        eb.on('CUSTOMER_THIEF_START', ({ seatIndex }) => {
            this.updateSeatView(seatIndex);
        });

        eb.on('CUSTOMER_THIEF_TICK', ({ seatIndex, progressRatio }) => {
            const seatEl = document.getElementById(`seat-${seatIndex}`);
            if (seatEl) {
                const fill = seatEl.querySelector('.thief-timer-fill');
                if (fill) fill.style.width = `${Math.round(progressRatio * 100)}%`;
            }
        });

        eb.on('CUSTOMER_THIEF_ESCAPED', ({ lostEarnings } = {}) => {
            this.audio.playFail();
            this.economySystem.breakCombo('thief_escaped');
            if (lostEarnings && lostEarnings.earnedCoins) {
                this.economySystem.deductLevelCoins(lostEarnings.earnedCoins);
            }
            this.vfx.shake(0.2, 5);
            this.vfx.spawnFloatingText(this.loc.t('thief_escaped'), 300, 150, '#94A3B8', 1.2);
            this.updateHUD();
        });

        eb.on('SINK_STATE_CHANGED', () => {
            this.updateSinkView();
        });

        eb.on('SINK_WASH_TICK', ({ progress }) => {
            const fill = document.getElementById('sink-progress-fill');
            if (fill) fill.style.width = `${Math.round(progress * 100)}%`;
        });

        eb.on('SINK_WASH_COMPLETED', ({ cleanPlates }) => {
            this.audio.playPerfect();
            this.vfx.spawnFloatingText(`ĐĨA SẠCH SẴN SÀNG! ✨ (${cleanPlates})`, 400, 300, '#4ADE80', 1.2);
            this.updateSinkView();
        });

        eb.on('CUSTOMER_PATIENCE_UPDATED', ({ customerId, seatIndex, patienceRatio }) => {
            const pbar = document.getElementById(`pbar-${customerId}`);
            if (pbar) {
                pbar.style.width = `${Math.round(patienceRatio * 100)}%`;
                pbar.classList.toggle('medium', patienceRatio < 0.65 && patienceRatio >= 0.35);
                pbar.classList.toggle('urgent', patienceRatio < 0.35);
            }

            if (seatIndex !== undefined) {
                const seatEl = document.getElementById(`seat-${seatIndex}`);
                if (seatEl) {
                    const card = seatEl.querySelector('.customer-card');
                    if (card) {
                        const wasUrgent = card.classList.contains('urgent');
                        const nowUrgent = patienceRatio < 0.35;
                        if (wasUrgent !== nowUrgent) {
                            card.classList.toggle('urgent', nowUrgent);
                            const customer = this.customerSystem.getCustomerBySeat(seatIndex);
                            if (customer) {
                                const fig = seatEl.querySelector('.customer-avatar-figure');
                                if (fig) {
                                    fig.innerHTML = `
                                        ${getCustomerCharacterSvg(customer, patienceRatio, customer.state)}
                                        <span class="customer-nametag">${customer.archetype?.name || 'Thực Khách'}</span>
                                    `;
                                }
                            }
                        }
                    }
                }
            }
        });

        eb.on('CUSTOMER_SERVED_HAPPY', ({ customer }) => {
            this.updateSeatView(customer.seatIndex);
        });

        eb.on('CUSTOMER_ANGRY_LEAVING', ({ customer }) => {
            this.orderSystem.failOrderByCustomerId(customer.id);
            this.levelSystem.recordCustomerLost(
                this.economySystem.getLevelCoins(),
                this.economySystem.getLevelScore()
            );
            this.economySystem.breakCombo('customer_angry');
            this.audio.playFail();
            this.vfx.shake(0.25, 6);
            this.updateSeatView(customer.seatIndex);
            this.renderOvercookedOrders();
        });

        eb.on('CUSTOMER_DEPARTED', ({ seatIndex }) => {
            this.updateSeatView(seatIndex);
        });

        eb.on('LEVEL_TIMER_TICK', ({ timeRemaining }) => {
            const timerEl = document.getElementById('hud-timer');
            const badge = document.getElementById('hud-timer-badge');
            if (timerEl) {
                timerEl.textContent = timeRemaining;
                if (badge) badge.classList.toggle('urgent', timeRemaining <= 15);
            }
        });

        eb.on('LEVEL_WON', (results) => {
            if (this.gm.currentState !== GAME_STATES.LEVEL_COMPLETE) {
                this.gm.onLevelComplete(results);
            }
        });

        eb.on('LEVEL_LOST', (results) => {
            if (this.gm.currentState !== GAME_STATES.LEVEL_FAILED) {
                this.gm.onLevelFailed(results);
            }
        });

        eb.on('LANGUAGE_CHANGED', () => {
            this.updateAllTexts();
        });

        if (this.loc && this.loc.eventBus && this.loc.eventBus !== eb) {
            this.loc.eventBus.on('LANGUAGE_CHANGED', () => {
                this.updateAllTexts();
            });
        }
    }

    /**
     * Handle high-level game state transitions
     */
    handleStateChange(state, payload, previousState) {
        this.hideAllOverlays();

        if (state === GAME_STATES.MAIN_MENU || state === GAME_STATES.LEVEL_SELECT || state === GAME_STATES.UPGRADE_SHOP) {
            ['theme-diner-neon', 'theme-beach-tiki', 'theme-retro-80s', 'theme-gourmet-bistro', 'theme-tokyo-night'].forEach(t => {
                this.container?.classList.remove(t);
            });
            const pill = document.getElementById('theme-ambient-pill');
            if (pill) pill.remove();
        }

        const joystickEl = document.getElementById('virtual-joystick-container');
        const actionsEl = document.getElementById('virtual-actions-container');
        const ordersEl = document.getElementById('overcooked-orders-bar');
        const promptEl = document.getElementById('station-prompt-pill');

        if (state === GAME_STATES.GAMEPLAY) {
            if (joystickEl) joystickEl.style.display = 'block';
            if (actionsEl) actionsEl.style.display = 'flex';
            if (ordersEl) ordersEl.style.display = 'flex';
        } else {
            if (joystickEl) joystickEl.style.display = 'none';
            if (actionsEl) actionsEl.style.display = 'none';
            if (ordersEl) ordersEl.style.display = 'none';
            if (promptEl) promptEl.style.display = 'none';
        }

        switch (state) {
            case GAME_STATES.MAIN_MENU:
                this.showOverlay('overlay-main-menu');
                break;
            case GAME_STATES.LEVEL_SELECT:
                this.showLevelSelect();
                break;
            case GAME_STATES.LEVEL_INTRO:
                this.showLevelIntro(payload ? payload.levelNumber : this.gm.selectedLevelNumber);
                break;
            case GAME_STATES.GAMEPLAY:
                if (previousState !== GAME_STATES.PAUSED) {
                    this.resetGameplayView();
                }
                break;
            case GAME_STATES.PAUSED:
                this.showOverlay('overlay-pause');
                break;
            case GAME_STATES.LEVEL_COMPLETE:
                this.showVictory(payload);
                break;
            case GAME_STATES.LEVEL_FAILED:
                this.showDefeat(payload);
                break;
            case GAME_STATES.UPGRADE_SHOP:
                this.showShop();
                break;
        }
    }

    hideAllOverlays() {
        document.querySelectorAll('.ui-overlay').forEach(el => el.classList.remove('active'));
    }

    showOverlay(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    }

    hideOverlay(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    }

    /**
     * Update current difficulty indicator in Level Select screen
     */
    updateLevelSelectDiffBadge() {
        const badgeEl = document.getElementById('level-select-diff-badge');
        if (!badgeEl) return;
        badgeEl.textContent = `🍳 BÌNH THƯỜNG`;
    }

    showLevelSelect() {
        this.hideAllOverlays();
        this.updateLevelSelectDiffBadge();
        const grid = document.getElementById('levels-grid');
        grid.innerHTML = '';

        const maxUnlocked = this.gm.saveManager.get('maxUnlockedLevel') || 1;
        const levelStars = this.gm.saveManager.get('levelStars') || {};
        const total = getTotalLevels();

        for (let i = 1; i <= total; i++) {
            const isLocked = i > maxUnlocked;
            const starsEarned = levelStars[i] || 0;

            const card = document.createElement('div');
            card.className = `level-card ${isLocked ? 'locked' : ''}`;
            card.innerHTML = `
                <span class="level-num">${isLocked ? '🔒' : i}</span>
                <div class="level-stars-row">
                    ${[1, 2, 3].map(s => `
                        <div class="star-mini">${s <= starsEarned ? SVG_ICONS.star : SVG_ICONS.star_empty}</div>
                    `).join('')}
                </div>
            `;

            if (!isLocked) {
                card.addEventListener('click', () => {
                    this.audio.playClick();
                    this.gm.startLevel(i);
                });
            }

            grid.appendChild(card);
        }

        this.showOverlay('overlay-level-select');
    }

    showLevelIntro(levelNumber) {
        const lvlNum = (levelNumber !== undefined) ? levelNumber : (this.gm.selectedLevelNumber !== undefined ? this.gm.selectedLevelNumber : 1);
        const lvl = getLevel(lvlNum);
        if (!lvl) {
            console.error(`[UIManager] Level config not found for level ${lvlNum}`);
            return;
        }

        const isVi = this.loc.getLanguage() === 'vi';
        const levelTitleKey = `level_${lvlNum}_title`;
        const levelSubKey = `level_${lvlNum}_sub`;
        const translatedTitle = this.loc.t(levelTitleKey);
        const translatedSub = this.loc.t(levelSubKey);

        const titleText = (lvlNum === 0)
            ? (isVi ? '🎓 Màn Hướng Dẫn: Bếp Tập Sự' : '🎓 Tutorial: Kitchen Academy')
            : (isVi 
                ? `Màn ${lvlNum}: ${translatedTitle !== levelTitleKey ? translatedTitle : lvl.title}`
                : `Level ${lvlNum}: ${translatedTitle !== levelTitleKey ? translatedTitle : lvl.title}`);
        const subText = translatedSub !== levelSubKey ? translatedSub : lvl.subtitle;

        const diffConfig = this.gm.getDifficultyConfig();
        const targetCoins = Math.round(lvl.targetCoins * (diffConfig.targetCoinsMultiplier || diffConfig.targetCoinMultiplier || 1));
        const timeLimit = Math.round(lvl.timeLimit * (diffConfig.timeMultiplier || diffConfig.timeLimitMultiplier || 1));

        document.getElementById('intro-title').textContent = titleText;
        document.getElementById('intro-subtitle').textContent = subText;
        document.getElementById('intro-target-coins').textContent = `$${targetCoins}`;
        document.getElementById('intro-time-limit').textContent = `${timeLimit}s`;

        this.showOverlay('overlay-level-intro');
    }

    resetGameplayView() {
        this.cookingSystem.resetAll();
        this.assemblySystem.resetAll();
        this.customerSystem.reset();
        this.orderSystem.reset();
        this.economySystem.resetLevelSession();

        const diffConfig = this.gm.getDifficultyConfig();
        const lvl = getLevel(this.gm.selectedLevelNumber) || {};

        // 5 Lively Atmospheric Background Themes (randomized per level)
        const THEMES = [
            { id: 'theme-diner-neon', name: '🌆 Neon Diner' },
            { id: 'theme-beach-tiki', name: '🌴 Beach Tiki' },
            { id: 'theme-retro-80s', name: '🕹️ Retro 80s' },
            { id: 'theme-gourmet-bistro', name: '🍷 Gourmet Bistro' },
            { id: 'theme-tokyo-night', name: '🏮 Tokyo Night' }
        ];
        const chosenTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
        THEMES.forEach(t => this.container?.classList.remove(t.id));
        this.container?.classList.add(chosenTheme.id);

        const counter = document.getElementById('customer-counter');
        if (counter) {
            let pill = document.getElementById('theme-ambient-pill');
            if (!pill) {
                pill = document.createElement('div');
                pill.id = 'theme-ambient-pill';
                pill.className = 'theme-ambient-pill';
                counter.appendChild(pill);
            }
            pill.textContent = chosenTheme.name;
        }

        // Apply player upgrades and difficulty balancing to systems
        const speedMultiplier = this.upgradeSystem.getCookingSpeedMultiplier();
        const patienceMultiplier = this.upgradeSystem.getCustomerPatienceMultiplier() * diffConfig.patienceMultiplier;
        const grillSlots = this.upgradeSystem.getGrillSlotsCount();
        const assemblySlots = this.upgradeSystem.getAssemblySlotsCount();

        this.cookingSystem.configure({
            grillCount: grillSlots,
            speedMultiplier,
            overcookMultiplier: diffConfig.overcookMultiplier
        });
        this.cookingSystem.configureBreakdowns({
            enabled: Boolean(lvl.hasBreakdowns),
            interval: lvl.breakdownInterval || 22.0
        });

        this.customerSystem.configure({
            maxSeats: 3,
            patienceMultiplier
        });
        this.assemblySystem.configure(assemblySlots);
        this.dishwashingSystem.configure({
            maxPlates: assemblySlots,
            enabled: Boolean(lvl.hasPlateWashing)
        });
        this.updateSinkView();

        this.economySystem.setScoreMultiplier(diffConfig.scoreMultiplier);

        // Scrambled ingredient bins
        const bar = document.getElementById('ingredients-bar');
        if (bar) {
            const bins = Array.from(bar.querySelectorAll('.ingredient-bin'));
            if (lvl.shuffleIngredients) {
                for (let i = bins.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [bins[i], bins[j]] = [bins[j], bins[i]];
                }
                bins.forEach(b => {
                    b.classList.add('shuffling');
                    bar.appendChild(b);
                    setTimeout(() => b.classList.remove('shuffling'), 600);
                });
                this.vfx.spawnFloatingText(this.loc.t('bins_shuffled_alert'), window.innerWidth / 2, window.innerHeight - 80, '#F59E0B', 1.4);
            } else {
                const defaultOrder = ['bun_bottom', 'beef_patty', 'cheese_slice', 'lettuce', 'tomato_slice', 'potatoes', 'soda_cup'];
                defaultOrder.forEach(id => {
                    const found = bins.find(b => b.dataset.ingredient === id);
                    if (found) bar.appendChild(found);
                });
            }
        }

        this.renderApplianceSlots();
        this.renderAssemblyPlates();

        // Reset 3D Chef and Stations for the new round
        if (this.kitchen3D) {
            if (this.kitchen3D.chef) {
                this.kitchen3D.chef.position.set(0, 0, 0.6);
                this.kitchen3D.chef.group.position.set(0, 0, 0.6);
                this.kitchen3D.chef.targetRotation = 0;
                this.kitchen3D.chef.currentRotation = 0;
                this.kitchen3D.chef.group.rotation.y = 0;
                this.kitchen3D.chef.velocity.set(0, 0);
                this.kitchen3D.chef.setHeldItem(null);
                this.kitchen3D.chef.setChopping(false);
            }
            if (this.kitchen3D.stations) {
                this.kitchen3D.stations.forEach(s => {
                    s.setItem(null);
                    if (s.type === 'PLATE_RACK') {
                        s.cleanPlates = 4;
                        s.updatePlateStackVisual();
                    } else if (s.type === 'SINK') {
                        s.dirtyPlates = 0;
                        s.washProgress = 0;
                        s.updateDirtyPlateStackVisual();
                    }
                });
            }
        }
        this.renderOvercookedOrders();

        for (let i = 0; i < 3; i++) {
            this.updateSeatView(i);
        }

        this.levelSystem.startLevel(this.gm.selectedLevelNumber, this.gm.currentDifficulty);
        this.updateHUD();

        // Tutorial Level 0 Guide or New Mechanic In-Game Callout
        if (this.gm.selectedLevelNumber === 0) {
            this.initTutorialGuide();
        } else {
            const guideBar = document.getElementById('tutorial-guide-bar');
            if (guideBar) guideBar.style.display = 'none';
            this.dismissGameplayCallout();
        }
    }

    showVictory(results = {}) {
        this.vfx.spawnConfetti();
        const score = results.score !== undefined ? results.score : this.economySystem.getLevelScore();
        const coins = results.coinsEarned !== undefined ? results.coinsEarned : this.economySystem.getLevelCoins();
        const bonus = results.bonusReward || 0;

        document.getElementById('v-score').textContent = score;
        document.getElementById('v-coins').textContent = `+$${coins + bonus}`;

        // Credit coins to player wallet
        this.economySystem.addWalletCoins(coins + bonus, 'level_victory');

        const stars = [
            document.getElementById('v-star-1'),
            document.getElementById('v-star-2'),
            document.getElementById('v-star-3')
        ];
        stars.forEach(s => s && s.classList.remove('active'));

        this.showOverlay('overlay-victory');

        // Staggered star reveal animation
        const numStars = results.stars || 1;
        for (let i = 0; i < numStars; i++) {
            setTimeout(() => {
                if (stars[i]) stars[i].classList.add('active');
                this.audio.playCoin();
            }, 300 + i * 250);
        }
    }

    showDefeat(results = {}) {
        const isTimeExpired = results.reason === 'TIME_EXPIRED';
        const coins = results.coinsEarned !== undefined ? results.coinsEarned : this.economySystem.getLevelCoins();
        const target = results.targetCoins || (this.levelSystem.config ? this.levelSystem.config.targetCoins : 60);

        const msg = isTimeExpired
            ? this.loc.t('defeat_reason_time', { earned: `$${coins}`, target: `$${target}` })
            : this.loc.t('defeat_reason_quota');

        const reasonEl = document.getElementById('defeat-reason');
        if (reasonEl) reasonEl.textContent = msg;

        this.showOverlay('overlay-defeat');
    }

    showShop() {
        this.hideAllOverlays();
        const walletCoins = this.economySystem.getTotalCoins();
        document.getElementById('shop-wallet-coins').textContent = walletCoins;

        const list = document.getElementById('shop-items-list');
        list.innerHTML = '';

        for (const [id, config] of Object.entries(UPGRADES)) {
            const info = this.upgradeSystem.getUpgradeInfo(id);
            const card = document.createElement('div');
            card.className = 'upgrade-card';

            const canBuy = this.upgradeSystem.canPurchase(id);
            const btnText = info.isMaxLevel ? this.loc.t('btn_max') : `${this.loc.t('btn_buy')} $${info.nextCost}`;
            const upgName = this.loc.t(`upg_${id}_name`) || config.name;
            const upgDesc = this.loc.t(`upg_${id}_desc`) || config.description;

            card.innerHTML = `
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgName}</div>
                    <div class="upgrade-desc">${upgDesc}</div>
                    <div class="upgrade-level-dots">
                        ${Array.from({ length: config.maxLevel }).map((_, idx) => `
                            <div class="level-dot ${idx < info.currentLevel ? 'filled' : ''}"></div>
                        `).join('')}
                    </div>
                </div>
                <button class="btn btn-gold btn-buy-upgrade" data-upgrade="${id}" ${canBuy ? '' : 'disabled'}>
                    ${btnText}
                </button>
            `;

            const buyBtn = card.querySelector('.btn-buy-upgrade');
            if (canBuy) {
                buyBtn.addEventListener('click', () => {
                    this.audio.playCoin();
                    this.upgradeSystem.purchaseUpgrade(id);
                    this.showShop(); // Refresh shop view
                });
            }

            list.appendChild(card);
        }

        this.showOverlay('overlay-shop');
    }

    /**
     * Persist audio setting change
     * @param {string} key 
     * @param {*} val 
     */
    saveAudioSetting(key, val) {
        const settings = this.gm.saveManager.get('settings') || {};
        settings[key] = val;
        this.gm.saveManager.set('settings', settings);
    }

    /**
     * Update settings modal button and slider values
     */
    updateSettingsControls() {
        const lang = this.loc.getLanguage();
        const btnVi = document.getElementById('btn-lang-vi');
        const btnEn = document.getElementById('btn-lang-en');
        if (btnVi && btnEn) {
            btnVi.classList.toggle('active', lang === 'vi');
            btnEn.classList.toggle('active', lang === 'en');
        }

        // Difficulty Buttons & Subtext
        const currentDiff = this.gm.currentDifficulty || 'normal';
        ['easy', 'normal', 'hard', 'expert'].forEach(d => {
            const btn = document.getElementById(`btn-diff-${d}`);
            if (btn) btn.classList.toggle('active', d === currentDiff);
        });
        const diffDesc = document.getElementById('diff-desc');
        if (diffDesc) {
            diffDesc.textContent = this.loc.t(`diff_${currentDiff}_desc`);
        }

        // BGM Switch
        const btnBgm = document.getElementById('btn-toggle-bgm');
        if (btnBgm) {
            btnBgm.classList.toggle('active', this.audio.isBgmEnabled);
            btnBgm.classList.toggle('inactive', !this.audio.isBgmEnabled);
            btnBgm.textContent = this.audio.isBgmEnabled ? this.loc.t('setting_on') : this.loc.t('setting_off');
        }

        // BGM Slider
        const sliderBgm = document.getElementById('slider-bgm');
        const valBgm = document.getElementById('val-bgm');
        if (sliderBgm && valBgm) {
            const pct = Math.round(this.audio.bgmVolume * 100);
            sliderBgm.value = pct;
            valBgm.textContent = `${pct}%`;
        }

        // SFX Switch
        const btnSfx = document.getElementById('btn-toggle-sfx');
        if (btnSfx) {
            btnSfx.classList.toggle('active', this.audio.isSfxEnabled);
            btnSfx.classList.toggle('inactive', !this.audio.isSfxEnabled);
            btnSfx.textContent = this.audio.isSfxEnabled ? this.loc.t('setting_on') : this.loc.t('setting_off');
        }

        // SFX Slider
        const sliderSfx = document.getElementById('slider-sfx');
        const valSfx = document.getElementById('val-sfx');
        if (sliderSfx && valSfx) {
            const pct = Math.round(this.audio.sfxVolume * 100);
            sliderSfx.value = pct;
            valSfx.textContent = `${pct}%`;
        }
    }

    /**
     * Open settings overlay
     */
    showSettings() {
        this.updateSettingsControls();
        this.showOverlay('overlay-settings');
    }

    /**
     * Live re-translate all interface elements
     */
    updateAllTexts() {
        const t = (k, p) => this.loc.t(k, p);

        // Subtitle & main menu
        const subtitle = document.getElementById('game-subtitle');
        if (subtitle) subtitle.textContent = t('game_subtitle');

        const btnPlay = document.getElementById('btn-play-game');
        if (btnPlay) btnPlay.textContent = t('btn_play');

        const btnUpgrades = document.getElementById('btn-open-shop');
        if (btnUpgrades) btnUpgrades.textContent = t('btn_upgrades');

        const btnHowTo = document.getElementById('btn-how-to-play');
        if (btnHowTo) btnHowTo.textContent = t('btn_how_to');

        const btnSettings = document.getElementById('btn-open-settings');
        if (btnSettings) btnSettings.textContent = `⚙️ ${t('btn_settings')}`;

        // Stations
        const tg = document.getElementById('title-grill'); if (tg) tg.textContent = t('grill_station');
        const tf = document.getElementById('title-fryer'); if (tf) tf.textContent = t('fryer_station');
        const td = document.getElementById('title-dispenser'); if (td) td.textContent = t('dispenser_station');
        const tp = document.getElementById('title-plates'); if (tp) tp.textContent = t('assembly_station');
        const tt = document.getElementById('title-trash'); if (tt) tt.textContent = t('trash_station');
        const tsk = document.getElementById('title-sink'); if (tsk) tsk.textContent = t('sink_station');

        // Ingredients
        const lb = document.getElementById('lbl-bun'); if (lb) lb.textContent = t('bun_bottom');
        const lp = document.getElementById('lbl-patty'); if (lp) lp.textContent = t('beef_patty');
        const lc = document.getElementById('lbl-cheese'); if (lc) lc.textContent = t('cheese_slice');
        const ll = document.getElementById('lbl-lettuce'); if (ll) ll.textContent = t('lettuce');
        const lt = document.getElementById('lbl-tomato'); if (lt) lt.textContent = t('tomato_slice');
        const lpo = document.getElementById('lbl-potatoes'); if (lpo) lpo.textContent = t('potatoes');
        const ls = document.getElementById('lbl-soda'); if (ls) ls.textContent = t('soda_cup');

        // Level Select
        const lst = document.getElementById('level-select-title'); if (lst) lst.textContent = t('level_select_title');
        const lss = document.getElementById('level-select-subtitle'); if (lss) lss.textContent = t('level_select_subtitle');
        const bbm = document.getElementById('btn-back-to-menu'); if (bbm) bbm.textContent = t('btn_back');

        const tutBtn = document.getElementById('btn-start-tutorial'); if (tutBtn) tutBtn.textContent = t('btn_play_tutorial') || 'VÀO BẾP TẬP SỰ';
        const tutTitle = document.getElementById('tut-banner-title'); if (tutTitle) tutTitle.textContent = t('level_0_title') || 'Bếp Tập Sự (Kitchen Academy)';
        const tutSub = document.getElementById('tut-banner-sub'); if (tutSub) tutSub.textContent = t('level_0_sub') || 'Làm quen toàn bộ thao tác, công thức và cơ chế trò chơi';

        // Level Intro
        const lit = document.getElementById('intro-target-coins-label'); if (lit) lit.textContent = t('target_coins');
        const ltt = document.getElementById('intro-time-limit-label'); if (ltt) ltt.textContent = t('time_limit');
        const bsc = document.getElementById('btn-start-cooking'); if (bsc) bsc.textContent = t('btn_start_cooking');
        const bci = document.getElementById('btn-cancel-intro'); if (bci) bci.textContent = t('btn_back');
        if (this.gm.currentState === GAME_STATES.LEVEL_INTRO) {
            this.showLevelIntro(this.gm.selectedLevelNumber);
        }

        // Victory
        const vt = document.getElementById('victory-title'); if (vt) vt.textContent = t('victory_title');
        const vs = document.getElementById('victory-subtitle'); if (vs) vs.textContent = t('victory_subtitle');
        const vsl = document.getElementById('v-score-label'); if (vsl) vsl.textContent = t('stat_score');
        const vcl = document.getElementById('v-coins-label'); if (vcl) vcl.textContent = t('stat_coins');
        const bnl = document.getElementById('btn-next-level'); if (bnl) bnl.textContent = t('btn_next_level');
        const bsv = document.getElementById('btn-shop-from-victory'); if (bsv) bsv.textContent = t('btn_upgrades');

        // Defeat
        const dt = document.getElementById('defeat-title'); if (dt) dt.textContent = t('defeat_title');
        const brl = document.getElementById('btn-retry-level'); if (brl) brl.textContent = t('btn_retry');
        const bmd = document.getElementById('btn-menu-from-defeat'); if (bmd) bmd.textContent = t('btn_menu');

        // Shop
        const st = document.getElementById('shop-title'); if (st) st.textContent = t('shop_title');
        const bcs = document.getElementById('btn-close-shop'); if (bcs) bcs.textContent = t('btn_close');

        // How to play
        const htt = document.getElementById('how-to-title'); if (htt) htt.textContent = t('how_to_title');
        const hs1 = document.getElementById('how-step-1'); if (hs1) hs1.innerHTML = t('how_step_1');
        const hs2 = document.getElementById('how-step-2'); if (hs2) hs2.innerHTML = t('how_step_2');
        const hs3 = document.getElementById('how-step-3'); if (hs3) hs3.innerHTML = t('how_step_3');
        const hs4 = document.getElementById('how-step-4'); if (hs4) hs4.innerHTML = t('how_step_4');
        const hs5 = document.getElementById('how-step-5'); if (hs5) hs5.innerHTML = t('how_step_5');
        const bch = document.getElementById('btn-close-how-to'); if (bch) bch.textContent = t('btn_got_it');

        // How to play tabs & recipe items
        const tbr = document.getElementById('tab-btn-rules'); if (tbr) tbr.textContent = t('tab_how_to_play');
        const tbrc = document.getElementById('tab-btn-recipes'); if (tbrc) tbrc.textContent = t('tab_recipe_book');
        const tbrm = document.getElementById('tab-btn-mechanics'); if (tbrm) tbrm.textContent = t('tab_mechanics');
        const btnTutHow = document.getElementById('btn-play-tutorial-from-how-to'); if (btnTutHow) btnTutHow.textContent = t('btn_play_tutorial');

        // Re-render dish-by-dish guide detail card
        this.renderDishGuideDetail(this.currentGuideDishId);

        // Pause
        const pt = document.getElementById('pause-title'); if (pt) pt.textContent = t('pause_title');
        const br = document.getElementById('btn-resume'); if (br) br.textContent = t('btn_resume');
        const bsp = document.getElementById('btn-settings-pause'); if (bsp) bsp.textContent = `⚙️ ${t('btn_settings')}`;
        const brk = document.getElementById('btn-restart-level'); if (brk) brk.textContent = t('btn_restart');
        const bqm = document.getElementById('btn-quit-to-menu'); if (bqm) bqm.textContent = t('btn_quit');

        // Settings
        const sett = document.getElementById('settings-title'); if (sett) sett.textContent = t('settings_title');
        const setts = document.getElementById('settings-subtitle'); if (setts) setts.textContent = t('settings_subtitle');
        const lsd = document.getElementById('label-setting-diff'); if (lsd) lsd.textContent = t('setting_difficulty');
        const bde = document.getElementById('btn-diff-easy'); if (bde) bde.textContent = t('diff_easy');
        const bdn = document.getElementById('btn-diff-normal'); if (bdn) bdn.textContent = t('diff_normal');
        const bdh = document.getElementById('btn-diff-hard'); if (bdh) bdh.textContent = t('diff_hard');
        const bdex = document.getElementById('btn-diff-expert'); if (bdex) bdex.textContent = t('diff_expert');

        const lsl = document.getElementById('label-setting-lang'); if (lsl) lsl.textContent = t('setting_language');
        const lsb = document.getElementById('label-setting-bgm'); if (lsb) lsb.textContent = t('setting_bgm');
        const lssfx = document.getElementById('label-setting-sfx'); if (lssfx) lssfx.textContent = t('setting_sfx');
        const bcls = document.getElementById('btn-close-settings'); if (bcls) bcls.textContent = t('btn_save_settings');

        this.updateSettingsControls();

        // Refresh seats view so customer bubble shows translated recipe
        for (let i = 0; i < 3; i++) {
            this.updateSeatView(i);
        }

        // Refresh shop cards if shop is currently open
        const shopOverlay = document.getElementById('overlay-shop');
        if (shopOverlay && shopOverlay.classList.contains('active')) {
            this.showShop();
        }
    }

    /**
     * Show real-time floating alert callout for new mechanics or hazards
     * @param {string} icon
     * @param {string} title
     * @param {string} desc
     * @param {string} [type='default']
     * @param {number} [durationMs=6000]
     */
    showGameplayCallout(icon, title, desc, type = 'default', durationMs = 6000) {
        // Disabled per requirement 1 & 8 - no interrupting gameplay callouts
        return;
    }

    dismissGameplayCallout() {
        const calloutEl = document.getElementById('gameplay-mechanic-callout');
        if (calloutEl) {
            calloutEl.classList.remove('active');
            setTimeout(() => {
                if (!calloutEl.classList.contains('active')) {
                    calloutEl.style.display = 'none';
                }
            }, 300);
        }
    }

    /**
     * Render the detailed step-by-step card for the chosen dish in Tab 2
     * @param {string} dishId
     */
    renderDishGuideDetail(dishId) {
        const dishKeys = ['classic_burger', 'cheese_burger', 'french_fries', 'fizzy_soda', 'deluxe_burger'];
        if (!dishKeys.includes(dishId)) dishId = 'classic_burger';
        this.currentGuideDishId = dishId;
        const currentIdx = dishKeys.indexOf(dishId);

        const card = document.getElementById('dish-guide-detail-card');
        const indicator = document.getElementById('dish-stepper-indicator');
        const prevBtn = document.getElementById('btn-prev-dish');
        const nextBtn = document.getElementById('btn-next-dish');

        const isVi = this.loc.getLanguage() === 'vi';

        // Update pill button active states & localized labels
        const pillLabels = {
            classic_burger: isVi ? '🍔 Burger Bò' : '🍔 Classic Burger',
            cheese_burger: isVi ? '🧀 Burger Phô Mai' : '🧀 Cheeseburger',
            french_fries: isVi ? '🍟 Khoai Tây Chiên' : '🍟 French Fries',
            fizzy_soda: isVi ? '🥤 Nước Ngọt' : '🥤 Fizzy Soda',
            deluxe_burger: isVi ? '👑 Burger Deluxe' : '👑 Deluxe Burger'
        };
        document.querySelectorAll('.dish-pill-btn').forEach(btn => {
            const id = btn.dataset.dish;
            if (pillLabels[id]) btn.textContent = pillLabels[id];
            btn.classList.toggle('active', id === dishId);
        });

        if (indicator) {
            indicator.textContent = isVi ? `Món ${currentIdx + 1} / ${dishKeys.length}` : `Dish ${currentIdx + 1} / ${dishKeys.length}`;
        }
        if (prevBtn) {
            prevBtn.textContent = this.loc.t('dish_stepper_prev') || (isVi ? '⬅ Món Trước' : '⬅ Previous');
        }
        if (nextBtn) {
            nextBtn.textContent = this.loc.t('dish_stepper_next') || (isVi ? 'Món Kế Tiếp ➔' : 'Next Dish ➔');
        }

        const guide = DISH_TUTORIAL_GUIDES[dishId];
        if (!guide || !card) return;

        const name = isVi ? guide.nameVi : guide.nameEn;
        const difficulty = isVi ? guide.difficultyVi : guide.difficultyEn;
        const steps = isVi ? guide.stepsVi : guide.stepsEn;
        const proTip = isVi ? guide.proTipVi : guide.proTipEn;
        const proTipHeader = this.loc.t('dish_stepper_pro_tip') || (isVi ? '💡 MẸO ĐẦU BẾP' : '💡 CHEF PRO TIP');

        // Ingredients visual tags
        let ingredientsHtml = '';
        if (dishId === 'classic_burger') {
            ingredientsHtml = `
                <span class="dish-tag">🍞 ${isVi ? 'Bánh mì đáy' : 'Bottom Bun'}</span>
                <span class="dish-tag-plus">+</span>
                <span class="dish-tag">🥩 ${isVi ? 'Bò nướng chín' : 'Grilled Patty'}</span>
            `;
        } else if (dishId === 'cheese_burger') {
            ingredientsHtml = `
                <span class="dish-tag">🍞 ${isVi ? 'Bánh mì đáy' : 'Bottom Bun'}</span>
                <span class="dish-tag-plus">+</span>
                <span class="dish-tag">🥩 ${isVi ? 'Bò nướng chín' : 'Grilled Patty'}</span>
                <span class="dish-tag-plus">+</span>
                <span class="dish-tag">🧀 ${isVi ? 'Phô mai Cheddar' : 'Cheese Slice'}</span>
            `;
        } else if (dishId === 'french_fries') {
            ingredientsHtml = `
                <span class="dish-tag">🍟 ${isVi ? 'Khoai tây tươi' : 'Raw Potatoes'}</span>
                <span class="dish-tag-arrow">➔</span>
                <span class="dish-tag">🫧 ${isVi ? 'Bếp chiên dầu' : 'Deep Fryer'}</span>
            `;
        } else if (dishId === 'fizzy_soda') {
            ingredientsHtml = `
                <span class="dish-tag">🥤 ${isVi ? 'Ly nước rỗng' : 'Empty Cup'}</span>
                <span class="dish-tag-arrow">➔</span>
                <span class="dish-tag">💧 ${isVi ? 'Máy rót nước có ga' : 'Soda Dispenser'}</span>
            `;
        } else if (dishId === 'deluxe_burger') {
            ingredientsHtml = `
                <span class="dish-tag">🍞 ${isVi ? 'Bánh mì' : 'Bun'}</span>
                <span class="dish-tag-plus">+</span>
                <span class="dish-tag">🥩 ${isVi ? 'Bò nướng' : 'Patty'}</span>
                <span class="dish-tag-plus">+</span>
                <span class="dish-tag">🧀 ${isVi ? 'Phô mai' : 'Cheese'}</span>
                <span class="dish-tag-plus">+</span>
                <span class="dish-tag">🥬 ${isVi ? 'Rau diếp' : 'Lettuce'}</span>
                <span class="dish-tag-plus">+</span>
                <span class="dish-tag">🍅 ${isVi ? 'Cà chua' : 'Tomato'}</span>
            `;
        }

        const stepsHtml = steps.map(s => `
            <div class="dish-step-row">
                <div class="dish-step-badge">${s.num}</div>
                <div class="dish-step-body">
                    <div class="dish-step-action">${s.action}</div>
                    <div class="dish-step-desc">${s.desc}</div>
                </div>
            </div>
        `).join('');

        const dishSvg = SVG_FOOD[guide.iconKey] || SVG_FOOD[dishId] || '';

        card.innerHTML = `
            <div class="dish-detail-hero">
                <div class="dish-hero-icon-box">${dishSvg}</div>
                <div class="dish-hero-info">
                    <div class="dish-hero-title-row">
                        <h3 class="dish-hero-name">${name}</h3>
                        <div class="dish-hero-badges">
                            <span class="dish-badge price">$${guide.price}</span>
                            <span class="dish-badge score">+${guide.score} pts</span>
                        </div>
                    </div>
                    <div class="dish-hero-diff">${difficulty}</div>
                    <div class="dish-ingredients-row">${ingredientsHtml}</div>
                </div>
            </div>

            <div class="dish-steps-container">
                <div class="dish-steps-header">${isVi ? '📋 CÁC BƯỚC THỰC HIỆN CHI TIẾT:' : '📋 DETAILED STEP-BY-STEP:'}</div>
                <div class="dish-steps-list">${stepsHtml}</div>
            </div>

            <div class="dish-pro-tip-box">
                <div class="dish-pro-tip-header">${proTipHeader}</div>
                <div class="dish-pro-tip-text">${proTip}</div>
            </div>
        `;
    }

    /**
     * Legacy In-game Tutorial Guide - Disabled per Requirement 8
     * (Replaced by Controls Guide Modal before entering each level)
     */
    initTutorialGuide() {
        const guideBar = document.getElementById('tutorial-guide-bar');
        if (guideBar) guideBar.style.display = 'none';
    }

    setTutorialGuideMessage(badgeText, htmlContent) {
        // Disabled per user request
    }

    updateTutorialGuideStep(stepNum) {
        // Disabled per user request
    }
}
