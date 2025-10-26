/**
 * Simple Groq API Test
 * Tests connection and Russian language response
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

async function testGroqAPI() {
  console.log('🧪 Testing Groq API...\n');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Ты HypeAI Assistant. Отвечай кратко на русском языке. HypeAI - это AI-платформа с 27 AI агентами, работающими 24/7 для криптовалют и DeFi.'
          },
          {
            role: 'user',
            content: 'Привет! Что такое HypeAI?'
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('✅ Connection: SUCCESS');
    console.log('✅ Model: llama-3.3-70b-versatile');
    console.log('✅ Response Time:', data.usage.total_time || 'N/A', 'ms\n');
    console.log('📝 AI Response:\n');
    console.log(aiResponse);
    console.log('\n✅ Test passed! Groq API working perfectly! 🎉');

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Check API key is correct');
    console.error('2. Check internet connection');
    console.error('3. Verify Groq API status: https://status.groq.com');
    return false;
  }
}

// Run test
testGroqAPI();
