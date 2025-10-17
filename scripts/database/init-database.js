#!/usr/bin/env node

/**
 * HypeAI Database Initialization (Node.js version)
 * Cross-platform database setup script
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.database') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'hypeai',
  user: process.env.DB_USER || 'hypeai_user',
  password: process.env.DB_PASSWORD || 'hypeai_password',
};

async function initDatabase() {
  console.log('🗄️  HypeAI Database Initialization');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📋 Database Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}`);
  console.log('');

  let pool;

  try {
    // Connect to PostgreSQL
    console.log('🔌 Connecting to PostgreSQL...');
    pool = new Pool(config);

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL\n');

    // Load schema
    const schemaPath = path.join(__dirname, '../../config/database/schema.sql');
    console.log('📝 Loading schema from:', schemaPath);

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    console.log('⚙️  Executing schema...');
    await pool.query(schema);
    console.log('✅ Schema executed successfully\n');

    // Get table count
    const result = await pool.query(`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database initialization complete!\n');
    console.log(`📊 Total tables created: ${result.rows[0].table_count}`);
    console.log('\n🚀 You can now start the database coordinator agent:');
    console.log('   node src/bots/database-coordinator-agent.js\n');

  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure PostgreSQL is running:');
      console.error('   macOS:   brew services start postgresql');
      console.error('   Linux:   sudo systemctl start postgresql');
      console.error('   Windows: net start postgresql-x64-14');
    }

    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run initialization
initDatabase();
