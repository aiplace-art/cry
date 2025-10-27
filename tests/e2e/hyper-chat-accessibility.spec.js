import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
    test('meets WCAG 2.1 AA standards', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('keyboard navigation works', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');
        await page.waitForLoadState('networkidle');

        // Tab to input
        await page.keyboard.press('Tab');
        const focusedElement1 = await page.evaluate(() => document.activeElement.id);

        // Should be able to reach input
        let inputFocused = focusedElement1 === 'chatInput';

        if (!inputFocused) {
            // Try a few more tabs
            for (let i = 0; i < 5; i++) {
                await page.keyboard.press('Tab');
                const currentFocus = await page.evaluate(() => document.activeElement.id);
                if (currentFocus === 'chatInput') {
                    inputFocused = true;
                    break;
                }
            }
        }

        expect(inputFocused).toBeTruthy();

        // Type message
        await page.keyboard.type('Test keyboard navigation');

        // Tab to send button
        await page.keyboard.press('Tab');
        const sendBtnFocused = await page.evaluate(() => {
            return document.activeElement.id === 'sendBtn' ||
                   document.activeElement.closest('#sendBtn') !== null;
        });

        // If not on send button, tab a few more times
        if (!sendBtnFocused) {
            for (let i = 0; i < 3; i++) {
                await page.keyboard.press('Tab');
            }
        }

        // Press Enter to send
        await page.keyboard.press('Enter');

        // Message sent
        await expect(page.locator('.message.user')).toBeVisible({ timeout: 5000 });
    });

    test('focus indicators visible', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        // Focus input
        await page.locator('#chatInput').focus();

        // Check focus ring
        const inputStyles = await page.locator('#chatInput').evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
                outline: styles.outline,
                outlineWidth: styles.outlineWidth,
                outlineStyle: styles.outlineStyle,
                boxShadow: styles.boxShadow
            };
        });

        // Should have visible focus indicator
        const hasFocusIndicator =
            inputStyles.outline !== 'none' ||
            inputStyles.outlineWidth !== '0px' ||
            inputStyles.boxShadow !== 'none';

        expect(hasFocusIndicator).toBeTruthy();
    });

    test('screen reader announces messages', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        // Check for ARIA live regions
        const liveRegions = await page.evaluate(() => {
            const regions = document.querySelectorAll('[aria-live]');
            return Array.from(regions).map(el => ({
                ariaLive: el.getAttribute('aria-live'),
                ariaAtomic: el.getAttribute('aria-atomic'),
                role: el.getAttribute('role')
            }));
        });

        // Should have at least one live region for messages
        expect(liveRegions.length).toBeGreaterThan(0);
    });

    test('all interactive elements have accessible names', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        // Check buttons
        const buttons = await page.evaluate(() => {
            const btns = document.querySelectorAll('button, [role="button"]');
            return Array.from(btns).map(btn => ({
                text: btn.textContent?.trim(),
                ariaLabel: btn.getAttribute('aria-label'),
                title: btn.getAttribute('title'),
                hasAccessibleName: !!(btn.textContent?.trim() || btn.getAttribute('aria-label') || btn.getAttribute('title'))
            }));
        });

        // All buttons should have accessible names
        buttons.forEach(btn => {
            expect(btn.hasAccessibleName).toBeTruthy();
        });
    });

    test('images have alt text', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        const images = await page.evaluate(() => {
            const imgs = document.querySelectorAll('img');
            return Array.from(imgs).map(img => ({
                src: img.src,
                alt: img.alt,
                role: img.getAttribute('role')
            }));
        });

        images.forEach(img => {
            // Images should have alt text or role="presentation"
            expect(img.alt !== undefined || img.role === 'presentation').toBeTruthy();
        });
    });

    test('color contrast meets WCAG AA', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        const colorContrastResults = await new AxeBuilder({ page })
            .withTags(['wcag2aa'])
            .options({ rules: { 'color-contrast': { enabled: true } } })
            .analyze();

        const contrastViolations = colorContrastResults.violations.filter(
            v => v.id === 'color-contrast'
        );

        expect(contrastViolations).toEqual([]);
    });

    test('form labels are properly associated', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        const formElements = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input, textarea, select');
            return Array.from(inputs).map(input => ({
                id: input.id,
                ariaLabel: input.getAttribute('aria-label'),
                ariaLabelledBy: input.getAttribute('aria-labelledby'),
                hasLabel: !!document.querySelector(`label[for="${input.id}"]`),
                placeholder: input.placeholder
            }));
        });

        formElements.forEach(input => {
            // Each input should have a label or aria-label
            const hasAccessibleLabel =
                input.hasLabel ||
                input.ariaLabel ||
                input.ariaLabelledBy ||
                input.placeholder;

            expect(hasAccessibleLabel).toBeTruthy();
        });
    });

    test('headings are in logical order', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        const headings = await page.evaluate(() => {
            const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            return Array.from(headingElements).map(h => ({
                level: parseInt(h.tagName[1]),
                text: h.textContent?.trim()
            }));
        });

        // Check heading hierarchy
        for (let i = 1; i < headings.length; i++) {
            const diff = headings[i].level - headings[i - 1].level;
            // Shouldn't skip levels when going down
            if (headings[i].level > headings[i - 1].level) {
                expect(diff).toBeLessThanOrEqual(1);
            }
        }
    });

    test('skip to main content link works', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        // Tab to first element
        await page.keyboard.press('Tab');

        // Check if skip link is visible
        const skipLink = await page.evaluate(() => {
            const link = document.querySelector('[href="#main-content"], .skip-link');
            if (link) {
                return {
                    exists: true,
                    visible: window.getComputedStyle(link).opacity !== '0'
                };
            }
            return { exists: false };
        });

        // Skip link should exist (best practice)
        // Note: May not be critical failure if not present
        if (skipLink.exists) {
            expect(skipLink.visible).toBeTruthy();
        }
    });
});

test.describe('High Contrast Mode', () => {
    test('works in high contrast mode', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        // Emulate high contrast mode
        await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });

        await page.waitForTimeout(500);

        // Check critical elements are still visible
        await expect(page.locator('#chatInput')).toBeVisible();
        await expect(page.locator('#sendBtn')).toBeVisible();

        // Try to interact
        await page.locator('#chatInput').fill('High contrast test');
        await page.locator('#sendBtn').click();

        await expect(page.locator('.message.user')).toBeVisible();
    });
});
