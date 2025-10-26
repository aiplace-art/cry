import { db } from '@database/client.js';
import { Logger } from '@core/logger.js';

const logger = new Logger('SessionRepository');

export interface Session {
  id: string;
  userId: string;
  title: string;
  agentType: string | null;
  metadata: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}

export interface CreateSessionDto {
  userId: string;
  title?: string;
  agentType?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface UpdateSessionDto {
  title?: string;
  agentType?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
}

export class SessionRepository {
  async create(data: CreateSessionDto): Promise<Session> {
    const query = `
      INSERT INTO sessions (user_id, title, agent_type, metadata, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        user_id as "userId",
        title,
        agent_type as "agentType",
        metadata,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt",
        expires_at as "expiresAt"
    `;

    const values = [
      data.userId,
      data.title || 'New Chat',
      data.agentType || null,
      JSON.stringify(data.metadata || {}),
      data.expiresAt || null,
    ];

    try {
      const result = await db.query<Session>(query, values);
      logger.debug('Session created', { sessionId: result.rows[0].id });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create session', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Session | null> {
    const query = `
      SELECT
        id,
        user_id as "userId",
        title,
        agent_type as "agentType",
        metadata,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt",
        expires_at as "expiresAt"
      FROM sessions
      WHERE id = $1
    `;

    try {
      const result = await db.query<Session>(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to fetch session', error);
      throw error;
    }
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<Session[]> {
    const query = `
      SELECT
        id,
        user_id as "userId",
        title,
        agent_type as "agentType",
        metadata,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt",
        expires_at as "expiresAt"
      FROM sessions
      WHERE user_id = $1 AND is_active = true
      ORDER BY updated_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await db.query<Session>(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error('Failed to fetch user sessions', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateSessionDto): Promise<Session | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }

    if (data.agentType !== undefined) {
      updates.push(`agent_type = $${paramIndex++}`);
      values.push(data.agentType);
    }

    if (data.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(data.metadata));
    }

    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.isActive);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE sessions
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING
        id,
        user_id as "userId",
        title,
        agent_type as "agentType",
        metadata,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt",
        expires_at as "expiresAt"
    `;

    try {
      const result = await db.query<Session>(query, values);
      logger.debug('Session updated', { sessionId: id });
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to update session', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM sessions WHERE id = $1';

    try {
      const result = await db.query(query, [id]);
      logger.debug('Session deleted', { sessionId: id });
      return (result.rowCount || 0) > 0;
    } catch (error) {
      logger.error('Failed to delete session', error);
      throw error;
    }
  }

  async cleanupExpired(): Promise<number> {
    const query = `
      DELETE FROM sessions
      WHERE expires_at IS NOT NULL AND expires_at < NOW()
    `;

    try {
      const result = await db.query(query);
      const count = result.rowCount || 0;
      if (count > 0) {
        logger.info('Expired sessions cleaned up', { count });
      }
      return count;
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', error);
      throw error;
    }
  }
}

export const sessionRepository = new SessionRepository();
