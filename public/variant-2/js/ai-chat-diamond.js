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
    let response = '';

    // Check if knowledge base is available
    const kb = window.HYPEAI_KNOWLEDGE;
    if (!kb) {
      response = '✨ Извините, база знаний загружается. Попробуйте через несколько секунд.';
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 1: Check FAQ for exact matches first
    const faqMatch = kb.faq.find(item => {
      const question = item.question.toLowerCase();
      const answer = item.answer.toLowerCase();
      return question.includes(lowerMessage) ||
             lowerMessage.includes(question) ||
             (lowerMessage.length > 10 && this.similarity(lowerMessage, question) > 0.7);
    });

    if (faqMatch) {
      response = `💡 ${faqMatch.answer}`;
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 2: Greetings and basic interactions
    if (lowerMessage.match(/привет|hello|hi|добр/)) {
      const greetings = [
        '👋 Привет! Я AI ассистент HypeAI. Спрашивайте о наших AI агентах, токене HYPED или платформе!',
        '✨ Здравствуйте! Готов ответить на вопросы о HypeAI. Что вас интересует?',
        '🤖 Приветствую! Я здесь, чтобы рассказать о нашей AI-платформе. Чем могу помочь?'
      ];
      response = greetings[Math.floor(Math.random() * greetings.length)];
      this.addMessage(response, 'ai');
      return;
    }

    if (lowerMessage.match(/спасибо|thanks|благодар/)) {
      const thanks = [
        '✨ Всегда рад помочь! Есть еще вопросы?',
        '💎 Пожалуйста! Буду рад ответить на другие вопросы.',
        '🤖 Обращайтесь! Я всегда на связи.'
      ];
      response = thanks[Math.floor(Math.random() * thanks.length)];
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 3: Project information
    if (lowerMessage.match(/что такое|о проект|описание|hypeai это/)) {
      response = `✨ ${kb.project.description}\n\n${kb.project.vision}\n\n🌐 Веб-сайт: ${kb.project.website}`;
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 4: Token questions
    if (lowerMessage.match(/токен|hyped|купить|цена|стоимость/)) {
      if (lowerMessage.match(/купить|как приобрести|где купить/)) {
        response = `💰 Токены HYPED можно купить на:\n• PancakeSwap\n• UniSwap\n• Другие DEX\n\n📅 Листинг на CEX запланирован на Q1 2025\n\nℹ️ Токен: ${kb.token.symbol} (${kb.token.type})`;
      } else if (lowerMessage.match(/распределение|токеномика/)) {
        response = `📊 Распределение токенов HYPED:\n\n`;
        for (const [key, value] of Object.entries(kb.token.distribution)) {
          response += `• ${value}\n`;
        }
      } else {
        response = `💎 Токен HYPED:\n\n`;
        response += `• Символ: ${kb.token.symbol}\n`;
        response += `• Тип: ${kb.token.type}\n`;
        response += `• Общее предложение: ${kb.token.totalSupply}\n\n`;
        response += `✨ Особенности:\n`;
        kb.token.features.slice(0, 5).forEach(f => response += `• ${f}\n`);
      }
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 5: AI Agents
    if (lowerMessage.match(/агент|agent|бот|ai/)) {
      if (lowerMessage.match(/какие|список|все агенты/)) {
        response = `🤖 У нас ${kb.agents.count} специализированных AI агентов:\n\n`;
        kb.agents.types.slice(0, 8).forEach(agent => {
          response += `${agent.icon} ${agent.name}\n   ${agent.description}\n\n`;
        });
        response += `\n...и еще ${kb.agents.count - 8} агентов!`;
      } else if (lowerMessage.match(/возможности|что умеют|функции/)) {
        response = `⚡ Возможности наших AI агентов:\n\n`;
        kb.agents.capabilities.forEach(cap => response += `• ${cap}\n`);
      } else {
        response = `🤖 ${kb.agents.description}\n\n`;
        response += `Топ-5 популярных агентов:\n\n`;
        kb.agents.types.slice(0, 5).forEach(agent => {
          response += `${agent.icon} ${agent.name} - ${agent.description}\n`;
        });
        response += `\nХотите узнать о конкретном агенте?`;
      }
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 6: Staking
    if (lowerMessage.match(/стейкинг|stake|apy|доход|проценты/)) {
      response = `💰 Гибкий стейкинг HYPED:\n\n`;
      kb.features.staking.options.forEach(option => {
        response += `• ${option}\n`;
      });
      response += `\n✨ Награды начисляются в токенах HYPED`;
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 7: Roadmap
    if (lowerMessage.match(/роадмап|roadmap|план|когда|запуск|дата/)) {
      response = `🗓️ Дорожная карта HypeAI:\n\n`;
      response += `Q4 2024:\n${kb.roadmap.q4_2024.join('\n')}\n\n`;
      response += `Q1 2025:\n${kb.roadmap.q1_2025.join('\n')}\n\n`;
      response += `Q2 2025:\n${kb.roadmap.q2_2025.join('\n')}\n\n`;
      response += `Q3 2025:\n${kb.roadmap.q3_2025.join('\n')}`;
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 8: Features
    if (lowerMessage.match(/функции|возможности|сервис|что делает/)) {
      response = `✨ Ключевые функции платформы:\n\n`;
      response += `📊 ${kb.features.aiPowered.title}\n${kb.features.aiPowered.description}\n\n`;
      response += `💎 ${kb.features.staking.title}\n${kb.features.staking.description}\n\n`;
      response += `🏛️ ${kb.features.governance.title}\n${kb.features.governance.description}\n\n`;
      response += `🌐 ${kb.features.defi.title}\n${kb.features.defi.description}`;
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 9: Technology
    if (lowerMessage.match(/технолог|tech|blockchain|безопасность|security/)) {
      if (lowerMessage.match(/безопасность|security|аудит/)) {
        response = `🛡️ Безопасность HypeAI:\n\n`;
        kb.technology.security.forEach(item => response += `• ${item}\n`);
      } else {
        response = `⚙️ Технологии HypeAI:\n\n`;
        response += `🔗 Blockchain: ${kb.technology.blockchain.join(', ')}\n`;
        response += `📝 Smart Contracts: ${kb.technology.smartContracts}\n`;
        response += `🤖 AI: ${kb.technology.ai}\n`;
        response += `☁️ Infrastructure: ${kb.technology.infrastructure}`;
      }
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 10: Team
    if (lowerMessage.match(/команда|team|кто создал/)) {
      response = `👥 Команда HypeAI:\n\n`;
      response += `• ${kb.team.size}\n\n`;
      response += `💼 Экспертиза:\n`;
      kb.team.expertise.forEach(exp => response += `• ${exp}\n`);
      response += `\n🎓 ${kb.team.advisors}`;
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 11: Social and contacts
    if (lowerMessage.match(/контакт|связь|telegram|twitter|discord|соц/)) {
      response = `📱 Наши социальные сети:\n\n`;
      response += `🐦 Twitter: ${kb.social.twitter}\n`;
      response += `💬 Telegram: ${kb.social.telegram}\n`;
      response += `🎮 Discord: ${kb.social.discord}\n`;
      response += `📝 Medium: ${kb.social.medium}\n`;
      response += `💻 GitHub: ${kb.social.github}\n\n`;
      response += `📧 Email: ${kb.social.email}`;
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 12: Pricing/Tiers
    if (lowerMessage.match(/тариф|план|цена|стоимость|требования/)) {
      response = `💎 Уровни доступа (${kb.pricing.model}):\n\n`;
      kb.pricing.tiers.forEach(tier => {
        response += `${tier.name} - ${tier.requirement}\n`;
        tier.features.forEach(f => response += `  • ${f}\n`);
        response += `\n`;
      });
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 13: Stats
    if (lowerMessage.match(/статистика|stats|цифры|данные|tvl/)) {
      response = `📊 Статистика HypeAI:\n\n`;
      response += `👥 Держателей: ${kb.stats.holders}\n`;
      response += `💸 Транзакций: ${kb.stats.transactions}\n`;
      response += `💰 TVL: ${kb.stats.tvl}\n`;
      response += `🤖 AI операций: ${kb.stats.aiOperations}`;
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 14: Governance/DAO
    if (lowerMessage.match(/governance|dao|голосование|управление/)) {
      response = `🏛️ ${kb.features.governance.title}\n\n`;
      response += `${kb.features.governance.description}\n\n`;
      kb.features.governance.features.forEach(f => response += `• ${f}\n`);
      this.addMessage(response, 'ai');
      return;
    }

    // Priority 15: DeFi
    if (lowerMessage.match(/defi|ликвидность|farming|lending|pool/)) {
      response = `🌐 ${kb.features.defi.title}\n\n`;
      response += `${kb.features.defi.description}\n\n`;
      kb.features.defi.capabilities.forEach(cap => response += `• ${cap}\n`);
      this.addMessage(response, 'ai');
      return;
    }

    // Fallback responses with helpful suggestions
    const fallbacks = [
      '✨ Интересный вопрос! Я могу рассказать о:\n• Наших 15 AI агентах 🤖\n• Токене HYPED 💎\n• Стейкинге с APY до 120% 💰\n• Roadmap и планах 🗓️\n• Технологиях и безопасности 🛡️\n\nЧто вас интересует больше всего?',

      '💡 Попробуйте спросить:\n• "Что такое HypeAI?"\n• "Какие есть AI агенты?"\n• "Как купить токен HYPED?"\n• "Какие APY в стейкинге?"\n• "Когда запуск платформы?"\n\nИли задайте свой вопрос!',

      '🤖 Я AI ассистент HypeAI и могу помочь с:\n• Информацией о проекте\n• Токеномикой HYPED\n• Функциями платформы\n• Roadmap и датами\n• Контактами и соц сетями\n\nПросто спросите!',

      '✨ Не совсем понял вопрос. Вот что я знаю:\n• 15 AI агентов для крипто-трейдинга\n• Стейкинг с высокими APY\n• DAO управление\n• DeFi интеграция\n• Безопасность на уровне CertiK\n\nУточните, что вас интересует?'
    ];

    response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    this.addMessage(response, 'ai');
  }

  // Helper: Simple text similarity (Jaccard similarity)
  similarity(str1, str2) {
    const set1 = new Set(str1.split(' '));
    const set2 = new Set(str2.split(' '));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
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
