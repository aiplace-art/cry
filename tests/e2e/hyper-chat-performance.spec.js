import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
    test('page loads within performance budget', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        // Wait for page to be interactive
        await page.waitForLoadState('networkidle');

        // Measure performance
        const performance = await page.evaluate(() => {
            const timing = performance.timing;
            const paintEntries = performance.getEntriesByType('paint');
            const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
            const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');

            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadComplete: timing.loadEventEnd - timing.navigationStart,
                firstPaint: firstPaint?.startTime || 0,
                firstContentfulPaint: firstContentfulPaint?.startTime || 0
            };
        });

        // Performance budgets
        expect(performance.firstPaint, 'First Paint').toBeLessThan(1000); // < 1s
        expect(performance.firstContentfulPaint, 'First Contentful Paint').toBeLessThan(1500); // < 1.5s
        expect(performance.domContentLoaded, 'DOM Content Loaded').toBeLessThan(2000); // < 2s
        expect(performance.loadComplete, 'Load Complete').toBeLessThan(3000); // < 3s
    });

    test('handles 20 messages without performance degradation', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');
        await page.waitForLoadState('networkidle');

        const startTime = Date.now();
        const renderTimes = [];

        // Send 20 messages and measure render time
        for (let i = 0; i < 20; i++) {
            const messageStart = Date.now();

            await page.locator('#chatInput').fill(`Performance test message ${i + 1}`);
            await page.locator('#sendBtn').click();
            await page.waitForSelector('.message.user:last-child', { timeout: 5000 });

            const messageEnd = Date.now();
            renderTimes.push(messageEnd - messageStart);

            // Small delay to simulate real usage
            await page.waitForTimeout(100);
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Should complete in reasonable time
        expect(totalTime).toBeLessThan(30000); // < 30s for 20 messages

        // Calculate average render time
        const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
        expect(avgRenderTime).toBeLessThan(1500); // < 1.5s per message

        // Check for performance degradation (last 5 vs first 5)
        const firstFiveAvg = renderTimes.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
        const lastFiveAvg = renderTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;

        // Last messages shouldn't be more than 50% slower
        expect(lastFiveAvg).toBeLessThan(firstFiveAvg * 1.5);
    });

    test('memory usage stays within limits', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        // Get initial memory
        const initialMemory = await page.evaluate(() => {
            if (performance.memory) {
                return performance.memory.usedJSHeapSize;
            }
            return 0;
        });

        // Send 50 messages
        for (let i = 0; i < 50; i++) {
            await page.locator('#chatInput').fill(`Memory test ${i + 1}`);
            await page.locator('#sendBtn').click();
            await page.waitForTimeout(100);
        }

        // Force garbage collection if available
        await page.evaluate(() => {
            if (window.gc) {
                window.gc();
            }
        });

        await page.waitForTimeout(1000);

        // Get final memory
        const finalMemory = await page.evaluate(() => {
            if (performance.memory) {
                return performance.memory.usedJSHeapSize;
            }
            return 0;
        });

        if (initialMemory > 0 && finalMemory > 0) {
            const memoryIncrease = finalMemory - initialMemory;
            const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

            // Memory increase should be reasonable (< 50MB)
            expect(memoryIncreaseMB).toBeLessThan(50);
        }
    });

    test('animation performance is smooth', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        // Send a message to trigger animations
        await page.locator('#chatInput').fill('Animation test');
        await page.locator('#sendBtn').click();

        // Measure frame rate during animation
        const frameData = await page.evaluate(async () => {
            return new Promise((resolve) => {
                let frames = 0;
                let lastTime = performance.now();
                const duration = 2000; // 2 seconds

                function countFrames() {
                    frames++;
                    const currentTime = performance.now();

                    if (currentTime - lastTime >= duration) {
                        const fps = frames / (duration / 1000);
                        resolve({ fps, frames, duration });
                    } else {
                        requestAnimationFrame(countFrames);
                    }
                }

                requestAnimationFrame(countFrames);
            });
        });

        // Should maintain at least 30 FPS (ideally 60)
        expect(frameData.fps).toBeGreaterThan(30);
    });

    test('lazy loading works for images', async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');

        // Check if images have loading="lazy"
        const images = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs.map(img => ({
                src: img.src,
                loading: img.loading
            }));
        });

        // At least some images should use lazy loading
        const lazyImages = images.filter(img => img.loading === 'lazy');
        expect(lazyImages.length).toBeGreaterThan(0);
    });

    test('bundle size is reasonable', async ({ page }) => {
        const resources = [];

        page.on('response', response => {
            if (response.url().includes('.js') || response.url().includes('.css')) {
                resources.push({
                    url: response.url(),
                    size: 0,
                    type: response.url().includes('.js') ? 'js' : 'css'
                });
            }
        });

        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');
        await page.waitForLoadState('networkidle');

        // Get resource sizes
        const resourceSizes = await Promise.all(
            resources.map(async resource => {
                try {
                    const response = await page.goto(resource.url);
                    const buffer = await response.body();
                    return {
                        ...resource,
                        size: buffer.length
                    };
                } catch (e) {
                    return resource;
                }
            })
        );

        // Calculate total sizes
        const totalJS = resourceSizes
            .filter(r => r.type === 'js')
            .reduce((sum, r) => sum + r.size, 0);

        const totalCSS = resourceSizes
            .filter(r => r.type === 'css')
            .reduce((sum, r) => sum + r.size, 0);

        // Budget: JS < 500KB, CSS < 100KB
        expect(totalJS / 1024).toBeLessThan(500);
        expect(totalCSS / 1024).toBeLessThan(100);
    });
});
