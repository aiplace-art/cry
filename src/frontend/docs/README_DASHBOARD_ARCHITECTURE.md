# HypeAI Private Sale Dashboard - Architecture Documentation

**Status:** Ready for Implementation
**Created:** 2025-10-18
**Design Style:** BNB Chain (Binance Smart Chain)

---

## Quick Start

This folder contains the complete architecture documentation for the HypeAI Private Sale Dashboard. Read documents in this order:

1. **START HERE** → `ARCHITECTURE_SUMMARY.md` (Overview)
2. **DESIGN** → `PRIVATE_SALE_DASHBOARD_ARCHITECTURE.md` (Complete architecture)
3. **TECHNICAL** → `DASHBOARD_TECH_SPEC.md` (Technical specifications)
4. **VISUAL** → `DASHBOARD_DESIGN_GUIDE.md` (Design system & examples)
5. **COMPONENTS** → `../components/dashboard/COMPONENTS_LIST.md` (Component catalog)

---

## Document Index

### Core Architecture (4 Documents)

#### 1. ARCHITECTURE_SUMMARY.md
**Size:** 8 KB | **Reading time:** 10 min

**Quick reference guide covering:**
- Documentation structure
- Key design decisions
- 8-week implementation plan
- Dashboard pages overview
- API endpoints
- Success metrics
- Next steps

**Best for:** Project managers, stakeholders, quick overview

---

#### 2. PRIVATE_SALE_DASHBOARD_ARCHITECTURE.md
**Size:** 21 KB | **Reading time:** 30 min

**Complete architecture including:**
- Design system (colors, typography, spacing)
- Component hierarchy
- Data flow diagrams
- Layout wireframes (desktop & mobile)
- Interaction patterns
- Responsive design strategy
- Performance targets
- Accessibility standards
- Security architecture
- Technology stack
- Implementation roadmap

**Best for:** Architects, lead developers, full technical overview

---

#### 3. DASHBOARD_TECH_SPEC.md
**Size:** 23 KB | **Reading time:** 35 min

**Detailed technical specifications:**
- System architecture patterns
- Component props & interfaces
- State management (Context, Hooks)
- API endpoints (REST + WebSocket)
- Smart contract integration
- Security specifications
- Testing strategy
- Deployment configuration
- Monitoring & observability

**Best for:** Backend developers, full-stack developers, DevOps

---

#### 4. DASHBOARD_DESIGN_GUIDE.md
**Size:** 18 KB | **Reading time:** 25 min

**Visual design system:**
- BNB Chain color palette
- Typography scale
- Spacing & layout
- Complete component examples (code)
- Animations & transitions
- Responsive patterns
- Accessibility guidelines
- Performance best practices

**Best for:** Frontend developers, UI designers, QA testers

---

### Component Catalog (1 Document)

#### 5. ../components/dashboard/COMPONENTS_LIST.md
**Size:** 18 KB | **Reading time:** 20 min

**45 Components organized by priority:**
- P0 (Critical) - Week 1-2
- P1 (High) - Week 3-4
- P2 (Medium) - Week 5-6
- P3 (Low) - Week 7-8

**Each component includes:**
- Props specification
- Dependencies
- Features
- Implementation notes

**Best for:** Frontend developers, sprint planning

---

## Key Information

### Design System

**Color Palette:**
```css
Primary:   #F3BA2F (BNB Gold)
Dark:      #0B0E11 (Deep Black)
Card:      #1E2329 (Dark Gray)
Success:   #0ECB81 (Green)
Error:     #F6465D (Red)
```

**Typography:**
```css
Font:      'Inter' (Primary)
Mono:      'JetBrains Mono' (Numbers/Addresses)
Scale:     12px - 48px (xs - 5xl)
```

---

### Dashboard Structure

```
Dashboard
├── Overview (Default)
│   ├── Stats Cards (4 KPIs)
│   ├── Token Price Widget
│   ├── Vesting Progress
│   └── Activity Feed
├── Buy Tokens
│   ├── Payment Method Selector
│   ├── Purchase Calculator
│   └── Transaction Preview
├── My Purchases
│   ├── History Table
│   └── Transaction Details
├── Referral System
│   ├── Referral Link Generator
│   ├── Stats Cards
│   └── Referral List
├── Wallet
│   ├── Balance Card
│   ├── Vesting Schedule
│   └── Claim Tokens
└── Settings
    ├── Profile
    ├── Notifications
    └── Security
```

---

### Technology Stack

**Frontend:**
- Next.js 14.0 + React 18.2 + TypeScript 5.0
- Tailwind CSS 3.4 + Framer Motion 10.0
- ethers.js 6.9 + wagmi 1.4
- Recharts 2.10

**Backend:**
- Next.js API Routes
- PostgreSQL 16 + Redis 7
- Prisma 5.7

**Blockchain:**
- Binance Smart Chain (BSC)
- Smart contracts (Solidity)

---

### Implementation Timeline

```
Week 1-2: Foundation (P0)
├── Layout components
├── Core UI (Button, Card, Input)
└── Stats & Overview

Week 3-4: Core Features (P1)
├── Purchase flow
├── Referral system
└── Wallet management

Week 5-6: Polish (P2)
├── Settings page
├── Mobile optimization
└── Testing

Week 7-8: Launch (P3)
├── Bug fixes
├── Performance tuning
└── Deployment
```

---

### 45 Components Breakdown

**By Priority:**
- P0 (Critical): 15 components
- P1 (High): 19 components
- P2 (Medium): 9 components
- P3 (Low): 2 components

**By Category:**
- Layout: 7 components
- Overview: 6 components
- Purchase: 6 components
- History: 4 components
- Referral: 5 components
- Wallet: 5 components
- Settings: 4 components
- UI: 8 components

---

## Quick Commands

### Start Development

```bash
# Install dependencies
cd src/frontend
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000/dashboard
```

### View Documentation

```bash
# Read architecture summary
cat docs/ARCHITECTURE_SUMMARY.md

# View all docs
ls -la docs/

# Find specific component
grep -r "StatsCard" components/
```

---

## API Reference

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Private Sale
```
GET    /api/private-sale/config
POST   /api/private-sale/purchase
GET    /api/private-sale/purchases
GET    /api/private-sale/stats
```

### Wallet
```
GET    /api/wallet/balance
POST   /api/wallet/claim
GET    /api/wallet/vesting
```

### Referrals
```
GET    /api/referrals
POST   /api/referrals/claim
GET    /api/referrals/stats
```

---

## FAQs

### Q: Where do I start coding?

**A:** Start with P0 components in Week 1-2:
1. Read `DASHBOARD_DESIGN_GUIDE.md` for code examples
2. Check `COMPONENTS_LIST.md` for implementation order
3. Begin with `DashboardLayout` component

### Q: What's the color for buttons?

**A:** Primary buttons use BNB Gold gradient:
```css
bg-gradient-to-r from-[#F3BA2F] to-[#FFD54F]
```

### Q: How do I connect to Web3?

**A:** See `DASHBOARD_TECH_SPEC.md` section 6.2:
```typescript
import { useWallet } from '../hooks/useWallet';

const { account, connect, disconnect } = useWallet();
```

### Q: Where are the API endpoints?

**A:** See `DASHBOARD_TECH_SPEC.md` section 5.1 for complete API specs.

### Q: What's the mobile breakpoint?

**A:** Mobile-first breakpoints:
- Mobile: < 640px
- Tablet: 640-1024px
- Desktop: > 1024px

---

## Useful Links

### Internal Documents
- [Main Architecture](./PRIVATE_SALE_DASHBOARD_ARCHITECTURE.md)
- [Tech Spec](./DASHBOARD_TECH_SPEC.md)
- [Design Guide](./DASHBOARD_DESIGN_GUIDE.md)
- [Components List](../components/dashboard/COMPONENTS_LIST.md)
- [Summary](./ARCHITECTURE_SUMMARY.md)

### External Resources
- [BNB Chain Design](https://www.bnbchain.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Wagmi Docs](https://wagmi.sh/)
- [Next.js Docs](https://nextjs.org/docs)

---

## File Sizes

```
Total Documentation: ~88 KB

PRIVATE_SALE_DASHBOARD_ARCHITECTURE.md:  21 KB
DASHBOARD_TECH_SPEC.md:                  23 KB
DASHBOARD_DESIGN_GUIDE.md:               18 KB
COMPONENTS_LIST.md:                      18 KB
ARCHITECTURE_SUMMARY.md:                  8 KB
```

---

## Team Contacts

**Architecture:** System Architect (this documentation)
**Frontend:** Frontend Lead (component implementation)
**Backend:** Backend Lead (API development)
**Design:** UI/UX Designer (Figma files)
**Smart Contracts:** Blockchain Developer (BSC integration)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-18 | Initial architecture complete |

---

## Next Steps

### For Product Managers:
1. Review `ARCHITECTURE_SUMMARY.md`
2. Approve design & timeline
3. Assign team members

### For Developers:
1. Read `DASHBOARD_DESIGN_GUIDE.md`
2. Setup development environment
3. Start with P0 components

### For Designers:
1. Review color palette & typography
2. Create Figma component library
3. Design missing assets

### For QA:
1. Read `DASHBOARD_TECH_SPEC.md` section 8
2. Prepare test cases
3. Setup testing environment

---

## License

Proprietary - HypeAI Project
Copyright 2025 HypeAI. All rights reserved.

---

**Document Status:** Complete
**Last Updated:** 2025-10-18
**Maintained by:** Architecture Team
