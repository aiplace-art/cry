/**
 * GDPR/CCPA Cookie Consent Banner
 * Compliant with EU GDPR, California CCPA, and other privacy regulations
 *
 * Features:
 * - Cookie categories (necessary, analytics, marketing)
 * - Granular consent management
 * - Respect Do Not Track (DNT) browser settings
 * - Consent record storage
 * - Easy opt-out mechanism
 */

(function() {
    'use strict';

    // Cookie Consent Manager
    const CookieConsent = {
        // Configuration
        config: {
            cookieName: 'hypeai_cookie_consent',
            cookieExpiry: 365, // days
            privacyPolicyUrl: '/privacy.html',
            cookiePolicyUrl: '/cookies.html'
        },

        // Cookie categories
        categories: {
            necessary: {
                name: 'Necessary',
                description: 'Essential for website functionality',
                required: true,
                enabled: true
            },
            analytics: {
                name: 'Analytics',
                description: 'Help us improve the website',
                required: false,
                enabled: false
            },
            marketing: {
                name: 'Marketing',
                description: 'Personalized content and ads',
                required: false,
                enabled: false
            }
        },

        // Initialize
        init: function() {
            // Check if user has Do Not Track enabled
            if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
                console.log('HypeAI: Do Not Track detected. Respecting user privacy.');
                this.setMinimalConsent();
                return;
            }

            // Check if consent already given
            const existingConsent = this.getConsent();
            if (existingConsent) {
                this.applyConsent(existingConsent);
                return;
            }

            // Show banner
            this.showBanner();
        },

        // Show cookie consent banner
        showBanner: function() {
            const banner = this.createBanner();
            document.body.appendChild(banner);

            // Add event listeners
            this.attachEventListeners(banner);
        },

        // Create banner HTML
        createBanner: function() {
            const banner = document.createElement('div');
            banner.id = 'cookie-consent-banner';
            banner.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(10, 14, 39, 0.98);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-top: 2px solid #9D4EDD;
                padding: 2rem;
                z-index: 10000;
                box-shadow: 0 -5px 30px rgba(0, 212, 255, 0.3);
                animation: slideUp 0.5s ease-out;
            `;

            banner.innerHTML = `
                <style>
                    @keyframes slideUp {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                    .cookie-consent-container {
                        max-width: 1200px;
                        margin: 0 auto;
                        display: flex;
                        gap: 2rem;
                        align-items: center;
                        flex-wrap: wrap;
                    }
                    .cookie-consent-text {
                        flex: 1;
                        min-width: 300px;
                    }
                    .cookie-consent-text h3 {
                        font-family: 'Orbitron', sans-serif;
                        color: #00D4FF;
                        margin-bottom: 0.5rem;
                        font-size: 1.3rem;
                    }
                    .cookie-consent-text p {
                        color: #A0AEC0;
                        line-height: 1.6;
                        margin-bottom: 0.5rem;
                    }
                    .cookie-consent-text a {
                        color: #00D4FF;
                        text-decoration: none;
                        font-weight: 600;
                    }
                    .cookie-consent-text a:hover {
                        text-decoration: underline;
                    }
                    .cookie-consent-buttons {
                        display: flex;
                        gap: 1rem;
                        flex-wrap: wrap;
                    }
                    .cookie-btn {
                        padding: 0.75rem 1.5rem;
                        border-radius: 50px;
                        border: none;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                        font-size: 0.95rem;
                    }
                    .cookie-btn-accept-all {
                        background: linear-gradient(135deg, #00D4FF, #9D4EDD);
                        color: white;
                    }
                    .cookie-btn-accept-all:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 20px rgba(0, 212, 255, 0.5);
                    }
                    .cookie-btn-necessary {
                        background: transparent;
                        border: 2px solid #9D4EDD;
                        color: white;
                    }
                    .cookie-btn-necessary:hover {
                        background: rgba(157, 78, 221, 0.2);
                    }
                    .cookie-btn-customize {
                        background: transparent;
                        border: none;
                        color: #A0AEC0;
                        text-decoration: underline;
                        padding: 0.75rem 1rem;
                    }
                    .cookie-btn-customize:hover {
                        color: #00D4FF;
                    }
                    @media (max-width: 768px) {
                        .cookie-consent-container {
                            flex-direction: column;
                        }
                        .cookie-consent-buttons {
                            width: 100%;
                            flex-direction: column;
                        }
                        .cookie-btn {
                            width: 100%;
                        }
                    }
                </style>
                <div class="cookie-consent-container">
                    <div class="cookie-consent-text">
                        <h3>🍪 We Value Your Privacy</h3>
                        <p>
                            We use cookies to enhance your experience, analyze site usage, and personalize content.
                            By clicking "Accept All", you consent to our use of cookies.
                        </p>
                        <p style="font-size: 0.85rem;">
                            <a href="${this.config.privacyPolicyUrl}" target="_blank">Privacy Policy</a> ·
                            <a href="${this.config.cookiePolicyUrl}" target="_blank">Cookie Policy</a>
                        </p>
                    </div>
                    <div class="cookie-consent-buttons">
                        <button class="cookie-btn cookie-btn-accept-all" id="cookie-accept-all">
                            ✅ Accept All
                        </button>
                        <button class="cookie-btn cookie-btn-necessary" id="cookie-necessary-only">
                            ⚙️ Necessary Only
                        </button>
                        <button class="cookie-btn cookie-btn-customize" id="cookie-customize">
                            ⚙️ Customize
                        </button>
                    </div>
                </div>
            `;

            return banner;
        },

        // Attach event listeners
        attachEventListeners: function(banner) {
            const acceptAllBtn = banner.querySelector('#cookie-accept-all');
            const necessaryOnlyBtn = banner.querySelector('#cookie-necessary-only');
            const customizeBtn = banner.querySelector('#cookie-customize');

            acceptAllBtn.addEventListener('click', () => this.acceptAll());
            necessaryOnlyBtn.addEventListener('click', () => this.acceptNecessaryOnly());
            customizeBtn.addEventListener('click', () => this.showCustomizeModal());
        },

        // Accept all cookies
        acceptAll: function() {
            const consent = {
                necessary: true,
                analytics: true,
                marketing: true,
                timestamp: new Date().toISOString()
            };
            this.saveConsent(consent);
            this.applyConsent(consent);
            this.hideBanner();
            console.log('HypeAI: All cookies accepted');
        },

        // Accept necessary cookies only
        acceptNecessaryOnly: function() {
            const consent = {
                necessary: true,
                analytics: false,
                marketing: false,
                timestamp: new Date().toISOString()
            };
            this.saveConsent(consent);
            this.applyConsent(consent);
            this.hideBanner();
            console.log('HypeAI: Necessary cookies only');
        },

        // Set minimal consent (for DNT users)
        setMinimalConsent: function() {
            const consent = {
                necessary: true,
                analytics: false,
                marketing: false,
                timestamp: new Date().toISOString(),
                dnt: true
            };
            this.saveConsent(consent);
            this.applyConsent(consent);
        },

        // Show customize modal
        showCustomizeModal: function() {
            const modal = this.createCustomizeModal();
            document.body.appendChild(modal);
        },

        // Create customize modal
        createCustomizeModal: function() {
            const modal = document.createElement('div');
            modal.id = 'cookie-customize-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            `;

            modal.innerHTML = `
                <div style="
                    background: rgba(26, 31, 58, 0.95);
                    backdrop-filter: blur(20px);
                    padding: 2.5rem;
                    border-radius: 20px;
                    border: 2px solid #9D4EDD;
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                ">
                    <h2 style="font-family: 'Orbitron', sans-serif; color: #00D4FF; margin-bottom: 1.5rem; font-size: 2rem;">
                        🍪 Customize Cookie Preferences
                    </h2>

                    <!-- Necessary Cookies -->
                    <div style="margin-bottom: 1.5rem; padding: 1.5rem; background: rgba(0, 212, 255, 0.1); border-radius: 10px; border-left: 4px solid #39FF14;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <h3 style="color: white; font-size: 1.2rem;">🔒 Necessary Cookies</h3>
                            <span style="color: #39FF14; font-weight: 700;">Always Active</span>
                        </div>
                        <p style="color: #A0AEC0; line-height: 1.6; font-size: 0.9rem;">
                            Essential for the website to function properly. Cannot be disabled.
                        </p>
                    </div>

                    <!-- Analytics Cookies -->
                    <div style="margin-bottom: 1.5rem; padding: 1.5rem; background: rgba(157, 78, 221, 0.1); border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <h3 style="color: white; font-size: 1.2rem;">📊 Analytics Cookies</h3>
                            <label style="position: relative; display: inline-block; width: 50px; height: 24px;">
                                <input type="checkbox" id="cookie-analytics-toggle" style="opacity: 0; width: 0; height: 0;">
                                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; border-radius: 24px; transition: .4s;"></span>
                            </label>
                        </div>
                        <p style="color: #A0AEC0; line-height: 1.6; font-size: 0.9rem;">
                            Help us understand how visitors interact with our website. We use this data to improve user experience.
                        </p>
                    </div>

                    <!-- Marketing Cookies -->
                    <div style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(157, 78, 221, 0.1); border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <h3 style="color: white; font-size: 1.2rem;">📢 Marketing Cookies</h3>
                            <label style="position: relative; display: inline-block; width: 50px; height: 24px;">
                                <input type="checkbox" id="cookie-marketing-toggle" style="opacity: 0; width: 0; height: 0;">
                                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; border-radius: 24px; transition: .4s;"></span>
                            </label>
                        </div>
                        <p style="color: #A0AEC0; line-height: 1.6; font-size: 0.9rem;">
                            Used to track visitors across websites to display relevant ads and personalized content.
                        </p>
                    </div>

                    <div style="display: flex; gap: 1rem;">
                        <button id="cookie-save-preferences" style="
                            flex: 1;
                            padding: 0.75rem 1.5rem;
                            border-radius: 50px;
                            border: none;
                            background: linear-gradient(135deg, #00D4FF, #9D4EDD);
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                            font-size: 1rem;
                        ">
                            💾 Save Preferences
                        </button>
                        <button id="cookie-modal-close" style="
                            padding: 0.75rem 1.5rem;
                            border-radius: 50px;
                            border: 2px solid #9D4EDD;
                            background: transparent;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                            font-size: 1rem;
                        ">
                            ✕ Cancel
                        </button>
                    </div>
                </div>
            `;

            // Add event listeners
            const saveBtn = modal.querySelector('#cookie-save-preferences');
            const closeBtn = modal.querySelector('#cookie-modal-close');
            const analyticsToggle = modal.querySelector('#cookie-analytics-toggle');
            const marketingToggle = modal.querySelector('#cookie-marketing-toggle');

            saveBtn.addEventListener('click', () => {
                const consent = {
                    necessary: true,
                    analytics: analyticsToggle.checked,
                    marketing: marketingToggle.checked,
                    timestamp: new Date().toISOString()
                };
                this.saveConsent(consent);
                this.applyConsent(consent);
                this.hideBanner();
                modal.remove();
                console.log('HypeAI: Custom cookie preferences saved', consent);
            });

            closeBtn.addEventListener('click', () => {
                modal.remove();
            });

            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            return modal;
        },

        // Save consent to localStorage
        saveConsent: function(consent) {
            localStorage.setItem(this.config.cookieName, JSON.stringify(consent));

            // Also set a cookie for server-side reading
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + this.config.cookieExpiry);
            document.cookie = `${this.config.cookieName}=${JSON.stringify(consent)}; expires=${expiry.toUTCString()}; path=/; SameSite=Strict`;
        },

        // Get consent from localStorage
        getConsent: function() {
            const consent = localStorage.getItem(this.config.cookieName);
            return consent ? JSON.parse(consent) : null;
        },

        // Apply consent (load tracking scripts based on consent)
        applyConsent: function(consent) {
            if (consent.analytics) {
                this.loadAnalytics();
            }

            if (consent.marketing) {
                this.loadMarketing();
            }
        },

        // Load analytics scripts
        loadAnalytics: function() {
            console.log('HypeAI: Analytics enabled');
            // Example: Load Google Analytics
            // window.dataLayer = window.dataLayer || [];
            // function gtag(){dataLayer.push(arguments);}
            // gtag('js', new Date());
            // gtag('config', 'GA_MEASUREMENT_ID');
        },

        // Load marketing scripts
        loadMarketing: function() {
            console.log('HypeAI: Marketing enabled');
            // Example: Load marketing pixels
        },

        // Hide banner
        hideBanner: function() {
            const banner = document.getElementById('cookie-consent-banner');
            if (banner) {
                banner.style.animation = 'slideDown 0.5s ease-in';
                setTimeout(() => banner.remove(), 500);
            }
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CookieConsent.init());
    } else {
        CookieConsent.init();
    }

    // Make CookieConsent globally accessible for manual control
    window.HypeAICookieConsent = CookieConsent;

})();
