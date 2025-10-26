# HypeAI AI Assistant API - Frontend Integration Guide

Complete guide for integrating the AI Assistant API into the HypeAI website.

## Overview

The HypeAI AI Assistant API provides a production-ready backend powered by Claude 3.5 Sonnet with:

- **RAG (Retrieval Augmented Generation)** - Answers grounded in HypeAI knowledge base
- **Session Management** - Multi-turn conversation support
- **Rate Limiting** - DDoS protection (10 req/min per IP)
- **Multi-language** - English and Russian support
- **Analytics** - Track popular questions and usage

## API Location

**Development:** `http://localhost:3001/api/ai-assistant`
**Production:** `https://api.hypeai.io/api/ai-assistant` (configure Nginx)

## Integration Steps

### Step 1: Add AI Chat Widget to Website

Location: `/public/variant-2/index.html` or React component

### Step 2: Create Chat UI Component

```html
<!-- HTML Structure -->
<div id="ai-chat-widget" class="ai-chat-widget">
  <!-- Trigger Button -->
  <button id="ai-chat-trigger" class="ai-chat-trigger">
    <svg><!-- AI icon --></svg>
    <span>Ask AI</span>
  </button>

  <!-- Chat Panel (hidden by default) -->
  <div id="ai-chat-panel" class="ai-chat-panel hidden">
    <!-- Header -->
    <div class="chat-header">
      <h3>HypeAI Assistant</h3>
      <button id="close-chat">×</button>
    </div>

    <!-- Messages Container -->
    <div id="chat-messages" class="chat-messages">
      <div class="message bot">
        <div class="avatar">🤖</div>
        <div class="content">
          Hi! I'm the HypeAI Assistant. Ask me anything about our platform!
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="chat-input-area">
      <input
        type="text"
        id="chat-input"
        placeholder="Ask a question..."
        maxlength="2000"
      />
      <button id="send-message" disabled>Send</button>
    </div>

    <!-- Footer -->
    <div class="chat-footer">
      <small>Powered by Claude 3.5 Sonnet</small>
    </div>
  </div>
</div>
```

### Step 3: Add JavaScript Logic

```javascript
// AI Chat Widget Logic
class HypeAIChatWidget {
  constructor() {
    this.apiBase = 'http://localhost:3001/api/ai-assistant';
    this.sessionId = null;
    this.language = document.documentElement.lang || 'en';

    this.init();
  }

  init() {
    // Get DOM elements
    this.trigger = document.getElementById('ai-chat-trigger');
    this.panel = document.getElementById('ai-chat-panel');
    this.closeBtn = document.getElementById('close-chat');
    this.input = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('send-message');
    this.messagesContainer = document.getElementById('chat-messages');

    // Event listeners
    this.trigger.addEventListener('click', () => this.openChat());
    this.closeBtn.addEventListener('click', () => this.closeChat());
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    this.input.addEventListener('input', () => {
      this.sendBtn.disabled = !this.input.value.trim();
    });
  }

  openChat() {
    this.panel.classList.remove('hidden');
    this.input.focus();
  }

  closeChat() {
    this.panel.classList.add('hidden');
  }

  async sendMessage() {
    const message = this.input.value.trim();
    if (!message) return;

    // Disable input while processing
    this.input.disabled = true;
    this.sendBtn.disabled = true;

    // Add user message to UI
    this.addMessage('user', message);

    // Clear input
    this.input.value = '';

    // Show typing indicator
    const typingId = this.showTyping();

    try {
      // Call API
      const response = await fetch(`${this.apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: this.sessionId,
          language: this.language
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Save session ID
        this.sessionId = data.sessionId;

        // Remove typing indicator
        this.removeTyping(typingId);

        // Add bot response
        this.addMessage('bot', data.reply);

      } else {
        throw new Error(data.error || 'Failed to get response');
      }

    } catch (error) {
      console.error('Chat error:', error);
      this.removeTyping(typingId);
      this.addMessage('bot', 'Sorry, I encountered an error. Please try again.');
    } finally {
      // Re-enable input
      this.input.disabled = false;
      this.input.focus();
    }
  }

  addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'bot' ? '🤖' : '👤';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    this.messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  showTyping() {
    const id = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = id;
    typingDiv.className = 'message bot typing';
    typingDiv.innerHTML = `
      <div class="avatar">🤖</div>
      <div class="content">
        <span class="typing-dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </div>
    `;
    this.messagesContainer.appendChild(typingDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    return id;
  }

  removeTyping(id) {
    const typingDiv = document.getElementById(id);
    if (typingDiv) typingDiv.remove();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new HypeAIChatWidget();
});
```

### Step 4: Add CSS Styling

```css
/* AI Chat Widget Styles */
.ai-chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

/* Trigger Button */
.ai-chat-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #9333ea, #3b82f6);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
  transition: all 0.3s ease;
}

.ai-chat-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(147, 51, 234, 0.6);
}

.ai-chat-trigger svg {
  width: 20px;
  height: 20px;
}

/* Chat Panel */
.ai-chat-panel {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 400px;
  max-width: calc(100vw - 40px);
  height: 600px;
  max-height: calc(100vh - 120px);
  background: rgba(10, 1, 24, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(147, 51, 234, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.ai-chat-panel.hidden {
  display: none;
}

/* Chat Header */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #9333ea, #3b82f6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-header h3 {
  margin: 0;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.chat-header button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.chat-header button:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Messages Container */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(147, 51, 234, 0.5);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(147, 51, 234, 0.7);
}

/* Message Styles */
.message {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s ease;
}

.message.user {
  flex-direction: row-reverse;
}

.message .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message.bot .avatar {
  background: linear-gradient(135deg, #9333ea, #3b82f6);
}

.message.user .avatar {
  background: rgba(255, 255, 255, 0.1);
}

.message .content {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  font-size: 14px;
}

.message.bot .content {
  background: rgba(147, 51, 234, 0.2);
  border: 1px solid rgba(147, 51, 234, 0.3);
  color: #e0e0e0;
}

.message.user .content {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #e0e0e0;
}

/* Typing Indicator */
.typing-dots {
  display: inline-flex;
  gap: 4px;
}

.typing-dots span {
  animation: typing 1.4s infinite;
  opacity: 0;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { opacity: 0; }
  30% { opacity: 1; }
}

/* Input Area */
.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-input-area input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
}

.chat-input-area input:focus {
  outline: none;
  border-color: rgba(147, 51, 234, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.chat-input-area button {
  padding: 12px 20px;
  background: linear-gradient(135deg, #9333ea, #3b82f6);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-input-area button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
}

/* Chat Footer */
.chat-footer {
  padding: 8px 20px;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .ai-chat-panel {
    bottom: 0;
    right: 0;
    width: 100%;
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .ai-chat-trigger {
    bottom: 16px;
    right: 16px;
    padding: 10px 20px;
    font-size: 14px;
  }
}
```

## React Integration

For React-based websites:

```jsx
// AIAssistant.jsx
import { useState, useEffect, useRef } from 'react';
import './AIAssistant.css';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "Hi! I'm the HypeAI Assistant. Ask me anything about our platform!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const API_BASE = process.env.REACT_APP_AI_API_URL || 'http://localhost:3001/api/ai-assistant';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          language: document.documentElement.lang || 'en'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSessionId(data.sessionId);
        setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      <button
        className="ai-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        🤖 Ask AI
      </button>

      {isOpen && (
        <div className="ai-panel">
          <div className="ai-header">
            <h3>HypeAI Assistant</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="ai-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="avatar">{msg.role === 'bot' ? '🤖' : '👤'}</div>
                <div className="content">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="avatar">🤖</div>
                <div className="content typing">...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              disabled={loading}
              maxLength={2000}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              Send
            </button>
          </div>

          <div className="ai-footer">
            <small>Powered by Claude 3.5 Sonnet</small>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Environment Configuration

Add to frontend `.env`:

```env
# Development
REACT_APP_AI_API_URL=http://localhost:3001/api/ai-assistant

# Production
REACT_APP_AI_API_URL=https://api.hypeai.io/api/ai-assistant
```

## Error Handling

```javascript
async function callAI(message) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language: 'en' })
    });

    if (!response.ok) {
      const error = await response.json();

      // Handle specific errors
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a minute.');
      }
      if (response.status === 400) {
        throw new Error('Invalid message format.');
      }

      throw new Error(error.error || 'API error');
    }

    return await response.json();

  } catch (error) {
    console.error('AI API Error:', error);

    // Show user-friendly message
    return {
      error: true,
      message: 'Sorry, I\'m having trouble connecting. Please try again.'
    };
  }
}
```

## Analytics Integration

Track AI usage:

```javascript
// Send feedback
async function sendFeedback(sessionId, helpful) {
  await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, helpful })
  });
}

// Add thumbs up/down buttons after bot messages
function addFeedbackButtons(messageDiv, sessionId) {
  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'feedback-buttons';
  feedbackDiv.innerHTML = `
    <button onclick="sendFeedback('${sessionId}', true)">👍</button>
    <button onclick="sendFeedback('${sessionId}', false)">👎</button>
  `;
  messageDiv.appendChild(feedbackDiv);
}
```

## Deployment Checklist

### Frontend Changes

- [ ] Add AI chat widget HTML
- [ ] Add JavaScript logic
- [ ] Add CSS styling
- [ ] Configure API URL in environment
- [ ] Test in development
- [ ] Test on mobile devices

### Backend Deployment

- [ ] Deploy API server to production
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL certificate
- [ ] Configure CORS for production domain
- [ ] Set rate limits appropriately
- [ ] Monitor API costs

### Testing

- [ ] Test all endpoints
- [ ] Verify session continuity
- [ ] Test rate limiting
- [ ] Test error handling
- [ ] Test on multiple browsers
- [ ] Test mobile responsiveness

## Security Best Practices

1. **Never expose API keys in frontend code**
2. **Always use environment variables**
3. **Validate user input on frontend**
4. **Implement rate limiting on frontend too**
5. **Use HTTPS in production**
6. **Sanitize user input before display**
7. **Monitor API usage and costs**

## Performance Optimization

```javascript
// Debounce typing indicator
let typingTimeout;
input.addEventListener('input', () => {
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    // Show typing indicator in chat
  }, 500);
});

// Cache frequently asked questions
const faqCache = new Map();

async function askAI(question) {
  if (faqCache.has(question)) {
    return faqCache.get(question);
  }

  const response = await fetch(...);
  const data = await response.json();

  faqCache.set(question, data);
  return data;
}
```

## Troubleshooting

### CORS Errors

Add frontend domain to API `.env`:
```env
CORS_ORIGIN=https://hypeai.io,https://www.hypeai.io
```

### Rate Limit Hit

Show friendly message:
```javascript
if (response.status === 429) {
  showMessage('Too many questions! Please wait a minute.');
}
```

### Slow Responses

Add loading indicator:
```javascript
<div class="typing-indicator">
  AI is thinking<span class="dots">...</span>
</div>
```

## Support

- **API Documentation:** `/server/README_API.md`
- **Quick Start:** `/server/QUICKSTART.md`
- **Knowledge Base:** `/docs/PROJECT_KNOWLEDGE_BASE.md`

---

**Integration Time:** ~2 hours
**Difficulty:** Intermediate
**Dependencies:** None (vanilla JS works!)
