#!/usr/bin/env node

/**
 * Test HypeAI Database Connection
 * Quick script to verify database is set up correctly
 */

const { pool, query, testConnection, getPoolStats } = require('../../src/backend/utils/database-pool');

async function testDatabase() {
  console.log('🧪 Testing HypeAI Database Connection\n');

  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Connection failed');
    }
    console.log('');

    // Test 2: Check tables
    console.log('Test 2: Checking tables...');
    const tablesResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log(`✅ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.slice(0, 10).forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    if (tablesResult.rows.length > 10) {
      console.log(`   ... and ${tablesResult.rows.length - 10} more`);
    }
    console.log('');

    // Test 3: Check project state
    console.log('Test 3: Reading project state...');
    const stateResult = await query('SELECT * FROM project_state WHERE id = 1');
    if (stateResult.rows.length > 0) {
      const state = stateResult.rows[0];
      console.log('✅ Project state found:');
      console.log(`   Telegram: ${state.telegram_members} members`);
      console.log(`   Twitter: ${state.twitter_followers} followers`);
      console.log(`   Token Holders: ${state.token_holders}`);
    }
    console.log('');

    // Test 4: Check tokenomics
    console.log('Test 4: Reading tokenomics distribution...');
    const tokenomicsResult = await query('SELECT * FROM tokenomics_distribution ORDER BY allocation_name');
    if (tokenomicsResult.rows.length > 0) {
      console.log('✅ Tokenomics distribution found:');
      tokenomicsResult.rows.forEach(row => {
        console.log(`   ${row.allocation_name}: ${row.total_allocated.toLocaleString()} total (${row.locked.toLocaleString()} locked)`);
      });
    }
    console.log('');

    // Test 5: Pool stats
    console.log('Test 5: Connection pool stats...');
    const stats = getPoolStats();
    console.log('✅ Pool status:');
    console.log(`   Total connections: ${stats.totalCount}`);
    console.log(`   Idle connections: ${stats.idleCount}`);
    console.log(`   Waiting requests: ${stats.waitingCount}`);
    console.log('');

    // Test 6: Write test
    console.log('Test 6: Write test (agent activity)...');
    await query(`
      INSERT INTO agent_activity (agent_name, activity_type, description)
      VALUES ($1, $2, $3)
    `, ['test-agent', 'test', 'Database connection test']);
    console.log('✅ Write successful');
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All tests passed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Your database is ready to use! 🎉');
    console.log('');
    console.log('Start the coordinator:');
    console.log('  node src/bots/database-coordinator-agent.js');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Run: bash scripts/database/setup-all.sh');
    console.error('3. Check database credentials in scripts/.env.database');
    console.error('');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDatabase();
