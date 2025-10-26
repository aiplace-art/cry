import { db } from '@database/client.js';
import { Logger } from '@core/logger.js';

const logger = new Logger('MessageRepository');

export interface Message {
  id: string;
  sessionId: string;
  userId: string | null;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  tokenCount: number | null;
  createdAt: Date;
}

export interface CreateMessageDto {
  sessionId: string;
  userId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  tokenCount?: number;
}

export class MessageRepository {
  async create(data: CreateMessageDto): Promise<Message> {
    const query = `
      INSERT INTO messages (session_id, user_id, role, content, metadata, token_count)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, session_id as "sessionId", user_id as "userId", role, content, metadata, token_count as "tokenCount", created_at as "createdAt"
    `;

    const values = [
      data.sessionId,
      data.userId || null,
      data.role,
      data.content,
      JSON.stringify(data.metadata || {}),
      data.tokenCount || null,
    ];

    try {
      const result = await db.query<Message>(query, values);
      logger.debug('Message created', { messageId: result.rows[0].id });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create message', error);
      throw error;
    }
  }

  async findBySessionId(sessionId: string, limit = 100, offset = 0): Promise<Message[]> {
    const query = `
      SELECT
        id,
        session_id as "sessionId",
        user_id as "userId",
        role,
        content,
        metadata,
        token_count as "tokenCount",
        created_at as "createdAt"
      FROM messages
      WHERE session_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await db.query<Message>(query, [sessionId, limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error('Failed to fetch messages', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Message | null> {
    const query = `
      SELECT
        id,
        session_id as "sessionId",
        user_id as "userId",
        role,
        content,
        metadata,
        token_count as "tokenCount",
        created_at as "createdAt"
      FROM messages
      WHERE id = $1
    `;

    try {
      const result = await db.query<Message>(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to fetch message', error);
      throw error;
    }
  }

  async countBySessionId(sessionId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM messages WHERE session_id = $1';

    try {
      const result = await db.query<{ count: string }>(query, [sessionId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('Failed to count messages', error);
      throw error;
    }
  }

  async deleteBySessionId(sessionId: string): Promise<number> {
    const query = 'DELETE FROM messages WHERE session_id = $1';

    try {
      const result = await db.query(query, [sessionId]);
      logger.debug('Messages deleted', { sessionId, count: result.rowCount });
      return result.rowCount || 0;
    } catch (error) {
      logger.error('Failed to delete messages', error);
      throw error;
    }
  }

  async getTotalTokenUsage(sessionId: string): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(token_count), 0) as total
      FROM messages
      WHERE session_id = $1 AND token_count IS NOT NULL
    `;

    try {
      const result = await db.query<{ total: string }>(query, [sessionId]);
      return parseInt(result.rows[0].total);
    } catch (error) {
      logger.error('Failed to calculate token usage', error);
      throw error;
    }
  }
}

export const messageRepository = new MessageRepository();
