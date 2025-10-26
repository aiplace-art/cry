# Frontend Integration Guide - Groq API

## Quick Integration for Diamond Chat

### Step 1: Update Diamond Chat Controller

Edit `/public/variant-2/js/ai-chat-diamond.js`:

**Find the `generateResponse` method (around line 269):**

```javascript
generateResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  let response = '';

  // ... existing code ...
}
```

**Replace with this async version:**

```javascript
async generateResponse(userMessage) {
  try {
    // Show typing indicator
    this.showTypingIndicator();

    // Call Groq API
    const response = await fetch('/api/chat-groq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage,
        conversationHistory: this.messages
          .slice(-5)
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Remove typing indicator
    this.removeTypingIndicator();

    if (data.success && data.response) {
      this.addMessage(data.response, 'ai');
    } else {
      throw new Error('Invalid API response');
    }

  } catch (error) {
    console.error('Chat API Error:', error);

    // Remove typing indicator
    this.removeTypingIndicator();

    // Fallback to local knowledge base
    this.generateLocalResponse(userMessage);
  }
}
```

**Rename the existing `generateResponse` to `generateLocalResponse`:**

```javascript
// Keep this as fallback
generateLocalResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  let response = '';

  // Check if knowledge base is available
  const kb = window.HYPEAI_KNOWLEDGE;
  if (!kb) {
    response = '✨ Извините, база знаний загружается. Попробуйте через несколько секунд.';
    this.addMessage(response, 'ai');
    return;
  }

  // ... rest of existing local response logic ...
}
```

### Step 2: Update `handleSend` method

**Find the `handleSend` method (around line 189):**

```javascript
handleSend() {
  const text = this.inputField?.value.trim();
  if (!text) return;

  // Add user message
  this.addMessage(text, 'user');

  // Clear input
  if (this.inputField) {
    this.inputField.value = '';
  }

  // Show typing indicator
  this.showTypingIndicator();

  // Simulate AI response (500-1500ms delay)
  const delay = 500 + Math.random() * 1000;
  setTimeout(() => {
    this.removeTypingIndicator();
    this.generateResponse(text);
  }, delay);

  // Track event
  this.trackEvent('message_sent', { length: text.length });
}
```

**Replace with:**

```javascript
async handleSend() {
  const text = this.inputField?.value.trim();
  if (!text) return;

  // Add user message
  this.addMessage(text, 'user');

  // Clear input
  if (this.inputField) {
    this.inputField.value = '';
  }

  // Call API (handles typing indicator internally)
  await this.generateResponse(text);

  // Track event
  this.trackEvent('message_sent', { length: text.length });
}
```

### Step 3: Add Error Handling UI (Optional)

Add this method to show user-friendly error messages:

```javascript
showError(message) {
  const errorHTML = `
    <div class="chat-message ai error">
      <div class="message-avatar">
        <video class="message-cosmic-video" autoplay loop muted playsinline>
          <source src="assets/ai-assistant/animations/button-cosmic-ultra.mp4" type="video/mp4">
        </video>
        <span class="message-ai-text">AI</span>
      </div>
      <div class="message-bubble error">
        ⚠️ ${this.escapeHTML(message)}
        <br><br>
        <small>Используется локальный режим</small>
      </div>
    </div>
  `;

  this.messagesContainer?.insertAdjacentHTML('beforeend', errorHTML);
  this.scrollToBottom();
}
```

Update error handling in `generateResponse`:

```javascript
} catch (error) {
  console.error('Chat API Error:', error);
  this.removeTypingIndicator();

  // Show error message
  this.showError('Не удалось подключиться к AI сервису');

  // Fallback to local
  setTimeout(() => {
    this.generateLocalResponse(userMessage);
  }, 500);
}
```

### Step 4: Add Loading State Styles (Optional)

Add to `/public/variant-2/css/ai-chat-diamond.css`:

```css
/* Error message style */
.chat-message.error .message-bubble {
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Loading state for send button */
.chat-send-btn.loading {
  pointer-events: none;
  opacity: 0.5;
}

.chat-send-btn.loading .send-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Step 5: Test the Integration

1. Start Vercel dev server:
```bash
vercel dev
```

2. Open your browser to `http://localhost:3000`

3. Click the AI chat button

4. Send a test message: "Что такое HypeAI?"

5. Check browser console for:
   - ✅ API request sent
   - ✅ Response received
   - ✅ Message displayed

### Step 6: Production Deployment

1. Ensure `GROQ_API_KEY` is set in Vercel:
```bash
vercel env add GROQ_API_KEY
# Paste your key
```

2. Deploy:
```bash
vercel --prod
```

3. Test production:
```bash
curl -X POST https://your-project.vercel.app/api/chat-groq \
  -H "Content-Type: application/json" \
  -d '{"message": "Привет!"}'
```

## Complete Updated Code

### DiamondChatController (Full Update)

```javascript
async generateResponse(userMessage) {
  try {
    // Call Groq API
    const response = await fetch('/api/chat-groq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage,
        conversationHistory: this.messages
          .slice(-5)
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.response) {
      this.addMessage(data.response, 'ai');

      // Log rate limit info
      if (data.rateLimit) {
        console.log(`Rate limit: ${data.rateLimit.remaining} remaining, resets in ${data.rateLimit.resetIn}s`);
      }
    } else {
      throw new Error('Invalid API response');
    }

  } catch (error) {
    console.error('Chat API Error:', error);

    // Show error to user
    const errorMsg = error.message.includes('429')
      ? 'Слишком много запросов. Попробуйте через минуту.'
      : 'Не удалось подключиться к AI. Используется локальный режим.';

    this.showError(errorMsg);

    // Fallback to local knowledge base after short delay
    setTimeout(() => {
      this.generateLocalResponse(userMessage);
    }, 500);
  }
}

generateLocalResponse(userMessage) {
  // Keep all existing local response logic
  const lowerMessage = userMessage.toLowerCase();
  let response = '';

  const kb = window.HYPEAI_KNOWLEDGE;
  if (!kb) {
    response = '✨ Извините, база знаний загружается. Попробуйте через несколько секунд.';
    this.addMessage(response, 'ai');
    return;
  }

  // ... rest of existing code ...
}

showError(message) {
  const errorHTML = `
    <div class="chat-message ai error">
      <div class="message-avatar">⚠️</div>
      <div class="message-bubble" style="background: rgba(255, 68, 68, 0.2); border: 1px solid rgba(255, 68, 68, 0.5);">
        ${this.escapeHTML(message)}
      </div>
    </div>
  `;

  this.messagesContainer?.insertAdjacentHTML('beforeend', errorHTML);
  this.scrollToBottom();

  // Auto-remove error after 3 seconds
  setTimeout(() => {
    const errorMsg = this.messagesContainer?.querySelector('.chat-message.error');
    errorMsg?.remove();
  }, 3000);
}
```

## Testing Checklist

- [ ] Chat opens correctly
- [ ] User message sent
- [ ] Typing indicator shows
- [ ] API request sent to `/api/chat-groq`
- [ ] Response received from Groq
- [ ] AI message displayed
- [ ] Conversation history maintained
- [ ] Error handling works (test by stopping API)
- [ ] Fallback to local knowledge base works
- [ ] Rate limiting respected
- [ ] No console errors

## Troubleshooting

### Issue: "Failed to fetch"
**Solution:** Check CORS headers in `vercel.json`, ensure API endpoint is correct

### Issue: "Rate limit exceeded"
**Solution:** Wait 1 minute, or adjust rate limits in `rate-limiter.js`

### Issue: "API key invalid"
**Solution:** Check `GROQ_API_KEY` in Vercel environment variables

### Issue: Slow responses
**Solution:**
- Reduce `maxTokens` in Groq client (500 → 300)
- Use compact system prompt
- Enable response streaming (future enhancement)

## Next Steps

1. ✅ Deploy to production
2. ✅ Monitor usage in Vercel dashboard
3. ✅ Collect user feedback
4. ⏭️ Add conversation persistence (localStorage)
5. ⏭️ Implement streaming responses
6. ⏭️ Add typing animation for AI responses
7. ⏭️ Create admin dashboard for analytics

---

**Need help?** Check `/docs/GROQ_INTEGRATION_GUIDE.md` for full setup instructions.
