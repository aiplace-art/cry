# CI/CD Pipeline Setup Guide

## 📋 Overview

Production-grade CI/CD pipeline с GitHub Actions для автоматизации:
- ✅ Continuous Integration (CI)
- 🚀 Continuous Deployment (CD)
- 🔒 Security Scanning
- 📦 Release Management
- 🧪 Automated Testing
- 📊 Performance Monitoring

---

## 🎯 Workflows Overview

### Core Workflows

#### 1. **CI Pipeline** (`.github/workflows/ci.yml`)
**Triggers:** Push/PR to main, develop, variant-2-website

**Jobs:**
- ✅ TypeScript type checking
- 🎨 ESLint + Prettier formatting
- 🔧 Smart contract compilation
- 🧪 Unit tests (95%+ coverage)
- 🔒 Security audit (npm audit, Slither)
- 📦 Build verification
- 🏎️ Lighthouse CI

**Required Secrets:** None (uses default GITHUB_TOKEN)

---

#### 2. **Security Pipeline** (`.github/workflows/security.yml`)
**Triggers:** Push/PR + Daily at 2 AM UTC

**Jobs:**
- 🔍 NPM audit
- 🛡️ Snyk vulnerability scanning
- 🔐 CodeQL static analysis
- 🔑 Secret scanning (TruffleHog + GitLeaks)
- 📋 SBOM generation
- ⚙️ Smart contract security (Slither + Mythril)

**Required Secrets:**
- `SNYK_TOKEN` (optional but recommended)

---

#### 3. **Deploy Pipeline** (`.github/workflows/deploy.yml`)
**Triggers:** Push to main, PRs, Manual dispatch

**Environments:**
- 🧪 **Staging** - Auto-deploy on PRs
- 🚀 **Production** - Manual approval required

**Jobs:**
- ✅ Pre-deployment checks
- 🧪 Staging deployment (automatic)
- 🚀 Production deployment (manual approval)
- 💨 Smoke tests
- 🔄 Rollback on failure
- 🏎️ Lighthouse performance check

**Required Secrets:**
```bash
VERCEL_TOKEN              # Vercel authentication
VERCEL_ORG_ID             # Vercel organization ID
VERCEL_PROJECT_ID         # Vercel project ID
VERCEL_SCOPE              # Vercel team scope (optional)

# Contract addresses
NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS
NEXT_PUBLIC_USDT_CONTRACT_ADDRESS
NEXT_PUBLIC_BSC_RPC_URL
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

# Optional notifications
SLACK_WEBHOOK_URL
DISCORD_WEBHOOK
```

---

#### 4. **Release Pipeline** (`.github/workflows/release.yml`)
**Triggers:** Git tags (v*.*.*), Manual dispatch

**Jobs:**
- 📝 Semantic versioning
- 📋 Changelog generation
- 🎁 GitHub release creation
- 🐳 Docker image build & push
- 📦 NPM package publish

**Required Secrets:**
```bash
GITHUB_TOKEN    # Auto-provided
NPM_TOKEN       # For NPM publishing (optional)
```

---

### Additional Workflows

#### 5. **Branch Protection** (`.github/workflows/branch-protection.yml`)
- ✅ Branch naming validation
- 👥 Approval requirements
- 🏷️ Required labels
- 📏 PR size checks
- 🔗 Linked issue validation

#### 6. **PR Auto-labeler** (`.github/workflows/pr-labeler.yml`)
- 🏷️ Auto-label by file paths
- 📝 Auto-label by PR title
- 📊 Size labels (XS, S, M, L, XL)
- 🗂️ Area labels (frontend, smart-contracts, etc.)

#### 7. **Performance Monitoring** (`.github/workflows/performance-monitoring.yml`)
**Triggers:** Every 6 hours + manual

- 🏎️ Lighthouse audits
- 📊 Web Vitals tracking
- 📦 Bundle size monitoring
- ⚡ API response time checks

#### 8. **Scheduled Maintenance** (`.github/workflows/scheduled-maintenance.yml`)
**Triggers:** Weekly (Sundays at 2 AM UTC)

- 🔄 Dependency update checks
- 🧹 Artifact cleanup (30 days)
- 🗑️ Old workflow run cleanup (90 days)
- 💚 System health checks

#### 9. **Docker Build** (`.github/workflows/docker-build.yml`)
- 🐳 Multi-platform builds (amd64, arm64)
- 🔒 Trivy security scanning
- 📦 GHCR push

#### 10. **Auto-merge** (`.github/workflows/auto-merge.yml`)
- 🤖 Auto-approve Dependabot PRs
- ✅ Auto-merge patch/minor updates
- ⚠️ Manual review for major updates

---

## 🚀 Quick Start

### 1. Configure Repository Secrets

Go to: **Settings → Secrets and variables → Actions**

**Essential Secrets:**
```bash
# Deployment (Vercel)
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Smart Contract Config
NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

**Optional Secrets:**
```bash
# Security
SNYK_TOKEN=your-snyk-token

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
DISCORD_WEBHOOK=https://discord.com/api/webhooks/...

# NPM Publishing
NPM_TOKEN=your-npm-token
```

---

### 2. Configure GitHub Environments

**Settings → Environments**

#### Staging Environment
- **Name:** `staging`
- **Deployment URL:** `https://staging.hypeai.io`
- **Protection rules:** None (auto-deploy)

#### Production Environment
- **Name:** `production`
- **Deployment URL:** `https://hypeai.io`
- **Protection rules:**
  - ✅ Required reviewers (1+)
  - ✅ Wait timer: 5 minutes
  - ✅ Deployment branch: `main` only

---

### 3. Enable Branch Protection Rules

**Settings → Branches → Add rule**

**For `main` branch:**
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
  - `CI Success`
  - `Security Summary`
  - `Build Application`
- ✅ Require branches to be up to date
- ✅ Require linear history
- ✅ Include administrators

---

### 4. Configure CODEOWNERS

File: `.github/CODEOWNERS`

```bash
# Workflows require DevOps approval
/.github/workflows/ @ai-place @devops-team

# Smart contracts require security review
/src/contracts/ @ai-place @security-team
*.sol @ai-place @blockchain-team
```

---

## 📊 Workflow Visualization

```
┌─────────────────────────────────────────────────────────┐
│                    Developer Workflow                    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Create Feature Branch │
              │  (feature/add-feature) │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │    Make Changes        │
              │    Commit & Push       │
              └────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                    CI Pipeline (Auto)                     │
│  ✅ Type Check  🎨 Lint  🧪 Tests  🔒 Security  📦 Build │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Create Pull Request  │
              │   (Auto-labeled)       │
              └────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│              Deploy to Staging (Auto)                     │
│  🧪 Staging URL: https://staging.hypeai.io               │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Code Review          │
              │   (1+ Approval)        │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Merge to Main        │
              └────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│         Production Deployment (Manual Approval)          │
│  🚀 Production URL: https://hypeai.io                    │
│  💨 Smoke Tests  📊 Performance Monitoring               │
└──────────────────────────────────────────────────────────┘
```

---

## 🏷️ Auto-labeling System

### By PR Title
```bash
feat: Add new feature     → feature
fix: Fix bug             → bugfix
hotfix: Critical fix     → hotfix
docs: Update docs        → documentation
refactor: Code cleanup   → refactor
test: Add tests          → test
perf: Optimize           → performance
```

### By File Paths
```bash
src/contracts/**/*.sol    → area: smart-contracts, language: solidity
src/frontend/**/*         → area: frontend
.github/workflows/**/*    → area: ci/cd
tests/**/*                → area: testing
docs/**/*                 → area: documentation
```

### By Size
```bash
< 10 lines      → size: XS
< 100 lines     → size: S
< 500 lines     → size: M
< 1000 lines    → size: L
≥ 1000 lines    → size: XL
```

---

## 📝 PR Templates

### Standard PR Template
Located at: `.github/pull_request_template.md`

**Sections:**
- Description
- Type of Change
- Related Issue
- Changes Made
- Testing
- Checklist
- Screenshots

---

## 🐛 Issue Templates

### Bug Report
`.github/ISSUE_TEMPLATE/bug_report.md`

### Feature Request
`.github/ISSUE_TEMPLATE/feature_request.md`

---

## 🔄 Release Process

### 1. Semantic Versioning
```bash
git tag v1.2.3
git push origin v1.2.3
```

**Version Format:**
- `v1.0.0` - Major release (breaking changes)
- `v1.1.0` - Minor release (new features)
- `v1.1.1` - Patch release (bug fixes)

### 2. Automatic Release
Release workflow автоматически:
- ✅ Generates changelog
- ✅ Creates GitHub release
- ✅ Builds Docker image
- ✅ Publishes NPM package
- ✅ Updates documentation

---

## 🔒 Security Best Practices

### 1. Secret Management
- ❌ Never commit secrets to git
- ✅ Use GitHub Secrets
- ✅ Use environment-specific secrets
- ✅ Rotate secrets regularly

### 2. Branch Protection
- ✅ Require reviews
- ✅ Require status checks
- ✅ Require linear history
- ✅ No force pushes

### 3. Automated Security Scans
- 🔍 Daily security scans
- 🛡️ Snyk vulnerability detection
- 🔐 CodeQL static analysis
- 🔑 Secret scanning

---

## 📊 Monitoring & Metrics

### Performance Monitoring
- 🏎️ Lighthouse CI (every 6 hours)
- 📊 Web Vitals tracking
- 📦 Bundle size monitoring
- ⚡ API response times

### Health Checks
- 💚 Website uptime
- 🔒 SSL certificate validity
- 🌐 API availability

---

## 🛠️ Troubleshooting

### Workflow Fails
1. Check workflow logs in **Actions** tab
2. Review error messages
3. Verify all secrets are configured
4. Check branch protection rules

### Deployment Fails
1. Verify Vercel secrets
2. Check build logs
3. Review environment variables
4. Test locally first

### Security Scan Fails
1. Review vulnerability details
2. Update dependencies
3. Apply security patches
4. Re-run scans

---

## 📚 Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Semantic Versioning](https://semver.org/)

### Tools Used
- GitHub Actions
- Vercel
- Docker
- Snyk
- CodeQL
- Lighthouse CI
- Dependabot

---

## ✅ Checklist

Before going live:

- [ ] Configure all required secrets
- [ ] Set up staging environment
- [ ] Set up production environment
- [ ] Configure branch protection rules
- [ ] Update CODEOWNERS
- [ ] Test CI pipeline
- [ ] Test deployment pipeline
- [ ] Verify security scans
- [ ] Test rollback procedure
- [ ] Configure notifications
- [ ] Update documentation

---

## 🎉 You're All Set!

Your production-grade CI/CD pipeline is ready! 🚀

**Next steps:**
1. Create a feature branch
2. Make changes
3. Push and create PR
4. Watch automation work! ✨
