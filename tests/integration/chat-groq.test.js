/**
 * Groq Chat Integration E2E Tests
 * End-to-end tests for chat interface with Groq API
 */

const { test, expect } = require('@playwright/test');

test.describe('Groq AI Chat Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page with AI chat
    await page.goto('http://localhost:5173/public/variant-2/index.html');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Chat Interface', () => {
    test('Should open and close chat successfully', async ({ page }) => {
      // Find and click chat button
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button, #ai-chat-toggle');
      await chatButton.click();

      // Chat should be visible
      const chatContainer = page.locator('[data-chat-container], .ai-chat-container, #ai-chat');
      await expect(chatContainer).toBeVisible({ timeout: 2000 });

      // Close chat
      const closeButton = page.locator('[data-chat-close], .chat-close, .close-chat');
      await closeButton.click();

      // Chat should be hidden
      await expect(chatContainer).toBeHidden({ timeout: 2000 });
    });

    test('Should display welcome message on open', async ({ page }) => {
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      // Should show welcome message in Russian
      const welcomeMessage = page.locator('.chat-message, .message').first();
      await expect(welcomeMessage).toContainText(/Привет|Здравствуйте/i);
    });

    test('Should have input field and send button', async ({ page }) => {
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const input = page.locator('input[type="text"], textarea').last();
      const sendButton = page.locator('button[type="submit"], .send-button').last();

      await expect(input).toBeVisible();
      await expect(sendButton).toBeVisible();
    });
  });

  test.describe('Message Sending', () => {
    test('Should send message and receive response', async ({ page }) => {
      // Open chat
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      // Type message
      const input = page.locator('input[type="text"], textarea').last();
      await input.fill('Что такое HypeAI?');

      // Send message
      const sendButton = page.locator('button[type="submit"], .send-button').last();
      await sendButton.click();

      // Wait for response (max 5 seconds)
      await page.waitForSelector('.chat-message.assistant, .message.ai', {
        timeout: 5000
      });

      // Verify response contains relevant information
      const response = page.locator('.chat-message.assistant, .message.ai').last();
      await expect(response).toContainText(/HypeAI|агент|токен/i);
    });

    test('Should handle Enter key to send message', async ({ page }) => {
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const input = page.locator('input[type="text"], textarea').last();
      await input.fill('Привет');
      await input.press('Enter');

      // Should see user message
      const userMessage = page.locator('.chat-message.user, .message.user').last();
      await expect(userMessage).toContainText('Привет');
    });

    test('Should prevent empty message submission', async ({ page }) => {
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const sendButton = page.locator('button[type="submit"], .send-button').last();

      // Count messages before
      const messagesBefore = await page.locator('.chat-message, .message').count();

      // Try to send empty message
      await sendButton.click();

      // Wait a bit
      await page.waitForTimeout(500);

      // Count messages after
      const messagesAfter = await page.locator('.chat-message, .message').count();

      // Should be the same
      expect(messagesAfter).toBe(messagesBefore);
    });
  });

  test.describe('Error Handling', () => {
    test('Should show error message on API failure', async ({ page }) => {
      // Intercept API calls and make them fail
      await page.route('**/api.groq.com/**', route => {
        route.abort('failed');
      });

      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const input = page.locator('input[type="text"], textarea').last();
      await input.fill('Тест');
      await input.press('Enter');

      // Should show fallback or error message
      const errorMessage = page.locator('.error-message, .fallback-message').last();
      await expect(errorMessage).toBeVisible({ timeout: 3000 });
    });

    test('Should show retry button on error', async ({ page }) => {
      await page.route('**/api.groq.com/**', route => {
        route.abort('failed');
      });

      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const input = page.locator('input[type="text"], textarea').last();
      await input.fill('Тест');
      await input.press('Enter');

      // Should show retry button
      const retryButton = page.locator('.retry-button, button:has-text("Повторить")');
      await expect(retryButton).toBeVisible({ timeout: 3000 });
    });

    test('Should use fallback response on network error', async ({ page }) => {
      await page.route('**/api.groq.com/**', route => {
        route.abort('failed');
      });

      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const input = page.locator('input[type="text"], textarea').last();
      await input.fill('Что такое HypeAI?');
      await input.press('Enter');

      // Should show fallback response from knowledge base
      await page.waitForTimeout(2000);
      const lastMessage = page.locator('.chat-message, .message').last();
      await expect(lastMessage).toContainText(/HypeAI|агент/i);
    });
  });

  test.describe('Loading States', () => {
    test('Should show loading indicator while waiting for response', async ({ page }) => {
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const input = page.locator('input[type="text"], textarea').last();
      await input.fill('Тест');
      await input.press('Enter');

      // Should show loading indicator
      const loader = page.locator('.loading, .typing-indicator, .spinner');
      await expect(loader).toBeVisible({ timeout: 1000 });
    });

    test('Should disable input while processing', async ({ page }) => {
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const input = page.locator('input[type="text"], textarea').last();
      await input.fill('Тест');
      await input.press('Enter');

      // Input should be disabled
      await expect(input).toBeDisabled({ timeout: 1000 });
    });
  });

  test.describe('Conversation History', () => {
    test('Should maintain conversation context', async ({ page }) => {
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const input = page.locator('input[type="text"], textarea').last();

      // First message
      await input.fill('Привет');
      await input.press('Enter');
      await page.waitForTimeout(2000);

      // Second message
      await input.fill('Что ты знаешь о проекте?');
      await input.press('Enter');
      await page.waitForTimeout(2000);

      // Should have multiple messages
      const messages = page.locator('.chat-message, .message');
      const count = await messages.count();
      expect(count).toBeGreaterThan(2);
    });

    test('Should scroll to latest message', async ({ page }) => {
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const input = page.locator('input[type="text"], textarea').last();

      // Send multiple messages
      for (let i = 0; i < 5; i++) {
        await input.fill(`Сообщение ${i + 1}`);
        await input.press('Enter');
        await page.waitForTimeout(1000);
      }

      // Last message should be visible
      const lastMessage = page.locator('.chat-message, .message').last();
      await expect(lastMessage).toBeInViewport();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('Should work on mobile devices', async ({ page }) => {
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const chatContainer = page.locator('[data-chat-container], .ai-chat-container');
      await expect(chatContainer).toBeVisible();

      // Should be full screen on mobile
      const boundingBox = await chatContainer.boundingBox();
      expect(boundingBox.width).toBeGreaterThan(300);
    });

    test('Should have touch-friendly buttons', async ({ page }) => {
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const sendButton = page.locator('button[type="submit"], .send-button').last();
      const boundingBox = await sendButton.boundingBox();

      // Button should be at least 44x44 (iOS recommendation)
      expect(boundingBox.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe('Performance', () => {
    test('Should load chat interface quickly', async ({ page }) => {
      const startTime = Date.now();

      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const chatContainer = page.locator('[data-chat-container], .ai-chat-container');
      await expect(chatContainer).toBeVisible();

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(1000);
    });

    test('Should not cause memory leaks after multiple messages', async ({ page }) => {
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const input = page.locator('input[type="text"], textarea').last();

      // Send many messages
      for (let i = 0; i < 20; i++) {
        await input.fill(`Сообщение ${i + 1}`);
        await input.press('Enter');
        await page.waitForTimeout(500);
      }

      // Page should still be responsive
      await expect(input).toBeVisible();
      await expect(input).toBeEnabled();
    });
  });

  test.describe('Accessibility', () => {
    test('Should be keyboard navigable', async ({ page }) => {
      // Tab to chat button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Open with Enter
      await page.keyboard.press('Enter');

      const chatContainer = page.locator('[data-chat-container], .ai-chat-container');
      await expect(chatContainer).toBeVisible();
    });

    test('Should have proper ARIA labels', async ({ page }) => {
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const input = page.locator('input[type="text"], textarea').last();
      const ariaLabel = await input.getAttribute('aria-label');

      expect(ariaLabel).toBeTruthy();
    });
  });

  test.describe('Rate Limiting', () => {
    test('Should show rate limit message after many requests', async ({ page }) => {
      const chatButton = page.locator('[data-chat-toggle], .ai-chat-button');
      await chatButton.click();

      const input = page.locator('input[type="text"], textarea').last();

      // Send many messages rapidly
      for (let i = 0; i < 15; i++) {
        await input.fill(`Быстрое сообщение ${i + 1}`);
        await input.press('Enter');
        await page.waitForTimeout(200);
      }

      // Should show rate limit warning
      const rateLimitMessage = page.locator('text=/слишком много|rate limit|подождите/i');
      await expect(rateLimitMessage).toBeVisible({ timeout: 5000 });
    });
  });
});
