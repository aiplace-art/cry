# 🚀 CI/CD Quick Reference

## 📝 Common Tasks

### Create Feature Branch
```bash
git checkout -b feature/my-awesome-feature
```

### Push Changes
```bash
git add .
git commit -m "feat: Add awesome feature"
git push origin feature/my-awesome-feature
```

### Create PR
1. Go to GitHub repository
2. Click "Pull requests" → "New pull request"
3. PR will be auto-labeled based on title and files
4. Staging deployment starts automatically

### Release New Version
```bash
# Semantic versioning: v1.2.3
git tag v1.2.3
git push origin v1.2.3
# Release workflow starts automatically
```

---

## 🏷️ PR Title Convention

```bash
feat: Add new feature         # → feature label
fix: Fix bug                 # → bugfix label
hotfix: Critical fix         # → hotfix label
docs: Update documentation   # → documentation label
refactor: Code cleanup       # → refactor label
test: Add tests              # → test label
perf: Optimize performance   # → performance label
chore: Maintenance           # → chore label
```

---

## 🎯 Workflow Status

### Check Workflow Status
- GitHub → Actions tab
- See all running workflows
- Click for detailed logs

### Common Workflows
- ✅ **CI Pipeline** - Runs on every push/PR
- 🔒 **Security Pipeline** - Runs daily + on push/PR
- 🚀 **Deploy Pipeline** - Runs on PR (staging) or merge (production)
- 📦 **Release Pipeline** - Runs on git tags

---

## 🔧 Troubleshooting

### Workflow Failed?
1. Click on failed workflow
2. Check error logs
3. Fix issue locally
4. Push again

### Deployment Failed?
1. Check Vercel logs
2. Verify environment variables
3. Test build locally: `npm run build`

### Security Scan Failed?
1. Check vulnerability details
2. Update dependencies: `npm update`
3. Run audit: `npm audit fix`

---

## 📊 Environment URLs

- **Staging:** https://staging.hypeai.io
- **Production:** https://hypeai.io

---

## 🔑 Required Secrets

### Vercel (Required)
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Smart Contracts (Required)
- `NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_USDT_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_BSC_RPC_URL`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### Optional
- `SNYK_TOKEN` - Security scanning
- `SLACK_WEBHOOK_URL` - Notifications
- `DISCORD_WEBHOOK` - Notifications

---

## 📚 Documentation

- **Full Guide:** `docs/CI_CD_SETUP_GUIDE.md`
- **Workflows README:** `.github/workflows/README.md`
- **This Quick Ref:** `.github/QUICK_REFERENCE.md`

---

## 🆘 Need Help?

1. Check workflow logs (Actions tab)
2. Read setup guide (`docs/CI_CD_SETUP_GUIDE.md`)
3. Create issue with `help wanted` label
