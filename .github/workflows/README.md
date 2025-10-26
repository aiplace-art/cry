# GitHub Actions Workflows

## 📋 Overview

This directory contains production-grade GitHub Actions workflows for CI/CD automation.

## 🎯 Workflows

### Core Pipelines

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| CI Pipeline | `ci.yml` | Push/PR | Type checking, linting, tests, build |
| Security Pipeline | `security.yml` | Push/PR/Daily | Security scans, audits, SBOM |
| Deploy Pipeline | `deploy.yml` | Push/PR/Manual | Staging/Production deployments |
| Release Pipeline | `release.yml` | Tags/Manual | Versioning, changelog, releases |

### Automation

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| Branch Protection | `branch-protection.yml` | PR | Enforce branch rules |
| PR Labeler | `pr-labeler.yml` | PR | Auto-label PRs |
| Auto-merge | `auto-merge.yml` | Dependabot PR | Auto-merge safe updates |
| Stale Issues | `stale-issues.yml` | Daily | Mark inactive issues |

### Monitoring

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| Performance Monitoring | `performance-monitoring.yml` | 6 hours | Lighthouse, web vitals |
| Scheduled Maintenance | `scheduled-maintenance.yml` | Weekly | Cleanup, health checks |
| Docker Build | `docker-build.yml` | Push/Tags | Build & scan images |

## 🚀 Quick Start

1. **Configure Secrets** (Settings → Secrets and variables → Actions)
2. **Set up Environments** (Settings → Environments)
3. **Enable Branch Protection** (Settings → Branches)
4. **Create CODEOWNERS** (`.github/CODEOWNERS`)

## 📖 Documentation

Full setup guide: `/docs/CI_CD_SETUP_GUIDE.md`

## 🔒 Required Secrets

Essential:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- Contract addresses

Optional:
- `SNYK_TOKEN`
- `SLACK_WEBHOOK_URL`
- `DISCORD_WEBHOOK`
- `NPM_TOKEN`

## 🏷️ Labels

Workflows automatically apply labels:

**Type:** feature, bugfix, hotfix, docs, refactor, test
**Size:** XS, S, M, L, XL
**Area:** smart-contracts, frontend, ci/cd, testing
**Language:** solidity, typescript, javascript

## 🎯 Environments

- **staging** - Auto-deploy on PR
- **production** - Manual approval required

## 📊 Status Badges

Add to README.md:

```markdown
![CI](https://github.com/YOUR_ORG/YOUR_REPO/workflows/CI%20Pipeline/badge.svg)
![Security](https://github.com/YOUR_ORG/YOUR_REPO/workflows/Security%20Pipeline/badge.svg)
![Deploy](https://github.com/YOUR_ORG/YOUR_REPO/workflows/Deploy%20Pipeline/badge.svg)
```

## 🛠️ Customization

Edit workflows to match your needs:
- Update branch names
- Modify job dependencies
- Add custom steps
- Configure notifications

## 📞 Support

Issues? Check:
1. Workflow logs (Actions tab)
2. Setup guide (`/docs/CI_CD_SETUP_GUIDE.md`)
3. GitHub Actions docs

---

**Production-grade CI/CD ready!** 🚀
