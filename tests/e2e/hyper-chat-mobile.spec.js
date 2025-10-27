import { test, expect, devices } from '@playwright/test';

const mobileDevices = [
    { name: 'iPhone 12', ...devices['iPhone 12'] },
    { name: 'iPhone SE', ...devices['iPhone SE'] },
    { name: 'Pixel 5', ...devices['Pixel 5'] },
    { name: 'Galaxy S9+', ...devices['Galaxy S9+'] },
    { name: 'iPad Mini', ...devices['iPad Mini'] }
];

mobileDevices.forEach(device => {
    test.describe(`Mobile: ${device.name}`, () => {
        test.use(device);

        test('chat interface is usable on mobile', async ({ page }) => {
            await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

            // Wait for page load
            await page.waitForLoadState('networkidle');

            // Chat input visible and usable
            const chatInput = page.locator('#chatInput');
            await expect(chatInput).toBeVisible();

            // Tap input
            await chatInput.tap();
            await chatInput.fill('Test on mobile');

            // Send button tappable (44x44px minimum)
            const sendBtn = page.locator('#sendBtn');
            const box = await sendBtn.boundingBox();
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);

            // Can send message
            await sendBtn.tap();
            await expect(page.locator('.message.user')).toBeVisible();
        });

        test('touch targets meet 44x44px minimum', async ({ page }) => {
            await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');
            await page.waitForLoadState('networkidle');

            const touchTargets = [
                { selector: '#sendBtn', name: 'Send button' },
                { selector: '#voiceBtn', name: 'Voice button' },
                { selector: '.new-chat-btn', name: 'New chat button' },
                { selector: '.quick-prompt', name: 'Quick prompt' }
            ];

            for (const target of touchTargets) {
                const element = page.locator(target.selector).first();
                if (await element.isVisible()) {
                    const box = await element.boundingBox();

                    expect(box.width, `${target.name} width`).toBeGreaterThanOrEqual(44);
                    expect(box.height, `${target.name} height`).toBeGreaterThanOrEqual(44);
                }
            }
        });

        test('quick prompts work on mobile', async ({ page }) => {
            await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');
            await page.waitForLoadState('networkidle');

            // Tap quick prompt
            await page.locator('.quick-prompt').first().tap();

            // Message sent
            await expect(page.locator('.message.user')).toBeVisible();

            // Response received
            await expect(page.locator('.message.assistant')).toBeVisible({ timeout: 10000 });
        });

        test('viewport doesn\'t zoom on input focus', async ({ page }) => {
            await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

            // Get initial viewport
            const initialViewport = await page.evaluate(() => {
                return window.visualViewport.scale;
            });

            // Focus input
            await page.locator('#chatInput').tap();

            // Wait a moment for zoom
            await page.waitForTimeout(500);

            // Check viewport didn't zoom
            const afterViewport = await page.evaluate(() => {
                return window.visualViewport.scale;
            });

            expect(afterViewport).toBe(initialViewport);
        });

        test('scrolling works smoothly with many messages', async ({ page }) => {
            await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

            // Send multiple messages
            for (let i = 0; i < 10; i++) {
                await page.locator('#chatInput').fill(`Message ${i + 1}`);
                await page.locator('#sendBtn').tap();
                await page.waitForTimeout(300);
            }

            // Scroll to top
            await page.evaluate(() => {
                document.querySelector('.chat-messages')?.scrollTo({ top: 0, behavior: 'smooth' });
            });

            await page.waitForTimeout(500);

            // Verify scroll position
            const scrollTop = await page.evaluate(() => {
                return document.querySelector('.chat-messages')?.scrollTop || 0;
            });

            expect(scrollTop).toBeLessThan(100);
        });

        test('landscape orientation works correctly', async ({ page }) => {
            await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

            // Rotate to landscape
            await page.setViewportSize({
                width: device.viewport.height,
                height: device.viewport.width
            });

            await page.waitForTimeout(500);

            // Check interface still usable
            await expect(page.locator('#chatInput')).toBeVisible();
            await expect(page.locator('#sendBtn')).toBeVisible();

            // Can still send messages
            await page.locator('#chatInput').fill('Landscape test');
            await page.locator('#sendBtn').tap();
            await expect(page.locator('.message.user')).toBeVisible();
        });
    });
});

test.describe('Mobile-specific features', () => {
    test.use(devices['iPhone 12']);

    test('swipe gestures work', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        // Send some messages first
        for (let i = 0; i < 3; i++) {
            await page.locator('#chatInput').fill(`Message ${i + 1}`);
            await page.locator('#sendBtn').tap();
            await page.waitForTimeout(300);
        }

        // Try swipe on a message (if implemented)
        const message = page.locator('.message.assistant').first();
        const box = await message.boundingBox();

        // Swipe left
        await page.touchscreen.tap(box.x + box.width - 10, box.y + box.height / 2);
        await page.touchscreen.move(box.x + 10, box.y + box.height / 2);
    });

    test('pull-to-refresh doesn\'t interfere', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        // Try pull-to-refresh gesture
        await page.touchscreen.tap(200, 100);
        await page.touchscreen.move(200, 300);

        // Page shouldn't reload
        await page.waitForTimeout(1000);
        await expect(page.locator('#welcomeState')).toBeVisible();
    });
});
