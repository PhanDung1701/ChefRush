/**
 * LocalizationManager - Reactive Internationalization (i18n) Engine
 * Manages active language, string translations, parameter interpolations, and live reactivity.
 */
import { LOCALIZATION } from '../data/LocalizationData.js';
import { globalEventBus } from './EventBus.js';
import { globalSaveManager } from './SaveManager.js';

export class LocalizationManager {
    constructor(eventBus = globalEventBus, saveManager = globalSaveManager) {
        this.eventBus = eventBus;
        this.saveManager = saveManager;

        // Restore language from saved settings, default to 'vi' (Tiếng Việt)
        const savedSettings = this.saveManager.get('settings') || {};
        this.currentLang = savedSettings.language === 'en' ? 'en' : 'vi';
    }

    /**
     * Get active language code ('vi' | 'en')
     * @returns {string}
     */
    getLanguage() {
        return this.currentLang;
    }

    /**
     * Switch language and notify UI layer to update
     * @param {string} lang 'vi' or 'en'
     */
    setLanguage(lang) {
        if (!LOCALIZATION[lang]) {
            console.warn(`[LocalizationManager] Unsupported language: "${lang}". Keeping "${this.currentLang}"`);
            return;
        }

        if (this.currentLang === lang) return;

        this.currentLang = lang;

        // Persist to settings
        const settings = this.saveManager.get('settings') || {};
        settings.language = lang;
        this.saveManager.set('settings', settings);

        console.log(`[LocalizationManager] Switched language to "${lang}"`);

        this.eventBus.emit('LANGUAGE_CHANGED', {
            language: lang
        });
    }

    /**
     * Translate key into active language
     * @param {string} key Dictionary key
     * @param {Object} [params] Parameters to replace e.g. { earned: 50, target: 100 }
     * @returns {string}
     */
    t(key, params = {}) {
        const dict = LOCALIZATION[this.currentLang] || LOCALIZATION.vi;
        let text = dict[key] || LOCALIZATION.en[key] || key;

        // Parameter interpolation e.g. {earned}
        if (params && typeof params === 'object') {
            for (const [paramKey, val] of Object.entries(params)) {
                text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), val);
            }
        }

        return text;
    }
}

export const globalLocalizationManager = new LocalizationManager();
