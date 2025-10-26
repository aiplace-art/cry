#!/usr/bin/env node

/**
 * HypeAI AI Assistant API Test Script
 * Tests all endpoints and validates responses
 */

const API_BASE = 'http://localhost:3001/api/ai-assistant';

async function runTests() {
  console.log('\n🧪 HypeAI AI Assistant API Test Suite\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let sessionId = null;
  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  try {
    console.log('📍 Test 1: Health Check');
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();

    if (response.ok && data.status === 'healthy') {
      console.log('✅ PASS - Server is healthy');
      console.log(`   Knowledge Base: ${data.knowledgeBase ? '✓' : '✗'}`);
      console.log(`   Uptime: ${Math.floor(data.uptime)}s\n`);
      passed++;
    } else {
      console.log('❌ FAIL - Server unhealthy\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
    failed++;
  }

  // Test 2: Chat - English
  try {
    console.log('💬 Test 2: Chat Request (English)');
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What is HypeAI?',
        language: 'en'
      })
    });

    const data = await response.json();

    if (response.ok && data.reply && data.sessionId) {
      console.log('✅ PASS - Got response');
      console.log(`   Session ID: ${data.sessionId}`);
      console.log(`   Response Time: ${data.responseTime}ms`);
      console.log(`   Reply Preview: ${data.reply.substring(0, 100)}...\n`);
      sessionId = data.sessionId;
      passed++;
    } else {
      console.log(`❌ FAIL - ${data.error || 'No reply received'}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
    failed++;
  }

  // Test 3: Chat - Russian
  try {
    console.log('💬 Test 3: Chat Request (Russian)');
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Что такое HypeAI?',
        language: 'ru'
      })
    });

    const data = await response.json();

    if (response.ok && data.reply) {
      console.log('✅ PASS - Got Russian response');
      console.log(`   Reply Preview: ${data.reply.substring(0, 100)}...\n`);
      passed++;
    } else {
      console.log(`❌ FAIL - ${data.error || 'No reply received'}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
    failed++;
  }

  // Test 4: Session Continuity
  if (sessionId) {
    try {
      console.log('🔗 Test 4: Session Continuity');
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Tell me more about the referral system',
          sessionId,
          language: 'en'
        })
      });

      const data = await response.json();

      if (response.ok && data.sessionId === sessionId) {
        console.log('✅ PASS - Session preserved');
        console.log(`   Same Session ID: ${data.sessionId}\n`);
        passed++;
      } else {
        console.log('❌ FAIL - Session not preserved\n');
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}\n`);
      failed++;
    }
  }

  // Test 5: Feedback
  if (sessionId) {
    try {
      console.log('👍 Test 5: Feedback Submission');
      const response = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          helpful: true,
          comment: 'Great answer!'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ PASS - Feedback recorded\n');
        passed++;
      } else {
        console.log('❌ FAIL - Feedback not recorded\n');
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}\n`);
      failed++;
    }
  }

  // Test 6: Invalid Request
  try {
    console.log('🚫 Test 6: Invalid Request Handling');
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '' // Empty message
      })
    });

    const data = await response.json();

    if (response.status === 400 && data.error) {
      console.log('✅ PASS - Invalid request rejected');
      console.log(`   Error: ${data.error}\n`);
      passed++;
    } else {
      console.log('❌ FAIL - Invalid request not handled\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
    failed++;
  }

  // Test 7: Analytics
  try {
    console.log('📊 Test 7: Analytics Endpoint');
    const response = await fetch(`${API_BASE}/analytics/popular`);
    const data = await response.json();

    if (response.ok && typeof data.totalQueries === 'number') {
      console.log('✅ PASS - Analytics available');
      console.log(`   Total Queries: ${data.totalQueries}`);
      console.log(`   Sessions: ${data.sessions}\n`);
      passed++;
    } else {
      console.log('❌ FAIL - Analytics unavailable\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
    failed++;
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📋 Test Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Total:  ${passed + failed}`);
  console.log(`   ${failed === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed'}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

// Check if server is running
console.log('🔍 Checking if API server is running...\n');

fetch(`${API_BASE}/health`)
  .then(() => {
    console.log('✅ Server detected, starting tests...\n');
    runTests();
  })
  .catch(() => {
    console.error('❌ ERROR: API server is not running!\n');
    console.error('Please start the server first:');
    console.error('   cd server');
    console.error('   npm start\n');
    process.exit(1);
  });
