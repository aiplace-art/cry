#!/usr/bin/env node

/**
 * 🔍 SOCIAL MEDIA MONITOR AGENT
 *
 * Monitors Twitter mentions, sentiment, and viral potential
 * Tracks brand presence across social platforms
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data/project-coordination');
const SOCIAL_FILE = path.join(DATA_DIR, 'social-data.json');

let socialData = {
  mentions: {
    total: 0,
    last24h: 0,
    twitter: 0,
    telegram: 0,
    reddit: 0
  },
  sentiment: {
    positive: 0,
    neutral: 0,
    negative: 0,
    score: 0 // -1 to +1
  },
  viralPotential: {
    score: 0, // 0-100
    trending: false,
    peakReach: 0
  },
  influencers: [],
  topMentions: [],
  lastUpdate: new Date().toISOString()
};

// Load previous data
if (fs.existsSync(SOCIAL_FILE)) {
  try {
    socialData = JSON.parse(fs.readFileSync(SOCIAL_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading social data:', error.message);
  }
}

function analyzeSentiment(text) {
  // Simple sentiment analysis (in production, use NLP library)
  const positive = ['great', 'awesome', 'love', 'amazing', 'best', 'good', '🚀', '💎', '🔥'];
  const negative = ['bad', 'scam', 'rug', 'shit', 'hate', 'worst'];

  const words = text.toLowerCase().split(/\s+/);

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of words) {
    if (positive.some(p => word.includes(p))) positiveCount++;
    if (negative.some(n => word.includes(n))) negativeCount++;
  }

  if (positiveCount > negativeCount) return 1;
  if (negativeCount > positiveCount) return -1;
  return 0;
}

function monitorSocial() {
  // In production, would integrate with Twitter API, Reddit API, etc.
  // For now, simulate monitoring

  // Check for mentions in logs
  const mentionLogPath = path.join(__dirname, '../../logs/mention-monitor.log');
  if (fs.existsSync(mentionLogPath)) {
    try {
      const log = fs.readFileSync(mentionLogPath, 'utf8');
      const lines = log.split('\n').filter(l => l.trim());

      // Count recent mentions
      const last24h = lines.filter(line => {
        const timestamp = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)?.[0];
        if (!timestamp) return false;

        const time = new Date(timestamp);
        const now = new Date();
        return (now - time) < 24 * 60 * 60 * 1000;
      });

      socialData.mentions.last24h = last24h.length;
      socialData.mentions.total += last24h.length;

      // Analyze sentiment
      let sentimentSum = 0;
      for (const line of last24h) {
        const sentiment = analyzeSentiment(line);
        sentimentSum += sentiment;

        if (sentiment > 0) socialData.sentiment.positive++;
        else if (sentiment < 0) socialData.sentiment.negative++;
        else socialData.sentiment.neutral++;
      }

      // Calculate sentiment score
      const total = socialData.sentiment.positive + socialData.sentiment.neutral + socialData.sentiment.negative;
      if (total > 0) {
        socialData.sentiment.score = ((socialData.sentiment.positive - socialData.sentiment.negative) / total).toFixed(2);
      }

      // Calculate viral potential
      const mentionVelocity = last24h.length / 24; // mentions per hour
      const sentimentBoost = Math.max(0, parseFloat(socialData.sentiment.score) * 20);
      socialData.viralPotential.score = Math.min(100, Math.floor(mentionVelocity * 10 + sentimentBoost));

      socialData.viralPotential.trending = socialData.viralPotential.score > 60;
    } catch (error) {
      console.error('Error analyzing mentions:', error.message);
    }
  }

  socialData.lastUpdate = new Date().toISOString();

  // Save data
  fs.writeFileSync(SOCIAL_FILE, JSON.stringify(socialData, null, 2));

  // Report to coordinator
  const report = {
    mentions: socialData.mentions.total,
    mentions_24h: socialData.mentions.last24h,
    sentiment_score: parseFloat(socialData.sentiment.score),
    viral_potential: socialData.viralPotential.score,
    trending: socialData.viralPotential.trending
  };

  console.log('🔍 Social Monitor Report:', JSON.stringify(report));

  const reportPath = path.join(DATA_DIR, 'social-metrics.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Alert on viral potential
  if (socialData.viralPotential.trending) {
    console.log('🔥 HIGH VIRAL POTENTIAL DETECTED!');
  }

  // Alert on negative sentiment spike
  if (parseFloat(socialData.sentiment.score) < -0.5) {
    console.log('⚠️ NEGATIVE SENTIMENT SPIKE DETECTED!');
  }
}

// Monitor every 15 minutes
setInterval(monitorSocial, 15 * 60 * 1000);

console.log('✅ Social Monitor Agent started');
monitorSocial();
