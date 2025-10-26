# HypeAI Website AI Assistant - Comprehensive Architecture

**Version:** 1.0
**Date:** 2025-10-25
**Status:** Production-Ready Design
**Author:** System Architect

---

## 📋 Executive Summary

This document outlines the complete architecture for an intelligent AI assistant integrated into the HypeAI website. The assistant will provide 24/7 support, answer questions about tokenomics, services, roadmap, and team information in both English and Russian, matching the cosmic purple/yellow brand theme.

### Key Features
- 🤖 **Intelligent Q&A** - RAG-powered knowledge base covering all HypeAI documentation
- 🌐 **Multilingual** - Full English and Russian support
- 🎨 **Branded UI** - Cosmic theme matching HypeAI's visual identity
- 📱 **Mobile-First** - Responsive design for all devices
- 🚀 **Real-Time** - Instant responses with streaming support
- 🔒 **Secure** - Rate limiting, input validation, and DDoS protection

---

## 🎯 Business Requirements

### Must-Have Features
1. Answer ALL questions about:
   - Tokenomics (10B supply, 62% APY staking, 3-tier referrals)
   - AI Services (27 agents, 35+ professional services)
   - Private Sale ($0.00008 per token, vesting schedule)
   - Roadmap and team information
   - Smart contract details

2. Always available (99.9% uptime target)
3. Response time < 2 seconds
4. Support English and Russian languages
5. Match HypeAI brand identity (cosmic purple/yellow theme)
6. Mobile-friendly and accessible (WCAG AA)

### Nice-to-Have Features
- Conversation history per session
- User feedback system (thumbs up/down)
- Analytics dashboard for popular questions
- Admin panel for knowledge base updates
- Integration with Telegram/Discord bots

---

## 🏗️ System Architecture

### High-Level Architecture (Text-Based Diagram)

```
┌─────────────────────────────────────────────────────────────┐
│                    HypeAI Website Users                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Chat Widget Component (React/Vanilla JS)           │    │
│  │  • Minimizable window (bottom-right corner)         │    │
│  │  • Message history                                   │    │
│  │  • Typing indicators                                 │    │
│  │  • Language switcher (EN/RU)                        │    │
│  │  • Cosmic purple/yellow theme                       │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY                               │
│  • Rate Limiting (100 requests/minute/IP)                   │
│  • Authentication (optional API keys)                       │
│  • CORS handling                                            │
│  • Request validation                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API (Node.js/Python)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Chat Controller                                      │   │
│  │  • POST /api/chat/message                            │   │
│  │  • GET  /api/chat/history/:sessionId                 │   │
│  │  • POST /api/chat/feedback                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Session Manager                                      │   │
│  │  • Create/retrieve sessions                          │   │
│  │  • Store conversation history                        │   │
│  │  • Clean expired sessions (24h TTL)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI PROCESSING LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  RAG Pipeline                                         │   │
│  │  1. Query Analysis (detect language, intent)         │   │
│  │  2. Vector Search (find relevant documents)          │   │
│  │  3. Context Assembly (build prompt with context)     │   │
│  │  4. AI Generation (Claude 3.5 Sonnet)               │   │
│  │  5. Response Formatting (markdown, links)            │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 KNOWLEDGE BASE LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Vector Database (Pinecone/Supabase pgvector)       │   │
│  │  • Document embeddings (1536 dimensions)             │   │
│  │  • Metadata: source, category, language              │   │
│  │  • Similarity search (cosine distance)               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Document Store (PostgreSQL/Supabase)                │   │
│  │  • Full text of documents                            │   │
│  │  • Source references                                 │   │
│  │  • Last updated timestamps                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  ANALYTICS & MONITORING                      │
│  • Question logs (popular topics)                           │
│  • User feedback tracking                                   │
│  • Performance metrics (response time, accuracy)            │
│  • Error tracking (Sentry)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Component Design

### Chat Widget UI

**Location:** Bottom-right corner of all website pages
**Theme:** Cosmic purple/yellow matching HypeAI brand

#### Visual Specifications

```css
/* Chat Widget Container */
.ai-assistant-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1500;
  font-family: 'Space Grotesk', sans-serif;
}

/* Colors (matching HypeAI brand) */
--cosmic-purple: #9333ea;
--cosmic-blue: #3b82f6;
--cosmic-yellow: #FFE900;
--bg-dark: #0a0118;
--surface: #141933;
```

#### Component Structure

```html
<!-- Minimized State -->
<div class="ai-widget-bubble" onclick="openChat()">
  <svg><!-- AI icon --></svg>
  <div class="notification-badge">3</div>
</div>

<!-- Expanded State -->
<div class="ai-widget-window">
  <!-- Header -->
  <div class="ai-widget-header">
    <div class="header-left">
      <img src="/logo-icon-only.svg" alt="HypeAI">
      <div>
        <h4>HypeAI Assistant</h4>
        <span class="status">Online • Powered by AI</span>
      </div>
    </div>
    <div class="header-right">
      <select id="language">
        <option value="en">EN</option>
        <option value="ru">RU</option>
      </select>
      <button onclick="minimizeChat()">−</button>
    </div>
  </div>

  <!-- Messages Container -->
  <div class="ai-messages" id="chatMessages">
    <!-- Welcome Message -->
    <div class="message ai-message">
      <div class="message-avatar">
        <img src="/logo-icon-only.svg" alt="AI">
      </div>
      <div class="message-content">
        <p>👋 Hi! I'm the HypeAI Assistant. Ask me anything about:</p>
        <ul>
          <li>💰 Tokenomics & Private Sale</li>
          <li>🤖 AI Services & Agents</li>
          <li>🗺️ Roadmap & Team</li>
          <li>📜 Smart Contracts</li>
        </ul>
      </div>
    </div>

    <!-- User Message -->
    <div class="message user-message">
      <div class="message-content">
        <p>What is the staking APY?</p>
      </div>
    </div>

    <!-- AI Response with Typing Indicator -->
    <div class="message ai-message">
      <div class="message-avatar">
        <img src="/logo-icon-only.svg" alt="AI">
      </div>
      <div class="message-content">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  </div>

  <!-- Input Area -->
  <div class="ai-input-container">
    <input
      type="text"
      id="userInput"
      placeholder="Ask about tokenomics, services, roadmap..."
      maxlength="500"
    >
    <button onclick="sendMessage()" class="send-button">
      <svg><!-- Send icon --></svg>
    </button>
  </div>

  <!-- Footer -->
  <div class="ai-footer">
    <small>Powered by Claude 3.5 Sonnet</small>
  </div>
</div>
```

#### Suggested Quick Questions

```javascript
const quickQuestions = {
  en: [
    "What is the HYPEAI token price?",
    "How does the staking work?",
    "What are the AI services?",
    "Tell me about the private sale",
    "What is the total supply?"
  ],
  ru: [
    "Какая цена токена HYPEAI?",
    "Как работает стейкинг?",
    "Какие AI сервисы доступны?",
    "Расскажи о private sale",
    "Какой total supply?"
  ]
};
```

---

## 🔧 Backend API Specification

### Technology Stack

**Recommended:** Node.js + Express.js (matches existing codebase)

**Alternative:** Python + FastAPI (better AI/ML ecosystem)

### API Endpoints

#### 1. Send Message

```http
POST /api/chat/message
Content-Type: application/json

Request:
{
  "message": "What is the staking APY?",
  "sessionId": "uuid-v4-string",
  "language": "en"
}

Response (200 OK):
{
  "response": "HypeAI offers **up to 62% APY** for staking! Here's the breakdown:\n\n- 30 days: 17% APY\n- 90 days: 27% APY\n- 365 days: 62% APY\n\nThe longer you stake, the higher your rewards! 🚀",
  "sources": [
    {
      "title": "Tokenomics Documentation",
      "url": "/whitepaper.html#tokenomics"
    }
  ],
  "metadata": {
    "responseTime": 1234,
    "tokensUsed": 450,
    "confidence": 0.95
  }
}

Error (429 Too Many Requests):
{
  "error": "Rate limit exceeded. Try again in 30 seconds.",
  "retryAfter": 30
}
```

#### 2. Get Chat History

```http
GET /api/chat/history/:sessionId

Response (200 OK):
{
  "sessionId": "uuid-v4-string",
  "messages": [
    {
      "role": "user",
      "content": "What is the staking APY?",
      "timestamp": "2025-10-25T10:30:00Z"
    },
    {
      "role": "assistant",
      "content": "HypeAI offers up to 62% APY...",
      "timestamp": "2025-10-25T10:30:02Z",
      "sources": [...]
    }
  ],
  "createdAt": "2025-10-25T10:25:00Z"
}
```

#### 3. Submit Feedback

```http
POST /api/chat/feedback
Content-Type: application/json

Request:
{
  "sessionId": "uuid-v4-string",
  "messageId": "msg-uuid",
  "rating": "positive", // "positive" | "negative"
  "comment": "Very helpful!"
}

Response (200 OK):
{
  "status": "success",
  "message": "Thank you for your feedback!"
}
```

### Backend Implementation (Node.js)

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Anthropic } = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/chat', limiter);

// Initialize AI client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Initialize vector database
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// POST /api/chat/message
app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, sessionId, language = 'en' } = req.body;

    // 1. Input validation
    if (!message || message.length > 500) {
      return res.status(400).json({ error: 'Invalid message' });
    }

    // 2. Get relevant context from vector DB
    const context = await getRelevantContext(message, language);

    // 3. Build system prompt
    const systemPrompt = buildSystemPrompt(language, context);

    // 4. Call Claude API
    const aiResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: message }
      ]
    });

    const responseText = aiResponse.content[0].text;

    // 5. Save to session history
    await saveToHistory(sessionId, message, responseText);

    // 6. Return response
    res.json({
      response: responseText,
      sources: context.sources,
      metadata: {
        responseTime: Date.now() - req.startTime,
        tokensUsed: aiResponse.usage.output_tokens,
        confidence: 0.95
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper: Get relevant context from vector DB
async function getRelevantContext(query, language) {
  // Generate embedding for query
  const embedding = await generateEmbedding(query);

  // Search vector database
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 5,
    filter: { language }
  });

  if (error) throw error;

  return {
    documents: data.map(d => d.content).join('\n\n'),
    sources: data.map(d => ({
      title: d.title,
      url: d.url
    }))
  };
}

// Helper: Build system prompt
function buildSystemPrompt(language, context) {
  const prompts = {
    en: `You are the HypeAI Assistant, an expert on the HypeAI crypto project.

PERSONALITY:
- Professional yet friendly
- Enthusiastic about AI and crypto
- Use emojis sparingly (1-2 per response)
- Keep responses concise (2-3 paragraphs max)

PROJECT INFO:
- Name: HypeAI
- Token: HYPEAI
- Total Supply: 10,000,000,000 (10 billion)
- Blockchain: BNB Chain
- Private Sale Price: $0.00008
- Staking APY: Up to 62%
- AI Agents: 27 agents working 24/7
- Services: 35+ professional services

CONTEXT FROM KNOWLEDGE BASE:
${context.documents}

INSTRUCTIONS:
1. Answer questions accurately using the context above
2. If unsure, say "I don't have that information yet"
3. Always include relevant links when possible
4. Use markdown formatting (bold, lists, code blocks)
5. End with a helpful suggestion or follow-up question`,

    ru: `Вы - Ассистент HypeAI, эксперт по крипто-проекту HypeAI.

ЛИЧНОСТЬ:
- Профессиональный и дружелюбный
- Увлечённый AI и криптовалютами
- Используйте эмодзи умеренно (1-2 на ответ)
- Краткие ответы (максимум 2-3 абзаца)

ИНФОРМАЦИЯ О ПРОЕКТЕ:
- Название: HypeAI
- Токен: HYPEAI
- Total Supply: 10,000,000,000 (10 миллиардов)
- Блокчейн: BNB Chain
- Цена Private Sale: $0.00008
- Стейкинг APY: До 62%
- AI агенты: 27 агентов работают 24/7
- Сервисы: 35+ профессиональных сервисов

КОНТЕКСТ ИЗ БАЗЫ ЗНАНИЙ:
${context.documents}

ИНСТРУКЦИИ:
1. Отвечайте точно, используя контекст выше
2. Если не уверены, скажите "У меня пока нет этой информации"
3. Всегда добавляйте ссылки где возможно
4. Используйте markdown форматирование
5. Завершайте полезным предложением или вопросом`
  };

  return prompts[language] || prompts.en;
}

app.listen(3001, () => {
  console.log('AI Assistant API running on port 3001');
});
```

---

## 📊 Knowledge Base System

### Document Ingestion Pipeline

#### Step 1: Extract Documents

```javascript
// scripts/ingest-knowledge-base.js
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Documents to index
const sources = [
  '/Users/ai.place/Crypto/docs/tokenomics.md',
  '/Users/ai.place/Crypto/docs/PROJECT_KNOWLEDGE_BASE.md',
  '/Users/ai.place/Crypto/docs/whitepaper/*.md',
  '/Users/ai.place/Crypto/docs/marketing/*.md',
  '/Users/ai.place/Crypto/website/index.html',
  '/Users/ai.place/Crypto/website/whitepaper.html'
];

// Categories for better search
const categories = {
  tokenomics: ['tokenomics', 'staking', 'vesting', 'supply'],
  services: ['ai services', 'agents', 'professional services'],
  presale: ['private sale', 'presale', 'price', 'buy'],
  technical: ['smart contract', 'blockchain', 'bnb chain'],
  team: ['team', 'roadmap', 'about us']
};
```

#### Step 2: Chunk Documents

```javascript
// Split documents into chunks (500-1000 tokens each)
function chunkDocument(content, maxTokens = 800) {
  const chunks = [];
  const paragraphs = content.split('\n\n');

  let currentChunk = '';
  let currentTokens = 0;

  for (const para of paragraphs) {
    const tokens = estimateTokens(para);

    if (currentTokens + tokens > maxTokens && currentChunk) {
      chunks.push({
        content: currentChunk.trim(),
        tokens: currentTokens
      });
      currentChunk = para;
      currentTokens = tokens;
    } else {
      currentChunk += '\n\n' + para;
      currentTokens += tokens;
    }
  }

  if (currentChunk) {
    chunks.push({
      content: currentChunk.trim(),
      tokens: currentTokens
    });
  }

  return chunks;
}

function estimateTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}
```

#### Step 3: Generate Embeddings

```javascript
// Using Anthropic's recommended approach
const { Anthropic } = require('@anthropic-ai/sdk');

async function generateEmbedding(text) {
  // Option A: Use OpenAI embeddings (recommended)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data[0].embedding;

  // Option B: Use Voyage AI (alternative, cheaper)
  // const voyage = new VoyageAI({ apiKey: process.env.VOYAGE_API_KEY });
  // const embedding = await voyage.embed([text], 'voyage-2');
  // return embedding.embeddings[0];
}
```

#### Step 4: Store in Vector Database

**Option A: Supabase with pgvector (Recommended - Open Source)**

```sql
-- Setup Supabase vector table
create extension if not exists vector;

create table documents (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  embedding vector(1536), -- OpenAI embeddings dimension
  metadata jsonb,
  language text default 'en',
  category text,
  source_url text,
  title text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create index for fast similarity search
create index on documents using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Search function
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter jsonb default '{}'
)
returns table (
  id uuid,
  content text,
  title text,
  source_url text,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.title,
    documents.source_url,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
    and (filter = '{}' or documents.metadata @> filter)
  order by similarity desc
  limit match_count;
$$;
```

**Option B: Pinecone (Managed Service)**

```javascript
const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const index = pinecone.index('hypeai-knowledge');

// Upsert documents
await index.upsert([
  {
    id: 'doc-1',
    values: embedding, // 1536-dimensional vector
    metadata: {
      content: 'HypeAI offers staking...',
      title: 'Tokenomics',
      url: '/whitepaper.html',
      language: 'en',
      category: 'tokenomics'
    }
  }
]);

// Search
const results = await index.query({
  vector: queryEmbedding,
  topK: 5,
  includeMetadata: true,
  filter: { language: 'en' }
});
```

### Knowledge Base Content Structure

```javascript
// Documents to index (priority order)
const knowledgeBaseSources = {
  // Critical (must index)
  critical: [
    {
      file: '/docs/PROJECT_KNOWLEDGE_BASE.md',
      category: 'overview',
      weight: 1.0
    },
    {
      file: '/docs/tokenomics.md',
      category: 'tokenomics',
      weight: 1.0
    },
    {
      file: '/docs/whitepaper/05-tokenomics.md',
      category: 'tokenomics',
      weight: 0.9
    }
  ],

  // Important (should index)
  important: [
    {
      file: '/docs/HYPEAI_SERVICES.md',
      category: 'services',
      weight: 0.8
    },
    {
      file: '/docs/PRESALE_SUMMARY.md',
      category: 'presale',
      weight: 0.8
    },
    {
      file: '/docs/ROADMAP_VISUAL.md',
      category: 'roadmap',
      weight: 0.7
    }
  ],

  // Nice to have (optional)
  optional: [
    {
      file: '/docs/marketing/*.md',
      category: 'marketing',
      weight: 0.5
    },
    {
      file: '/docs/legal/*.md',
      category: 'legal',
      weight: 0.6
    }
  ]
};
```

---

## 🤖 AI Model Strategy

### Recommended: Claude 3.5 Sonnet (via Anthropic API)

**Why Claude 3.5 Sonnet?**
- ✅ Best for crypto/technical content (trained on diverse data)
- ✅ Excellent instruction following
- ✅ Strong multilingual support (EN/RU)
- ✅ Long context window (200K tokens)
- ✅ Fast response time (1-2 seconds)
- ✅ Markdown formatting support
- ✅ Official API with good pricing

**Pricing:**
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens
- Estimated cost: ~$50-100/month for 10K conversations

**Implementation:**

```javascript
const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  system: systemPrompt, // Knowledge base context
  messages: [
    { role: 'user', content: userQuestion }
  ]
});

const response = message.content[0].text;
```

### Alternative: GPT-4 Turbo (via OpenAI API)

**Pros:**
- Wide adoption
- Good documentation
- Function calling support

**Cons:**
- More expensive ($10/1M input, $30/1M output)
- Shorter context window (128K tokens)
- Less accurate for crypto-specific content

### Alternative: Open-Source Local Model

**Option: Llama 3 70B or Mistral Large**

**Pros:**
- No API costs
- Full data privacy
- Custom fine-tuning possible

**Cons:**
- Requires GPU infrastructure ($500-1000/month)
- Higher latency (3-5 seconds)
- More maintenance overhead
- Lower quality for complex queries

**Not recommended** unless budget is very constrained or data privacy is critical.

---

## 🎨 Frontend Implementation

### Option A: React Component (Recommended if using React)

```jsx
// components/AIAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import './AIAssistant.css';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState('en');
  const messagesEndRef = useRef(null);

  const welcomeMessages = {
    en: {
      greeting: "👋 Hi! I'm the HypeAI Assistant.",
      topics: [
        "💰 Tokenomics & Private Sale",
        "🤖 AI Services & Agents",
        "🗺️ Roadmap & Team",
        "📜 Smart Contracts"
      ]
    },
    ru: {
      greeting: "👋 Привет! Я ассистент HypeAI.",
      topics: [
        "💰 Токеномика и Private Sale",
        "🤖 AI Сервисы и Агенты",
        "🗺️ Roadmap и Команда",
        "📜 Смарт-контракты"
      ]
    }
  };

  useEffect(() => {
    // Add welcome message on mount
    setMessages([
      {
        role: 'assistant',
        content: welcomeMessages[language].greeting,
        topics: welcomeMessages[language].topics
      }
    ]);
  }, [language]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Call API
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          language,
          sessionId: getSessionId()
        })
      });

      const data = await response.json();

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        sources: data.sources
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getSessionId = () => {
    let sessionId = localStorage.getItem('ai-session-id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('ai-session-id', sessionId);
    }
    return sessionId;
  };

  return (
    <>
      {/* Minimized Bubble */}
      {!isOpen && (
        <button
          className="ai-bubble"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </button>
      )}

      {/* Expanded Window */}
      {isOpen && (
        <div className="ai-window">
          {/* Header */}
          <div className="ai-header">
            <div className="header-left">
              <img src="/logo-icon-only.svg" alt="HypeAI" />
              <div>
                <h4>HypeAI Assistant</h4>
                <span className="status">🟢 Online</span>
              </div>
            </div>
            <div className="header-right">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">EN</option>
                <option value="ru">RU</option>
              </select>
              <button onClick={() => setIsOpen(false)}>×</button>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.role}-message`}
              >
                {msg.role === 'assistant' && (
                  <img
                    src="/logo-icon-only.svg"
                    alt="AI"
                    className="message-avatar"
                  />
                )}
                <div className="message-content">
                  {msg.topics ? (
                    <>
                      <p>{msg.content}</p>
                      <ul>
                        {msg.topics.map((topic, i) => (
                          <li key={i}>{topic}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <div dangerouslySetInnerHTML={{
                      __html: marked.parse(msg.content)
                    }} />
                  )}
                  {msg.sources && (
                    <div className="sources">
                      {msg.sources.map((src, i) => (
                        <a key={i} href={src.url}>{src.title}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message assistant-message">
                <img src="/logo-icon-only.svg" alt="AI" />
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="ai-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={
                language === 'en'
                  ? 'Ask about tokenomics, services...'
                  : 'Спросите о токеномике, сервисах...'
              }
              maxLength={500}
            />
            <button onClick={sendMessage}>
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="ai-footer">
            <small>Powered by Claude 3.5 Sonnet</small>
          </div>
        </div>
      )}
    </>
  );
}
```

### Option B: Vanilla JavaScript (Recommended for static sites)

```javascript
// public/js/ai-assistant.js
(function() {
  'use strict';

  const API_URL = 'https://api.hypeai.io/api/chat';
  let sessionId = localStorage.getItem('ai-session') || crypto.randomUUID();
  localStorage.setItem('ai-session', sessionId);

  // Create widget HTML
  function createWidget() {
    const container = document.createElement('div');
    container.id = 'ai-assistant-root';
    container.innerHTML = `
      <!-- Bubble -->
      <button id="ai-bubble" class="ai-bubble" aria-label="Open AI Assistant">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      </button>

      <!-- Window (hidden by default) -->
      <div id="ai-window" class="ai-window" style="display: none;">
        <!-- Header -->
        <div class="ai-header">
          <div class="header-left">
            <img src="/logo-icon-only.svg" alt="HypeAI">
            <div>
              <h4>HypeAI Assistant</h4>
              <span class="status">🟢 Online</span>
            </div>
          </div>
          <div class="header-right">
            <select id="language-select">
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
            <button id="close-chat">×</button>
          </div>
        </div>

        <!-- Messages -->
        <div id="chat-messages" class="ai-messages"></div>

        <!-- Input -->
        <div class="ai-input">
          <input
            type="text"
            id="user-input"
            placeholder="Ask about tokenomics..."
            maxlength="500"
          >
          <button id="send-message">
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

        <!-- Footer -->
        <div class="ai-footer">
          <small>Powered by Claude 3.5 Sonnet</small>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  // Initialize
  function init() {
    createWidget();
    attachEventListeners();
    addWelcomeMessage();
  }

  // Event listeners
  function attachEventListeners() {
    document.getElementById('ai-bubble').addEventListener('click', openChat);
    document.getElementById('close-chat').addEventListener('click', closeChat);
    document.getElementById('send-message').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  // Open/close chat
  function openChat() {
    document.getElementById('ai-bubble').style.display = 'none';
    document.getElementById('ai-window').style.display = 'flex';
  }

  function closeChat() {
    document.getElementById('ai-window').style.display = 'none';
    document.getElementById('ai-bubble').style.display = 'flex';
  }

  // Send message
  async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;

    // Add user message to UI
    addMessage('user', message);
    input.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
      const response = await fetch(`${API_URL}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId,
          language: document.getElementById('language-select').value
        })
      });

      const data = await response.json();
      hideTypingIndicator();
      addMessage('assistant', data.response, data.sources);

    } catch (error) {
      console.error('Chat error:', error);
      hideTypingIndicator();
      addMessage('assistant', 'Sorry, an error occurred. Please try again.');
    }
  }

  // Add message to UI
  function addMessage(role, content, sources = []) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;

    if (role === 'assistant') {
      messageDiv.innerHTML = `
        <img src="/logo-icon-only.svg" alt="AI" class="message-avatar">
        <div class="message-content">
          ${marked.parse(content)}
          ${sources.length ? `
            <div class="sources">
              ${sources.map(s => `<a href="${s.url}">${s.title}</a>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(content)}</div>
      `;
    }

    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
  }

  // Typing indicator
  function showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'message assistant-message';
    indicator.innerHTML = `
      <img src="/logo-icon-only.svg" alt="AI" class="message-avatar">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  // Welcome message
  function addWelcomeMessage() {
    addMessage('assistant', `👋 Hi! I'm the HypeAI Assistant. Ask me anything about:

- 💰 Tokenomics & Private Sale
- 🤖 AI Services & Agents
- 🗺️ Roadmap & Team
- 📜 Smart Contracts`);
  }

  // Utility
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
```

### CSS Styling (Cosmic Theme)

```css
/* public/css/ai-assistant.css */

/* Variables matching HypeAI brand */
:root {
  --cosmic-purple: #9333ea;
  --cosmic-blue: #3b82f6;
  --cosmic-yellow: #FFE900;
  --bg-dark: #0a0118;
  --surface: #141933;
  --surface-light: #1D2440;
  --text-primary: #E4E7EB;
  --text-secondary: #9CA3AF;
  --border: rgba(228, 231, 235, 0.1);
}

/* Bubble */
.ai-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cosmic-purple), var(--cosmic-blue));
  border: none;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(147, 51, 234, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 1500;
}

.ai-bubble:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(147, 51, 234, 0.6);
}

.ai-bubble svg {
  width: 32px;
  height: 32px;
}

/* Window */
.ai-window {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 400px;
  height: 600px;
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  z-index: 1500;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, var(--cosmic-purple), var(--cosmic-blue));
  border-radius: 16px 16px 0 0;
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left img {
  width: 40px;
  height: 40px;
}

.header-left h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Space Grotesk', sans-serif;
}

.status {
  font-size: 12px;
  opacity: 0.9;
}

.header-right {
  display: flex;
  gap: 8px;
}

.header-right select {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.header-right button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s;
}

.header-right button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Messages */
.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--surface);
}

.message {
  display: flex;
  gap: 12px;
  max-width: 85%;
}

.user-message {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.message-content {
  background: var(--surface-light);
  padding: 12px 16px;
  border-radius: 12px;
  color: var(--text-primary);
  line-height: 1.5;
}

.user-message .message-content {
  background: linear-gradient(135deg, var(--cosmic-purple), var(--cosmic-blue));
  color: white;
}

.message-content ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.message-content li {
  margin: 4px 0;
}

.sources {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sources a {
  color: var(--cosmic-yellow);
  text-decoration: none;
  font-size: 13px;
  padding: 4px 8px;
  background: rgba(255, 233, 0, 0.1);
  border-radius: 4px;
  transition: background 0.2s;
}

.sources a:hover {
  background: rgba(255, 233, 0, 0.2);
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Input */
.ai-input {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: var(--surface);
  border-top: 1px solid var(--border);
}

.ai-input input {
  flex: 1;
  background: var(--surface-light);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
}

.ai-input input::placeholder {
  color: var(--text-secondary);
}

.ai-input button {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--cosmic-purple), var(--cosmic-blue));
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.ai-input button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
}

.ai-input button svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

/* Footer */
.ai-footer {
  padding: 8px 16px;
  text-align: center;
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 12px;
  border-radius: 0 0 16px 16px;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .ai-window {
    width: calc(100vw - 32px);
    height: calc(100vh - 100px);
    bottom: 16px;
    right: 16px;
  }
}

/* Scrollbar styling */
.ai-messages::-webkit-scrollbar {
  width: 6px;
}

.ai-messages::-webkit-scrollbar-track {
  background: transparent;
}

.ai-messages::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.ai-messages::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
```

---

## 🔒 Security & Performance

### Rate Limiting

```javascript
// Implement rate limiting per IP
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: {
    error: 'Too many requests, please slow down.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/chat', chatLimiter);

// Per-session stricter limit
const sessionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20, // 20 messages per minute per session
  keyGenerator: (req) => req.body.sessionId || req.ip,
  message: {
    error: 'You are sending messages too quickly. Please wait.'
  }
});

app.post('/api/chat/message', sessionLimiter, chatController);
```

### Input Validation

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/chat/message', [
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be 1-500 characters'),
  body('sessionId')
    .isUUID()
    .withMessage('Invalid session ID'),
  body('language')
    .isIn(['en', 'ru'])
    .withMessage('Invalid language')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process request...
});
```

### Content Security Policy

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.anthropic.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'none'"]
    }
  }
}));
```

### DDoS Protection

```javascript
// Use Cloudflare or similar CDN with DDoS protection
// + implement request throttling

const slowDown = require('express-slow-down');

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes
  delayMs: 500 // Add 500ms delay per request above 50
});

app.use('/api/chat', speedLimiter);
```

---

## 📊 Analytics & Monitoring

### Metrics to Track

1. **Usage Metrics**
   - Total conversations
   - Messages per conversation (avg)
   - Active users (daily/weekly/monthly)
   - Response time (p50, p95, p99)
   - Error rate

2. **Content Metrics**
   - Most asked questions (top 10)
   - Topics distribution (tokenomics, services, presale, etc.)
   - Language distribution (EN vs RU)
   - Conversation length (avg)

3. **Quality Metrics**
   - Feedback scores (thumbs up/down)
   - Abandonment rate
   - Follow-up question rate
   - Knowledge base coverage

### Implementation with Plausible/Mixpanel

```javascript
// Track events
function trackEvent(eventName, properties) {
  // Option A: Plausible (privacy-friendly)
  if (window.plausible) {
    window.plausible(eventName, { props: properties });
  }

  // Option B: Mixpanel
  if (window.mixpanel) {
    window.mixpanel.track(eventName, properties);
  }
}

// Track conversation start
trackEvent('AI Chat Opened', {
  page: window.location.pathname,
  language: navigator.language
});

// Track message sent
trackEvent('AI Message Sent', {
  messageLength: message.length,
  language: currentLanguage
});

// Track feedback
trackEvent('AI Feedback', {
  rating: 'positive',
  topic: 'tokenomics'
});
```

### Database Schema for Analytics

```sql
-- Chat sessions table
create table chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  language text default 'en',
  started_at timestamp default now(),
  ended_at timestamp,
  message_count int default 0,
  feedback_score int, -- -1 (negative), 0 (neutral), 1 (positive)
  user_agent text,
  ip_address inet
);

-- Chat messages table
create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references chat_sessions(id) on delete cascade,
  role text check (role in ('user', 'assistant')),
  content text not null,
  language text default 'en',
  response_time_ms int,
  tokens_used int,
  confidence_score float,
  sources jsonb,
  created_at timestamp default now()
);

-- Popular questions (aggregated)
create table popular_questions (
  id serial primary key,
  question_text text unique not null,
  category text,
  language text,
  count int default 1,
  avg_response_time_ms int,
  avg_confidence float,
  last_asked_at timestamp default now()
);

-- Feedback table
create table chat_feedback (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid references chat_messages(id),
  rating text check (rating in ('positive', 'negative')),
  comment text,
  created_at timestamp default now()
);
```

---

## 💰 Cost Estimates

### Infrastructure Costs (Monthly)

| Component | Provider | Cost |
|-----------|----------|------|
| **AI API** | Anthropic Claude 3.5 Sonnet | $50-200 |
| **Vector Database** | Supabase (Free/Pro) | $0-25 |
| **Backend Hosting** | Vercel/Railway | $0-20 |
| **CDN/DDoS** | Cloudflare (Free) | $0 |
| **Monitoring** | Sentry (Free) | $0 |
| **Total** | | **$50-245/month** |

### AI Cost Breakdown

**Claude 3.5 Sonnet Pricing:**
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

**Scenario: 10,000 conversations/month**
- Avg 5 messages per conversation = 50,000 messages
- Avg input: 1,500 tokens/message (context + query)
- Avg output: 500 tokens/message (response)

**Cost Calculation:**
- Input tokens: 50,000 × 1,500 = 75M tokens = $225
- Output tokens: 50,000 × 500 = 25M tokens = $375
- **Total AI cost: ~$600/month**

**Cost Optimization Strategies:**
1. **Cache common questions** (reduce by 30-40%) → **$360-420/month**
2. **Smaller context window** (reduce input tokens by 50%) → **$300/month**
3. **Rate limiting** (prevent abuse) → **$250/month**

**Optimized cost: $100-150/month for 10K conversations**

---

## 🚀 Implementation Phases

### Phase 1: MVP (Week 1-2)

**Goal:** Basic functional assistant

**Tasks:**
- [ ] Set up Supabase database (vector store)
- [ ] Ingest critical documents (tokenomics, services, presale)
- [ ] Create basic backend API (Node.js + Express)
- [ ] Integrate Claude 3.5 Sonnet API
- [ ] Build simple chat widget UI (vanilla JS)
- [ ] Deploy to Vercel/Railway
- [ ] Test with 10-20 sample questions

**Deliverables:**
- Working chat widget on homepage
- Answers 80% of common questions accurately
- English language only

### Phase 2: Production Ready (Week 3-4)

**Goal:** Full-featured, production-ready assistant

**Tasks:**
- [ ] Add Russian language support
- [ ] Implement conversation history
- [ ] Add feedback system (thumbs up/down)
- [ ] Improve UI (animations, typing indicators)
- [ ] Add rate limiting and security
- [ ] Set up monitoring (Sentry)
- [ ] Performance optimization (caching)
- [ ] Mobile testing and fixes

**Deliverables:**
- Multilingual support (EN/RU)
- 24/7 availability
- < 2s response time
- Mobile-friendly

### Phase 3: Analytics & Optimization (Week 5-6)

**Goal:** Data-driven improvements

**Tasks:**
- [ ] Implement analytics tracking
- [ ] Create admin dashboard
- [ ] Analyze popular questions
- [ ] Expand knowledge base based on gaps
- [ ] A/B test UI variations
- [ ] Optimize AI prompts
- [ ] Add suggested questions
- [ ] Performance benchmarking

**Deliverables:**
- Analytics dashboard
- 95% question coverage
- Optimized costs

### Phase 4: Advanced Features (Week 7-8)

**Goal:** Enhanced user experience

**Tasks:**
- [ ] Voice input support
- [ ] Integration with Telegram bot
- [ ] Multi-turn conversations (context)
- [ ] Personalization (user preferences)
- [ ] Smart notifications
- [ ] Advanced search
- [ ] Export conversations

**Deliverables:**
- Voice-enabled assistant
- Cross-platform support
- Enhanced UX

---

## 📋 Technical Requirements

### Frontend Requirements

- **Framework:** Vanilla JS or React
- **Build Tool:** Webpack/Vite (if using React)
- **CSS:** Custom CSS matching HypeAI theme
- **Dependencies:**
  - `marked.js` for Markdown parsing
  - `dompurify` for XSS protection
  - `uuid` for session IDs

### Backend Requirements

- **Runtime:** Node.js 18+ or Python 3.10+
- **Framework:** Express.js or FastAPI
- **Database:** PostgreSQL 14+ (Supabase)
- **Vector Extension:** pgvector
- **Dependencies:**
  - `@anthropic-ai/sdk` for Claude API
  - `@supabase/supabase-js` for database
  - `express-rate-limit` for rate limiting
  - `helmet` for security headers
  - `cors` for CORS handling

### Environment Variables

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx
OPENAI_API_KEY=sk-xxx (for embeddings)
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://hypeai.io,https://www.hypeai.io
```

---

## 🔍 Testing Strategy

### Unit Tests

```javascript
// tests/ai-assistant.test.js
const request = require('supertest');
const app = require('../server');

describe('AI Assistant API', () => {
  test('POST /api/chat/message - should return valid response', async () => {
    const response = await request(app)
      .post('/api/chat/message')
      .send({
        message: 'What is the staking APY?',
        sessionId: 'test-session-123',
        language: 'en'
      })
      .expect(200);

    expect(response.body).toHaveProperty('response');
    expect(response.body).toHaveProperty('sources');
    expect(response.body.response).toContain('62%');
  });

  test('POST /api/chat/message - should reject invalid input', async () => {
    await request(app)
      .post('/api/chat/message')
      .send({
        message: '', // Empty message
        sessionId: 'test-session-123'
      })
      .expect(400);
  });

  test('POST /api/chat/message - should handle rate limiting', async () => {
    // Send 101 requests (over limit)
    for (let i = 0; i < 101; i++) {
      await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Test',
          sessionId: 'test-session-123'
        });
    }

    // 101st request should be rate limited
    await request(app)
      .post('/api/chat/message')
      .send({
        message: 'Test',
        sessionId: 'test-session-123'
      })
      .expect(429);
  });
});
```

### Integration Tests

```javascript
// tests/knowledge-base.test.js
describe('Knowledge Base Integration', () => {
  test('Should answer tokenomics questions', async () => {
    const questions = [
      'What is the total supply?',
      'How does staking work?',
      'What is the private sale price?',
      'How many AI agents are there?'
    ];

    for (const question of questions) {
      const response = await chatAPI.sendMessage(question);
      expect(response.confidence).toBeGreaterThan(0.8);
      expect(response.sources.length).toBeGreaterThan(0);
    }
  });

  test('Should handle multilingual queries', async () => {
    const ruQuestion = 'Какой total supply?';
    const response = await chatAPI.sendMessage(ruQuestion, 'ru');

    expect(response.response).toContain('10');
    expect(response.response).toContain('миллиард');
  });
});
```

### E2E Tests

```javascript
// tests/e2e/chat-widget.spec.js (Playwright)
const { test, expect } = require('@playwright/test');

test('Chat widget interaction', async ({ page }) => {
  await page.goto('https://hypeai.io');

  // Open chat
  await page.click('#ai-bubble');
  await expect(page.locator('#ai-window')).toBeVisible();

  // Send message
  await page.fill('#user-input', 'What is the staking APY?');
  await page.click('#send-message');

  // Wait for response
  await page.waitForSelector('.assistant-message:last-child');
  const response = await page.locator('.assistant-message:last-child').textContent();

  expect(response).toContain('62%');
  expect(response.length).toBeGreaterThan(50); // Non-empty response
});
```

---

## 📚 Documentation & Handoff

### Developer Documentation

Create `/docs/AI_ASSISTANT_DEVELOPER_GUIDE.md` with:
- Setup instructions
- API reference
- Deployment guide
- Troubleshooting
- Knowledge base update process

### User Documentation

Create `/docs/AI_ASSISTANT_USER_GUIDE.md` with:
- How to use the assistant
- Example questions
- Language switching
- Privacy policy

### Admin Documentation

Create `/docs/AI_ASSISTANT_ADMIN_GUIDE.md` with:
- Monitoring dashboard
- Analytics interpretation
- Knowledge base management
- Cost optimization tips

---

## ✅ Success Criteria

### Functional Requirements
- ✅ Answers 95% of common questions accurately
- ✅ Response time < 2 seconds (p95)
- ✅ Supports English and Russian
- ✅ Works on mobile and desktop
- ✅ 99.9% uptime

### Quality Requirements
- ✅ User satisfaction > 80% (thumbs up rate)
- ✅ Zero critical security vulnerabilities
- ✅ WCAG AA accessibility compliance
- ✅ < 5% error rate

### Business Requirements
- ✅ Reduces support inquiries by 50%
- ✅ Operating cost < $200/month
- ✅ Integration time < 2 weeks
- ✅ Easy knowledge base updates

---

## 🚧 Future Enhancements

### V2 Features (3-6 months)
- Voice input/output
- Multi-language support (Chinese, Spanish)
- Integration with Telegram/Discord bots
- Personalized recommendations
- Transaction assistance (buy tokens)
- Advanced analytics dashboard

### V3 Features (6-12 months)
- AI-powered content generation
- Predictive support (proactive suggestions)
- Integration with wallet (Web3)
- Advanced conversation memory
- A/B testing framework
- Custom training on user feedback

---

## 📞 Support & Maintenance

### Ongoing Maintenance Tasks

**Daily:**
- Monitor error rates
- Check response times
- Review user feedback

**Weekly:**
- Analyze popular questions
- Update knowledge base
- Review and optimize costs

**Monthly:**
- Performance review
- Cost analysis
- Feature prioritization
- Model fine-tuning

### Escalation Process

1. **Technical Issues:** Contact backend developer
2. **AI Quality Issues:** Review prompt engineering
3. **Security Issues:** Immediate escalation to CTO
4. **Cost Issues:** Review usage patterns and optimize

---

## 📝 Appendix

### Glossary

- **RAG:** Retrieval Augmented Generation - AI technique combining knowledge base search with LLM generation
- **Embedding:** Vector representation of text for semantic search
- **Vector Database:** Database optimized for similarity search on embeddings
- **pgvector:** PostgreSQL extension for vector operations
- **APY:** Annual Percentage Yield
- **TGE:** Token Generation Event

### References

- [Claude 3.5 Sonnet Documentation](https://docs.anthropic.com/claude/docs)
- [Supabase Vector Documentation](https://supabase.com/docs/guides/ai/vector-indexes)
- [HypeAI Project Knowledge Base](/docs/PROJECT_KNOWLEDGE_BASE.md)
- [HypeAI Tokenomics](/docs/tokenomics.md)

---

**Document Status:** ✅ Complete and Production-Ready
**Last Updated:** 2025-10-25
**Next Review:** 2025-11-25

**Prepared by:** System Architecture Team
**Approved for Implementation:** ✅ Ready to build

---

## 🎯 Quick Start Commands

```bash
# Backend setup
cd backend/ai-assistant
npm install
cp .env.example .env
# Configure environment variables
npm run dev

# Frontend integration
# Add to website/index.html:
<link rel="stylesheet" href="/css/ai-assistant.css">
<script src="/js/ai-assistant.js"></script>

# Knowledge base ingestion
npm run ingest-docs

# Deploy
vercel deploy --prod
```

---

**END OF ARCHITECTURE DOCUMENT**
