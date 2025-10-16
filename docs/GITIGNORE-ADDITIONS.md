# Recommended .gitignore Additions for Mention Monitor Bot

## Add these lines to your .gitignore file:

```gitignore
# Mention Monitor Bot - Sensitive Configuration
config/mention-monitor-config.json

# Mention Monitor Bot - Logs (contain user data)
logs/mentions.jsonl
logs/interactions.jsonl
logs/mention-analytics-report.txt

# Bot Runtime
.swarm/

# Environment variables (if used)
.env
.env.local
.env.production
```

## Safe to Commit (Examples/Templates)
These files are safe to commit:
- ✅ `config/mention-monitor-config.example.json`
- ✅ `config/mention-monitor-test-config.json`
- ✅ All files in `docs/`
- ✅ All files in `scripts/`
- ✅ `src/bots/mention-monitor-bot.js`

## Security Checklist

Before committing, ensure:
- [ ] Real bot token NOT in any committed files
- [ ] Admin IDs NOT in committed config files
- [ ] Logs directory empty or gitignored
- [ ] No real group chat IDs exposed
- [ ] .env files gitignored

## If You Accidentally Committed Secrets

```bash
# Remove sensitive file from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch config/mention-monitor-config.json' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (warning: destructive!)
git push origin --force --all

# Immediately rotate the bot token:
# 1. Talk to @BotFather
# 2. /revoke for your bot
# 3. Create new token
# 4. Update config with new token
```

## Best Practice

Create a template config that teammates can copy:
```bash
cp config/mention-monitor-config.example.json config/mention-monitor-config.json
# Then edit config/mention-monitor-config.json with real values
# This file is gitignored, so secrets stay safe
```
