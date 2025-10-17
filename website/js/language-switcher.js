/**
 * HypeAI Language Switcher
 * Professional i18n system for English/Russian
 * Agent: BABEL - Translation Specialist
 */

(function() {
    'use strict';

    // Language Manager
    const LanguageManager = {
        currentLang: 'en',
        translations: null,
        supportedLangs: ['en', 'ru'],

        // Initialize
        init: async function() {
            // Load translations
            await this.loadTranslations();

            // Detect and set language
            const savedLang = localStorage.getItem('hypeai_language');
            const browserLang = navigator.language.split('-')[0];

            if (savedLang && this.supportedLangs.includes(savedLang)) {
                this.currentLang = savedLang;
            } else if (this.supportedLangs.includes(browserLang)) {
                this.currentLang = browserLang;
            }

            // Apply translations
            this.applyTranslations();

            // Create language switcher UI
            this.createSwitcher();

            console.log(`🌍 HypeAI Language: ${this.currentLang.toUpperCase()}`);
        },

        // Load translations from JSON
        loadTranslations: async function() {
            try {
                const response = await fetch('/i18n/translations.json');
                this.translations = await response.json();
                console.log('✅ Translations loaded successfully');
            } catch (error) {
                console.error('❌ Failed to load translations:', error);
                // Fallback to English
                this.currentLang = 'en';
            }
        },

        // Apply translations to page
        applyTranslations: function() {
            if (!this.translations) return;

            const lang = this.translations[this.currentLang];
            if (!lang) return;

            // Update all elements with data-i18n attribute
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.getNestedTranslation(lang, key);

                if (translation) {
                    element.textContent = translation;
                }
            });

            // Update placeholders
            document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
                const key = element.getAttribute('data-i18n-placeholder');
                const translation = this.getNestedTranslation(lang, key);

                if (translation) {
                    element.placeholder = translation;
                }
            });

            // Update title attributes
            document.querySelectorAll('[data-i18n-title]').forEach(element => {
                const key = element.getAttribute('data-i18n-title');
                const translation = this.getNestedTranslation(lang, key);

                if (translation) {
                    element.title = translation;
                }
            });

            // Update HTML lang attribute
            document.documentElement.lang = this.currentLang;

            // Update page title if available
            if (lang.pageTitle) {
                document.title = lang.pageTitle;
            }
        },

        // Get nested translation by key (e.g., "hero.title")
        getNestedTranslation: function(obj, key) {
            return key.split('.').reduce((o, k) => (o || {})[k], obj);
        },

        // Switch language
        switchLanguage: function(lang) {
            if (!this.supportedLangs.includes(lang)) return;

            this.currentLang = lang;
            localStorage.setItem('hypeai_language', lang);

            // Apply new translations
            this.applyTranslations();

            // Update switcher UI
            this.updateSwitcherUI();

            console.log(`🌍 Language switched to: ${lang.toUpperCase()}`);

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        },

        // Create language switcher UI
        createSwitcher: function() {
            // Check if nav exists
            const nav = document.querySelector('nav .nav-links');
            if (!nav) {
                console.warn('Navigation not found, cannot create language switcher');
                return;
            }

            // Create switcher container
            const switcherContainer = document.createElement('div');
            switcherContainer.className = 'language-switcher';
            switcherContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-left: 1rem;
                padding: 0.5rem 1rem;
                background: rgba(157, 78, 221, 0.1);
                border-radius: 50px;
                border: 1px solid rgba(157, 78, 221, 0.3);
                transition: all 0.3s;
            `;

            // Create EN button
            const enBtn = this.createLangButton('en', '🇺🇸 EN');

            // Create RU button
            const ruBtn = this.createLangButton('ru', '🇷🇺 RU');

            // Add separator
            const separator = document.createElement('span');
            separator.textContent = '|';
            separator.style.cssText = `
                color: rgba(157, 78, 221, 0.5);
                font-weight: 300;
            `;

            // Append buttons
            switcherContainer.appendChild(enBtn);
            switcherContainer.appendChild(separator);
            switcherContainer.appendChild(ruBtn);

            // Insert before wallet button or at end
            const walletBtn = nav.querySelector('.connect-wallet');
            if (walletBtn) {
                nav.insertBefore(switcherContainer, walletBtn);
            } else {
                nav.appendChild(switcherContainer);
            }

            // Update initial state
            this.updateSwitcherUI();

            // Add hover effect to container
            switcherContainer.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(157, 78, 221, 0.2)';
                this.style.borderColor = 'rgba(157, 78, 221, 0.5)';
            });

            switcherContainer.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(157, 78, 221, 0.1)';
                this.style.borderColor = 'rgba(157, 78, 221, 0.3)';
            });
        },

        // Create language button
        createLangButton: function(lang, text) {
            const btn = document.createElement('button');
            btn.className = `lang-btn lang-btn-${lang}`;
            btn.textContent = text;
            btn.setAttribute('data-lang', lang);
            btn.style.cssText = `
                background: transparent;
                border: none;
                color: #A0AEC0;
                font-weight: 600;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s;
                padding: 0.25rem 0.5rem;
                border-radius: 20px;
            `;

            // Click handler
            btn.addEventListener('click', () => {
                this.switchLanguage(lang);
            });

            // Hover effects
            btn.addEventListener('mouseenter', function() {
                if (!this.classList.contains('active')) {
                    this.style.color = '#00D4FF';
                }
            });

            btn.addEventListener('mouseleave', function() {
                if (!this.classList.contains('active')) {
                    this.style.color = '#A0AEC0';
                }
            });

            return btn;
        },

        // Update switcher UI to show active language
        updateSwitcherUI: function() {
            document.querySelectorAll('.lang-btn').forEach(btn => {
                const btnLang = btn.getAttribute('data-lang');

                if (btnLang === this.currentLang) {
                    btn.classList.add('active');
                    btn.style.color = '#00D4FF';
                    btn.style.background = 'rgba(0, 212, 255, 0.15)';
                    btn.style.fontWeight = '700';
                } else {
                    btn.classList.remove('active');
                    btn.style.color = '#A0AEC0';
                    btn.style.background = 'transparent';
                    btn.style.fontWeight = '600';
                }
            });
        },

        // Get current language
        getCurrentLanguage: function() {
            return this.currentLang;
        },

        // Translate a key programmatically
        translate: function(key) {
            if (!this.translations) return key;
            const lang = this.translations[this.currentLang];
            return this.getNestedTranslation(lang, key) || key;
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => LanguageManager.init());
    } else {
        LanguageManager.init();
    }

    // Make globally accessible
    window.HypeAILanguage = LanguageManager;

    // Add CSS for mobile responsiveness
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .language-switcher {
                margin-left: 0 !important;
                margin-top: 1rem;
                width: 100%;
                justify-content: center;
            }

            .lang-btn {
                flex: 1;
                text-align: center;
            }
        }
    `;
    document.head.appendChild(style);

})();
