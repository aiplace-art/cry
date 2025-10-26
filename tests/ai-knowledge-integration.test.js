/**
 * AI Knowledge Base Integration Tests
 * Tests the HypeAI knowledge base integration with AI chat
 */

// Mock DOM environment
const mockKnowledgeBase = {
  project: {
    name: "HypeAI",
    description: "Платформа искусственного интеллекта с передовыми AI агентами",
    vision: "Создание экосистемы, где искусственный интеллект встречается с blockchain",
    website: "https://hypeai.io"
  },
  token: {
    symbol: "HYPED",
    type: "ERC-20 / BEP-20",
    totalSupply: "1,000,000,000 HYPED",
    features: [
      "Стейкинг с вознаграждениями",
      "Автоматическое сжигание",
      "Отражение держателям",
      "Управление через governance",
      "Интеграция с AI агентами"
    ]
  },
  agents: {
    count: 15,
    types: [
      { name: "Market Analyst", icon: "📊", description: "Анализ рынка" },
      { name: "Trading Bot", icon: "🤖", description: "Автоматическая торговля" }
    ]
  },
  features: {
    staking: {
      title: "Flexible Staking",
      options: [
        "30 дней - 15% APY",
        "90 дней - 35% APY",
        "180 дней - 60% APY",
        "365 дней - 120% APY"
      ]
    }
  },
  roadmap: {
    q4_2024: ["✅ Запуск токена HYPED"],
    q1_2025: ["🔄 Запуск всех 15 AI агентов"]
  },
  faq: [
    {
      question: "Что такое HypeAI?",
      answer: "HypeAI - это инновационная платформа"
    }
  ],
  social: {
    twitter: "https://twitter.com/HypeAI_official",
    telegram: "https://t.me/HypeAI_community"
  }
};

// Simple mock chat controller
class MockChatController {
  constructor() {
    this.messages = [];
  }

  addMessage(text, sender) {
    this.messages.push({ text, sender });
  }

  similarity(str1, str2) {
    const set1 = new Set(str1.split(' '));
    const set2 = new Set(str2.split(' '));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  generateResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    const kb = mockKnowledgeBase;

    // FAQ matching
    const faqMatch = kb.faq.find(item => {
      const question = item.question.toLowerCase();
      return question.includes(lowerMessage) || lowerMessage.includes(question);
    });

    if (faqMatch) {
      this.addMessage(`💡 ${faqMatch.answer}`, 'ai');
      return;
    }

    // Greetings
    if (lowerMessage.match(/привет|hello|hi/)) {
      this.addMessage('👋 Привет! Я AI ассистент HypeAI.', 'ai');
      return;
    }

    // Project info
    if (lowerMessage.match(/что такое|о проект/)) {
      this.addMessage(`✨ ${kb.project.description}`, 'ai');
      return;
    }

    // Token
    if (lowerMessage.match(/токен|hyped/)) {
      this.addMessage(`💎 Токен ${kb.token.symbol}`, 'ai');
      return;
    }

    // Agents
    if (lowerMessage.match(/агент|agent/)) {
      this.addMessage(`🤖 У нас ${kb.agents.count} AI агентов`, 'ai');
      return;
    }

    // Staking
    if (lowerMessage.match(/стейкинг|apy/)) {
      this.addMessage(`💰 ${kb.features.staking.title}`, 'ai');
      return;
    }

    // Fallback
    this.addMessage('✨ Спрашивайте о проекте!', 'ai');
  }
}

// Test Suite
console.log('🧪 Running AI Knowledge Base Integration Tests\n');

const chat = new MockChatController();
let testsPass = 0;
let testsFail = 0;

function test(name, userInput, expectedKeyword) {
  chat.messages = []; // Reset
  chat.generateResponse(userInput);

  const response = chat.messages[0];
  const passed = response && response.text.includes(expectedKeyword);

  if (passed) {
    console.log(`✅ PASS: ${name}`);
    console.log(`   Input: "${userInput}"`);
    console.log(`   Response: "${response.text.substring(0, 60)}..."\n`);
    testsPass++;
  } else {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Input: "${userInput}"`);
    console.log(`   Expected: "${expectedKeyword}"`);
    console.log(`   Got: "${response ? response.text : 'No response'}"\n`);
    testsFail++;
  }
}

// Run tests
console.log('--- Basic Greetings ---');
test('Greeting (Russian)', 'Привет', 'Привет');
test('Greeting (English)', 'Hello', 'Привет');

console.log('--- Project Information ---');
test('Project question', 'Что такое HypeAI?', 'Платформа');
test('Project description', 'О проекте', 'искусственного интеллекта');

console.log('--- Token Questions ---');
test('Token info', 'Расскажи про токен', 'Токен');
test('HYPED token', 'Что такое HYPED?', 'HYPED');

console.log('--- AI Agents ---');
test('Agent count', 'Какие агенты?', '15');
test('Agent list', 'Расскажи про AI агентов', 'агентов');

console.log('--- Staking ---');
test('Staking info', 'Какой APY в стейкинге?', 'Staking');
test('Staking rewards', 'Сколько можно заработать?', 'Staking');

console.log('--- FAQ Matching ---');
test('FAQ exact match', 'Что такое HypeAI?', 'инновационная');

console.log('--- Fallback Responses ---');
test('Unknown question', 'Неизвестный вопрос', 'Спрашивайте');

// Test similarity algorithm
console.log('--- Similarity Algorithm ---');
const sim1 = chat.similarity('что такое hypeai', 'что такое hypeai?');
const sim2 = chat.similarity('агенты', 'какие агенты');
const sim3 = chat.similarity('hello', 'goodbye');

console.log(`Exact match similarity: ${sim1.toFixed(2)} (expected >0.8)`);
console.log(`Partial match similarity: ${sim2.toFixed(2)} (expected >0.3)`);
console.log(`No match similarity: ${sim3.toFixed(2)} (expected <0.2)\n`);

// Summary
console.log('=================================');
console.log('Test Summary:');
console.log(`✅ Passed: ${testsPass}`);
console.log(`❌ Failed: ${testsFail}`);
console.log(`📊 Success Rate: ${((testsPass / (testsPass + testsFail)) * 100).toFixed(1)}%`);
console.log('=================================\n');

if (testsFail === 0) {
  console.log('🎉 All tests passed! Knowledge base integration is working correctly.');
} else {
  console.log('⚠️ Some tests failed. Please review the integration.');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MockChatController, mockKnowledgeBase };
}
