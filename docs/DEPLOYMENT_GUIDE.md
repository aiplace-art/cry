# Presale Deployment Guide

## Overview

Complete guide for deploying the ElonBTC presale page to production using Vercel (recommended) or alternative platforms.

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] TypeScript compilation successful
- [ ] Linting passed
- [ ] Code formatted
- [ ] No TODO comments for critical features
- [ ] Security audit completed
- [ ] Performance benchmarks met

### Configuration

- [ ] Environment variables documented
- [ ] Contract addresses verified on BSCScan
- [ ] API keys obtained and tested
- [ ] Analytics configured
- [ ] Error tracking set up
- [ ] Rate limiting configured
- [ ] CORS settings verified

### Testing

- [ ] Manual testing completed (see PRESALE_TESTING.md)
- [ ] Cross-browser testing done
- [ ] Mobile testing completed
- [ ] Production build tested locally
- [ ] Smart contract integration verified
- [ ] Wallet connectivity tested

---

## Deployment Platform: Vercel (Recommended)

### Why Vercel?

- Native Next.js support
- Automatic HTTPS
- Global CDN
- Zero-config deployment
- Automatic preview deployments
- Built-in analytics
- Edge functions support

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Choose your preferred login method (GitHub, GitLab, Bitbucket, or email).

### Step 3: Link Project

From your project directory:

```bash
cd /Users/ai.place/Crypto/src/frontend
vercel link
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account/team
- Link to existing project? **No** (first time)
- Project name? **elonbtc-presale**
- Directory? **./** (current directory)

### Step 4: Configure Environment Variables

#### Option A: Via CLI

```bash
# Add production environment variables
vercel env add NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS production
# Enter value when prompted

vercel env add NEXT_PUBLIC_BSC_RPC_URL production
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID production
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production
# ... add all required variables
```

#### Option B: Via Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add each variable:

**Required Variables:**
```
NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ENVIRONMENT=production
```

**Optional but Recommended:**
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_BSCSCAN_API_KEY=your_api_key
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

This will:
1. Build your Next.js application
2. Upload to Vercel's infrastructure
3. Deploy to global CDN
4. Provide production URL

Expected output:
```
✓ Deployment ready [20s]
https://elonbtc-presale.vercel.app
```

### Step 6: Configure Custom Domain

#### Add Domain

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Click **Add**
3. Enter your domain: `presale.elonbtc.com`
4. Click **Add**

#### Configure DNS

Add these DNS records with your domain provider:

**For Apex Domain (elonbtc.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For Subdomain (presale.elonbtc.com):**
```
Type: CNAME
Name: presale
Value: cname.vercel-dns.com
```

#### Verify Domain

1. Wait for DNS propagation (5-30 minutes)
2. Vercel will automatically issue SSL certificate
3. Check status in dashboard
4. Test: `https://presale.elonbtc.com`

### Step 7: Enable Production Protections

#### Branch Protection

1. Connect GitHub repository
2. Enable **Git Integration**
3. Set production branch: **main**
4. Enable preview deployments for **develop** branch

#### Environment Protection

In Vercel dashboard:
1. **Settings** → **Environment Variables**
2. Set sensitive variables to **Production** only
3. Use different values for **Preview** environment

#### Deployment Protection

1. **Settings** → **Deployment Protection**
2. Enable **Vercel Authentication** (optional)
3. Set up **Password Protection** for staging

---

## Alternative Deployment: AWS Amplify

### Step 1: Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify configure
```

### Step 2: Initialize Amplify

```bash
cd /Users/ai.place/Crypto/src/frontend
amplify init
```

### Step 3: Add Hosting

```bash
amplify add hosting
```

Select:
- Hosting with Amplify Console
- Continuous deployment (Git-based)

### Step 4: Deploy

```bash
amplify publish
```

---

## Alternative Deployment: Netlify

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login

```bash
netlify login
```

### Step 3: Initialize Site

```bash
cd /Users/ai.place/Crypto/src/frontend
netlify init
```

### Step 4: Configure Build

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Step 5: Deploy

```bash
netlify deploy --prod
```

---

## Post-Deployment Configuration

### 1. Analytics Setup

#### Google Analytics

1. Verify GA4 property created
2. Check data stream active
3. Test events firing:
   - Page views
   - Wallet connections
   - Purchase initiated
   - Purchase completed

#### Vercel Analytics

Automatically enabled. Check in dashboard:
- **Analytics** tab
- Real User Monitoring
- Web Vitals scores

### 2. Error Monitoring

#### Sentry Setup

1. Create Sentry project: https://sentry.io
2. Get DSN
3. Add to environment variables
4. Verify errors reported:

```bash
# Test error reporting
curl https://presale.elonbtc.com/api/test-error
```

### 3. Performance Monitoring

#### Enable Speed Insights

In Vercel dashboard:
- Navigate to **Analytics** → **Speed Insights**
- Enable for production
- Review Core Web Vitals

#### Lighthouse CI

Set up automated Lighthouse audits:

```bash
npm install -g @lhci/cli

# Run audit
lhci autorun --upload.target=temporary-public-storage
```

Target scores:
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >90

### 4. CDN and Caching

#### Vercel Edge Network

Automatically configured. Verify:
- Static assets cached (1 year)
- Pages cached at edge
- ISR working (if used)

#### Custom Headers

Add to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}
```

### 5. Security Headers

#### Content Security Policy

Add to `next.config.js`:

```javascript
const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-insights.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self' *.binance.org *.bscscan.com wss:;
`

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  }
}
```

---

## Monitoring and Maintenance

### Daily Checks

- [ ] Site accessibility
- [ ] SSL certificate valid
- [ ] No error spikes in Sentry
- [ ] Analytics data flowing
- [ ] Transaction success rate
- [ ] No performance degradation

### Weekly Reviews

- [ ] Review error logs
- [ ] Check Core Web Vitals
- [ ] Analyze user behavior
- [ ] Review transaction data
- [ ] Check smart contract events
- [ ] Monitor gas prices impact

### Monthly Tasks

- [ ] Security audit
- [ ] Dependency updates
- [ ] Performance optimization
- [ ] SEO review
- [ ] Analytics report
- [ ] Backup verification

---

## Scaling Considerations

### Traffic Spikes

Vercel automatically scales, but monitor:
- Function execution time
- Edge network performance
- Database connections (if any)
- Rate limiting effectiveness

### Cost Optimization

- Enable image optimization
- Implement proper caching
- Use ISR for static content
- Optimize bundle size
- Monitor bandwidth usage

---

## Rollback Procedures

### Vercel Instant Rollback

1. Go to **Deployments** in dashboard
2. Find previous stable deployment
3. Click three dots → **Promote to Production**
4. Confirm rollback

### Manual Rollback

```bash
# Redeploy specific commit
vercel --prod --force
```

### Emergency Procedures

If critical issue detected:

1. **Immediate**: Use Vercel instant rollback
2. **Communicate**: Notify users via social media
3. **Investigate**: Check error logs in Sentry
4. **Fix**: Create hotfix branch
5. **Deploy**: Push fix and deploy
6. **Verify**: Run smoke tests
7. **Monitor**: Watch for new issues

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run typecheck

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS: ${{ secrets.CONTRACT_ADDRESS }}
          NEXT_PUBLIC_BSC_RPC_URL: ${{ secrets.BSC_RPC_URL }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Support and Troubleshooting

### Common Issues

**Issue: Build Fails**
- Check Node.js version (18.x required)
- Verify all dependencies installed
- Check TypeScript errors
- Review build logs

**Issue: Environment Variables Not Working**
- Ensure `NEXT_PUBLIC_` prefix for client-side vars
- Redeploy after adding new variables
- Check variable scope (Production/Preview/Development)

**Issue: Slow Page Load**
- Run Lighthouse audit
- Check bundle size
- Optimize images
- Enable caching headers

**Issue: Wallet Connection Fails**
- Verify WalletConnect Project ID
- Check RPC URL accessible
- Test on BSC Mainnet
- Review browser console

### Getting Help

- Vercel Support: https://vercel.com/support
- Next.js Discord: https://nextjs.org/discord
- GitHub Issues: Create issue in repository
- Community: Reddit r/nextjs, r/ethdev

---

## Success Metrics

Monitor these KPIs post-deployment:

- **Uptime**: Target 99.9%
- **Page Load Time**: <3s
- **Core Web Vitals**: All green
- **Error Rate**: <0.1%
- **Transaction Success Rate**: >95%
- **Bounce Rate**: <40%
- **Conversion Rate**: Track presale participation

---

**Deployment Complete!** 🚀

**Production URL:** https://presale.elonbtc.com

**Next Steps:**
1. Run final smoke tests
2. Monitor for 24 hours
3. Announce launch
4. Gather user feedback
5. Plan iterations

---

**Last Updated:** 2025-10-10
**Version:** 1.0.0
