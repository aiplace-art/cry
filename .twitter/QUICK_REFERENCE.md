# HypeAI Twitter Analytics - Quick Reference

## 🚀 Daily Commands

### Collect Analytics
```bash
node scripts/twitter-analytics.js
```

### Generate Reports
```bash
# All reports
node scripts/twitter-reporter.js all

# Specific reports
node scripts/twitter-reporter.js daily
node scripts/twitter-reporter.js weekly
node scripts/twitter-reporter.js content
node scripts/twitter-reporter.js competitors
```

### View Dashboard
```bash
open scripts/analytics-dashboard.html
```

### Run Tests
```bash
node scripts/test-analytics.js
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.twitter/.env` | API credentials (CREATE THIS!) |
| `.twitter/analytics/metrics/` | Raw data storage |
| `.twitter/analytics/reports/` | Generated reports |
| `scripts/analytics-dashboard.html` | Visual dashboard |

## 🔧 Setup (One-Time)

```bash
# 1. Copy environment template
cp .twitter/.env.example .twitter/.env

# 2. Edit with your Twitter API token
nano .twitter/.env

# 3. Make scripts executable
chmod +x scripts/*.js scripts/*.sh

# 4. Setup automation (optional)
./scripts/setup-analytics-cron.sh

# 5. Test everything
node scripts/test-analytics.js
```

## 📊 Metrics at a Glance

| Metric | Location | Update |
|--------|----------|--------|
| Followers | User Metrics | Real-time |
| Growth Rate | Growth Rate | Daily |
| Engagement | Top Content | Per tweet |
| Best Times | Optimal Times | Weekly |
| Top Hashtags | Top Content | Daily |
| Competitors | Competitors | Daily |

## 🎯 Report Schedule

| Report | Frequency | Time (UTC) |
|--------|-----------|------------|
| Analytics Collection | Daily | 9:00 AM |
| Daily Summary | Daily | 9:30 AM |
| Weekly Report | Monday | 10:00 AM |
| Content Analysis | Friday | 3:00 PM |
| Competitor Analysis | Sunday | 10:00 AM |

## 🔍 Quick Checks

### Check if analytics is running
```bash
ls -lt .twitter/analytics/metrics/ | head -5
```

### View latest metrics
```bash
cat .twitter/analytics/metrics/user-metrics-$(date +%Y-%m-%d).json
```

### Check cron logs
```bash
tail -f .twitter/analytics/cron.log
```

### List all reports
```bash
ls -lh .twitter/analytics/reports/
```

## 🐛 Troubleshooting

### API 401 Error
```bash
# Check token is set
grep TWITTER_BEARER_TOKEN .twitter/.env

# Test API manually
curl -H "Authorization: Bearer $TWITTER_BEARER_TOKEN" \
  https://api.twitter.com/2/users/by/username/HypeAI_Official
```

### No Data in Reports
```bash
# 1. Verify metrics exist
ls .twitter/analytics/metrics/

# 2. Re-run collection
node scripts/twitter-analytics.js

# 3. Try specific report
node scripts/twitter-reporter.js daily
```

### Dashboard Shows Demo Data
This is normal! Dashboard uses sample data by default.
To use real data, integrate with your backend or modify dashboard to load JSON files.

## 📈 Key Performance Indicators

| KPI | Target | Current |
|-----|--------|---------|
| Follower Growth | 5-10% weekly | Check report |
| Engagement Rate | 2-5% per tweet | Check report |
| Posting Frequency | 3-5 tweets/day | Manual tracking |
| Best Times Used | 80%+ adherence | Manual tracking |

## 🎯 Quick Tips

1. **Daily**: Check daily report for immediate insights
2. **Weekly**: Review weekly report for trend analysis
3. **Monthly**: Compare month-over-month growth
4. **Always**: Post during identified peak hours
5. **Content**: Use top-performing hashtags consistently

## 📚 Full Documentation

- **Complete Guide**: `docs/TWITTER_ANALYTICS_GUIDE.md`
- **System Overview**: `.twitter/analytics/README.md`
- **Implementation Summary**: `docs/ANALYTICS_SUMMARY.md`

## 🔗 Quick Links

- [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
- [Twitter API Docs](https://developer.twitter.com/en/docs/twitter-api)
- [Chart.js Docs](https://www.chartjs.org/docs/)

## 💡 One-Liners

```bash
# Today's follower count
node scripts/twitter-analytics.js | grep "Followers:"

# Generate and view daily report
node scripts/twitter-reporter.js daily && \
  cat .twitter/analytics/reports/daily-$(date +%Y-%m-%d).md

# Check growth rate
jq '.weekly' .twitter/analytics/metrics/growth-rate-$(date +%Y-%m-%d).json

# Count total metrics files
ls .twitter/analytics/metrics/*.json | wc -l

# View cron schedule
crontab -l | grep HypeAI
```

## ⚡ Emergency Commands

```bash
# Stop all cron jobs
crontab -r

# Restore cron backup
crontab /tmp/crontab.backup

# Clear all metrics (USE WITH CAUTION!)
rm -rf .twitter/analytics/metrics/*.json

# Force re-collect analytics
rm .twitter/analytics/metrics/*$(date +%Y-%m-%d)*.json && \
  node scripts/twitter-analytics.js
```

## 🎉 Success Indicators

✅ Metrics files updating daily
✅ Reports generating automatically
✅ Dashboard loads without errors
✅ Cron jobs running on schedule
✅ Growth rate trending upward
✅ Engagement rate above 2%

---

**Quick Help**: For detailed help, see `docs/TWITTER_ANALYTICS_GUIDE.md`
**Support**: Check troubleshooting section above or contact dev team
**Version**: 1.0.0 | **Updated**: 2025-10-16
