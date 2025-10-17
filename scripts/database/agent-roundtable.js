#!/usr/bin/env node

/**
 * Agent Roundtable - Organize strategic discussions
 * Создает "круглый стол" агентов для обсуждения важных решений
 */

const { query } = require('../../src/backend/utils/database-pool');

const AGENT_ROLES = {
  'security': '🔐 Security Specialist',
  'tokenomics': '💰 Tokenomics Expert', 
  'marketing': '🚀 Marketing Strategist',
  'technical': '💻 Technical Lead',
  'growth': '📈 Growth Hacker'
};

async function createRoundtable(topic, question, options = []) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 AGENT ROUNDTABLE - Strategic Discussion');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`Topic: ${topic}`);
  console.log(`Question: ${question}\n`);
  
  if (options.length > 0) {
    console.log('Options:');
    options.forEach((opt, i) => {
      console.log(`  ${i + 1}. ${opt}`);
    });
    console.log('');
  }

  // Create discussion thread
  const result = await query(`
    INSERT INTO project_alerts (severity, message, source, data)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `, [
    'info',
    `Strategic Discussion: ${topic}`,
    'roundtable',
    JSON.stringify({
      question,
      options,
      timestamp: new Date(),
      status: 'open'
    })
  ]);

  const discussionId = result.rows[0].id;

  console.log(`✅ Discussion created (ID: ${discussionId})\n`);
  console.log('📋 Expected responses from agents:\n');

  // Log expected responses
  for (const [role, title] of Object.entries(AGENT_ROLES)) {
    console.log(`   ${title}`);
    
    // Create placeholder for response
    await query(`
      INSERT INTO agent_activity (agent_name, activity_type, description, data)
      VALUES ($1, $2, $3, $4)
    `, [
      role + '-agent',
      'roundtable_response',
      `Response to: ${topic}`,
      JSON.stringify({
        discussion_id: discussionId,
        status: 'pending',
        question
      })
    ]);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 Agents will analyze and respond');
  console.log('   Check results with:');
  console.log(`   node scripts/database/check-roundtable.js ${discussionId}\n`);

  process.exit(0);
}

// CLI usage
const topic = process.argv[2];
const question = process.argv[3];
const options = process.argv.slice(4);

if (!topic || !question) {
  console.log('Usage:');
  console.log('  node agent-roundtable.js "Topic" "Question" "Option 1" "Option 2"');
  console.log('\nExample:');
  console.log('  node agent-roundtable.js \\');
  console.log('    "Private Sale Platform" \\');
  console.log('    "PinkSale or Own Contract?" \\');
  console.log('    "PinkSale (trusted platform)" \\');
  console.log('    "Own contract (full control)"');
  process.exit(1);
}

createRoundtable(topic, question, options);
