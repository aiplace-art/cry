# Frontend Integration Guide - Groq API

## Overview

This guide explains how the Diamond AI Chat integrates with the Groq API backend while maintaining fallback support for offline/error scenarios.

## Architecture

```
User Message
    ↓
DiamondChatController.generateResponse()
    ↓
API Request (/api/chat) with retry logic (3 attempts)
    ↓
Success? → Display Groq response
    ↓
Error? → Show error message + Fallback to knowledge base
```

## Key Features

### 1. API Integration

**Endpoint**: `POST /api/chat`

**Request Payload**:
```json
{
  "message": "User's question",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response**:
```json
{
  "message": "AI response text"
}
```

### 2. Error Handling

The system handles multiple error scenarios:

- **Network Errors**: Detects `!navigator.onLine`
- **Rate Limiting**: HTTP 429 status
- **Server Errors**: HTTP 500+ status
- **Timeouts**: 30-second timeout with AbortController
- **General API Errors**: Any other HTTP error

### 3. Retry Logic

- **Max Retries**: 3 attempts
- **Backoff Strategy**: Exponential (1s, 2s, 3s)
- **No Retry**: Rate limit errors and timeouts

### 4. Fallback System

When API fails, the system:
1. Shows user-friendly error message
2. Waits 500ms
3. Generates response from local knowledge base
4. Uses same logic as before API integration

### 5. Conversation Context

- **History Size**: Last 10 messages
- **Format**: `{ role: 'user'|'assistant', content: '...' }`
- **Sent with every request** for context-aware responses

## Error Messages (Russian)

```javascript
{
  network: '❌ Ошибка сети. Проверьте подключение к интернету.',
  rateLimit: '⏰ Слишком много запросов. Подождите минуту.',
  serverError: '🔧 Временные технические работы. Используем локальную базу знаний...',
  timeout: '⏱️ Превышено время ожидания. Используем локальную базу знаний...',
  generic: '⚠️ API временно недоступен. Используем локальную базу знаний...'
}
```

## Methods Changed

### `generateResponse(userMessage)` → `async generateResponse(userMessage)`

Now asynchronous with:
- API call with fetch()
- AbortController for timeout
- Retry logic with exponential backoff
- Error handling and fallback

### `getFallbackResponse(userMessage)` (NEW)

Contains all original keyword-matching logic from `generateResponse()`.
Used when API is unavailable.

### `clearConversation()` (NEW)

Clears chat history and resets UI to empty state.

## Testing Scenarios

### 1. Successful API Call
```javascript
// Should display Groq response
// No fallback triggered
```

### 2. Network Offline
```javascript
// Shows: "❌ Ошибка сети..."
// Triggers: Fallback response
```

### 3. Rate Limit (429)
```javascript
// Shows: "⏰ Слишком много запросов..."
// No retry
// Triggers: Fallback response
```

### 4. Server Error (500)
```javascript
// Shows: "🔧 Временные технические работы..."
// Retries: 3 times with backoff
// Triggers: Fallback response
```

### 5. Timeout (30s)
```javascript
// Shows: "⏱️ Превышено время ожидания..."
// No retry
// Triggers: Fallback response
```

### 6. Multi-turn Conversation
```javascript
// Sends last 10 messages as context
// Groq maintains conversation flow
```

## Analytics Events

```javascript
// Success
trackEvent('ai_response_success', { attempt: 1-3 });

// Error
trackEvent('ai_response_error', { error: 'error message' });

// Conversation cleared
trackEvent('conversation_cleared');
```

## Backward Compatibility

✅ **100% backward compatible**:
- If `/api/chat` endpoint doesn't exist → fallback works
- If Groq API is down → fallback works
- If no internet → fallback works
- All original keyword matching preserved

## Frontend Files Modified

1. **`/public/variant-2/js/ai-chat-diamond.js`**
   - Modified: `generateResponse()` → API integration
   - Added: `getFallbackResponse()` → Original logic
   - Added: `clearConversation()` → Chat reset

## Backend Requirements

The backend must provide:

```javascript
POST /api/chat
Content-Type: application/json

{
  "message": "string",
  "conversationHistory": [
    { "role": "user"|"assistant", "content": "string" }
  ]
}
```

Response:
```javascript
{
  "message": "string"
}
```

## Example Usage

```javascript
// User types: "Что такое HypeAI?"

// 1. API Call
fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: "Что такое HypeAI?",
    conversationHistory: []
  })
})

// 2. Success Response
{
  "message": "HypeAI - это децентрализованная платформа AI агентов..."
}

// 3. Display to user
addMessage("HypeAI - это децентрализованная платформа...", 'ai');
```

## Testing

See test file: `/public/variant-2/test-groq-integration.html`

Run local server:
```bash
cd public/variant-2
python3 -m http.server 8000
```

Open: `http://localhost:8000/test-groq-integration.html`

## Performance Metrics

- **Timeout**: 30 seconds per attempt
- **Max Retries**: 3 attempts
- **Total Max Time**: ~90 seconds (worst case)
- **Fallback Delay**: 500ms
- **Network Check**: Instant (`navigator.onLine`)

## Future Enhancements

1. **Streaming Responses**: Use Server-Sent Events
2. **Typing Animation**: Show response as it streams
3. **Response Caching**: Cache common questions
4. **Context Pruning**: Smart history compression
5. **Retry UI**: Show retry button to user
6. **Status Indicator**: Show "Using AI" vs "Using fallback"

## Support

For issues, contact backend team or check:
- API endpoint status: `/api/health`
- Groq API status: https://status.groq.com
- Console logs: `window.diamondChat.messages`
