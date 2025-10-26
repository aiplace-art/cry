import { redis } from '@database/client.js';
import { Logger } from '@core/logger.js';

const logger = new Logger('MessageQueue');

export interface QueuedMessage {
  id: string;
  event: string;
  data: any;
  timestamp: number;
  attempts: number;
}

export class MessageQueue {
  private readonly TTL_MS = 3600000; // 1 hour
  private readonly MAX_ATTEMPTS = 3;

  /**
   * Queue a message for later delivery
   */
  async queueMessage(sessionId: string, message: { event: string; data: any }): Promise<void> {
    const queuedMessage: QueuedMessage = {
      id: crypto.randomUUID(),
      event: message.event,
      data: message.data,
      timestamp: Date.now(),
      attempts: 0,
    };

    const key = this.getQueueKey(sessionId);
    await redis.getClient().lpush(key, JSON.stringify(queuedMessage));
    await redis.getClient().expire(key, Math.ceil(this.TTL_MS / 1000));

    logger.debug('Message queued', { sessionId, messageId: queuedMessage.id, event: message.event });
  }

  /**
   * Get all queued messages for a session
   */
  async getMessages(sessionId: string): Promise<QueuedMessage[]> {
    const key = this.getQueueKey(sessionId);
    const messages = await redis.getClient().lrange(key, 0, -1);

    return messages.map(msg => {
      try {
        return JSON.parse(msg) as QueuedMessage;
      } catch (error) {
        logger.error('Failed to parse queued message', error);
        return null;
      }
    }).filter((msg): msg is QueuedMessage => msg !== null);
  }

  /**
   * Clear all queued messages for a session
   */
  async clearMessages(sessionId: string): Promise<void> {
    const key = this.getQueueKey(sessionId);
    await redis.delete(key);
    logger.debug('Message queue cleared', { sessionId });
  }

  /**
   * Mark message as delivered and remove from queue
   */
  async markDelivered(sessionId: string, messageId: string): Promise<void> {
    const messages = await this.getMessages(sessionId);
    const filtered = messages.filter(msg => msg.id !== messageId);

    const key = this.getQueueKey(sessionId);
    await redis.delete(key);

    if (filtered.length > 0) {
      await redis.getClient().lpush(key, ...filtered.map(msg => JSON.stringify(msg)));
      await redis.getClient().expire(key, Math.ceil(this.TTL_MS / 1000));
    }

    logger.debug('Message marked as delivered', { sessionId, messageId });
  }

  /**
   * Retry failed messages
   */
  async retryFailedMessages(sessionId: string): Promise<QueuedMessage[]> {
    const messages = await this.getMessages(sessionId);
    const retryable = messages.filter(msg => msg.attempts < this.MAX_ATTEMPTS);

    // Increment attempt count
    retryable.forEach(msg => msg.attempts++);

    // Update queue
    const key = this.getQueueKey(sessionId);
    await redis.delete(key);

    if (retryable.length > 0) {
      await redis.getClient().lpush(key, ...retryable.map(msg => JSON.stringify(msg)));
      await redis.getClient().expire(key, Math.ceil(this.TTL_MS / 1000));
    }

    logger.debug('Messages retried', { sessionId, count: retryable.length });
    return retryable;
  }

  /**
   * Get queue size for a session
   */
  async getQueueSize(sessionId: string): Promise<number> {
    const key = this.getQueueKey(sessionId);
    return await redis.getClient().llen(key);
  }

  /**
   * Check if session has queued messages
   */
  async hasQueuedMessages(sessionId: string): Promise<boolean> {
    const size = await this.getQueueSize(sessionId);
    return size > 0;
  }

  private getQueueKey(sessionId: string): string {
    return `queue:messages:${sessionId}`;
  }
}
