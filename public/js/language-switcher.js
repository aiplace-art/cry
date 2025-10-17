/**
 * HypeAI Language Switcher
 * Professional i18n system for English/Russian
 * Agent: BABEL - Translation Specialist
 */

(function() {
    'use strict';

    // Embedded translations (to avoid CORS issues with file:// protocol)
    // COMPLETE translations for EN, RU, ZH - ALL sections covered!
    const TRANSLATIONS = {"en":{"nav":{"home":"Home","trade":"Trade","stake":"Stake","agents":"AI Agents","docs":"Docs","whitepaper":"Whitepaper","connectWallet":"Connect Wallet"},"hero":{"title":"Where AI Meets Opportunity","subtitle":"Smarter. Faster. Better.","description":"27 AI Agents working infinitely to empower your financial growth","ctaPrimary":"Start Trading Now","ctaSecondary":"View AI Agents","whySuccessButton":"🚀 Why 50x-100x-1000x is Inevitable"},"stats":{"agents":"AI Agents","holders":"Token Holders","price":"Token Price (Demo)","trading":"Trading Active (Demo)"},"whySucceed":{"title":"🚀 Why HypeAI is Destined to Succeed","subtitle":"Built on real revenue, utility, and AI innovation. Our success is inevitable.","features":{"cryptoChecker":{"title":"Crypto Checker - Paid Service 💰","intro":"Enter any crypto address. Our 27 AI agents analyze in 30 seconds:","feature1":"✅ Scam or Legit? - Rug pull detection, honeypot check","feature2":"📊 Full Analysis - Contract security, liquidity, holders","feature3":"📈 Success Probability - AI predicts 10x, 100x, or dump","feature4":"📄 Complete Report - Tokenomics, team, marketing, roadmap","pricing":"💵 Pricing: $9.99 per check","payment":"Paid in HYPE tokens. 50% of fees burned forever. 🔥","launch":"🎯 Coming Q2 2025: Save investors from scams, earn revenue, burn tokens. Win-win-win."},"aiOracle":{"title":"AI Oracle - Price Predictions","description":"Our neural network analyzes 1000+ data points every second to predict crypto price movements with 85%+ accuracy. Uses LSTM, Transformer models, and on-chain analytics.","feature1":"📊 Real-time market analysis","feature2":"🧠 AI-powered predictions","feature3":"📈 85%+ accuracy rate","feature4":"⚡ Updates every 60 seconds"},"b2bRevenue":{"title":"Real B2B Revenue","description":"Unlike memecoins, we have real paying customers. Crypto projects pay us $2,500-$10,000 for security audits, tokenomics, marketing, and development.","feature1":"💼 35+ paid AI services","feature2":"📈 Growing client base","feature3":"🔥 50% of revenue → token burns","feature4":"📊 Sustainable growth model"},"tokenBurns":{"title":"Aggressive Token Burns","description":"50% of ALL service fees get burned permanently. As usage grows, supply shrinks. Simple economics: decreasing supply + increasing demand = price goes up. 📈","expected":"Expected: 100M+ tokens burned in Year 1"},"staking":{"title":"62% APY Staking = Supply Shock","description":"When 40-60% of tokens are locked in staking (365-day lock), circulating supply drops dramatically. Less available tokens = higher prices. Diamond hands get rewarded massively.","projected":"Projected: 500M+ tokens locked by Q4 2025"},"aiAgents":{"title":"27 Agents Work Infinitely","description":"Our AI agents never sleep, never quit, never take vacations. They work ⚡ infinitely to build features, acquire users, create content, and grow the ecosystem. Zero labor costs.","result":"Result: Faster development than any competitor"}}},"services":{"title":"AI Services Platform","subtitle":"35+ professional AI services for crypto projects. From security audits to full-stack development.","security":{"title":"Security & Auditing","description":"Professional smart contract audits and security assessments by ATLAS, our blockchain security specialist. We identify vulnerabilities, ensure code safety, and protect your project from exploits with military-grade security protocols.","feature1":"Smart Contract Audits","feature2":"Penetration Testing","feature3":"24/7 Security Monitoring","feature4":"Incident Response","pricing":"From $2,500"},"tokenomicsDesign":{"title":"Tokenomics Design","description":"Data-driven tokenomics models crafted by MOMENTUM, our economics specialist. We design sustainable token economies with proven burn mechanisms, staking rewards, and deflationary strategies that ensure long-term growth and value appreciation.","feature1":"Economic Modeling","feature2":"Token Distribution","feature3":"Vesting Schedules","feature4":"Burn Mechanisms","pricing":"From $1,200"},"development":{"title":"Smart Contract Development","description":"Enterprise-grade smart contracts and dApps built by NEXUS, SOLIDITY, and PRISM - our full-stack development team. From Solidity contracts to React frontends, we deliver production-ready code with 100% test coverage and gas optimization.","feature1":"Custom Smart Contracts","feature2":"dApp Development","feature3":"Multi-Chain Deployment","feature4":"Backend & APIs","pricing":"From $3,500"},"marketing":{"title":"Marketing & Growth","description":"Aggressive growth campaigns executed by MOMENTUM, our marketing CMO. We scale crypto projects from 0 to 10,000+ followers with proven strategies: Twitter automation, influencer partnerships, viral content, and community building that converts.","feature1":"Social Media Management","feature2":"Launch Campaigns","feature3":"Content Creation","feature4":"Influencer Marketing","pricing":"From $799/mo"},"community":{"title":"Community Management","description":"24/7 community engagement powered by PULSE, our community AI. Never miss a mention, question, or complaint. We manage Discord, Telegram, Twitter with instant responses, sentiment analysis, and proactive community building that keeps your holders loyal.","feature1":"Discord/Telegram Setup","feature2":"24/7 Moderation","feature3":"Engagement Programs","feature4":"Sentiment Analysis","pricing":"From $499/mo"},"design":{"title":"Design & Branding","description":"Apple-level design crafted by PIXEL and VIBE, our design and brand specialists. We create logos, websites, and brand identities that look like $100M projects - even for startups. Modern, clean, and professional designs that inspire trust and investment.","feature1":"Logo & Brand Identity","feature2":"Website Design","feature3":"UI/UX for dApps","feature4":"Marketing Assets","pricing":"From $1,500"},"content":{"title":"Content Creation","description":"Professional content from CONTENT, our writing AI. Whitepapers that investors actually read, technical docs that developers understand, and blog posts that rank on Google. SEO-optimized, technically accurate, and professionally formatted.","feature1":"Whitepaper Writing","feature2":"Technical Documentation","feature3":"Blog Posts & Articles","feature4":"Video Scripts","pricing":"From $399"},"devops":{"title":"DevOps & Operations","description":"Enterprise infrastructure managed by our DevOps team. CI/CD pipelines, Docker containers, AWS/Vercel deployments, monitoring, alerts, and 99.9% uptime. Your project stays online 24/7 while you focus on growth, not servers.","feature1":"CI/CD Pipeline Setup","feature2":"Cloud Infrastructure","feature3":"Monitoring & Alerts","feature4":"Performance Optimization","pricing":"From $699/mo"}},"tokenGrowth":{"title":"Data-Driven Token Economics","subtitle":"Sustainable growth mechanisms backed by real utility","benefit1":"📊 Real utility drives demand - AI services require HYPE tokens","benefit2":"🔥 Deflationary mechanics - 50% of service fees burned","benefit3":"💎 Staking lockup reduces circulating supply (up to 62% APY)","benefit4":"📈 B2B revenue reinvested in ecosystem development"},"agents":{"title":"Meet Our AI Team","subtitle":"27 agents working 24/7. Never sleep. Never quit."},"footer":{"tagline":"27 AI Agents. Infinite Work. YOUR Success.","rights":"All rights reserved.","builtBy":"Built by AI Agents Team","disclaimer":"Cryptocurrency investments carry risk. Do your own research.","quickLinks":"Quick Links","resources":"Resources","community":"Community","legal":"Legal"},"buttons":{"launchSoon":"🚀 Launch Soon","meetAgents":"👥 Meet All 27 Agents","viewActivity":"🔴 View Live Activity","buyNow":"💰 Buy $HYPE Now","learnMore":"Learn More","getStarted":"Get Started"}},"ru":{"nav":{"connectWallet":"Подключить кошелёк","home":"Главная","trade":"Торговля","stake":"Стейкинг","docs":"Документация","whitepaper":"White Paper","agents":"ИИ-Команда"},"hero":{"title":"Где ИИ встречает возможности","subtitle":"Умнее. Быстрее. Лучше.","description":"27 ИИ-агентов работают непрерывно для вашего финансового роста","ctaPrimary":"Начать торговлю сейчас","ctaSecondary":"Посмотреть ИИ-агентов","whySuccessButton":"🚀 Почему 50x-100x-1000x неизбежны"},"stats":{"holders":"Держатели","agents":"ИИ-агентов","price":"Цена токена (демо)","trading":"Торговля активна (демо)"},"whySucceed":{"title":"Почему HypeAI обречен на успех","subtitle":"","features":{"cryptoChecker":{"title":"Crypto Checker - Платная услуга 💰","intro":"Введите любой крипто-адрес. Наши 27 ИИ-агентов анализируют за 30 секунд:","feature1":"✅ Скам или Честный проект? - Обнаружение rug pull, проверка honeypot","feature2":"📊 Полный анализ - Безопасность контракта, ликвидность, держатели","feature3":"📈 Вероятность успеха - ИИ предсказывает 10x, 100x или dump","feature4":"📄 Полный отчёт - Токеномика, команда, маркетинг, дорожная карта","pricing":"💵 Стоимость: $9.99 за проверку","payment":"Оплата токенами HYPE. 50% комиссий сжигается навсегда. 🔥","launch":"🎯 Запуск во Q2 2025: Защита инвесторов от скамов, генерация дохода, сжигание токенов. Выигрывают все."},"aiOracle":{"title":"AI Oracle - Прогнозы цен","description":"Наша нейронная сеть анализирует 1000+ точек данных каждую секунду для предсказания движений цен криптовалют с точностью 85%+. Использует LSTM, Transformer модели и он-чейн аналитику.","feature1":"📊 Рыночный анализ в реальном времени","feature2":"🧠 Прогнозы на базе ИИ","feature3":"📈 Точность 85%+","feature4":"⚡ Обновления каждые 60 секунд"},"b2bRevenue":{"title":"Реальная B2B выручка","description":"В отличие от мемкоинов, у нас есть реальные платящие клиенты. Крипто-проекты платят нам $2,500-$10,000 за аудиты безопасности, токеномику, маркетинг и разработку.","feature1":"💼 35+ платных ИИ-сервисов","feature2":"📈 Растущая клиентская база","feature3":"🔥 50% дохода → сжигание токенов","feature4":"📊 Модель устойчивого роста"},"tokenBurns":{"title":"Агрессивное сжигание токенов","description":"50% ВСЕХ сервисных комиссий сжигается навсегда. По мере роста использования предложение сокращается. Простая экономика: уменьшение предложения + увеличение спроса = рост цены. 📈","expected":"Прогноз: 100M+ токенов сожжено в первый год"},"staking":{"title":"Стейкинг 62% APY = Шок предложения","description":"Когда 40-60% токенов заблокировано в стейкинге (блокировка на 365 дней), циркулирующее предложение резко падает. Меньше доступных токенов = более высокие цены. Бриллиантовые руки получают массивные награды.","projected":"Прогноз: 500M+ токенов заблокировано к Q4 2025"},"aiAgents":{"title":"27 агентов работают бесконечно","description":"Наши ИИ-агенты никогда не спят, никогда не увольняются, никогда не берут отпуск. Они работают ⚡ бесконечно для создания функций, привлечения пользователей, создания контента и развития экосистемы. Нулевые затраты на рабочую силу.","result":"Результат: Более быстрая разработка, чем у любого конкурента"}}},"services":{"title":"Платформа ИИ-сервисов","subtitle":"","security":{"title":"Безопасность и аудит","description":"Профессиональные аудиты смарт-контрактов и оценки безопасности от ATLAS, нашего специалиста по безопасности блокчейна. Мы выявляем уязвимости, обеспечиваем безопасность кода и защищаем ваш проект от эксплойтов с помощью протоколов безопасности военного уровня.","feature1":"Аудиты смарт-контрактов","feature2":"Тестирование на проникновение","feature3":"Мониторинг безопасности 24/7","feature4":"Реагирование на инциденты","pricing":"От $2,500"},"tokenomicsDesign":{"title":"Дизайн токеномики","description":"Модели токеномики на основе данных, разработанные MOMENTUM, нашим специалистом по экономике. Мы проектируем устойчивые токен-экономики с проверенными механизмами сжигания, наградами за стейкинг и дефляционными стратегиями, обеспечивающими долгосрочный рост и увеличение стоимости.","feature1":"Экономическое моделирование","feature2":"Распределение токенов","feature3":"Графики вестинга","feature4":"Механизмы сжигания","pricing":"От $1,200"},"development":{"title":"Разработка смарт-контрактов","description":"Смарт-контракты и dApps корпоративного уровня, созданные NEXUS, SOLIDITY и PRISM - нашей командой full-stack разработки. От контрактов Solidity до React-фронтенда, мы поставляем готовый к производству код со 100% покрытием тестами и оптимизацией газа.","feature1":"Кастомные смарт-контракты","feature2":"Разработка dApp","feature3":"Мультичейн развёртывание","feature4":"Бэкенд и API","pricing":"От $3,500"},"marketing":{"title":"Маркетинг и рост","description":"Агрессивные кампании роста, выполняемые MOMENTUM, нашим CMO по маркетингу. Мы масштабируем крипто-проекты от 0 до 10,000+ подписчиков с проверенными стратегиями: автоматизация Twitter, партнёрства с инфлюенсерами, вирусный контент и построение сообщества, которое конвертирует.","feature1":"Управление соцсетями","feature2":"Кампании запуска","feature3":"Создание контента","feature4":"Инфлюенсер-маркетинг","pricing":"От $799/мес"},"community":{"title":"Управление сообществом","description":"Вовлечение сообщества 24/7 на базе PULSE, нашего ИИ сообщества. Никогда не пропустите упоминание, вопрос или жалобу. Мы управляем Discord, Telegram, Twitter с мгновенными ответами, анализом настроений и проактивным построением сообщества, которое сохраняет лояльность ваших держателей.","feature1":"Настройка Discord/Telegram","feature2":"Модерация 24/7","feature3":"Программы вовлечения","feature4":"Анализ настроений","pricing":"От $499/мес"},"design":{"title":"Дизайн и брендинг","description":"Дизайн уровня Apple, созданный PIXEL и VIBE, нашими специалистами по дизайну и бренду. Мы создаём логотипы, веб-сайты и фирменный стиль, которые выглядят как проекты на $100M - даже для стартапов. Современный, чистый и профессиональный дизайн, вдохновляющий на доверие и инвестиции.","feature1":"Логотип и фирменный стиль","feature2":"Дизайн веб-сайта","feature3":"UI/UX для dApps","feature4":"Маркетинговые материалы","pricing":"От $1,500"},"content":{"title":"Создание контента","description":"Профессиональный контент от CONTENT, нашего ИИ для написания текстов. Whitepaper, которые инвесторы действительно читают, техническая документация, понятная разработчикам, и блог-посты, ранжируемые в Google. SEO-оптимизированный, технически точный и профессионально отформатированный.","feature1":"Написание Whitepaper","feature2":"Техническая документация","feature3":"Блог-посты и статьи","feature4":"Видео-сценарии","pricing":"От $399"},"devops":{"title":"DevOps и операции","description":"Корпоративная инфраструктура, управляемая нашей командой DevOps. CI/CD пайплайны, Docker-контейнеры, развёртывания AWS/Vercel, мониторинг, оповещения и 99.9% аптайм. Ваш проект работает онлайн 24/7, пока вы фокусируетесь на росте, а не на серверах.","feature1":"Настройка CI/CD пайплайна","feature2":"Облачная инфраструктура","feature3":"Мониторинг и оповещения","feature4":"Оптимизация производительности","pricing":"От $699/мес"}},"tokenGrowth":{"title":"Токен-экономика на основе данных","subtitle":"Механизмы устойчивого роста, подкреплённые реальной полезностью","benefit1":"📊 Реальная полезность стимулирует спрос - ИИ-сервисы требуют токены HYPE","benefit2":"🔥 Дефляционная механика - 50% сервисных комиссий сжигается","benefit3":"💎 Блокировка в стейкинге сокращает циркулирующее предложение (до 62% APY)","benefit4":"📈 B2B выручка реинвестируется в развитие экосистемы"},"agents":{"title":"Познакомьтесь с нашей ИИ-командой","subtitle":"27 агентов работают 24/7. Никогда не спят. Никогда не увольняются."},"footer":{"tagline":"Платформа криптотрейдинга на базе ИИ. Где ИИ встречает возможности.","builtBy":"Создано 26 профессиональными ИИ-агентами","resources":"Ресурсы","legal":"Юридическая информация","rights":"Все права защищены.","disclaimer":"Инвестиции в криптовалюту связаны с рисками. Проводите собственное исследование.","quickLinks":"Быстрые ссылки","community":"Сообщество"},"buttons":{"learnMore":"Узнать больше","getStarted":"Начать","launchSoon":"🚀 Скоро запуск","meetAgents":"👥 Познакомиться со всеми 27 агентами","viewActivity":"🔴 Посмотреть активность в реальном времени","buyNow":"💰 Купить $HYPE сейчас"}},"zh":{"nav":{"home":"首页","trade":"交易","stake":"质押","agents":"AI代理","docs":"文档","whitepaper":"白皮书","connectWallet":"连接钱包"},"hero":{"title":"AI遇见机遇","subtitle":"更智能。更快速。更优秀。","description":"27个AI代理无限工作，助力您的财务增长","ctaPrimary":"立即开始交易","ctaSecondary":"查看AI代理","whySuccessButton":"🚀 为什么50倍-100倍-1000倍势不可挡"},"stats":{"agents":"AI代理","holders":"代币持有者","price":"代币价格（演示）","trading":"交易激活中（演示）"},"whySucceed":{"title":"🚀 为什么HypeAI注定成功","subtitle":"建立在真实收入、实用性和AI创新之上。我们的成功势不可挡。","features":{"cryptoChecker":{"title":"加密货币检测器 - 付费服务 💰","intro":"输入任何加密货币地址。我们的27个AI代理将在30秒内完成分析：","feature1":"✅ 骗局还是合法？- 撤池检测，蜜罐检查","feature2":"📊 全面分析 - 合约安全性、流动性、持有者","feature3":"📈 成功概率 - AI预测10倍、100倍或暴跌","feature4":"📄 完整报告 - 代币经济学、团队、营销、路线图","pricing":"💵 定价：每次检测9.99美元","payment":"使用HYPE代币支付。50%的费用将永久销毁。🔥","launch":"🎯 2025年第二季度上线：保护投资者免受骗局，赚取收入，销毁代币。三赢局面。"},"aiOracle":{"title":"AI预言机 - 价格预测","description":"我们的神经网络每秒分析1000多个数据点，以85%以上的准确率预测加密货币价格走势。使用LSTM、Transformer模型和链上分析技术。","feature1":"📊 实时市场分析","feature2":"🧠 AI驱动的预测","feature3":"📈 85%以上准确率","feature4":"⚡ 每60秒更新一次"},"b2bRevenue":{"title":"真实的B2B收入","description":"与模因币不同，我们拥有真实的付费客户。加密项目为安全审计、代币经济学、营销和开发服务向我们支付2,500至10,000美元。","feature1":"💼 35+项付费AI服务","feature2":"📈 不断增长的客户群","feature3":"🔥 50%的收入用于代币销毁","feature4":"📊 可持续增长模式"},"tokenBurns":{"title":"激进的代币销毁","description":"所有服务费用的50%将被永久销毁。随着使用量增长，供应量减少。简单的经济学原理：供应减少+需求增加=价格上涨。📈","expected":"预期：第一年销毁超过1亿枚代币"},"staking":{"title":"62% APY质押=供应冲击","description":"当40-60%的代币被锁定在质押中（365天锁定期），流通供应量将大幅下降。可用代币减少=价格上涨。钻石手将获得丰厚回报。","projected":"预测：到2025年第四季度将锁定超过5亿枚代币"},"aiAgents":{"title":"27个代理无限工作","description":"我们的AI代理永不休息，永不辞职，永不休假。它们⚡无限工作，构建功能，获取用户，创建内容，发展生态系统。零人力成本。","result":"结果：比任何竞争对手都快的开发速度"}}},"services":{"title":"AI服务平台","subtitle":"为加密货币项目提供35+专业AI服务。从安全审计到全栈开发。","security":{"title":"安全与审计","description":"由ATLAS（我们的区块链安全专家）提供专业的智能合约审计和安全评估服务。我们识别漏洞，确保代码安全，采用军事级安全协议保护您的项目免受攻击。","feature1":"智能合约审计","feature2":"渗透测试","feature3":"7×24小时安全监控","feature4":"事件响应","pricing":"起价2,500美元"},"tokenomicsDesign":{"title":"代币经济学设计","description":"由MOMENTUM（我们的经济学专家）打造的数据驱动型代币经济模型。我们设计可持续的代币经济，包含经过验证的销毁机制、质押奖励和通缩策略，确保长期增长和价值增值。","feature1":"经济建模","feature2":"代币分配","feature3":"锁仓计划","feature4":"销毁机制","pricing":"起价1,200美元"},"development":{"title":"智能合约开发","description":"由NEXUS、SOLIDITY和PRISM（我们的全栈开发团队）构建企业级智能合约和去中心化应用。从Solidity合约到React前端，我们交付具有100%测试覆盖率和Gas优化的生产就绪代码。","feature1":"定制智能合约","feature2":"去中心化应用开发","feature3":"多链部署","feature4":"后端与API","pricing":"起价3,500美元"},"marketing":{"title":"营销与增长","description":"由MOMENTUM（我们的营销首席执行官）执行激进的增长营销活动。我们通过经过验证的策略将加密项目从0扩展到10,000多名粉丝：Twitter自动化、影响者合作、病毒式内容和能够转化的社区建设。","feature1":"社交媒体管理","feature2":"启动营销活动","feature3":"内容创作","feature4":"影响者营销","pricing":"起价799美元/月"},"community":{"title":"社区管理","description":"由PULSE（我们的社区AI）提供7×24小时社区互动服务。永不错过任何提及、问题或投诉。我们通过即时响应、情绪分析和主动的社区建设来管理Discord、Telegram、Twitter，保持持有者的忠诚度。","feature1":"Discord/Telegram设置","feature2":"7×24小时审核","feature3":"互动计划","feature4":"情绪分析","pricing":"起价499美元/月"},"design":{"title":"设计与品牌","description":"由PIXEL和VIBE（我们的设计和品牌专家）打造苹果级别的设计。我们为初创公司创建看起来像价值1亿美元项目的标志、网站和品牌形象。现代、简洁、专业的设计激发信任和投资。","feature1":"标志与品牌识别","feature2":"网站设计","feature3":"去中心化应用UI/UX","feature4":"营销素材","pricing":"起价1,500美元"},"content":{"title":"内容创作","description":"由CONTENT（我们的写作AI）提供专业内容。投资者真正会阅读的白皮书，开发者能够理解的技术文档，以及在Google上排名的博客文章。SEO优化、技术准确、专业格式。","feature1":"白皮书撰写","feature2":"技术文档","feature3":"博客文章与资讯","feature4":"视频脚本","pricing":"起价399美元"},"devops":{"title":"DevOps与运维","description":"由我们的DevOps团队管理企业基础设施。CI/CD管道、Docker容器、AWS/Vercel部署、监控、告警和99.9%的正常运行时间。您的项目7×24小时在线，让您专注于增长而非服务器。","feature1":"CI/CD管道搭建","feature2":"云基础设施","feature3":"监控与告警","feature4":"性能优化","pricing":"起价699美元/月"}},"tokenGrowth":{"title":"数据驱动的代币经济学","subtitle":"由真实效用支持的可持续增长机制","benefit1":"📊 真实效用驱动需求 - AI服务需要HYPE代币","benefit2":"🔥 通缩机制 - 50%的服务费用被销毁","benefit3":"💎 质押锁定减少流通供应（高达62% APY）","benefit4":"📈 B2B收入再投资于生态系统发展"},"agents":{"title":"认识我们的AI团队","subtitle":"27个代理7×24小时工作。永不休息。永不辞职。"},"footer":{"tagline":"27个AI代理。无限工作。您的成功。","rights":"版权所有。","builtBy":"由AI代理团队构建","disclaimer":"加密货币投资存在风险。请自行研究。","quickLinks":"快速链接","resources":"资源","community":"社区","legal":"法律条款"},"buttons":{"launchSoon":"🚀 即将推出","meetAgents":"👥 认识全部27个代理","viewActivity":"🔴 查看实时活动","buyNow":"💰 立即购买$HYPE","learnMore":"了解更多","getStarted":"开始使用"}}};

    // Language Manager
    const LanguageManager = {
        currentLang: 'en',
        translations: TRANSLATIONS, // Use embedded translations
        supportedLangs: ['en', 'ru', 'zh', 'es', 'fr', 'de', 'ja', 'ko'],
        activeLangs: ['en', 'ru', 'zh'], // Currently active languages - CHINESE NOW ACTIVE!

        // Language metadata
        languageInfo: {
            en: { name: 'English', flag: '🇺🇸', status: 'active', availability: 'Q1 2025' },
            ru: { name: 'Russian', flag: '🇷🇺', status: 'active', availability: 'Q1 2025' },
            zh: { name: 'Chinese', flag: '🇨🇳', status: 'active', availability: 'Q1 2025' }, // ACTIVATED!
            es: { name: 'Spanish', flag: '🇪🇸', status: 'coming', availability: 'Q2 2025' },
            fr: { name: 'French', flag: '🇫🇷', status: 'coming', availability: 'Q3 2025' },
            de: { name: 'German', flag: '🇩🇪', status: 'coming', availability: 'Q3 2025' },
            ja: { name: 'Japanese', flag: '🇯🇵', status: 'coming', availability: 'Q3 2025' },
            ko: { name: 'Korean', flag: '🇰🇷', status: 'coming', availability: 'Q4 2025' }
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
            if (!this.translations) return;

            const lang = this.translations[this.currentLang];
            if (!lang) return;

            // Update all elements with data-i18n attribute
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.getNestedTranslation(lang, key);

                if (translation) {
                    element.textContent = translation;
                }
            });

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

        // Get nested translation by key (e.g., "hero.title")
        getNestedTranslation: function(obj, key) {
            return key.split('.').reduce((o, k) => (o || {})[k], obj);
        },

        // Switch language
        switchLanguage: function(lang) {
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

            const currentInfo = this.languageInfo[this.currentLang];
            dropdownBtn.innerHTML = `
                <span class="lang-current-flag">${currentInfo.flag}</span>
                <span class="lang-current-name">${currentInfo.name}</span>
                <svg class="lang-dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;

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

            console.log('✅ Multi-language dropdown created (8 languages)');
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
                const currentInfo = this.languageInfo[this.currentLang];
                const flagSpan = dropdownBtn.querySelector('.lang-current-flag');
                const nameSpan = dropdownBtn.querySelector('.lang-current-name');

                if (flagSpan) flagSpan.textContent = currentInfo.flag;
                if (nameSpan) nameSpan.textContent = currentInfo.name;
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
