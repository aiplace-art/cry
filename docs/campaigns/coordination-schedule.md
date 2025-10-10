# HypeAI Agent Coordination Schedule

## 🎯 Purpose

This document ensures all marketing agents work in sync, avoid conflicts, and maximize campaign effectiveness through coordinated execution.

---

## 👥 AGENT ROSTER & RESPONSIBILITIES

### **Campaign Coordinator Agent (YOU)**
- **Role:** Orchestrates all campaigns, timeline management, crisis response
- **Daily Tasks:**
  - Morning briefing (06:00 UTC)
  - Metrics review
  - Agent task assignment
  - Evening debrief (22:00 UTC)
- **Tools:** Project management board, analytics dashboard
- **Dependencies:** Reports from all other agents

---

### **Content Manager Agent**
- **Role:** Creates all written, video, graphic content
- **Daily Tasks:**
  - Social media posts (3-5/day)
  - Blog articles (2/week)
  - Video scripts (3/week)
  - Infographics (2/week)
- **Coordination Points:**
  - **WITH Influencer Agent:** Provide content for influencers 24h advance
  - **WITH Community Agent:** Get community feedback on content ideas
  - **WITH Campaign Coordinator:** Align content with campaign schedule
- **Deliverables Location:** `/content/` folder, shared Figma
- **Review Process:** Content > Coordinator approval > Publish

---

### **Influencer Coordination Agent**
- **Role:** Manages all influencer relationships, campaigns, payments
- **Daily Tasks:**
  - Outreach to new influencers (5-10/day)
  - Manage active campaigns (10-20 ongoing)
  - Track performance metrics
  - Process payments weekly
- **Coordination Points:**
  - **WITH Content Agent:** Receive promotional materials 24h before influencer posts
  - **WITH Campaign Coordinator:** Get campaign timing, budgets
  - **WITH Community Agent:** Monitor influencer post engagement
- **Tools:** Influencer CRM, payment processor
- **Weekly Meeting:** Wednesdays 14:00 UTC with Coordinator

---

### **Community Manager Agent**
- **Role:** 24/7 Telegram/Discord management, engagement, support
- **Shift Coverage:**
  - Shift 1 (00:00-08:00 UTC): Night team
  - Shift 2 (08:00-16:00 UTC): Day team
  - Shift 3 (16:00-00:00 UTC): Evening team
- **Daily Tasks:**
  - Respond to questions <5min
  - Run daily engagement activities
  - Monitor sentiment
  - Report issues immediately
- **Coordination Points:**
  - **WITH ALL Agents:** Real-time community feedback
  - **WITH Crisis Team:** Escalate negative sentiment immediately
  - **WITH Content Agent:** Request content based on common questions
- **Tools:** Telegram, Discord, sentiment analysis tool

---

### **PR & Media Relations Agent**
- **Role:** Manages journalist relationships, press releases, media coverage
- **Weekly Tasks:**
  - Send 3-5 press releases
  - Pitch 10-15 journalists
  - Coordinate 2-3 interviews
  - Monitor media mentions
- **Coordination Points:**
  - **WITH Campaign Coordinator:** Get announcement schedules 1 week advance
  - **WITH Content Agent:** Collaborate on press releases
  - **WITH Partnership Agent:** Coordinate joint announcements
- **Embargo Policy:** Major news gets 48h embargo for key journalists
- **Weekly Meeting:** Mondays 10:00 UTC

---

### **Analytics & Data Agent**
- **Role:** Tracks all metrics, generates reports, optimizes campaigns
- **Daily Tasks:**
  - Update metrics dashboard by 05:00 UTC
  - Analyze previous day performance
  - Identify optimization opportunities
  - Alert on anomalies
- **Coordination Points:**
  - **WITH ALL Agents:** Provide performance data
  - **WITH Campaign Coordinator:** Daily metrics briefing
  - **WITH Content Agent:** Best/worst performing content analysis
- **Reports:**
  - Daily snapshot (06:00 UTC)
  - Weekly deep dive (Mondays)
  - Monthly comprehensive (1st of month)

---

### **Partnership & Integration Agent**
- **Role:** Manages CEX listings, DeFi integrations, strategic partnerships
- **Weekly Tasks:**
  - 5-10 partnership outreach calls
  - Negotiate deals
  - Manage integrations
  - Coordinate announcements
- **Coordination Points:**
  - **WITH Campaign Coordinator:** Schedule announcements for max impact
  - **WITH PR Agent:** Joint press releases
  - **WITH Community Agent:** Prep community for partnership news
- **Lead Time:** 2 weeks notice for major partnership announcements
- **Weekly Meeting:** Fridays 12:00 UTC

---

### **Crisis Management Agent (On-Call)**
- **Role:** Monitors for crises, executes crisis protocol
- **24/7 Monitoring:**
  - Social media alerts
  - Price/volume alerts
  - Smart contract monitoring
  - Community sentiment
- **Coordination Points:**
  - **WITH ALL Agents:** Immediate crisis notification
  - **WITH Campaign Coordinator:** Lead crisis response
  - **WITH Community Agent:** Frontline communication
- **Activation:** Automatic for Level 2+ crises (see crisis-protocol.md)

---

## 📅 DAILY COORDINATION SCHEDULE

### **06:00 UTC - Morning Briefing (15 min)**

**Attendees:** All agents (rotating on-call for 24/7 coverage)

**Agenda:**
1. **Metrics Review (Analytics Agent):** Previous day performance
2. **Today's Priorities (Campaign Coordinator):** Top 3 tasks per agent
3. **Blockers (All):** Any issues or dependencies
4. **Crisis Check (Crisis Agent):** Overnight monitoring report
5. **Assignments:** Confirm who's doing what today

**Format:** Async Slack update + optional Zoom if needed

**Output:** Daily briefing document in `/coordination/daily/YYYY-MM-DD.md`

---

### **10:00 UTC - Content Sync (30 min, Mon/Wed/Fri)**

**Attendees:** Content Agent, Campaign Coordinator, Community Agent

**Agenda:**
1. Review content calendar for next 3 days
2. Approve pending content
3. Discuss community feedback on recent content
4. Brainstorm new ideas based on trends

**Output:** Updated content calendar, approved posts ready to publish

---

### **14:00 UTC - Influencer Sync (30 min, Wed)**

**Attendees:** Influencer Agent, Campaign Coordinator, Analytics Agent

**Agenda:**
1. Review active influencer campaigns
2. Performance data on recent posts
3. New influencer prospects
4. Budget utilization
5. Next week's influencer schedule

**Output:** Influencer campaign report, next week's plan

---

### **18:00 UTC - Community Pulse Check (15 min, Daily)**

**Attendees:** Community Agent, Campaign Coordinator

**Agenda:**
1. Sentiment score update
2. Top community questions/concerns
3. Engagement highlights
4. Upcoming community events

**Format:** Slack summary + quick call if needed

**Output:** Community daily report

---

### **22:00 UTC - Evening Debrief (15 min)**

**Attendees:** All agents (rotating)

**Agenda:**
1. **Completed Tasks:** What got done today
2. **Metrics:** End-of-day numbers
3. **Blockers:** What's stuck for tomorrow
4. **Tomorrow's Preview:** Top priorities
5. **Wins:** Celebrate successes

**Format:** Async Slack update

**Output:** End-of-day report in `/coordination/daily/YYYY-MM-DD-debrief.md`

---

## 📊 WEEKLY COORDINATION SCHEDULE

### **MONDAY 10:00 UTC - Weekly Planning (60 min)**

**Attendees:** All agents

**Agenda:**
1. **Previous Week Review (15 min):**
   - Analytics: Full week metrics
   - Each agent: Key accomplishments, misses

2. **This Week's Campaigns (20 min):**
   - Campaign Coordinator: Week's priorities
   - Assign ownership of key tasks
   - Identify dependencies

3. **Budget Review (10 min):**
   - Spend vs. plan
   - Reallocation needs

4. **Content Calendar (10 min):**
   - Finalize content for this week
   - Approve next week's drafts

5. **Open Discussion (5 min):**
   - Process improvements
   - Tool needs
   - Team feedback

**Output:** Weekly plan document, updated project board

---

### **WEDNESDAY 14:00 UTC - Mid-Week Check-In (30 min)**

**Attendees:** Campaign Coordinator + 2-3 agents (rotating)

**Agenda:**
1. Progress on weekly goals (50% checkpoint)
2. Adjust plans based on performance
3. Escalate any blockers

**Format:** Working session, collaborative problem-solving

---

### **FRIDAY 16:00 UTC - Week Wrap & Next Week Prep (45 min)**

**Attendees:** All agents

**Agenda:**
1. **Week Accomplishments (10 min):**
   - Each agent shares wins

2. **Metrics vs. Goals (10 min):**
   - What hit target, what missed

3. **Next Week Preview (15 min):**
   - Upcoming campaigns
   - Big announcements
   - Resource needs

4. **Process Improvements (10 min):**
   - What worked this week
   - What to change

**Output:** Week-in-review report, next week's plan finalized

---

## 🚀 CAMPAIGN-SPECIFIC COORDINATION

### **LAUNCH CAMPAIGN (Week 1-2)**

#### **Daily War Room Schedule:**
- **08:00 UTC:** Quick standup (10 min) - Everyone
- **12:00 UTC:** Mid-day metrics (15 min) - Analytics + Coordinator
- **16:00 UTC:** Adjustment call (20 min) - Everyone
- **20:00 UTC:** EOD recap (10 min) - Everyone

**Reason:** Launch requires 4x normal coordination frequency

#### **Agent-Specific Tasks:**

**Campaign Coordinator:**
- Monitor hour-by-hour schedule execution
- Real-time decision making
- Budget adjustments

**Content Agent:**
- 10+ posts per day across platforms
- Real-time response to trends
- Rapid content creation

**Influencer Agent:**
- Coordinate Wave 1 & 2 timing
- Monitor influencer post performance
- Activate backup influencers if needed

**Community Agent:**
- 24/7 coverage in 8-hour shifts
- Respond to all questions <5 min
- Run engagement contests

**PR Agent:**
- Monitor media pickup
- Follow up with journalists
- Send real-time updates

**Analytics Agent:**
- Hourly metrics updates
- Alert on anomalies immediately
- Track vs. projections

**Partnership Agent:**
- Execute partnership announcements on schedule
- Coordinate with partners on timing
- Handle last-minute partnership opportunities

---

### **VIRAL CAMPAIGNS (Ongoing)**

#### **"AI vs Human Trading Challenge" Coordination:**

**Pre-Launch (3 days before):**
- **Content Agent:** Create all promotional materials
- **Influencer Agent:** Brief influencers, schedule posts
- **Community Agent:** Tease in Telegram/Discord
- **PR Agent:** Send embargoed press release
- **Analytics Agent:** Set up tracking dashboard

**During Campaign (7 days):**
- **Daily 10:00 UTC Stream:** Content Agent hosts, all agents support
- **Daily 18:00 UTC Stream:** Partnership Agent + guest trader
- **Hourly Twitter Updates:** Automated via Analytics Agent
- **24/7 Community Management:** Community Agent shifts

**Post-Campaign:**
- **Content Agent:** Winner announcement video
- **PR Agent:** Send results to media
- **Analytics Agent:** Full campaign report
- **All Agents:** Lessons learned session

---

## 🔗 COMMUNICATION TOOLS & PROTOCOLS

### **Primary Communication Channels:**

**Slack Workspace: "HypeAI Marketing"**

**Channels:**
- `#general` - All team announcements
- `#daily-briefing` - Morning/evening updates
- `#metrics` - Analytics Agent posts daily data
- `#content-review` - Content approval workflow
- `#crisis-alerts` - Emergency notifications only
- `#wins` - Celebrate successes
- `#agent-[name]` - Individual agent channels

**Notification Levels:**
- 🟢 Normal: Standard messages
- 🟡 Important: Tag relevant agents
- 🔴 Urgent: @channel (sparingly!)
- 🚨 CRISIS: @everyone (emergencies only)

---

### **Project Management: ClickUp**

**Boards:**
1. **Campaign Calendar:** All campaigns, timeline view
2. **Content Pipeline:** Ideation > Creation > Review > Published
3. **Influencer Tracker:** Active campaigns, payments, performance
4. **Partnership Pipeline:** Outreach > Negotiation > Closed
5. **Daily Tasks:** Agent-specific daily todos

**Update Frequency:**
- Real-time for urgent tasks
- End-of-day for completed tasks
- Weekly review of all boards

---

### **Analytics Dashboard: Dune Analytics + Google Data Studio**

**Metrics Tracked:**
- Token price, volume, market cap
- Holder count, new holders
- Social media metrics (followers, engagement)
- Telegram/Discord members, activity
- Website traffic
- Campaign-specific KPIs

**Access:** All agents have view access, Analytics Agent has edit

**Auto-Refresh:** Every 15 minutes

---

### **File Storage: Google Drive**

**Folder Structure:**
```
/HypeAI Marketing/
  /Content/
    /Social Media/
      /Scheduled/
      /Published/
    /Blog Posts/
    /Videos/
    /Graphics/
  /Campaigns/
    /Launch Campaign/
    /AI vs Human Challenge/
    /Stake & Win/
    /Origin Story/
  /Coordination/
    /Daily/
      /2025-10-09.md
    /Weekly/
    /Monthly/
  /Partnerships/
  /Press Releases/
  /Reports/
```

**Permissions:** All agents have edit access to their folders

---

## 🎯 DEPENDENCY MANAGEMENT

### **Critical Path Dependencies:**

**Example: Partnership Announcement**

1. **Partnership Agent** closes deal → Notify Coordinator
2. **Coordinator** schedules announcement → 2 weeks lead time
3. **Content Agent** creates assets → 1 week before
4. **PR Agent** writes press release → 1 week before
5. **Influencer Agent** briefs influencers → 48h before
6. **Community Agent** teases community → 24h before
7. **All Agents** execute announcement → Launch day
8. **Analytics Agent** tracks impact → Post-launch

**Dependency Rule:** No task starts until prerequisite tasks complete

**Tracking:** ClickUp dependency mapping

---

### **Handoff Protocols:**

**Content Creation → Approval:**
1. Content Agent creates → Posts in `#content-review`
2. Coordinator reviews → Approves or requests changes within 4 hours
3. Content Agent publishes → Updates ClickUp

**Influencer Campaign → Execution:**
1. Coordinator approves budget
2. Influencer Agent negotiates deal
3. Content Agent provides materials 24h advance
4. Influencer posts
5. Analytics Agent tracks performance
6. Influencer Agent processes payment

**Crisis Detection → Response:**
1. Any agent detects crisis → Posts in `#crisis-alerts` immediately
2. Crisis Agent assesses severity
3. Coordinator activates crisis team
4. All agents execute crisis protocol (see crisis-protocol.md)

---

## 📈 PERFORMANCE TRACKING

### **Agent-Level KPIs:**

**Campaign Coordinator:**
- Campaign launch on-time rate: >95%
- Budget adherence: ±10%
- Crisis response time: <15 min for Level 3+

**Content Agent:**
- Content published on schedule: >90%
- Average engagement rate: >3%
- Content approval time: <4 hours

**Influencer Agent:**
- Influencer activation rate: >80%
- Cost per impression: <$0.05
- Campaign ROI: >3x

**Community Agent:**
- Response time: <5 min (95th percentile)
- Sentiment score: >70/100
- Daily active users growth: +2%/week

**PR Agent:**
- Media placements: 3+ per week
- Top-tier publications: 1+ per month
- Interview bookings: 2+ per month

**Analytics Agent:**
- Dashboard uptime: >99%
- Report delivery on-time: 100%
- Insight quality score: >8/10

**Partnership Agent:**
- Deals closed: 1+ per week
- Partnership announcement impact: >20% volume increase
- Integration success rate: >90%

---

### **Weekly Performance Review:**

**Monday Morning (before weekly planning):**
- Analytics Agent prepares report
- Each agent reviews their KPIs
- Identify top performers and underperformers
- Discuss improvement plans

**Format:** Data-driven, blameless, improvement-focused

---

## 🆘 ESCALATION PATHS

### **Level 1: Agent-to-Agent**
- Minor questions, clarifications
- Resolution time: <1 hour
- Method: Direct Slack message

### **Level 2: Agent-to-Coordinator**
- Blockers, budget issues, timeline conflicts
- Resolution time: <4 hours
- Method: Slack tag + ClickUp comment

### **Level 3: Coordinator-to-Leadership**
- Major budget overruns, campaign failures, partnership issues
- Resolution time: <24 hours
- Method: Email + emergency call

### **Level 4: CRISIS**
- See crisis-protocol.md
- Resolution time: Immediate
- Method: @everyone Slack + emergency call

---

## ✅ ONBOARDING NEW AGENTS

**Week 1: Learning**
- Read all campaign documents
- Shadow experienced agent
- Attend all coordination meetings (observer)
- Access to all tools granted

**Week 2: Assisted Execution**
- Handle tasks with supervision
- Daily check-ins with Coordinator
- First ClickUp assignments

**Week 3: Independent Execution**
- Own projects
- Participate fully in meetings
- Performance review

**Week 4: Full Integration**
- Independent task ownership
- May mentor future agents

---

## 📚 AGENT RESOURCES

### **Required Reading:**
1. This document (coordination-schedule.md)
2. launch-campaign-detailed.md
3. viral-campaigns.md
4. crisis-protocol.md
5. partnership-strategy.md

### **Tools Training:**
- Slack best practices
- ClickUp workflow
- Dune Analytics dashboard
- Figma for content review
- CRM for influencer management

### **Support:**
- **Technical Issues:** tech-support@hypeai.io
- **Access Problems:** coordinator@hypeai.io
- **Emergency:** +1-XXX-HYPE-911

---

## 🔄 CONTINUOUS IMPROVEMENT

### **Monthly Retrospective (First Friday):**

**Attendees:** All agents

**Agenda:**
1. **Wins (20 min):** Best moments from the month
2. **Challenges (20 min):** What went wrong, root causes
3. **Process Improvements (30 min):** How to do better
4. **Action Items (10 min):** Specific changes to implement

**Output:** Updated coordination processes, tool changes, role adjustments

---

### **Agent Feedback Loop:**

**Continuous:**
- Agents can suggest improvements anytime in `#process-ideas` Slack channel

**Weekly:**
- Coordinator reviews suggestions, implements quick wins

**Monthly:**
- Formal retrospective, major process changes

**Quarterly:**
- Full agent survey on coordination effectiveness

---

## 📞 CONTACT DIRECTORY

| Agent | Primary Contact | Backup | Timezone |
|-------|----------------|--------|----------|
| Campaign Coordinator | coordinator@hypeai.io | backup-coord@hypeai.io | UTC |
| Content Manager | content@hypeai.io | backup-content@hypeai.io | UTC |
| Influencer Coordination | influencers@hypeai.io | backup-influencer@hypeai.io | UTC-5 (EST) |
| Community Manager (Shift 1) | community-night@hypeai.io | - | UTC+8 |
| Community Manager (Shift 2) | community-day@hypeai.io | - | UTC |
| Community Manager (Shift 3) | community-eve@hypeai.io | - | UTC-5 |
| PR & Media Relations | pr@hypeai.io | backup-pr@hypeai.io | UTC |
| Analytics & Data | analytics@hypeai.io | backup-analytics@hypeai.io | UTC |
| Partnership & Integration | partnerships@hypeai.io | backup-partner@hypeai.io | UTC |
| Crisis Management | crisis@hypeai.io | +1-XXX-HYPE-911 | 24/7 |

---

**Emergency Protocol:**
If primary agent is unavailable >4 hours:
1. Contact backup agent
2. Notify Campaign Coordinator
3. Reassign urgent tasks

---

**Document Version:** 1.0
**Last Updated:** 2025-10-09
**Next Review:** Weekly (Fridays)
**Document Owner:** Campaign Coordinator Agent
**Approval:** All agents must read and acknowledge

---

## 🎯 QUICK REFERENCE

**Daily Essentials:**
- [ ] Check Slack by 05:50 UTC for morning briefing
- [ ] Update ClickUp tasks at EOD
- [ ] Monitor `#crisis-alerts` channel
- [ ] Post in `#wins` when something great happens!

**Weekly Essentials:**
- [ ] Monday 10:00 UTC - Weekly Planning (mandatory)
- [ ] Friday 16:00 UTC - Week Wrap (mandatory)
- [ ] Update performance KPIs
- [ ] Review next week's calendar

**When In Doubt:**
- Ask in `#general`
- Tag Campaign Coordinator
- Check this document
- Reference campaign-specific docs

---

**Remember:** We're a team. Over-communicate, support each other, celebrate wins, learn from losses. Let's make HypeAI the best-coordinated crypto project ever! 🚀
