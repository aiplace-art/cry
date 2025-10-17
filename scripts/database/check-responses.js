#!/usr/bin/env node

/**
 * Check Agent Responses
 * Показывает ответы агентов на вопросы
 */

const { query } = require('../../src/backend/utils/database-pool');

async function checkResponses() {
  console.log('📬 Checking agent responses...\n');

  // 1. Показать последние сообщения от агентов
  const messages = await query(`
    SELECT
      from_agent,
      message_type,
      payload,
      created_at
    FROM agent_messages
    WHERE from_agent != 'user'
    ORDER BY created_at DESC
    LIMIT 20
  `);

  if (messages.rows.length > 0) {
    console.log('📨 Recent messages from agents:\n');
    messages.rows.forEach(msg => {
      const payload = typeof msg.payload === 'string' ? JSON.parse(msg.payload) : msg.payload;
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`From: ${msg.from_agent}`);
      console.log(`Type: ${msg.message_type}`);
      console.log(`Time: ${msg.created_at}`);
      console.log(`Message:`, payload);
      console.log('');
    });
  } else {
    console.log('No messages from agents yet.\n');
  }

  // 2. Показать последнюю активность агентов
  const activity = await query(`
    SELECT
      agent_name,
      activity_type,
      description,
      data,
      created_at
    FROM agent_activity
    ORDER BY created_at DESC
    LIMIT 10
  `);

  if (activity.rows.length > 0) {
    console.log('\n📊 Recent agent activity:\n');
    activity.rows.forEach(act => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Agent: ${act.agent_name}`);
      console.log(`Type: ${act.activity_type}`);
      console.log(`Description: ${act.description}`);
      if (act.data) {
        console.log(`Data:`, typeof act.data === 'string' ? JSON.parse(act.data) : act.data);
      }
      console.log(`Time: ${act.created_at}`);
      console.log('');
    });
  }

  process.exit(0);
}

checkResponses();
