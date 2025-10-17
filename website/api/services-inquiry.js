/**
 * HypeAI - Services Inquiry API
 *
 * Handles service inquiry form submissions
 * Sends email notifications to the team
 * Includes rate limiting and validation
 *
 * POST /api/services-inquiry
 */

// Rate limiting storage (in-memory, use Redis for production)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;

/**
 * Email configuration
 * In production, use environment variables
 */
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'hello@hypeai.io',
  to: process.env.EMAIL_TO || 'team@hypeai.io',
  apiKey: process.env.EMAIL_SERVICE_API_KEY || null
};

/**
 * Service types
 */
const VALID_SERVICES = [
  'custom-ai-agents',
  'trading-bot-development',
  'smart-contract-audit',
  'defi-platform-development',
  'ai-integration',
  'consulting',
  'other'
];

/**
 * Budget ranges
 */
const VALID_BUDGETS = [
  'under-10k',
  '10k-50k',
  '50k-100k',
  '100k-500k',
  'over-500k',
  'not-sure'
];

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check rate limit for IP
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(ip) || [];

  // Remove old requests outside the window
  const recentRequests = userRequests.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: recentRequests[0] + RATE_LIMIT_WINDOW
    };
  }

  // Add current request
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);

  return {
    allowed: true,
    remainingRequests: MAX_REQUESTS_PER_WINDOW - recentRequests.length,
    resetTime: now + RATE_LIMIT_WINDOW
  };
}

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .substring(0, 1000); // Max length
}

/**
 * Send email notification
 * TODO: Integrate with actual email service (SendGrid, Resend, etc.)
 */
async function sendEmail(inquiry) {
  // In production, integrate with email service
  // For now, just log to console

  console.log('📧 New Service Inquiry:');
  console.log('------------------------');
  console.log(`Name: ${inquiry.name}`);
  console.log(`Email: ${inquiry.email}`);
  console.log(`Service: ${inquiry.service}`);
  console.log(`Budget: ${inquiry.budget}`);
  console.log(`Message: ${inquiry.message}`);
  console.log('------------------------');

  // TODO: Implement actual email sending
  // Example with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(EMAIL_CONFIG.apiKey);

  await sgMail.send({
    to: EMAIL_CONFIG.to,
    from: EMAIL_CONFIG.from,
    subject: `New Service Inquiry: ${inquiry.service}`,
    text: `
      Name: ${inquiry.name}
      Email: ${inquiry.email}
      Service: ${inquiry.service}
      Budget: ${inquiry.budget}

      Message:
      ${inquiry.message}
    `,
    html: `<h2>New Service Inquiry</h2>...`
  });
  */

  return true;
}

/**
 * Main handler function
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  // Get client IP for rate limiting
  const clientIp = req.headers['x-forwarded-for'] ||
                   req.headers['x-real-ip'] ||
                   req.connection.remoteAddress;

  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIp);

    if (!rateLimitResult.allowed) {
      const resetDate = new Date(rateLimitResult.resetTime);
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'Please wait before submitting another inquiry',
        resetTime: resetDate.toISOString(),
        remainingRequests: 0
      });
    }

    // Parse and validate request body
    const { name, email, service, budget, message } = req.body;

    // Validation
    const errors = {};

    if (!name || name.trim().length < 2) {
      errors.name = 'Name is required (minimum 2 characters)';
    }

    if (!email || !isValidEmail(email)) {
      errors.email = 'Valid email is required';
    }

    if (!service || !VALID_SERVICES.includes(service)) {
      errors.service = 'Please select a valid service';
    }

    if (!budget || !VALID_BUDGETS.includes(budget)) {
      errors.budget = 'Please select a valid budget range';
    }

    if (!message || message.trim().length < 10) {
      errors.message = 'Message is required (minimum 10 characters)';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: errors
      });
    }

    // Sanitize inputs
    const sanitizedInquiry = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      service: service,
      budget: budget,
      message: sanitizeInput(message),
      timestamp: new Date().toISOString(),
      ip: clientIp
    };

    // Send email
    await sendEmail(sanitizedInquiry);

    // Generate inquiry ID
    const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Thank you for your inquiry! We\'ll contact you within 24 hours.',
      inquiryId: inquiryId,
      remainingRequests: rateLimitResult.remainingRequests - 1
    });

  } catch (error) {
    console.error('Error processing inquiry:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process your inquiry. Please try again later.'
    });
  }
}

/**
 * CORS configuration
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    externalResolver: true,
  },
};
