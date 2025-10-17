/**
 * HypeAI Language Switcher
 * Professional i18n system for English/Russian
 * Agent: BABEL - Translation Specialist
 */

(function() {
    'use strict';

    // Embedded translations (to avoid CORS issues with file:// protocol)
    const TRANSLATIONS = {"en":{"nav":{"home":"Home","services":"Services","aiTeam":"AI Team","live":"Live (27/27)","tokenomics":"Tokenomics","proof":"✅ PROOF","docs":"Docs","trade":"Trade","stake":"Stake","agents":"AI Agents","whitepaper":"Whitepaper","connectWallet":"Connect Wallet"},"hero":{"title":"Where AI Meets Opportunity","subtitle":"Smarter. Faster. Better.","description":"27 AI Agents working infinitely to empower your financial growth","ctaPrimary":"💎 Join Presale","ctaSecondary":"🚀 Explore Services","ctaTertiary":"View Docs"}},"ru":{"nav":{"home":"Главная","services":"Сервисы","aiTeam":"Команда ИИ","live":"Онлайн (27/27)","tokenomics":"Токеномика","proof":"✅ ДОКАЗАТЕЛЬСТВА","docs":"Документация","trade":"Торговля","stake":"Стейкинг","agents":"ИИ Агенты","whitepaper":"Whitepaper","connectWallet":"Подключить кошелек"},"hero":{"title":"Где ИИ встречает возможности","subtitle":"Умнее. Быстрее. Лучше.","description":"27 ИИ-агентов работают бесконечно, чтобы помочь вам достичь финансовых целей","ctaPrimary":"💎 Присоединиться к предпродаже","ctaSecondary":"🚀 Узнать о сервисах","ctaTertiary":"Документация"}}};

    // Language Manager
    const LanguageManager = {
        currentLang: 'en',
        translations: TRANSLATIONS, // Use embedded translations
        supportedLangs: ['en', 'ru', 'zh', 'es', 'fr', 'de', 'ja', 'ko'],
        activeLangs: ['en', 'ru'], // Currently active languages

        // Language metadata
        languageInfo: {
            en: { name: 'English', flag: '🇺🇸', status: 'active', availability: 'Q1 2025' },
            ru: { name: 'Russian', flag: '🇷🇺', status: 'active', availability: 'Q1 2025' },
            zh: { name: 'Chinese', flag: '🇨🇳', status: 'coming', availability: 'Q2 2025' },
            es: { name: 'Spanish', flag: '🇪🇸', status: 'coming', availability: 'Q2 2025' },
            fr: { name: 'French', flag: '🇫🇷', status: 'coming', availability: 'Q3 2025' },
            de: { name: 'German', flag: '🇩🇪', status: 'coming', availability: 'Q3 2025' },
            ja: { name: 'Japanese', flag: '🇯🇵', status: 'coming', availability: 'Q3 2025' },
            ko: { name: 'Korean', flag: '🇰🇷', status: 'coming', availability: 'Q4 2025' }
        },

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

        // Load translations (now embedded, no fetch needed)
        loadTranslations: async function() {
            // Translations are now embedded in the script to avoid CORS issues
            console.log('✅ Translations loaded from embedded data');
            return Promise.resolve();
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

            // Check if language is active
            if (!this.activeLangs.includes(lang)) {
                const info = this.languageInfo[lang];
                console.log(`⏳ ${info.name} coming ${info.availability}`);
                return;
            }

            this.currentLang = lang;
            localStorage.setItem('hypeai_language', lang);

            // Apply new translations
            this.applyTranslations();

            // Update switcher UI
            this.updateSwitcherUI();

            // Close dropdown
            this.closeDropdown();

            console.log(`🌍 Language switched to: ${lang.toUpperCase()}`);

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        },

        // Create language switcher UI with dropdown
        createSwitcher: function() {
            // Check if nav exists
            const nav = document.querySelector('nav');
            if (!nav) {
                console.warn('Navigation not found, cannot create language switcher');
                return;
            }

            // Create switcher container
            const switcherContainer = document.createElement('div');
            switcherContainer.className = 'language-switcher-dropdown';

            // Create dropdown button
            const dropdownBtn = document.createElement('button');
            dropdownBtn.className = 'lang-dropdown-btn';

            const currentInfo = this.languageInfo[this.currentLang];
            dropdownBtn.innerHTML = `
                <span class="lang-current-flag">${currentInfo.flag}</span>
                <span class="lang-current-name">${currentInfo.name}</span>
                <svg class="lang-dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;

            // Create dropdown menu
            const dropdownMenu = document.createElement('div');
            dropdownMenu.className = 'lang-dropdown-menu';

            // Add all languages to dropdown
            this.supportedLangs.forEach(lang => {
                const info = this.languageInfo[lang];
                const langItem = document.createElement('button');
                langItem.className = 'lang-dropdown-item';
                langItem.setAttribute('data-lang', lang);

                if (info.status === 'coming') {
                    langItem.classList.add('lang-coming-soon');
                    langItem.disabled = true;
                }

                if (lang === this.currentLang) {
                    langItem.classList.add('lang-active');
                }

                langItem.innerHTML = `
                    <span class="lang-item-flag">${info.flag}</span>
                    <span class="lang-item-name">${info.name}</span>
                    ${info.status === 'coming' ? `<span class="lang-coming-badge">Coming ${info.availability}</span>` : ''}
                    ${lang === this.currentLang ? '<span class="lang-active-check">✓</span>' : ''}
                `;

                // Click handler for active languages
                if (info.status === 'active') {
                    langItem.addEventListener('click', () => {
                        this.switchLanguage(lang);
                    });
                }

                dropdownMenu.appendChild(langItem);
            });

            // Append elements
            switcherContainer.appendChild(dropdownBtn);
            switcherContainer.appendChild(dropdownMenu);

            // Insert at the end of nav (before wallet button which is outside nav)
            nav.appendChild(switcherContainer);

            // Toggle dropdown
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                this.closeDropdown();
            });

            console.log('✅ Multi-language dropdown created (8 languages)');
        },

        // Toggle dropdown
        toggleDropdown: function() {
            const dropdown = document.querySelector('.language-switcher-dropdown');
            if (!dropdown) return;

            const menu = dropdown.querySelector('.lang-dropdown-menu');
            const arrow = dropdown.querySelector('.lang-dropdown-arrow');

            if (menu.classList.contains('show')) {
                menu.classList.remove('show');
                arrow.style.transform = 'rotate(0deg)';
            } else {
                menu.classList.add('show');
                arrow.style.transform = 'rotate(180deg)';
            }
        },

        // Close dropdown
        closeDropdown: function() {
            const dropdown = document.querySelector('.language-switcher-dropdown');
            if (!dropdown) return;

            const menu = dropdown.querySelector('.lang-dropdown-menu');
            const arrow = dropdown.querySelector('.lang-dropdown-arrow');

            if (menu) {
                menu.classList.remove('show');
            }
            if (arrow) {
                arrow.style.transform = 'rotate(0deg)';
            }
        },

        // Update switcher UI to show active language
        updateSwitcherUI: function() {
            // Update dropdown button
            const dropdownBtn = document.querySelector('.lang-dropdown-btn');
            if (dropdownBtn) {
                const currentInfo = this.languageInfo[this.currentLang];
                const flagSpan = dropdownBtn.querySelector('.lang-current-flag');
                const nameSpan = dropdownBtn.querySelector('.lang-current-name');

                if (flagSpan) flagSpan.textContent = currentInfo.flag;
                if (nameSpan) nameSpan.textContent = currentInfo.name;
            }

            // Update dropdown items
            document.querySelectorAll('.lang-dropdown-item').forEach(item => {
                const itemLang = item.getAttribute('data-lang');

                if (itemLang === this.currentLang) {
                    item.classList.add('lang-active');
                    // Add checkmark if not already there
                    if (!item.querySelector('.lang-active-check')) {
                        const check = document.createElement('span');
                        check.className = 'lang-active-check';
                        check.textContent = '✓';
                        item.appendChild(check);
                    }
                } else {
                    item.classList.remove('lang-active');
                    // Remove checkmark
                    const check = item.querySelector('.lang-active-check');
                    if (check) check.remove();
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

    // Load external CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    // Use relative path to support both file:// and http://
    cssLink.href = './css/language-switcher.css';
    document.head.appendChild(cssLink);

})();
