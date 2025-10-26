# HypeAI AI Assistant - System Architecture

Complete technical architecture for the AI Assistant backend API.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     HypeAI AI Assistant System                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │────────▶│  API Server  │────────▶│   Claude AI  │
│   (React/    │  HTTPS  │  (Express)   │  HTTPS  │   (Anthropic)│
│    HTML)     │◀────────│   Port 3001  │◀────────│   GPT Model  │
└──────────────┘         └──────────────┘         └──────────────┘
                                │
                                │ reads
                                ▼
                         ┌──────────────┐
                         │  Knowledge   │
                         │     Base     │
                         │  (Markdown)  │
                         └──────────────┘
```

## Component Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                      Express.js API Server                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Rate Limiter   │  │   CORS Guard    │  │  Helmet Shield  │  │
│  │  (10 req/min)   │  │  (Origin Check) │  │ (Security Hdrs) │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                    │                     │            │
│           └────────────────────┼─────────────────────┘            │
│                                ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                   Request Router                          │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │  GET  /health         → Health Check                     │    │
│  │  POST /chat           → AI Assistant Chat                │    │
│  │  POST /feedback       → User Feedback                    │    │
│  │  POST /session/clear  → Clear Session                    │    │
│  │  GET  /analytics      → Usage Statistics                 │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                │                                   │
│                                ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                   Session Manager                         │    │
│  │  • In-memory session storage (Map)                       │    │
│  │  • UUID-based session IDs                                │    │
│  │  • 1-hour timeout                                         │    │
│  │  • Max 20 messages per session                           │    │
│  │  • Automatic cleanup                                     │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                │                                   │
│                                ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                  RAG System (Knowledge Base)              │    │
│  │  • Load PROJECT_KNOWLEDGE_BASE.md on startup             │    │
│  │  • Keyword extraction from user query                    │    │
│  │  • Semantic search (keyword matching)                    │    │
│  │  • Context injection into prompt                         │    │
│  │  • Grounded responses (no hallucination)                 │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                │                                   │
│                                ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              Anthropic Claude Integration                 │    │
│  │  • Model: claude-3-5-sonnet-20241022                     │    │
│  │  • Temperature: 0.7                                       │    │
│  │  • Max tokens: 4096                                       │    │
│  │  • System prompt + context + history                     │    │
│  │  • Error handling (rate limits, API errors)              │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                │                                   │
│                                ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                   Analytics Logger                        │    │
│  │  • Log all queries to JSON file                          │    │
│  │  • Track response times                                   │    │
│  │  • Monitor token usage                                    │    │
│  │  • Record user feedback                                   │    │
│  │  • Identify popular questions                            │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## Request Flow

See full documentation at `/Users/ai.place/Crypto/server/README_API.md`

---

**Status:** Production Ready
**Version:** 1.0.0
