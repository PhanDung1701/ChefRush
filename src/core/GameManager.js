/**
 * GameManager - Central Game Flow Lifecycle Controller
 * Coordinates high-level scene states cleanly using the EventBus.
 */
import { globalEventBus } from './EventBus.js';
import { globalSaveManager } from './SaveManager.js';
import { globalTimeManager } from './TimeManager.js';
import { globalAudioManager } from '../audio/AudioManager.js';

export const GAME_STATES = {
    BOOT: 'BOOT',
    MAIN_MENU: 'MAIN_MENU',
    LEVEL_SELECT: 'LEVEL_SELECT',
    LEVEL_INTRO: 'LEVEL_INTRO',
    GAMEPLAY: 'GAMEPLAY',
    PAUSED: 'PAUSED',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    LEVEL_FAILED: 'LEVEL_FAILED',
    UPGRADE_SHOP: 'UPGRADE_SHOP'
};

export class GameManager {
    constructor(options = {}) {
        this.currentState = GAME_STATES.BOOT;
        this.selectedLevelNumber = 1;
        this.eventBus = options.eventBus || globalEventBus;
        this.saveManager = options.saveManager || globalSaveManager;
        this.timeManager = options.timeManager || globalTimeManager;
        this.audioManager = options.audioManager || globalAudioManager;
        this.difficulty = 'normal';
    }

    /**
     * Boot and initialize master systems
     */
    init() {
        console.log('[GameManager] Initializing Chef\'s Rush game engine...');
        this.timeManager.start();

        // Restore saved audio settings & difficulty
        const settings = this.saveManager.get('settings') || {};
        if (settings) {
            this.audioManager.setSFXVolume(settings.sfxVolume ?? 0.8);
            this.audioManager.setBGMVolume(settings.bgmVolume ?? 0.5);
            this.audioManager.setBgmEnabled(settings.isBgmEnabled ?? true);
            this.audioManager.setSfxEnabled(settings.isSfxEnabled ?? true);
            this.audioManager.setMuted(settings.isMuted ?? false);
            this.difficulty = settings.difficulty || 'normal';
        }

        // Listen for level win/loss events from LevelSystem
        this.eventBus.on('LEVEL_WON', (results) => {
            this.onLevelComplete(results);
        });

        this.eventBus.on('LEVEL_LOST', (results) => {
            this.onLevelFailed(results);
        });

        this.transitionTo(GAME_STATES.MAIN_MENU);
    }

    get currentDifficulty() {
        return 'normal';
    }

    getDifficulty() {
        return 'normal';
    }

    getDifficultyConfig() {
        return {
            patienceMultiplier: 1.0,
            cookTimeMultiplier: 1.0,
            burnTimeMultiplier: 1.0,
            overcookMultiplier: 1.0,
            scoreMultiplier: 1.0,
            targetCoinsMultiplier: 1.0,
            timeMultiplier: 1.0,
            spawnIntervalMultiplier: 1.0,
            breakdownChance: 0.0,
            thiefChance: 0.0
        };
    }

    setDifficulty(diff) {
        // Obsolete
    }

    /**
     * Safely transition between high-level game states
     * @param {string} newState 
     * @param {Object} [payload] 
     */
    transitionTo(newState, payload = {}) {
        if (!GAME_STATES[newState]) {
            console.error(`[GameManager] Cannot transition to invalid state: "${newState}"`);
            return;
        }

        const prevState = this.currentState;
        this.currentState = newState;

        console.log(`[GameManager] State Transition: ${prevState} -> ${newState}`);

        // State lifecycle actions
        switch (newState) {
            case GAME_STATES.GAMEPLAY:
                this.timeManager.setPaused(false);
                break;
            case GAME_STATES.PAUSED:
                this.timeManager.setPaused(true);
                break;
            case GAME_STATES.MAIN_MENU:
            case GAME_STATES.LEVEL_SELECT:
            case GAME_STATES.UPGRADE_SHOP:
                this.timeManager.setPaused(false);
                break;
        }

        this.eventBus.emit('GAME_STATE_CHANGED', {
            previousState: prevState,
            currentState: newState,
            payload
        });
    }

    /**
     * Start a specific level
     * @param {number} levelNumber 
     */
    startLevel(levelNumber) {
        this.selectedLevelNumber = levelNumber;
        this.transitionTo(GAME_STATES.LEVEL_INTRO, { levelNumber });
    }

    /**
     * Begin actual gameplay from intro
     */
    beginLevelGameplay() {
        this.audioManager.startBGM();
        this.transitionTo(GAME_STATES.GAMEPLAY, { levelNumber: this.selectedLevelNumber });
    }

    /**
     * Pause the active level
     */
    pauseGame() {
        if (this.currentState === GAME_STATES.GAMEPLAY) {
            this.transitionTo(GAME_STATES.PAUSED);
        }
    }

    /**
     * Resume active level
     */
    resumeGame() {
        if (this.currentState === GAME_STATES.PAUSED) {
            this.transitionTo(GAME_STATES.GAMEPLAY);
        }
    }

    /**
     * Trigger level win sequence
     * @param {Object} results 
     */
    onLevelComplete(results) {
        this.audioManager.playPerfect();
        this.transitionTo(GAME_STATES.LEVEL_COMPLETE, results);
    }

    /**
     * Trigger level fail sequence
     * @param {Object} results 
     */
    onLevelFailed(results) {
        this.audioManager.playFail();
        this.transitionTo(GAME_STATES.LEVEL_FAILED, results);
    }
}

export const globalGameManager = new GameManager();
