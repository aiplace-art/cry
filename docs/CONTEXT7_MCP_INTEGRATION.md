# 📚 Context7 MCP Integration - Real-Time Documentation

**Created:** 2025-10-10
**Status:** ✅ ACTIVE
**MCP Server:** Context7 by Upstash
**Repository:** https://github.com/upstash/context7
**Purpose:** Up-to-date, version-specific library documentation for all agents

---

## 🌟 Overview

**Context7 MCP** is a Model Context Protocol server that provides real-time, accurate, and version-specific documentation for libraries and frameworks. It eliminates outdated code examples and hallucinated APIs by fetching current documentation directly from source.

### Why Context7?

**Problem:** AI coding assistants often provide outdated or incorrect code examples based on old training data.

**Solution:** Context7 fetches real-time documentation, ensuring all 20 HypeAI agents always work with:
- ✅ **Current library versions**
- ✅ **Accurate API references**
- ✅ **Working code examples**
- ✅ **Version-specific features**
- ✅ **No hallucinated APIs**

---

## 🛠️ Available MCP Tools

### 1. `mcp__context7__resolve-library-id`

**Purpose:** Resolve a library/package name to a Context7-compatible library ID.

**Parameters:**
- `libraryName` (string) - Library name to search for (e.g., "react", "ethers", "next.js")

**Returns:**
- Context7-compatible library ID (format: `/org/project` or `/org/project/version`)
- Multiple matches with relevance scores
- Trust scores (7-10 are most authoritative)
- Documentation coverage statistics

**When to Use:**
- Before fetching documentation, always resolve the library ID first
- When searching for libraries by name
- When verifying library versions available

**Example Usage:**
```javascript
// Search for React library
{
  "libraryName": "react"
}

// Returns: /facebook/react or /facebook/react/v18.2.0
```

---

### 2. `mcp__context7__get-library-docs`

**Purpose:** Fetch up-to-date documentation for a specific library.

**Parameters:**
- `context7CompatibleLibraryID` (string, required) - Exact library ID from resolve-library-id
- `topic` (string, optional) - Specific topic to focus on (e.g., "hooks", "routing", "authentication")
- `tokens` (number, optional) - Max tokens of documentation (default: 5000, higher = more context)

**Returns:**
- Current, version-specific documentation
- Code examples and API references
- Best practices and usage patterns
- Type definitions (if available)

**When to Use:**
- After resolving library ID
- When implementing features with external libraries
- When debugging integration issues
- When learning new library APIs

**Example Usage:**
```javascript
// Get React hooks documentation
{
  "context7CompatibleLibraryID": "/facebook/react/v18.2.0",
  "topic": "hooks",
  "tokens": 5000
}

// Get Next.js routing docs
{
  "context7CompatibleLibraryID": "/vercel/next.js/v14.0.0",
  "topic": "routing"
}
```

---

## 👥 Context7 for All 20 Agents

### Development Division (8 Agents)

#### 1. 🗺️ ATLAS - Chief Research Officer

**Uses Context7 for:**
- Researching emerging blockchain libraries and frameworks
- Comparing different DeFi protocol implementations
- Analyzing competitor technology stacks
- Finding best practices for Web3 development

**Common Queries:**
```javascript
// Research Uniswap SDK
resolve-library-id("@uniswap/sdk-core")
get-library-docs("/uniswap/sdk-core", "liquidity pools")

// Compare blockchain libraries
resolve-library-id("web3.js")
resolve-library-id("ethers.js")
```

---

#### 2. 🏗️ NEXUS - Chief Technology Officer

**Uses Context7 for:**
- Architectural decisions for system design
- Selecting optimal libraries for scalability
- Evaluating microservices frameworks
- Cloud infrastructure documentation

**Common Queries:**
```javascript
// Next.js architecture
get-library-docs("/vercel/next.js", "app router architecture", 10000)

// Kubernetes patterns
resolve-library-id("kubernetes")
get-library-docs("/kubernetes/kubernetes", "deployment strategies")
```

---

#### 3. ⛓️ SOLIDITY - Lead Blockchain Developer

**Uses Context7 for:**
- OpenZeppelin contract documentation
- Solidity language features
- Chainlink oracle integration
- ERC token standards

**Common Queries:**
```javascript
// OpenZeppelin contracts
resolve-library-id("@openzeppelin/contracts")
get-library-docs("/openzeppelin/contracts", "ERC20 upgradeable")

// Hardhat deployment
resolve-library-id("hardhat")
get-library-docs("/nomiclabs/hardhat", "network configuration")

// Chainlink integration
resolve-library-id("@chainlink/contracts")
get-library-docs("/chainlink/chainlink", "price feeds")
```

---

#### 4. 🌐 BEACON - Backend Infrastructure Lead

**Uses Context7 for:**
- Express.js middleware and routing
- PostgreSQL/MongoDB query patterns
- Redis caching strategies
- JWT authentication implementation

**Common Queries:**
```javascript
// Express.js best practices
resolve-library-id("express")
get-library-docs("/expressjs/express", "middleware")

// PostgreSQL advanced queries
resolve-library-id("pg")
get-library-docs("/brianc/node-postgres", "connection pooling")

// Redis patterns
resolve-library-id("redis")
get-library-docs("/redis/redis", "pub/sub")
```

---

#### 5. 🎨 PRISM - Frontend Experience Director

**Uses Context7 for:**
- React latest features and patterns
- Next.js 14 App Router
- State management libraries (Zustand, Jotai)
- Web3 wallet integration

**Common Queries:**
```javascript
// React 18 features
resolve-library-id("react")
get-library-docs("/facebook/react", "concurrent features")

// Next.js App Router
resolve-library-id("next")
get-library-docs("/vercel/next.js", "app directory")

// Web3Modal integration
resolve-library-id("web3modal")
get-library-docs("/web3modal/web3modal", "wagmi")
```

---

#### 6. 🤖 NEURAL - Chief AI Officer

**Uses Context7 for:**
- TensorFlow.js documentation
- PyTorch model deployment
- Transformers library
- ML model optimization

**Common Queries:**
```javascript
// TensorFlow.js
resolve-library-id("@tensorflow/tfjs")
get-library-docs("/tensorflow/tfjs", "model training")

// Hugging Face Transformers
resolve-library-id("transformers")
get-library-docs("/huggingface/transformers", "bert models")

// FastAPI for ML APIs
resolve-library-id("fastapi")
get-library-docs("/tiangolo/fastapi", "async endpoints")
```

---

#### 7. ✅ VERIFY - Quality Assurance Director

**Uses Context7 for:**
- Jest testing patterns
- Playwright browser testing
- Hardhat test utilities
- E2E testing frameworks

**Common Queries:**
```javascript
// Jest latest features
resolve-library-id("jest")
get-library-docs("/jestjs/jest", "async testing")

// Playwright automation
resolve-library-id("playwright")
get-library-docs("/microsoft/playwright", "page object model")

// Hardhat testing
resolve-library-id("@nomicfoundation/hardhat-chai-matchers")
get-library-docs("/nomicfoundation/hardhat", "contract testing")
```

---

#### 8. 🛡️ GUARDIAN - Chief Security Officer

**Uses Context7 for:**
- Security libraries (helmet, cors)
- Cryptography packages
- Authentication frameworks (Passport.js)
- Security best practices

**Common Queries:**
```javascript
// Helmet.js security headers
resolve-library-id("helmet")
get-library-docs("/helmetjs/helmet", "content security policy")

// bcrypt password hashing
resolve-library-id("bcrypt")
get-library-docs("/kelektiv/node.bcrypt.js", "best practices")

// JWT security
resolve-library-id("jsonwebtoken")
get-library-docs("/auth0/node-jsonwebtoken", "token verification")
```

---

### Business Division (7 Agents)

#### 9. 👔 TITAN - Chief Executive Officer

**Uses Context7 for:**
- Business intelligence libraries
- Data visualization tools
- Analytics platforms
- Project management APIs

**Common Queries:**
```javascript
// Chart.js for dashboards
resolve-library-id("chart.js")
get-library-docs("/chartjs/chart.js", "real-time updates")

// Analytics tracking
resolve-library-id("@vercel/analytics")
get-library-docs("/vercel/analytics", "custom events")
```

---

#### 10. 📣 MOMENTUM - Chief Marketing Officer

**Uses Context7 for:**
- Social media API libraries
- Email marketing tools (SendGrid, Mailchimp)
- SEO optimization libraries
- Analytics SDKs

**Common Queries:**
```javascript
// Next.js SEO
resolve-library-id("next-seo")
get-library-docs("/garmeeh/next-seo", "structured data")

// SendGrid email
resolve-library-id("@sendgrid/mail")
get-library-docs("/sendgrid/sendgrid-nodejs", "templates")

// Twitter API
resolve-library-id("twitter-api-v2")
get-library-docs("/plhery/node-twitter-api-v2", "posting")
```

---

#### 11. 💬 PULSE - Chief Community Officer

**Uses Context7 for:**
- Discord bot libraries (discord.js)
- Telegram bot APIs
- Community analytics tools
- Notification systems

**Common Queries:**
```javascript
// Discord.js
resolve-library-id("discord.js")
get-library-docs("/discordjs/discord.js", "slash commands")

// Telegram Bot API
resolve-library-id("telegraf")
get-library-docs("/telegraf/telegraf", "webhook setup")
```

---

#### 12. 🤝 BRIDGE - Chief Partnership Officer

**Uses Context7 for:**
- CRM API integration (HubSpot, Salesforce)
- Partnership management tools
- API integration libraries
- Webhook handling

**Common Queries:**
```javascript
// HubSpot API
resolve-library-id("@hubspot/api-client")
get-library-docs("/hubspot/hubspot-api-nodejs", "contacts")

// Stripe partnerships
resolve-library-id("stripe")
get-library-docs("/stripe/stripe-node", "connect")
```

---

#### 13. ⚖️ COMPASS - Chief Legal Officer

**Uses Context7 for:**
- Document generation libraries
- PDF processing tools
- Compliance frameworks
- Data privacy libraries (GDPR)

**Common Queries:**
```javascript
// PDF generation
resolve-library-id("pdfkit")
get-library-docs("/foliojs/pdfkit", "templates")

// Document signing
resolve-library-id("docusign-esign")
get-library-docs("/docusign/docusign-node-client", "authentication")
```

---

#### 14. 📊 INSIGHT - Chief Data Officer

**Uses Context7 for:**
- Data analysis libraries (D3.js, Recharts)
- Database query optimization
- ETL tools and pipelines
- Real-time analytics

**Common Queries:**
```javascript
// D3.js visualizations
resolve-library-id("d3")
get-library-docs("/d3/d3", "scales and axes")

// Apache Kafka streaming
resolve-library-id("kafkajs")
get-library-docs("/tulios/kafkajs", "consumer groups")

// Prisma ORM
resolve-library-id("@prisma/client")
get-library-docs("/prisma/prisma", "relations")
```

---

#### 15. 🚀 CATALYST - Chief Growth Officer

**Uses Context7 for:**
- A/B testing libraries
- Growth analytics tools
- User tracking SDKs
- Conversion optimization

**Common Queries:**
```javascript
// PostHog analytics
resolve-library-id("posthog-js")
get-library-docs("/posthog/posthog-js", "feature flags")

// Mixpanel tracking
resolve-library-id("mixpanel")
get-library-docs("/mixpanel/mixpanel-node", "user profiles")
```

---

### Website Division (5 Agents)

#### 16. 🎨 PIXEL - Chief Design Officer

**Uses Context7 for:**
- Tailwind CSS utilities
- CSS-in-JS libraries (Styled Components, Emotion)
- Animation libraries (Framer Motion)
- Icon libraries

**Common Queries:**
```javascript
// Tailwind CSS plugins
resolve-library-id("tailwindcss")
get-library-docs("/tailwindlabs/tailwindcss", "custom utilities")

// Framer Motion animations
resolve-library-id("framer-motion")
get-library-docs("/framer/motion", "gesture animations")

// Lucide icons
resolve-library-id("lucide-react")
get-library-docs("/lucide-icons/lucide", "icon customization")
```

---

#### 17. 💫 VIBE - UX Director

**Uses Context7 for:**
- React Hook Form validation
- Accessibility libraries (React ARIA)
- User interaction patterns
- Mobile-first frameworks

**Common Queries:**
```javascript
// React Hook Form
resolve-library-id("react-hook-form")
get-library-docs("/react-hook-form/react-hook-form", "validation")

// React ARIA accessibility
resolve-library-id("react-aria")
get-library-docs("/adobe/react-spectrum", "focus management")
```

---

#### 18. ⚡ MOTION - Animation Director

**Uses Context7 for:**
- Animation libraries (GSAP, Anime.js)
- CSS animation utilities
- SVG animation tools
- Scroll-triggered animations

**Common Queries:**
```javascript
// GSAP animations
resolve-library-id("gsap")
get-library-docs("/greensock/gsap", "scroll trigger")

// React Spring
resolve-library-id("@react-spring/web")
get-library-docs("/pmndrs/react-spring", "physics")

// Lottie animations
resolve-library-id("lottie-react")
get-library-docs("/gamote/lottie-react", "interactive")
```

---

#### 19. 🎨 PALETTE - Brand Designer

**Uses Context7 for:**
- Color manipulation libraries (chroma.js)
- Theme switching utilities
- CSS variable management
- Design token systems

**Common Queries:**
```javascript
// Chroma.js color manipulation
resolve-library-id("chroma-js")
get-library-docs("/gka/chroma.js", "color scales")

// Next Themes
resolve-library-id("next-themes")
get-library-docs("/pacocoursey/next-themes", "system theme")
```

---

#### 20. 📐 LAYOUT - Web Architect

**Uses Context7 for:**
- CSS Grid and Flexbox patterns
- Responsive design frameworks
- Layout libraries (React Grid Layout)
- Breakpoint utilities

**Common Queries:**
```javascript
// React Grid Layout
resolve-library-id("react-grid-layout")
get-library-docs("/react-grid-layout/react-grid-layout", "responsive")

// React Responsive
resolve-library-id("react-responsive")
get-library-docs("/yocontra/react-responsive", "media queries")
```

---

## 🔄 Context7 Workflow

### Standard Workflow for All Agents:

**1. Identify Library Need**
```
Agent identifies need for external library documentation
Example: "I need to implement JWT authentication"
```

**2. Resolve Library ID**
```javascript
mcp__context7__resolve-library-id({
  "libraryName": "jsonwebtoken"
})

// Returns: /auth0/node-jsonwebtoken
```

**3. Fetch Documentation**
```javascript
mcp__context7__get-library-docs({
  "context7CompatibleLibraryID": "/auth0/node-jsonwebtoken",
  "topic": "signing and verification",
  "tokens": 5000
})

// Returns: Current JWT documentation with examples
```

**4. Implement with Confidence**
```
Use up-to-date documentation to implement feature correctly
No outdated APIs, no hallucinated methods
```

---

## 🎯 Use Cases by Division

### Development Division Use Cases

**Smart Contract Development (SOLIDITY):**
```javascript
// Get latest OpenZeppelin ERC20
resolve-library-id("@openzeppelin/contracts")
get-library-docs("/openzeppelin/contracts", "ERC20 security patterns")

// Result: Latest security best practices, no outdated patterns
```

**Backend API Development (BEACON):**
```javascript
// Express.js latest middleware
resolve-library-id("express")
get-library-docs("/expressjs/express", "error handling middleware")

// Result: Current error handling patterns with async/await
```

**Frontend Development (PRISM):**
```javascript
// React 18 concurrent features
resolve-library-id("react")
get-library-docs("/facebook/react", "useTransition hook")

// Result: Latest concurrent rendering APIs
```

---

### Business Division Use Cases

**Marketing Automation (MOMENTUM):**
```javascript
// SendGrid latest API
resolve-library-id("@sendgrid/mail")
get-library-docs("/sendgrid/sendgrid-nodejs", "dynamic templates")

// Result: Current template syntax and personalization
```

**Analytics Implementation (INSIGHT):**
```javascript
// Google Analytics 4
resolve-library-id("@analytics/google-analytics")
get-library-docs("/datalayerio/analytics", "custom events")

// Result: GA4 event tracking (not old Universal Analytics)
```

---

### Website Division Use Cases

**UI Component Development (PIXEL):**
```javascript
// Radix UI primitives
resolve-library-id("@radix-ui/react-dialog")
get-library-docs("/radix-ui/primitives", "accessibility")

// Result: Latest accessible component patterns
```

**Animation Implementation (MOTION):**
```javascript
// Framer Motion latest
resolve-library-id("framer-motion")
get-library-docs("/framer/motion", "layout animations")

// Result: Current layout animation APIs (not deprecated)
```

---

## 💡 Best Practices

### For All Agents:

**1. Always Resolve First**
```javascript
// ❌ WRONG: Using library ID without resolving
get-library-docs("/unknown/library", "topic")

// ✅ CORRECT: Always resolve first
resolve-library-id("library-name")
// Then use returned ID
```

**2. Be Specific with Topics**
```javascript
// ❌ WRONG: Too broad
get-library-docs("/facebook/react", "everything")

// ✅ CORRECT: Specific topic
get-library-docs("/facebook/react", "useState and useEffect hooks")
```

**3. Adjust Token Limit**
```javascript
// Simple usage: 3000-5000 tokens
get-library-docs("/lib/id", "topic", 5000)

// Complex architecture: 10000-15000 tokens
get-library-docs("/lib/id", "advanced patterns", 15000)
```

**4. Version Awareness**
```javascript
// Specify version when critical
resolve-library-id("next.js 14")
// Returns: /vercel/next.js/v14.0.0 (exact version)

// Or use latest
resolve-library-id("next.js")
// Returns: /vercel/next.js (latest stable)
```

---

## 🚀 Integration Examples

### Example 1: SOLIDITY Implementing Staking Contract

```javascript
// Step 1: Research OpenZeppelin staking patterns
resolve-library-id("@openzeppelin/contracts")

// Step 2: Get staking-related documentation
get-library-docs(
  "/openzeppelin/contracts",
  "Ownable and ReentrancyGuard",
  8000
)

// Step 3: Implement with current best practices
// Result: Secure staking contract using latest OpenZeppelin patterns
```

---

### Example 2: PRISM Building Web3 Trading Interface

```javascript
// Step 1: Get Wagmi hooks documentation
resolve-library-id("wagmi")
get-library-docs("/wagmi-dev/wagmi", "useContractWrite hook", 6000)

// Step 2: Get Web3Modal integration
resolve-library-id("@web3modal/wagmi")
get-library-docs("/web3modal/web3modal", "Next.js integration", 6000)

// Step 3: Implement trading UI with current APIs
// Result: Modern Web3 interface using latest Wagmi v2 APIs
```

---

### Example 3: MOTION Creating Scroll Animations

```javascript
// Step 1: Get Framer Motion scroll docs
resolve-library-id("framer-motion")
get-library-docs(
  "/framer/motion",
  "scroll-triggered animations with useScroll",
  7000
)

// Step 2: Get GSAP ScrollTrigger comparison
resolve-library-id("gsap")
get-library-docs("/greensock/gsap", "ScrollTrigger plugin", 7000)

// Step 3: Implement optimal scroll animations
// Result: Smooth scroll effects using current APIs
```

---

## 📊 Benefits for HypeAI Project

### Code Quality Improvements:
- ✅ **No outdated examples** - Always current library versions
- ✅ **No hallucinated APIs** - Real documentation from source
- ✅ **Version consistency** - All agents use same library versions
- ✅ **Best practices** - Latest recommended patterns

### Development Speed:
- ⚡ **Faster research** - Instant documentation access
- ⚡ **Less debugging** - Correct APIs from start
- ⚡ **Fewer rewrites** - No deprecated API usage
- ⚡ **Better collaboration** - Consistent knowledge across agents

### Security Benefits:
- 🛡️ **Latest security patches** - Current library versions
- 🛡️ **Known vulnerabilities avoided** - Up-to-date security info
- 🛡️ **Secure patterns** - Current security best practices

---

## 🔧 Technical Requirements

### Prerequisites:
- ✅ Node.js v18.0.0+ (HypeAI has v24.7.0)
- ✅ MCP client (Claude Code, Cursor, VS Code)
- ✅ Context7 MCP server installed

### Installation:
```bash
# Already integrated via MCP
# Available tools:
# - mcp__context7__resolve-library-id
# - mcp__context7__get-library-docs
```

### Configuration:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7"]
    }
  }
}
```

---

## 📚 Common Libraries for HypeAI

### Blockchain & Web3:
- `ethers` - Ethereum library
- `@openzeppelin/contracts` - Secure smart contracts
- `hardhat` - Ethereum development
- `@chainlink/contracts` - Oracle integration
- `wagmi` - React hooks for Ethereum
- `viem` - Type-safe Ethereum library

### Backend:
- `express` - Web framework
- `fastify` - Fast web framework
- `pg` - PostgreSQL client
- `mongoose` - MongoDB ODM
- `redis` - Redis client
- `jsonwebtoken` - JWT authentication

### Frontend:
- `react` - UI library
- `next` - React framework
- `tailwindcss` - Utility CSS
- `framer-motion` - Animations
- `recharts` - Charts
- `@tanstack/react-query` - Data fetching

### Testing:
- `jest` - Testing framework
- `@playwright/test` - E2E testing
- `@testing-library/react` - React testing
- `hardhat` - Smart contract testing

### AI/ML:
- `@tensorflow/tfjs` - TensorFlow.js
- `openai` - OpenAI API
- `langchain` - LLM framework
- `transformers` - Hugging Face

---

## 🎓 Training for Agents

### All 20 agents should:

**1. Use Context7 Before Implementation**
```
Before writing code with any external library:
1. Resolve library ID with Context7
2. Fetch relevant documentation
3. Implement with confidence
```

**2. Stay Updated**
```
When maintaining existing code:
1. Re-fetch documentation for libraries in use
2. Check for deprecated APIs
3. Update to current best practices
```

**3. Share Knowledge**
```
When discovering useful patterns:
1. Document in project knowledge base
2. Share library IDs with team
3. Update integration examples
```

---

## 📞 Support & Resources

**Documentation:** https://github.com/upstash/context7
**MCP Integration:** Fully integrated with Claude Code
**Available Tools:** 2 (resolve-library-id, get-library-docs)
**Supported Libraries:** 100,000+ npm packages, GitHub repos
**Update Frequency:** Real-time from source

---

## ✅ Integration Status

**Status:** ✅ FULLY INTEGRATED
**All 20 Agents:** ✅ HAVE ACCESS
**Tools Available:** 2/2
**Documentation:** ✅ COMPLETE
**Training:** ✅ DOCUMENTED

---

## 🎉 Conclusion

Context7 MCP is now available to **ALL 20 HypeAI agents** across all three divisions:

- **8 Development agents** - Up-to-date blockchain, backend, frontend docs
- **7 Business agents** - Current marketing, analytics, CRM APIs
- **5 Website agents** - Latest design, animation, layout libraries

**Mission:** Ensure all HypeAI code uses current, accurate, and working APIs! 🚀

**No more outdated examples. No more hallucinated APIs. Just reliable, real-time documentation.** 📚✨

---

**🤖 Generated by HypeAI Documentation Team**
**Date:** 2025-10-10
**Version:** 1.0.0
**Status:** ✅ PRODUCTION READY
