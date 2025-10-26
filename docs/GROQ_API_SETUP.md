# Groq API Setup Guide for HypeAI

## 🚀 Complete Setup Instructions

### Table of Contents
1. [Getting Your Groq API Key](#getting-your-groq-api-key)
2. [Understanding Free Tier Limits](#understanding-free-tier-limits)
3. [Best Models for Russian Language](#best-models-for-russian-language)
4. [Rate Limiting Strategy](#rate-limiting-strategy)
5. [Cost Analysis](#cost-analysis)
6. [Security Best Practices](#security-best-practices)
7. [Testing Your Setup](#testing-your-setup)
8. [Integration with HypeAI](#integration-with-hypeai)

---

## Getting Your Groq API Key

### Step 1: Create Groq Account

1. **Navigate to Groq Console**
   - Open browser and go to: https://console.groq.com
   - You'll see the Groq login page

2. **Sign Up Options**
   - Click "Sign Up" or "Get Started"
   - Choose one of these methods:
     - **GitHub Account** (recommended for developers)
     - **Google Account** (fastest)
     - **Email/Password** (traditional)

3. **Complete Registration**
   - Follow the verification steps
   - Confirm your email if using email/password signup
   - Accept Groq's Terms of Service

### Step 2: Navigate to API Keys

1. **Access Dashboard**
   - After login, you'll see the Groq Console dashboard
   - Look for navigation menu (usually left sidebar or top menu)

2. **Find API Keys Section**
   - Click on "API Keys" or "Credentials"
   - Alternative path: Settings → API Keys
   - You'll see a list of your existing API keys (empty if first time)

### Step 3: Create New API Key

1. **Generate Key**
   - Click "Create API Key" or "+ New API Key" button
   - Enter a descriptive name (e.g., "HypeAI Production" or "HypeAI Development")
   - Optional: Add notes about where this key will be used

2. **Copy Your Key** ⚠️ CRITICAL
   ```
   Key format: gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   - **IMPORTANT**: The key is only shown ONCE
   - Click "Copy" button immediately
   - Store it securely right away (see Security section below)

3. **Confirm Creation**
   - The key will appear in your API Keys list
   - You'll see: Name, creation date, last used date
   - You can revoke/delete keys anytime if compromised

### Step 4: Secure Storage

**Immediately after copying:**

1. **Create `.env.local` file** (for local development)
   ```bash
   # In your HypeAI project root
   touch .env.local
   echo "GROQ_API_KEY=gsk_your_actual_key_here" >> .env.local
   ```

2. **Add to `.gitignore`** (if not already there)
   ```bash
   echo ".env.local" >> .gitignore
   ```

3. **Backup Securely**
   - Store in password manager (1Password, LastPass, Bitwarden)
   - Or encrypted note app
   - Never store in plain text files that sync to cloud

---

## Understanding Free Tier Limits

### Rate Limits (Free Tier)

| Limit Type | Value | Notes |
|------------|-------|-------|
| **Requests per Minute** | 30 RPM | Per API key |
| **Tokens per Minute** | 7,000 TPM | Shared across requests |
| **Tokens per Day** | ~200,000 TPD | Estimated daily quota |
| **Concurrent Requests** | 10 | Parallel requests allowed |
| **Cost** | **$0.00** | Completely FREE! 🎉 |

### What This Means for HypeAI:

**Daily Capacity:**
- ~200,000 tokens/day = ~667 conversations/day (assuming 300 tokens/conversation)
- For 100 active users: 6-7 conversations per user
- **More than enough for initial launch!**

**Per-Minute Capacity:**
- 7,000 tokens/min = ~23 messages/minute (assuming 300 tokens/message)
- 30 requests/min = Safe limit even with concurrent users

### When to Upgrade to Paid Tier:

Consider upgrading when you hit:
- More than 500 active daily users
- More than 150,000 tokens/day consistently
- Need for higher priority processing
- Business-critical uptime requirements

**Paid Tier Benefits:**
- 10x higher rate limits
- Priority processing
- Better SLA guarantees
- Advanced analytics

---

## Best Models for Russian Language

### Recommended Models (Ranked by Quality)

#### 1. **llama-3.3-70b-versatile** ⭐ RECOMMENDED
```json
{
  "model": "llama-3.3-70b-versatile",
  "strengths": [
    "Best Russian language understanding",
    "Excellent context awareness",
    "High accuracy in financial/crypto domains",
    "Good at following complex instructions"
  ],
  "speeds": {
    "tokens_per_second": "~800-1000",
    "typical_response": "1-2 seconds"
  },
  "context_length": 8192
}
```

**Best for:**
- Complex AI assistant conversations
- Technical explanations
- Multi-turn dialogues
- Nuanced Russian language

#### 2. **llama-3.1-70b-versatile** ⭐ GOOD ALTERNATIVE
```json
{
  "model": "llama-3.1-70b-versatile",
  "strengths": [
    "Very good Russian support",
    "Fast response times",
    "Reliable performance",
    "Lower token usage"
  ],
  "speeds": {
    "tokens_per_second": "~900-1200",
    "typical_response": "0.8-1.5 seconds"
  },
  "context_length": 8192
}
```

**Best for:**
- Quick responses
- FAQ-style questions
- Backup model when 3.3 unavailable

#### 3. **mixtral-8x7b-32768** ⚡ FAST OPTION
```json
{
  "model": "mixtral-8x7b-32768",
  "strengths": [
    "Fastest response times",
    "Longest context window (32K tokens)",
    "Good Russian support",
    "Excellent for long conversations"
  ],
  "speeds": {
    "tokens_per_second": "~1200-1500",
    "typical_response": "0.5-1 second"
  },
  "context_length": 32768
}
```

**Best for:**
- Real-time chat applications
- Long conversation history
- Low-latency requirements

### Model Selection Strategy for HypeAI:

```javascript
// Recommended fallback chain
const modelChain = [
  "llama-3.3-70b-versatile",    // Primary
  "llama-3.1-70b-versatile",    // Fallback 1
  "mixtral-8x7b-32768"          // Fallback 2 (speed priority)
];
```

---

## Rate Limiting Strategy

### Multi-Layer Protection

#### Layer 1: Client-Side Rate Limiting
```javascript
// Per-user limits
const CLIENT_LIMITS = {
  requestsPerMinute: 10,
  requestsPerHour: 100,
  cooldownAfterLimit: 60000 // 1 minute
};
```

**Purpose:** Prevent abuse from single users

#### Layer 2: Server-Side Rate Limiting
```javascript
// Global limits
const SERVER_LIMITS = {
  requestsPerMinute: 25,  // Leave buffer (30 RPM limit)
  tokensPerMinute: 6000,  // Leave buffer (7000 TPM limit)
  tokensPerDay: 180000    // Leave buffer (200K TPD limit)
};
```

**Purpose:** Protect API key, stay within Groq limits

#### Layer 3: Queue System
```javascript
// Request queue for burst traffic
const QUEUE_CONFIG = {
  maxQueueSize: 50,
  processingInterval: 2000, // Process every 2 seconds
  priorityLevels: 3
};
```

**Purpose:** Handle burst traffic smoothly

### Implementation Example:

```javascript
// Rate limiter with queue
class GroqRateLimiter {
  constructor() {
    this.requestQueue = [];
    this.requestTimestamps = [];
    this.tokenUsage = {
      minute: 0,
      day: 0,
      resetMinute: Date.now() + 60000,
      resetDay: Date.now() + 86400000
    };
  }

  async addRequest(request, priority = 'normal') {
    // Check if within limits
    if (this.canProcessImmediately()) {
      return await this.processRequest(request);
    }

    // Add to queue
    return await this.enqueueRequest(request, priority);
  }

  canProcessImmediately() {
    this.cleanOldTimestamps();
    const now = Date.now();

    // Check minute limits
    const recentRequests = this.requestTimestamps.filter(
      t => now - t < 60000
    );

    if (recentRequests.length >= 25) return false;
    if (this.tokenUsage.minute >= 6000) return false;
    if (this.tokenUsage.day >= 180000) return false;

    return true;
  }
}
```

### Fallback Strategy:

When rate limits are hit:
1. **Queue Request** (if queue not full)
2. **Use Cached Response** (if similar question asked recently)
3. **Fallback to Knowledge Base** (pre-defined responses)
4. **Show Friendly Message** (e.g., "Высокая нагрузка, попробуйте через минуту")

---

## Cost Analysis

### Daily Usage Estimates

**Conservative Scenario (100 users/day):**
```
Users:              100 daily active users
Messages/User:      5 average
Total Messages:     500 messages/day
Tokens/Message:     150 average
Daily Tokens:       75,000 tokens

FREE TIER COVERAGE: 200,000 tokens/day
Remaining Buffer:   125,000 tokens (62.5%)
Cost:              $0.00/month ✅
```

**Growth Scenario (500 users/day):**
```
Users:              500 daily active users
Messages/User:      5 average
Total Messages:     2,500 messages/day
Tokens/Message:     150 average
Daily Tokens:       375,000 tokens

FREE TIER COVERAGE: 200,000 tokens/day
Overage:           175,000 tokens (need queue or upgrade)
Paid Tier Cost:    ~$5-10/month (estimated)
```

**Peak Scenario (1000 users/day):**
```
Users:              1,000 daily active users
Messages/User:      5 average
Total Messages:     5,000 messages/day
Tokens/Message:     150 average
Daily Tokens:       750,000 tokens

FREE TIER COVERAGE: 200,000 tokens/day
Overage:           550,000 tokens
Paid Tier Cost:    ~$15-25/month (estimated)
Recommendation:    Upgrade to paid tier
```

### Token Optimization Tips:

**Reduce Token Usage:**
1. **Shorter System Prompts** (save ~50 tokens/request)
2. **Trim Conversation History** (keep only last 5 messages)
3. **Cache Common Responses** (FAQ, basic info)
4. **Smart Summarization** (summarize old messages)

**Example Optimization:**
```javascript
// Before: ~300 tokens/request
const verbosePrompt = `You are HypeAI assistant. You help users with crypto...`;

// After: ~150 tokens/request
const optimizedPrompt = `HypeAI crypto assistant. Concise, helpful, Russian.`;

// Savings: 50% token reduction!
```

---

## Security Best Practices

### 🔒 Critical Security Rules

#### 1. Never Commit API Keys to Git

**Check Current Status:**
```bash
# Search for exposed keys in git history
git log -p | grep -i "groq_api_key"

# Check current files
grep -r "gsk_" . --exclude-dir=node_modules
```

**If Key Found in Git:**
```bash
# IMMEDIATELY revoke key in Groq console
# Then remove from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all
```

#### 2. Use Environment Variables

**Correct Setup:**
```bash
# .env.local (NEVER commit this file)
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=500
```

**Access in Code:**
```javascript
// Node.js
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Never do this:
const API_KEY = "gsk_hardcoded_key"; // ❌ WRONG!
```

#### 3. Rotate Keys Regularly

**Monthly Rotation Schedule:**
```
Day 1:  Create new API key in Groq console
Day 2:  Deploy new key to production
Day 3:  Monitor for issues
Day 7:  Revoke old API key
```

**Automation Script:**
```bash
#!/bin/bash
# key-rotation-reminder.sh

# Add to crontab: 0 0 1 * * /path/to/key-rotation-reminder.sh
echo "🔄 Monthly API Key Rotation Reminder" | mail -s "Groq API Key" admin@hypeai.ru
```

#### 4. Monitor Usage in Groq Console

**What to Monitor:**
- **Daily Token Usage** (watch for spikes)
- **Error Rates** (high errors = possible attack)
- **Geographic Distribution** (unexpected locations)
- **Request Patterns** (unusual times/frequencies)

**Set Up Alerts:**
1. Log into Groq Console
2. Navigate to "Usage" or "Analytics"
3. Set thresholds:
   - 80% of daily quota used
   - 100 errors in 1 hour
   - Requests from blocked countries

#### 5. Implement API Key Validation

**Server-Side Validation:**
```javascript
// Validate API key on startup
async function validateGroqApiKey() {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Invalid Groq API key');
    }

    console.log('✅ Groq API key validated successfully');
    return true;
  } catch (error) {
    console.error('❌ Groq API key validation failed:', error);
    process.exit(1); // Stop server if key invalid
  }
}
```

#### 6. Use IP Whitelisting (if available)

**Groq Console Settings:**
- Navigate to API Key settings
- Add allowed IP addresses:
  - Your production server IP
  - Your office/home IP (for testing)
- Block all other IPs

#### 7. Implement Request Signing (Advanced)

**Add Request Signatures:**
```javascript
// Generate signature for each request
const crypto = require('crypto');

function signRequest(payload) {
  const secret = process.env.GROQ_SECRET; // Separate from API key
  const signature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return signature;
}
```

### Security Checklist

- [ ] API key stored in `.env.local`
- [ ] `.env.local` added to `.gitignore`
- [ ] No API keys in git history
- [ ] Environment variables used in code
- [ ] Monthly key rotation scheduled
- [ ] Usage monitoring enabled
- [ ] Alerts configured
- [ ] Server-side validation implemented
- [ ] Rate limiting active
- [ ] IP whitelisting configured (if available)
- [ ] Backup key stored securely
- [ ] Team members trained on security

---

## Testing Your Setup

### Test 1: Basic Connection

**Using curl:**
```bash
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [
      {"role": "user", "content": "Привет, как дела?"}
    ],
    "max_tokens": 100
  }'
```

**Expected Response:**
```json
{
  "id": "chatcmpl-xxxxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "llama-3.3-70b-versatile",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Здравствуйте! У меня всё отлично, спасибо. Чем могу помочь?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 15,
    "total_tokens": 27
  }
}
```

### Test 2: Russian Language Quality

**Test Questions:**
```bash
# Test 1: Financial terminology
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [
      {"role": "user", "content": "Что такое токеномика?"}
    ]
  }'

# Test 2: Complex question
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [
      {"role": "user", "content": "Объясни разницу между стейкингом и фармингом ликвидности"}
    ]
  }'
```

### Test 3: Rate Limiting

**Automated Test Script:**
```bash
#!/bin/bash
# test-rate-limits.sh

API_KEY="your_api_key_here"
REQUESTS=35  # Exceed 30 RPM limit

echo "Testing rate limits (expect errors after 30 requests)..."

for i in $(seq 1 $REQUESTS); do
  echo "Request $i..."

  curl -X POST https://api.groq.com/openai/v1/chat/completions \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"model\": \"llama-3.3-70b-versatile\", \"messages\": [{\"role\": \"user\", \"content\": \"Test $i\"}]}" \
    -s -w "\nHTTP Status: %{http_code}\n" &
done

wait
echo "Rate limit test complete"
```

**Expected Results:**
- Requests 1-30: HTTP 200 (success)
- Requests 31-35: HTTP 429 (rate limit exceeded)

### Test 4: Node.js Integration

**Create Test Script:**
```javascript
// test-groq-integration.js
require('dotenv').config({ path: '.env.local' });

async function testGroqIntegration() {
  const API_KEY = process.env.GROQ_API_KEY;

  if (!API_KEY) {
    console.error('❌ GROQ_API_KEY not found in .env.local');
    process.exit(1);
  }

  console.log('✅ API key found');
  console.log('🔍 Testing connection...\n');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: 'Привет! Это тест HypeAI.' }
        ],
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ Connection successful!\n');
    console.log('📊 Response Details:');
    console.log('Model:', data.model);
    console.log('Response:', data.choices[0].message.content);
    console.log('\n📈 Token Usage:');
    console.log('Prompt tokens:', data.usage.prompt_tokens);
    console.log('Completion tokens:', data.usage.completion_tokens);
    console.log('Total tokens:', data.usage.total_tokens);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testGroqIntegration();
```

**Run Test:**
```bash
node test-groq-integration.js
```

### Test 5: Performance Benchmarking

**Benchmark Script:**
```javascript
// benchmark-groq.js
const models = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'mixtral-8x7b-32768'
];

async function benchmarkModel(model) {
  const start = Date.now();

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: 'Объясни что такое DeFi простыми словами' }
      ]
    })
  });

  const data = await response.json();
  const duration = Date.now() - start;

  return {
    model: model,
    duration: duration,
    tokens: data.usage.total_tokens,
    tokensPerSecond: Math.round(data.usage.completion_tokens / (duration / 1000))
  };
}

async function runBenchmarks() {
  console.log('🏁 Starting performance benchmarks...\n');

  for (const model of models) {
    const result = await benchmarkModel(model);
    console.log(`📊 ${result.model}:`);
    console.log(`   Response time: ${result.duration}ms`);
    console.log(`   Total tokens: ${result.tokens}`);
    console.log(`   Speed: ${result.tokensPerSecond} tokens/sec\n`);

    // Wait 2 seconds between tests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

runBenchmarks();
```

---

## Integration with HypeAI

### Step 1: Install Dependencies

```bash
npm install dotenv
# or
yarn add dotenv
```

### Step 2: Create Environment File

```bash
# .env.local
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=500
GROQ_TEMPERATURE=0.7
```

### Step 3: Create Groq Client

**File: `src/utils/groq-client.js`**
```javascript
require('dotenv').config({ path: '.env.local' });

class GroqClient {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    this.baseURL = 'https://api.groq.com/openai/v1';

    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }
  }

  async chat(messages, options = {}) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || this.model,
        messages: messages,
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        stream: options.stream || false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Groq API Error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  async simpleQuestion(question, systemPrompt) {
    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: question });

    const response = await this.chat(messages);
    return response.choices[0].message.content;
  }
}

module.exports = new GroqClient();
```

### Step 4: Integrate with AI Assistant

**File: `src/api/ai-assistant.js`**
```javascript
const groqClient = require('../utils/groq-client');

const SYSTEM_PROMPT = `Ты HypeAI - умный криптовалютный помощник.
Ты помогаешь пользователям с вопросами о HypeAI, DeFi, стейкинге и токеномике.
Отвечай кратко, понятно и по-русски.`;

async function handleUserQuestion(question, conversationHistory = []) {
  try {
    // Build message array
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history (last 5 messages only)
    const recentHistory = conversationHistory.slice(-5);
    messages.push(...recentHistory);

    // Add current question
    messages.push({ role: 'user', content: question });

    // Get response from Groq
    const response = await groqClient.chat(messages, {
      maxTokens: 500,
      temperature: 0.7
    });

    return {
      answer: response.choices[0].message.content,
      tokensUsed: response.usage.total_tokens,
      model: response.model
    };

  } catch (error) {
    console.error('AI Assistant Error:', error);

    // Fallback to knowledge base
    return {
      answer: 'Извините, сейчас высокая нагрузка. Попробуйте через минуту.',
      error: true
    };
  }
}

module.exports = { handleUserQuestion };
```

### Step 5: Add Rate Limiting

**File: `src/utils/rate-limiter.js`**
```javascript
class RateLimiter {
  constructor() {
    this.requests = [];
    this.tokenUsage = [];
  }

  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Clean old requests
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    this.tokenUsage = this.tokenUsage.filter(item => item.time > oneMinuteAgo);

    // Check limits
    const requestCount = this.requests.length;
    const tokenCount = this.tokenUsage.reduce((sum, item) => sum + item.tokens, 0);

    if (requestCount >= 25) {
      return { allowed: false, reason: 'requests_per_minute' };
    }

    if (tokenCount >= 6000) {
      return { allowed: false, reason: 'tokens_per_minute' };
    }

    return { allowed: true };
  }

  recordRequest(tokens) {
    const now = Date.now();
    this.requests.push(now);
    this.tokenUsage.push({ time: now, tokens: tokens });
  }
}

module.exports = new RateLimiter();
```

### Step 6: Test Integration

```bash
# Run integration test
node src/api/test-integration.js
```

**Expected Output:**
```
✅ Environment variables loaded
✅ Groq client initialized
🤖 Testing AI assistant...

Question: "Что такое HypeAI?"
Answer: "HypeAI - это инновационная платформа для..."
Tokens used: 127
Model: llama-3.3-70b-versatile

✅ All tests passed!
```

---

## Troubleshooting

See [GROQ_TROUBLESHOOTING.md](./GROQ_TROUBLESHOOTING.md) for detailed troubleshooting guide.

---

## Next Steps

1. ✅ Complete this setup guide
2. 📖 Read [Quick Start Guide](./GROQ_QUICK_START.md)
3. 🔧 Implement rate limiting
4. 📊 Monitor usage in Groq Console
5. 🚀 Deploy to production

---

**Need Help?**
- Groq Documentation: https://console.groq.com/docs
- HypeAI Developer Docs: `/docs/`
- Community Support: https://t.me/hypeai_community
