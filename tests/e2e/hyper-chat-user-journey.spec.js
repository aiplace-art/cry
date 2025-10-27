import { test, expect } from '@playwright/test';

test.describe('Hyper Chat - Complete User Journey', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');
    });

    test('new user can start conversation and get response', async ({ page }) => {
        // 1. Welcome screen visible
        await expect(page.locator('#welcomeState')).toBeVisible();
        await expect(page.locator('.welcome-title')).toHaveText(/How can I help/i);

        // 2. Click quick prompt
        await page.locator('.quick-prompt').first().click();

        // 3. Welcome should hide
        await expect(page.locator('#welcomeState')).toBeHidden();

        // 4. User message appears
        await expect(page.locator('.message.user')).toBeVisible();

        // 5. Agent processing appears
        await expect(page.locator('.agent-processing')).toBeVisible();
        await expect(page.locator('.processing-step.active')).toBeVisible();

        // 6. Assistant response appears
        await expect(page.locator('.message.assistant')).toBeVisible({ timeout: 10000 });

        // 7. Follow-up questions appear
        await expect(page.locator('.follow-up-suggestions')).toBeVisible();
        await expect(page.locator('.follow-up-btn')).toHaveCount(4);

        // 8. Message actions visible on hover
        await page.locator('.message.assistant').first().hover();
        await expect(page.locator('.message-actions')).toBeVisible();
    });

    test('user can type and send custom message', async ({ page }) => {
        const testMessage = 'Tell me about $HYPE token';

        // Type message
        await page.locator('#chatInput').fill(testMessage);

        // Send button enabled
        await expect(page.locator('#sendBtn')).toBeEnabled();

        // Click send
        await page.locator('#sendBtn').click();

        // Message sent
        await expect(page.locator('.message.user').last()).toContainText(testMessage);

        // Response received
        await expect(page.locator('.message.assistant').last()).toBeVisible({ timeout: 10000 });
    });

    test('user can copy message to clipboard', async ({ page }) => {
        // Send message first
        await page.locator('.quick-prompt').first().click();
        await expect(page.locator('.message.assistant')).toBeVisible({ timeout: 10000 });

        // Hover to show actions
        await page.locator('.message.assistant').first().hover();

        // Click copy
        await page.locator('[data-action="copy"]').first().click();

        // Toast notification
        await expect(page.locator('.toast-notification')).toContainText(/copied/i);
    });

    test('user can start new chat', async ({ page }) => {
        // Send message
        await page.locator('#chatInput').fill('Test message');
        await page.locator('#sendBtn').click();
        await expect(page.locator('.message')).toHaveCount(2); // user + assistant

        // Click new chat
        await page.locator('.new-chat-btn').click();

        // Messages cleared
        await expect(page.locator('.message')).toHaveCount(0);

        // Welcome screen back
        await expect(page.locator('#welcomeState')).toBeVisible();
    });

    test('voice input button works', async ({ page }) => {
        const voiceBtn = page.locator('#voiceBtn');

        // Click voice button
        await voiceBtn.click();

        // Check if active or shows unsupported message
        const isActive = await voiceBtn.evaluate(el => el.classList.contains('active'));
        const hasToast = await page.locator('.toast-notification').isVisible();

        expect(isActive || hasToast).toBeTruthy();
    });

    test('chat history persists across page reloads', async ({ page }) => {
        // Send a message
        await page.locator('#chatInput').fill('Test persistence');
        await page.locator('#sendBtn').click();
        await expect(page.locator('.message.assistant')).toBeVisible({ timeout: 10000 });

        // Get message count
        const messageCount = await page.locator('.message').count();

        // Reload page
        await page.reload();

        // Messages should be restored
        await expect(page.locator('.message')).toHaveCount(messageCount);
    });

    test('error handling for API failures', async ({ page }) => {
        // Mock API to fail
        await page.route('**/api/**', route => {
            route.abort('failed');
        });

        // Try to send message
        await page.locator('#chatInput').fill('Test error handling');
        await page.locator('#sendBtn').click();

        // Error message should appear
        await expect(page.locator('.error-message, .toast-notification')).toBeVisible({ timeout: 5000 });
    });
});
