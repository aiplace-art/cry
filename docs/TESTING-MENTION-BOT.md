# Testing the Mention Monitor Bot

## 🧪 Pre-Production Testing Checklist

Before deploying the bot to live groups, test all functionality in a controlled environment.

## Setup Test Environment

### 1. Create Test Group
```bash
# 1. Create a new Telegram group called "HypeAI Bot Testing"
# 2. Add your bot to the group
# 3. Make yourself admin
# 4. Keep the group private for testing
```

### 2. Use Test Config
```bash
# Copy test config
cp config/mention-monitor-test-config.json config/mention-monitor-config.json

# Edit with your bot token and admin ID
nano config/mention-monitor-config.json
```

### 3. Start Bot in Test Mode
```bash
# Start with logs visible
npm run mention-bot

# You should see:
# ✅ Mention Monitor Bot started
# 📊 Monitoring all groups
# ⚡ Max responses per hour: 5
# 👥 Admins: 1
```

## Test Scenarios

### Test 1: Direct Mention Detection ⭐ Priority: HIGH

**Test Case:**
```
Post in test group: "Has anyone tried HypeAI?"
```

**Expected Behavior:**
1. ✅ Bot detects mention
2. ✅ Mention type: "direct"
3. ✅ Opportunity score: 90+
4. ✅ You receive admin notification
5. ✅ Response added to queue

**Verify:**
```bash
# Check admin DM with bot - should receive:
🔔 New Mention Detected
Chat: HypeAI Bot Testing
Type: direct
Score: 90/100
...

# Check queue
Send to bot: /queue

# Should show pending response with ID
```

### Test 2: Question Detection ⭐ Priority: HIGH

**Test Case:**
```
Post in test group: "What's the best AI token on Solana?"
```

**Expected Behavior:**
1. ✅ Bot detects as question
2. ✅ Mention type: "question"
3. ✅ Opportunity score: 70+
4. ✅ Response queued

**Verify:**
```bash
Send to bot: /queue
# Should show question-type response
```

### Test 3: Related Topic Detection ⭐ Priority: MEDIUM

**Test Case:**
```
Post in test group: "Looking for good AI agents projects on pump.fun"
```

**Expected Behavior:**
1. ✅ Bot detects related keywords
2. ✅ Mention type: "related"
3. ✅ Opportunity score: 40-60
4. ✅ May or may not queue (depends on total score)

### Test 4: Sentiment Analysis ⭐ Priority: HIGH

**Positive Test:**
```
Post: "HypeAI looks amazing! Best AI project I've seen"
```

Expected: Positive sentiment, high score (90+)

**Neutral Test:**
```
Post: "What is HypeAI?"
```

Expected: Neutral sentiment, medium score (60-70)

**Negative Test:**
```
Post: "HypeAI seems like a scam, terrible project"
```

Expected: Negative sentiment, LOW score (<30), should NOT queue response

### Test 5: Response Approval ⭐ Priority: HIGH

**Test Case:**
```bash
# 1. Trigger a high-value mention
Post in group: "Anyone know about HypeAI? Looks interesting!"

# 2. Check queue
Send to bot: /queue

# 3. Approve the response
/approve <ID from queue>
```

**Expected Behavior:**
1. ✅ Bot sends response to group
2. ✅ Response is a reply to original message
3. ✅ Response content matches suggestion
4. ✅ Rate limiter increments (check /stats)
5. ✅ Admin receives confirmation
6. ✅ Item removed from queue

### Test 6: Response Rejection ⭐ Priority: MEDIUM

**Test Case:**
```bash
# 1. Trigger a mention
Post in group: "What AI tokens are good?"

# 2. Reject the response
/reject <ID from queue>
```

**Expected Behavior:**
1. ✅ Response NOT sent to group
2. ✅ Item marked as rejected
3. ✅ Metrics updated (rejected count +1)
4. ✅ Admin receives confirmation

### Test 7: Rate Limiting ⭐ Priority: HIGH

**Test Case:**
```bash
# 1. Set rate limit to 2 in config for testing
"maxResponsesPerHour": 2

# 2. Approve 3 responses quickly
/approve <ID1>
/approve <ID2>
/approve <ID3>
```

**Expected Behavior:**
1. ✅ First 2 responses send successfully
2. ✅ Third response FAILS with rate limit error
3. ✅ /stats shows: "Hourly Rate Limit: 2/2"

**Reset Test:**
```bash
# Wait 1 hour OR restart bot
# Rate limit should reset to 0/2
```

### Test 8: Blacklist System ⭐ Priority: HIGH

**Test Case:**
```bash
# 1. Get test group chat ID from logs/console
# 2. Blacklist the group
/blacklist -1001234567890

# 3. Post mentions in that group
Post: "HypeAI is awesome!"
```

**Expected Behavior:**
1. ✅ Bot NO LONGER monitors that group
2. ✅ No notifications received
3. ✅ No responses queued
4. ✅ Blacklist persists after restart

### Test 9: Statistics Tracking ⭐ Priority: MEDIUM

**Test Case:**
```bash
# 1. Generate various mentions (direct, question, related)
# 2. Approve some, reject others
# 3. Check stats
/stats
```

**Expected Output:**
```
📊 Mention Monitor Stats

Mentions Detected: 8
Responses Approved: 3
Responses Rejected: 2
Hourly Rate Limit: 3/5
Pending Queue: 3
Monitored Groups: 1
Blacklisted Chats: 0

Engagement Score: 68/100
```

**Verify:**
- ✅ Counts are accurate
- ✅ Engagement score calculation correct
- ✅ Rate limit matches approvals

### Test 10: Logging ⭐ Priority: MEDIUM

**Test Case:**
```bash
# 1. Generate mentions and interactions
# 2. Check log files

cat logs/mentions.jsonl
cat logs/interactions.jsonl
```

**Expected:**
1. ✅ mentions.jsonl has all detected mentions
2. ✅ interactions.jsonl has approved/rejected actions
3. ✅ Logs are in valid JSONL format
4. ✅ All relevant data captured

### Test 11: Context Analysis ⭐ Priority: MEDIUM

**Test Case 1 - Question Context:**
```
Post: "Is HypeAI worth investing in?"
```
Expected: `isQuestion: true`, higher score

**Test Case 2 - Reply Context:**
```
User A: "What AI tokens do you like?"
You reply: "HypeAI is interesting"
```
Expected: Bot sees it's a reply, adjusts scoring

**Test Case 3 - Link Context:**
```
Post: "Check out HypeAI at https://hypeai.fun"
```
Expected: `hasLinks: true`, logged in context

### Test 12: Multi-Group Monitoring ⭐ Priority: LOW

**Test Case:**
```bash
# 1. Add bot to 3 different test groups
# 2. Post mentions in each group
# 3. Verify bot monitors all groups
```

**Expected:**
- ✅ Notifications from all groups
- ✅ Queue shows mentions from different groups
- ✅ Can approve/reject from any group
- ✅ /stats shows correct group count

### Test 13: Error Handling ⭐ Priority: HIGH

**Test Case 1 - Invalid Config:**
```bash
# Break config file (invalid JSON)
# Start bot
npm run mention-bot
```
Expected: Clear error message, bot doesn't crash

**Test Case 2 - Invalid Bot Token:**
```bash
# Use wrong token in config
# Start bot
```
Expected: Connection error, clear message

**Test Case 3 - Network Issues:**
```bash
# Disconnect network while bot running
# Post mention
# Reconnect network
```
Expected: Bot recovers, queues messages

## Performance Testing

### Load Test
```bash
# 1. Post 20 mentions rapidly in test group
# 2. Monitor bot performance
# 3. Check all mentions detected
# 4. Verify queue handles load
```

**Metrics to Monitor:**
- Response time (should be <1s per mention)
- Memory usage (should be stable)
- No missed mentions
- Queue doesn't overflow

## Integration Testing

### End-to-End Workflow
```bash
# Complete realistic workflow:

1. User posts: "What's the best AI token on Solana?"
   ✅ Bot detects as question
   ✅ Score: 75/100
   ✅ Queues response

2. Admin receives notification
   ✅ Review context
   ✅ Check suggested response

3. Admin approves
   /approve <ID>
   ✅ Response sent to group
   ✅ Appears as reply to original
   ✅ Natural and helpful tone

4. User replies positively
   "Thanks! I'll check it out"
   ✅ Engagement tracked
   ✅ Success logged

5. Check final stats
   /stats
   ✅ All metrics updated
   ✅ Engagement score increased
```

## Regression Testing

After making any code changes, re-run:
1. ✅ Test 1 (Direct mention)
2. ✅ Test 4 (Sentiment analysis)
3. ✅ Test 5 (Approval)
4. ✅ Test 7 (Rate limiting)
5. ✅ Test 8 (Blacklist)

## Pre-Production Checklist

Before deploying to real groups:

- [ ] All 13 test scenarios pass
- [ ] Logs are working correctly
- [ ] Rate limiting enforced
- [ ] Blacklist system works
- [ ] Admin commands secured
- [ ] Error handling robust
- [ ] Config validation works
- [ ] Response quality reviewed
- [ ] Sentiment analysis accurate
- [ ] No false positives in negative sentiment
- [ ] Stats calculation correct
- [ ] Memory usage stable
- [ ] Network errors handled gracefully

## Production Deployment

Once all tests pass:

```bash
# 1. Create production config
cp config/mention-monitor-config.json config/mention-monitor-prod-config.json

# 2. Update with real groups (start with 1-2 friendly groups)
"monitoredGroups": [
  "-1001234567890"  # Your first production group
]

# 3. Start with PM2
pm2 start src/bots/mention-monitor-bot.js --name mention-monitor

# 4. Monitor closely for first 24 hours
pm2 logs mention-monitor

# 5. Check stats frequently
Send to bot: /stats

# 6. Gradually add more groups after proven stable
```

## Monitoring Production

**Daily:**
- Check `/stats`
- Review `/queue`
- Analyze `logs/mentions.jsonl`

**Weekly:**
- Calculate approval rate (target: 60%+)
- Review engagement score (target: 75+)
- Analyze keyword performance
- Adjust config as needed

**Monthly:**
- Full log analysis
- Optimize opportunity scoring
- Refine response templates
- Update keywords based on trends

## Troubleshooting Test Failures

### Bot Not Detecting Mentions
```bash
# Check:
1. Bot has correct permissions in group
2. Privacy mode is DISABLED (@BotFather /setprivacy)
3. Keywords match exactly (case-insensitive)
4. Bot is actually running (check console)
```

### Admin Commands Not Working
```bash
# Check:
1. Admin ID is correct (use @userinfobot)
2. Sending commands via DM (not in group)
3. Bot token is correct
4. Bot is running
```

### Responses Not Sending
```bash
# Check:
1. Rate limit not exceeded (/stats)
2. Bot has send permissions in group
3. Correct chat ID in queue
4. No network errors in logs
```

## Success Criteria

Tests are successful when:
1. ✅ 100% of direct mentions detected
2. ✅ 90%+ of questions detected
3. ✅ 0 false negatives on sentiment
4. ✅ Rate limiting enforced 100%
5. ✅ No crashes during 24-hour test
6. ✅ All admin commands work
7. ✅ Blacklist 100% effective
8. ✅ Logs complete and accurate
9. ✅ Response quality high (human review)
10. ✅ No spam behavior observed

---

**Test thoroughly before production!** 🧪
