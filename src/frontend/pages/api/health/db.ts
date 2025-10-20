// Database Health Check API Endpoint
// Checks database connectivity and performance

import type { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const dbPath = path.join(process.cwd(), '../../backend/database/private-sale.db');

    // Test database connection
    const start = Date.now();
    const db = new Database(dbPath, { readonly: true });

    // Simple query to test connectivity
    const result = db.prepare('SELECT 1 as test').get();
    const queryTime = Date.now() - start;

    // Get database stats
    const stats = db.prepare('PRAGMA database_list').all();

    db.close();

    res.status(200).json({
      status: 'healthy',
      latency: queryTime,
      connected: true,
      details: {
        queryTime: `${queryTime}ms`,
        databases: stats.length,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      connected: false,
      error: error instanceof Error ? error.message : 'Database connection failed',
    });
  }
}
