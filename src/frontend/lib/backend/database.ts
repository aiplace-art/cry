/**
 * Database Layer for HypeAI Backend
 * SQLite database for transaction storage (testnet)
 */

import Database from 'better-sqlite3';
import path from 'path';
import { DBPurchase, DBSession, DBSignatureNonce, Purchase } from '../../types/api';
import { calculateVestedTokens } from './blockchain';

// ============================================================================
// Database Initialization
// ============================================================================

const DB_PATH = path.join(process.cwd(), 'data', 'testnet', 'hypeai-testnet.db');

let db: Database.Database | null = null;

/**
 * Get or create database connection
 */
export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    initializeTables();
  }
  return db;
}

/**
 * Initialize database tables
 */
function initializeTables(): void {
  const database = getDatabase();

  // Purchases table
  database.exec(`
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      address TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      token_amount REAL NOT NULL,
      bonus_tokens REAL NOT NULL,
      total_tokens REAL NOT NULL,
      bonus_percentage REAL NOT NULL,
      tx_hash TEXT NOT NULL UNIQUE,
      referral_code TEXT,
      email TEXT,
      claimed_tokens REAL DEFAULT 0,
      created_at INTEGER NOT NULL
    )
  `);

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_purchases_address ON purchases(address);
    CREATE INDEX IF NOT EXISTS idx_purchases_timestamp ON purchases(timestamp);
    CREATE INDEX IF NOT EXISTS idx_purchases_tx_hash ON purchases(tx_hash);
  `);

  // Sessions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      address TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      last_used INTEGER NOT NULL
    )
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_address ON sessions(address);
  `);

  // Signature nonces table (for replay protection)
  database.exec(`
    CREATE TABLE IF NOT EXISTS signature_nonces (
      signature TEXT PRIMARY KEY,
      address TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      used BOOLEAN DEFAULT 1
    )
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_nonces_timestamp ON signature_nonces(timestamp);
  `);
}

// ============================================================================
// Purchase Operations
// ============================================================================

/**
 * Insert new purchase
 */
export function insertPurchase(purchase: Omit<DBPurchase, 'created_at'>): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO purchases (
      id, address, timestamp, amount, payment_method,
      token_amount, bonus_tokens, total_tokens, bonus_percentage,
      tx_hash, referral_code, email, claimed_tokens, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    purchase.id,
    purchase.address.toLowerCase(),
    purchase.timestamp,
    purchase.amount,
    purchase.payment_method,
    purchase.token_amount,
    purchase.bonus_tokens,
    purchase.total_tokens,
    purchase.bonus_percentage,
    purchase.tx_hash,
    purchase.referral_code || null,
    purchase.email || null,
    purchase.claimed_tokens,
    Date.now()
  );
}

/**
 * Get purchases by address
 */
export function getPurchasesByAddress(address: string): Purchase[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM purchases
    WHERE address = ?
    ORDER BY timestamp DESC
  `);

  const rows = stmt.all(address.toLowerCase()) as DBPurchase[];

  return rows.map(row => convertDBPurchaseToPurchase(row));
}

/**
 * Get purchase by transaction hash
 */
export function getPurchaseByTxHash(txHash: string): Purchase | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM purchases
    WHERE tx_hash = ?
  `);

  const row = stmt.get(txHash) as DBPurchase | undefined;

  return row ? convertDBPurchaseToPurchase(row) : null;
}

/**
 * Update claimed tokens
 */
export function updateClaimedTokens(txHash: string, claimedAmount: number): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE purchases
    SET claimed_tokens = claimed_tokens + ?
    WHERE tx_hash = ?
  `);

  stmt.run(claimedAmount, txHash);
}

/**
 * Get all purchases (for stats)
 */
export function getAllPurchases(): Purchase[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM purchases
    ORDER BY timestamp DESC
  `);

  const rows = stmt.all() as DBPurchase[];

  return rows.map(row => convertDBPurchaseToPurchase(row));
}

/**
 * Get unique buyers count
 */
export function getUniqueBuyersCount(): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT COUNT(DISTINCT address) as count FROM purchases
  `);

  const result = stmt.get() as { count: number };

  return result.count;
}

/**
 * Convert DB purchase to API purchase format
 */
function convertDBPurchaseToPurchase(dbPurchase: DBPurchase): Purchase {
  const vestedTokens = calculateVestedTokens(
    dbPurchase.total_tokens,
    dbPurchase.timestamp
  );

  return {
    id: dbPurchase.id,
    address: dbPurchase.address,
    date: new Date(dbPurchase.timestamp).toISOString().split('T')[0],
    timestamp: dbPurchase.timestamp,
    amount: dbPurchase.amount,
    paymentMethod: dbPurchase.payment_method,
    tokenAmount: dbPurchase.token_amount,
    bonusTokens: dbPurchase.bonus_tokens,
    totalTokens: dbPurchase.total_tokens,
    bonusPercentage: dbPurchase.bonus_percentage,
    vestedTokens: Math.floor(vestedTokens),
    claimedTokens: dbPurchase.claimed_tokens,
    txHash: dbPurchase.tx_hash,
    referralCode: dbPurchase.referral_code,
    email: dbPurchase.email,
  };
}

// ============================================================================
// Session Operations
// ============================================================================

/**
 * Save session to database
 */
export function saveSession(session: DBSession): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO sessions (token, address, created_at, expires_at, last_used)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    session.token,
    session.address.toLowerCase(),
    session.created_at,
    session.expires_at,
    session.last_used
  );
}

/**
 * Get session by token
 */
export function getSessionByToken(token: string): DBSession | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM sessions WHERE token = ?
  `);

  return stmt.get(token) as DBSession | null;
}

/**
 * Delete expired sessions
 */
export function cleanExpiredSessions(): void {
  const db = getDatabase();
  const now = Date.now();

  const stmt = db.prepare(`
    DELETE FROM sessions WHERE expires_at < ?
  `);

  stmt.run(now);
}

// ============================================================================
// Signature Nonce Operations
// ============================================================================

/**
 * Check if signature exists
 */
export function isSignatureUsed(signature: string): boolean {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT 1 FROM signature_nonces WHERE signature = ? AND used = 1
  `);

  const result = stmt.get(signature);

  return !!result;
}

/**
 * Mark signature as used
 */
export function markSignatureUsed(nonce: Omit<DBSignatureNonce, 'used'>): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO signature_nonces (signature, address, message, timestamp, used)
    VALUES (?, ?, ?, ?, 1)
  `);

  stmt.run(
    nonce.signature,
    nonce.address.toLowerCase(),
    nonce.message,
    nonce.timestamp
  );
}

/**
 * Clean old signatures (keep only last 24 hours)
 */
export function cleanOldSignatures(): void {
  const db = getDatabase();
  const cutoff = Date.now() - (24 * 60 * 60 * 1000);

  const stmt = db.prepare(`
    DELETE FROM signature_nonces WHERE timestamp < ?
  `);

  stmt.run(cutoff);
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get database statistics
 */
export function getDatabaseStats(): {
  totalPurchases: number;
  totalAmount: number;
  uniqueBuyers: number;
} {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      COUNT(*) as total_purchases,
      SUM(amount) as total_amount,
      COUNT(DISTINCT address) as unique_buyers
    FROM purchases
  `);

  const result = stmt.get() as {
    total_purchases: number;
    total_amount: number;
    unique_buyers: number;
  };

  return {
    totalPurchases: result.total_purchases || 0,
    totalAmount: result.total_amount || 0,
    uniqueBuyers: result.unique_buyers || 0,
  };
}

// ============================================================================
// Cleanup & Maintenance
// ============================================================================

/**
 * Run all cleanup operations
 */
export function runMaintenance(): void {
  cleanExpiredSessions();
  cleanOldSignatures();
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
