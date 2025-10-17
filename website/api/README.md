# HypeAI Backend APIs

This directory contains serverless API endpoints for the HypeAI landing page.

## 📁 Structure

```
api/
├── agents-status.js      # GET /api/agents-status
├── services-inquiry.js   # POST /api/services-inquiry
└── README.md            # This file
```

## 🚀 Quick Start

### Local Development

```bash
# Install Vercel CLI
npm i -g vercel

# Run development server
vercel dev

# APIs available at:
# http://localhost:3000/api/agents-status
# http://localhost:3000/api/services-inquiry
```

### Environment Setup

```bash
# Copy example env file
cp .env.example .env.local

# Add your email service credentials
EMAIL_FROM=hello@hypeai.io
EMAIL_TO=team@hypeai.io
EMAIL_SERVICE_API_KEY=your_key_here
```

### Deployment

```bash
# Deploy to production
vercel deploy --prod

# Set environment variables
vercel env add EMAIL_FROM
vercel env add EMAIL_TO
vercel env add EMAIL_SERVICE_API_KEY
```

## 📚 Documentation

- **API Reference:** `/docs/API_DOCUMENTATION.md`
- **Integration Guide:** `/docs/BACKEND_INTEGRATION_GUIDE.md`
- **Technical Analysis:** `/docs/BACKEND_ANALYSIS.md`
- **Delivery Summary:** `/docs/BACKEND_DELIVERY_SUMMARY.md`

## 🧪 Testing

### Test Agent Status

```bash
curl http://localhost:3000/api/agents-status
```

### Test Services Inquiry

```bash
curl -X POST http://localhost:3000/api/services-inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "service": "consulting",
    "budget": "10k-50k",
    "message": "This is a test inquiry"
  }'
```

## 🛡️ Security

- ✅ Rate limiting (5 requests/hour per IP)
- ✅ Input validation & sanitization
- ✅ XSS protection
- ✅ CORS configured
- ✅ Environment variables for secrets

## 📊 Performance

- **Agent Status:** Cached (5 min), <50ms response
- **Services Inquiry:** <200ms response, rate limited

## 🔧 Maintenance

### Update Agent Status Data

Edit `/api/agents-status.js`:

```javascript
function getAgentStatus() {
  return {
    totalAgents: 8,
    activeAgents: 8,
    // ... update metrics here
  };
}
```

### Update Rate Limits

Edit `/api/services-inquiry.js`:

```javascript
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;
```

### Add Email Service

Install package:

```bash
npm install @sendgrid/mail
# or
npm install resend
```

Update email function in `/api/services-inquiry.js`:

```javascript
async function sendEmail(inquiry) {
  // Add your email service integration here
}
```

## 📞 Support

- **Issues:** Check Vercel logs with `vercel logs`
- **Documentation:** See `/docs/` directory
- **Questions:** Contact dev team

---

**Built by NEXUS (Backend Developer Agent)**
**HypeAI - Where AI Meets Opportunity**
