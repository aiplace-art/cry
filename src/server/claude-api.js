/**
 * Claude API Integration
 * Handles streaming responses, context management, rate limiting, and error handling
 */

const Anthropic = require('@anthropic-ai/sdk');
const EventEmitter = require('events');

class ClaudeAPIClient extends EventEmitter {
  constructor(apiKey, options = {}) {
    super();

    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({
      apiKey: apiKey
    });

    this.model = options.model || 'claude-3-5-sonnet-20241022';
    this.maxTokens = options.maxTokens || 4096;
    this.temperature = options.temperature || 1.0;

    // Rate limiting
    this.rateLimiter = {
      maxRequestsPerMinute: options.maxRequestsPerMinute || 50,
      requests: [],
      enabled: options.enableRateLimiting !== false
    };

    // Context management
    this.contexts = new Map(); // sessionId -> conversation history

    // Metrics
    this.metrics = {
      totalRequests: 0,
      totalTokens: 0,
      errors: 0,
      averageResponseTime: 0
    };
  }

  /**
   * Check rate limit before making request
   */
  async checkRateLimit() {
    if (!this.rateLimiter.enabled) return true;

    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old requests
    this.rateLimiter.requests = this.rateLimiter.requests.filter(
      timestamp => timestamp > oneMinuteAgo
    );

    if (this.rateLimiter.requests.length >= this.rateLimiter.maxRequestsPerMinute) {
      const oldestRequest = this.rateLimiter.requests[0];
      const waitTime = 60000 - (now - oldestRequest);
      throw new Error(`Rate limit exceeded. Retry after ${Math.ceil(waitTime / 1000)} seconds`);
    }

    this.rateLimiter.requests.push(now);
    return true;
  }

  /**
   * Get or initialize conversation context
   */
  getContext(sessionId) {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, []);
    }
    return this.contexts.get(sessionId);
  }

  /**
   * Add message to context
   */
  addToContext(sessionId, role, content) {
    const context = this.getContext(sessionId);
    context.push({ role, content });

    // Keep context manageable (last 20 messages)
    if (context.length > 20) {
      context.splice(0, context.length - 20);
    }
  }

  /**
   * Clear context for a session
   */
  clearContext(sessionId) {
    this.contexts.delete(sessionId);
  }

  /**
   * Send streaming message to Claude
   */
  async streamMessage(sessionId, userMessage, systemPrompt = null, onChunk = null) {
    const startTime = Date.now();

    try {
      await this.checkRateLimit();

      // Add user message to context
      this.addToContext(sessionId, 'user', userMessage);
      const conversationHistory = this.getContext(sessionId);

      // Prepare messages (exclude system messages from history)
      const messages = conversationHistory.filter(msg => msg.role !== 'system');

      // Build request
      const requestParams = {
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: messages,
        stream: true
      };

      if (systemPrompt) {
        requestParams.system = systemPrompt;
      }

      // Create streaming request
      const stream = await this.client.messages.create(requestParams);

      let fullResponse = '';
      let inputTokens = 0;
      let outputTokens = 0;

      // Process stream
      for await (const event of stream) {
        if (event.type === 'message_start') {
          inputTokens = event.message?.usage?.input_tokens || 0;
        } else if (event.type === 'content_block_delta') {
          const chunk = event.delta?.text || '';
          fullResponse += chunk;

          // Call chunk callback if provided
          if (onChunk) {
            onChunk({
              chunk,
              fullResponse,
              isComplete: false
            });
          }

          // Emit chunk event
          this.emit('chunk', {
            sessionId,
            chunk,
            fullResponse,
            isComplete: false
          });
        } else if (event.type === 'message_delta') {
          outputTokens = event.usage?.output_tokens || 0;
        } else if (event.type === 'message_stop') {
          // Stream completed
          if (onChunk) {
            onChunk({
              chunk: '',
              fullResponse,
              isComplete: true
            });
          }

          this.emit('chunk', {
            sessionId,
            chunk: '',
            fullResponse,
            isComplete: true
          });
        }
      }

      // Add assistant response to context
      this.addToContext(sessionId, 'assistant', fullResponse);

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(inputTokens + outputTokens, responseTime);

      return {
        success: true,
        response: fullResponse,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens
        },
        responseTime
      };

    } catch (error) {
      this.metrics.errors++;

      console.error('[Claude API] Stream error:', error);

      this.emit('error', {
        sessionId,
        error: error.message,
        code: error.code || 'STREAM_ERROR'
      });

      throw this.formatError(error);
    }
  }

  /**
   * Send non-streaming message to Claude
   */
  async sendMessage(sessionId, userMessage, systemPrompt = null) {
    const startTime = Date.now();

    try {
      await this.checkRateLimit();

      // Add user message to context
      this.addToContext(sessionId, 'user', userMessage);
      const conversationHistory = this.getContext(sessionId);

      // Prepare messages
      const messages = conversationHistory.filter(msg => msg.role !== 'system');

      // Build request
      const requestParams = {
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: messages
      };

      if (systemPrompt) {
        requestParams.system = systemPrompt;
      }

      // Send request
      const response = await this.client.messages.create(requestParams);

      const assistantMessage = response.content[0].text;

      // Add assistant response to context
      this.addToContext(sessionId, 'assistant', assistantMessage);

      // Update metrics
      const responseTime = Date.now() - startTime;
      const totalTokens = response.usage.input_tokens + response.usage.output_tokens;
      this.updateMetrics(totalTokens, responseTime);

      return {
        success: true,
        response: assistantMessage,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens
        },
        responseTime
      };

    } catch (error) {
      this.metrics.errors++;
      console.error('[Claude API] Error:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Format error for consistent handling
   */
  formatError(error) {
    const formattedError = {
      message: error.message || 'Unknown error occurred',
      code: error.code || 'UNKNOWN_ERROR',
      statusCode: error.status || 500,
      details: {}
    };

    // Handle specific error types
    if (error.status === 429) {
      formattedError.code = 'RATE_LIMIT_EXCEEDED';
      formattedError.message = 'Rate limit exceeded. Please try again later.';
    } else if (error.status === 401) {
      formattedError.code = 'INVALID_API_KEY';
      formattedError.message = 'Invalid API key provided.';
    } else if (error.status === 400) {
      formattedError.code = 'INVALID_REQUEST';
      formattedError.details = error.error || {};
    } else if (error.status === 500) {
      formattedError.code = 'SERVER_ERROR';
      formattedError.message = 'Claude API server error. Please try again.';
    }

    return formattedError;
  }

  /**
   * Update metrics
   */
  updateMetrics(tokens, responseTime) {
    this.metrics.totalRequests++;
    this.metrics.totalTokens += tokens;

    // Update average response time
    const prevAvg = this.metrics.averageResponseTime;
    const newAvg = (prevAvg * (this.metrics.totalRequests - 1) + responseTime) / this.metrics.totalRequests;
    this.metrics.averageResponseTime = Math.round(newAvg);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      rateLimitRemaining: this.rateLimiter.maxRequestsPerMinute - this.rateLimiter.requests.length,
      activeContexts: this.contexts.size
    };
  }

  /**
   * Get context size for a session
   */
  getContextSize(sessionId) {
    const context = this.contexts.get(sessionId);
    return context ? context.length : 0;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    return Array.from(this.contexts.keys());
  }

  /**
   * Set model configuration
   */
  setModel(model, maxTokens = null, temperature = null) {
    this.model = model;
    if (maxTokens !== null) this.maxTokens = maxTokens;
    if (temperature !== null) this.temperature = temperature;
  }

  /**
   * Clean up old contexts (for memory management)
   */
  cleanupOldContexts(maxAge = 3600000) { // 1 hour default
    const now = Date.now();
    const sessionsToDelete = [];

    this.contexts.forEach((context, sessionId) => {
      // Check if session has been inactive (implement your own tracking)
      // For now, just a placeholder
      sessionsToDelete.push(sessionId);
    });

    // This is a simple implementation - you might want to track last access time
    // For production, implement proper session management
  }
}

module.exports = ClaudeAPIClient;
