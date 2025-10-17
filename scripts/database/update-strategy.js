#!/usr/bin/env node

/**
 * Update project strategy in database
 * Records DUAL LAUNCH decision
 */

const { query } = require('../../src/backend/utils/database-pool');

async function updateStrategy() {
  console.log('📊 Updating project strategy in database...\n');

  // Record strategic decision
  await query(`
    INSERT INTO project_alerts (severity, message, source, data)
    VALUES ($1, $2, $3, $4)
  `, [
    'info',
    'Strategic Decision: DUAL LAUNCH (pump.fun + BSC)',
    'strategic-planning',
    JSON.stringify({
      decision: 'dual_launch',
      track1: 'pump.fun (Solana) - Quick viral launch',
      track2: 'BSC Private Sale - Serious fundraise',
      timeline: '3 days (Solana) + 3 weeks (BSC)',
      budget: '$180 (Solana) + $13K (BSC)',
      target: '$200K-$600K+ total',
      date_decided: new Date()
    })
  ]);

  // Log activity
  await query(`
    INSERT INTO agent_activity (agent_name, activity_type, description, data)
    VALUES ($1, $2, $3, $4)
  `, [
    'strategic-coordinator',
    'strategy_update',
    'DUAL LAUNCH strategy approved and documented',
    JSON.stringify({
      documents: [
        'docs/DUAL_LAUNCH_ACTION_PLAN.md',
        'docs/LAUNCH_STRATEGY_COMPARISON.md'
      ],
      next_steps: [
        'pump.fun launch in 3 days',
        'BSC audit submission',
        'Community building'
      ]
    })
  ]);

  console.log('✅ Strategy updated in database');
  console.log('✅ DUAL LAUNCH decision recorded');
  console.log('\n📋 Next: Execute action plan');
  console.log('   1. Solana wallet setup');
  console.log('   2. Logo design');
  console.log('   3. Social media');
  console.log('\nRead: docs/DUAL_LAUNCH_ACTION_PLAN.md\n');

  process.exit(0);
}

updateStrategy();
