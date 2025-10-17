#!/usr/bin/env python3
"""
Script to add data-i18n attributes to index.html
Adds comprehensive i18n coverage to all major sections
"""

import re
import json

def add_services_i18n(content):
    """Add data-i18n to AI Services section"""
    replacements = [
        # Security & Auditing
        (r'(<h3 class="service-title">Security & Auditing</h3>)',
         r'<h3 class="service-title" data-i18n="services.security.title">Security & Auditing</h3>'),
        (r'(<p style="color: var\(--gray\); margin-bottom: 1rem; line-height: 1\.5;">)\s*Professional smart contract audits',
         r'\1<span data-i18n="services.security.description">Professional smart contract audits and security assessments by ATLAS, our blockchain security specialist. We identify vulnerabilities, ensure code safety, and protect your project from exploits with military-grade security protocols.</span>'),

        # Tokenomics Design
        (r'(<h3 class="service-title">Tokenomics Design</h3>)',
         r'<h3 class="service-title" data-i18n="services.tokenomics.title">Tokenomics Design</h3>'),

        # Smart Contract Development
        (r'(<h3 class="service-title">Smart Contract Development</h3>)',
         r'<h3 class="service-title" data-i18n="services.development.title">Smart Contract Development</h3>'),

        # Marketing & Growth
        (r'(<h3 class="service-title">Marketing & Growth</h3>)',
         r'<h3 class="service-title" data-i18n="services.marketing.title">Marketing & Growth</h3>'),

        # Community Management
        (r'(<h3 class="service-title">Community Management</h3>)',
         r'<h3 class="service-title" data-i18n="services.community.title">Community Management</h3>'),

        # Design & Branding
        (r'(<h3 class="service-title">Design & Branding</h3>)',
         r'<h3 class="service-title" data-i18n="services.design.title">Design & Branding</h3>'),

        # Content Creation
        (r'(<h3 class="service-title">Content Creation</h3>)',
         r'<h3 class="service-title" data-i18n="services.content.title">Content Creation</h3>'),

        # DevOps & Operations
        (r'(<h3 class="service-title">DevOps & Operations</h3>)',
         r'<h3 class="service-title" data-i18n="services.devops.title">DevOps & Operations</h3>'),
    ]

    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)

    return content

def add_token_growth_i18n(content):
    """Add data-i18n to Token Growth section"""
    replacements = [
        (r'(<h2 class="section-title">Data-Driven Token Economics</h2>)',
         r'<h2 class="section-title" data-i18n="tokenGrowth.title">Data-Driven Token Economics</h2>'),
        (r'(<p class="section-subtitle">Sustainable growth mechanisms backed by real utility</p>)',
         r'<p class="section-subtitle" data-i18n="tokenGrowth.subtitle">Sustainable growth mechanisms backed by real utility</p>'),
    ]

    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)

    return content

def add_ai_agents_i18n(content):
    """Add data-i18n to AI Agents section"""
    replacements = [
        (r'(<h2 class="section-title">Meet Our AI Team</h2>)',
         r'<h2 class="section-title" data-i18n="aiAgents.title">Meet Our AI Team</h2>'),
        (r'(<p class="section-subtitle">27 agents working 24/7\. Never sleep\. Never quit\.</p>)',
         r'<p class="section-subtitle" data-i18n="aiAgents.subtitle">27 agents working 24/7. Never sleep. Never quit.</p>'),
    ]

    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)

    return content

def main():
    # Read the HTML file
    with open('/Users/ai.place/Crypto/public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    print("Starting i18n attribute additions...")

    # Add i18n attributes
    content = add_services_i18n(content)
    content = add_token_growth_i18n(content)
    content = add_ai_agents_i18n(content)

    # Write back
    with open('/Users/ai.place/Crypto/public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)

    print("✅ Successfully added i18n attributes!")
    print("Run the HTML file to test language switching")

if __name__ == '__main__':
    main()
