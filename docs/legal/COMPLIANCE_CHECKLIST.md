# HypeAI - EU/Estonian Compliance Checklist

**For Lawyer Review - Company Registration Preparation**

---

## 🇪🇺 EU-LEVEL REGULATIONS

### 1. MiCA (Markets in Crypto-Assets Regulation)

**Status:** Entering force 2024-2025 (phased implementation)
**Applicability:** All crypto-asset service providers in EU

#### 1.1 Token Classification under MiCA

**Options:**
- [ ] **Asset-Referenced Token (ART)** - value pegged to assets
- [ ] **E-Money Token (EMT)** - value pegged to fiat currency
- [x] **Utility Token** - grants access to goods/services (HYPEAI)
- [ ] **Other Crypto-Asset**

**HYPEAI Classification: UTILITY TOKEN**

**Reasoning:**
- Governance rights (DAO voting)
- Staking functionality
- Platform access
- NOT pegged to anything
- NOT investment instrument

**MiCA Requirements for Utility Tokens:**
- [ ] Crypto-Asset White Paper (CAWP)
- [ ] Notification to national competent authority (60 days before issuance)
- [ ] Marketing communications compliance
- [ ] Disclosure requirements
- [ ] Consumer protection measures

**Timeline:**
- MiCA fully applicable: December 30, 2024 (for ARTs/EMTs), June 2025 (for other crypto-assets)

**Questions for Lawyer:**
1. Confirm HYPEAI = utility token under MiCA
2. White paper template/requirements
3. Notification process in Estonia
4. Grandfathering clause for tokens issued before MiCA?
5. Ongoing compliance obligations

---

#### 1.2 MiCA Authorization Requirements

**Crypto-Asset Service Providers (CASPs) need authorization for:**
- [ ] Operating a trading platform
- [ ] Exchanging crypto-assets for funds or other crypto-assets
- [ ] Executing orders on behalf of clients
- [ ] Placing crypto-assets
- [ ] Receiving and transmitting orders
- [ ] Providing custody and administration of crypto-assets
- [ ] Providing advice on crypto-assets
- [ ] Providing portfolio management on crypto-assets
- [ ] Providing transfer services for crypto-assets

**HypeAI activities:**
- [x] **NOT operating a trading platform** (users trade peer-to-contract, not peer-to-peer)
- [x] **NOT custody** (non-custodial, users control keys)
- [x] **NOT advice** (AI predictions with disclaimers, not financial advice)
- [?] **Platform for token access** - clarify with lawyer

**Question for Lawyer:** Do we need CASP authorization under MiCA?

---

#### 1.3 MiCA Compliance Checklist

If CASP authorization required:

**Organizational:**
- [ ] Own funds requirements (€50K-€150K depending on service)
- [ ] Professional indemnity insurance (€1M+)
- [ ] Governance arrangements
- [ ] Sound & prudent management
- [ ] Robust conflict of interest policy

**Operational:**
- [ ] Complaint handling procedure
- [ ] AML/CFT compliance program
- [ ] Cybersecurity measures
- [ ] Business continuity plan
- [ ] Outsourcing policy

**Disclosure:**
- [ ] White paper (CAWP)
- [ ] Marketing materials review
- [ ] Website disclosures
- [ ] Risk warnings

**Questions for Lawyer:**
1. Exemptions for small issuers (if any)
2. Passporting rights (offer in all EU once authorized in Estonia)
3. Cost estimate for full MiCA compliance
4. Timeline for authorization

---

### 2. GDPR (General Data Protection Regulation)

**Status:** In force since May 2018
**Applicability:** All entities processing EU residents' data

#### 2.1 GDPR Compliance Checklist

**Legal Basis for Processing:**
- [x] Consent (user agrees to terms)
- [x] Contractual necessity (need data to provide service)
- [x] Legitimate interest (platform operation)

**Data Collected:**
- [x] Email address (optional)
- [x] Wallet address (public on blockchain)
- [x] IP address (server logs)
- [x] Usage analytics (Google Analytics or similar)
- [x] Transaction history (on-chain + off-chain)

**Data Subject Rights:**
- [ ] Right to access (user can request their data)
- [ ] Right to rectification (correct inaccurate data)
- [ ] Right to erasure ("right to be forgotten")*
- [ ] Right to data portability (export data)
- [ ] Right to object (stop processing)
- [ ] Right to restrict processing

***Blockchain Caveat:** Cannot delete data from blockchain (immutable). Disclaimer needed.

**GDPR Documents Needed:**
- [ ] Privacy Policy (comprehensive, user-friendly)
- [ ] Cookie Policy
- [ ] Terms of Service (data processing clauses)
- [ ] Data Processing Agreement (DPA) for third parties
- [ ] DPIA (Data Protection Impact Assessment) if high-risk processing

**Technical Measures:**
- [x] Data encryption (at rest & in transit)
- [x] Pseudonymization (wallet addresses, no real names)
- [x] Access controls (role-based)
- [ ] Automated deletion processes (for erasure requests)
- [ ] Data breach detection (monitoring)

**Data Protection Officer (DPO):**
- [ ] Required? (if processing large scale or special category data)
- [ ] If yes: appoint DPO (internal or external)

**Data Breach Notification:**
- [ ] Process to detect breaches
- [ ] Notification to authority within 72 hours
- [ ] Notification to users if high risk

**Questions for Lawyer:**
1. DPO required for our scale/activity?
2. Blockchain immutability = GDPR conflict solution?
3. Privacy Policy template for crypto projects
4. Cookie consent requirements (strict interpretation?)
5. Data retention periods (emails, logs, etc.)
6. Cross-border data transfer (EU to non-EU)

---

#### 2.2 GDPR-Compliant Architecture

**Data Storage:**
- [x] EU servers (AWS eu-central-1 Frankfurt)
- [x] No transfer to non-EU (or Standard Contractual Clauses if needed)
- [x] Encryption: AES-256 at rest, TLS 1.3 in transit

**Third-Party Processors:**
| Service | Data Shared | GDPR DPA | Location |
|---------|-------------|----------|----------|
| AWS | All backend data | Yes (AWS GDPR DPA) | EU |
| MongoDB Atlas | User data | Yes | EU |
| Cloudflare | IP, logs | Yes | Global (DPA) |
| SendGrid | Emails | Yes | US (SCC) |
| Google Analytics | Analytics | Yes | US (SCC / GA4) |

**Action:** Ensure all third-party DPAs signed.

---

### 3. AML/CFT (Anti-Money Laundering / Counter-Terrorist Financing)

**Directive:** 5AMLD (5th Anti-Money Laundering Directive), 6AMLD

#### 3.1 AML Applicability

**Crypto-asset service providers = "Obliged Entities" under 5AMLD**

**Activities triggering AML:**
- [ ] Exchanging crypto ↔ fiat
- [ ] Exchanging crypto ↔ crypto (if custodial)
- [ ] Custodial wallet services
- [ ] ICO/token sale organizer

**HypeAI activities:**
- [x] **Token sale** (YES - likely AML applicable)
- [x] **Staking** (non-custodial) - unclear, discuss with lawyer
- [x] **No fiat** (crypto-only) - may reduce burden
- [x] **Non-custodial** (users control keys) - may exempt

**Question for Lawyer:** Are we an "obliged entity"? To what extent?

---

#### 3.2 AML/CFT Compliance Requirements

**If AML Applies:**

**1. Customer Due Diligence (CDD):**
- [ ] KYC (Know Your Customer) for all users
- [ ] Identity verification (ID document, selfie, liveness)
- [ ] Address verification (utility bill, bank statement)
- [ ] Source of funds (for large transactions)
- [ ] Enhanced Due Diligence (EDD) for high-risk customers

**Thresholds:**
- €1,000+ transaction: KYC required (may vary by country)
- €10,000+ in a month: enhanced scrutiny
- No threshold if high-risk indicators

**2. Transaction Monitoring:**
- [ ] Automated monitoring system (Chainalysis, Elliptic, etc.)
- [ ] Suspicious transaction detection
- [ ] Sanctions screening (OFAC, EU sanctions lists)
- [ ] Politically Exposed Persons (PEP) checks

**3. Reporting:**
- [ ] Suspicious Activity Reports (SARs) to FIU (Financial Intelligence Unit)
- [ ] Large transaction reports (if required)
- [ ] Annual AML report to regulator

**4. Record Keeping:**
- [ ] Keep KYC records for 5 years after customer relationship ends
- [ ] Keep transaction records for 5 years
- [ ] Secure storage, encrypted

**5. AML Officer:**
- [ ] Appoint AML/Compliance Officer (person responsible)
- [ ] Training for all employees
- [ ] Internal AML policies & procedures manual

**6. Risk Assessment:**
- [ ] Enterprise-wide risk assessment (document ML/TF risks)
- [ ] Customer risk rating (low, medium, high)
- [ ] Ongoing risk review

**Questions for Lawyer:**
1. Do we need full AML program or simplified?
2. KYC required for token sale? At what threshold?
3. Staking = AML trigger?
4. Non-custodial = AML exemption?
5. Recommended KYC provider (Sumsub, Onfido, Jumio)?
6. AML officer = founder OK or must be dedicated role?
7. Cost of AML compliance annually?

---

### 4. Consumer Protection

**Directive:** Consumer Rights Directive, Unfair Commercial Practices Directive

#### 4.1 Consumer Protection Checklist

**Transparency:**
- [ ] Clear Terms of Service
- [ ] Privacy Policy easily accessible
- [ ] Fee structure disclosed
- [ ] Risk warnings (crypto volatility, smart contract risks)
- [ ] No misleading marketing

**Right of Withdrawal:**
- [ ] 14-day cooling-off period for EU consumers (for services)
- [ ] Exception for crypto (speculative, volatile)? Clarify with lawyer.

**Unfair Terms:**
- [ ] No one-sided terms heavily favoring platform
- [ ] Dispute resolution clause (arbitration or court)
- [ ] Liability limitations (must be reasonable)

**Accessibility:**
- [ ] Website WCAG 2.1 compliant (accessibility for disabled)

**Questions for Lawyer:**
1. Right of withdrawal applicable to token purchases?
2. Acceptable liability limitations in ToS?
3. Mandatory dispute resolution (ODR platform)?
4. Consumer protection fines - what triggers?

---

## 🇪🇪 ESTONIAN-SPECIFIC REGULATIONS

### 5. Estonian Virtual Currency License

**Law:** Money Laundering and Terrorist Financing Prevention Act (MLTFPA)

#### 5.1 License Types

**Two licenses for virtual currency:**

**A. Virtual Currency Exchange Service:**
- Definition: Exchanging virtual currency against fiat or vice versa
- HypeAI: **NO** (we don't handle fiat, only crypto)

**B. Virtual Currency Wallet Service:**
- Definition: Custodial wallet (holding customer crypto)
- HypeAI: **NO** (non-custodial, users hold private keys)

**Question for Lawyer:**
- Do we need ANY virtual currency license?
- Token issuance = exchange service?
- Staking platform = wallet service?
- Non-custodial exemption confirmed?

---

#### 5.2 License Requirements (if needed)

**Share Capital:**
- €12,000 minimum for OÜ with VC license

**AML Compliance:**
- [ ] Full AML/CFT program (as per section 3.2)
- [ ] AML officer appointed
- [ ] Internal procedures documented

**Documentation:**
- [ ] Business plan
- [ ] Description of technology
- [ ] Risk assessment
- [ ] AML manual
- [ ] Proof of share capital
- [ ] Criminal record certificates (directors)
- [ ] Source of funds for capital

**Processing Time:** 60 days (can be extended)
**Cost:** €3,000-10,000 (lawyer + application fees)

**Annual Renewal:**
- [ ] Activity report
- [ ] Financial statements
- [ ] Compliance report
- Fee: ~€1,000-3,000/year

**Questions for Lawyer:**
1. Confirm license requirement (yes/no)
2. Timeline for application
3. Likelihood of approval for DAO project
4. Exemptions for small-scale issuers
5. Consequences of operating without license (if required)

---

### 6. Estonian Company Law

**Law:** Commercial Code

#### 6.1 OÜ (Osaühing) - Limited Liability Company

**Pros:**
- Simple to establish
- 1 founder minimum
- €2,500 minimum share capital (no license)
- €12,000 if VC license needed
- Lower administrative burden
- Suitable for startups

**Cons:**
- Less prestigious than AS
- May be harder to attract institutional investors

**Requirements:**
- [ ] 1+ shareholders
- [ ] 1+ board members (director)
- [ ] Registered office in Estonia
- [ ] Share capital deposited in bank account

---

#### 6.2 AS (Aktsiaselts) - Public Limited Company

**Pros:**
- More prestigious
- Easier to raise capital (issue shares)
- Can be listed on stock exchange

**Cons:**
- €25,000 minimum share capital
- More complex governance
- Supervisory board required (3+ members)
- Higher costs

**Requirements:**
- [ ] 2+ founders (minimum)
- [ ] Supervisory board (3+ members)
- [ ] Management board (1+ members)
- [ ] €25,000 share capital
- [ ] Auditor (if large company)

---

#### 6.3 Recommendation

**For HypeAI: OÜ (initial), upgrade to AS later if needed**

**Reasoning:**
- Faster setup
- Lower capital requirement
- One founder OK
- Can convert to AS later

**Question for Lawyer:** Agree with OÜ choice? Any drawbacks for crypto project?

---

### 7. Estonian Tax Law

#### 7.1 Corporate Income Tax

**Rate:** 20% on **distributed profits** only (0% on retained profits)

**How it works:**
```
Profit earned: €100,000
If retained (reinvested): €0 tax
If distributed (dividends): €25,000 tax (20/80 * 100,000)
```

**Crypto Specifics:**
- Crypto income = taxable income
- Crypto holdings = assets (valuation at acquisition cost)
- Crypto sales = income (sale price - cost basis)
- Staking rewards received by company = income

**Questions for Lawyer:**
1. When does crypto income become "profit" (upon sale, upon receipt)?
2. Conversion rate for crypto → EUR (daily close, moment of transaction)?
3. Can we keep profits in crypto (not convert to fiat) and defer tax?
4. Staking rewards taxation (when distributed to users vs when earned by contract)?
5. Burn mechanism = expense (reduces profit)?

---

#### 7.2 VAT (Value-Added Tax)

**Standard Rate:** 22% (Estonia)

**Crypto VAT Treatment (EU-wide):**
- Crypto = "means of payment" (VAT exempt) per EU Court of Justice
- Exchanging crypto ↔ fiat = VAT exempt
- Exchanging crypto ↔ crypto = VAT exempt

**Software/Services VAT:**
- Software-as-a-Service (SaaS) = 22% VAT (if not exempt)
- AI services = 22% VAT (if not exempt)
- Platform fees = possibly VAT exempt (if part of crypto transaction)

**VAT Registration:**
- Mandatory if turnover > €40,000/year
- Voluntary below threshold

**Questions for Lawyer:**
1. Platform fees (8% of transactions) = VAT exempt as part of crypto?
2. AI services paid in HYPEAI = VAT applicable?
3. Staking rewards = VAT taxable event?
4. Should we register for VAT from day 1 or wait for threshold?
5. Cross-border services (reverse charge)?

---

#### 7.3 Social Tax

**If hiring employees in Estonia:**
- Employer pays 33% social tax (20% pension + 13% health insurance)
- Employee pays 0% (employer covers)

**If contractors:**
- Pay as business expense
- No social tax (contractor responsible for own)

**Question for Lawyer:**
- Remote contractors abroad = any Estonian tax obligations?
- AI agents = no tax (not legal persons 😊)

---

### 8. Estonian E-Residency

**What is it:**
- Digital identity for non-residents
- Access to Estonian e-services
- Can establish and manage Estonian company remotely

**Benefits:**
- No need to visit Estonia (initially)
- 100% online company management
- Digital signatures
- File taxes online

**Requirements:**
- [ ] Application online (e-residency.gov.ee)
- [ ] Background check (police clearance)
- [ ] €100-120 fee
- [ ] Pick up card in Estonian embassy/service point

**Timeline:** 4-8 weeks

**Question for Lawyer:**
1. E-Residency sufficient for company registration?
2. Any advantages to physical residency vs e-residency?
3. Tax residency implications (if spend >183 days in Estonia)?

---

## 🌍 INTERNATIONAL COMPLIANCE

### 9. Restricted Jurisdictions

#### 9.1 Countries to Exclude (Sanctions)

**OFAC (US Office of Foreign Assets Control) Sanctions:**
- [ ] Cuba
- [ ] Iran
- [ ] North Korea
- [ ] Syria
- [ ] Crimea, Donetsk, Luhansk (Ukraine regions)
- [ ] Plus: individuals on SDN list (Specially Designated Nationals)

**EU Sanctions:**
- Similar list + additional individuals/entities
- Russia (partial sanctions)

**UN Sanctions:**
- Follow UN lists

**Implementation:**
- [ ] IP geo-blocking
- [ ] Terms of Service exclusions
- [ ] KYC screening (if KYC implemented)
- [ ] Wallet address screening (Chainalysis, Elliptic)

---

#### 9.2 High-Risk Jurisdictions

**Countries with strict crypto bans:**
- [ ] China (crypto banned)
- [ ] Algeria, Bangladesh, Egypt, Iraq, Morocco, Nepal, Qatar (various bans)

**USA:**
- [ ] Complex regulations (SEC, CFTC, FinCEN)
- [ ] Many projects exclude US users to avoid SEC issues
- [ ] **Recommend: Exclude USA** (at least initially)

**Implementation:**
- [ ] IP blocking
- [ ] Terms: "Not available to US persons"
- [ ] VPN detection (optional, difficult)

**Question for Lawyer:**
1. Liability if US user bypasses restrictions (VPN)?
2. Sufficient disclaimer in ToS or need active blocking?
3. Other jurisdictions to exclude?

---

### 10. Cross-Border Data Transfers

**GDPR Restrictions:**
- Cannot transfer EU personal data to non-EU countries without safeguards

**Safeguards:**
- [ ] **Adequacy Decision** (EU Commission deems country adequate)
  - Currently: UK, Switzerland, Japan, etc.
  - NOT USA (Privacy Shield invalidated 2020)

- [ ] **Standard Contractual Clauses (SCCs)**
  - Template contracts approved by EU
  - Use with AWS, SendGrid, etc.

- [ ] **Binding Corporate Rules (BCRs)**
  - For multinational companies

- [ ] **User Consent**
  - Informed consent to data transfer
  - Not reliable alone

**HypeAI Strategy:**
- [x] Keep data in EU (AWS eu-central-1)
- [x] Use SCCs for necessary non-EU services (SendGrid for emails)
- [ ] Review all vendor contracts for DPA/SCCs

**Question for Lawyer:**
1. SCCs template for third-party services
2. Review AWS DPA (already have, but confirm)
3. Blockchain data = transferred globally (issue?)

---

## 📋 PRE-REGISTRATION CHECKLIST

### 11. Documents to Prepare

**For Company Registration:**
- [ ] Founder passport (notarized or Apostille)
- [ ] Proof of address (utility bill, bank statement)
- [ ] E-Residency card (if applicable)
- [ ] Articles of Association draft
- [ ] Share capital proof (bank deposit €2,500 or €12,000)
- [ ] Registered office agreement (virtual office or physical)
- [ ] Business activity description
- [ ] AML manual (if VC license needed)

**For Lawyer:**
- [x] Company description (COMPANY_DESCRIPTION_RU.md)
- [x] Business model overview (BUSINESS_MODEL_OVERVIEW.md)
- [x] Technical summary (TECHNICAL_SUMMARY.md)
- [x] Questions list (QUESTIONS_FOR_LAWYER.md)
- [x] Compliance checklist (this document)
- [ ] Whitepaper (draft)
- [ ] Tokenomics model

---

### 12. Policies & Legal Documents to Create

**Essential:**
- [ ] Terms of Service (ToS)
- [ ] Privacy Policy
- [ ] Cookie Policy
- [ ] Risk Disclosure / Disclaimer
- [ ] AML Policy (if required)
- [ ] KYC Procedure (if required)

**Smart Contract Specific:**
- [ ] Smart Contract Disclaimer
  - "Code is provided as-is"
  - "No warranty"
  - "Use at your own risk"
  - "Not financial advice"

**DAO Governance:**
- [ ] DAO Governance Rules (off-chain document)
- [ ] Proposal Submission Guidelines
- [ ] Voting Procedures

**Questions for Lawyer:**
1. Can you provide templates for ToS, Privacy, etc.?
2. Review service available for our drafts?
3. Multi-lingual requirements (Estonian + English)?

---

## 🔍 ONGOING COMPLIANCE

### 13. Annual Obligations (Estonia)

**For OÜ:**
- [ ] Annual Report (within 6 months of fiscal year end)
  - Income statement
  - Balance sheet
  - Notes
  - Management report (if applicable)

- [ ] Submit to Commercial Register
- [ ] Shareholders meeting minutes (approval of report)

**Tax Filings:**
- [ ] Corporate Income Tax: Only when distributing profits
- [ ] VAT: Quarterly (if registered)
- [ ] TSD (Tax & Customs Board) declarations: Monthly payroll (if employees)

**AML (if licensed):**
- [ ] Annual activity report
- [ ] Risk assessment update
- [ ] Staff training records

**MiCA (if applicable):**
- [ ] White paper updates (if material changes)
- [ ] Annual audited financials (if large CASP)
- [ ] Compliance reports to regulator

---

### 14. Regulatory Monitoring

**Crypto regulations change frequently. Need:**

- [ ] Legal counsel retainer (monthly check-ins)
- [ ] Membership in industry association (e.g., Blockchain Association)
- [ ] Regulatory news alerts (Google Alerts, specialized services)
- [ ] Annual compliance audit

**Questions for Lawyer:**
1. Retainer terms (monthly fee, scope)?
2. Regulatory monitoring service available?
3. Recommended compliance consultant?

---

## 🎯 PRIORITY COMPLIANCE ACTIONS

### Immediate (Before Company Registration)

**Priority 1:**
- [ ] Confirm company structure: OÜ recommended
- [ ] Determine VC license requirement
- [ ] Classify HYPEAI token (utility confirmed?)
- [ ] Draft Articles of Association

**Priority 2:**
- [ ] E-Residency application (if not already)
- [ ] Choose registered office (virtual office provider)
- [ ] Open bank account (or plan alternative - difficult for crypto)
- [ ] Deposit share capital

**Priority 3:**
- [ ] Draft Terms of Service
- [ ] Draft Privacy Policy
- [ ] Draft Risk Disclaimers
- [ ] Prepare KYC procedure (if needed)

---

### Short-Term (Within 3 Months)

**Legal:**
- [ ] Register company
- [ ] Apply for VC license (if required)
- [ ] Trademark registration ("HypeAI")
- [ ] GDPR compliance audit

**Technical:**
- [ ] Implement geo-blocking (restricted countries)
- [ ] Cookie consent banner
- [ ] Privacy-friendly analytics (or proper consent)
- [ ] Data retention/deletion automation

**Operational:**
- [ ] Hire/appoint AML officer (if needed)
- [ ] AML monitoring tool (if needed)
- [ ] Set up accounting system (crypto-compatible)
- [ ] Insurance (Directors & Officers, Professional Indemnity)

---

### Medium-Term (Within 6 Months)

**MiCA Preparation:**
- [ ] Draft Crypto-Asset White Paper (CAWP)
- [ ] Submit notification to regulator (60 days before token issuance)
- [ ] Review marketing materials for MiCA compliance

**Security:**
- [ ] Smart contract audit (CertiK, Trail of Bits)
- [ ] Penetration testing (backend, frontend)
- [ ] Bug bounty program launch

**Governance:**
- [ ] DAO legal structure finalization
- [ ] Treasury management procedures
- [ ] Conflict resolution mechanism

---

## 📊 COMPLIANCE COST ESTIMATE

### One-Time Costs

| Item | Cost (EUR) | Notes |
|------|-----------|-------|
| E-Residency | €100-120 | One-time |
| Company Registration (OÜ) | €200-500 | State fees + notary |
| Legal Consultation (initial) | €1,000-3,000 | Lawyer fees for setup |
| Share Capital | €2,500 or €12,000 | Refundable (company asset) |
| Virtual Office (1 year) | €300-1,200 | Address service |
| VC License (if needed) | €3,000-10,000 | Lawyer + application |
| Trademark | €200-1,000 | Estonian + EU trademark |
| **TOTAL** | **€7,300-28,820** | Depending on license |

---

### Annual Costs

| Item | Cost (EUR/year) | Notes |
|------|----------------|-------|
| Legal Retainer | €6,000-24,000 | €500-2,000/month |
| Accounting | €1,200-3,600 | €100-300/month |
| Annual Report Filing | €300-1,000 | Accountant fee |
| Virtual Office | €300-1,200 | Renewal |
| VC License Renewal | €1,000-3,000 | If applicable |
| AML Compliance Tool | €2,000-10,000 | Chainalysis, Elliptic subscription |
| Insurance (D&O, PI) | €2,000-5,000 | Depends on coverage |
| Audits (smart contract, security) | €15,000-50,000 | First year, then annual reviews |
| **TOTAL** | **€27,800-97,800** | First year (high due to audits) |
| **TOTAL** | **€12,800-47,800** | Subsequent years (no audits) |

**Notes:**
- Costs vary widely based on project scale
- Early-stage can minimize (no retainer, basic accounting)
- As grow, compliance costs increase

---

## ✅ COMPLIANCE CONFIDENCE SCORE

### Current Status (Self-Assessment)

| Area | Status | Confidence |
|------|--------|------------|
| **Company Structure** | Planning | 🟡 Medium (need lawyer input) |
| **MiCA Compliance** | Research | 🟡 Medium (utility token, but need white paper) |
| **GDPR** | Designed | 🟢 High (EU servers, privacy by design) |
| **AML/KYC** | Uncertain | 🔴 Low (need lawyer to clarify requirement) |
| **Estonian Law** | Research | 🟡 Medium (understand basics, need specifics) |
| **Tax Compliance** | Planning | 🟡 Medium (understand 0% retention, need accountant) |
| **Consumer Protection** | Draft | 🟢 High (ToS, disclaimers planned) |
| **Smart Contract Security** | Testing | 🟢 High (1,400 tests, audit planned) |
| **Data Security** | Implemented | 🟢 High (encryption, EU servers) |
| **International** | Planning | 🟡 Medium (geo-blocking planned) |

**Overall Compliance Readiness: 70% (Medium-High)**

**Next Steps to 100%:**
1. Lawyer consultation (this document's purpose!)
2. Finalize MiCA white paper
3. Clarify AML/VC license requirement
4. Register company
5. Implement KYC (if needed)
6. Complete smart contract audit
7. Launch compliance monitoring

---

## 📞 QUESTIONS FOR LAWYER (Prioritized)

### TOP 10 CRITICAL QUESTIONS

1. **OÜ or AS?** Which structure for crypto/token project?
2. **VC License?** Do we need Estonian virtual currency license?
3. **MiCA Classification?** Confirm HYPEAI = utility token, requirements?
4. **AML/KYC?** What level of AML compliance required?
5. **Token Sale Legality?** Public sale structure, restrictions?
6. **DAO Legal Status?** How to legally structure DAO?
7. **Smart Contract Liability?** Who is liable for contract bugs?
8. **Banking?** How to open Estonian bank account for crypto company?
9. **Non-Resident Founder?** Implications, e-Residency sufficient?
10. **Annual Costs?** Realistic estimate for compliance budget?

### ADDITIONAL QUESTIONS

11. Tax treatment of staking rewards (company & users)?
12. GDPR blockchain immutability conflict - solution?
13. Terms of Service templates available?
14. Geo-blocking USA - sufficient disclaimer or active blocking?
15. Trademark registration process for "HypeAI"?
16. Insurance requirements (D&O, PI, cyber)?
17. Multi-lingual requirements (Estonian + English + Russian)?
18. Regulatory timeline - how long to launch legally?
19. Passporting rights (if authorized in Estonia, can offer in EU)?
20. Ongoing legal retainer structure & cost?

---

## 📋 APPENDIX: REGULATORY RESOURCES

### Estonian Authorities

**Financial Intelligence Unit (FIU):**
- Website: www.politsei.ee/en/fiu
- Email: fiu@politsei.ee
- AML/CFT supervision for VASPs

**Estonian Financial Supervision Authority (FSA):**
- Website: www.fi.ee
- Potential MiCA supervisor (TBD)

**Tax and Customs Board:**
- Website: www.emta.ee
- Tax matters

**Commercial Register:**
- Website: www.rik.ee
- Company registration

---

### EU Authorities

**European Securities and Markets Authority (ESMA):**
- Website: www.esma.europa.eu
- MiCA coordination

**European Banking Authority (EBA):**
- Website: www.eba.europa.eu
- AML/CFT guidelines

**European Data Protection Board (EDPB):**
- Website: edpb.europa.eu
- GDPR guidance

---

### Industry Associations

**Blockchain Association (USA):**
- Website: theblockchainassociation.org

**European Crypto Initiative:**
- Website: www.euci.io

**Estonian Blockchain & Cryptocurrency Association:**
- Research if exists

---

### Legal Resources

**MiCA Regulation Text:**
- EUR-Lex: eur-lex.europa.eu (search "MiCA")

**GDPR Text:**
- EUR-Lex: Regulation (EU) 2016/679

**Estonian Money Laundering Act:**
- Riigi Teataja: www.riigiteataja.ee (English translations available)

---

## 🎯 FINAL CHECKLIST FOR LAWYER MEETING

**Bring to Meeting:**
- [x] This compliance checklist
- [x] Company description (Russian + English summary)
- [x] Business model overview
- [x] Technical summary
- [x] Questions list
- [ ] Founder passport copy
- [ ] E-Residency card (if have)
- [ ] Draft whitepaper (if ready)

**Goals for Meeting:**
- [ ] Confirm company structure (OÜ)
- [ ] Determine license requirements
- [ ] Get cost estimate (setup + annual)
- [ ] Timeline to launch legally
- [ ] Next steps action list
- [ ] Retainer agreement (if ongoing counsel)

**Follow-Up:**
- [ ] Incorporate lawyer feedback
- [ ] Prepare documents per lawyer's list
- [ ] Schedule follow-up meeting
- [ ] Begin registration process

---

**PREPARED FOR:** Estonian lawyer consultation
**DATE:** October 19, 2025
**VERSION:** 1.0 - Compliance Checklist
**STATUS:** Ready for lawyer review

**CREATOR:** HypeAI Founder with AI Agent Assistance 🤖

---

**END OF COMPLIANCE CHECKLIST**
