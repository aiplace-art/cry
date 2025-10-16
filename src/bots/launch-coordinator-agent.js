#!/usr/bin/env node

/**
 * 🚀 LAUNCH COORDINATOR AGENT
 *
 * Manages launch timeline, milestones, and readiness checks
 * Ensures everything is ready for November 15, 2025 launch
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data/project-coordination');
const LAUNCH_FILE = path.join(DATA_DIR, 'launch-status.json');

const LAUNCH_DATE = new Date('2025-11-15T00:00:00Z');

let launchStatus = {
  targetDate: LAUNCH_DATE.toISOString(),
  daysRemaining: 0,
  readinessScore: 0,
  milestones: [
    { id: '100_members', name: '100 Community Members', target: 100, completed: false, priority: 'high' },
    { id: '500_members', name: '500 Community Members', target: 500, completed: false, priority: 'high' },
    { id: '1000_members', name: '1000 Community Members', target: 1000, completed: false, priority: 'critical' },
    { id: 'website_live', name: 'Website Deployed', completed: true, priority: 'critical' },
    { id: 'bots_active', name: 'All Bots Running', completed: false, priority: 'high' },
    { id: 'twitter_100', name: '100 Twitter Followers', target: 100, completed: false, priority: 'medium' },
    { id: 'content_ready', name: 'Launch Content Prepared', completed: false, priority: 'high' },
    { id: 'wallet_tested', name: 'Wallet Integration Tested', completed: false, priority: 'critical' }
  ],
  blockers: [],
  lastCheck: new Date().toISOString()
};

// Load previous status
if (fs.existsSync(LAUNCH_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(LAUNCH_FILE, 'utf8'));
    launchStatus.milestones = saved.milestones || launchStatus.milestones;
    launchStatus.blockers = saved.blockers || [];
  } catch (error) {
    console.error('Error loading launch status:', error.message);
  }
}

function checkLaunchReadiness() {
  // Calculate days remaining
  const now = new Date();
  launchStatus.daysRemaining = Math.ceil((LAUNCH_DATE - now) / (1000 * 60 * 60 * 24));

  // Check community metrics
  try {
    const communityPath = path.join(DATA_DIR, 'community-metrics.json');
    if (fs.existsSync(communityPath)) {
      const community = JSON.parse(fs.readFileSync(communityPath, 'utf8'));

      // Update milestone completion
      launchStatus.milestones.forEach(milestone => {
        if (milestone.target && community.telegram_members >= milestone.target) {
          if (!milestone.completed) {
            console.log(`✅ Milestone completed: ${milestone.name}`);
          }
          milestone.completed = true;
          milestone.completedAt = new Date().toISOString();
        }
      });
    }
  } catch (error) {
    console.error('Error checking community metrics:', error.message);
  }

  // Calculate readiness score
  const totalMilestones = launchStatus.milestones.length;
  const completedMilestones = launchStatus.milestones.filter(m => m.completed).length;
  launchStatus.readinessScore = Math.floor((completedMilestones / totalMilestones) * 100);

  // Check for blockers
  launchStatus.blockers = [];

  if (launchStatus.daysRemaining <= 7) {
    const criticalIncomplete = launchStatus.milestones.filter(
      m => m.priority === 'critical' && !m.completed
    );

    if (criticalIncomplete.length > 0) {
      launchStatus.blockers.push({
        severity: 'critical',
        message: `${criticalIncomplete.length} critical milestones incomplete with ${launchStatus.daysRemaining} days to launch`,
        milestones: criticalIncomplete.map(m => m.name)
      });
    }
  }

  launchStatus.lastCheck = new Date().toISOString();

  // Save status
  fs.writeFileSync(LAUNCH_FILE, JSON.stringify(launchStatus, null, 2));

  // Report to coordinator
  const report = {
    days_to_launch: launchStatus.daysRemaining,
    readiness_score: launchStatus.readinessScore,
    milestones_completed: completedMilestones,
    milestones_total: totalMilestones,
    blockers: launchStatus.blockers.length
  };

  console.log('🚀 Launch Status:', JSON.stringify(report));

  const reportPath = path.join(DATA_DIR, 'launch-metrics.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Alert if blockers found
  if (launchStatus.blockers.length > 0) {
    console.log('⚠️ BLOCKERS DETECTED:');
    launchStatus.blockers.forEach(b => {
      console.log(`   ${b.severity.toUpperCase()}: ${b.message}`);
    });
  }

  // Countdown alerts
  if (launchStatus.daysRemaining === 30) {
    console.log('⚠️ 30 DAYS TO LAUNCH!');
  } else if (launchStatus.daysRemaining === 14) {
    console.log('⚠️ 2 WEEKS TO LAUNCH!');
  } else if (launchStatus.daysRemaining === 7) {
    console.log('⚠️ 1 WEEK TO LAUNCH!');
  } else if (launchStatus.daysRemaining === 1) {
    console.log('🚀 LAUNCH TOMORROW!');
  } else if (launchStatus.daysRemaining === 0) {
    console.log('🎉 LAUNCH DAY IS TODAY!');
  }
}

// Check readiness every hour
setInterval(checkLaunchReadiness, 60 * 60 * 1000);

// Check more frequently in final week
setInterval(() => {
  if (launchStatus.daysRemaining <= 7) {
    checkLaunchReadiness();
  }
}, 15 * 60 * 1000);

console.log('✅ Launch Coordinator Agent started');
console.log(`🚀 ${launchStatus.daysRemaining} days until launch (November 15, 2025)`);
checkLaunchReadiness();
