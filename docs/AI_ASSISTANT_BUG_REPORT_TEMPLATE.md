# HypeAI AI Assistant - Bug Report Template

**Use this template for all bugs found during testing**

---

## Bug Report #[NUMBER]

**Date Reported:** [YYYY-MM-DD]
**Reported By:** [Your Name]
**Build/Version:** [Version Number]
**Environment:** [Production / Staging / Development]

---

## 1. Bug Summary

**Title:** [Short, descriptive title]

**Severity:**
- [ ] **Critical (P0)** - Blocker, system unusable
- [ ] **High (P1)** - Major feature broken
- [ ] **Medium (P2)** - Minor issue, workaround exists
- [ ] **Low (P3)** - Cosmetic, enhancement

**Priority:**
- [ ] **Urgent** - Fix immediately
- [ ] **High** - Fix within 24 hours
- [ ] **Medium** - Fix within 1 week
- [ ] **Low** - Fix when possible

**Category:**
- [ ] Functional Bug
- [ ] UI/UX Issue
- [ ] Performance Problem
- [ ] Security Vulnerability
- [ ] Knowledge Inaccuracy
- [ ] Language/Translation Error
- [ ] Compatibility Issue

---

## 2. Affected Component

**Component:**
- [ ] AI Response Accuracy
- [ ] Widget UI
- [ ] Message Sending
- [ ] Message History
- [ ] Welcome Message
- [ ] Typing Indicator
- [ ] Error Handling
- [ ] Mobile Responsiveness
- [ ] Browser Compatibility
- [ ] Language Switching
- [ ] Performance
- [ ] Security

**Specific Feature:** [Which feature is broken]

---

## 3. Bug Description

**What happened:**
```
[Describe what went wrong in detail]
```

**Expected behavior:**
```
[What should have happened]
```

**Actual behavior:**
```
[What actually happened]
```

---

## 4. Steps to Reproduce

**Prerequisites:**
- Browser: [Chrome/Firefox/Safari/Edge]
- Version: [Browser version]
- OS: [Windows/Mac/iOS/Android]
- Device: [Desktop/iPhone 13/Samsung Galaxy/etc.]
- Screen Size: [e.g., 1920x1080, 428x926]
- Language: [English/Russian]

**Steps:**
1. Go to [URL/page]
2. Click on [element]
3. Type [text] into [field]
4. Click [button]
5. Observe [result]

**Frequency:**
- [ ] Always (100%)
- [ ] Often (>50%)
- [ ] Sometimes (10-50%)
- [ ] Rare (<10%)
- [ ] Unable to reproduce

---

## 5. Test Data

**Question Asked:**
```
[Exact question typed into AI assistant]
```

**AI Response Received:**
```
[Paste complete AI response]
```

**Expected Response:**
```
[What the response should have been - reference AI_ASSISTANT_EXPECTED_RESPONSES.md]
```

**Accuracy Score:** [0-10]

---

## 6. Visual Evidence

**Screenshot:**
- [ ] Attached
- [ ] Not applicable
- [ ] Unable to capture

**Video Recording:**
- [ ] Attached
- [ ] Not applicable
- [ ] Unable to record

**Console Errors:**
```
[Paste JavaScript console errors if any]
```

**Network Errors:**
```
[Paste network tab errors if any]
```

---

## 7. Impact Assessment

**User Impact:**
- [ ] All users affected
- [ ] Specific user group: [which group]
- [ ] Edge case only

**Business Impact:**
- [ ] Prevents core functionality
- [ ] Damages trust/credibility
- [ ] Minor inconvenience
- [ ] No impact on user experience

**Workaround Available:**
- [ ] Yes: [describe workaround]
- [ ] No

---

## 8. Technical Details

**Browser Console Logs:**
```javascript
// Paste relevant console output
```

**Network Request Details:**
```
Request URL:
Method:
Status Code:
Response Time:
Request Headers:
Response Headers:
Request Payload:
Response Body:
```

**LocalStorage/SessionStorage:**
```
// Paste relevant storage data if applicable
```

**Cookies:**
```
// Paste relevant cookie data if applicable
```

---

## 9. Root Cause Analysis (If Known)

**Suspected Cause:**
```
[Your hypothesis about what's causing the bug]
```

**Code Reference:**
```
File: [filename]
Line: [line number]
Function: [function name]
```

---

## 10. Suggested Fix

**Proposed Solution:**
```
[How you think this should be fixed]
```

**Alternative Solutions:**
```
[Other ways to fix this]
```

---

## 11. Related Issues

**Related Bug Reports:**
- Bug #[number]: [title]
- Bug #[number]: [title]

**Blocks:**
- Test Case: [TC-XXX]
- Feature: [feature name]

**Blocked By:**
- Bug #[number]
- Feature completion: [feature name]

---

## 12. Testing Notes

**Test Case Reference:** [TC-XXX from test plan]

**Regression Risk:**
- [ ] High - May affect other features
- [ ] Medium - Limited to this feature
- [ ] Low - Isolated issue

**Retest After Fix:**
- [ ] Unit tests needed
- [ ] Integration tests needed
- [ ] Full regression test needed
- [ ] Smoke test sufficient

---

## 13. Developer Assignment

**Assigned To:** [Developer Name]
**Assigned Date:** [YYYY-MM-DD]
**Target Fix Date:** [YYYY-MM-DD]

**Status:**
- [ ] New
- [ ] Assigned
- [ ] In Progress
- [ ] Code Review
- [ ] Testing
- [ ] Resolved
- [ ] Verified
- [ ] Closed
- [ ] Reopened

---

## 14. Resolution

**Fixed In Version:** [Version number]
**Fix Date:** [YYYY-MM-DD]
**Fixed By:** [Developer name]

**Resolution Details:**
```
[Describe how the bug was fixed]
```

**Code Changes:**
```
Files modified:
- [filename]: [description of changes]
- [filename]: [description of changes]

Commits:
- [commit hash]: [commit message]
```

---

## 15. Verification

**Verified By:** [QA Tester Name]
**Verified Date:** [YYYY-MM-DD]
**Verification Status:**
- [ ] ✅ Verified Fixed
- [ ] ❌ Not Fixed
- [ ] ⚠️ Partially Fixed
- [ ] 🔁 Reopened

**Verification Notes:**
```
[Testing notes after fix]
```

---

## Additional Comments

```
[Any other relevant information]
```

---

**Template Version:** 1.0
**Last Updated:** 2025-10-25

---

# Example Bug Reports

## Example 1: Knowledge Inaccuracy

### Bug Report #001

**Date Reported:** 2025-10-25
**Reported By:** John Doe
**Build/Version:** 1.0.0
**Environment:** Production

---

**Bug Summary**

**Title:** Incorrect Staking APY Stated (Says 50% instead of 62%)

**Severity:** ⚠️ **High (P1)** - Major inaccuracy in critical information

**Priority:** 🔥 **Urgent** - Fix within 24 hours

**Category:** Knowledge Inaccuracy

---

**Affected Component:** AI Response Accuracy - Tokenomics

---

**Bug Description**

**What happened:**
AI assistant stated staking APY is 50% when asked "What is the staking APY?"

**Expected behavior:**
AI should respond: "The staking APY for HYPEAI tokens is 62% annually."

**Actual behavior:**
AI responded: "You can earn up to 50% APY by staking HYPEAI tokens."

---

**Steps to Reproduce**

**Prerequisites:**
- Browser: Chrome 119
- OS: macOS Sonoma
- Device: MacBook Pro
- Language: English

**Steps:**
1. Open website homepage
2. Click AI assistant widget
3. Type: "What is the staking APY?"
4. Press Enter
5. Read response

**Frequency:** Always (100%)

---

**Test Data**

**Question Asked:**
```
What is the staking APY?
```

**AI Response Received:**
```
You can earn up to 50% APY by staking HYPEAI tokens on our platform. This is one of the highest yields in the DeFi space!
```

**Expected Response:**
```
The staking APY for HYPEAI tokens is 62% annually. This means if you stake your tokens, you can earn up to 62% annual returns on your staked amount.
```

**Accuracy Score:** 3/10 (Wrong percentage, but concept correct)

---

**Impact Assessment**

**User Impact:** All users affected - critical misinformation

**Business Impact:** Damages trust/credibility - users may invest based on wrong info

**Workaround Available:** No - users getting incorrect information

---

**Suggested Fix**

Update AI training data / knowledge base to reflect correct 62% APY figure. Add validation to ensure critical numbers are accurate.

---

**Status:** 🔴 **CRITICAL - REQUIRES IMMEDIATE FIX**

---

## Example 2: UI Rendering Bug

### Bug Report #002

**Date Reported:** 2025-10-25
**Reported By:** Jane Smith
**Build/Version:** 1.0.0
**Environment:** Production

---

**Bug Summary**

**Title:** Widget Overlaps with Footer on iPhone SE

**Severity:** ⚠️ **Medium (P2)** - Affects specific devices

**Priority:** **Medium** - Fix within 1 week

**Category:** UI/UX Issue - Mobile Responsiveness

---

**Affected Component:** Widget UI - Mobile (small screens)

---

**Bug Description**

**What happened:**
On iPhone SE (375px width), the AI assistant widget overlaps with the website footer, making footer links unclickable.

**Expected behavior:**
Widget should have sufficient z-index to appear above footer, or footer should shift up when widget is open.

**Actual behavior:**
Widget appears partially behind footer. Footer links are inaccessible.

---

**Steps to Reproduce**

**Prerequisites:**
- Browser: Safari iOS 16
- Device: iPhone SE (2nd gen)
- Screen Size: 375x667px
- Orientation: Portrait

**Steps:**
1. Open website on iPhone SE
2. Scroll to bottom of page
3. Click AI assistant icon
4. Observe widget overlapping footer
5. Try clicking footer links - blocked

**Frequency:** Always (100%) on iPhone SE and similar small screens

---

**Visual Evidence**

**Screenshot:** ✅ Attached (see bug-002-screenshot.png)

**Console Errors:**
```
None
```

---

**Impact Assessment**

**User Impact:** Users with small phones (iPhone SE, old Android)

**Business Impact:** Minor inconvenience - footer links temporarily inaccessible

**Workaround Available:** Yes - close widget to access footer

---

**Technical Details**

**CSS Issue:**
```css
/* Current z-index */
.ai-widget { z-index: 999; }
.footer { z-index: 1000; }

/* Should be */
.ai-widget { z-index: 10000; }
```

---

**Suggested Fix**

Increase widget z-index to 10000 or higher. Ensure it's above all other page elements including header, footer, modals.

---

**Status:** 🟡 **IN PROGRESS**

---

## Example 3: Performance Issue

### Bug Report #003

**Date Reported:** 2025-10-25
**Reported By:** Mike Johnson
**Build/Version:** 1.0.0
**Environment:** Production

---

**Bug Summary**

**Title:** Slow Response Time on 4G Network (>5 seconds)

**Severity:** ⚠️ **Medium (P2)** - Performance degradation

**Priority:** **High** - Fix within 3 days

**Category:** Performance Problem

---

**Affected Component:** AI Response Time - Network Performance

---

**Bug Description**

**What happened:**
On 4G network, AI responses take 5-8 seconds to appear, exceeding 2-second target.

**Expected behavior:**
Response time should be < 3 seconds on 4G (target: < 2 seconds on WiFi)

**Actual behavior:**
Average response time: 6.2 seconds on 4G

---

**Steps to Reproduce**

**Prerequisites:**
- Browser: Chrome Android
- Device: Samsung Galaxy S21
- Network: 4G LTE (throttled)

**Steps:**
1. Disable WiFi, use 4G only
2. Open AI widget
3. Ask: "What is HypeAI?"
4. Measure time from send to response display
5. Repeat 10 times, calculate average

**Frequency:** Always on slow networks

---

**Performance Metrics**

| Network | Avg Response Time | Target | Status |
|---------|-------------------|--------|--------|
| WiFi | 1.8s | < 2s | ✅ Pass |
| 4G | 6.2s | < 3s | ❌ Fail |
| 3G | 11.5s | < 5s | ❌ Fail |

---

**Impact Assessment**

**User Impact:** Users on mobile data experience slow responses

**Business Impact:** Poor user experience may reduce engagement

**Workaround Available:** Use WiFi

---

**Suggested Fix**

1. Optimize API response payload (reduce size)
2. Implement response compression (gzip)
3. Add caching for common questions
4. Show skeleton loader during wait

---

**Status:** 🟡 **ASSIGNED TO PERFORMANCE TEAM**

---

# Quick Bug Logging Template (Minimal)

```markdown
## Bug #[X]: [Title]

**Severity:** P0 / P1 / P2 / P3
**Date:** [Date]

**What happened:**
[Brief description]

**Steps:**
1. [Step 1]
2. [Step 2]
3. [Result]

**Expected:** [What should happen]
**Actual:** [What happened]

**Screenshot:** [Link]

**Status:** [New/Assigned/Fixed/Closed]
```

---

**Template Version:** 1.0
**Last Updated:** 2025-10-25
