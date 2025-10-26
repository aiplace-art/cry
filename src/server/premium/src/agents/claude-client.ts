import Anthropic from '@anthropic-ai/sdk';
import { config } from '@core/config.js';
import { Logger } from '@core/logger.js';

const logger = new Logger('ClaudeClient');

export interface StreamChunk {
  type: 'text' | 'thinking' | 'error' | 'done';
  content: string;
  metadata?: Record<string, any>;
}

export interface ChatCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stream?: boolean;
}

export class ClaudeClient {
  private client: Anthropic;
  private defaultModel = 'claude-3-5-sonnet-20241022';

  constructor() {
    this.client = new Anthropic({
      apiKey: config.anthropicApiKey,
    });

    logger.info('Claude client initialized');
  }

  /**
   * Send chat message with streaming support
   */
  async *chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    options: ChatCompletionOptions = {}
  ): AsyncGenerator<StreamChunk> {
    const {
      model = this.defaultModel,
      maxTokens = 4096,
      temperature = 1.0,
      systemPrompt,
      stream = true,
    } = options;

    try {
      logger.debug('Sending chat request', {
        model,
        messageCount: messages.length,
        stream,
      });

      if (stream) {
        const streamResponse = await this.client.messages.stream({
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        });

        for await (const event of streamResponse) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            yield {
              type: 'text',
              content: event.delta.text,
            };
          }

          if (event.type === 'message_stop') {
            yield {
              type: 'done',
              content: '',
              metadata: {
                usage: {
                  inputTokens: streamResponse.usage?.input_tokens || 0,
                  outputTokens: streamResponse.usage?.output_tokens || 0,
                },
              },
            };
          }
        }
      } else {
        const response = await this.client.messages.create({
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        });

        const textContent = response.content
          .filter(block => block.type === 'text')
          .map(block => (block as any).text)
          .join('');

        yield {
          type: 'text',
          content: textContent,
        };

        yield {
          type: 'done',
          content: '',
          metadata: {
            usage: {
              inputTokens: response.usage.input_tokens,
              outputTokens: response.usage.output_tokens,
            },
          },
        };
      }

      logger.debug('Chat request completed');
    } catch (error) {
      logger.error('Chat request failed', error);
      yield {
        type: 'error',
        content: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Count tokens in text (approximate)
   */
  async countTokens(text: string): Promise<number> {
    try {
      const response = await this.client.messages.count_tokens({
        model: this.defaultModel,
        messages: [{ role: 'user', content: text }],
      });

      return response.input_tokens;
    } catch (error) {
      logger.error('Token counting failed', error);
      // Fallback: rough estimation (1 token ≈ 4 characters)
      return Math.ceil(text.length / 4);
    }
  }

  /**
   * Generate suggestions based on context
   */
  async generateSuggestions(
    context: string,
    count = 3
  ): Promise<string[]> {
    try {
      const prompt = `Based on this conversation context, generate ${count} helpful follow-up questions or suggestions:

Context:
${context}

Respond with ONLY a JSON array of strings, no other text.`;

      const response = await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = response.content
        .filter(block => block.type === 'text')
        .map(block => (block as any).text)
        .join('');

      const suggestions = JSON.parse(textContent);
      return Array.isArray(suggestions) ? suggestions.slice(0, count) : [];
    } catch (error) {
      logger.error('Failed to generate suggestions', error);
      return [];
    }
  }

  /**
   * Analyze sentiment of message
   */
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
  }> {
    try {
      const prompt = `Analyze the sentiment of this message and respond with ONLY a JSON object:
{"sentiment": "positive|neutral|negative", "confidence": 0.0-1.0}

Message: ${text}`;

      const response = await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = response.content
        .filter(block => block.type === 'text')
        .map(block => (block as any).text)
        .join('');

      return JSON.parse(textContent);
    } catch (error) {
      logger.error('Sentiment analysis failed', error);
      return { sentiment: 'neutral', confidence: 0 };
    }
  }

  /**
   * Check if content is safe (no harmful content)
   */
  async moderateContent(text: string): Promise<{
    safe: boolean;
    categories: string[];
  }> {
    try {
      const prompt = `Analyze this content for harmful, offensive, or inappropriate material. Respond with ONLY a JSON object:
{"safe": true|false, "categories": ["category1", "category2"]}

Categories can include: hate_speech, violence, self_harm, sexual, harassment, spam, misinformation

Content: ${text}`;

      const response = await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = response.content
        .filter(block => block.type === 'text')
        .map(block => (block as any).text)
        .join('');

      return JSON.parse(textContent);
    } catch (error) {
      logger.error('Content moderation failed', error);
      // Fail safe - assume content is safe if moderation fails
      return { safe: true, categories: [] };
    }
  }
}

export const claudeClient = new ClaudeClient();
