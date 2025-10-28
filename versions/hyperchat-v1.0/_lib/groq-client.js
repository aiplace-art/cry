/**
 * Groq API Client
 * Wrapper for Groq Cloud API (Llama 3.3 70B)
 */

class GroqClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Groq API key is required');
    }

    this.apiKey = apiKey;
    this.baseURL = 'https://api.groq.com/openai/v1';
    this.model = 'llama-3.3-70b-versatile';
    this.timeout = 25000; // 25 seconds
  }

  /**
   * Chat completion
   * @param {Array} messages - Array of {role, content} objects
   * @param {Object} options - Generation options
   */
  async chat(messages, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 500,
      topP = 0.9,
      stream = false
    } = options;

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages must be a non-empty array');
    }

    // Count total tokens (approximate)
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 4);

    if (estimatedTokens > 4000) {
      throw new Error('Conversation too long. Please start a new conversation.');
    }

    // Prepare request
    const body = {
      model: this.model,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream: stream
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error('Invalid API key');
        }

        if (response.status === 429) {
          throw new Error('Groq API rate limit exceeded');
        }

        if (response.status >= 500) {
          throw new Error('Groq API server error');
        }

        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Extract response
      if (!data.choices || !data.choices[0]) {
        throw new Error('Invalid API response format');
      }

      const assistantMessage = data.choices[0].message?.content;

      if (!assistantMessage) {
        throw new Error('No response content from API');
      }

      // Log usage
      if (data.usage) {
        console.log(`[Groq] Tokens used: ${data.usage.total_tokens} (prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens})`);
      }

      return assistantMessage;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Groq API took too long to respond');
      }

      throw error;
    }
  }

  /**
   * Test connection
   */
  async test() {
    try {
      const response = await this.chat([
        { role: 'user', content: 'Hi' }
      ], {
        maxTokens: 10
      });

      return {
        success: true,
        response: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = { GroqClient };
