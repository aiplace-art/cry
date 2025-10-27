# AI Integration Quickstart Guide
## Get Real AI Streaming in 15 Minutes

**Current State:** Pattern matching (free, instant)
**Target State:** GPT-4/Claude streaming (smart, costly)
**Status:** ✅ Infrastructure ready, waiting for activation

---

## 🚀 Quick Activation (3 Steps)

### Step 1: Get API Key (5 minutes)

**Option A: OpenAI (GPT-4)**
```bash
# 1. Go to https://platform.openai.com/
# 2. Create account or sign in
# 3. Click "API Keys" in sidebar
# 4. Create new secret key
# 5. Copy key (starts with sk-...)
```

**Option B: Anthropic (Claude)**
```bash
# 1. Go to https://console.anthropic.com/
# 2. Create account or sign in
# 3. Click "API Keys"
# 4. Create new key
# 5. Copy key (starts with sk-ant-...)
```

### Step 2: Add to HTML (2 minutes)

Edit `/public/variant-2/index.html`:

```html
<!-- Add BEFORE closing </body> tag, BEFORE hyper-chat-competitive-engine.js -->
<script>
    // PHASE 2: AI API Configuration
    window.AI_CONFIG = {
        enabled: true, // Set to false to use pattern matching
        provider: 'openai', // or 'anthropic'
        apiKey: 'YOUR-API-KEY-HERE', // PRODUCTION: Load from backend!
        model: 'gpt-4-turbo-preview',
        streaming: true
    };
</script>

<!-- Load AI module -->
<script src="js/modules/ai-api-client.js"></script>

<!-- Existing scripts -->
<script src="js/hyper-chat-smart-responses.js"></script>
<script src="js/hyper-chat-knowledge.js"></script>
<script src="js/hyper-chat-competitive-engine.js"></script>
```

### Step 3: Update Engine (5 minutes)

Add this code to `/public/variant-2/js/hyper-chat-competitive-engine.js`:

**In constructor()**, add after line 106:
```javascript
constructor() {
    // ... existing code ...

    // Initialize response generator
    this.chatResponses = new HyperChatSmartResponses();

    // 🚀 PHASE 2: Initialize AI client
    if (window.AI_CONFIG && window.AI_CONFIG.enabled && window.AIAPIClient) {
        this.aiClient = new AIAPIClient({
            provider: window.AI_CONFIG.provider,
            apiKey: window.AI_CONFIG.apiKey,
            model: window.AI_CONFIG.model,
            streaming: window.AI_CONFIG.streaming,
            fallback: true,
            patternEngine: this.chatResponses
        });
        console.log('✅ AI API enabled:', this.aiClient.getConfig());
    } else {
        this.aiClient = null;
        console.log('ℹ️ Using pattern matching mode');
    }

    // ... rest of constructor ...
}
```

**Replace processResponse() method** (around line 1088):
```javascript
async processResponse(userText, isRegeneration = false) {
    // Queue processing to prevent race conditions
    this.processQueue = this.processQueue.then(async () => {
        const processId = this.generateId();
        this.currentProcessId = processId;

        try {
            this.isProcessing = true;
            this.isGenerating = true;
            this.updateSendButton();

            // Show agent processing
            const agents = this.getActiveAgentsForMessage(userText);
            const processingEl = this.showAgentProcessing(agents);
            await this.animateAgentProcessing(processingEl, agents);

            // Check if stopped
            if (!this.isGenerating || this.currentProcessId !== processId) {
                this.hideAgentProcessing();
                return;
            }

            this.hideAgentProcessing();
            this.showStopButton();

            // 🚀 PHASE 2: Use AI if available
            if (this.aiClient && this.aiClient.isInitialized) {
                await this.processAIResponse(userText, processId);
            } else {
                await this.processPatternResponse(userText, processId);
            }

            this.hideStopButton();
            this.chatInput?.focus();
        } catch (error) {
            console.error('Response processing failed:', error);
            this.showToast('Failed to generate response. Please try again.', 5000);
            this.hideStopButton();
            this.hideAgentProcessing();
            throw error;
        } finally {
            if (this.currentProcessId === processId) {
                this.isProcessing = false;
                this.isGenerating = false;
                this.currentProcessId = null;
                this.currentStreamAbort = null;
                this.updateSendButton();
            }
        }
    }).catch(error => {
        console.error('Process queue error:', error);
    });

    return this.processQueue;
}

// 🚀 NEW METHOD: AI Response Processing
async processAIResponse(userText, processId) {
    const messageId = this.generateId();

    // Create streaming message element
    const messageEl = this.createStreamingMessage(messageId);

    let fullResponse = '';
    const startTime = Date.now();

    try {
        await this.aiClient.sendMessage(
            userText,
            {
                conversationHistory: this.getConversationHistory(),
                maxTokens: 2000
            },
            // onChunk - called for each token
            (chunk, accumulated) => {
                if (this.currentProcessId !== processId) return;
                fullResponse = accumulated;
                this.updateStreamingMessage(messageEl, accumulated);
            },
            // onComplete - called when done
            (response) => {
                if (this.currentProcessId !== processId) return;

                const latency = Date.now() - startTime;
                console.log(`✅ AI response complete (${latency}ms)`);

                // Finalize message
                this.finalizeMessage(messageEl, messageId, response);

                // Save to messages array
                this.messages.push({
                    id: messageId,
                    role: 'assistant',
                    content: response,
                    timestamp: new Date(),
                    source: 'ai'
                });

                // Show follow-ups
                const followUpQuestions = this.generateFollowUpQuestions(userText, response);
                this.showFollowUpQuestions(followUpQuestions, messageId);
            },
            // onError - fallback to pattern matching
            (error) => {
                console.error('AI error, falling back to patterns:', error);
                messageEl.remove();
                return this.processPatternResponse(userText, processId);
            }
        );
    } catch (error) {
        console.error('AI processing failed:', error);
        messageEl.remove();
        return this.processPatternResponse(userText, processId);
    }
}

// 🚀 NEW METHOD: Pattern Response Processing (existing logic)
async processPatternResponse(userText, processId) {
    await this.delay(600);

    if (!this.isGenerating || this.currentProcessId !== processId) {
        return;
    }

    const responseText = this.chatResponses.generateResponse(userText);
    const messageId = this.generateId();

    const assistantMessage = {
        id: messageId,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        source: 'pattern'
    };

    this.messages.push(assistantMessage);
    this.renderMessage(assistantMessage);

    const followUpQuestions = this.generateFollowUpQuestions(userText, responseText);
    this.showFollowUpQuestions(followUpQuestions, messageId);
}

// 🚀 NEW METHOD: Create streaming message
createStreamingMessage(messageId) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message assistant streaming';
    messageEl.dataset.messageId = messageId;
    messageEl.setAttribute('role', 'article');
    messageEl.setAttribute('aria-label', 'AI message');

    messageEl.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">
                <img src="../website/logo-official-BRIGHT.svg" alt="AI" />
            </div>
            <div class="message-role">Hyper Chat <span class="ai-badge">AI</span></div>
        </div>
        <div class="message-content markdown-content"></div>
        <div class="streaming-indicator">▊</div>
    `;

    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
    return messageEl;
}

// 🚀 NEW METHOD: Update streaming message
updateStreamingMessage(messageEl, text) {
    const contentEl = messageEl.querySelector('.message-content');
    if (contentEl) {
        this.renderMarkdown(text, contentEl);
        this.scrollToBottom();
    }
}

// 🚀 NEW METHOD: Finalize message
finalizeMessage(messageEl, messageId, response) {
    messageEl.classList.remove('streaming');
    messageEl.querySelector('.streaming-indicator')?.remove();

    // Add message actions
    const actionsHTML = this.createMessageActions(messageId, true);
    messageEl.innerHTML += actionsHTML;
}

// 🚀 NEW METHOD: Get conversation history
getConversationHistory() {
    // Send last 6 messages (3 exchanges) to save tokens
    const recentMessages = this.messages.slice(-6);
    return recentMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
    }));
}
```

**Add CSS for streaming indicator** in `/public/variant-2/css/chat.css`:
```css
/* Streaming indicator animation */
.message.streaming .streaming-indicator {
    display: inline-block;
    margin-left: 4px;
    animation: blink 1s infinite;
    color: var(--primary-color);
    font-weight: bold;
}

@keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
}

.ai-badge {
    display: inline-block;
    background: linear-gradient(135deg, #00E5FF, #0077FF);
    color: #000;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 6px;
    text-transform: uppercase;
}
```

---

## ✅ Testing

### Test 1: Check Initialization
```javascript
// Open browser console
console.log(window.hyperChatCompetitive.aiClient);
// Should show AIAPIClient object if enabled
// Should show null if using pattern matching
```

### Test 2: Send Test Message
```
User: "Explain how quantum computing works"
Expected: Streaming AI response (not pre-written pattern)
```

### Test 3: Check Costs
```javascript
// After 10 messages
console.log(window.hyperChatCompetitive.aiClient.getUsageStats());
// Should show: tokens used, cost, estimated monthly
```

### Test 4: Test Fallback
```javascript
// Set invalid API key
window.AI_CONFIG.apiKey = 'invalid-key';
// Send message
// Should gracefully fall back to pattern matching
```

---

## 💰 Cost Monitoring

**Check Usage:**
```javascript
// In browser console
const stats = window.hyperChatCompetitive.aiClient.getUsageStats();
console.table(stats);
```

**Sample Output:**
```
totalTokens: 5,234
totalCost: $0.23
estimatedMonthlyCost: $6.90
provider: openai
model: gpt-4-turbo-preview
```

**Set Budget Alerts:**
```javascript
// Add to constructor
this.costThreshold = 100; // $100/month
this.checkCosts = setInterval(() => {
    const stats = this.aiClient.getUsageStats();
    if (stats.estimatedMonthlyCost > this.costThreshold) {
        console.warn(`⚠️ Monthly cost projection: $${stats.estimatedMonthlyCost}`);
        // Optionally disable AI or switch to patterns
    }
}, 60000); // Check every minute
```

---

## 🎯 Hybrid Mode (Best of Both Worlds)

**Use patterns for common queries, AI for complex ones:**

```javascript
async processResponse(userText, isRegeneration = false) {
    // ... existing setup ...

    // Check if we should use AI or patterns
    const useAI = this.shouldUseAI(userText);

    if (useAI && this.aiClient?.isInitialized) {
        await this.processAIResponse(userText, processId);
    } else {
        await this.processPatternResponse(userText, processId);
    }
}

shouldUseAI(message) {
    // Use patterns for simple/common queries (saves money)
    const simplePatterns = [
        /what.*services/i,
        /how much/i,
        /price/i,
        /contact/i,
        /about/i,
        /hello|hi|hey/i
    ];

    if (simplePatterns.some(p => p.test(message))) {
        console.log('💚 Using pattern (free)');
        return false;
    }

    // Use AI for complex/technical queries
    console.log('🤖 Using AI (costs money)');
    return true;
}
```

**Result:**
- 80% of queries use free patterns
- 20% use AI for complex questions
- $500/month → $100/month (80% cost savings!)

---

## 🔒 Security: Server-Side Proxy (Recommended)

**Problem:** API keys exposed in frontend JavaScript
**Solution:** Create backend endpoint

### Backend (Node.js + Express):
```javascript
// server/routes/chat.js
const express = require('express');
const OpenAI = require('openai');

const router = express.Router();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Hidden from frontend
});

router.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    // Rate limiting
    // Authentication
    // Input validation

    try {
        const stream = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: message }
            ],
            stream: true
        });

        // Stream to client
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }
        res.end();
    } catch (error) {
        res.status(500).json({ error: 'AI request failed' });
    }
});

module.exports = router;
```

### Frontend Update:
```javascript
// In ai-api-client.js, update streamOpenAI()
async streamOpenAI(message, options, onChunk, onComplete) {
    // Use your backend instead of OpenAI directly
    const endpoint = '/api/chat'; // Your server

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            history: options.conversationHistory
        })
    });

    // ... rest of streaming logic ...
}
```

---

## 🐛 Troubleshooting

### Issue: "AI API Client not initialized"
```
✅ Check: window.AI_CONFIG.enabled = true
✅ Check: API key is valid
✅ Check: ai-api-client.js loaded before engine
```

### Issue: Responses are still pattern-based
```
✅ Check browser console for errors
✅ Verify: this.aiClient is not null
✅ Test: console.log(this.aiClient.getConfig())
```

### Issue: High costs
```
✅ Enable hybrid mode (patterns + AI)
✅ Reduce maxTokens to 1000
✅ Trim conversation history to 4 messages
✅ Consider Claude Haiku ($0.25/1M tokens)
```

### Issue: Slow responses
```
✅ Check internet connection
✅ Use faster model (gpt-3.5-turbo)
✅ Reduce maxTokens
✅ Check OpenAI status page
```

---

## 📊 Performance Comparison

| Metric | Pattern Matching | GPT-4 | Claude Opus |
|--------|-----------------|-------|-------------|
| Cost | $0 | $0.02/chat | $0.045/chat |
| Speed | 50ms | 2-3 sec | 1-2 sec |
| Quality | Fixed | Excellent | Excellent |
| Flexibility | Limited | Unlimited | Unlimited |
| Offline | ✅ Yes | ❌ No | ❌ No |

---

## 🎯 Recommendation

**For MVP/Demo:**
- ✅ Use pattern matching (free, fast)

**For Production (low traffic):**
- ✅ Use hybrid mode
- ✅ Patterns for common queries
- ✅ GPT-4 for complex queries
- 💰 Cost: ~$50-100/month

**For Production (high traffic):**
- ✅ Server-side proxy
- ✅ Claude Haiku for cost efficiency
- ✅ Aggressive caching
- 💰 Cost: ~$500-1000/month

---

**Status:** ✅ Infrastructure ready, activate when needed!
