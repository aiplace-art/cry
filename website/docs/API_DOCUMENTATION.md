# HypeAI API Documentation

**Version:** 1.0.0
**Base URL:** `/api` (relative to website domain)
**Last Updated:** October 17, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Endpoints](#endpoints)
   - [Agent Status](#get-apiagentstatus)
   - [Services Inquiry](#post-apiservicesinquiry)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Overview

The HypeAI API provides backend services for the landing page, including:
- Real-time agent status monitoring
- Service inquiry form submissions

All endpoints return JSON responses and use standard HTTP status codes.

---

## Authentication

Currently, all endpoints are **public** and do not require authentication.

Future endpoints may require API keys or wallet signatures.

---

## Rate Limiting

### Global Limits:
- **Agent Status:** No limit (cached response)
- **Services Inquiry:** 5 requests per hour per IP

### Rate Limit Headers:
```
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 2025-10-17T17:30:00Z
```

### Rate Limit Response (429):
```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Please wait before submitting another inquiry",
  "resetTime": "2025-10-17T17:30:00Z",
  "remainingRequests": 0
}
```

---

## Endpoints

### GET /api/agents-status

Returns live status of AI agents working on the platform.

**Response is cached for 5 minutes** to reduce server load.

#### Request

```bash
GET /api/agents-status
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "totalAgents": 8,
    "activeAgents": 8,
    "agentDetails": [
      {
        "name": "Researcher",
        "status": "active",
        "tasksCompleted": 247
      },
      {
        "name": "Architect",
        "status": "active",
        "tasksCompleted": 189
      }
      // ... more agents
    ],
    "totalTasksCompleted": 1447,
    "uptime": "99.9%",
    "lastUpdate": "2025-10-17T16:30:00Z",
    "systemHealth": "optimal",
    "averageResponseTime": "1.2s",
    "successRate": "98.7%"
  },
  "cached": true,
  "cacheAge": 120,
  "nextUpdate": 180
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Request success status |
| `data` | object | Agent status data |
| `data.totalAgents` | number | Total number of agents |
| `data.activeAgents` | number | Currently active agents |
| `data.agentDetails` | array | Details for each agent |
| `data.totalTasksCompleted` | number | Total tasks completed |
| `data.uptime` | string | System uptime percentage |
| `data.lastUpdate` | string | ISO timestamp of last update |
| `cached` | boolean | Whether response is from cache |
| `cacheAge` | number | Cache age in seconds |
| `nextUpdate` | number | Seconds until cache refresh |

#### Frontend Example

```javascript
async function fetchAgentStatus() {
  try {
    const response = await fetch('/api/agents-status');
    const result = await response.json();

    if (result.success) {
      console.log('Total Tasks:', result.data.totalTasksCompleted);
      console.log('Uptime:', result.data.uptime);
    }
  } catch (error) {
    console.error('Failed to fetch agent status:', error);
  }
}
```

---

### POST /api/services-inquiry

Submit a service inquiry form.

**Rate Limited:** 5 requests per hour per IP address.

#### Request

```bash
POST /api/services-inquiry
Content-Type: application/json
```

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "service": "custom-ai-agents",
  "budget": "10k-50k",
  "message": "I'm interested in building custom AI trading bots for my platform."
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Full name (min 2 chars) |
| `email` | string | ✅ | Valid email address |
| `service` | string | ✅ | Service type (see valid values below) |
| `budget` | string | ✅ | Budget range (see valid values below) |
| `message` | string | ✅ | Inquiry message (min 10 chars) |

#### Valid Service Types

- `custom-ai-agents`
- `trading-bot-development`
- `smart-contract-audit`
- `defi-platform-development`
- `ai-integration`
- `consulting`
- `other`

#### Valid Budget Ranges

- `under-10k`
- `10k-50k`
- `50k-100k`
- `100k-500k`
- `over-500k`
- `not-sure`

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Thank you for your inquiry! We'll contact you within 24 hours.",
  "inquiryId": "inq_1697562000000_abc123xyz",
  "remainingRequests": 4
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Request success status |
| `message` | string | Confirmation message |
| `inquiryId` | string | Unique inquiry identifier |
| `remainingRequests` | number | Remaining rate limit requests |

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "email": "Valid email is required",
    "message": "Message is required (minimum 10 characters)"
  }
}
```

#### Frontend Example

```javascript
async function submitInquiry(formData) {
  try {
    const response = await fetch('/api/services-inquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        service: formData.service,
        budget: formData.budget,
        message: formData.message
      })
    });

    const result = await response.json();

    if (result.success) {
      alert(result.message);
      console.log('Inquiry ID:', result.inquiryId);
    } else {
      // Handle validation errors
      console.error('Errors:', result.errors);
    }
  } catch (error) {
    console.error('Failed to submit inquiry:', error);
  }
}
```

---

## Error Handling

### Standard Error Response

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request data |
| 405 | Method Not Allowed | Wrong HTTP method |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Examples

### React Hook Example

```javascript
// useAgentStatus.js
import { useState, useEffect } from 'react';

export function useAgentStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/agents-status');
        const result = await response.json();

        if (result.success) {
          setStatus(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();

    // Refresh every 5 minutes (aligned with cache)
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { status, loading, error };
}
```

### Service Form Component Example

```javascript
// ServiceInquiryForm.jsx
import { useState } from 'react';

export function ServiceInquiryForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    budget: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/services-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Reset form
        setFormData({ name: '', email: '', service: '', budget: '', message: '' });
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error',
        message: 'Failed to submit inquiry'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Inquiry'}
      </button>

      {result && (
        <div className={result.success ? 'success' : 'error'}>
          {result.message}
        </div>
      )}
    </form>
  );
}
```

### Vanilla JavaScript Example

```javascript
// Fetch agent status
fetch('/api/agents-status')
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      document.getElementById('agent-count').textContent = data.data.totalAgents;
      document.getElementById('tasks-completed').textContent = data.data.totalTasksCompleted;
      document.getElementById('uptime').textContent = data.data.uptime;
    }
  });

// Submit inquiry form
document.getElementById('inquiry-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    service: document.getElementById('service').value,
    budget: document.getElementById('budget').value,
    message: document.getElementById('message').value
  };

  const response = await fetch('/api/services-inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  const result = await response.json();

  if (result.success) {
    alert(result.message);
  } else {
    alert('Error: ' + result.message);
  }
});
```

---

## Deployment

### Vercel Serverless Functions

The API is designed to work as Vercel serverless functions:

```bash
# Deploy to Vercel
vercel deploy

# Functions are automatically available at:
# https://your-domain.com/api/agents-status
# https://your-domain.com/api/services-inquiry
```

### Environment Variables

Required for production:

```bash
EMAIL_FROM=hello@hypeai.io
EMAIL_TO=team@hypeai.io
EMAIL_SERVICE_API_KEY=sg_xxxxxxxxxxxxx
```

Set in Vercel:
```bash
vercel env add EMAIL_FROM
vercel env add EMAIL_TO
vercel env add EMAIL_SERVICE_API_KEY
```

---

## Testing

### Using cURL

```bash
# Test agent status
curl https://your-domain.com/api/agents-status

# Test service inquiry
curl -X POST https://your-domain.com/api/services-inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "service": "consulting",
    "budget": "10k-50k",
    "message": "This is a test inquiry"
  }'
```

### Using Postman

1. Import collection from `tests/api/postman-collection.json`
2. Set environment variable for base URL
3. Run tests

---

## Future Enhancements

### Planned Features:
- ✅ Email service integration (SendGrid/Resend)
- ✅ Database storage for inquiries
- ✅ CAPTCHA integration
- ✅ Webhook notifications
- ✅ Analytics tracking
- ✅ Admin dashboard for inquiries

---

## Support

For API support:
- Email: dev@hypeai.io
- Discord: https://discord.gg/hypeai
- Documentation: https://docs.hypeai.io/api

---

**Built with ❤️ by HypeAI AI Agents**
