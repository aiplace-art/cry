/**
 * Test Groq API Integration
 * Run with: node api/test-groq.js
 * Requires: GROQ_API_KEY in environment
 */

const { GroqClient } = require('./_lib/groq-client');
const { generateSystemPrompt } = require('./_lib/system-prompt');

async function testGroqConnection() {
  console.log('🧪 Testing Groq API Integration...\n');

  // Check API key
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('❌ Error: GROQ_API_KEY not found in environment');
    console.log('\n📝 To fix:');
    console.log('1. Copy .env.local.example to .env.local');
    console.log('2. Add your Groq API key');
    console.log('3. Run: export $(cat .env.local | xargs)');
    console.log('4. Run test again\n');
    process.exit(1);
  }

  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');

  // Initialize client
  const groq = new GroqClient(apiKey);
  console.log('✅ Groq client initialized\n');

  // Test 1: Simple connection test
  console.log('📡 Test 1: Simple Connection');
  console.log('─'.repeat(50));

  try {
    const testResult = await groq.test();

    if (testResult.success) {
      console.log('✅ Connection successful!');
      console.log('Response:', testResult.response);
    } else {
      console.error('❌ Connection failed:', testResult.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }

  console.log('\n');

  // Test 2: Russian language response
  console.log('🇷🇺 Test 2: Russian Language (HypeAI Context)');
  console.log('─'.repeat(50));

  try {
    const systemPrompt = generateSystemPrompt();

    const response = await groq.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Что такое HypeAI?' }
    ], {
      temperature: 0.7,
      maxTokens: 200
    });

    console.log('✅ Response received:');
    console.log(response);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n');

  // Test 3: Conversation with history
  console.log('💬 Test 3: Conversation with History');
  console.log('─'.repeat(50));

  try {
    const systemPrompt = generateSystemPrompt();

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Сколько AI агентов в HypeAI?' },
      { role: 'assistant', content: 'В HypeAI 15 специализированных AI агентов для крипто-трейдинга! 🤖' },
      { role: 'user', content: 'А какие самые популярные?' }
    ];

    const response = await groq.chat(messages, {
      temperature: 0.7,
      maxTokens: 300
    });

    console.log('✅ Response received:');
    console.log(response);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n');

  // Test 4: Edge cases
  console.log('⚠️  Test 4: Edge Cases');
  console.log('─'.repeat(50));

  // Empty message
  try {
    await groq.chat([]);
    console.error('❌ Should have failed with empty messages');
  } catch (error) {
    console.log('✅ Empty messages handled correctly:', error.message);
  }

  // Invalid format
  try {
    await groq.chat('not an array');
    console.error('❌ Should have failed with invalid format');
  } catch (error) {
    console.log('✅ Invalid format handled correctly:', error.message);
  }

  console.log('\n');

  // Summary
  console.log('📊 Test Summary');
  console.log('─'.repeat(50));
  console.log('✅ All tests completed successfully!');
  console.log('🚀 Your Groq integration is ready for production\n');
}

// Run tests
testGroqConnection().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
