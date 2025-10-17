#!/usr/bin/env node

/**
 * Ask All Agents - Broadcast Question System
 * Отправляет вопрос всем агентам и собирает их ответы
 */

const { query } = require('../../src/backend/utils/database-pool');

async function askAgents(question, topic = 'strategy') {
  console.log('📢 Broadcasting question to all agents...\n');
  console.log(`Question: ${question}\n`);

  // 1. Создать broadcast сообщение для всех агентов
  await query(`
    INSERT INTO agent_messages (from_agent, to_agent, message_type, payload)
    VALUES ($1, $2, $3, $4)
  `, [
    'user',
    null, // NULL = broadcast to all
    topic,
    JSON.stringify({
      question,
      timestamp: new Date(),
      priority: 'high'
    })
  ]);

  console.log('✅ Question sent to all agents\n');

  // 2. Получить список активных агентов
  const agents = await query(`
    SELECT agent_name, agent_type
    FROM active_agents
    WHERE status = 'running'
    AND last_heartbeat > NOW() - INTERVAL '5 minutes'
    ORDER BY agent_name
  `);

  console.log(`📋 ${agents.rows.length} active agents notified:\n`);
  agents.rows.forEach(agent => {
    console.log(`   • ${agent.agent_name} (${agent.agent_type})`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 Agents can respond by adding to agent_activity table');
  console.log('   or by sending messages back\n');
  console.log('To see responses, run:');
  console.log('   node scripts/database/check-responses.js\n');

  process.exit(0);
}

// Get question from command line
const question = process.argv[2];

if (!question) {
  console.log('Usage: node scripts/database/ask-agents.js "Your question"');
  console.log('\nExample:');
  console.log('  node scripts/database/ask-agents.js "Should we launch on PinkSale or create our own sale?"');
  process.exit(1);
}

askAgents(question);
