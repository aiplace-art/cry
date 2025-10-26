# Groq API Troubleshooting Guide

## 🔧 Common Issues and Solutions

### Table of Contents
1. [Authentication Errors](#authentication-errors)
2. [Rate Limit Errors](#rate-limit-errors)
3. [Model Errors](#model-errors)
4. [Network Errors](#network-errors)
5. [Response Quality Issues](#response-quality-issues)
6. [Performance Issues](#performance-issues)
7. [Integration Issues](#integration-issues)

---

## Authentication Errors

### Error: "Invalid API Key" (401)

**Symptoms:**
```json
{
  "error": {
    "message": "Incorrect API key provided",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

**Possible Causes:**
1. API key not set in environment
2. Wrong API key format
3. Key was revoked
4. Typo in key

**Solutions:**

✅ **Solution 1: Verify Environment Variable**
```bash
# Check if key is set
echo $GROQ_API_KEY

# Should output: gsk_xxxxx...
# If empty, set it:
export GROQ_API_KEY=gsk_your_key_here

# For permanent setup, add to .env.local
echo "GROQ_API_KEY=gsk_your_key_here" >> .env.local
```

✅ **Solution 2: Verify Key Format**
```javascript
const apiKey = process.env.GROQ_API_KEY;

// Valid format check
if (!apiKey || !apiKey.startsWith('gsk_')) {
  console.error('❌ Invalid Groq API key format');
  console.log('Expected: gsk_xxxxx...');
  console.log('Got:', apiKey?.substring(0, 10) + '...');
}
```

✅ **Solution 3: Generate New Key**
1. Go to https://console.groq.com
2. Navigate to "API Keys"
3. Delete old key
4. Create new key
5. Copy immediately
6. Update `.env.local`

✅ **Solution 4: Check .env.local Loading**
```javascript
// At top of your file
require('dotenv').config({ path: '.env.local' });

// Verify it loaded
console.log('API Key loaded:', !!process.env.GROQ_API_KEY);
```

---

### Error: "Unauthorized" (403)

**Symptoms:**
```json
{
  "error": {
    "message": "You are not authorized to access this resource",
    "type": "permission_error"
  }
}
```

**Possible Causes:**
1. IP address blocked
2. Account suspended
3. Free tier expired
4. Geographic restriction

**Solutions:**

✅ **Check Account Status**
1. Log into https://console.groq.com
2. Check for account warnings
3. Verify billing status (if using paid tier)
4. Check for suspension notices

✅ **Verify IP Address**
```bash
# Check your current IP
curl https://api.ipify.org

# If using IP whitelist, add this IP in Groq console
```

✅ **Contact Groq Support**
If issue persists:
- Email: support@groq.com
- Include: Account ID, error message, timestamp

---

## Rate Limit Errors

### Error: "Rate limit exceeded" (429)

**Symptoms:**
```json
{
  "error": {
    "message": "Rate limit exceeded. Please try again later.",
    "type": "rate_limit_error",
    "code": "rate_limit_exceeded"
  }
}
```

**Understanding Rate Limits:**
- **30 requests/minute** (RPM)
- **7,000 tokens/minute** (TPM)
- **~200,000 tokens/day** (daily quota)

**Solutions:**

✅ **Solution 1: Implement Exponential Backoff**
```javascript
async function makeRequestWithRetry(requestFn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.status === 429) {
        // Calculate wait time: 2^i * 1000ms (1s, 2s, 4s, ...)
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const response = await makeRequestWithRetry(async () => {
  return await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({...})
  });
});
```

✅ **Solution 2: Add Request Queue**
```javascript
class RequestQueue {
  constructor(maxRequestsPerMinute = 25) {
    this.queue = [];
    this.processing = false;
    this.maxRPM = maxRequestsPerMinute;
    this.requestTimes = [];
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      // Clean old request times (older than 1 minute)
      const now = Date.now();
      this.requestTimes = this.requestTimes.filter(time => now - time < 60000);

      // Check if we can make a request
      if (this.requestTimes.length >= this.maxRPM) {
        // Wait until oldest request is >1 minute old
        const oldestRequest = this.requestTimes[0];
        const waitTime = 60000 - (now - oldestRequest);
        console.log(`Queue: Waiting ${Math.ceil(waitTime / 1000)}s for rate limit...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Process next request
      const { requestFn, resolve, reject } = this.queue.shift();

      try {
        this.requestTimes.push(Date.now());
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }
}

// Usage
const queue = new RequestQueue(25); // 25 RPM (safe buffer)

const response = await queue.add(async () => {
  return await groqClient.chat(messages);
});
```

✅ **Solution 3: Monitor Token Usage**
```javascript
class TokenMonitor {
  constructor() {
    this.tokenUsage = [];
    this.dailyLimit = 180000; // 90% of 200K (safety buffer)
  }

  canMakeRequest(estimatedTokens) {
    const now = Date.now();
    const oneDayAgo = now - 86400000;

    // Clean old usage
    this.tokenUsage = this.tokenUsage.filter(item => item.time > oneDayAgo);

    // Calculate daily total
    const dailyTotal = this.tokenUsage.reduce((sum, item) => sum + item.tokens, 0);

    return dailyTotal + estimatedTokens <= this.dailyLimit;
  }

  recordUsage(tokens) {
    this.tokenUsage.push({
      time: Date.now(),
      tokens: tokens
    });
  }

  getDailyUsage() {
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    this.tokenUsage = this.tokenUsage.filter(item => item.time > oneDayAgo);
    return this.tokenUsage.reduce((sum, item) => sum + item.tokens, 0);
  }
}

// Usage
const monitor = new TokenMonitor();

if (!monitor.canMakeRequest(500)) {
  throw new Error('Daily token limit reached');
}

const response = await groqClient.chat(messages);
monitor.recordUsage(response.usage.total_tokens);
```

✅ **Solution 4: Use Caching**
```javascript
const cache = new Map();

async function getCachedResponse(question) {
  // Create cache key from question
  const cacheKey = question.toLowerCase().trim();

  // Check cache
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    const age = Date.now() - cached.timestamp;

    // Use cache if less than 1 hour old
    if (age < 3600000) {
      console.log('✅ Using cached response');
      return cached.response;
    }
  }

  // Make API request
  const response = await groqClient.chat([
    { role: 'user', content: question }
  ]);

  // Cache response
  cache.set(cacheKey, {
    response: response.choices[0].message.content,
    timestamp: Date.now()
  });

  return response.choices[0].message.content;
}
```

---

## Model Errors

### Error: "Model not found" (404)

**Symptoms:**
```json
{
  "error": {
    "message": "The model 'model-name' does not exist",
    "type": "invalid_request_error"
  }
}
```

**Possible Causes:**
1. Typo in model name
2. Model deprecated
3. Wrong model for task

**Solutions:**

✅ **Verify Model Name**
```javascript
// Correct model names for Russian:
const VALID_MODELS = [
  'llama-3.3-70b-versatile',    // ✅ Best for Russian
  'llama-3.1-70b-versatile',    // ✅ Good alternative
  'mixtral-8x7b-32768'          // ✅ Fast option
];

// Common typos:
// ❌ 'llama-3.3-70b' (missing '-versatile')
// ❌ 'llama3.3-70b-versatile' (missing dash)
// ❌ 'llama-3-70b-versatile' (wrong version number)
```

✅ **List Available Models**
```bash
# Get all available models
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

✅ **Use Model Fallback Chain**
```javascript
const MODEL_CHAIN = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'mixtral-8x7b-32768'
];

async function chatWithFallback(messages) {
  for (const model of MODEL_CHAIN) {
    try {
      console.log(`Trying model: ${model}`);
      return await groqClient.chat(messages, { model });
    } catch (error) {
      if (error.status === 404) {
        console.log(`Model ${model} not available, trying next...`);
        continue;
      }
      throw error;
    }
  }
  throw new Error('All models unavailable');
}
```

---

### Error: "Context length exceeded"

**Symptoms:**
```json
{
  "error": {
    "message": "This model's maximum context length is 8192 tokens",
    "type": "invalid_request_error"
  }
}
```

**Solutions:**

✅ **Reduce Message History**
```javascript
function trimConversationHistory(messages, maxTokens = 6000) {
  // Keep system prompt
  const systemPrompts = messages.filter(m => m.role === 'system');

  // Get user/assistant messages
  let conversation = messages.filter(m => m.role !== 'system');

  // Estimate tokens (rough: 1 token ≈ 4 characters)
  function estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  // Keep only recent messages that fit in limit
  let totalTokens = systemPrompts.reduce((sum, m) => sum + estimateTokens(m.content), 0);
  const trimmed = [];

  for (let i = conversation.length - 1; i >= 0; i--) {
    const tokens = estimateTokens(conversation[i].content);
    if (totalTokens + tokens > maxTokens) break;

    trimmed.unshift(conversation[i]);
    totalTokens += tokens;
  }

  return [...systemPrompts, ...trimmed];
}

// Usage
const messages = [...]; // Your full conversation
const trimmedMessages = trimConversationHistory(messages);
const response = await groqClient.chat(trimmedMessages);
```

✅ **Summarize Old Messages**
```javascript
async function summarizeConversation(messages) {
  if (messages.length <= 10) return messages;

  // Get old messages to summarize
  const oldMessages = messages.slice(0, -5);
  const recentMessages = messages.slice(-5);

  // Create summary request
  const summaryRequest = [
    {
      role: 'user',
      content: `Summarize this conversation in 2-3 sentences:\n\n${JSON.stringify(oldMessages)}`
    }
  ];

  const summaryResponse = await groqClient.chat(summaryRequest);
  const summary = summaryResponse.choices[0].message.content;

  // Return summary + recent messages
  return [
    { role: 'system', content: `Previous conversation summary: ${summary}` },
    ...recentMessages
  ];
}
```

✅ **Use Model with Longer Context**
```javascript
// Switch to model with 32K context
const response = await groqClient.chat(messages, {
  model: 'mixtral-8x7b-32768'  // 32K tokens context
});
```

---

## Network Errors

### Error: "Connection timeout"

**Symptoms:**
- Request hangs for >30 seconds
- "ETIMEDOUT" error
- "Socket hang up" error

**Solutions:**

✅ **Add Timeout to Requests**
```javascript
async function fetchWithTimeout(url, options, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// Usage
const response = await fetchWithTimeout(
  'https://api.groq.com/openai/v1/chat/completions',
  {
    method: 'POST',
    headers: {...},
    body: JSON.stringify(...)
  },
  15000  // 15 second timeout
);
```

✅ **Check Network Connectivity**
```bash
# Test connection to Groq
curl -I https://api.groq.com

# Should return: HTTP/2 200

# If fails, check DNS
nslookup api.groq.com

# Check firewall/proxy
echo $HTTP_PROXY
echo $HTTPS_PROXY
```

✅ **Implement Retry Logic**
```javascript
async function retryableRequest(requestFn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const isNetworkError =
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNRESET' ||
        error.message.includes('timeout');

      if (!isNetworkError) throw error;

      console.log(`Network error, retry ${attempt}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

---

## Response Quality Issues

### Issue: Poor Russian Language Quality

**Symptoms:**
- Responses in English instead of Russian
- Grammar mistakes
- Unnatural phrasing

**Solutions:**

✅ **Use Correct Model**
```javascript
// ✅ BEST for Russian
model: "llama-3.3-70b-versatile"

// ⚠️ Acceptable but worse
model: "llama-3.1-70b-versatile"

// ❌ Poor Russian support
model: "llama-3.2-1b-preview"  // Too small
```

✅ **Improve System Prompt**
```javascript
// ❌ Bad prompt
const systemPrompt = "You are a helpful assistant";

// ✅ Good prompt for Russian
const systemPrompt = `Ты русскоязычный ассистент HypeAI.
ВАЖНО: Всегда отвечай ТОЛЬКО на русском языке.
Используй простые слова и короткие предложения.
Если не знаешь ответ, честно скажи об этом.`;
```

✅ **Add Language Enforcement**
```javascript
async function askInRussian(question) {
  const messages = [
    {
      role: 'system',
      content: 'CRITICAL: Always respond in Russian language only. Всегда отвечай по-русски.'
    },
    {
      role: 'user',
      content: `${question}\n\n(Ответь по-русски)`
    }
  ];

  const response = await groqClient.chat(messages);
  let answer = response.choices[0].message.content;

  // Validate response is in Russian
  const hasCyrillic = /[а-яА-ЯёЁ]/.test(answer);
  if (!hasCyrillic) {
    console.warn('Response not in Russian, retrying...');
    // Retry with stronger prompt
    messages[1].content = `ВАЖНО: Ответь на русском языке!\n\n${question}`;
    const retry = await groqClient.chat(messages);
    answer = retry.choices[0].message.content;
  }

  return answer;
}
```

---

### Issue: Inconsistent Responses

**Symptoms:**
- Same question gets different answers
- Quality varies between requests

**Solutions:**

✅ **Control Temperature**
```javascript
// For consistent, factual responses
const response = await groqClient.chat(messages, {
  temperature: 0.3  // Lower = more consistent
});

// For creative, varied responses
const response = await groqClient.chat(messages, {
  temperature: 0.9  // Higher = more creative
});

// Recommended for HypeAI:
temperature: 0.5  // Balanced
```

✅ **Use Few-Shot Examples**
```javascript
const messages = [
  {
    role: 'system',
    content: 'Ты HypeAI ассистент. Отвечай кратко и точно.'
  },
  // Example 1
  { role: 'user', content: 'Что такое стейкинг?' },
  { role: 'assistant', content: 'Стейкинг - это блокировка токенов для получения вознаграждений.' },
  // Example 2
  { role: 'user', content: 'Сколько APY у HypeAI?' },
  { role: 'assistant', content: 'APY зависит от пула, обычно 12-24%.' },
  // Actual question
  { role: 'user', content: actualQuestion }
];
```

---

## Performance Issues

### Issue: Slow Response Times

**Symptoms:**
- Responses take >5 seconds
- Timeout errors
- Poor user experience

**Solutions:**

✅ **Switch to Faster Model**
```javascript
// If speed is critical
model: "mixtral-8x7b-32768"  // ~1500 tokens/sec

// If quality is critical
model: "llama-3.3-70b-versatile"  // ~1000 tokens/sec
```

✅ **Reduce Token Count**
```javascript
const response = await groqClient.chat(messages, {
  max_tokens: 300  // Faster than 1000
});
```

✅ **Enable Streaming**
```javascript
async function streamResponse(messages) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      stream: true  // Enable streaming
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content || '';
          fullResponse += content;
          console.log(content); // Stream to UI
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }

  return fullResponse;
}
```

---

## Integration Issues

### Issue: CORS Errors in Browser

**Symptoms:**
```
Access to fetch at 'https://api.groq.com/...' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Solution:**

⚠️ **NEVER call Groq API directly from browser!**

```javascript
// ❌ WRONG - Exposes API key
// Frontend code:
const response = await fetch('https://api.groq.com/...', {
  headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }  // Exposed!
});

// ✅ CORRECT - Use backend proxy
// Frontend code:
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ question: 'Hello' })
});

// Backend code (server.js):
app.post('/api/chat', async (req, res) => {
  const { question } = req.body;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,  // Safe!
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: question }]
    })
  });

  const data = await response.json();
  res.json({ answer: data.choices[0].message.content });
});
```

---

### Issue: Environment Variables Not Loading

**Symptoms:**
```javascript
console.log(process.env.GROQ_API_KEY);  // undefined
```

**Solutions:**

✅ **Verify dotenv Setup**
```javascript
// At the very top of your entry file
require('dotenv').config({ path: '.env.local' });

// Verify loading
if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY not loaded!');
  console.log('Current directory:', __dirname);
  console.log('Looking for: .env.local');
  process.exit(1);
}
```

✅ **Check File Location**
```bash
# .env.local should be in project root
ls -la .env.local

# If missing:
echo "GROQ_API_KEY=gsk_your_key" > .env.local
```

✅ **Use Absolute Path**
```javascript
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '.env.local')
});
```

---

## Getting Help

### Self-Service Debugging

1. **Check Groq Status Page**
   - https://status.groq.com
   - Look for ongoing incidents

2. **Review Groq Documentation**
   - https://console.groq.com/docs
   - API reference and examples

3. **Check Your Usage**
   - https://console.groq.com/usage
   - Monitor rate limits and quotas

### Contact Support

**Groq Support:**
- Email: support@groq.com
- Include: Account ID, error message, timestamp, request ID

**HypeAI Internal:**
- Developer docs: `/docs/AI_ASSISTANT_INTEGRATION.md`
- Team chat: [your team channel]
- GitHub issues: [your repo]/issues

---

## Debugging Checklist

Before reporting issues:

- [ ] Verified API key is correct
- [ ] Checked `.env.local` file exists
- [ ] Confirmed dotenv is loading
- [ ] Tested with curl (isolate code issues)
- [ ] Checked Groq status page
- [ ] Reviewed error message carefully
- [ ] Tried with different model
- [ ] Checked rate limits
- [ ] Verified network connectivity
- [ ] Tested in different environment

---

**Still Having Issues?**

Refer to:
- [Full Setup Guide](./GROQ_API_SETUP.md)
- [Quick Start Guide](./GROQ_QUICK_START.md)
- Groq Documentation: https://console.groq.com/docs
