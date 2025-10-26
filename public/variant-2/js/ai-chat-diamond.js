/**
 * Diamond Refraction AI Chat Controller
 * Premium chat interface with beautiful animations
 */

class DiamondChatController {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.chatWindow = null;
    this.messagesContainer = null;
    this.inputField = null;
    this.sendButton = null;
    this.fabButton = null;

    this.init();
  }

  init() {
    this.createChatWindow();
    this.attachEventListeners();
    this.loadDemoMessages();
  }

  createChatWindow() {
    // Create ripple rings container
    const rippleHTML = `
      <div class="chat-ripple-container" id="chatRipple">
        <div class="chat-ripple-ring"></div>
        <div class="chat-ripple-ring"></div>
        <div class="chat-ripple-ring"></div>
      </div>
    `;

    // Create chat window HTML
    const chatHTML = `
      <div class="ai-chat-window" id="diamondChat">
        <div class="chat-header-accent"></div>
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">
              <video class="avatar-cosmic-video" autoplay loop muted playsinline>
                <source src="assets/ai-assistant/animations/button-cosmic-ultra.mp4" type="video/mp4">
              </video>
              <span class="avatar-ai-text">AI</span>
            </div>
            <div class="chat-title-section">
              <h3 class="chat-title">HypeAI Assistant</h3>
              <div class="chat-status">
                <span class="status-dot"></span>
                <span>Online</span>
              </div>
            </div>
          </div>
          <div class="chat-controls">
            <button class="chat-control-btn" id="minimizeChat" title="Minimize">—</button>
            <button class="chat-control-btn" id="closeChat" title="Close">×</button>
          </div>
        </div>
        <div class="chat-messages" id="chatMessages">
          <div class="chat-empty-state">
            <div class="diamond-icon">
              <video class="diamond-cosmic-video" autoplay loop muted playsinline>
                <source src="assets/ai-assistant/animations/button-cosmic-ultra.mp4" type="video/mp4">
              </video>
              <span class="diamond-ai-text">AI</span>
            </div>
            <h3>Добро пожаловать в HypeAI!</h3>
            <p>Спросите о наших AI агентах, сервисах или технологиях</p>
          </div>
        </div>
        <div class="chat-input-container">
          <div class="chat-input-wrapper">
            <input
              type="text"
              class="chat-input"
              id="chatInput"
              placeholder="Спросите о HypeAI..."
              autocomplete="off"
            />
            <button class="chat-send-btn" id="sendMessage" title="Send" aria-label="Send message">
              <svg class="send-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', rippleHTML);
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // Store references
    this.chatWindow = document.getElementById('diamondChat');
    this.rippleContainer = document.getElementById('chatRipple');
    this.messagesContainer = document.getElementById('chatMessages');
    this.inputField = document.getElementById('chatInput');
    this.sendButton = document.getElementById('sendMessage');
    this.fabButton = document.querySelector('.ai-fab-button');
  }

  attachEventListeners() {
    // Close button
    document.getElementById('closeChat')?.addEventListener('click', () => {
      this.close();
    });

    // Minimize button
    document.getElementById('minimizeChat')?.addEventListener('click', () => {
      this.close();
    });

    // Send button
    this.sendButton?.addEventListener('click', () => {
      this.handleSend();
    });

    // Enter key
    this.inputField?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSend();
      }
    });

    // FAB button click to open chat
    if (this.fabButton) {
      this.fabButton.addEventListener('click', () => {
        if (!this.isOpen) {
          this.open();
        }
      });
    }
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;

    // Activate ripple rings
    this.rippleContainer?.classList.add('active');

    // Open chat with slight delay for ripple effect
    setTimeout(() => {
      this.chatWindow?.classList.add('open');
    }, 100);

    // Hide FAB button
    if (this.fabButton) {
      this.fabButton.style.transform = 'scale(0)';
      this.fabButton.style.opacity = '0';
    }

    // Focus input after animation
    setTimeout(() => {
      this.inputField?.focus();
    }, 400);

    // Remove ripple after animation completes
    setTimeout(() => {
      this.rippleContainer?.classList.remove('active');
    }, 1800);

    // Track event
    this.trackEvent('chat_opened');
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.chatWindow?.classList.remove('open');

    // Show FAB button
    setTimeout(() => {
      if (this.fabButton) {
        this.fabButton.style.transform = 'scale(1)';
        this.fabButton.style.opacity = '1';
      }
    }, 150);

    // Track event
    this.trackEvent('chat_closed');
  }

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

  addMessage(text, sender = 'ai') {
    // Remove empty state if exists
    const emptyState = this.messagesContainer?.querySelector('.chat-empty-state');
    if (emptyState) {
      emptyState.remove();
    }

    const messageHTML = `
      <div class="chat-message ${sender}">
        <div class="message-avatar">
          ${sender === 'ai' ? `
            <video class="message-cosmic-video" autoplay loop muted playsinline>
              <source src="assets/ai-assistant/animations/button-cosmic-ultra.mp4" type="video/mp4">
            </video>
            <span class="message-ai-text">AI</span>
          ` : '👤'}
        </div>
        <div class="message-bubble">${this.escapeHTML(text)}</div>
      </div>
    `;

    this.messagesContainer?.insertAdjacentHTML('beforeend', messageHTML);
    this.scrollToBottom();

    // Store message
    this.messages.push({ text, sender, timestamp: Date.now() });
  }

  showTypingIndicator() {
    const typingHTML = `
      <div class="typing-indicator" id="typingIndicator">
        <div class="typing-avatar">
          <video class="typing-cosmic-video" autoplay loop muted playsinline>
            <source src="assets/ai-assistant/animations/button-cosmic-ultra.mp4" type="video/mp4">
          </video>
          <span class="typing-ai-text">AI</span>
        </div>
        <div class="typing-dots">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;

    this.messagesContainer?.insertAdjacentHTML('beforeend', typingHTML);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    indicator?.remove();
  }

  generateResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Simple keyword-based responses (placeholder for backend)
    let response = '';

    if (lowerMessage.includes('что') && lowerMessage.includes('hypeai')) {
      response = '✨ HypeAI - это платформа искусственного интеллекта с передовыми AI агентами. Мы предлагаем решения для автоматизации, анализа данных и intelligent workflows.';
    } else if (lowerMessage.includes('сервис') || lowerMessage.includes('услуг')) {
      response = '✨ Наши ключевые сервисы:\n• AI Агенты для автоматизации\n• Анализ данных и предиктивная аналитика\n• Custom ML модели\n• Интеграция с blockchain\n\nЧто вас интересует больше всего?';
    } else if (lowerMessage.includes('агент') || lowerMessage.includes('agent')) {
      response = '🤖 Наши AI агенты могут:\n• Автоматизировать бизнес-процессы\n• Обрабатывать данные в реальном времени\n• Обучаться на ваших данных\n• Интегрироваться с любыми системами\n\nХотите узнать больше о конкретном типе агентов?';
    } else if (lowerMessage.includes('цен') || lowerMessage.includes('стоимость') || lowerMessage.includes('price')) {
      response = '💰 У нас гибкая ценовая политика:\n• Бесплатный тестовый период\n• Pay-as-you-go модель\n• Enterprise планы\n\nСвяжитесь с нами для индивидуального предложения!';
    } else if (lowerMessage.includes('привет') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = '👋 Привет! Я Assistant от HypeAI. Чем могу помочь?';
    } else if (lowerMessage.includes('спасибо') || lowerMessage.includes('thanks')) {
      response = '✨ Всегда рад помочь! Если есть еще вопросы - спрашивайте!';
    } else {
      response = '✨ Отличный вопрос! Я могу рассказать вам о:\n• Наших AI сервисах и технологиях\n• Возможностях автоматизации\n• Интеграции с blockchain\n• Ценах и планах\n\nЧто вас интересует?';
    }

    this.addMessage(response, 'ai');
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  loadDemoMessages() {
    // Optionally add welcome message
    // Uncomment to show demo messages on first open
    /*
    setTimeout(() => {
      if (this.messages.length === 0) {
        this.addMessage('Добро пожаловать! Я Diamond Assistant. Чем могу помочь?', 'ai');
      }
    }, 500);
    */
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  trackEvent(eventName, data = {}) {
    // Track events for analytics (placeholder)
    console.log('Chat Event:', eventName, data);

    // You can integrate with Google Analytics or other tracking
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'diamond_chat',
        ...data
      });
    }
  }
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for FAB button to be ready
  setTimeout(() => {
    window.diamondChat = new DiamondChatController();
    console.log('💎 Diamond Chat initialized');
  }, 500);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiamondChatController;
}
