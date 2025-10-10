# HypeAI Launch Responsibilities Matrix

## Overview
This document defines exactly who does what during the 24-hour launch period. Every task has a primary person, a backup person, and clear decision-making authority.

---

## CORE TEAM STRUCTURE

### Command Structure

```
                    LAUNCH COMMANDER
                           |
        __________________|__________________
        |                 |                  |
   TECH LEAD         DEFI LEAD         MARKETING LEAD
        |                 |                  |
    Developers        Traders          Community Team
```

### Decision-Making Authority

**Level 1 - Emergency Stop (anyone can trigger):**
- Contract vulnerability discovered
- Major security breach
- Legal cease and desist

**Level 2 - Go/No-Go Decisions:**
- Launch Commander (with consensus from Tech + DeFi + Marketing Leads)

**Level 3 - Tactical Decisions:**
- Tech Lead: All technical deployment decisions
- DeFi Lead: All liquidity and trading decisions
- Marketing Lead: All content and promotional decisions

**Level 4 - Operational Decisions:**
- Individual team members within their domain

---

## ROLE DEFINITIONS

### 1. LAUNCH COMMANDER
**Primary:** [NAME]
**Backup:** [NAME]
**Hours:** Full 24 hours (with 2-hour break at T+6 to T+8)

#### Responsibilities:
- **BEFORE LAUNCH:**
  - Final go/no-go decision at T-2:00
  - Approve all pre-launch preparations
  - Coordinate all team members
  - Review and sign off on all checklists

- **DURING LAUNCH (T+0 to T+4):**
  - Monitor deployment transaction
  - Declare deployment success/failure
  - Coordinate Etherscan verification
  - Authorize liquidity deployment
  - Make all critical decisions

- **DURING LAUNCH (T+4 to T+24):**
  - Monitor overall progress
  - Coordinate between teams
  - Handle crisis situations
  - Approve major announcements
  - Track KPIs against targets
  - Make adjustment decisions

- **COMMUNICATION:**
  - Primary spokesperson in war room
  - All major decisions announced by Commander
  - Maintains timeline adherence
  - Escalates issues to team

#### Success Criteria:
- ✅ Smooth coordination between all teams
- ✅ All go/no-go decisions made on time
- ✅ No critical issues unaddressed
- ✅ 24-hour plan executed successfully

#### Emergency Protocols:
- Can pause any operation
- Can activate emergency protocols
- Can reassign responsibilities
- Has final authority on all decisions

---

### 2. LEAD DEVELOPER (Tech Lead)
**Primary:** [NAME]
**Backup:** [NAME]
**Hours:** T-6:00 to T+4:00 (10 hours critical period)

#### Responsibilities:
- **T-6:00 to T-0:00:**
  - Final smart contract review
  - Deployment script preparation
  - Gas price monitoring
  - Network status monitoring
  - Hardware wallet setup

- **T+0:00 (Deployment Hour):**
  - **00:00:** Execute deployment command
    ```bash
    npx hardhat run scripts/deploy-mainnet.js --network mainnet
    ```
  - **00:02:** Announce transaction hash in war room
  - **00:05:** Confirm deployment (wait for 15+ confirmations)
  - **00:06:** Verify contract address matches
  - **00:07:** Test basic contract functions
  - **00:10:** Begin Etherscan verification
  - **00:15:** Transfer ownership to multisig
  - **00:20:** Test emergency pause function

- **T+1:00 (Verification Hour):**
  - **01:00:** Submit Etherscan verification
    ```bash
    npx hardhat verify --network mainnet [ADDRESS]
    ```
  - **01:10:** Confirm verification successful
  - **01:15:** Add contract info to Etherscan
  - **01:20:** Upload logo and description
  - **01:30:** Provide contract address to DeFi Lead

- **T+2:00 to T+4:00:**
  - Monitor contract interactions
  - Watch for any anomalies
  - Respond to technical questions
  - Prepare for ownership transfer

#### Backup Responsibilities:
- **Backup Developer shadows all operations**
- Ready to take over at any moment
- Monitors network independently
- Has deployment script ready on separate machine

#### Success Criteria:
- ✅ Contract deployed successfully within 5 minutes
- ✅ Contract verified within 15 minutes
- ✅ All functions working correctly
- ✅ Ownership transferred securely
- ✅ No technical issues during launch

#### Emergency Procedures:
- **If deployment fails:** Backup Developer deploys immediately from backup script
- **If contract has issue:** Pause mechanism activated immediately
- **If verification fails:** Manual verification through Etherscan UI

---

### 3. SECURITY LEAD
**Primary:** [NAME]
**Backup:** [NAME]
**Hours:** T-6:00 to T+6:00 (12 hours critical period)

#### Responsibilities:
- **T-6:00 to T-0:00:**
  - Final security audit review
  - Monitor for any last-minute vulnerabilities
  - Verify deployment wallet security
  - Review emergency pause mechanism

- **T+0:00 to T+0:30 (Critical Watch Period):**
  - **00:05:** Verify deployed bytecode matches source code
  - **00:08:** Check contract constructor arguments
  - **00:10:** Verify all access controls set correctly
  - **00:15:** Test emergency pause function
  - **00:20:** Monitor first transactions for anomalies
  - **00:30:** Declare security clearance or raise concerns

- **T+0:30 to T+6:00:**
  - Monitor all contract interactions
  - Watch for suspicious transactions
  - Track large wallet movements
  - Alert on potential exploits
  - Monitor for front-running attempts

#### Monitoring Tools:
- Tenderly alerts configured
- Forta bot watching contract
- Manual transaction review
- Wallet tracking dashboard

#### Success Criteria:
- ✅ Bytecode verification confirmed
- ✅ No vulnerabilities detected in live contract
- ✅ Emergency mechanisms working
- ✅ No security incidents

#### Emergency Procedures:
- **If vulnerability found:** Immediately pause contract
- **If exploit detected:** Execute emergency withdrawal protocol
- **If suspicious activity:** Alert Launch Commander immediately

---

### 4. DEFI LEAD (Liquidity Manager)
**Primary:** [NAME]
**Backup:** [NAME]
**Hours:** T+1:00 to T+8:00 (7 hours critical period)

#### Responsibilities:
- **T+1:30:** Receive contract address from Tech Lead
- **T+1:40:** Verify contract on Etherscan
- **T+1:50:** Prepare liquidity deployment wallet

- **T+2:00 (Liquidity Deployment):**
  - **02:00:** Create Uniswap V3 pool
    - Navigate to Uniswap V3 interface
    - Select HYPE/WETH pair
    - Set fee tier: 1.00%
    - Set price range: [PARAMETERS]
    - Set initial price: [PRICE]

  - **02:05:** Add liquidity
    - Amount: [X] ETH + [Y] HYPE tokens
    - Confirm transaction
    - Wait for confirmation

  - **02:10:** Verify pool created
    - Check pool address
    - Verify liquidity amounts
    - Check price is correct

  - **02:15:** Test swaps
    - Execute small buy (0.01 ETH)
    - Verify tokens received
    - Execute small sell
    - Verify ETH received

  - **02:20:** Lock liquidity
    - Use Team.Finance or Unicrypt
    - Lock for 365 days
    - Verify lock transaction
    - Save lock proof

  - **02:30:** Announce to team
    - Pool address: [ADDRESS]
    - Uniswap link: [LINK]
    - DEXTools link: [LINK]

- **T+2:30 to T+8:00:**
  - Monitor price action
  - Watch for large trades
  - Alert on unusual activity
  - Manage price impact
  - Coordinate with Marketing on milestones

#### Monitoring Focus:
- Price stability
- Liquidity depth
- Volume tracking
- Whale movements
- Slippage percentage

#### Success Criteria:
- ✅ Pool created successfully within 30 minutes
- ✅ Liquidity locked for 365 days
- ✅ Swaps working correctly
- ✅ Price discovery happening naturally
- ✅ No major price manipulation

#### Emergency Procedures:
- **If pool creation fails:** Retry with adjusted parameters
- **If price crashes:** Coordinate with Marketing for response
- **If liquidity issues:** Activate backup liquidity wallet

---

### 5. SOCIAL MEDIA LEAD
**Primary:** [NAME]
**Backup:** [NAME]
**Hours:** Full 24 hours (with 2 × 2-hour breaks)

#### Responsibilities:
- **BEFORE T+8:00 (Stealth Phase):**
  - Prepare all announcement content
  - Queue first wave of tweets
  - Prepare graphics and videos
  - Coordinate with influencers
  - Do NOT post publicly yet

- **T+8:00 (Asia Wave):**
  - **08:00:** Post major announcement tweet
  - **08:05:** Pin in Telegram
  - **08:10:** Post to all Asia Telegram groups (50+)
  - **08:15:** Coordinate influencer posts
  - **08:20:** Post to Reddit (Asian communities)
  - **08:25:** Announce in Discord
  - **08:30:** Start Twitter Space (Asia focused)

- **T+12:00 (Europe Wave):**
  - **12:00:** Post Europe announcement
  - **12:05:** Activate European influencers
  - **12:10:** Post to European groups (100+)
  - **12:15:** Submit to European news sites
  - **12:20:** Start European Twitter Space

- **T+16:00 (Americas Wave):**
  - **16:00:** Post Americas announcement
  - **16:05:** Activate American influencers
  - **16:10:** Post to American groups (200+)
  - **16:15:** Submit to major news outlets
  - **16:20:** Launch American Twitter Space
  - **17:00:** TikTok campaign launch

- **Throughout 24 hours:**
  - Post content every 10-15 minutes
  - Respond to mentions and tags
  - Engage with community
  - Share holder milestones
  - Retweet community content

#### Content Calendar:
- See 24H_MASTER_PLAN.md for exact posts per hour
- All content pre-approved and ready
- Graphics loaded in scheduling tool
- Videos uploaded to CDN

#### Success Criteria:
- ✅ All major announcements posted on time
- ✅ Influencers post as scheduled
- ✅ Strong social engagement
- ✅ Trending on Twitter in target regions
- ✅ No controversial posts or mistakes

#### Emergency Procedures:
- **If account locked:** Switch to backup account
- **If major FUD:** Execute FUD response protocol
- **If controversy:** Consult with Launch Commander before responding

---

### 6. COMMUNITY MANAGERS (4 people, rotating 6-hour shifts)

#### Shift 1: T+0:00 to T+6:00
**Primary:** [NAME]
**Backup:** [NAME]

**Responsibilities:**
- Monitor Telegram group
- Answer questions about contract
- Share Etherscan links
- Explain how to view on blockchain
- Build anticipation for public launch
- Keep community calm and informed

#### Shift 2: T+6:00 to T+12:00
**Primary:** [NAME]
**Backup:** [NAME]

**Responsibilities:**
- Handle Asia wave questions
- Provide buying instructions (in multiple languages)
- Share "how to buy" guides
- Moderate group (remove scammers/spammers)
- Share milestones (holder count, volume)
- Build excitement

#### Shift 3: T+12:00 to T+18:00
**Primary:** [NAME]
**Backup:** [NAME]

**Responsibilities:**
- Handle Europe + Americas waves
- Respond to technical questions
- Share chart updates
- Moderate high traffic (expect 100+ messages/minute)
- Share partnership announcements
- Manage contests and giveaways

#### Shift 4: T+18:00 to T+24:00
**Primary:** [NAME]
**Backup:** [NAME]

**Responsibilities:**
- Handle evening momentum
- Countdown to 24-hour milestone
- Share celebration content
- Thank community members
- Prepare for Day 2 transition
- Moderate celebration

#### All Shifts - Responsibilities:
- **Response time:** <2 minutes for all questions
- **Tone:** Professional, friendly, enthusiastic
- **Never:** Make price predictions or financial advice
- **Always:** Use approved responses from FAQ document
- **Report:** Any concerning activity to Launch Commander

#### Tools:
- Telegram admin panel
- Pre-written FAQ responses
- Ban/mute capabilities
- Price bot monitoring
- Holder count tracker

#### Success Criteria (per shift):
- ✅ All questions answered promptly
- ✅ No scammers/spammers in group
- ✅ Positive community sentiment
- ✅ Growth targets met
- ✅ No incidents or controversies

---

### 7. CONTENT LEAD
**Primary:** [NAME]
**Backup:** [NAME]
**Hours:** Full 24 hours (with breaks)

#### Responsibilities:
- **Real-time content creation:**
  - Generate graphics for milestones as they happen
  - Update statistics in real-time
  - Create celebration graphics
  - Adapt content based on what's working

- **Metrics tracking:**
  - Holder count updates
  - Volume updates
  - Price updates
  - Telegram growth
  - Social engagement metrics

- **Content distribution:**
  - Provide content to Social Media Lead
  - Provide content to Community Managers
  - Update website with live stats
  - Create shareable infographics

- **Hour-by-hour content:**
  - Refer to 24H_MASTER_PLAN.md
  - Ensure content is ready 10 minutes before needed
  - Adapt if circumstances change
  - Create bonus content for unexpected wins

#### Tools:
- Canva / Photoshop for graphics
- Video editing software
- Google Docs for text content
- Shared drive for asset management

#### Success Criteria:
- ✅ All scheduled content delivered on time
- ✅ High-quality graphics and videos
- ✅ Real-time metrics accurate
- ✅ Community engaged with content

---

### 8. PAID MARKETING COORDINATOR
**Primary:** [NAME]
**Backup:** [NAME]
**Hours:** T+6:00 to T+20:00 (14 hours)

#### Responsibilities:
- **Ad campaign management:**
  - Activate campaigns at scheduled times
  - Monitor ad performance
  - Adjust budgets based on ROI
  - Pause underperforming ads
  - Scale successful campaigns

- **Influencer coordination:**
  - Confirm influencers are posting on time
  - Provide them with latest stats
  - Release payments after posts verified
  - Track engagement on their posts
  - Request additional posts if budget allows

- **Budget tracking:**
  - Track spend against budget
  - Report ROI to Launch Commander
  - Recommend budget adjustments
  - Ensure we don't overspend

#### Budget Control:
- **Total Marketing Budget:** $135,850
  - Influencers: $47,850
  - Paid ads: $81,000
  - Press: $2,000
  - Community: $5,000

- **Approval required for:**
  - Any spend >$1,000 beyond plan
  - Any new influencer
  - Any campaign changes

#### Success Criteria:
- ✅ All campaigns activated on time
- ✅ Budget spent efficiently
- ✅ Positive ROI on advertising
- ✅ Influencers post as scheduled
- ✅ Strong reach and engagement

---

### 9. ANALYTICS MONITOR
**Primary:** [NAME]
**Backup:** [NAME]
**Hours:** Full 24 hours (with breaks)

#### Responsibilities:
- **Track KPIs every hour:**
  - Holder count
  - Trading volume
  - Price action
  - Market cap
  - Telegram members
  - Discord members
  - Twitter followers
  - Website traffic

- **Compare to targets:**
  - Flag if any metric <75% of target
  - Alert Launch Commander if <50%
  - Recommend boosts if needed

- **Update launch dashboard:**
  - Real-time metrics
  - Progress bars
  - Charts and graphs
  - Milestone achievements

- **Generate reports:**
  - Hourly summary for team
  - 6-hour deep dive
  - 24-hour final report

#### Tools:
- Launch dashboard (HTML page)
- Google Sheets for tracking
- Dune Analytics dashboards
- DEXTools API
- Etherscan API

#### Success Criteria:
- ✅ All metrics tracked accurately
- ✅ Team informed of progress
- ✅ Early warning for issues
- ✅ Data-driven decisions

---

## BACKUP ASSIGNMENTS

### If Primary Person Unavailable:

| Role | Primary | Backup 1 | Backup 2 |
|------|---------|----------|----------|
| Launch Commander | [NAME] | [NAME] | [NAME] |
| Lead Developer | [NAME] | [NAME] | [NAME] |
| Security Lead | [NAME] | [NAME] | [NAME] |
| DeFi Lead | [NAME] | [NAME] | [NAME] |
| Social Media Lead | [NAME] | [NAME] | [NAME] |
| Community Mgr Shift 1 | [NAME] | [NAME] | [NAME] |
| Community Mgr Shift 2 | [NAME] | [NAME] | [NAME] |
| Community Mgr Shift 3 | [NAME] | [NAME] | [NAME] |
| Community Mgr Shift 4 | [NAME] | [NAME] | [NAME] |
| Content Lead | [NAME] | [NAME] | [NAME] |
| Marketing Coordinator | [NAME] | [NAME] | [NAME] |
| Analytics Monitor | [NAME] | [NAME] | [NAME] |

---

## COMMUNICATION PROTOCOL

### War Room (Discord #launch-command)
- **Who:** Core team only (8 people)
- **Purpose:** Real-time coordination and decision-making
- **Protocol:**
  - All critical updates posted here
  - All decisions announced here
  - No external communication
  - Recording active 24/7

### Team Telegram
- **Who:** Full team (all 20+ members)
- **Purpose:** General coordination and updates
- **Protocol:**
  - Major milestones announced
  - Schedule reminders
  - Celebration and morale

### Emergency Signal Group
- **Who:** Core team only (8 people)
- **Purpose:** Emergency situations only
- **Protocol:**
  - DO NOT use for routine communication
  - Only for: contract issues, legal issues, major crises
  - Response required <5 minutes

### Public Telegram
- **Who:** Community managers + team
- **Purpose:** Community engagement
- **Protocol:**
  - Team members use [TEAM] tag
  - No internal discussion here
  - Professional communication only

---

## HANDOFF PROCEDURES

### When Shift Changes:
1. **Outgoing person:**
   - Post status update in war room
   - List any pending issues
   - Brief incoming person (5-10 min call)
   - Confirm incoming person is ready

2. **Incoming person:**
   - Read all war room messages since last shift
   - Review current metrics
   - Confirm understanding of any issues
   - Post "Taking over [ROLE]" in war room

3. **Launch Commander:**
   - Acknowledges handoff
   - Confirms incoming person is ready

### When Taking Break:
- **Notify in war room before leaving**
- **Backup person confirms they're covering**
- **Keep phone available for emergencies**
- **Return on time**

---

## ESCALATION PATHS

### Level 1 - Operational Issues
**Examples:** Social media question, content timing, minor bugs
**Handler:** Role owner makes decision
**Escalate if:** Can't solve in 15 minutes

### Level 2 - Tactical Issues
**Examples:** Influencer not posting, ad campaign underperforming, moderate FUD
**Handler:** Team lead (Tech/DeFi/Marketing) makes decision
**Escalate if:** Impacts launch success or requires budget change

### Level 3 - Strategic Issues
**Examples:** Major target missed, large FUD campaign, security concern
**Handler:** Launch Commander with team leads
**Escalate if:** Could require launch pause or major pivot

### Level 4 - Critical Issues
**Examples:** Contract vulnerability, legal threat, major security breach
**Handler:** Launch Commander emergency protocol
**Escalate to:** Legal, security experts, executive team

---

## SUCCESS METRICS BY ROLE

### Launch Commander
- ✅ Launch executes within 10 minutes of planned time
- ✅ All major decisions made promptly
- ✅ No unaddressed critical issues
- ✅ Team morale high
- ✅ 24-hour targets achieved

### Lead Developer
- ✅ Contract deployed successfully
- ✅ Contract verified on Etherscan
- ✅ Zero reverted transactions
- ✅ All functions working correctly
- ✅ Ownership transferred securely

### Security Lead
- ✅ No vulnerabilities exploited
- ✅ Bytecode verification confirmed
- ✅ Emergency systems tested and ready
- ✅ No security incidents

### DeFi Lead
- ✅ Liquidity deployed successfully
- ✅ Trading active within 2.5 hours of contract deployment
- ✅ Liquidity locked for 365 days
- ✅ Price stable and healthy
- ✅ Volume targets met

### Social Media Lead
- ✅ All announcements on time
- ✅ Trending on Twitter (at least 1 region)
- ✅ Strong engagement (>5% rate)
- ✅ All influencers post as scheduled
- ✅ No controversial incidents

### Community Managers
- ✅ <2 min average response time
- ✅ 95%+ positive sentiment
- ✅ Community growth targets met
- ✅ Zero successful scams
- ✅ High engagement in activities

### Content Lead
- ✅ All content delivered on time
- ✅ High-quality output maintained
- ✅ Real-time metrics accurate
- ✅ Community engaged with content

### Marketing Coordinator
- ✅ All campaigns activated on time
- ✅ Budget spent wisely
- ✅ Positive ROI
- ✅ All influencers post on schedule

### Analytics Monitor
- ✅ All metrics tracked accurately
- ✅ Hourly reports delivered
- ✅ Early warnings provided when needed
- ✅ Dashboard updated real-time

---

## TEAM CONTACT LIST

| Name | Role | Phone | Signal | Email |
|------|------|-------|--------|-------|
| [NAME] | Launch Commander | [PHONE] | [USERNAME] | [EMAIL] |
| [NAME] | Lead Developer | [PHONE] | [USERNAME] | [EMAIL] |
| [NAME] | Backup Developer | [PHONE] | [USERNAME] | [EMAIL] |
| [NAME] | Security Lead | [PHONE] | [USERNAME] | [EMAIL] |
| [NAME] | DeFi Lead | [PHONE] | [USERNAME] | [EMAIL] |
| [NAME] | Social Media Lead | [PHONE] | [USERNAME] | [EMAIL] |
| [NAME] | Community Mgr 1 | [PHONE] | [USERNAME] | [EMAIL] |
| [NAME] | Community Mgr 2 | [PHONE] | [USERNAME] | [EMAIL] |
| [NAME] | Community Mgr 3 | [PHONE] | [USERNAME] | [EMAIL] |
| [NAME] | Community Mgr 4 | [PHONE] | [USERNAME] | [EMAIL] |
| [NAME] | Content Lead | [PHONE] | [USERNAME] | [EMAIL] |
| [NAME] | Marketing Coord | [PHONE] | [USERNAME] | [EMAIL] |
| [NAME] | Analytics Monitor | [PHONE] | [USERNAME] | [EMAIL] |

---

**Remember: Clear responsibilities prevent chaos. Everyone knows their job, and everyone has backup. We succeed together! 🚀**
