# HypeAI Private Sale - KYC/AML Compliance Procedures

## Executive Summary

This document establishes **Know Your Customer (KYC)** and **Anti-Money Laundering (AML)** procedures for HypeAI Private Sale in compliance with:
- Estonian Money Laundering and Terrorist Financing Prevention Act (MLTFPA)
- EU 5th & 6th Anti-Money Laundering Directives (AMLD5, AMLD6)
- Financial Action Task Force (FATF) Recommendations
- EU MiCA Regulation (Markets in Crypto-Assets)

**Objective:** Prevent money laundering, terrorist financing, sanctions violations, and fraud while enabling compliant Private Sale operations.

---

## 1. Legal Framework

### 1.1 Estonian Requirements

**Money Laundering and Terrorist Financing Prevention Act (MLTFPA):**
- HypeAI OÜ = "obliged entity" (crypto service provider)
- Must register with Estonian Financial Intelligence Unit (FIU)
- Subject to supervision by FIU

**Obligations:**
- Customer Due Diligence (CDD) for all customers
- Enhanced Due Diligence (EDD) for high-risk customers
- Ongoing monitoring of business relationships
- Record keeping (5 years minimum)
- Suspicious Activity Reporting (SAR) to FIU
- Internal AML policies and procedures
- AML training for staff
- Risk assessment documentation

### 1.2 EU AML Directives

**5th AML Directive (EU 2018/843):**
- Crypto exchanges and wallet providers = obliged entities
- KYC mandatory for ALL transactions (no de minimis exemption for crypto)
- Beneficial owner identification (for corporate customers)
- Enhanced scrutiny for high-risk third countries

**6th AML Directive (EU 2018/1673):**
- Expands list of predicate offenses (cybercrime, environmental crime)
- Criminal liability for legal entities (companies can be prosecuted)
- Minimum penalties: Up to 4 years imprisonment for money laundering

### 1.3 FATF Recommendations

**Key Principles:**
- Risk-based approach (allocate resources based on risk level)
- Customer Due Diligence (identify and verify customers)
- Ongoing monitoring (detect suspicious patterns)
- Reporting (file SARs for suspicious transactions)
- Record keeping (maintain audit trail)

**Crypto-Specific (FATF Guidance 2019, updated 2021):**
- "Travel Rule" - share sender/recipient info for transactions >$1,000 (applies post-TGE, not Pre-Sale)
- Virtual Asset Service Providers (VASPs) must be licensed
- Peer-to-peer transactions pose high ML/TF risk

---

## 2. Risk Assessment

### 2.1 Inherent Risks - HypeAI Private Sale

**Product/Service Risk: MODERATE**
- Service Credits convertible to crypto tokens (higher risk than pure software)
- Tokens potentially liquid after TGE (money laundering vehicle)
- Cross-border sales (difficult to monitor)
- **Mitigation:** KYC all participants, geographic restrictions, transaction monitoring

**Customer Risk: MODERATE-HIGH**
- Crypto investors may include criminals (industry reputation)
- Anonymous/pseudonymous payment methods (crypto)
- International customer base (difficult to verify)
- **Mitigation:** Enhanced KYC, source of funds verification, PEP screening

**Geographic Risk: MODERATE**
- Some customers from high-risk jurisdictions (if we allow)
- Cross-border transactions (multiple jurisdictions)
- **Mitigation:** Block high-risk countries, sanctions screening, enhanced DD for grey-list countries

**Transaction Risk: MODERATE**
- Large purchases (>€10,000) may involve illicit funds
- Structured transactions (multiple small purchases to avoid thresholds)
- Third-party payments (someone else paying for customer)
- **Mitigation:** Enhanced DD for >€10,000, monitor for structuring, prohibit third-party payments

**Delivery Channel Risk: HIGH**
- Fully online (no face-to-face verification)
- Accessible globally (hard to control)
- Digital product (easily transferred)
- **Mitigation:** Robust KYC technology (liveness detection, document verification), IP tracking, device fingerprinting

### 2.2 Risk Rating Matrix

| Customer Type | Base Risk | Adjustments | Final Risk |
|---------------|-----------|-------------|------------|
| **EU resident, <€5,000, verified employment** | Low | None | 🟢 **LOW** |
| **EU resident, €5,000-€10,000, crypto payment** | Moderate | +1 (crypto) | 🟡 **MODERATE** |
| **EU resident, >€10,000** | Moderate | +1 (large amount) | 🟠 **MODERATE-HIGH** |
| **FATF grey-list country, any amount** | High | +1 (jurisdiction) | 🔴 **HIGH** |
| **PEP (Politically Exposed Person), any amount** | High | +1 (PEP status) | 🔴 **HIGH** |
| **Sanctioned country** | Prohibited | N/A | ⛔ **BLOCK** |

**Risk Level Actions:**
- 🟢 **LOW:** Standard KYC
- 🟡 **MODERATE:** Standard KYC + source of funds declaration
- 🟠 **MODERATE-HIGH:** Enhanced KYC + source of wealth verification
- 🔴 **HIGH:** Enhanced KYC + senior management approval
- ⛔ **BLOCK:** Reject customer

---

## 3. Customer Due Diligence (CDD) - Standard KYC

### 3.1 When CDD Required

**For ALL Private Sale Participants:**
- No minimum threshold (every customer, even €100 purchase)
- No exceptions (EU, low-risk, small amounts - all must complete KYC)
- Before purchase (not after)

**Ongoing CDD:**
- Review KYC information periodically (at least annually for high-risk, every 2 years for low-risk)
- Update if customer changes address, nationality, or purchases >€10,000 cumulatively

### 3.2 CDD Elements (Standard KYC)

#### 3.2.1 Identity Verification

**Information to Collect:**
- Full legal name (first name, middle name, last name, as on government ID)
- Date of birth (DD/MM/YYYY)
- Nationality (country of citizenship)
- Country of residence
- Residential address (street, city, postal code, country)
- Email address (for communications)
- Phone number (optional but recommended)

**Documents Required:**

**Government-Issued Photo ID (ONE of):**
- Passport (preferred - internationally standardized)
- National ID card (for EU/EEA)
- Driver's license (if includes photo and ID number)

**Requirements:**
- Valid (not expired)
- Clear, readable photo of document
- All corners visible (full document)
- No glare or obstructions
- Matches selfie (name, DOB, photo)

#### 3.2.2 Proof of Address (POA)

**Documents Accepted (ONE of):**
- Utility bill (electricity, water, gas, internet)
- Bank statement
- Government letter (tax authority, municipality)
- Rental agreement (if recent)
- Insurance statement

**Requirements:**
- Dated within last **3 months**
- Shows full name (matching ID) and residential address
- Issued by reputable institution
- Clear and readable (not handwritten)

**Not Accepted:**
- Mobile phone bills (often not mailed)
- Credit card statements (PO box addresses common)
- Screenshots of online banking (too easily forged)

#### 3.2.3 Selfie / Liveness Check

**Purpose:** Confirm person submitting KYC is the ID holder (prevent identity theft).

**Requirements:**
- Live photo of face (not pre-recorded)
- Clear, well-lit, no sunglasses/hat
- Face matches photo on ID
- Liveness detection (blink, turn head, or AI-based)

**Technology:** KYC provider (Sumsub, Onfido, Jumio) handles liveness detection.

#### 3.2.4 Source of Funds Declaration

**For ALL Purchases (Especially >€1,000):**

Customer must declare:
- Source of funds used for purchase (e.g., employment income, business revenue, savings, investment returns, gift, inheritance)
- Occupation or business type (if applicable)
- Employer name (if employed)

**Format:** Dropdown selection + free text explanation

**Examples:**
- ✅ "Salary from employment at ABC Corp as software engineer"
- ✅ "Profits from cryptocurrency trading over past 2 years"
- ✅ "Savings from sale of real estate in 2024"
- ❌ "None of your business" (reject)
- ❌ "Cash" with no further explanation (suspicious)

**Red Flags:**
- Vague answers ("business," "investments" with no details)
- Inconsistent with customer profile (student buying €50,000?)
- Cash-intensive sources with no documentation (construction, restaurants - high ML risk)

### 3.3 Automated KYC Process (Recommended)

**KYC Provider Selection:**

| Provider | Strengths | Cost | Recommendation |
|----------|-----------|------|----------------|
| **Sumsub** | Comprehensive, crypto-focused, 220+ countries | €2-€5/verification | ✅ **RECOMMENDED** |
| **Onfido** | AI-powered, fast, good UX | €1.50-€4/verification | ✅ Good alternative |
| **Jumio** | High accuracy, trusted by exchanges | €3-€7/verification | ✅ Premium option |
| **Veriff** | EU-based, GDPR compliant | €2-€5/verification | ✅ Good for EU focus |

**Process Flow:**

1. **Customer Initiation:**
   - User clicks "Purchase Service Credits"
   - Redirected to KYC flow

2. **Document Upload:**
   - Select ID type (passport, ID card, etc.)
   - Take photo of front and back (if ID card)
   - Upload via mobile or desktop

3. **Liveness Check:**
   - Take selfie (AI liveness detection)
   - Or: Follow prompts (blink, turn head)

4. **Proof of Address:**
   - Upload utility bill or bank statement
   - System extracts name and address via OCR

5. **Source of Funds:**
   - Fill out form (occupation, source, amount)
   - Upload supporting docs (for >€10,000 or high-risk)

6. **Automated Verification:**
   - KYC provider checks:
     - Document authenticity (hologram, fonts, template matching)
     - Face match (selfie vs ID photo) - typically >90% confidence required
     - Data extraction (name, DOB, address)
     - Watchlist screening (sanctions, PEPs - see Section 4)

7. **Result:**
   - **Approved (typically 5-30 minutes):** Proceed to payment
   - **Manual Review (10-20% of cases):** Human reviewer checks (1-24 hours)
   - **Rejected:** Reason provided, option to resubmit

**Pass Rate:** Expect 80-90% auto-approval, 10-15% manual review, 5-10% rejection.

### 3.4 Manual Review Triggers

**Sent for Human Review If:**
- Low document quality (blurry, dark, glare)
- Face match confidence <90%
- ID expiring soon or recently renewed
- Address mismatch (ID address ≠ POA address) - common, usually OK if explained
- Unusual document type (foreign ID not in database)
- Young customer (<21) purchasing large amount
- Red flags detected (see Section 6)

**Manual Reviewer Actions:**
- Review scans carefully
- Check for Photoshop/forgery signs
- Verify with issuing authority (if suspicious)
- Request additional documents
- Approve, Reject, or Escalate to Compliance Officer

---

## 4. Sanctions and PEP Screening

### 4.1 Sanctions Lists

**Must Screen ALL Customers Against:**

**International Sanctions:**
- **UN Security Council Sanctions List** (global)
- **EU Consolidated Sanctions List** (required for EU company)
- **OFAC SDN List** (US sanctions - recommended even though we exclude US customers)
- **HM Treasury Sanctions List** (UK)

**Country-Specific:**
- Estonian national sanctions (if any beyond EU)

**Screening Frequency:**
- At KYC submission (initial)
- Weekly for existing customers (ongoing monitoring)
- Immediately upon sanctions list updates (subscribe to alerts)

**Sanctions Match = BLOCK:**
- Reject customer immediately
- Do NOT notify customer (tipping off is illegal)
- File Suspicious Activity Report (SAR) with Estonian FIU
- Freeze any funds already received (if applicable)
- Report to FIU and await instructions

**Partial Matches (Same Name, Different Person):**
- Common issue (e.g., common names like "Mohamed Ali")
- Manual review required
- Check: DOB, nationality, address (do they match sanctioned person?)
- If different: Approve
- If uncertain: Request additional identification documents

### 4.2 Politically Exposed Persons (PEPs)

**Definition (EU):**
- Individuals holding prominent public functions (high risk of corruption)
- Examples: Heads of state, government ministers, MPs, judges, central bank board members, military generals, state-owned enterprise executives
- **Family members** of PEPs (spouse, children, parents)
- **Close associates** of PEPs (business partners, shared beneficial ownership)

**PEP Categories:**

| Category | Risk Level | Action Required |
|----------|------------|-----------------|
| **Foreign PEP** (non-EU) | 🔴 HIGH | Enhanced DD (always) |
| **Domestic PEP** (Estonian) | 🟠 MODERATE | Risk-based EDD |
| **International Organization PEP** (UN, EU) | 🟠 MODERATE | Risk-based EDD |
| **Former PEP** (>12 months out of office) | 🟡 LOW-MODERATE | Risk-based (consider prominence) |
| **PEP Family Member** | 🟠 MODERATE | Enhanced DD |
| **PEP Close Associate** | 🟠 MODERATE | Enhanced DD |

**PEP Screening:**
- Automated via KYC provider (Sumsub, Dow Jones, Refinitiv)
- Checks customer name against global PEP databases
- Match = Flag for Enhanced Due Diligence

**PEP Match ≠ Reject:**
- PEPs can be customers (not illegal)
- BUT: Require Enhanced Due Diligence (see Section 5)
- Senior management must approve (Compliance Officer or CEO)

**False Positives:**
- Common with PEPs (many people named "Alexander Ivanov")
- Check: Nationality, age, position (does it match?)
- If clearly different person: Approve
- If uncertain: Proceed with EDD

---

## 5. Enhanced Due Diligence (EDD)

### 5.1 When EDD Required

**Mandatory EDD Triggers:**
- Purchase amount >€10,000 (single transaction)
- Cumulative purchases >€10,000 within 12 months
- Customer from high-risk jurisdiction (FATF grey or black list)
- PEP or PEP family member/associate
- Sanctions screening returns partial match (needs investigation)
- Unusual transaction patterns (see Section 6.2)
- Source of funds is cash-intensive business (e.g., casino, money exchange)
- Customer refuses to provide information (red flag)
- Adverse media mentions (criminal allegations, corruption, fraud)

### 5.2 Additional EDD Measures

**Beyond Standard KYC, Obtain:**

#### 5.2.1 Source of Wealth (SOW)

**Difference from Source of Funds (SOF):**
- **SOF:** Where did money for THIS purchase come from? (employment, savings, etc.)
- **SOW:** How did customer accumulate overall wealth? (career, inheritance, business, investments)

**SOW Documentation (For >€10,000 or High-Risk):**
- Employment history (LinkedIn, CV, employment letter)
- Business ownership documents (company registration, financial statements)
- Tax returns (last 1-2 years)
- Bank statements (showing regular income or large deposits explained)
- Investment portfolio statements
- Inheritance or gift documentation (notarized letter, will excerpt)

**Example:**
- Customer wants to buy €50,000 in Credits
- SOF: "Savings from sale of Bitcoin in 2024"
- SOW: "Software engineer salary 2018-2024 (~€80k/year), invested 30% in Bitcoin 2020-2021, sold at profit in 2024"
- **Documents:** Employment contract (proof of salary), crypto exchange statements (proof of Bitcoin holdings and sale), bank statement (showing deposit from exchange)

#### 5.2.2 Bank Account Verification

**Purpose:** Confirm customer controls legitimate bank account (reduces money laundering risk).

**Methods:**
- **Micro-deposit verification:** Send €0.01-€0.02 with unique reference code, customer confirms amount
- **Bank statement upload:** Upload recent statement (must show customer name, account number, IBAN)
- **Open banking integration:** Automated verification via PSD2 (EU) - instant, secure

**For Crypto Payments (No Bank Verification):**
- Extra scrutiny on source of crypto (which exchange? KYC'd exchange?)
- Check blockchain history (is wallet connected to illicit activities?) - use Chainalysis, Elliptic
- Request exchange account statement (showing KYC and crypto purchase/receipt)

#### 5.2.3 Adverse Media Screening

**Search For:**
- News articles mentioning customer name + keywords: "fraud," "corruption," "money laundering," "sanctions," "criminal," "investigation," "arrested," "convicted"

**Sources:**
- Google News
- LexisNexis (premium)
- Dow Jones Risk & Compliance
- Local news (customer's home country)

**Found Negative Media?**
- **Low credibility (tabloids, unverified blogs):** Proceed with caution, note in file
- **High credibility (Reuters, BBC, reputable local news):** Investigate further
  - Is it the same person? (check details: age, location, occupation)
  - Is it relevant to ML/TF risk? (financial crime = high risk; unrelated crime = lower risk)
  - Is it ongoing investigation or resolved? (convicted = high risk; acquitted = lower risk)
- **If serious risk:** Reject customer + file SAR

#### 5.2.4 Purpose of Business Relationship

**Ask Customer:**
- Why are you purchasing Service Credits? (expected answer: "To use HypeAI platform services" or "Early investment opportunity")
- How did you hear about HypeAI? (marketing channel tracking)
- Do you plan to use services or resell? (reselling may be prohibited)
- Are you purchasing for someone else? (third-party purchases prohibited)

**Red Flags:**
- Vague or evasive answers
- Inconsistent with customer profile (retiree buying €20k for "business use"?)
- Mention of reselling or gifting (not allowed per Terms)

#### 5.2.5 Senior Management Approval

**For EDD Cases:**
- Compliance Officer (or CEO if no Compliance Officer) must review and approve
- Document decision (approve/reject) with rationale
- If approved: Note justification (e.g., "PEP but low-risk position, source of wealth verified")
- If rejected: Note reason (e.g., "Unable to verify source of funds, suspicious patterns")

**Approval Log:**
```
Customer: [Name]
Risk Level: HIGH (PEP + >€10,000)
EDD Completed: [Date]
Documents Reviewed: Employment letter, bank statements, adverse media check (clean)
Decision: APPROVED by [Compliance Officer Name]
Rationale: Customer is former government official (>2 years out of office), legitimate wealth from legal practice, no adverse findings.
Ongoing Monitoring: Quarterly review required.
```

---

## 6. Red Flags and Suspicious Activity

### 6.1 Common Money Laundering Red Flags

**Customer Behavior:**
- ❌ Reluctant to provide KYC information
- ❌ Provides false or forged documents
- ❌ Multiple failed KYC attempts with different information
- ❌ Uses VPN to hide true location (especially from high-risk country)
- ❌ Changes address or personal information frequently
- ❌ Has no logical reason for using HypeAI (no interest in AI, no business need)

**Transaction Patterns:**
- ❌ Large purchase with no clear source of funds
- ❌ Purchases just below reporting threshold (e.g., multiple €9,999 transactions to avoid €10k EDD) = **STRUCTURING**
- ❌ Rapid purchases and requests for refund (money cycling)
- ❌ Third-party payment (someone else paying for customer)
- ❌ Payment from country different than customer's residence (offshore funds)
- ❌ Attempts to use credit card from different name
- ❌ Overpayment followed by refund request (money laundering technique)

**Source of Funds:**
- ❌ Cash source with no documentation (high-risk)
- ❌ Funds from known high-risk jurisdictions (FATF blacklist)
- ❌ Funds from anonymous crypto (e.g., Monero, mixers, privacy wallets)
- ❌ Inconsistent with customer profile (student with €100k to invest)
- ❌ Recent large deposit in bank account with no explanation

**Associated Entities:**
- ❌ Links to sanctioned individuals or entities (blockchain analysis)
- ❌ Shared wallet address with known criminal addresses (Chainalysis alerts)
- ❌ Payment from crypto exchange with poor KYC reputation

### 6.2 Terrorist Financing Red Flags

**Customer Profile:**
- ❌ From country with known terrorist activity (Syria, Afghanistan, Somalia, Yemen)
- ❌ Matches OFAC/EU terrorist watchlist (even partial match)
- ❌ Adverse media mentions related to terrorism or extremism

**Transaction Patterns:**
- ❌ Small, frequent transactions to multiple jurisdictions (terror funding often uses small amounts)
- ❌ Donations or transfers to high-risk areas with no clear purpose
- ❌ Use of hawala or informal value transfer systems (common in terror financing)

**Purpose:**
- ❌ Evasive about purpose of purchase
- ❌ No logical business or personal use for HypeAI services
- ❌ Mention of political or religious causes

### 6.3 Fraud Red Flags

**Identity Fraud:**
- ❌ Selfie does not match ID photo (different person)
- ❌ ID appears forged (wrong fonts, no holograms, poor quality)
- ❌ Recently issued ID with old photo (may be stolen identity)
- ❌ Multiple accounts with similar information but different names (identity theft ring)

**Payment Fraud:**
- ❌ Stolen credit card (chargeback risk) - check IP vs billing address mismatch
- ❌ Multiple failed payment attempts (testing stolen cards)
- ❌ Requests to change payment method after purchase (money laundering)

**Account Takeover:**
- ❌ Sudden change in customer behavior (large purchase from previously inactive account)
- ❌ Login from unusual location (IP change)
- ❌ Change of email/phone number followed by large purchase

---

## 7. Suspicious Activity Reporting (SAR)

### 7.1 When to File SAR

**Mandatory Reporting:**
- Knowledge that funds are proceeds of crime
- Suspicion (reasonable grounds to suspect) funds related to ML/TF
- Transaction appears designed to avoid reporting thresholds (structuring)
- Customer matches sanctions list
- Multiple red flags present (see Section 6)
- Customer refuses to provide required information (and still attempts purchase)

**"Suspicion" Threshold:**
- Not proof required (lower standard)
- Would a reasonable person in your position suspect ML/TF?
- Err on side of reporting (better to file and be wrong than miss real case)

**Examples Requiring SAR:**
- Customer provides forged ID → Reject + SAR
- Customer is on OFAC sanctions list (even partial match pending investigation) → SAR immediately
- Customer's funds come from high-risk jurisdiction + vague SOF + €50k purchase → SAR
- Multiple purchases just below €10k threshold (€9,800, €9,500, €9,900) → Structuring → SAR
- Customer refuses to explain source of funds → SAR

### 7.2 SAR Filing Process (Estonia)

**Recipient:** Estonian Financial Intelligence Unit (FIU)
- Website: https://www.politsei.ee/en/organization/financial-intelligence-unit
- Email: raha@politsei.ee
- Phone: +372 612 3800

**SAR Form:**
- Use FIU's standard form (download from FIU website)
- Or: Submit via FIU online portal (if registered)

**Information to Include:**
- Reporting entity: HypeAI OÜ (registry code, address, contact)
- Reported person: Customer name, DOB, nationality, address, ID number
- Transaction details: Amount, date, payment method, purpose
- Reason for suspicion: Describe red flags (be specific, factual, not speculative)
- Supporting documents: KYC documents, screenshots, transaction logs (attach copies)
- Contact person: Compliance Officer name, email, phone

**Timeline:**
- **Immediately** upon discovery (within hours, not days)
- FIU guideline: "Without delay" = same business day if possible

**Confidentiality:**
- ❌ **DO NOT tell customer you filed SAR** (tipping off is criminal offense in EU)
- ❌ Do not mention FIU, investigation, or report
- ✅ If rejecting customer, cite "unable to verify information" or "business decision" (generic)
- ✅ Only discuss SAR with FIU, law enforcement, internal compliance team (need-to-know basis)

**Tipping Off Penalty (Estonia):**
- Criminal offense under MLTFPA
- Up to 1 year imprisonment or fine

### 7.3 Post-SAR Actions

**After Filing SAR:**

1. **Freeze or Reject Customer:**
   - If customer is sanctions match → Freeze any funds, block account
   - If high suspicion of ML/TF → Reject purchase, refund (if funds already received and FIU approves)
   - If moderate suspicion → Proceed with caution, enhanced monitoring

2. **Await FIU Response:**
   - FIU may contact you for more information (cooperate fully)
   - FIU may instruct you to freeze funds or block customer
   - FIU may close case (no action required)

3. **Document Everything:**
   - Save all communications with FIU
   - Note actions taken (customer rejected, funds frozen, etc.)
   - Store in secure, confidential file (separate from general customer files)

4. **Ongoing Monitoring:**
   - If customer was approved despite SAR (FIU cleared), monitor closely
   - Quarterly reviews for high-risk customers
   - File additional SARs if new suspicious activity arises

---

## 8. Record Keeping

### 8.1 Retention Requirements

**Estonian MLTFPA:**
- **5 years minimum** from end of business relationship or transaction date
- Applies to: KYC documents, transaction records, correspondence, risk assessments, SARs

**EU GDPR:**
- Personal data must not be kept longer than necessary
- **BUT:** AML retention (5 years) overrides GDPR right to erasure
- After 5 years: Delete unless legal hold (ongoing investigation)

**HypeAI Policy:** **7 years retention** (exceeds minimum, provides buffer for audits)

### 8.2 What to Retain

**For Each Customer:**

**KYC Documents (Originals):**
- Government ID (front and back)
- Selfie photo
- Proof of address
- Source of funds declaration
- Source of wealth documentation (if EDD)
- Bank statements or account verification
- Any additional documents provided

**Transaction Records:**
- Date and time of purchase
- Amount (in Credits and fiat/crypto equivalent)
- Payment method and transaction ID
- Wallet address (if crypto payment)
- IP address and device information (for fraud prevention)
- Confirmation emails

**Risk Assessment:**
- Initial risk rating (low, moderate, high)
- EDD documentation (if applicable)
- Adverse media search results
- Sanctions/PEP screening results (including false positives investigated)
- Senior management approval (if required)

**Communications:**
- Support tickets
- Emails with customer (especially regarding KYC or suspicious activity)
- Internal notes (compliance team discussions)

**Suspicious Activity Reports:**
- Copy of SAR filed with FIU
- FIU correspondence
- Actions taken (customer blocked, funds frozen, etc.)

**Audit Trail:**
- Who accessed customer file (log all views)
- Changes to customer information (with timestamps)
- KYC review dates (annual or as needed)

### 8.3 Storage and Security

**Security Requirements:**

**Encryption:**
- At rest: AES-256 encryption for all customer data
- In transit: TLS 1.3 for all web transmissions

**Access Control:**
- Role-based: Only Compliance Officer, CEO, and relevant staff can access KYC data
- Two-factor authentication (2FA) mandatory for admin access
- Activity logging (who accessed what, when)

**Backups:**
- Daily encrypted backups to separate server (offsite)
- Backup retention: 7 years
- Test restore monthly (ensure data recoverable)

**GDPR Compliance:**
- Data Processing Agreement (DPA) with KYC provider (Sumsub, etc.)
- Customers can request copy of their data (GDPR right to access)
- Deletion after retention period expires (unless legal hold)

**Physical Security:**
- Servers in EU data centers (GDPR compliance)
- ISO 27001 certified hosting (AWS, Google Cloud, or equivalent)

---

## 9. Ongoing Monitoring

### 9.1 Transaction Monitoring

**Automated Alerts:**

Implement system to flag:
- Transactions >€10,000 (automatic EDD trigger)
- Cumulative purchases approaching €10,000 (e.g., alert at €8,000 cumulative)
- Multiple purchases in short time period (potential structuring)
- Purchases from new IP address (account takeover risk)
- Payment method change (fraud indicator)
- Customer from newly sanctioned country (sanctions lists updated)

**Manual Review:**
- Compliance Officer reviews flagged transactions weekly
- Investigate alerts, determine if SAR required
- Document decision (clear or escalate)

### 9.2 Periodic Customer Reviews

**Schedule:**

| Risk Level | Review Frequency | Action |
|------------|------------------|--------|
| **Low** | Every 2 years | Refresh KYC (update address if changed, re-screen sanctions/PEPs) |
| **Moderate** | Annually | Full KYC refresh + risk reassessment |
| **High** | Quarterly | Enhanced review (check adverse media, re-verify SOF if large new purchases) |

**Review Process:**
1. Re-screen sanctions and PEP lists (automated)
2. Check for adverse media (Google News search)
3. Review transaction history (any unusual patterns?)
4. Update risk rating if needed
5. Request updated KYC documents if information outdated (e.g., address changed, ID expired)

### 9.3 Sanctions List Updates

**Frequency:**
- EU sanctions list: Updated weekly (subscribe to EU alerts)
- OFAC SDN list: Updated daily (subscribe to OFAC updates)

**Process:**
1. Receive notification of sanctions list update
2. **Immediately** re-screen all active customers against new list
3. If match found:
   - Freeze customer account
   - Block access to Credits/Tokens
   - File SAR with FIU
   - Await FIU instructions (may require asset freeze and report to national authority)

**Tools:**
- Sanctions screening software (integrated with KYC provider like Sumsub, or standalone like Dow Jones, Refinitiv)
- Automated re-screening daily or weekly

---

## 10. Training and Compliance Culture

### 10.1 AML Training

**Who Needs Training:**
- All employees involved in customer onboarding (sales, support)
- Compliance Officer (must have advanced training)
- Senior management (CEO, CFO)
- Technical staff with access to customer data

**Training Topics:**
- Overview of Estonian and EU AML laws
- HypeAI's AML policies and procedures
- Red flags for money laundering and terrorist financing
- How to file SAR
- Confidentiality (do not tip off customers)
- GDPR and data protection (handling KYC data)
- Sanctions screening
- Practical scenarios and case studies

**Frequency:**
- Initial training: Before starting role (mandatory)
- Refresher training: Annually (1-2 hours)
- Ad-hoc training: When regulations change (e.g., MiCA implementation)

**Documentation:**
- Training attendance records (who, when, what topics)
- Test scores (if using quiz-based training)
- Certificates (if using external provider)

**Providers:**
- Internal (Compliance Officer leads training)
- External: ACAMS (Association of Certified Anti-Money Laundering Specialists), regional AML training providers

### 10.2 Compliance Officer Role

**Responsibilities:**

**Policy Management:**
- Draft and update AML policies
- Ensure policies comply with Estonian and EU law
- Communicate policies to staff

**Customer Reviews:**
- Approve high-risk customers (EDD cases)
- Review transaction monitoring alerts
- Conduct periodic customer reviews

**SAR Filing:**
- Determine when SAR required
- Prepare and file SARs with FIU
- Liaise with FIU and law enforcement

**Training:**
- Organize AML training for staff
- Stay updated on regulatory changes (attend conferences, webinars)

**Audits:**
- Prepare for FIU audits or inspections
- Conduct internal audits (test compliance with procedures)
- Remediate deficiencies found

**Reporting:**
- Quarterly report to senior management (number of customers, SARs filed, risks identified)
- Annual AML risk assessment update

**Qualifications:**
- Legal or compliance background (law degree or compliance certification preferred)
- CAMS (Certified Anti-Money Laundering Specialist) certification (optional but recommended)
- Fluent in English and Estonian (for FIU communications)

**Independence:**
- Should report directly to CEO or Board (not to sales or operations, to avoid conflicts)
- Authority to reject customers or halt transactions without sales override

### 10.3 Compliance Culture

**Tone from the Top:**
- CEO and senior management must emphasize AML compliance importance
- "Compliance is non-negotiable" messaging
- No pressure to approve high-risk customers for revenue reasons

**Incentives:**
- Do NOT tie compliance staff bonuses to revenue or customer count (creates conflict)
- Reward compliance staff for identifying risks and preventing violations

**Whistleblowing:**
- Provide anonymous channel for employees to report compliance concerns
- No retaliation against whistleblowers (Estonian and EU law protection)

---

## 11. Regulatory Compliance and Audits

### 11.1 Estonian FIU Registration

**Virtual Currency Service Provider Registration:**

**Application Process:**
1. Submit registration form to FIU (online or paper)
2. Provide:
   - Company registration certificate (HypeAI OÜ)
   - AML policies and procedures (this document)
   - Compliance Officer appointment letter
   - Risk assessment (Section 2 of this document)
   - Clean criminal records for all board members
   - Business plan (describing HypeAI operations)
   - Application fee: €2,000 (non-refundable)
3. FIU review (1-3 months)
4. If approved: Receive registration certificate
5. Annual renewal (if applicable)

**Post-Registration Obligations:**
- File annual activity report with FIU (by March 31 each year)
- Report any changes (Compliance Officer, address, business model) within 14 days
- Cooperate with FIU inspections or audits

### 11.2 FIU Audits and Inspections

**When FIU May Audit:**
- Routine inspections (randomly selected)
- Risk-based (if HypeAI in high-risk sector - crypto)
- Triggered by SARs or complaints
- Follow-up after previous findings

**What FIU Reviews:**
- Sample of customer files (KYC completeness, risk ratings)
- Transaction monitoring logs
- SAR filings (were they timely and complete?)
- Training records
- Policies and procedures (are they followed?)
- Sanctions screening processes

**Potential Outcomes:**
- **No Findings:** Clean audit
- **Minor Findings:** Recommendations for improvement (e.g., update policy language)
- **Major Findings:** Remediation required within 30-90 days
- **Violations:** Fines (€100 - €400,000 depending on severity) or license revocation

**Preparation:**
- Maintain audit trail (all records organized and accessible)
- Assign point person (Compliance Officer) to liaise with FIU
- Be transparent (hiding issues makes them worse)

---

## 12. Geographic Restrictions

### 12.1 Prohibited Jurisdictions

**HypeAI Does NOT Serve Customers From:**

**Sanctioned Countries (EU/UN/OFAC):**
- Afghanistan (Taliban-controlled)
- Belarus (EU sanctions)
- Central African Republic (arms embargo)
- Cuba (US sanctions)
- Democratic Republic of Congo (arms embargo)
- Iran (comprehensive sanctions)
- Iraq (partial sanctions)
- Lebanon (Hezbollah-related)
- Libya (arms embargo)
- Mali (sanctions)
- Myanmar (Burma) (military junta sanctions)
- North Korea (comprehensive sanctions)
- Russia (comprehensive sanctions post-2022 Ukraine invasion)
- Somalia (arms embargo)
- South Sudan (arms embargo)
- Sudan (partial sanctions)
- Syria (comprehensive sanctions)
- Venezuela (sanctions on government)
- Yemen (Houthi-related sanctions)
- Zimbabwe (targeted sanctions)

**Occupied/Disputed Territories:**
- Crimea, Donetsk, Luhansk (Ukraine regions occupied by Russia)
- Abkhazia, South Ossetia (Georgia occupied regions)

**Crypto-Banned Countries:**
- China (crypto trading and mining banned)
- Bangladesh (crypto illegal)
- Bolivia (crypto banned)
- Nepal (crypto illegal)
- Algeria (crypto use prohibited)
- Egypt (fatwa against crypto, de facto banned)
- Morocco (crypto banned)

**High-Risk/No KYC Possible:**
- Countries where we cannot verify IDs (e.g., failed states)

**United States:**
- All 50 states, territories, and US citizens abroad (to avoid SEC jurisdiction)
- Exemption: If we obtain US legal opinion and Reg D compliance (future consideration, not for initial Private Sale)

### 12.2 FATF Grey and Black Lists

**FATF (Financial Action Task Force) Lists:**
- **Black List (High-Risk):** Countries with significant AML/CFT deficiencies (e.g., North Korea, Iran - already blocked)
- **Grey List (Increased Monitoring):** Countries with strategic deficiencies but committed to improvement

**Current Grey List Examples (As of 2024 - Check FATF Website for Updates):**
- Bulgaria, Burkina Faso, Cameroon, Croatia, Democratic Republic of Congo, Haiti, Jamaica, Jordan, Mali, Mozambique, Nigeria, Pakistan, Panama, Philippines, Senegal, South Africa, South Sudan, Syria, Tanzania, Turkey, Uganda, United Arab Emirates, Vietnam, Yemen

**HypeAI Policy on Grey List Countries:**

**Option A (Restrictive - Recommended for Initial Private Sale):**
- Block all grey list countries (safest approach)

**Option B (Risk-Based):**
- Allow grey list countries BUT require Enhanced Due Diligence (EDD) for ALL customers (see Section 5)
- Senior management approval required
- Extra scrutiny on source of funds

**Recommendation:** Start with Option A (block grey list), expand to Option B later if legal resources allow.

### 12.3 IP Blocking and VPN Detection

**Technical Implementation:**

**IP Geolocation:**
- Use IP geolocation database (MaxMind GeoIP2, IP2Location)
- Block access to KYC/purchase page if IP from prohibited country
- Display message: "HypeAI Private Sale is not available in your region."

**VPN/Proxy Detection:**
- Use VPN detection service (IPQualityScore, IPHub)
- Block or flag if VPN/proxy detected
- Manual review required (some legitimate users use VPNs for privacy, but high ML risk)

**Exceptions:**
- If customer is from allowed country but traveling in blocked country (IP mismatch):
  - Allow if KYC documents prove allowed country residence
  - But flag for manual review

**Tor Browser:**
- Block Tor exit nodes (commonly used for anonymity, high ML/TF risk)

---

## 13. Third-Party Payment Prohibition

### 13.1 Policy

**HypeAI Requires:**
- Payment must come from customer's OWN account (bank account or crypto wallet)
- Name on payment account MUST MATCH KYC name

**Prohibited:**
- Third-party payments (e.g., friend paying for you)
- Corporate payments for individual customer (unless customer is corporate entity with proper documentation)
- Shared bank accounts (unless all account holders complete KYC)

**Rationale:**
- Third-party payments are classic money laundering technique (smurfing, layering)
- Cannot verify source of funds if someone else paying
- AML regulations require identifying true beneficiary

### 13.2 Verification Methods

**Fiat (Bank Transfer):**
- Compare sender name on bank statement to KYC name
- If mismatch: Reject and request payment from customer's own account
- If spouse/family member: Explain policy, request customer's account

**Cryptocurrency:**
- Request wallet address from which payment will be sent (before purchase)
- Ask customer to prove control of wallet:
  - **Method 1:** Send small test transaction (e.g., $1 USDT) with unique reference code
  - **Method 2:** Sign message with private key (advanced users)
- If payment comes from different wallet: Flag for review
  - May be legitimate (exchange withdrawal wallet ≠ customer's deposit wallet)
  - Check: Is wallet linked to exchange where customer is KYC'd? (blockchain explorer + customer's exchange statement)

**Credit/Debit Card:**
- Cardholder name must match KYC name (enforced by payment processor automatically)
- If card declined and customer wants to use someone else's card: Reject

---

## 14. Crypto-Specific AML Measures

### 14.1 Blockchain Analysis

**Purpose:** Assess risk of crypto payments (are funds from illicit sources?).

**Tools:**
- **Chainalysis** (industry leader, used by law enforcement)
- **Elliptic** (AML for crypto, exchange compliance)
- **TRM Labs** (risk scoring)

**What to Check:**

**Wallet Risk Score:**
- Has wallet been used for illicit activities? (darknet markets, ransomware, scams, hacks)
- Direct exposure (wallet directly involved) = High risk
- Indirect exposure (received funds from risky wallet) = Moderate risk

**Source of Funds:**
- Where did crypto come from?
  - **Exchange withdrawal:** Lower risk (exchange did KYC)
  - **Mining rewards:** Low risk (legitimate source)
  - **P2P transfer:** Higher risk (unknown sender)
  - **Mixer/Tumbler:** High risk (money laundering tool)
  - **Privacy coin swap:** High risk (Monero, Zcash - anonymity-focused)

**Counterparties:**
- Has wallet transacted with sanctioned entities? (OFAC-sanctioned wallets)
- Chainalysis flags this automatically

**Risk Threshold:**
- **Low Risk (Score 0-3):** Accept
- **Moderate Risk (Score 4-6):** Manual review + request explanation
- **High Risk (Score 7-10):** Reject + file SAR

**Example:**
- Customer pays with USDT from wallet 0xABC123...
- Chainalysis scan shows: "Moderate risk - 2% of funds from high-risk source (gambling site) 6 months ago, 98% from Binance exchange"
- Action: Request customer to confirm they withdrew from Binance (provide screenshot), minor gambling history acceptable, proceed with caution

**Cost:**
- Chainalysis/Elliptic: €10,000 - €50,000/year for API access
- For small Private Sales (<500 participants), may use free tools (Etherscan, Blockchair - manual analysis) initially
- Upgrade to paid tools if scaling

### 14.2 Accepted Cryptocurrencies

**HypeAI Accepts (Lower Risk):**
- ✅ USDT (Tether) - Ethereum or Polygon network
- ✅ USDC (USD Coin) - Ethereum or Polygon network
- ✅ ETH (Ethereum)
- ✅ MATIC (Polygon)
- ✅ BTC (Bitcoin) - if blockchain analysis available

**HypeAI Does NOT Accept (Higher Risk):**
- ❌ Monero (XMR) - Privacy coin, untraceable
- ❌ Zcash (ZEC) - Privacy coin (shielded transactions)
- ❌ Dash (privacy features)
- ❌ Any coin from mixer or tumbler (clearly laundering)
- ❌ Newly launched/obscure coins (high scam risk)

**Rationale:**
- Privacy coins make AML compliance impossible (cannot trace source)
- Regulators (FATF, EU) increasingly prohibiting privacy coins for VASPs

---

## 15. Corporate Customers (If Applicable)

### 15.1 Enhanced KYC for Legal Entities

**If HypeAI Allows Corporate Purchases:**

**Additional Information Required:**

**Company Details:**
- Full legal name of entity
- Registration number and jurisdiction
- Registered address
- Business activities (what does company do?)
- Website and contact information
- Certificate of incorporation (official document)
- Articles of Association or equivalent

**Ultimate Beneficial Owners (UBOs):**
- Identify ALL individuals owning >25% of company (EU threshold)
- For each UBO: Full KYC (ID, POA, DOB, nationality) - same as individual customers
- If no one owns >25%, identify senior managing official (CEO, CFO)

**Authorized Signatory:**
- Person making purchase on behalf of company
- Power of Attorney or Board Resolution (authorizing this person to purchase)
- Full KYC on this person

**Source of Funds:**
- Company bank statements (showing sufficient funds)
- Financial statements or tax returns (if large purchase >€50,000)
- Explanation of business need for HypeAI Service Credits

**Example:**
- ABC Tech OÜ wants to purchase €100,000 in Credits
- Must provide:
  - Company registration certificate
  - UBO declaration (John Doe owns 60%, Jane Smith owns 40%)
  - KYC for John Doe (ID, POA)
  - KYC for Jane Smith (ID, POA)
  - Bank statement showing €100k+ balance
  - Explanation: "Company is building AI-powered SaaS product, needs HypeAI APIs for development"

### 15.2 Higher Risk Corporate Types

**Proceed with Caution:**
- Offshore companies (BVI, Cayman Islands, Seychelles) - often used for tax evasion or ML
- Shell companies (no real business operations) - red flag
- Newly incorporated (less than 6 months) with large purchase - suspicious
- Complex ownership structures (multiple layers, trusts, nominees) - obscures UBOs

**Enhanced DD Required:**
- Full corporate due diligence (business licenses, contracts, proof of operations)
- Enhanced UBO verification (passport notarization, proof of funds)
- Senior management approval
- Consider rejecting if cannot verify legitimacy

---

## 16. GDPR and Data Protection (Integration with AML)

### 16.1 Legal Basis for Processing KYC Data

**GDPR Article 6 (Lawful Basis):**
- **(c) Legal obligation:** Processing necessary to comply with AML/CTF laws (MLTFPA, AMLD5)
- **(b) Contract performance:** Processing necessary to provide Service Credits (Terms of Service)

**GDPR Article 9 (Special Categories):**
- Biometric data (selfie photo) processed for identity verification (GDPR Article 9(2)(a) - explicit consent required)

**Result:** KYC processing is lawful under GDPR (AML compliance = legal obligation).

### 16.2 Customer Rights (Limited by AML)

**GDPR Rights:**

| Right | Application to KYC Data |
|-------|------------------------|
| **Right to Access** | ✅ Customer can request copy of KYC data |
| **Right to Rectification** | ✅ Customer can correct errors (but must verify with new documents) |
| **Right to Erasure ("Right to be Forgotten")** | ❌ **LIMITED:** AML requires 5-year retention, so cannot delete until retention period expires |
| **Right to Restrict Processing** | ❌ **LIMITED:** Cannot restrict AML-required processing (ongoing monitoring, SAR filing) |
| **Right to Data Portability** | ✅ Can provide data in machine-readable format (JSON, PDF) |
| **Right to Object** | ❌ **LIMITED:** Cannot object to AML processing (legal obligation) |

**Example:**
- Customer requests: "Delete all my data"
- Response: "Under GDPR, you have the right to erasure. However, Estonian AML law requires us to retain your KYC information for 5 years from the date of your last transaction (until [DATE]). After this period, your data will be automatically deleted. We are legally obligated to retain this data and cannot delete it earlier."

### 16.3 Data Sharing with FIU and Law Enforcement

**GDPR Article 6(1)(c) and (e):**
- Processing for compliance with legal obligation (AML) or public interest (crime prevention) is lawful
- Customer consent NOT required for SAR filing or FIU requests (would defeat purpose - tipping off)

**Customer Does NOT Need to be Informed:**
- When SAR is filed (tipping off prohibition)
- When data shared with law enforcement pursuant to investigation

**Privacy Policy Disclosure:**
- Privacy Policy MUST disclose that data may be shared with FIU and law enforcement (generic statement, not SAR-specific)
- Example: "We may share your information with regulatory authorities (Estonian FIU) and law enforcement agencies as required by AML laws or upon lawful request."

---

## 17. Implementation Roadmap

### 17.1 Pre-Launch Checklist (Before Private Sale)

**Legal and Regulatory:**
- [ ] Draft AML/KYC policy (this document)
- [ ] Register as Virtual Currency Service Provider with Estonian FIU (if required)
- [ ] Appoint Compliance Officer
- [ ] Obtain Estonian lawyer review of AML procedures
- [ ] Draft Privacy Policy (GDPR-compliant)

**Technology:**
- [ ] Select and integrate KYC provider (Sumsub recommended)
- [ ] Implement sanctions/PEP screening (automated via KYC provider)
- [ ] Set up transaction monitoring system (alerts for >€10k, structuring, etc.)
- [ ] Implement IP geolocation and VPN detection (block prohibited countries)
- [ ] Blockchain analysis tool (Chainalysis, Elliptic) - optional initially, required if scaling

**Documentation:**
- [ ] Create customer file template (what to record for each customer)
- [ ] Develop SAR filing procedure (template, contact info, timeline)
- [ ] Design risk assessment form (for EDD cases)
- [ ] Prepare customer-facing KYC FAQ (explain why KYC required, how long it takes, etc.)

**Training:**
- [ ] Train all staff on AML procedures
- [ ] Conduct mock SAR exercise (practice identifying red flags and filing)
- [ ] Document training attendance

**Testing:**
- [ ] Test KYC flow (from customer perspective - is it smooth?)
- [ ] Test alert systems (trigger €10k threshold, verify alert fires)
- [ ] Test sanctions screening (add test name to simulate match, verify block works)

### 17.2 Launch Phase (During Private Sale)

**Daily Operations:**
- [ ] Compliance Officer reviews all new KYC submissions (or automated + sample review)
- [ ] Investigate any alerts (>€10k, red flags)
- [ ] Respond to customer KYC questions (support team trained)
- [ ] File SARs as needed (within 24 hours of identification)

**Weekly:**
- [ ] Review transaction monitoring log (any patterns?)
- [ ] Re-screen customers against updated sanctions lists (automated)
- [ ] Compliance team meeting (discuss any issues, edge cases)

**Monthly:**
- [ ] Report to senior management (number of customers, SARs filed, rejections, risks)
- [ ] Update risk assessment if needed (new red flags identified?)
- [ ] Audit sample of customer files (internal check - are procedures followed?)

### 17.3 Post-Sale (Ongoing)

**Quarterly:**
- [ ] Review high-risk customers (any new adverse media, transactions?)
- [ ] Update AML policy if regulations change
- [ ] Test backup and restore (ensure data not lost)

**Annually:**
- [ ] Refresher AML training for all staff
- [ ] File annual activity report with FIU (by March 31)
- [ ] Comprehensive risk assessment update
- [ ] External AML audit (optional but recommended)

**As Needed:**
- [ ] Respond to FIU inquiries or audits
- [ ] Update procedures for regulatory changes (e.g., MiCA implementation, new FATF guidance)
- [ ] File SARs for new suspicious activity (ongoing obligation)

---

## 18. Cost Estimates

### KYC/AML Implementation Costs

| Item | Cost (Estimated) | Frequency |
|------|------------------|-----------|
| **KYC Provider (Sumsub)** | €2-€5 per verification | Per customer |
| **Sanctions Screening (Included in KYC)** | €0 (if part of KYC package) | Ongoing |
| **Blockchain Analysis (Chainalysis)** | €10,000-€50,000/year | Annual (optional initially) |
| **Estonian FIU License Application** | €2,000 | One-time |
| **AML Legal Review (Estonian Lawyer)** | €2,000-€5,000 | One-time |
| **Compliance Officer (Salary)** | €3,000-€6,000/month (€36k-€72k/year) | Ongoing |
| **AML Training (Staff)** | €500-€2,000/year | Annual |
| **Transaction Monitoring Software** | €5,000-€15,000/year (if not built in-house) | Annual |
| **GDPR Compliance (DPA, Privacy Policy)** | €1,000-€3,000 | One-time |
| **External AML Audit** | €5,000-€10,000 | Annual (optional) |

**Total (Year 1, Excl. Per-Customer KYC Fees):**
- Low estimate: €15,000 + €3-€5 per customer
- High estimate: €100,000+ (if full Chainalysis, external audit, high-salary Compliance Officer)

**Recommendation for Initial Private Sale (<€1M):**
- Spend ~€20,000 on setup (lawyer, FIU license, KYC integration)
- Use in-house Compliance Officer (part-time or fractional initially)
- Skip Chainalysis (use free blockchain explorers, upgrade later)
- Focus on robust KYC (Sumsub) and sanctions screening

---

## 19. Key Takeaways

### AML Compliance Essentials for HypeAI

1. **KYC Everyone:** No exceptions, no minimum threshold. Every Service Credit buyer must complete KYC.

2. **Screen for Sanctions:** Automated screening against EU, UN, OFAC lists BEFORE accepting customer. Sanctions match = block + SAR.

3. **Enhanced DD for High-Risk:** Customers with >€10k purchases, PEPs, or from risky jurisdictions need extra documentation + senior approval.

4. **File SARs Promptly:** When in doubt, file Suspicious Activity Report with Estonian FIU within 24 hours. Do NOT tell customer.

5. **Block Prohibited Countries:** No sales to US, China, Russia, sanctioned countries. Use IP blocking + document verification.

6. **No Third-Party Payments:** Payment must come from customer's own account. Verify name matches KYC.

7. **Crypto Extra Scrutiny:** For crypto payments, use blockchain analysis (Chainalysis or manual) to check for illicit sources.

8. **Keep Records:** 5 years minimum (Estonian law), 7 years recommended. Secure, encrypted, accessible for audits.

9. **Train Staff:** Everyone handling customers needs AML training. Compliance culture is critical.

10. **Register with FIU:** Before launch, register as Virtual Currency Service Provider (if required - confirm with lawyer).

### Red Lines (Never Cross)

❌ **NEVER** accept customer without KYC (even friends, family, small amounts)
❌ **NEVER** tip off customer that SAR was filed (criminal offense)
❌ **NEVER** ignore red flags to "make the sale" (revenue vs compliance = compliance wins)
❌ **NEVER** delete KYC data before 5-year retention period (violates MLTFPA)
❌ **NEVER** accept payments from sanctioned countries or sanctioned individuals

---

## 20. Appendices

### Appendix A: KYC Rejection Reasons (Template Responses)

**Forged Document:**
> "We are unable to verify your identity document. Please provide an original, valid government-issued ID."

**Selfie Doesn't Match ID:**
> "We could not confirm the match between your selfie and ID photo. Please resubmit with clear lighting and ensure you are the person on the ID."

**Sanctioned Country:**
> "Unfortunately, we cannot provide services to residents of [COUNTRY] at this time."

**Suspicious Source of Funds:**
> "We are unable to proceed with your purchase. Per our AML policy, we require clear documentation of source of funds. This decision is final."

**VPN/Prohibited Jurisdiction:**
> "Our services are not available in your region. For more information, see our Terms of Service."

---

### Appendix B: SAR Template (Estonian FIU)

```
SUSPICIOUS ACTIVITY REPORT
To: Estonian Financial Intelligence Unit (raha@politsei.ee)

REPORTING ENTITY:
Name: HypeAI OÜ
Registry Code: [INSERT]
Address: [INSERT]
Contact: [Compliance Officer Name]
Email: compliance@hypeai.com
Phone: [INSERT]

REPORTED PERSON:
Name: [Customer Full Name]
Date of Birth: [DD/MM/YYYY]
Nationality: [Country]
Address: [Customer Address]
ID Number: [Passport/ID Number]

TRANSACTION DETAILS:
Date: [DD/MM/YYYY]
Amount: €[X,XXX]
Payment Method: [Bank transfer / Cryptocurrency]
Purpose: Purchase of HypeAI Service Credits

REASON FOR SUSPICION:
[Describe specific red flags, e.g.:]
- Customer refused to provide source of funds documentation despite repeated requests.
- Purchase amount (€50,000) inconsistent with declared occupation (student).
- Payment originated from high-risk jurisdiction (Nigeria) with no explanation.
- Multiple transactions just below €10,000 threshold (apparent structuring).

ACTIONS TAKEN:
- Customer purchase rejected.
- Funds refunded to originating account [OR] Funds frozen pending FIU instruction.
- Customer account blocked.

SUPPORTING DOCUMENTS ATTACHED:
- Customer KYC documents (ID, POA)
- Transaction confirmation
- Email correspondence with customer

CONTACT FOR FURTHER INFORMATION:
[Compliance Officer Name]
Email: compliance@hypeai.com
Phone: [INSERT]

Date Filed: [DD/MM/YYYY]
```

---

### Appendix C: Compliance Officer Job Description

**Position:** AML/KYC Compliance Officer
**Company:** HypeAI OÜ
**Location:** Estonia (remote possible within EU)
**Employment Type:** Full-time or Part-time (initially)

**Responsibilities:**
- Implement and maintain AML/KYC policies and procedures
- Review and approve high-risk customer accounts (EDD)
- Monitor transactions for suspicious activity
- File Suspicious Activity Reports (SARs) with Estonian FIU
- Conduct ongoing customer due diligence (periodic reviews)
- Liaise with Estonian FIU and law enforcement
- Organize AML training for staff
- Prepare for and respond to regulatory audits
- Stay updated on AML/CFT regulations (AMLD, MiCA, FATF)
- Quarterly reporting to senior management

**Requirements:**
- Legal, compliance, or finance background (law degree preferred)
- Knowledge of Estonian and EU AML regulations
- Experience in crypto/fintech compliance (preferred but not required)
- CAMS (Certified Anti-Money Laundering Specialist) or equivalent certification (preferred)
- Fluent in English (Estonian language is a plus)
- Detail-oriented, ethical, independent judgment

**Compensation:** €36,000 - €72,000/year (depending on experience, full-time vs part-time)

---

## DOCUMENT CONTROL

**Version:** 1.0 (Initial Draft)
**Date:** 2025-10-20
**Author:** HypeAI Legal & Compliance Team
**Status:** DRAFT - Pending Estonian lawyer and Compliance Officer review
**Next Review:** Before Private Sale launch and after FIU registration

**IMPORTANT:** This document is a comprehensive TEMPLATE. Must be reviewed and customized by qualified Estonian AML/compliance counsel before implementation. Regulatory requirements may change - stay updated.

---

**END OF KYC/AML COMPLIANCE PROCEDURES**
