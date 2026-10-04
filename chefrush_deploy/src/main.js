/**
 * Main Application Entry Point
 * Orchestrates game initialization, dependency injection, and master update loop.
 */
import { globalEventBus } from './core/EventBus.js';
import { globalTimeManager } from './core/TimeManager.js';
import { globalSaveManager } from './core/SaveManager.js';
import { globalAudioManager } from './audio/AudioManager.js';
import { globalGameManager, GAME_STATES } from './core/GameManager.js';

import { CookingSystem } from './systems/CookingSystem.js';
import { AssemblySystem } from './systems/AssemblySystem.js';
import { DishwashingSystem } from './systems/DishwashingSystem.js';
import { OrderSystem } from './systems/OrderSystem.js';
import { CustomerSystem } from './systems/CustomerSystem.js';
import { EconomySystem } from './systems/EconomySystem.js';
import { LevelSystem } from './systems/LevelSystem.js';
import { UpgradeSystem } from './systems/UpgradeSystem.js';

import { globalVFXManager } from './vfx/VFXManager.js';
import { globalLocalizationManager } from './core/LocalizationManager.js';
import { UIManager } from './ui/UIManager.js';

window.addEventListener('DOMContentLoaded', () => {
    console.log('[Main] Bootstrapping Chef\'s Rush: Kitchen Frenzy...');

    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) {
        console.error('[Main] #game-container not found in DOM.');
        return;
    }

    // 1. Instantiate Core Systems
    const eventBus = globalEventBus;
    const timeManager = globalTimeManager;
    const saveManager = globalSaveManager;
    const audioManager = globalAudioManager;
    const gameManager = globalGameManager;
    const vfxManager = globalVFXManager;
    const localizationManager = globalLocalizationManager;

    // 2. Instantiate Gameplay Systems
    const cookingSystem = new CookingSystem(eventBus);
    const assemblySystem = new AssemblySystem(eventBus);
    const dishwashingSystem = new DishwashingSystem(eventBus);
    const orderSystem = new OrderSystem(eventBus);
    const customerSystem = new CustomerSystem(eventBus);
    const economySystem = new EconomySystem(eventBus, saveManager);
    const levelSystem = new LevelSystem(eventBus, saveManager);
    const upgradeSystem = new UpgradeSystem(eventBus, saveManager, economySystem);

    // 3. Instantiate UI Layer
    const uiManager = new UIManager({
        gameManager,
        cookingSystem,
        assemblySystem,
        dishwashingSystem,
        orderSystem,
        customerSystem,
        economySystem,
        levelSystem,
        upgradeSystem,
        audioManager,
        vfxManager,
        localizationManager
    });

    uiManager.init(gameContainer);

    // 4. Register Master Game Update Loop
    timeManager.registerUpdate((dt) => {
        // Only run gameplay updates when actually in GAMEPLAY state
        if (gameManager.currentState === GAME_STATES.GAMEPLAY) {
            cookingSystem.update(dt);
            customerSystem.update(dt);
            orderSystem.update(dt);
            economySystem.update(dt);
            dishwashingSystem.update(dt);

            const coins = economySystem.getLevelCoins();
            const score = economySystem.getLevelScore();
            levelSystem.update(dt, coins, score);

            // Customer Spawning Check
            const canSpawn = customerSystem.canSpawnCustomer();
            const shouldSpawn = levelSystem.shouldSpawnCustomer(canSpawn);
            if (shouldSpawn) {
                const customer = customerSystem.spawnCustomer(levelSystem.config.availableRecipes, levelSystem.config);
                if (customer) {
                    console.log(`[Main] Customer spawned: ${customer.id}, order: ${JSON.stringify(customer.orderRecipes)}`);
                    levelSystem.notifyCustomerSpawned();
                } else {
                    console.warn('[Main] shouldSpawn=true but spawnCustomer returned null!');
                }
            }

            // 3D Overcooked Engine & Controls update
            if (uiManager.kitchen3D && uiManager.inputController) {
                const input = uiManager.inputController.getInput();
                uiManager.kitchen3D.update(dt, input);
            }
            uiManager.renderOvercookedOrders();
        } else if (uiManager.kitchen3D) {
            // Idle camera & ambient render in menus/pause
            uiManager.kitchen3D.update(dt, { moveX: 0, moveZ: 0, isChopping: false });
        }

        // VFX always renders (for menu effects, transitions, floating text)
        vfxManager.update(dt);
    });

    // 5. Initialize Game Manager & Lifecycle
    gameManager.init();

    // 6. User gesture unlock for Web Audio
    const unlockAudio = () => {
        audioManager.init();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    console.log('[Main] Chef\'s Rush is ready for orders!');
});
