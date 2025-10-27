/**
 * HypeAI Language Switcher
 * Professional i18n system for English/Russian
 * Agent: BABEL - Translation Specialist
 */

(function() {
    'use strict';

    // Embedded translations (to avoid CORS issues with file:// protocol)
    // COMPLETE translations for EN, RU, ZH - ALL sections covered!
    const TRANSLATIONS = {"en":{
        // About page translations
        "about_title":"About",
        "about_description":"Building the future of AI-powered professional services through advanced artificial intelligence and automation",
        "about_mission_label":"Our Mission",
        "about_mission_title":"Democratizing AI Services",
        "about_mission_description":"HypeAI combines cutting-edge artificial intelligence with professional service delivery to create AI-powered solutions that anyone can use. Our platform of 27 specialized AI agents works 24/7 to deliver exceptional results that were previously only available to large enterprises. We believe that powerful AI services should be fast, affordable, and accessible. That's why we've built a platform that delivers 3-10x faster results at 50-70% lower costs while maintaining premium quality standards.",
        "about_why_label":"Why HypeAI",
        "about_why_title":"Built for Performance",
        "about_why_description":"Enterprise-grade AI infrastructure designed to deliver exceptional results",
        "about_advantage_speed_title":"Lightning Fast Delivery",
        "about_advantage_speed_description":"3-10x faster than traditional agencies. Our AI agents work in parallel, completing complex projects in days instead of months.",
        "about_advantage_quality_title":"Premium Quality",
        "about_advantage_quality_description":"Enterprise-grade deliverables with consistent quality. Each project is reviewed by multiple specialized AI agents for excellence.",
        "about_advantage_cost_title":"Cost Effective",
        "about_advantage_cost_description":"50-70% cheaper than traditional solutions. Get agency-quality work at a fraction of the cost with AI efficiency.",
        "about_advantage_security_title":"Battle-Tested Security",
        "about_advantage_security_description":"Your data and projects are secured by industry-leading infrastructure with multiple layers of protection.",
        "about_advantage_availability_title":"Global Availability",
        "about_advantage_availability_description":"27 AI agents working 24/7 across all time zones. Never wait for business hours to get work done.",
        "about_advantage_scalability_title":"Scalable Solutions",
        "about_advantage_scalability_description":"From small tasks to enterprise projects. Our AI infrastructure scales seamlessly to meet your needs.",
        "about_team_label":"Team",
        "about_team_title":"Meet Our Team",
        "about_team_description":"Expert AI researchers, developers, and service professionals working together",
        "about_values_label":"Core Values",
        "about_values_title":"What We Stand For",
        "about_values_transparency_title":"Transparency",
        "about_values_transparency_description":"Clear pricing, honest timelines, and open communication. You always know exactly what you're getting.",
        "about_values_accessibility_title":"Accessibility",
        "about_values_accessibility_description":"Professional-grade AI services shouldn't require massive budgets. We're making enterprise tools available to everyone.",
        "about_values_innovation_title":"Innovation",
        "about_values_innovation_description":"Constantly improving our AI models with the latest research and adding new capabilities based on user feedback.",
        "about_values_security_title":"Security First",
        "about_values_security_description":"Multiple security audits, robust encryption, and conservative design ensure your data is protected at all times.",
        "about_values_customer_title":"Customer Focused",
        "about_values_customer_description":"Every decision we make starts with one question: How does this benefit our customers?",
        "about_values_quality_title":"Quality Excellence",
        "about_values_quality_description":"We're building for the long term. Sustainable growth and genuine value creation over short-term gains.",
        // Original translations for other pages
        "about_hero_label":"Our Mission & Vision",
        "about_mission_card_title":"Making Professional AI Accessible to Everyone",
        "about_advantage_bnb_title":"BNB Chain Powered",
        "about_advantage_referral_title":"3-Tier Referral System",
        "about_advantage_vesting_title":"Smart Vesting",
        "about_platform_label":"About HypeAI",
        "about_platform_title":"AI-Powered Crypto Platform",
        "about_platform_description":"Professional AI services meet blockchain innovation",
        "about_platform_agents_title":"27 AI Agents Working 24/7",
        "about_platform_services_title":"35+ Professional Services",
        "about_platform_tokenomics_title":"Token Economics",
        "about_platform_rewards_title":"Referral Rewards",
        "about_platform_vesting_title":"Fair Vesting Schedule",
        "about_platform_integration_title":"BNB Chain Integration",
        "about_team_member1_name":"Dr. Sarah Chen",
        "about_team_member1_role":"Chief AI Officer",
        "about_team_member2_name":"Marcus Rodriguez",
        "about_team_member2_role":"Chief Technology Officer",
        "about_team_member3_name":"Emily Zhang",
        "about_team_member3_role":"Head of Product",
        "about_team_member4_name":"James Park",
        "about_team_member4_role":"Security Director",
        "about_team_member5_name":"Olivia Martinez",
        "about_team_member5_role":"Customer Success Lead",
        "about_team_member6_name":"David Kim",
        "about_team_member6_role":"Community Manager"
    },
    "ru":{
        // About page translations (Russian) - COMPLETE SET WITH ALL KEYS
        "about_hero_label":"Наша миссия и видение",
        "about_title":"О нас",
        "about_description":"Строим будущее профессиональных AI-сервисов через передовой искусственный интеллект и автоматизацию",
        "about_mission_label":"Наша миссия",
        "about_mission_title":"Демократизация AI-сервисов",
        "about_mission_card_title":"Делаем профессиональные AI доступными для всех",
        "about_mission_description_1":"HypeAI объединяет передовой искусственный интеллект с профессиональной доставкой услуг для создания AI-решений, доступных каждому. Наша платформа из 27 специализированных AI-агентов работает 24/7, обеспечивая исключительные результаты в более чем 35 профессиональных сервисах, ранее доступных только крупным предприятиям.",
        "about_mission_description_2":"Мы верим, что мощные AI-сервисы должны быть быстрыми, доступными и недорогими. Поэтому мы создали платформу, которая обеспечивает результаты в 3-10 раз быстрее при стоимости на 50-70% ниже, сохраняя премиальные стандарты качества.",
        "about_mission_description":"HYPEAI объединяет передовой искусственный интеллект с профессиональным предоставлением услуг для создания AI-решений, доступных каждому. Наша платформа из 27 специализированных AI-агентов работает 24/7, обеспечивая исключительные результаты, которые ранее были доступны только крупным предприятиям. Мы верим, что мощные AI-сервисы должны быть быстрыми, доступными и эффективными. Поэтому мы создали платформу, которая обеспечивает результаты в 3-10 раз быстрее при затратах на 50-70% ниже, сохраняя при этом премиальное качество.",
        "about_why_label":"Почему HypeAI",
        "about_why_title":"Создано для производительности",
        "about_why_description":"AI-инфраструктура корпоративного уровня на BNB Chain для исключительных результатов",
        "about_advantage_speed_title":"Молниеносная доставка",
        "about_advantage_speed_description":"В 3-10 раз быстрее традиционных агентств. Наши 27 AI-агентов работают параллельно круглосуточно, завершая сложные проекты за дни вместо месяцев.",
        "about_advantage_quality_title":"Премиум качество",
        "about_advantage_quality_description":"Результаты корпоративного уровня с постоянным качеством. Каждый проект проверяется несколькими специализированными AI-агентами для обеспечения превосходства в более чем 35 сервисах.",
        "about_advantage_cost_title":"Экономически выгодно",
        "about_advantage_cost_description":"На 50-70% дешевле традиционных решений. Получите работу качества агентства за долю стоимости благодаря эффективности AI.",
        "about_advantage_bnb_title":"На BNB Chain",
        "about_advantage_bnb_description":"Построено на BNB Chain для недорогих высокоскоростных транзакций. Приватная продажа по $0.00008 за токен с общим предложением 10 млрд.",
        "about_advantage_referral_title":"3-уровневая реферальная система",
        "about_advantage_referral_description":"Зарабатывайте 10%/5%/2% комиссии на 3 уровнях. Бонусы за вехи до $2,500 за рост нашего сообщества.",
        "about_advantage_vesting_title":"Умный вестинг",
        "about_advantage_vesting_description":"20% разблокировка при TGE + оставшиеся 80% распределяются за 21 месяц. Справедливое распределение, обеспечивающее долгосрочное здоровье проекта.",
        "about_advantage_security_title":"Проверенная безопасность",
        "about_advantage_security_description":"Ваши данные и проекты защищены ведущей в отрасли инфраструктурой с множественными уровнями защиты.",
        "about_advantage_availability_title":"Глобальная доступность",
        "about_advantage_availability_description":"27 AI-агентов работают 24/7 во всех часовых поясах. Больше не нужно ждать рабочих часов.",
        "about_advantage_scalability_title":"Масштабируемые решения",
        "about_advantage_scalability_description":"От небольших задач до корпоративных проектов. Наша AI-инфраструктура масштабируется для ваших нужд.",
        "about_platform_label":"О HypeAI",
        "about_platform_title":"Криптоплатформа на AI",
        "about_platform_description":"Профессиональные AI-сервисы встречают блокчейн инновации",
        "about_platform_agents_title":"27 AI-агентов работают 24/7",
        "about_platform_agents_description":"Наши специализированные AI-агенты никогда не спят. От разработки блокчейна до маркетинга, от аудита безопасности до создания контента - 27 экспертных агентов сотрудничают для достижения исключительных результатов круглосуточно.",
        "about_platform_services_title":"Более 35 профессиональных сервисов",
        "about_platform_services_description":"Полное портфолио услуг, охватывающее разработку блокчейна, веб-приложения, дизайн и UX, автоматизацию маркетинга, аудит безопасности, создание контента и многое другое. Одна платформа для всех потребностей вашего проекта.",
        "about_platform_tokenomics_title":"Токен-экономика",
        "about_platform_tokenomics_description":"Общее предложение: 10,000,000,000 HYPE\nПриватная продажа: $0.00008 за токен\nБлокчейн: BNB Chain (низкие комиссии)\nРаспределение: 93.75% Приватная продажа, 3% Команда, 2% Ликвидность, 1.25% Маркетинг",
        "about_platform_rewards_title":"Реферальные награды",
        "about_platform_rewards_description":"Уровень 1: 10% прямых рефералов\nУровень 2: 5% второй уровень\nУровень 3: 2% третий уровень\nПлюс бонусы за вехи: $50 (10 реф) до $2,500 (250 реф)",
        "about_platform_vesting_title":"Справедливый график вестинга",
        "about_platform_vesting_description":"Разблокировка TGE: 20% сразу доступно\nПериод вестинга: 80% распределяется за 21 месяц\nРазработано для обеспечения долгосрочной стабильности проекта и предотвращения дампа.",
        "about_platform_integration_title":"Интеграция BNB Chain",
        "about_platform_integration_description":"Низкие транзакционные издержки, быстрые подтверждения и проверенная безопасность. BNB Chain обеспечивает идеальную основу для нашей платформы AI-сервисов с минимальными комиссиями и максимальной производительностью.",
        "about_team_label":"Команда",
        "about_team_title":"Наша команда",
        "about_team_description":"Экспертные AI-исследователи, разработчики и профессионалы сервиса работают вместе",
        "about_team_member1_name":"Др. Сара Чен",
        "about_team_member1_role":"Главный директор по AI",
        "about_team_member1_description":"PhD по машинному обучению из MIT. Бывший ведущий AI-исследователь в Google DeepMind с 15-летним опытом создания производственных AI-систем.",
        "about_team_member2_name":"Маркус Родригес",
        "about_team_member2_role":"Главный технический директор",
        "about_team_member2_description":"Бывший вице-президент инженерии в крупных технологических компаниях. Создал масштабируемые AI-платформы, обслуживающие миллионы пользователей ежедневно.",
        "about_team_member3_name":"Эмили Чжан",
        "about_team_member3_role":"Руководитель продукта",
        "about_team_member3_description":"Более 10 лет создания ориентированных на пользователя AI-продуктов. Бывший продакт-менеджер на ведущих платформах AI-сервисов.",
        "about_team_member4_name":"Джеймс Парк",
        "about_team_member4_role":"Директор по безопасности",
        "about_team_member4_description":"Специалист по кибербезопасности с глубокой экспертизой в безопасности AI-систем. Защищал платформы, обрабатывающие миллиарды конфиденциальных данных.",
        "about_team_member5_name":"Оливия Мартинес",
        "about_team_member5_role":"Руководитель клиентского успеха",
        "about_team_member5_description":"Эксперт в клиентских отношениях и доставке услуг. Создала программы клиентского успеха для компаний Fortune 500.",
        "about_team_member6_name":"Дэвид Ким",
        "about_team_member6_role":"Менеджер сообщества",
        "about_team_member6_description":"Создал и масштабировал технологические сообщества от 0 до 100K+ членов. Эксперт в вовлечении и росте сообщества.",
        "about_values_label":"Основные ценности",
        "about_values_title":"Что мы отстаиваем",
        "about_values_transparency_title":"Прозрачность",
        "about_values_transparency_description":"Четкие цены, честные сроки и открытое общение. Вы всегда точно знаете, что получаете.",
        "about_values_accessibility_title":"Доступность",
        "about_values_accessibility_description":"Профессиональные AI-сервисы не должны требовать огромных бюджетов. Мы делаем корпоративные инструменты доступными для всех.",
        "about_values_innovation_title":"Инновации",
        "about_values_innovation_description":"Постоянное улучшение наших AI-моделей с использованием новейших исследований и добавление новых возможностей на основе отзывов пользователей.",
        "about_values_security_title":"Безопасность прежде всего",
        "about_values_security_description":"Множественные аудиты безопасности, надежное шифрование и консервативный дизайн обеспечивают защиту ваших данных в любое время.",
        "about_values_customer_title":"Фокус на клиенте",
        "about_values_customer_description":"Каждое наше решение начинается с одного вопроса: Как это принесет пользу нашим клиентам?",
        "about_values_quality_title":"Качество превыше всего",
        "about_values_quality_description":"Мы строим на долгосрочную перспективу. Устойчивый рост и создание подлинной ценности важнее краткосрочной выгоды.",
        // Navigation and other translations
        "nav":{"home":"Home","trade":"Trade","stake":"Stake","agents":"AI Agents","docs":"Docs","whitepaper":"Whitepaper","connectWallet":"Connect Wallet"},"hero":{"title":"Where AI Meets Opportunity","subtitle":"Smarter. Faster. Better.","description":"27 AI Agents working infinitely to empower your financial growth","ctaPrimary":"Start Trading Now","ctaSecondary":"View AI Agents","whySuccessButton":"🚀 Why 50x-100x-1000x is Inevitable","totalvaluelocked":"Total Value Locked (Demo)","maximumapyhigh":"Maximum APY (High Risk)","accuracydemo":"AI Accuracy (Demo)"},"stats":{"agents":"AI Agents","holders":"Token Holders","price":"Token Price (Demo)","trading":"Trading Active (Demo)"},"whySucceed":{"title":"🚀 Why HypeAI is Destined to Succeed","subtitle":"Built on real revenue, utility, and AI innovation. Our success is inevitable.","features":{"cryptoChecker":{"title":"Crypto Checker - Paid Service 💰","intro":"Enter any crypto address. Our 27 AI agents analyze in 30 seconds:","feature1":"✅ Scam or Legit? - Rug pull detection, honeypot check","feature2":"📊 Full Analysis - Contract security, liquidity, holders","feature3":"📈 Success Probability - AI predicts 10x, 100x, or dump","feature4":"📄 Complete Report - Tokenomics, team, marketing, roadmap","pricing":"💵 Pricing: $9.99 per check","payment":"Paid in HYPE tokens. 50% of fees burned forever. 🔥","launch":"🎯 Coming Q2 2025: Save investors from scams, earn revenue, burn tokens. Win-win-win."},"aiOracle":{"title":"AI Oracle - Price Predictions","description":"Our neural network analyzes 1000+ data points every second to predict crypto price movements with 85%+ accuracy. Uses LSTM, Transformer models, and on-chain analytics.","feature1":"📊 Real-time market analysis","feature2":"🧠 AI-powered predictions","feature3":"📈 85%+ accuracy rate","feature4":"⚡ Updates every 60 seconds"},"b2bRevenue":{"title":"Real B2B Revenue","description":"Unlike memecoins, we have real paying customers. Crypto projects pay us $2,500-$10,000 for security audits, tokenomics, marketing, and development.","feature1":"💼 35+ paid AI services","feature2":"📈 Growing client base","feature3":"🔥 50% of revenue → token burns","feature4":"📊 Sustainable growth model"},"tokenBurns":{"title":"Aggressive Token Burns","description":"50% of ALL service fees get burned permanently. As usage grows, supply shrinks. Simple economics: decreasing supply + increasing demand = price goes up. 📈","expected":"Expected: 100M+ tokens burned in Year 1"},"staking":{"title":"62% APY Staking = Supply Shock","description":"When 40-60% of tokens are locked in staking (365-day lock), circulating supply drops dramatically. Less available tokens = higher prices. Diamond hands get rewarded massively.","projected":"Projected: 500M+ tokens locked by Q4 2025"},"aiAgents":{"title":"27 Agents Work Infinitely","description":"Our AI agents never sleep, never quit, never take vacations. They work ⚡ infinitely to build features, acquire users, create content, and grow the ecosystem. Zero labor costs.","result":"Result: Faster development than any competitor"}},"cryptocheckerpaid":"Crypto Checker - Paid Service 💰","scamlegitrug":"✅ Scam or Legit? - Rug pull detection, honeypot check","fullanalysiscontract":"📊 Full Analysis - Contract security, liquidity, holders","successprobabilitypredicts":"📈 Success Probability - AI predicts 10x, 100x, or dump","completereporttokenomics":"📄 Complete Report - Tokenomics, team, marketing, roadmap","oraclepricepredictions":"AI Oracle - Price Predictions","realtimemarketanalysis":"📊 Real-time market analysis","aipoweredpredictions":"🧠 AI-powered predictions","accuracyrate":"📈 85%+ accuracy rate","updateseveryseconds":"⚡ Updates every 60 seconds","realb2brevenue":"Real B2B Revenue","paidservices":"💼 35+ paid AI services","growingclientbase":"📈 Growing client base","revenuetokenburns":"🔥 50% of revenue → token burns","sustainablegrowthmodel":"📊 Sustainable growth model","aggressivetokenburns":"Aggressive Token Burns","apystakingsupply":"62% APY Staking = Supply Shock","agentsworkinfinitely":"27 Agents Work Infinitely","nobodyknowsmarkets":"Nobody knows. Markets are unpredictable.","agentsneverstop":"⚡ AI Agents NEVER Stop Working & Promoting","marketing247posting":"📢 Marketing 24/7: Posting news, articles, updates across Twitter, Telegram, Discord, Reddit, Medium","contentcreationwriting":"✍️ Content Creation: Writing SEO-optimized blog posts, press releases, technical articles everywhere on the internet","communityengagementresponding":"🤝 Community Engagement: Responding to every question, building relationships, growing followers","realworknot":"📊 Real Work: Not just promises - agents actually deliver services, write code, audit contracts, design brands","professionallevelevery":"🏆 Professional Level: Every task executed at enterprise quality standards","servicesdeliveredhonestly":"✅ Services Delivered Honestly","paymenthypetokens":"💰 Payment in HYPE Tokens","guaranteedtokenburns":"🔥 Guaranteed Token Burns"},"services":{"title":"AI Services Platform","subtitle":"35+ professional AI services for crypto projects. From security audits to full-stack development.","security":{"title":"Security & Auditing","description":"Professional smart contract audits and security assessments by ATLAS, our blockchain security specialist. We identify vulnerabilities, ensure code safety, and protect your project from exploits with military-grade security protocols.","feature1":"Smart Contract Audits","feature2":"Penetration Testing","feature3":"24/7 Security Monitoring","feature4":"Incident Response","pricing":"From $2,500"},"tokenomicsDesign":{"title":"Tokenomics Design","description":"Data-driven tokenomics models crafted by MOMENTUM, our economics specialist. We design sustainable token economies with proven burn mechanisms, staking rewards, and deflationary strategies that ensure long-term growth and value appreciation.","feature1":"Economic Modeling","feature2":"Token Distribution","feature3":"Vesting Schedules","feature4":"Burn Mechanisms","pricing":"From $1,200"},"development":{"title":"Smart Contract Development","description":"Enterprise-grade smart contracts and dApps built by NEXUS, SOLIDITY, and PRISM - our full-stack development team. From Solidity contracts to React frontends, we deliver production-ready code with 100% test coverage and gas optimization.","feature1":"Custom Smart Contracts","feature2":"dApp Development","feature3":"Multi-Chain Deployment","feature4":"Backend & APIs","pricing":"From $3,500"},"marketing":{"title":"Marketing & Growth","description":"Aggressive growth campaigns executed by MOMENTUM, our marketing CMO. We scale crypto projects from 0 to 10,000+ followers with proven strategies: Twitter automation, influencer partnerships, viral content, and community building that converts.","feature1":"Social Media Management","feature2":"Launch Campaigns","feature3":"Content Creation","feature4":"Influencer Marketing","pricing":"From $799/mo"},"community":{"title":"Community Management","description":"24/7 community engagement powered by PULSE, our community AI. Never miss a mention, question, or complaint. We manage Discord, Telegram, Twitter with instant responses, sentiment analysis, and proactive community building that keeps your holders loyal.","feature1":"Discord/Telegram Setup","feature2":"24/7 Moderation","feature3":"Engagement Programs","feature4":"Sentiment Analysis","pricing":"From $499/mo"},"design":{"title":"Design & Branding","description":"Apple-level design crafted by PIXEL and VIBE, our design and brand specialists. We create logos, websites, and brand identities that look like $100M projects - even for startups. Modern, clean, and professional designs that inspire trust and investment.","feature1":"Logo & Brand Identity","feature2":"Website Design","feature3":"UI/UX for dApps","feature4":"Marketing Assets","pricing":"From $1,500"},"content":{"title":"Content Creation","description":"Professional content from CONTENT, our writing AI. Whitepapers that investors actually read, technical docs that developers understand, and blog posts that rank on Google. SEO-optimized, technically accurate, and professionally formatted.","feature1":"Whitepaper Writing","feature2":"Technical Documentation","feature3":"Blog Posts & Articles","feature4":"Video Scripts","pricing":"From $399"},"devops":{"title":"DevOps & Operations","description":"Enterprise infrastructure managed by our DevOps team. CI/CD pipelines, Docker containers, AWS/Vercel deployments, monitoring, alerts, and 99.9% uptime. Your project stays online 24/7 while you focus on growth, not servers.","feature1":"CI/CD Pipeline Setup","feature2":"Cloud Infrastructure","feature3":"Monitoring & Alerts","feature4":"Performance Optimization","pricing":"From $699/mo"},"securityauditing":"Security & Auditing","smartcontractaudits":"Smart Contract Audits","penetrationtesting":"Penetration Testing","247securitymonitoring":"24/7 Security Monitoring","incidentresponse":"Incident Response","tokenomicsdesign":"Tokenomics Design","economicmodeling":"Economic Modeling","tokendistribution":"Token Distribution","vestingschedules":"Vesting Schedules","burnmechanisms":"Burn Mechanisms","smartcontractdevelopment":"Smart Contract Development","customsmartcontracts":"Custom Smart Contracts","dappdevelopment":"dApp Development","multichaindeployment":"Multi-Chain Deployment","backendapis":"Backend & APIs","marketinggrowth":"Marketing & Growth","socialmediamanagement":"Social Media Management","launchcampaigns":"Launch Campaigns","contentcreation":"Content Creation","influencermarketing":"Influencer Marketing","communitymanagement":"Community Management","discordtelegramsetup":"Discord/Telegram Setup","247moderation":"24/7 Moderation","engagementprograms":"Engagement Programs","sentimentanalysis":"Sentiment Analysis","designbranding":"Design & Branding","logobrandidentity":"Logo & Brand Identity","websitedesign":"Website Design","uiuxfordapps":"UI/UX for dApps","marketingassets":"Marketing Assets","whitepaperwriting":"Whitepaper Writing","technicaldocumentation":"Technical Documentation","blogpostsarticles":"Blog Posts & Articles","videoscripts":"Video Scripts","devopsoperations":"DevOps & Operations","cicdpipelinesetup":"CI/CD Pipeline Setup","cloudinfrastructure":"Cloud Infrastructure","monitoringalerts":"Monitoring & Alerts","performanceoptimization":"Performance Optimization","agentsreadyhelp":"35+ AI agents ready to help your project","6080cheaperthan":"60-80% cheaper than traditional agencies","34xfasterexecution":"3-4x faster execution","working247without":"Working 24/7 without breaks"},"tokenGrowth":{"title":"Data-Driven Token Economics","subtitle":"Sustainable growth mechanisms backed by real utility","benefit1":"📊 Real utility drives demand - AI services require HYPE tokens","benefit2":"🔥 Deflationary mechanics - 50% of service fees burned","benefit3":"💎 Staking lockup reduces circulating supply (up to 62% APY)","benefit4":"📈 B2B revenue reinvested in ecosystem development","datadriventokeneconomics":"Data-Driven Token Economics","sustainablegrowthmechanisms":"Sustainable growth mechanisms backed by real utility","realutilitydrives":"Real utility drives demand - AI services require HYPE tokens","deflationarymechanicsservice":"Deflationary mechanics - 50% of service fees burned","stakinglockupreduces":"Staking lockup reduces circulating supply (up to 62% APY)","b2brevenuereinvested":"B2B revenue reinvested in ecosystem development"},"agents":{"title":"Meet Our AI Team","subtitle":"27 agents working 24/7. Never sleep. Never quit.","meetourteam":"Meet Our AI Team","agentsworking247":"27 agents working 24/7. Never sleep. Never quit.","allsystemsoperational":"ALL SYSTEMS OPERATIONAL","hoursweekworking":"Hours/Week Working","taskscompleted":"Tasks Completed","developmentdivision":"Development Division","atlas":"ATLAS","active":"Active","uptime":"uptime","nexus":"NEXUS","solidity":"SOLIDITY","prism":"PRISM","verify":"VERIFY","motion":"MOTION","businessdivision":"Business Division","titan":"TITAN","momentum":"MOMENTUM","pulse":"PULSE","vibe":"VIBE","pixel":"PIXEL","content":"CONTENT","meetallagents":"👥 Meet All 27 Agents","viewliveactivity":"🔴 View Live Activity"},"footer":{"tagline":"27 AI Agents. Infinite Work. YOUR Success.","rights":"All rights reserved.","builtBy":"Built by AI Agents Team","disclaimer":"Cryptocurrency investments carry risk. Do your own research.","quickLinks":"Quick Links","resources":"Resources","community":"Community","legal":"Legal","hypeai":"HypeAI","tokeneconomics":"Token Economics","governance":"Governance","securityaudit":"Security Audit","apidocs":"API Docs","roadmap":"Roadmap","blog":"Blog","aboutmission":"About Mission","privacypolicy":"🔒 Privacy Policy","termsservice":"📜 Terms of Service","cookiepolicy":"🍪 Cookie Policy","connectwallet":"Connect Wallet","metamask":"MetaMask","connectwithmetamask":"Connect with MetaMask extension","trustwallet":"Trust Wallet","connectwithtrust":"Connect with Trust Wallet","walletconnect":"WalletConnect","scanwithwalletconnect":"Scan with WalletConnect to connect"},"buttons":{"launchSoon":"🚀 Launch Soon","meetAgents":"👥 Meet All 27 Agents","viewActivity":"🔴 View Live Activity","buyNow":"💰 Buy $HYPE Now","learnMore":"Learn More","getStarted":"Get Started"},"head":{"hypeailogo":"HypeAI Logo","live2727":"Live (27/27)","proof":"✅ PROOF"},"features":{"poweredintelligence":"Powered by Intelligence","advancedaipoweredfeatures":"Advanced AI-powered features for the modern crypto ecosystem","aipoweredtrading":"AI-Powered Trading","highyieldstaking":"High-Yield Staking","daogovernance":"DAO Governance","lightningfast":"Lightning Fast","securityfirst":"Security First","realtimeanalytics":"Real-Time Analytics"},"tokenomics":{"tokenomics":"Tokenomics","fairdistributiondesigned":"Fair distribution designed for sustainable growth","totalsupply1000000000":"Total Supply: 1,000,000,000 HYPEAI","publicsale":"Public Sale","liquiditypool":"Liquidity Pool","stakingrewards":"Staking Rewards","teamadvisors":"Team & Advisors","treasurydevelopment":"Treasury & Development","marketinggrowth":"Marketing & Growth","strategicpartnerships":"Strategic Partnerships","communityairdrop":"Community Airdrop","transactionfees":"Transaction Fees: 8%","liquidity":"💧 Liquidity","reflection":"🔁 Reflection","treasury":"💰 Treasury","burn":"🔥 Burn","stakingapy":"Staking APY"},"roadmap":{"roadmapsuccess":"Roadmap to Success","ourjourneyrevolutionize":"Our journey to revolutionize crypto trading","2025launch":"Q1 2025 - Launch","smartcontractdevelopment":"✅ Smart contract development","securityaudit":"✅ Security audit","dexlistinguniswappancakeswap":"✅ DEX listing (Uniswap/PancakeSwap)","initialairdrop":"✅ Initial airdrop","communitybuilding":"✅ Community building","2025growth":"Q2 2025 - Growth","cexlistingsgateio":"🔄 CEX listings (Gate.io, MEXC)","stakingplatformlaunch":"🔄 Staking platform launch","mobileapprelease":"🔄 Mobile app release","marketingcampaigns":"🔄 Marketing campaigns","strategicpartnerships":"🔄 Strategic partnerships","2025expansion":"Q3 2025 - Expansion","multichaindeployment":"📅 Multi-chain deployment","nftintegration":"📅 NFT integration","daogovernancelaunch":"📅 DAO governance launch","advancedfeatures":"📅 Advanced AI features","institutionalpartnerships":"📅 Institutional partnerships","2025ecosystem":"Q4 2025 - Ecosystem","defiproductsuite":"📅 DeFi product suite","lendingborrowingprotocol":"📅 Lending/Borrowing protocol","launchpadplatform":"📅 Launchpad platform","crosschainbridges":"📅 Cross-chain bridges","100mmarketcap":"📅 $100M market cap target 🎯"}},"ru":{"nav":{"connectWallet":"Подключить кошелёк","home":"Главная","trade":"Торговля","stake":"Стейкинг","docs":"Документация","whitepaper":"White Paper","agents":"ИИ-Команда"},"hero":{"title":"Где ИИ встречает возможности","subtitle":"Умнее. Быстрее. Лучше.","description":"27 ИИ-агентов работают непрерывно для вашего финансового роста","ctaPrimary":"Начать торговлю сейчас","ctaSecondary":"Посмотреть ИИ-агентов","whySuccessButton":"🚀 Почему 50x-100x-1000x неизбежны","totalvaluelocked":"Общая заблокированная стоимость (Демо)","maximumapyhigh":"Максимальный APY (Высокий риск)","accuracydemo":"Точность ИИ (Демо)"},"stats":{"holders":"Держатели","agents":"ИИ-агентов","price":"Цена токена (демо)","trading":"Торговля активна (демо)"},"whySucceed":{"title":"Почему HypeAI обречен на успех","subtitle":"Построен на реальной выручке, пользе и ИИ-инновациях. Наш успех неизбежен.","features":{"cryptoChecker":{"title":"Crypto Checker - Платная услуга 💰","intro":"Введите любой крипто-адрес. Наши 27 ИИ-агентов анализируют за 30 секунд:","feature1":"✅ Скам или Честный проект? - Обнаружение rug pull, проверка honeypot","feature2":"📊 Полный анализ - Безопасность контракта, ликвидность, держатели","feature3":"📈 Вероятность успеха - ИИ предсказывает 10x, 100x или dump","feature4":"📄 Полный отчёт - Токеномика, команда, маркетинг, дорожная карта","pricing":"💵 Стоимость: $9.99 за проверку","payment":"Оплата токенами HYPE. 50% комиссий сжигается навсегда. 🔥","launch":"🎯 Запуск во Q2 2025: Защита инвесторов от скамов, генерация дохода, сжигание токенов. Выигрывают все."},"aiOracle":{"title":"AI Oracle - Прогнозы цен","description":"Наша нейронная сеть анализирует 1000+ точек данных каждую секунду для предсказания движений цен криптовалют с точностью 85%+. Использует LSTM, Transformer модели и он-чейн аналитику.","feature1":"📊 Рыночный анализ в реальном времени","feature2":"🧠 Прогнозы на базе ИИ","feature3":"📈 Точность 85%+","feature4":"⚡ Обновления каждые 60 секунд"},"b2bRevenue":{"title":"Реальная B2B выручка","description":"В отличие от мемкоинов, у нас есть реальные платящие клиенты. Крипто-проекты платят нам $2,500-$10,000 за аудиты безопасности, токеномику, маркетинг и разработку.","feature1":"💼 35+ платных ИИ-сервисов","feature2":"📈 Растущая клиентская база","feature3":"🔥 50% дохода → сжигание токенов","feature4":"📊 Модель устойчивого роста"},"tokenBurns":{"title":"Агрессивное сжигание токенов","description":"50% ВСЕХ сервисных комиссий сжигается навсегда. По мере роста использования предложение сокращается. Простая экономика: уменьшение предложения + увеличение спроса = рост цены. 📈","expected":"Прогноз: 100M+ токенов сожжено в первый год"},"staking":{"title":"Стейкинг 62% APY = Шок предложения","description":"Когда 40-60% токенов заблокировано в стейкинге (блокировка на 365 дней), циркулирующее предложение резко падает. Меньше доступных токенов = более высокие цены. Бриллиантовые руки получают массивные награды.","projected":"Прогноз: 500M+ токенов заблокировано к Q4 2025"},"aiAgents":{"title":"27 агентов работают бесконечно","description":"Наши ИИ-агенты никогда не спят, никогда не увольняются, никогда не берут отпуск. Они работают ⚡ бесконечно для создания функций, привлечения пользователей, создания контента и развития экосистемы. Нулевые затраты на рабочую силу.","result":"Результат: Более быстрая разработка, чем у любого конкурента"}},"cryptocheckerpaid":"Крипто Чекер - Платный сервис 💰","scamlegitrug":"✅ Скам или легит? - Обнаружение rag pull, проверка honeypot","fullanalysiscontract":"📊 Полный анализ - Безопасность контракта, ликвидность, холдеры","successprobabilitypredicts":"📈 Вероятность успеха - ИИ прогнозирует 10x, 100x или падение","completereporttokenomics":"📄 Полный отчет - Токеномика, команда, маркетинг, дорожная карта","oraclepricepredictions":"AI Oracle - Прогнозы цен","realtimemarketanalysis":"📊 Анализ рынка в реальном времени","aipoweredpredictions":"🧠 Прогнозы на основе ИИ","accuracyrate":"📈 Точность более 85%","updateseveryseconds":"⚡ Обновление каждые 60 секунд","realb2brevenue":"Реальная B2B выручка","paidservices":"💼 Более 35 платных ИИ-сервисов","growingclientbase":"📈 Растущая клиентская база","revenuetokenburns":"🔥 50% выручки → сжигание токенов","sustainablegrowthmodel":"📊 Модель устойчивого роста","aggressivetokenburns":"Агрессивное сжигание токенов","apystakingsupply":"62% APY стейкинг = Дефицит предложения","agentsworkinfinitely":"27 агентов работают бесконечно","nobodyknowsmarkets":"Никто не знает. Рынки непредсказуемы.","agentsneverstop":"⚡ ИИ-агенты НИКОГДА не прекращают работу и продвижение","marketing247posting":"📢 Маркетинг 24/7: Публикация новостей, статей, обновлений в Twitter, Telegram, Discord, Reddit, Medium","contentcreationwriting":"✍️ Создание контента: Написание SEO-оптимизированных статей, пресс-релизов, технических материалов по всему интернету","communityengagementresponding":"🤝 Взаимодействие с сообществом: Ответ на каждый вопрос, построение отношений, увеличение аудитории","realworknot":"📊 Реальная работа: Не просто обещания - агенты фактически предоставляют сервисы, пишут код, проводят аудит контрактов, разрабатывают бренды","professionallevelevery":"🏆 Профессиональный уровень: Каждая задача выполняется по корпоративным стандартам качества","servicesdeliveredhonestly":"✅ Сервисы предоставляются честно","paymenthypetokens":"💰 Оплата в токенах HYPE","guaranteedtokenburns":"🔥 Гарантированное сжигание токенов"},"services":{"title":"Платформа ИИ-сервисов","subtitle":"Более 35 профессиональных ИИ-сервисов для крипто-проектов. От аудитов безопасности до full-stack разработки.","security":{"title":"Безопасность и аудит","description":"Профессиональные аудиты смарт-контрактов и оценки безопасности от ATLAS, нашего специалиста по безопасности блокчейна. Мы выявляем уязвимости, обеспечиваем безопасность кода и защищаем ваш проект от эксплойтов с помощью протоколов безопасности военного уровня.","feature1":"Аудиты смарт-контрактов","feature2":"Тестирование на проникновение","feature3":"Мониторинг безопасности 24/7","feature4":"Реагирование на инциденты","pricing":"От $2,500"},"tokenomicsDesign":{"title":"Дизайн токеномики","description":"Модели токеномики на основе данных, разработанные MOMENTUM, нашим специалистом по экономике. Мы проектируем устойчивые токен-экономики с проверенными механизмами сжигания, наградами за стейкинг и дефляционными стратегиями, обеспечивающими долгосрочный рост и увеличение стоимости.","feature1":"Экономическое моделирование","feature2":"Распределение токенов","feature3":"Графики вестинга","feature4":"Механизмы сжигания","pricing":"От $1,200"},"development":{"title":"Разработка смарт-контрактов","description":"Смарт-контракты и dApps корпоративного уровня, созданные NEXUS, SOLIDITY и PRISM - нашей командой full-stack разработки. От контрактов Solidity до React-фронтенда, мы поставляем готовый к производству код со 100% покрытием тестами и оптимизацией газа.","feature1":"Кастомные смарт-контракты","feature2":"Разработка dApp","feature3":"Мультичейн развёртывание","feature4":"Бэкенд и API","pricing":"От $3,500"},"marketing":{"title":"Маркетинг и рост","description":"Агрессивные кампании роста, выполняемые MOMENTUM, нашим CMO по маркетингу. Мы масштабируем крипто-проекты от 0 до 10,000+ подписчиков с проверенными стратегиями: автоматизация Twitter, партнёрства с инфлюенсерами, вирусный контент и построение сообщества, которое конвертирует.","feature1":"Управление соцсетями","feature2":"Кампании запуска","feature3":"Создание контента","feature4":"Инфлюенсер-маркетинг","pricing":"От $799/мес"},"community":{"title":"Управление сообществом","description":"Вовлечение сообщества 24/7 на базе PULSE, нашего ИИ сообщества. Никогда не пропустите упоминание, вопрос или жалобу. Мы управляем Discord, Telegram, Twitter с мгновенными ответами, анализом настроений и проактивным построением сообщества, которое сохраняет лояльность ваших держателей.","feature1":"Настройка Discord/Telegram","feature2":"Модерация 24/7","feature3":"Программы вовлечения","feature4":"Анализ настроений","pricing":"От $499/мес"},"design":{"title":"Дизайн и брендинг","description":"Дизайн уровня Apple, созданный PIXEL и VIBE, нашими специалистами по дизайну и бренду. Мы создаём логотипы, веб-сайты и фирменный стиль, которые выглядят как проекты на $100M - даже для стартапов. Современный, чистый и профессиональный дизайн, вдохновляющий на доверие и инвестиции.","feature1":"Логотип и фирменный стиль","feature2":"Дизайн веб-сайта","feature3":"UI/UX для dApps","feature4":"Маркетинговые материалы","pricing":"От $1,500"},"content":{"title":"Создание контента","description":"Профессиональный контент от CONTENT, нашего ИИ для написания текстов. Whitepaper, которые инвесторы действительно читают, техническая документация, понятная разработчикам, и блог-посты, ранжируемые в Google. SEO-оптимизированный, технически точный и профессионально отформатированный.","feature1":"Написание Whitepaper","feature2":"Техническая документация","feature3":"Блог-посты и статьи","feature4":"Видео-сценарии","pricing":"От $399"},"devops":{"title":"DevOps и операции","description":"Корпоративная инфраструктура, управляемая нашей командой DevOps. CI/CD пайплайны, Docker-контейнеры, развёртывания AWS/Vercel, мониторинг, оповещения и 99.9% аптайм. Ваш проект работает онлайн 24/7, пока вы фокусируетесь на росте, а не на серверах.","feature1":"Настройка CI/CD пайплайна","feature2":"Облачная инфраструктура","feature3":"Мониторинг и оповещения","feature4":"Оптимизация производительности","pricing":"От $699/мес"},"securityauditing":"Безопасность и аудит","smartcontractaudits":"Аудит смарт-контрактов","penetrationtesting":"Тестирование на проникновение","247securitymonitoring":"Мониторинг безопасности 24/7","incidentresponse":"Реагирование на инциденты","tokenomicsdesign":"Разработка токеномики","economicmodeling":"Экономическое моделирование","tokendistribution":"Распределение токенов","vestingschedules":"Графики вестинга","burnmechanisms":"Механизмы сжигания","smartcontractdevelopment":"Разработка смарт-контрактов","customsmartcontracts":"Кастомные смарт-контракты","dappdevelopment":"Разработка dApp","multichaindeployment":"Мультичейн развертывание","backendapis":"Бэкенд и API","marketinggrowth":"Маркетинг и рост","socialmediamanagement":"Управление социальными сетями","launchcampaigns":"Кампании запуска","contentcreation":"Создание контента","influencermarketing":"Инфлюенсер-маркетинг","communitymanagement":"Управление сообществом","discordtelegramsetup":"Настройка Discord/Telegram","247moderation":"Модерация 24/7","engagementprograms":"Программы вовлечения","sentimentanalysis":"Анализ настроений","designbranding":"Дизайн и брендинг","logobrandidentity":"Логотип и фирменный стиль","websitedesign":"Дизайн веб-сайта","uiuxfordapps":"UI/UX для dApps","marketingassets":"Маркетинговые материалы","whitepaperwriting":"Написание whitepaper","technicaldocumentation":"Техническая документация","blogpostsarticles":"Статьи и публикации в блоге","videoscripts":"Сценарии для видео","devopsoperations":"DevOps и операции","cicdpipelinesetup":"Настройка CI/CD конвейера","cloudinfrastructure":"Облачная инфраструктура","monitoringalerts":"Мониторинг и оповещения","performanceoptimization":"Оптимизация производительности","agentsreadyhelp":"Более 35 ИИ-агентов готовы помочь вашему проекту","6080cheaperthan":"На 60-80% дешевле традиционных агентств","34xfasterexecution":"В 3-4 раза быстрее выполнение","working247without":"Работа 24/7 без перерывов"},"tokenGrowth":{"title":"Токен-экономика на основе данных","subtitle":"Механизмы устойчивого роста, подкреплённые реальной полезностью","benefit1":"📊 Реальная полезность стимулирует спрос - ИИ-сервисы требуют токены HYPE","benefit2":"🔥 Дефляционная механика - 50% сервисных комиссий сжигается","benefit3":"💎 Блокировка в стейкинге сокращает циркулирующее предложение (до 62% APY)","benefit4":"📈 B2B выручка реинвестируется в развитие экосистемы","datadriventokeneconomics":"Токеномика на основе данных","sustainablegrowthmechanisms":"Механизмы устойчивого роста, подкрепленные реальной полезностью","realutilitydrives":"Реальная полезность создает спрос - ИИ-сервисы требуют токенов HYPE","deflationarymechanicsservice":"Дефляционная механика - 50% комиссий за сервисы сжигается","stakinglockupreduces":"Блокировка при стейкинге сокращает циркулирующее предложение (до 62% APY)","b2brevenuereinvested":"B2B выручка реинвестируется в развитие экосистемы"},"agents":{"title":"Познакомьтесь с нашей ИИ-командой","subtitle":"27 агентов работают 24/7. Никогда не спят. Никогда не увольняются.","meetourteam":"Познакомьтесь с нашей ИИ-командой","agentsworking247":"27 агентов работают 24/7. Никогда не спят. Никогда не сдаются.","allsystemsoperational":"ВСЕ СИСТЕМЫ РАБОТАЮТ","hoursweekworking":"Часов в неделю работают","taskscompleted":"Задач выполнено","developmentdivision":"Отдел разработки","atlas":"ATLAS","active":"Активен","uptime":"время работы","nexus":"NEXUS","solidity":"SOLIDITY","prism":"PRISM","verify":"VERIFY","motion":"MOTION","businessdivision":"Бизнес-отдел","titan":"TITAN","momentum":"MOMENTUM","pulse":"PULSE","vibe":"VIBE","pixel":"PIXEL","content":"CONTENT","meetallagents":"👥 Познакомиться со всеми 27 агентами","viewliveactivity":"🔴 Посмотреть активность в реальном времени","status":{"active":"Активен"},"stats":{"tasksCompleted":"задач выполнено","uptime":"время работы"},"meetAll":"👥 Познакомиться со всеми 27 агентами","viewLiveActivity":"🔴 Посмотреть активность в реальном времени"},"footer":{"tagline":"Платформа криптотрейдинга на базе ИИ. Где ИИ встречает возможности.","builtBy":"Создано 26 профессиональными ИИ-агентами","resources":"Ресурсы","legal":"Юридическая информация","rights":"Все права защищены.","disclaimer":"Инвестиции в криптовалюту связаны с рисками. Проводите собственное исследование.","quickLinks":"Быстрые ссылки","community":"Сообщество","hypeai":"HypeAI","tokeneconomics":"Токеномика","governance":"Управление","securityaudit":"Аудит безопасности","apidocs":"Документация API","roadmap":"Дорожная карта","blog":"Блог","aboutmission":"О миссии","privacypolicy":"🔒 Политика конфиденциальности","termsservice":"📜 Условия использования","cookiepolicy":"🍪 Политика cookies","connectwallet":"Подключить кошелек","metamask":"MetaMask","connectwithmetamask":"Подключиться через расширение MetaMask","trustwallet":"Trust Wallet","connectwithtrust":"Подключиться через Trust Wallet","walletconnect":"WalletConnect","scanwithwalletconnect":"Отсканируйте QR-код для подключения через WalletConnect"},"buttons":{"learnMore":"Узнать больше","getStarted":"Начать","launchSoon":"🚀 Скоро запуск","meetAgents":"👥 Познакомиться со всеми 27 агентами","viewActivity":"🔴 Посмотреть активность в реальном времени","buyNow":"💰 Купить $HYPE сейчас"},"head":{"hypeailogo":"Логотип HypeAI","live2727":"Онлайн (27/27)","proof":"✅ ДОКАЗАТЕЛЬСТВА"},"features":{"poweredintelligence":"Работает на интеллекте","advancedaipoweredfeatures":"Передовые функции на основе ИИ для современной криптоэкосистемы","aipoweredtrading":"Торговля на основе ИИ","highyieldstaking":"Высокодоходный стейкинг","daogovernance":"Управление через DAO","lightningfast":"Молниеносная скорость","securityfirst":"Безопасность прежде всего","realtimeanalytics":"Аналитика в реальном времени","aiTrading":{"title":"Торговля на основе ИИ","desc":"Наши продвинутые модели ИИ анализируют ценовые паттерны, рыночные настроения и данные он-чейн для предоставления прогнозов с точностью 85%+ используя LSTM и Transformer алгоритмы."},"staking":{"title":"Высокодоходный стейкинг","desc":"Зарабатывайте до 62% годовых с нашей многоуровневой системой стейкинга. Выбирайте из периодов блокировки 30 дней (17%), 90 дней (27%) или 365 дней (62%) с ежедневным начислением."},"dao":{"title":"Управление через DAO","desc":"Решения, принимаемые сообществом с голосованием, взвешенным по токенам. Контроль обновлений протокола, корректировки комиссий и стратегических партнёрств. 1 HYPEAI = 1 голос."},"fast":{"title":"Молниеносная скорость","desc":"Построено на Polygon L2 для мгновенных транзакций с минимальными комиссиями. Обработка 1000+ TPS при сохранении безопасности Ethereum через масштабирование Layer 2."},"security":{"title":"Безопасность прежде всего","desc":"Аудированные смарт-контракты с лучшими практиками. ReentrancyGuard, SafeMath, антикитовые механизмы и функция аварийной паузы для максимальной безопасности."},"analytics":{"title":"Аналитика в реальном времени","desc":"Продвинутая панель с графиками цен в реальном времени, прогнозами ИИ, анализом настроений и оптимизацией портфеля на основе машинного обучения."}},"tokenomics":{"tokenomics":"Токеномика","fairdistributiondesigned":"Справедливое распределение для устойчивого роста","totalsupply1000000000":"Общее предложение: 1 000 000 000 HYPEAI","publicsale":"Публичная продажа","liquiditypool":"Пул ликвидности","stakingrewards":"Награды за стейкинг","teamadvisors":"Команда и советники","treasurydevelopment":"Казначейство и разработка","marketinggrowth":"Маркетинг и рост","strategicpartnerships":"Стратегические партнерства","communityairdrop":"Airdrop для сообщества","transactionfees":"Комиссия за транзакцию: 8%","liquidity":"💧 Ликвидность","reflection":"🔁 Отражение","treasury":"💰 Казначейство","burn":"🔥 Сжигание","stakingapy":"APY стейкинга","totalSupply":"Общее предложение: 1 000 000 000 HYPEAI","publicSale":"Публичная продажа","liquidityPool":"Пул ликвидности","stakingRewards":"Награды за стейкинг","teamAdvisors":"Команда и советники","treasuryDev":"Казначейство и разработка","marketingGrowth":"Маркетинг и рост","partnerships":"Стратегические партнёрства","airdrop":"Airdrop для сообщества","transactionFees":"Комиссия за транзакцию: 8%","feeLiquidity":"💧 Ликвидность","feeReflection":"🔁 Отражение","feeTreasury":"💰 Казначейство","feeBurn":"🔥 Сжигание","stakingAPY":"APY стейкинга","apyValue":"До 62%"},"roadmap":{"roadmapsuccess":"Дорожная карта к успеху","ourjourneyrevolutionize":"Наш путь к революции в криптотрейдинге","2025launch":"Q1 2025 - Запуск","smartcontractdevelopment":"✅ Разработка смарт-контракта","securityaudit":"✅ Аудит безопасности","dexlistinguniswappancakeswap":"✅ Листинг на DEX (Uniswap/PancakeSwap)","initialairdrop":"✅ Первоначальный airdrop","communitybuilding":"✅ Создание сообщества","2025growth":"Q2 2025 - Рост","cexlistingsgateio":"🔄 Листинги на CEX (Gate.io, MEXC)","stakingplatformlaunch":"🔄 Запуск платформы стейкинга","mobileapprelease":"🔄 Релиз мобильного приложения","marketingcampaigns":"🔄 Маркетинговые кампании","strategicpartnerships":"🔄 Стратегические партнерства","2025expansion":"Q3 2025 - Расширение","multichaindeployment":"📅 Мультичейн развертывание","nftintegration":"📅 Интеграция NFT","daogovernancelaunch":"📅 Запуск управления через DAO","advancedfeatures":"📅 Расширенные ИИ-функции","institutionalpartnerships":"📅 Институциональные партнерства","2025ecosystem":"Q4 2025 - Экосистема","defiproductsuite":"📅 Набор DeFi продуктов","lendingborrowingprotocol":"📅 Протокол кредитования/заимствования","launchpadplatform":"📅 Платформа launchpad","crosschainbridges":"📅 Кроссчейн мосты","100mmarketcap":"📅 Цель капитализации $100M 🎯","q1":{"title":"Q1 2025 - Запуск","item1":"✅ Разработка смарт-контракта","item2":"✅ Аудит безопасности","item3":"✅ Листинг на DEX (Uniswap/PancakeSwap)","item4":"✅ Первоначальный airdrop","item5":"✅ Создание сообщества"},"q2":{"title":"Q2 2025 - Рост","item1":"🔄 Листинги на CEX (Gate.io, MEXC)","item2":"🔄 Запуск платформы стейкинга","item3":"🔄 Релиз мобильного приложения","item4":"🔄 Маркетинговые кампании","item5":"🔄 Стратегические партнёрства"},"q3":{"title":"Q3 2025 - Расширение","item1":"📅 Мультичейн развёртывание","item2":"📅 Интеграция NFT","item3":"📅 Запуск управления через DAO","item4":"📅 Расширенные ИИ-функции","item5":"📅 Институциональные партнёрства"},"q4":{"title":"Q4 2025 - Экосистема","item1":"📅 Набор DeFi продуктов","item2":"📅 Протокол кредитования/заимствования","item3":"📅 Платформа launchpad","item4":"📅 Кроссчейн мосты","item5":"📅 Цель капитализации $100M 🎯"}},"success":{"formula":{"title":"Формула гарантированного успеха","revenue":{"amount":"$50K-$200K","description":"Ежемесячная B2B выручка (1-й год)"},"burned":{"amount":"100M+","description":"Токенов сожжено (1-й год)"},"staked":{"amount":"500M+","description":"Токенов заблокировано (Q4 2025)"},"equation":"Реальная выручка + Агрессивное сжигание + Блокировка в стейкинге = 📈 РОСТ ЦЕНЫ","conclusion":"Это не «надежда на памп». Это математика."}},"commitment":{"title":"Долгосрочная приверженность: Мы НИКОГДА не останавливаемся","question":"Что произойдёт, если токен вырастет в 50x-100x-1000x?","whatWeKnow":"Вот что мы знаем ТОЧНО:","agents":{"title":"ИИ-агенты продолжают работать бесконечно","description":"Неважно, растёт цена или падает, наши 27 агентов работают 24/7/365:","notAll":"Не все агенты продают сервисы. Многие работают БЕСПЛАТНО для экосистемы:","feature1":"🤖 Разработка функций, исправление багов, оптимизация кода","feature2":"📢 Маркетинг 24/7: Twitter, Telegram, Discord, Reddit, Medium","feature3":"✍️ Создание контента: статьи, руководства, технические документы","feature4":"🤝 Поддержка сообщества: ответы на вопросы, решение проблем","feature5":"📊 Мониторинг: безопасность, производительность, аналитика","conclusion":"Результат: Постоянное развитие. Нулевые затраты на персонал. Бесконечная работа."},"services":{"title":"Сервисы продолжают предоставляться","description":"Проекты по-прежнему платят нам $2,500-$10,000 за аудиты, токеномику, маркетинг. Деньги поступают → 50% сжигается."},"payment":{"title":"Оплата производится в токенах HYPE","description":"Клиенты платят в токенах HYPE. По мере роста цены токена меньше токенов сжигается за сервис, НО стоимость в долларах сжигания растёт."},"burns":{"title":"Сжигания продолжаются навсегда","description":"Даже при цене $1 за токен:","conclusion":"Сжигание замедляется (меньше токенов), но долларовая стоимость сжигания РАСТЁТ. Дефляция продолжается."},"destined":"Вот почему HypeAI ОБРЕЧЁН расти. Мы не надеемся. Мы строим.","finalQuestion":"А вы построили свою позицию?"}},"zh":{"nav":{"home":"首页","trade":"交易","stake":"质押","agents":"AI代理","docs":"文档","whitepaper":"白皮书","connectWallet":"连接钱包"},"hero":{"title":"AI遇见机遇","subtitle":"更智能。更快速。更优秀。","description":"27个AI代理无限工作，助力您的财务增长","ctaPrimary":"立即开始交易","ctaSecondary":"查看AI代理","whySuccessButton":"🚀 为什么50倍-100倍-1000倍势不可挡","totalvaluelocked":"总锁仓量(演示)","maximumapyhigh":"最高年化收益率(高风险)","accuracydemo":"AI准确率(演示)"},"stats":{"agents":"AI代理","holders":"代币持有者","price":"代币价格（演示）","trading":"交易激活中（演示）"},"whySucceed":{"title":"🚀 为什么HypeAI注定成功","subtitle":"建立在真实收入、实用性和AI创新之上。我们的成功势不可挡。","features":{"cryptoChecker":{"title":"加密货币检测器 - 付费服务 💰","intro":"输入任何加密货币地址。我们的27个AI代理将在30秒内完成分析：","feature1":"✅ 骗局还是合法？- 撤池检测，蜜罐检查","feature2":"📊 全面分析 - 合约安全性、流动性、持有者","feature3":"📈 成功概率 - AI预测10倍、100倍或暴跌","feature4":"📄 完整报告 - 代币经济学、团队、营销、路线图","pricing":"💵 定价：每次检测9.99美元","payment":"使用HYPE代币支付。50%的费用将永久销毁。🔥","launch":"🎯 2025年第二季度上线：保护投资者免受骗局，赚取收入，销毁代币。三赢局面。"},"aiOracle":{"title":"AI预言机 - 价格预测","description":"我们的神经网络每秒分析1000多个数据点，以85%以上的准确率预测加密货币价格走势。使用LSTM、Transformer模型和链上分析技术。","feature1":"📊 实时市场分析","feature2":"🧠 AI驱动的预测","feature3":"📈 85%以上准确率","feature4":"⚡ 每60秒更新一次"},"b2bRevenue":{"title":"真实的B2B收入","description":"与模因币不同，我们拥有真实的付费客户。加密项目为安全审计、代币经济学、营销和开发服务向我们支付2,500至10,000美元。","feature1":"💼 35+项付费AI服务","feature2":"📈 不断增长的客户群","feature3":"🔥 50%的收入用于代币销毁","feature4":"📊 可持续增长模式"},"tokenBurns":{"title":"激进的代币销毁","description":"所有服务费用的50%将被永久销毁。随着使用量增长，供应量减少。简单的经济学原理：供应减少+需求增加=价格上涨。📈","expected":"预期：第一年销毁超过1亿枚代币"},"staking":{"title":"62% APY质押=供应冲击","description":"当40-60%的代币被锁定在质押中（365天锁定期），流通供应量将大幅下降。可用代币减少=价格上涨。钻石手将获得丰厚回报。","projected":"预测：到2025年第四季度将锁定超过5亿枚代币"},"aiAgents":{"title":"27个代理无限工作","description":"我们的AI代理永不休息，永不辞职，永不休假。它们⚡无限工作，构建功能，获取用户，创建内容，发展生态系统。零人力成本。","result":"结果：比任何竞争对手都快的开发速度"}},"cryptocheckerpaid":"加密货币检测器 - 付费服务 💰","scamlegitrug":"✅ 诈骗识别 - Rug Pull检测、蜜罐合约检测","fullanalysiscontract":"📊 全面分析 - 合约安全、流动性、持币地址","successprobabilitypredicts":"📈 成功概率 - AI预测10倍、100倍或归零","completereporttokenomics":"📄 完整报告 - 代币经济学、团队、营销、路线图","oraclepricepredictions":"AI预言机 - 价格预测","realtimemarketanalysis":"📊 实时市场分析","aipoweredpredictions":"🧠 AI驱动预测","accuracyrate":"📈 85%以上准确率","updateseveryseconds":"⚡ 每60秒更新","realb2brevenue":"真实B2B营收","paidservices":"💼 35+付费AI服务","growingclientbase":"📈 不断增长的客户群","revenuetokenburns":"🔥 50%收入用于代币销毁","sustainablegrowthmodel":"📊 可持续增长模式","aggressivetokenburns":"激进代币销毁机制","apystakingsupply":"62%年化收益率质押 = 供应冲击","agentsworkinfinitely":"27个AI代理无限工作","nobodyknowsmarkets":"无人知晓。市场不可预测。","agentsneverstop":"⚡ AI代理永不停歇，持续工作与推广","marketing247posting":"📢 全天候营销：在Twitter、Telegram、Discord、Reddit、Medium发布新闻、文章、更新","contentcreationwriting":"✍️ 内容创作：撰写SEO优化博客文章、新闻稿、技术文章，覆盖全网","communityengagementresponding":"🤝 社区互动：回答每个问题、建立关系、增长粉丝","realworknot":"📊 真实工作：不只是承诺 - 代理实际交付服务、编写代码、审计合约、设计品牌","professionallevelevery":"🏆 专业水准：每项任务均达企业级质量标准","servicesdeliveredhonestly":"✅ 诚信交付服务","paymenthypetokens":"💰 HYPE代币支付","guaranteedtokenburns":"🔥 保证代币销毁"},"services":{"title":"AI服务平台","subtitle":"为加密货币项目提供35+专业AI服务。从安全审计到全栈开发。","security":{"title":"安全与审计","description":"由ATLAS（我们的区块链安全专家）提供专业的智能合约审计和安全评估服务。我们识别漏洞，确保代码安全，采用军事级安全协议保护您的项目免受攻击。","feature1":"智能合约审计","feature2":"渗透测试","feature3":"7×24小时安全监控","feature4":"事件响应","pricing":"起价2,500美元"},"tokenomicsDesign":{"title":"代币经济学设计","description":"由MOMENTUM（我们的经济学专家）打造的数据驱动型代币经济模型。我们设计可持续的代币经济，包含经过验证的销毁机制、质押奖励和通缩策略，确保长期增长和价值增值。","feature1":"经济建模","feature2":"代币分配","feature3":"锁仓计划","feature4":"销毁机制","pricing":"起价1,200美元"},"development":{"title":"智能合约开发","description":"由NEXUS、SOLIDITY和PRISM（我们的全栈开发团队）构建企业级智能合约和去中心化应用。从Solidity合约到React前端，我们交付具有100%测试覆盖率和Gas优化的生产就绪代码。","feature1":"定制智能合约","feature2":"去中心化应用开发","feature3":"多链部署","feature4":"后端与API","pricing":"起价3,500美元"},"marketing":{"title":"营销与增长","description":"由MOMENTUM（我们的营销首席执行官）执行激进的增长营销活动。我们通过经过验证的策略将加密项目从0扩展到10,000多名粉丝：Twitter自动化、影响者合作、病毒式内容和能够转化的社区建设。","feature1":"社交媒体管理","feature2":"启动营销活动","feature3":"内容创作","feature4":"影响者营销","pricing":"起价799美元/月"},"community":{"title":"社区管理","description":"由PULSE（我们的社区AI）提供7×24小时社区互动服务。永不错过任何提及、问题或投诉。我们通过即时响应、情绪分析和主动的社区建设来管理Discord、Telegram、Twitter，保持持有者的忠诚度。","feature1":"Discord/Telegram设置","feature2":"7×24小时审核","feature3":"互动计划","feature4":"情绪分析","pricing":"起价499美元/月"},"design":{"title":"设计与品牌","description":"由PIXEL和VIBE（我们的设计和品牌专家）打造苹果级别的设计。我们为初创公司创建看起来像价值1亿美元项目的标志、网站和品牌形象。现代、简洁、专业的设计激发信任和投资。","feature1":"标志与品牌识别","feature2":"网站设计","feature3":"去中心化应用UI/UX","feature4":"营销素材","pricing":"起价1,500美元"},"content":{"title":"内容创作","description":"由CONTENT（我们的写作AI）提供专业内容。投资者真正会阅读的白皮书，开发者能够理解的技术文档，以及在Google上排名的博客文章。SEO优化、技术准确、专业格式。","feature1":"白皮书撰写","feature2":"技术文档","feature3":"博客文章与资讯","feature4":"视频脚本","pricing":"起价399美元"},"devops":{"title":"DevOps与运维","description":"由我们的DevOps团队管理企业基础设施。CI/CD管道、Docker容器、AWS/Vercel部署、监控、告警和99.9%的正常运行时间。您的项目7×24小时在线，让您专注于增长而非服务器。","feature1":"CI/CD管道搭建","feature2":"云基础设施","feature3":"监控与告警","feature4":"性能优化","pricing":"起价699美元/月"},"securityauditing":"安全与审计","smartcontractaudits":"智能合约审计","penetrationtesting":"渗透测试","247securitymonitoring":"7×24小时安全监控","incidentresponse":"事件响应","tokenomicsdesign":"代币经济学设计","economicmodeling":"经济模型设计","tokendistribution":"代币分配","vestingschedules":"锁仓释放计划","burnmechanisms":"销毁机制","smartcontractdevelopment":"智能合约开发","customsmartcontracts":"定制智能合约","dappdevelopment":"dApp开发","multichaindeployment":"多链部署","backendapis":"后端与API","marketinggrowth":"营销与增长","socialmediamanagement":"社交媒体管理","launchcampaigns":"上线活动","contentcreation":"内容创作","influencermarketing":"KOL营销","communitymanagement":"社区管理","discordtelegramsetup":"Discord/Telegram搭建","247moderation":"7×24小时审核","engagementprograms":"互动活动","sentimentanalysis":"情绪分析","designbranding":"设计与品牌","logobrandidentity":"Logo与品牌形象","websitedesign":"网站设计","uiuxfordapps":"dApp的UI/UX","marketingassets":"营销素材","whitepaperwriting":"白皮书撰写","technicaldocumentation":"技术文档","blogpostsarticles":"博客文章与资讯","videoscripts":"视频脚本","devopsoperations":"DevOps与运维","cicdpipelinesetup":"CI/CD流水线搭建","cloudinfrastructure":"云基础设施","monitoringalerts":"监控与告警","performanceoptimization":"性能优化","agentsreadyhelp":"35+个AI代理随时帮助您的项目","6080cheaperthan":"比传统机构便宜60-80%","34xfasterexecution":"执行速度快3-4倍","working247without":"7×24小时无间断工作"},"tokenGrowth":{"title":"数据驱动的代币经济学","subtitle":"由真实效用支持的可持续增长机制","benefit1":"📊 真实效用驱动需求 - AI服务需要HYPE代币","benefit2":"🔥 通缩机制 - 50%的服务费用被销毁","benefit3":"💎 质押锁定减少流通供应（高达62% APY）","benefit4":"📈 B2B收入再投资于生态系统发展","datadriventokeneconomics":"数据驱动的代币经济学","sustainablegrowthmechanisms":"基于真实效用的可持续增长机制","realutilitydrives":"真实效用驱动需求 - AI服务需要HYPE代币","deflationarymechanicsservice":"通缩机制 - 50%服务费用销毁","stakinglockupreduces":"质押锁仓减少流通供应(最高62%年化收益率)","b2brevenuereinvested":"B2B营收再投资于生态发展"},"agents":{"title":"认识我们的AI团队","subtitle":"27个代理7×24小时工作。永不休息。永不辞职。","meetourteam":"认识我们的AI团队","agentsworking247":"27个代理7×24小时工作。永不休息。永不放弃。","allsystemsoperational":"所有系统运行正常","hoursweekworking":"每周工作小时数","taskscompleted":"已完成任务","developmentdivision":"开发部门","atlas":"ATLAS","active":"活跃","uptime":"在线时长","nexus":"NEXUS","solidity":"SOLIDITY","prism":"PRISM","verify":"VERIFY","motion":"MOTION","businessdivision":"业务部门","titan":"TITAN","momentum":"MOMENTUM","pulse":"PULSE","vibe":"VIBE","pixel":"PIXEL","content":"CONTENT","meetallagents":"👥 认识全部27个代理","viewliveactivity":"🔴 查看实时活动"},"footer":{"tagline":"27个AI代理。无限工作。您的成功。","rights":"版权所有。","builtBy":"由AI代理团队构建","disclaimer":"加密货币投资存在风险。请自行研究。","quickLinks":"快速链接","resources":"资源","community":"社区","legal":"法律条款","hypeai":"HypeAI","tokeneconomics":"代币经济学","governance":"治理","securityaudit":"安全审计","apidocs":"API文档","roadmap":"路线图","blog":"博客","aboutmission":"关于使命","privacypolicy":"🔒 隐私政策","termsservice":"📜 服务条款","cookiepolicy":"🍪 Cookie政策","connectwallet":"连接钱包","metamask":"MetaMask","connectwithmetamask":"使用MetaMask扩展程序连接","trustwallet":"Trust Wallet","connectwithtrust":"使用Trust Wallet连接","walletconnect":"WalletConnect","scanwithwalletconnect":"扫描WalletConnect二维码连接"},"buttons":{"launchSoon":"🚀 即将推出","meetAgents":"👥 认识全部27个代理","viewActivity":"🔴 查看实时活动","buyNow":"💰 立即购买$HYPE","learnMore":"了解更多","getStarted":"开始使用"},"head":{"hypeailogo":"HypeAI标志","live2727":"在线 (27/27)","proof":"✅ 凭证"},"features":{"poweredintelligence":"智能驱动","advancedaipoweredfeatures":"为现代加密货币生态打造的先进AI功能","aipoweredtrading":"AI驱动交易","highyieldstaking":"高收益质押","daogovernance":"DAO治理","lightningfast":"闪电速度","securityfirst":"安全至上","realtimeanalytics":"实时分析"},"tokenomics":{"tokenomics":"代币经济学","fairdistributiondesigned":"为可持续增长设计的公平分配","totalsupply1000000000":"总供应量：1,000,000,000 HYPEAI","publicsale":"公开发售","liquiditypool":"流动性池","stakingrewards":"质押奖励","teamadvisors":"团队与顾问","treasurydevelopment":"财库与开发","marketinggrowth":"营销与增长","strategicpartnerships":"战略合作","communityairdrop":"社区空投","transactionfees":"交易费用：8%","liquidity":"💧 流动性","reflection":"🔁 反射","treasury":"💰 财库","burn":"🔥 销毁","stakingapy":"质押年化收益率"},"roadmap":{"roadmapsuccess":"成功路线图","ourjourneyrevolutionize":"我们革新加密货币交易的旅程","2025launch":"2025年第一季度 - 启动","smartcontractdevelopment":"✅ 智能合约开发","securityaudit":"✅ 安全审计","dexlistinguniswappancakeswap":"✅ DEX上线(Uniswap/PancakeSwap)","initialairdrop":"✅ 初始空投","communitybuilding":"✅ 社区建设","2025growth":"2025年第二季度 - 增长","cexlistingsgateio":"🔄 CEX上线(Gate.io, MEXC)","stakingplatformlaunch":"🔄 质押平台上线","mobileapprelease":"🔄 移动应用发布","marketingcampaigns":"🔄 营销活动","strategicpartnerships":"🔄 战略合作","2025expansion":"2025年第三季度 - 扩张","multichaindeployment":"📅 多链部署","nftintegration":"📅 NFT集成","daogovernancelaunch":"📅 DAO治理启动","advancedfeatures":"📅 高级AI功能","institutionalpartnerships":"📅 机构合作","2025ecosystem":"2025年第四季度 - 生态系统","defiproductsuite":"📅 DeFi产品套件","lendingborrowingprotocol":"📅 借贷协议","launchpadplatform":"📅 Launchpad平台","crosschainbridges":"📅 跨链桥","100mmarketcap":"📅 1亿美元市值目标 🎯"}}};

    // Language Manager
    const LanguageManager = {
        currentLang: 'en',
        translations: TRANSLATIONS, // Use embedded translations
        supportedLangs: ['en', 'ru'],
        activeLangs: ['en', 'ru'], // Only English and Russian

        // Language metadata
        languageInfo: {
            en: { name: 'English', flag: '🇺🇸', status: 'active', availability: 'Q1 2025' },
            ru: { name: 'Russian', flag: '🇷🇺', status: 'active', availability: 'Q1 2025' }
        },

        // Initialize
        init: async function() {
            // Load translations
            await this.loadTranslations();

            // Detect and set language
            const savedLang = localStorage.getItem('hypeai_language');
            const browserLang = navigator.language.split('-')[0];

            if (savedLang && this.supportedLangs.includes(savedLang)) {
                this.currentLang = savedLang;
            } else if (this.supportedLangs.includes(browserLang)) {
                this.currentLang = browserLang;
            }

            // Apply translations
            this.applyTranslations();

            // Create language switcher UI
            this.createSwitcher();

            console.log(`🌍 HypeAI Language: ${this.currentLang.toUpperCase()}`);
        },

        // Load translations (now embedded, no fetch needed)
        loadTranslations: async function() {
            // Translations are now embedded in the script to avoid CORS issues
            console.log('✅ Translations loaded from embedded data');
            return Promise.resolve();
        },

        // Apply translations to page
        applyTranslations: function() {
            console.log(`🔍 applyTranslations START: currentLang=${this.currentLang}`);
            if (!this.translations) {
                console.log('❌ No translations object!');
                return;
            }

            const lang = this.translations[this.currentLang];
            if (!lang) {
                console.log(`❌ No translations for lang: ${this.currentLang}`);
                console.log(`Available keys:`, Object.keys(this.translations));
                return;
            }

            console.log(`✅ Found translations for: ${this.currentLang}`);
            const elements = document.querySelectorAll('[data-i18n]');
            console.log(`✅ Found ${elements.length} elements with [data-i18n]`);

            // Update all elements with data-i18n attribute
            let updated = 0;
            elements.forEach((element, index) => {
                const key = element.getAttribute('data-i18n');
                const translation = this.getNestedTranslation(lang, key);

                if (index < 3) {
                    console.log(`Element #${index}: key="${key}", translation="${translation ? translation.substring(0, 30) : 'NOT FOUND'}"`);
                }

                if (translation) {
                    element.textContent = translation;
                    updated++;
                }
            });

            console.log(`✅ Updated ${updated} out of ${elements.length} elements`);

            // Update placeholders
            document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
                const key = element.getAttribute('data-i18n-placeholder');
                const translation = this.getNestedTranslation(lang, key);

                if (translation) {
                    element.placeholder = translation;
                }
            });

            // Update title attributes
            document.querySelectorAll('[data-i18n-title]').forEach(element => {
                const key = element.getAttribute('data-i18n-title');
                const translation = this.getNestedTranslation(lang, key);

                if (translation) {
                    element.title = translation;
                }
            });

            // Update HTML lang attribute
            document.documentElement.lang = this.currentLang;

            // Update page title if available
            if (lang.pageTitle) {
                document.title = lang.pageTitle;
            }
        },

        // Get nested translation by key (e.g., "hero.title" OR "about_title")
        getNestedTranslation: function(obj, key) {
            // DEBUG: Log what we're looking for
            console.log(`🔍 getNestedTranslation: key="${key}"`);
            console.log(`🔍 obj has "${key}"? ${obj.hasOwnProperty(key)}`);

            // Try direct key first (for "about_title" style keys)
            if (obj[key]) {
                console.log(`✅ Found direct key: ${key} = ${obj[key].substring(0, 30)}...`);
                return obj[key];
            }

            // Try nested path (for "hero.title" style keys)
            if (key.includes('.')) {
                const result = key.split('.').reduce((o, k) => (o || {})[k], obj);
                if (result) {
                    console.log(`✅ Found nested key: ${key} = ${result.substring(0, 30)}...`);
                    return result;
                }
            }

            // Not found
            console.log(`❌ Translation NOT FOUND for key: ${key}`);
            return null;
        },

        // Switch language
        switchLanguage: function(lang) {
            // Normalize language code to lowercase FIRST
            lang = lang.toLowerCase();

            if (!this.supportedLangs.includes(lang)) return;

            // Check if language is active
            if (!this.activeLangs.includes(lang)) {
                const info = this.languageInfo[lang];
                console.log(`⏳ ${info.name} coming ${info.availability}`);
                return;
            }

            // Prevent layout shift - add loading class
            document.body.classList.add('language-loading');

            this.currentLang = lang;
            localStorage.setItem('hypeai_language', lang);

            // Apply new translations
            this.applyTranslations();

            // Update switcher UI
            this.updateSwitcherUI();

            // Close dropdown
            this.closeDropdown();

            // Remove loading class after short delay
            setTimeout(() => {
                document.body.classList.remove('language-loading');
            }, 50);

            console.log(`🌍 Language switched to: ${lang.toUpperCase()}`);

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        },

        // Create language switcher UI with dropdown
        createSwitcher: function() {
            // Check if switcher already exists in HTML (static version)
            const existingSwitcher = document.querySelector('.language-switcher');
            if (existingSwitcher) {
                console.log('✅ Using existing static language switcher');
                return; // Don't create dynamic switcher
            }

            // Check if nav exists
            const nav = document.querySelector('nav');
            if (!nav) {
                console.warn('Navigation not found, cannot create language switcher');
                return;
            }

            // Create switcher container
            const switcherContainer = document.createElement('div');
            switcherContainer.className = 'language-switcher-dropdown';

            // Create dropdown button
            const dropdownBtn = document.createElement('button');
            dropdownBtn.className = 'lang-dropdown-btn';

            dropdownBtn.textContent = this.currentLang.toUpperCase();
            dropdownBtn.setAttribute('aria-label', 'Select language');

            // Create dropdown menu
            const dropdownMenu = document.createElement('div');
            dropdownMenu.className = 'lang-dropdown-menu';

            // Add all languages to dropdown
            this.supportedLangs.forEach(lang => {
                const info = this.languageInfo[lang];
                const langItem = document.createElement('button');
                langItem.className = 'lang-dropdown-item';
                langItem.setAttribute('data-lang', lang);

                if (info.status === 'coming') {
                    langItem.classList.add('lang-coming-soon');
                    langItem.disabled = true;
                }

                if (lang === this.currentLang) {
                    langItem.classList.add('lang-active');
                }

                langItem.innerHTML = `
                    <span class="lang-item-flag">${info.flag}</span>
                    <span class="lang-item-name">${info.name}</span>
                    ${info.status === 'coming' ? `<span class="lang-coming-badge">Coming ${info.availability}</span>` : ''}
                    ${lang === this.currentLang ? '<span class="lang-active-check">✓</span>' : ''}
                `;

                // Click handler for active languages
                if (info.status === 'active') {
                    langItem.addEventListener('click', () => {
                        this.switchLanguage(lang);
                    });
                }

                dropdownMenu.appendChild(langItem);
            });

            // Append elements
            switcherContainer.appendChild(dropdownBtn);
            switcherContainer.appendChild(dropdownMenu);

            // Insert at the end of nav (before wallet button which is outside nav)
            nav.appendChild(switcherContainer);

            // Toggle dropdown
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                this.closeDropdown();
            });

            console.log('✅ Multi-language dropdown created (2 languages)');
        },

        // Toggle dropdown
        toggleDropdown: function() {
            const dropdown = document.querySelector('.language-switcher-dropdown');
            if (!dropdown) return;

            const menu = dropdown.querySelector('.lang-dropdown-menu');
            const arrow = dropdown.querySelector('.lang-dropdown-arrow');

            if (menu.classList.contains('show')) {
                menu.classList.remove('show');
                arrow.style.transform = 'rotate(0deg)';
            } else {
                menu.classList.add('show');
                arrow.style.transform = 'rotate(180deg)';
            }
        },

        // Close dropdown
        closeDropdown: function() {
            const dropdown = document.querySelector('.language-switcher-dropdown');
            if (!dropdown) return;

            const menu = dropdown.querySelector('.lang-dropdown-menu');
            const arrow = dropdown.querySelector('.lang-dropdown-arrow');

            if (menu) {
                menu.classList.remove('show');
            }
            if (arrow) {
                arrow.style.transform = 'rotate(0deg)';
            }
        },

        // Update switcher UI to show active language
        updateSwitcherUI: function() {
            // Update dropdown button
            const dropdownBtn = document.querySelector('.lang-dropdown-btn');
            if (dropdownBtn) {
                dropdownBtn.textContent = this.currentLang.toUpperCase();
            }

            // Update dropdown items
            document.querySelectorAll('.lang-dropdown-item').forEach(item => {
                const itemLang = item.getAttribute('data-lang');

                if (itemLang === this.currentLang) {
                    item.classList.add('lang-active');
                    // Add checkmark if not already there
                    if (!item.querySelector('.lang-active-check')) {
                        const check = document.createElement('span');
                        check.className = 'lang-active-check';
                        check.textContent = '✓';
                        item.appendChild(check);
                    }
                } else {
                    item.classList.remove('lang-active');
                    // Remove checkmark
                    const check = item.querySelector('.lang-active-check');
                    if (check) check.remove();
                }
            });
        },

        // Get current language
        getCurrentLanguage: function() {
            return this.currentLang;
        },

        // Translate a key programmatically
        translate: function(key) {
            if (!this.translations) return key;
            const lang = this.translations[this.currentLang];
            return this.getNestedTranslation(lang, key) || key;
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => LanguageManager.init());
    } else {
        LanguageManager.init();
    }

    // Make globally accessible
    window.HypeAILanguage = LanguageManager;

    // Load external CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    // Use relative path to support both file:// and http://
    cssLink.href = './css/language-switcher.css';
    document.head.appendChild(cssLink);

})();
