# Mass-Market Services Section Design
## HypeAI Website - B2C + B2B Services

**Status:** Design Phase - Ready for Review
**Version:** 1.0
**Last Updated:** 2025-10-20

---

## Overview

This document outlines the design for a new **Mass-Market Services Section** to be added to the HypeAI website. The section will showcase professional AI services for both individual consumers (B2C) and businesses (B2B) in a clean, elegant, and professional manner that matches the existing cosmic/BNB Chain aesthetic.

---

## Design Principles

1. **Non-Cluttered**: Single, elegant block with clear information hierarchy
2. **Cosmic Aesthetic**: Matches existing BNB Chain yellow/gold theme with purple/blue accents
3. **Dual Audience**: Clear separation for individuals vs businesses
4. **Trust Indicators**: Display delivery time, satisfaction rates, guarantees
5. **Clear CTAs**: Prominent "Get Started" and "Contact Us" buttons
6. **Mobile-First**: Responsive design that works beautifully on all devices

---

## Section Structure

### 1. **Main Services Block**
Location: After "AI Agents" section, before "Tokenomics"
Background: Glass-morphism card with cosmic gradient orb effects

#### Components:
```
┌─────────────────────────────────────────────────────────┐
│  🎯 Section Label: "Professional Services"              │
│  📘 Title: "AI-Powered Services for Everyone"          │
│  📝 Description: "From startups to enterprises..."      │
│                                                          │
│  ┌───────────────────┐  ┌───────────────────┐         │
│  │   For Individuals │  │   For Businesses  │         │
│  │   (Tab/Column)    │  │   (Tab/Column)    │         │
│  └───────────────────┘  └───────────────────┘         │
│                                                          │
│  [Service Cards Grid - 6 cards]                         │
│                                                          │
│  [Popular Services Showcase - 8 services]               │
│                                                          │
│  [How It Works - 3-4 steps timeline]                   │
│                                                          │
│  [Pricing Tiers Preview - 3 tiers]                     │
│                                                          │
│  [CTAs: Get Started | Contact Sales]                    │
└─────────────────────────────────────────────────────────┘
```

---

## HTML Structure

```html
<!-- ========================================
     MASS-MARKET SERVICES SECTION
     Insert after AI Agents section
     ======================================== -->

<section class="section scroll-fade-in" id="mass-market-services">
  <div class="container">
    <div class="section-header text-center">
      <div class="section-label" data-i18n="mass_services_label">Professional Services</div>
      <h2 class="section-title" data-i18n="mass_services_title">
        AI-Powered Services for Everyone
      </h2>
      <p class="section-description" data-i18n="mass_services_description">
        From personal projects to enterprise solutions. Professional quality, AI speed, unbeatable prices.
      </p>
    </div>

    <!-- Audience Tabs/Toggle -->
    <div class="services-tabs">
      <button class="services-tab active" data-tab="individuals" data-i18n="tab_individuals">
        👤 For Individuals
      </button>
      <button class="services-tab" data-tab="business" data-i18n="tab_business">
        🏢 For Businesses
      </button>
    </div>

    <!-- Service Categories (6 cards) -->
    <div class="service-categories-grid">

      <!-- Category Card 1: Web Development -->
      <div class="glass-card service-category-card" data-audience="both">
        <div class="service-icon">🌐</div>
        <h3 class="service-category-title" data-i18n="service_cat1_title">
          Web Development
        </h3>
        <p class="service-category-description" data-i18n="service_cat1_description">
          Landing pages, portfolios, e-commerce, full web apps
        </p>
        <div class="service-pricing">
          <span class="price-from" data-i18n="from">From</span>
          <span class="price-amount">$299</span>
        </div>
        <div class="service-features">
          <span class="feature-badge" data-i18n="feature_responsive">📱 Responsive</span>
          <span class="feature-badge" data-i18n="feature_fast">⚡ 3-7 days</span>
        </div>
        <button class="btn btn-outline btn-sm" data-i18n="learn_more">Learn More →</button>
      </div>

      <!-- Category Card 2: Business Automation -->
      <div class="glass-card service-category-card" data-audience="business">
        <div class="service-icon">🤖</div>
        <h3 class="service-category-title" data-i18n="service_cat2_title">
          Business Automation
        </h3>
        <p class="service-category-description" data-i18n="service_cat2_description">
          AI chatbots, workflow automation, process optimization
        </p>
        <div class="service-pricing">
          <span class="price-from" data-i18n="from">From</span>
          <span class="price-amount">$899</span>
        </div>
        <div class="service-features">
          <span class="feature-badge" data-i18n="feature_247">⚡ 24/7 Support</span>
          <span class="feature-badge" data-i18n="feature_roi">💰 High ROI</span>
        </div>
        <button class="btn btn-outline btn-sm" data-i18n="learn_more">Learn More →</button>
      </div>

      <!-- Category Card 3: Content Creation -->
      <div class="glass-card service-category-card" data-audience="both">
        <div class="service-icon">✍️</div>
        <h3 class="service-category-title" data-i18n="service_cat3_title">
          Content Creation
        </h3>
        <p class="service-category-description" data-i18n="service_cat3_description">
          Blog posts, articles, social media, video scripts
        </p>
        <div class="service-pricing">
          <span class="price-from" data-i18n="from">From</span>
          <span class="price-amount">$49</span>
        </div>
        <div class="service-features">
          <span class="feature-badge" data-i18n="feature_seo">📈 SEO Optimized</span>
          <span class="feature-badge" data-i18n="feature_quick">⏱️ 24-48h</span>
        </div>
        <button class="btn btn-outline btn-sm" data-i18n="learn_more">Learn More →</button>
      </div>

      <!-- Category Card 4: Graphic Design -->
      <div class="glass-card service-category-card" data-audience="both">
        <div class="service-icon">🎨</div>
        <h3 class="service-category-title" data-i18n="service_cat4_title">
          Graphic Design
        </h3>
        <p class="service-category-description" data-i18n="service_cat4_description">
          Logos, banners, social media graphics, brand identity
        </p>
        <div class="service-pricing">
          <span class="price-from" data-i18n="from">From</span>
          <span class="price-amount">$99</span>
        </div>
        <div class="service-features">
          <span class="feature-badge" data-i18n="feature_revisions">♻️ 3 Revisions</span>
          <span class="feature-badge" data-i18n="feature_vector">🎯 Vector Files</span>
        </div>
        <button class="btn btn-outline btn-sm" data-i18n="learn_more">Learn More →</button>
      </div>

      <!-- Category Card 5: AI Consulting -->
      <div class="glass-card service-category-card" data-audience="business">
        <div class="service-icon">🧠</div>
        <h3 class="service-category-title" data-i18n="service_cat5_title">
          AI Consulting
        </h3>
        <p class="service-category-description" data-i18n="service_cat5_description">
          Strategy, implementation roadmap, team training
        </p>
        <div class="service-pricing">
          <span class="price-from" data-i18n="from">From</span>
          <span class="price-amount">$1,999</span>
        </div>
        <div class="service-features">
          <span class="feature-badge" data-i18n="feature_custom">🎯 Custom Plan</span>
          <span class="feature-badge" data-i18n="feature_expert">👨‍💼 Expert Team</span>
        </div>
        <button class="btn btn-outline btn-sm" data-i18n="learn_more">Learn More →</button>
      </div>

      <!-- Category Card 6: Data Analysis -->
      <div class="glass-card service-category-card" data-audience="both">
        <div class="service-icon">📊</div>
        <h3 class="service-category-title" data-i18n="service_cat6_title">
          Data Analysis
        </h3>
        <p class="service-category-description" data-i18n="service_cat6_description">
          Market research, analytics reports, predictive insights
        </p>
        <div class="service-pricing">
          <span class="price-from" data-i18n="from">From</span>
          <span class="price-amount">$399</span>
        </div>
        <div class="service-features">
          <span class="feature-badge" data-i18n="feature_insights">💡 Actionable</span>
          <span class="feature-badge" data-i18n="feature_visual">📊 Visual Reports</span>
        </div>
        <button class="btn btn-outline btn-sm" data-i18n="learn_more">Learn More →</button>
      </div>

    </div>

    <!-- Popular Services Showcase -->
    <div class="popular-services-section">
      <h3 class="subsection-title" data-i18n="popular_services_title">
        🔥 Most Requested Services
      </h3>

      <div class="popular-services-grid">

        <!-- Popular Service 1 -->
        <div class="popular-service-item">
          <div class="popular-service-header">
            <span class="service-name" data-i18n="popular_1_name">Business Website</span>
            <span class="service-price">$799</span>
          </div>
          <p class="service-brief" data-i18n="popular_1_brief">
            Professional website with CMS, SEO, and analytics
          </p>
          <div class="service-trust-badges">
            <span class="trust-badge">⏱️ <span data-i18n="delivery_5_7">5-7 days</span></span>
            <span class="trust-badge">⭐ <span data-i18n="satisfaction_98">98% satisfaction</span></span>
          </div>
        </div>

        <!-- Popular Service 2 -->
        <div class="popular-service-item">
          <div class="popular-service-header">
            <span class="service-name" data-i18n="popular_2_name">AI Chatbot</span>
            <span class="service-price">$599</span>
          </div>
          <p class="service-brief" data-i18n="popular_2_brief">
            24/7 customer support bot for your website
          </p>
          <div class="service-trust-badges">
            <span class="trust-badge">⏱️ <span data-i18n="delivery_3_5">3-5 days</span></span>
            <span class="trust-badge">⭐ <span data-i18n="satisfaction_95">95% satisfaction</span></span>
          </div>
        </div>

        <!-- Popular Service 3 -->
        <div class="popular-service-item">
          <div class="popular-service-header">
            <span class="service-name" data-i18n="popular_3_name">Logo Design</span>
            <span class="service-price">$199</span>
          </div>
          <p class="service-brief" data-i18n="popular_3_brief">
            Professional logo with 3 concepts, unlimited revisions
          </p>
          <div class="service-trust-badges">
            <span class="trust-badge">⏱️ <span data-i18n="delivery_2_3">2-3 days</span></span>
            <span class="trust-badge">⭐ <span data-i18n="satisfaction_99">99% satisfaction</span></span>
          </div>
        </div>

        <!-- Popular Service 4 -->
        <div class="popular-service-item">
          <div class="popular-service-header">
            <span class="service-name" data-i18n="popular_4_name">SEO Package</span>
            <span class="service-price">$499/mo</span>
          </div>
          <p class="service-brief" data-i18n="popular_4_brief">
            Full SEO optimization, monthly reports, ongoing optimization
          </p>
          <div class="service-trust-badges">
            <span class="trust-badge">📈 <span data-i18n="feature_results">Proven Results</span></span>
            <span class="trust-badge">⭐ <span data-i18n="satisfaction_97">97% satisfaction</span></span>
          </div>
        </div>

        <!-- Additional 4 services (collapsed by default, "Show More" button) -->
        <div class="popular-service-item more-services" style="display: none;">
          <div class="popular-service-header">
            <span class="service-name" data-i18n="popular_5_name">Mobile App</span>
            <span class="service-price">$2,999</span>
          </div>
          <p class="service-brief" data-i18n="popular_5_brief">
            iOS & Android app with backend and admin panel
          </p>
          <div class="service-trust-badges">
            <span class="trust-badge">⏱️ <span data-i18n="delivery_14_21">14-21 days</span></span>
            <span class="trust-badge">⭐ <span data-i18n="satisfaction_96">96% satisfaction</span></span>
          </div>
        </div>

        <div class="popular-service-item more-services" style="display: none;">
          <div class="popular-service-header">
            <span class="service-name" data-i18n="popular_6_name">Social Media Management</span>
            <span class="service-price">$699/mo</span>
          </div>
          <p class="service-brief" data-i18n="popular_6_brief">
            Daily posts, community management, analytics
          </p>
          <div class="service-trust-badges">
            <span class="trust-badge">📱 <span data-i18n="feature_allplatforms">All Platforms</span></span>
            <span class="trust-badge">⭐ <span data-i18n="satisfaction_94">94% satisfaction</span></span>
          </div>
        </div>

        <div class="popular-service-item more-services" style="display: none;">
          <div class="popular-service-header">
            <span class="service-name" data-i18n="popular_7_name">Email Campaign</span>
            <span class="service-price">$299</span>
          </div>
          <p class="service-brief" data-i18n="popular_7_brief">
            Email templates, automation, A/B testing
          </p>
          <div class="service-trust-badges">
            <span class="trust-badge">⏱️ <span data-i18n="delivery_1_2">1-2 days</span></span>
            <span class="trust-badge">⭐ <span data-i18n="satisfaction_93">93% satisfaction</span></span>
          </div>
        </div>

        <div class="popular-service-item more-services" style="display: none;">
          <div class="popular-service-header">
            <span class="service-name" data-i18n="popular_8_name">Data Visualization</span>
            <span class="service-price">$499</span>
          </div>
          <p class="service-brief" data-i18n="popular_8_brief">
            Interactive dashboards and custom reports
          </p>
          <div class="service-trust-badges">
            <span class="trust-badge">⏱️ <span data-i18n="delivery_3_5">3-5 days</span></span>
            <span class="trust-badge">⭐ <span data-i18n="satisfaction_97">97% satisfaction</span></span>
          </div>
        </div>

      </div>

      <button class="btn btn-secondary btn-sm show-more-services" data-i18n="show_more_services">
        Show More Services
      </button>
    </div>

    <!-- How It Works Section -->
    <div class="how-it-works-section">
      <h3 class="subsection-title" data-i18n="how_it_works_title">
        ⚡ How It Works
      </h3>

      <div class="timeline-steps">

        <div class="timeline-step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4 class="step-title" data-i18n="step1_title">Choose Your Service</h4>
            <p class="step-description" data-i18n="step1_description">
              Browse our catalog and select the service that fits your needs
            </p>
          </div>
        </div>

        <div class="timeline-connector"></div>

        <div class="timeline-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4 class="step-title" data-i18n="step2_title">Share Your Requirements</h4>
            <p class="step-description" data-i18n="step2_description">
              Fill out a simple form with your project details and preferences
            </p>
          </div>
        </div>

        <div class="timeline-connector"></div>

        <div class="timeline-step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4 class="step-title" data-i18n="step3_title">AI Agents Get to Work</h4>
            <p class="step-description" data-i18n="step3_description">
              Our 27 AI agents collaborate to create your project
            </p>
          </div>
        </div>

        <div class="timeline-connector"></div>

        <div class="timeline-step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4 class="step-title" data-i18n="step4_title">Review & Launch</h4>
            <p class="step-description" data-i18n="step4_description">
              Review the final product, request changes, then launch!
            </p>
          </div>
        </div>

      </div>
    </div>

    <!-- Pricing Tiers Preview -->
    <div class="pricing-tiers-section">
      <h3 class="subsection-title" data-i18n="pricing_tiers_title">
        💎 Service Tiers
      </h3>

      <div class="pricing-tiers-grid">

        <!-- Basic Tier -->
        <div class="glass-card pricing-tier-card">
          <div class="tier-badge" data-i18n="tier_basic">Basic</div>
          <h4 class="tier-name" data-i18n="tier_basic_name">Essential</h4>
          <p class="tier-description" data-i18n="tier_basic_description">
            Perfect for individuals and small projects
          </p>
          <div class="tier-features">
            <div class="feature-item">✅ <span data-i18n="tier_basic_feature1">Fast delivery (3-7 days)</span></div>
            <div class="feature-item">✅ <span data-i18n="tier_basic_feature2">1 revision included</span></div>
            <div class="feature-item">✅ <span data-i18n="tier_basic_feature3">Email support</span></div>
            <div class="feature-item">✅ <span data-i18n="tier_basic_feature4">Source files included</span></div>
          </div>
          <button class="btn btn-outline" data-i18n="view_basic_services">View Services →</button>
        </div>

        <!-- Professional Tier -->
        <div class="glass-card pricing-tier-card featured">
          <div class="tier-badge featured-badge" data-i18n="tier_professional">Professional</div>
          <div class="popular-badge" data-i18n="most_popular">🔥 Most Popular</div>
          <h4 class="tier-name" data-i18n="tier_professional_name">Professional</h4>
          <p class="tier-description" data-i18n="tier_professional_description">
            For growing businesses and serious projects
          </p>
          <div class="tier-features">
            <div class="feature-item">✅ <span data-i18n="tier_pro_feature1">Priority delivery (1-3 days)</span></div>
            <div class="feature-item">✅ <span data-i18n="tier_pro_feature2">3 revisions included</span></div>
            <div class="feature-item">✅ <span data-i18n="tier_pro_feature3">24/7 chat support</span></div>
            <div class="feature-item">✅ <span data-i18n="tier_pro_feature4">Dedicated project manager</span></div>
            <div class="feature-item">✅ <span data-i18n="tier_pro_feature5">Commercial license</span></div>
          </div>
          <button class="btn btn-primary" data-i18n="view_pro_services">View Services →</button>
        </div>

        <!-- Enterprise Tier -->
        <div class="glass-card pricing-tier-card">
          <div class="tier-badge" data-i18n="tier_enterprise">Enterprise</div>
          <h4 class="tier-name" data-i18n="tier_enterprise_name">Enterprise</h4>
          <p class="tier-description" data-i18n="tier_enterprise_description">
            Custom solutions for large organizations
          </p>
          <div class="tier-features">
            <div class="feature-item">✅ <span data-i18n="tier_ent_feature1">Fastest delivery</span></div>
            <div class="feature-item">✅ <span data-i18n="tier_ent_feature2">Unlimited revisions</span></div>
            <div class="feature-item">✅ <span data-i18n="tier_ent_feature3">Dedicated team</span></div>
            <div class="feature-item">✅ <span data-i18n="tier_ent_feature4">Custom SLA & contract</span></div>
            <div class="feature-item">✅ <span data-i18n="tier_ent_feature5">White-label options</span></div>
            <div class="feature-item">✅ <span data-i18n="tier_ent_feature6">Priority support hotline</span></div>
          </div>
          <button class="btn btn-outline" data-i18n="contact_sales">Contact Sales →</button>
        </div>

      </div>
    </div>

    <!-- Final CTAs -->
    <div class="services-cta-section">
      <div class="glass-card cta-card">
        <h3 class="cta-title" data-i18n="services_cta_title">
          Ready to Get Started?
        </h3>
        <p class="cta-description" data-i18n="services_cta_description">
          Join thousands of satisfied customers who trust HypeAI for their projects
        </p>
        <div class="cta-buttons">
          <button class="btn btn-primary btn-lg" data-i18n="cta_get_started">
            Get Started Now →
          </button>
          <button class="btn btn-secondary btn-lg" data-i18n="cta_contact_sales">
            Contact Sales Team
          </button>
        </div>
        <div class="cta-trust-line">
          <span data-i18n="cta_trust">
            ✅ 30-Day Money-Back Guarantee | ⭐ 4.9/5 Average Rating | 🔒 100% Secure
          </span>
        </div>
      </div>
    </div>

  </div>
</section>
```

---

## CSS Styles

```css
/* ========================================
   MASS-MARKET SERVICES SECTION
   ======================================== */

#mass-market-services {
  position: relative;
  padding: var(--space-16) 0;
}

/* Section Header */
.section-header {
  margin-bottom: var(--space-8);
}

.section-label {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background: rgba(255, 233, 0, 0.1);
  border: 1px solid rgba(255, 233, 0, 0.3);
  border-radius: var(--radius-full);
  color: var(--brand-yellow);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: var(--ls-wide);
  margin-bottom: var(--space-3);
}

.section-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
  letter-spacing: var(--ls-tight);
  background: linear-gradient(135deg, var(--brand-yellow) 0%, #FFF4A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-3);
}

.section-description {
  font-size: var(--fs-xl);
  color: var(--text-secondary);
  max-width: 700px;
  margin: 0 auto;
}

/* Service Tabs */
.services-tabs {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  margin: var(--space-8) 0;
  flex-wrap: wrap;
}

.services-tab {
  padding: var(--space-2) var(--space-6);
  background: rgba(30, 32, 38, 0.6);
  border: 2px solid rgba(255, 233, 0, 0.2);
  border-radius: var(--radius-xl);
  color: var(--text-secondary);
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  backdrop-filter: blur(10px);
}

.services-tab:hover {
  border-color: rgba(255, 233, 0, 0.4);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.services-tab.active {
  background: linear-gradient(135deg, rgba(255, 233, 0, 0.15), rgba(255, 233, 0, 0.05));
  border-color: var(--brand-yellow);
  color: var(--brand-yellow);
  box-shadow: 0 0 30px rgba(255, 233, 0, 0.2);
}

/* Service Categories Grid */
.service-categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-12);
}

.service-category-card {
  padding: var(--space-6);
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.service-category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--brand-yellow), var(--color-primary));
  opacity: 0;
  transition: opacity var(--transition-base);
}

.service-category-card:hover::before {
  opacity: 1;
}

.service-icon {
  font-size: 3rem;
  margin-bottom: var(--space-3);
  display: inline-block;
  transition: transform var(--transition-base);
}

.service-category-card:hover .service-icon {
  transform: scale(1.15) rotate(5deg);
}

.service-category-title {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.service-category-description {
  font-size: var(--fs-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
  min-height: 50px;
}

.service-pricing {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
}

.price-from {
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
}

.price-amount {
  font-size: var(--fs-3xl);
  font-weight: var(--fw-bold);
  color: var(--brand-yellow);
}

.service-features {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}

.feature-badge {
  padding: 0.375rem 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: var(--radius-full);
  color: var(--color-info);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
}

/* Popular Services Section */
.popular-services-section {
  margin-bottom: var(--space-12);
}

.subsection-title {
  font-size: var(--fs-3xl);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  text-align: center;
  margin-bottom: var(--space-6);
}

.popular-services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.popular-service-item {
  padding: var(--space-4);
  background: rgba(30, 32, 38, 0.4);
  border: 1px solid rgba(255, 233, 0, 0.15);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.popular-service-item:hover {
  border-color: rgba(255, 233, 0, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.popular-service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.service-name {
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.service-price {
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  color: var(--brand-yellow);
}

.service-brief {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
  min-height: 40px;
}

.service-trust-badges {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.trust-badge {
  padding: 0.25rem 0.625rem;
  background: rgba(24, 220, 126, 0.1);
  border: 1px solid rgba(24, 220, 126, 0.2);
  border-radius: var(--radius-sm);
  color: var(--color-success);
  font-size: var(--fs-xs);
}

.show-more-services {
  display: block;
  margin: var(--space-4) auto 0;
}

/* How It Works Timeline */
.how-it-works-section {
  margin-bottom: var(--space-12);
}

.timeline-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6) 0;
}

.timeline-step {
  flex: 1;
  text-align: center;
  position: relative;
}

.step-number {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-3);
  background: linear-gradient(135deg, var(--brand-yellow), var(--color-primary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-3xl);
  font-weight: var(--fw-bold);
  color: var(--bg-primary);
  box-shadow: 0 0 30px rgba(255, 233, 0, 0.4);
}

.step-title {
  font-size: var(--fs-xl);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.step-description {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  max-width: 200px;
  margin: 0 auto;
}

.timeline-connector {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, var(--brand-yellow), transparent);
  position: relative;
  top: -60px;
}

/* Pricing Tiers Section */
.pricing-tiers-section {
  margin-bottom: var(--space-12);
}

.pricing-tiers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-4);
}

.pricing-tier-card {
  padding: var(--space-6);
  text-align: center;
  position: relative;
}

.pricing-tier-card.featured {
  border-color: var(--brand-yellow);
  box-shadow: 0 0 40px rgba(255, 233, 0, 0.2);
  transform: scale(1.05);
}

.tier-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  background: rgba(183, 189, 198, 0.1);
  border: 1px solid rgba(183, 189, 198, 0.3);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  margin-bottom: var(--space-3);
}

.featured-badge {
  background: rgba(255, 233, 0, 0.15);
  border-color: var(--brand-yellow);
  color: var(--brand-yellow);
}

.popular-badge {
  position: absolute;
  top: -12px;
  right: var(--space-4);
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #EF4444, #DC2626);
  border-radius: var(--radius-md);
  color: white;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.tier-name {
  font-size: var(--fs-3xl);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.tier-description {
  font-size: var(--fs-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.tier-features {
  text-align: left;
  margin-bottom: var(--space-6);
}

.feature-item {
  padding: var(--space-2) 0;
  border-bottom: 1px solid rgba(183, 189, 198, 0.1);
  color: var(--text-secondary);
  font-size: var(--fs-base);
}

.feature-item:last-child {
  border-bottom: none;
}

/* Services CTA Section */
.services-cta-section {
  margin-top: var(--space-12);
}

.cta-card {
  padding: var(--space-8);
  text-align: center;
  background: rgba(30, 32, 38, 0.6);
  border: 2px solid rgba(255, 233, 0, 0.3);
}

.cta-title {
  font-size: var(--fs-4xl);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.cta-description {
  font-size: var(--fs-xl);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}

.cta-trust-line {
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
  margin-top: var(--space-4);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .timeline-steps {
    flex-direction: column;
    gap: var(--space-6);
  }

  .timeline-connector {
    width: 2px;
    height: 40px;
    top: 0;
    margin: var(--space-2) auto;
  }

  .step-description {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .service-categories-grid,
  .popular-services-grid,
  .pricing-tiers-grid {
    grid-template-columns: 1fr;
  }

  .pricing-tier-card.featured {
    transform: scale(1);
  }

  .cta-buttons {
    flex-direction: column;
  }

  .services-tabs {
    flex-direction: column;
  }

  .services-tab {
    width: 100%;
  }
}
```

---

## JavaScript Functionality

```javascript
/* ========================================
   MASS-MARKET SERVICES FUNCTIONALITY
   ======================================== */

// Tab Switching for Individuals vs Business
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.services-tab');
  const serviceCards = document.querySelectorAll('.service-category-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetAudience = tab.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Filter service cards
      serviceCards.forEach(card => {
        const cardAudience = card.dataset.audience;

        if (targetAudience === 'individuals') {
          if (cardAudience === 'individuals' || cardAudience === 'both') {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        } else if (targetAudience === 'business') {
          if (cardAudience === 'business' || cardAudience === 'both') {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        }
      });
    });
  });

  // Show More Services Button
  const showMoreBtn = document.querySelector('.show-more-services');
  const moreServices = document.querySelectorAll('.more-services');

  if (showMoreBtn) {
    showMoreBtn.addEventListener('click', () => {
      moreServices.forEach(service => {
        service.style.display = 'block';
      });
      showMoreBtn.style.display = 'none';
    });
  }

  // Smooth scroll to section
  document.querySelectorAll('a[href="#mass-market-services"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('mass-market-services').scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
});
```

---

## Translation Keys (i18n)

### English (EN)

```javascript
// Mass-Market Services Section
mass_services_label: "Professional Services",
mass_services_title: "AI-Powered Services for Everyone",
mass_services_description: "From personal projects to enterprise solutions. Professional quality, AI speed, unbeatable prices.",

// Tabs
tab_individuals: "👤 For Individuals",
tab_business: "🏢 For Businesses",

// Service Categories
service_cat1_title: "Web Development",
service_cat1_description: "Landing pages, portfolios, e-commerce, full web apps",

service_cat2_title: "Business Automation",
service_cat2_description: "AI chatbots, workflow automation, process optimization",

service_cat3_title: "Content Creation",
service_cat3_description: "Blog posts, articles, social media, video scripts",

service_cat4_title: "Graphic Design",
service_cat4_description: "Logos, banners, social media graphics, brand identity",

service_cat5_title: "AI Consulting",
service_cat5_description: "Strategy, implementation roadmap, team training",

service_cat6_title: "Data Analysis",
service_cat6_description: "Market research, analytics reports, predictive insights",

// Common
from: "From",
learn_more: "Learn More →",

// Feature Badges
feature_responsive: "📱 Responsive",
feature_fast: "⚡ 3-7 days",
feature_247: "⚡ 24/7 Support",
feature_roi: "💰 High ROI",
feature_seo: "📈 SEO Optimized",
feature_quick: "⏱️ 24-48h",
feature_revisions: "♻️ 3 Revisions",
feature_vector: "🎯 Vector Files",
feature_custom: "🎯 Custom Plan",
feature_expert: "👨‍💼 Expert Team",
feature_insights: "💡 Actionable",
feature_visual: "📊 Visual Reports",
feature_results: "📈 Proven Results",
feature_allplatforms: "📱 All Platforms",

// Popular Services
popular_services_title: "🔥 Most Requested Services",

popular_1_name: "Business Website",
popular_1_brief: "Professional website with CMS, SEO, and analytics",

popular_2_name: "AI Chatbot",
popular_2_brief: "24/7 customer support bot for your website",

popular_3_name: "Logo Design",
popular_3_brief: "Professional logo with 3 concepts, unlimited revisions",

popular_4_name: "SEO Package",
popular_4_brief: "Full SEO optimization, monthly reports, ongoing optimization",

popular_5_name: "Mobile App",
popular_5_brief: "iOS & Android app with backend and admin panel",

popular_6_name: "Social Media Management",
popular_6_brief: "Daily posts, community management, analytics",

popular_7_name: "Email Campaign",
popular_7_brief: "Email templates, automation, A/B testing",

popular_8_name: "Data Visualization",
popular_8_brief: "Interactive dashboards and custom reports",

// Delivery & Satisfaction
delivery_1_2: "1-2 days",
delivery_2_3: "2-3 days",
delivery_3_5: "3-5 days",
delivery_5_7: "5-7 days",
delivery_14_21: "14-21 days",

satisfaction_93: "93% satisfaction",
satisfaction_94: "94% satisfaction",
satisfaction_95: "95% satisfaction",
satisfaction_96: "96% satisfaction",
satisfaction_97: "97% satisfaction",
satisfaction_98: "98% satisfaction",
satisfaction_99: "99% satisfaction",

show_more_services: "Show More Services",

// How It Works
how_it_works_title: "⚡ How It Works",

step1_title: "Choose Your Service",
step1_description: "Browse our catalog and select the service that fits your needs",

step2_title: "Share Your Requirements",
step2_description: "Fill out a simple form with your project details and preferences",

step3_title: "AI Agents Get to Work",
step3_description: "Our 27 AI agents collaborate to create your project",

step4_title: "Review & Launch",
step4_description: "Review the final product, request changes, then launch!",

// Pricing Tiers
pricing_tiers_title: "💎 Service Tiers",

tier_basic: "Basic",
tier_basic_name: "Essential",
tier_basic_description: "Perfect for individuals and small projects",
tier_basic_feature1: "Fast delivery (3-7 days)",
tier_basic_feature2: "1 revision included",
tier_basic_feature3: "Email support",
tier_basic_feature4: "Source files included",
view_basic_services: "View Services →",

tier_professional: "Professional",
most_popular: "🔥 Most Popular",
tier_professional_name: "Professional",
tier_professional_description: "For growing businesses and serious projects",
tier_pro_feature1: "Priority delivery (1-3 days)",
tier_pro_feature2: "3 revisions included",
tier_pro_feature3: "24/7 chat support",
tier_pro_feature4: "Dedicated project manager",
tier_pro_feature5: "Commercial license",
view_pro_services: "View Services →",

tier_enterprise: "Enterprise",
tier_enterprise_name: "Enterprise",
tier_enterprise_description: "Custom solutions for large organizations",
tier_ent_feature1: "Fastest delivery",
tier_ent_feature2: "Unlimited revisions",
tier_ent_feature3: "Dedicated team",
tier_ent_feature4: "Custom SLA & contract",
tier_ent_feature5: "White-label options",
tier_ent_feature6: "Priority support hotline",
contact_sales: "Contact Sales →",

// Final CTA
services_cta_title: "Ready to Get Started?",
services_cta_description: "Join thousands of satisfied customers who trust HypeAI for their projects",
cta_get_started: "Get Started Now →",
cta_contact_sales: "Contact Sales Team",
cta_trust: "✅ 30-Day Money-Back Guarantee | ⭐ 4.9/5 Average Rating | 🔒 100% Secure",
```

### Russian (RU)

```javascript
// Секция массовых услуг
mass_services_label: "Профессиональные услуги",
mass_services_title: "AI-услуги для всех",
mass_services_description: "От личных проектов до корпоративных решений. Профессиональное качество, скорость AI, непревзойденные цены.",

// Вкладки
tab_individuals: "👤 Для частных лиц",
tab_business: "🏢 Для бизнеса",

// Категории услуг
service_cat1_title: "Веб-разработка",
service_cat1_description: "Лендинги, портфолио, интернет-магазины, полноценные веб-приложения",

service_cat2_title: "Автоматизация бизнеса",
service_cat2_description: "AI чат-боты, автоматизация процессов, оптимизация",

service_cat3_title: "Создание контента",
service_cat3_description: "Статьи для блогов, соцсети, видео-скрипты",

service_cat4_title: "Графический дизайн",
service_cat4_description: "Логотипы, баннеры, графика для соцсетей, фирменный стиль",

service_cat5_title: "AI консалтинг",
service_cat5_description: "Стратегия, дорожная карта внедрения, обучение команды",

service_cat6_title: "Анализ данных",
service_cat6_description: "Маркетинговые исследования, аналитические отчеты, прогнозы",

// Общее
from: "От",
learn_more: "Подробнее →",

// Значки функций
feature_responsive: "📱 Адаптивный",
feature_fast: "⚡ 3-7 дней",
feature_247: "⚡ Поддержка 24/7",
feature_roi: "💰 Высокий ROI",
feature_seo: "📈 SEO оптимизация",
feature_quick: "⏱️ 24-48ч",
feature_revisions: "♻️ 3 правки",
feature_vector: "🎯 Векторные файлы",
feature_custom: "🎯 Индивидуальный план",
feature_expert: "👨‍💼 Команда экспертов",
feature_insights: "💡 Действенные выводы",
feature_visual: "📊 Визуальные отчеты",
feature_results: "📈 Проверенные результаты",
feature_allplatforms: "📱 Все платформы",

// Популярные услуги
popular_services_title: "🔥 Самые востребованные услуги",

popular_1_name: "Бизнес-сайт",
popular_1_brief: "Профессиональный сайт с CMS, SEO и аналитикой",

popular_2_name: "AI чат-бот",
popular_2_brief: "Бот поддержки клиентов 24/7 для вашего сайта",

popular_3_name: "Дизайн логотипа",
popular_3_brief: "Профессиональный логотип: 3 концепции, неограниченные правки",

popular_4_name: "SEO пакет",
popular_4_brief: "Полная SEO оптимизация, ежемесячные отчеты, постоянная работа",

popular_5_name: "Мобильное приложение",
popular_5_brief: "iOS и Android приложение с бэкендом и админ-панелью",

popular_6_name: "SMM управление",
popular_6_brief: "Ежедневные посты, управление сообществом, аналитика",

popular_7_name: "Email кампании",
popular_7_brief: "Email шаблоны, автоматизация, A/B тестирование",

popular_8_name: "Визуализация данных",
popular_8_brief: "Интерактивные дашборды и кастомные отчеты",

// Доставка и удовлетворенность
delivery_1_2: "1-2 дня",
delivery_2_3: "2-3 дня",
delivery_3_5: "3-5 дней",
delivery_5_7: "5-7 дней",
delivery_14_21: "14-21 день",

satisfaction_93: "93% довольны",
satisfaction_94: "94% довольны",
satisfaction_95: "95% довольны",
satisfaction_96: "96% довольны",
satisfaction_97: "97% довольны",
satisfaction_98: "98% довольны",
satisfaction_99: "99% довольны",

show_more_services: "Показать больше услуг",

// Как это работает
how_it_works_title: "⚡ Как это работает",

step1_title: "Выберите услугу",
step1_description: "Просмотрите каталог и выберите услугу, которая вам подходит",

step2_title: "Расскажите о требованиях",
step2_description: "Заполните простую форму с деталями и предпочтениями вашего проекта",

step3_title: "AI агенты начинают работу",
step3_description: "Наши 27 AI агентов совместно создают ваш проект",

step4_title: "Проверка и запуск",
step4_description: "Проверьте финальный продукт, запросите изменения, затем запускайте!",

// Тарифы
pricing_tiers_title: "💎 Тарифные планы",

tier_basic: "Базовый",
tier_basic_name: "Базовый",
tier_basic_description: "Идеально для частных лиц и небольших проектов",
tier_basic_feature1: "Быстрая доставка (3-7 дней)",
tier_basic_feature2: "1 правка включена",
tier_basic_feature3: "Email поддержка",
tier_basic_feature4: "Исходные файлы включены",
view_basic_services: "Смотреть услуги →",

tier_professional: "Профессиональный",
most_popular: "🔥 Самый популярный",
tier_professional_name: "Профессиональный",
tier_professional_description: "Для растущих бизнесов и серьезных проектов",
tier_pro_feature1: "Приоритетная доставка (1-3 дня)",
tier_pro_feature2: "3 правки включены",
tier_pro_feature3: "Чат поддержка 24/7",
tier_pro_feature4: "Выделенный менеджер проекта",
tier_pro_feature5: "Коммерческая лицензия",
view_pro_services: "Смотреть услуги →",

tier_enterprise: "Корпоративный",
tier_enterprise_name: "Корпоративный",
tier_enterprise_description: "Кастомные решения для крупных организаций",
tier_ent_feature1: "Самая быстрая доставка",
tier_ent_feature2: "Неограниченные правки",
tier_ent_feature3: "Выделенная команда",
tier_ent_feature4: "Индивидуальный SLA и контракт",
tier_ent_feature5: "White-label опции",
tier_ent_feature6: "Приоритетная линия поддержки",
contact_sales: "Связаться с отделом продаж →",

// Финальный призыв к действию
services_cta_title: "Готовы начать?",
services_cta_description: "Присоединяйтесь к тысячам довольных клиентов, которые доверяют HypeAI для своих проектов",
cta_get_started: "Начать сейчас →",
cta_contact_sales: "Связаться с отделом продаж",
cta_trust: "✅ 30-дневная гарантия возврата денег | ⭐ Средний рейтинг 4.9/5 | 🔒 100% безопасно",
```

---

## Placement on index.html

**Insert Location:** After the "AI Agents" section (`#ai-agents`) and before the "Tokenomics" section (`#tokenomics`)

```html
<!-- Existing AI Agents Section -->
<section id="ai-agents">
  ...
</section>

<!-- 👇 INSERT NEW SECTION HERE 👇 -->
<section class="section scroll-fade-in" id="mass-market-services">
  ...
</section>

<!-- Existing Tokenomics Section -->
<section id="tokenomics">
  ...
</section>
```

### Navigation Update

Add to the main navigation menu:

```html
<li><a href="#mass-market-services" class="nav-link" data-i18n="nav_mass_services">Services</a></li>
```

Translation keys for nav:
```javascript
nav_mass_services: "Services", // EN
nav_mass_services: "Услуги",   // RU
```

---

## Design Features Summary

### Visual Elements:
1. **Glass-morphism cards** with cosmic gradient borders
2. **Animated hover effects** (scale, glow, border color change)
3. **Gradient buttons** with BNB Chain yellow/gold theme
4. **Service icons** (emojis for clarity and visual appeal)
5. **Trust badges** (delivery time, satisfaction rates)
6. **Timeline visualization** for "How It Works"
7. **Responsive grid layouts** (auto-fit with minmax)

### Interaction Patterns:
1. **Tab switching** (Individuals vs Business)
2. **Show More** button for additional services
3. **Smooth scroll** to section
4. **Hover effects** on all interactive elements
5. **Mobile-friendly** collapse and stack

### Trust Indicators:
1. Delivery timeframes (⏱️ 1-7 days)
2. Satisfaction ratings (⭐ 93-99%)
3. Money-back guarantee (✅ 30 days)
4. Average rating display (⭐ 4.9/5)
5. Security badge (🔒 100% Secure)

---

## Mobile Responsiveness

- **Breakpoint 1024px**: Timeline switches to vertical layout
- **Breakpoint 768px**: All grids become single column
- **Breakpoint 768px**: Tabs stack vertically
- **Breakpoint 768px**: CTA buttons stack vertically

---

## Next Steps

1. **Review this design document**
2. **Approve or request changes**
3. **Implementation** (add HTML/CSS/JS to website)
4. **Translation integration** (add keys to i18n.js)
5. **Testing** (responsive, interactions, i18n)
6. **Launch** 🚀

---

## Notes

- All prices are placeholder examples and should be adjusted based on actual service pricing
- Service descriptions can be expanded with more detail
- Additional services can be added to the "Popular Services" section
- The design is fully compatible with the existing BNB Chain cosmic aesthetic
- All elements use existing CSS variables from the design system

---

**End of Design Document**
