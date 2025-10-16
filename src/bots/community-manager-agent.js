#!/usr/bin/env node

/**
 * 👥 COMMUNITY MANAGER AGENT
 *
 * Manages Telegram community engagement, growth, and moderation
 * Reports metrics back to Project Master Coordinator
 */

import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'solana-bot-config.json'), 'utf8'));
const bot = new TelegramBot(config.telegram.token, { polling: true });

const metrics = {
  totalMembers: 0,
  activeToday: new Set(),
  messagesTotal: 0,
  messagesLast24h: 0,
  engagementRate: 0,
  joinedLast24h: 0,
  leftLast24h: 0
};

// Track activity
bot.on('message', (msg) => {
  metrics.messagesTotal++;
  metrics.messagesLast24h++;
  metrics.activeToday.add(msg.from.id);

  // Calculate engagement
  if (metrics.totalMembers > 0) {
    metrics.engagementRate = (metrics.activeToday.size / metrics.totalMembers * 100).toFixed(2);
  }
});

bot.on('new_chat_members', (msg) => {
  metrics.joinedLast24h += msg.new_chat_members.length;
  metrics.totalMembers += msg.new_chat_members.length;

  // Welcome new members
  msg.new_chat_members.forEach(member => {
    bot.sendMessage(msg.chat.id,
      `🎉 Welcome ${member.first_name} to HypeAI Community!\n\n` +
      `🚀 We're launching on Solana November 15, 2025\n` +
      `💎 Join ${metrics.totalMembers}+ members building the future!\n\n` +
      `Use /help to see what I can do!`
    );
  });

  reportMetrics();
});

bot.on('left_chat_member', (msg) => {
  metrics.leftLast24h++;
  metrics.totalMembers--;
  reportMetrics();
});

// Report metrics to coordinator every 5 minutes
function reportMetrics() {
  const report = {
    telegram_members: metrics.totalMembers,
    daily_active_users: metrics.activeToday.size,
    engagement_rate: parseFloat(metrics.engagementRate),
    growth_24h: metrics.joinedLast24h - metrics.leftLast24h
  };

  console.log('📊 Community Metrics:', JSON.stringify(report));

  // Would send to coordinator via IPC or file
  const reportPath = path.join(__dirname, '../../data/project-coordination/community-metrics.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
}

setInterval(reportMetrics, 5 * 60 * 1000);

// Reset daily counters
setInterval(() => {
  metrics.messagesLast24h = 0;
  metrics.joinedLast24h = 0;
  metrics.leftLast24h = 0;
  metrics.activeToday.clear();
}, 24 * 60 * 60 * 1000);

console.log('✅ Community Manager Agent started');
reportMetrics();
