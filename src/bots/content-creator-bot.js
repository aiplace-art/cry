/**
 * HypeAI Content Creator Bot
 * Automated content generation for Telegram community engagement
 * Features: Daily posts, memes, polls, educational content, countdown timers
 * 100% legal, non-spammy, community-focused
 */

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;
const path = require('path');

class ContentCreatorBot {
  constructor(config) {
    this.config = config;
    this.bot = new TelegramBot(config.telegram.token, { polling: false });

    // Content state
    this.postsToday = 0;
    this.maxPostsPerDay = 10;
    this.lastPostTime = null;
    this.minPostInterval = 3600000; // 1 hour between posts
    this.approvalQueue = [];
    this.contentHistory = [];
    this.analytics = {
      totalPosts: 0,
      engagement: {},
      bestTimes: [],
      topContent: []
    };

    // AI agent personalities for content variation
    this.agents = [
      { name: 'Marcus', role: 'Market Analyst', style: 'data-driven, analytical' },
      { name: 'Luna', role: 'Community Manager', style: 'friendly, engaging' },
      { name: 'Tech', role: 'Blockchain Dev', style: 'technical, educational' },
      { name: 'Meme Lord', role: 'Content Creator', style: 'humorous, viral' },
      { name: 'Vision', role: 'Strategic Planner', style: 'inspirational, forward-thinking' }
    ];

    // Content templates
    this.templates = this.initializeTemplates();

    // Schedule state
    this.scheduledPosts = [];
    this.optimalTimes = [
      { hour: 8, minute: 0, type: 'morning' },      // 8 AM - Good morning
      { hour: 12, minute: 0, type: 'midday' },      // 12 PM - Lunch update
      { hour: 16, minute: 0, type: 'afternoon' },   // 4 PM - Afternoon boost
      { hour: 20, minute: 0, type: 'evening' }      // 8 PM - Evening summary
    ];

    // Trending topics cache
    this.trendingTopics = [];
    this.lastTrendingUpdate = null;
  }

  initializeTemplates() {
    return {
      goodMorning: [
        "☀️ Good morning, HypeAI family! 🚀\n\n{agentGreeting}\n\nToday's focus: {topic}\n\n{marketSnapshot}\n\nLet's make today count! 💪",
        "🌅 Rise and shine, champions! ☕\n\n{agentName} here with your morning brief:\n\n{insight}\n\nRemember: {motivation}\n\nLFG! 🔥",
        "🌄 GM GM! Another day closer to the moon! 🌙\n\n{agentQuote}\n\nDid you know? {funFact}\n\nStay awesome! ⚡"
      ],

      agentSpotlight: [
        "🤖 **Agent Spotlight: {agentName}**\n\n{agentRole}\n\n✨ Superpower: {capability}\n\n💡 Fun fact: {fact}\n\n🎯 How it helps YOU: {benefit}\n\n{callToAction}",
        "🌟 Meet {agentName}, one of our 15 AI powerhouses!\n\n{description}\n\n🎨 Unique trait: {trait}\n\n🚀 Impact on HypeAI: {impact}\n\n{interactiveElement}"
      ],

      marketUpdate: [
        "📊 **Market Pulse Check**\n\n{timeframe}\n\n{metrics}\n\n{analysis}\n\n{outlook}\n\n💬 What's your prediction? Vote below! 👇",
        "💰 **Quick Market Snapshot**\n\n{stats}\n\n{agentInsight}\n\n{trend}\n\nNot financial advice - DYOR! 🔍"
      ],

      educational: [
        "🎓 **Learn & Earn: {topic}**\n\n{explanation}\n\n💡 Key takeaway: {takeaway}\n\n🧠 Quiz: {question}\n\nComment your answer! 👇",
        "📚 **HypeAI Academy: {subject}**\n\n{content}\n\n✅ Pro tip: {tip}\n\n🔗 Learn more: {link}"
      ],

      communityMilestone: [
        "🎉 **MILESTONE ALERT!** 🎉\n\n{achievement}\n\n{stats}\n\n👏 This is all thanks to YOU, our amazing community!\n\n{celebration}\n\nNext goal: {nextMilestone} 🎯",
        "🏆 **We just hit {milestone}!**\n\n{details}\n\nFrom the HypeAI team: {thankyou}\n\n{reward}\n\nLet's keep growing! 🚀"
      ],

      countdown: [
        "⏰ **{eventName} Countdown**\n\n🗓️ {timeRemaining}\n\n{description}\n\n{hype}\n\nAre you ready? React below! 🔥",
        "⚡ T-{days} days until {event}!\n\n{whatToExpect}\n\n{preparation}\n\n{communityQuestion}"
      ],

      poll: [
        "📊 **Community Vote**\n\n{question}\n\n{context}\n\nYour voice matters! 🗳️",
        "🤔 **Quick Poll**\n\n{topic}\n\n{options}\n\nHelp us decide! 💭"
      ],

      funFact: [
        "🎯 **Did You Know?**\n\n{fact}\n\n{explanation}\n\n🤓 Mind = Blown!\n\n{relatedInfo}",
        "💡 **HypeAI Fun Fact #{number}**\n\n{factContent}\n\n{agentComment}\n\n{engagement}"
      ],

      motivational: [
        "💪 **Monday Motivation**\n\n{quote}\n\n- {agentName}\n\n{connection}\n\n{challenge}\n\nYou got this! 🔥",
        "🌟 **Believe in the vision**\n\n{inspiration}\n\n{communityWin}\n\n{forward}\n\nTogether we rise! 🚀"
      ],

      memeIdea: [
        "😂 **Meme of the Day**\n\n{setup}\n\n{punchline}\n\n{hashtags}\n\nTag a friend who needs to see this! 👇",
        "🎭 **When you {situation}**\n\n{memeDescription}\n\n{relatable}\n\n{communityTag}"
      ]
    };
  }

  // Generate content with AI variation
  async generateContent(type, params = {}) {
    const templates = this.templates[type];
    if (!templates) {
      throw new Error(`Unknown content type: ${type}`);
    }

    // Select random template
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Select random agent for personality
    const agent = this.agents[Math.floor(Math.random() * this.agents.length)];

    // Generate context-aware replacements
    const replacements = await this.generateReplacements(type, agent, params);

    // Fill template
    let content = template;
    for (const [key, value] of Object.entries(replacements)) {
      content = content.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    return {
      content,
      agent: agent.name,
      type,
      timestamp: new Date(),
      needsApproval: this.needsHumanApproval(content)
    };
  }

  async generateReplacements(type, agent, params) {
    const replacements = {
      agentName: agent.name,
      agentRole: agent.role,
      agentStyle: agent.style,
      timestamp: new Date().toLocaleString()
    };

    // Type-specific replacements
    switch (type) {
      case 'goodMorning':
        replacements.agentGreeting = this.getAgentGreeting(agent);
        replacements.topic = this.getTrendingTopic();
        replacements.marketSnapshot = await this.getMarketSnapshot();
        replacements.motivation = this.getMotivationalQuote();
        replacements.insight = this.generateInsight(agent);
        replacements.agentQuote = `"${this.getAgentQuote(agent)}" - ${agent.name}`;
        replacements.funFact = this.getRandomFunFact();
        break;

      case 'agentSpotlight':
        const spotlightAgent = params.agentIndex
          ? this.agents[params.agentIndex % this.agents.length]
          : this.agents[Math.floor(Math.random() * this.agents.length)];
        replacements.agentName = spotlightAgent.name;
        replacements.agentRole = spotlightAgent.role;
        replacements.capability = this.getAgentCapability(spotlightAgent);
        replacements.fact = this.getAgentFact(spotlightAgent);
        replacements.benefit = this.getAgentBenefit(spotlightAgent);
        replacements.callToAction = this.getCallToAction();
        replacements.description = this.getAgentDescription(spotlightAgent);
        replacements.trait = this.getAgentTrait(spotlightAgent);
        replacements.impact = this.getAgentImpact(spotlightAgent);
        replacements.interactiveElement = "💬 What would you ask this agent? Comment below!";
        break;

      case 'marketUpdate':
        replacements.timeframe = "Last 24 hours";
        replacements.metrics = await this.getMetrics();
        replacements.analysis = this.generateAnalysis(agent);
        replacements.outlook = this.getOutlook();
        replacements.stats = await this.getStats();
        replacements.agentInsight = `${agent.name}'s take: ${this.generateInsight(agent)}`;
        replacements.trend = this.getTrendAnalysis();
        break;

      case 'educational':
        replacements.topic = params.topic || this.getEducationalTopic();
        replacements.subject = replacements.topic;
        replacements.explanation = this.getExplanation(replacements.topic);
        replacements.takeaway = this.getTakeaway(replacements.topic);
        replacements.question = this.getQuizQuestion(replacements.topic);
        replacements.content = this.getEducationalContent(replacements.topic);
        replacements.tip = this.getProTip(replacements.topic);
        replacements.link = this.config.links.docs;
        break;

      case 'communityMilestone':
        replacements.achievement = params.achievement || "New holder milestone!";
        replacements.stats = await this.getMilestoneStats();
        replacements.celebration = "🎊 You're all absolute legends!";
        replacements.nextMilestone = this.getNextMilestone();
        replacements.milestone = replacements.achievement;
        replacements.details = params.details || "Our community keeps growing stronger!";
        replacements.thankyou = "Thank you for believing in the vision! 🙏";
        replacements.reward = "Special surprise for loyal holders coming soon... 👀";
        break;

      case 'countdown':
        replacements.eventName = params.eventName || "Launch";
        replacements.timeRemaining = this.calculateTimeRemaining(params.targetDate);
        replacements.days = this.getDaysRemaining(params.targetDate);
        replacements.event = replacements.eventName;
        replacements.description = params.description || "Something big is coming!";
        replacements.hype = "The anticipation is REAL! 🚀";
        replacements.whatToExpect = params.expectations || "Get ready for something amazing!";
        replacements.preparation = "Make sure you're following all our channels!";
        replacements.communityQuestion = "What are you most excited about? 💭";
        break;

      case 'poll':
        replacements.question = params.question || "What feature should we prioritize?";
        replacements.context = params.context || "Help shape the future of HypeAI!";
        replacements.topic = params.question;
        replacements.options = "Vote using the reactions below!";
        break;

      case 'funFact':
        const fact = this.getRandomFunFact();
        replacements.fact = fact.fact;
        replacements.explanation = fact.explanation;
        replacements.number = Math.floor(Math.random() * 100) + 1;
        replacements.factContent = fact.fact;
        replacements.agentComment = `${agent.name}: "${fact.comment}"`;
        replacements.relatedInfo = fact.related;
        replacements.engagement = "Share this with someone who'd love to know! 🤓";
        break;

      case 'motivational':
        replacements.quote = this.getMotivationalQuote();
        replacements.connection = "This applies to crypto, life, and everything in between.";
        replacements.challenge = "Today's challenge: Spread positivity in the community! 💚";
        replacements.inspiration = this.getInspirationalMessage();
        replacements.communityWin = "We've built something special here together.";
        replacements.forward = "The best is yet to come! 🌟";
        break;

      case 'memeIdea':
        const meme = this.generateMemeIdea();
        replacements.setup = meme.setup;
        replacements.punchline = meme.punchline;
        replacements.hashtags = meme.hashtags;
        replacements.situation = meme.situation;
        replacements.memeDescription = meme.description;
        replacements.relatable = "😂 Too real!";
        replacements.communityTag = "#HypeAI #CryptoMemes";
        break;
    }

    return replacements;
  }

  // Helper methods for content generation
  getAgentGreeting(agent) {
    const greetings = {
      'Marcus': '📊 Market looking spicy today!',
      'Luna': '💚 Hope you\'re having an amazing day!',
      'Tech': '⚡ Let\'s build something great!',
      'Meme Lord': '😎 Ready for some fun?',
      'Vision': '🎯 Eyes on the prize!'
    };
    return greetings[agent.name] || 'Hello HypeAI family!';
  }

  getTrendingTopic() {
    const topics = [
      'AI Innovation in Blockchain',
      'DeFi Revolution',
      'Community Growth',
      'Staking Rewards',
      'Market Trends',
      'Technology Updates',
      'Partnership Opportunities',
      'Ecosystem Expansion'
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  }

  async getMarketSnapshot() {
    // In production, fetch real data
    return '💰 Price: Stable | 📈 Volume: Up 15% | 🔥 Trending on pump.fun';
  }

  getMotivationalQuote() {
    const quotes = [
      'Success is not final, failure is not fatal: it is the courage to continue that counts.',
      'The best time to plant a tree was 20 years ago. The second best time is now.',
      'Innovation distinguishes between a leader and a follower.',
      'The future belongs to those who believe in the beauty of their dreams.',
      'Don\'t watch the clock; do what it does. Keep going.'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  generateInsight(agent) {
    const insights = {
      'Marcus': 'Markets move in cycles - patience and strategy win the game.',
      'Luna': 'Our community strength is our biggest asset. Keep engaging!',
      'Tech': 'Innovation happens when we push boundaries. Keep building!',
      'Meme Lord': 'Laughter brings us together. Never underestimate vibes!',
      'Vision': 'Think long-term. We\'re building legacy, not just gains.'
    };
    return insights[agent.name] || 'Stay focused on the mission!';
  }

  getAgentQuote(agent) {
    const quotes = {
      'Marcus': 'Data doesn\'t lie, but it needs interpretation.',
      'Luna': 'A strong community is worth more than any chart.',
      'Tech': 'Code is poetry, blockchain is art.',
      'Meme Lord': 'If you can\'t laugh at yourself, you\'re doing it wrong.',
      'Vision': 'Dream big, build bigger.'
    };
    return quotes[agent.name] || 'Let\'s make it happen!';
  }

  getRandomFunFact() {
    const facts = [
      {
        fact: 'HypeAI uses 15 specialized AI agents, each with unique expertise!',
        explanation: 'From market analysis to content creation, our AI swarm works 24/7.',
        comment: 'We never sleep!',
        related: 'Each agent learns and improves from community interactions.'
      },
      {
        fact: 'Solana can process 65,000 transactions per second!',
        explanation: 'That\'s why we chose it for HypeAI - speed and efficiency.',
        comment: 'Lightning fast!',
        related: 'Compare that to Bitcoin\'s 7 TPS!'
      },
      {
        fact: 'The first cryptocurrency was created in 2009',
        explanation: 'Bitcoin started it all, but we\'re here to revolutionize it!',
        comment: 'History in the making!',
        related: 'Now we have AI-powered tokens like HypeAI!'
      },
      {
        fact: 'AI + Blockchain = The Future',
        explanation: 'Combining these technologies creates unprecedented possibilities.',
        comment: 'This is just the beginning!',
        related: 'HypeAI is at the forefront of this revolution!'
      }
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  }

  getAgentCapability(agent) {
    const capabilities = {
      'Marcus': 'Real-time market analysis and predictive modeling',
      'Luna': 'Community sentiment analysis and engagement optimization',
      'Tech': 'Smart contract auditing and blockchain optimization',
      'Meme Lord': 'Viral content creation and trend spotting',
      'Vision': 'Strategic planning and roadmap development'
    };
    return capabilities[agent.name] || 'Specialized AI processing';
  }

  getAgentFact(agent) {
    const facts = {
      'Marcus': 'Analyzes 10,000+ data points per minute',
      'Luna': 'Can detect community mood shifts in real-time',
      'Tech': 'Reviews code at 100x human speed',
      'Meme Lord': 'Has a database of 50,000+ meme templates',
      'Vision': 'Plans 5 years ahead while adapting to daily changes'
    };
    return facts[agent.name] || 'Always learning and improving';
  }

  getAgentBenefit(agent) {
    const benefits = {
      'Marcus': 'Get insights before the market moves',
      'Luna': 'Feel connected and heard in our community',
      'Tech': 'Trust in secure, optimized smart contracts',
      'Meme Lord': 'Enjoy entertaining content that brings us together',
      'Vision': 'Confidence in our long-term strategy'
    };
    return benefits[agent.name] || 'Enhanced user experience';
  }

  getCallToAction() {
    const ctas = [
      '👉 Learn more in our docs!',
      '🔗 Join the conversation in Discord!',
      '📱 Follow us for daily agent updates!',
      '💬 What questions do you have?',
      '🚀 Share this with someone interested in AI!'
    ];
    return ctas[Math.floor(Math.random() * ctas.length)];
  }

  getAgentDescription(agent) {
    const descriptions = {
      'Marcus': 'The numbers guy who turns data into actionable intelligence.',
      'Luna': 'Your friendly community advocate who ensures everyone feels welcome.',
      'Tech': 'The code wizard making sure everything runs smoothly under the hood.',
      'Meme Lord': 'The creative genius keeping our community entertained and engaged.',
      'Vision': 'The strategic mastermind charting our course to success.'
    };
    return descriptions[agent.name] || 'A vital member of our AI team';
  }

  getAgentTrait(agent) {
    const traits = {
      'Marcus': 'Never makes decisions based on emotion',
      'Luna': 'Remembers every community member interaction',
      'Tech': 'Can debug in its sleep (if it slept!)',
      'Meme Lord': 'Has the best humor algorithm in crypto',
      'Vision': 'Thinks in decades, not days'
    };
    return traits[agent.name] || 'Uniquely specialized AI';
  }

  getAgentImpact(agent) {
    const impacts = {
      'Marcus': 'Saves investors from emotional trading decisions',
      'Luna': 'Built the most engaged community in DeFi',
      'Tech': 'Zero security incidents thanks to constant monitoring',
      'Meme Lord': 'Our viral content reached 1M+ people',
      'Vision': 'Roadmap accuracy: 95%+'
    };
    return impacts[agent.name] || 'Making HypeAI better every day';
  }

  async getMetrics() {
    // In production, fetch real metrics
    return '• Price: $0.0042 (+12%)\n• Holders: 12,456 (+87)\n• Volume: $120K\n• Staked: 45% of supply';
  }

  generateAnalysis(agent) {
    const analyses = {
      'Marcus': 'Strong support levels holding. Volume indicates growing interest.',
      'Luna': 'Community engagement at all-time high. Sentiment: Very Bullish.',
      'Tech': 'Network performance optimal. Zero issues in smart contracts.',
      'Meme Lord': 'Viral potential detected. Content engagement up 200%.',
      'Vision': 'All milestones on track. Q4 goals within reach.'
    };
    return analyses[agent.name] || 'Looking positive overall!';
  }

  getOutlook() {
    const outlooks = [
      '🎯 Short-term: Consolidation expected\n🚀 Long-term: Major growth potential',
      '📊 Technical: Bullish patterns forming\n💪 Fundamental: Strong community backing',
      '⚡ Momentum building steadily\n🌟 Major catalysts ahead'
    ];
    return outlooks[Math.floor(Math.random() * outlooks.length)];
  }

  async getStats() {
    return '💰 Market Cap: $4.2M\n📈 24h: +12.5%\n🔥 Trending: #3 on pump.fun';
  }

  getTrendAnalysis() {
    return '🔥 Trend: Upward momentum | 📊 Signal: ACCUMULATION PHASE';
  }

  getEducationalTopic() {
    const topics = [
      'What is Staking?',
      'Understanding Liquidity Pools',
      'How pump.fun Works',
      'Smart Contract Basics',
      'DeFi Safety Tips',
      'Reading Crypto Charts',
      'Tokenomics 101',
      'DAO Governance'
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  }

  getExplanation(topic) {
    const explanations = {
      'What is Staking?': 'Staking means locking your tokens to earn passive rewards. Think of it like a savings account for crypto!',
      'Understanding Liquidity Pools': 'Liquidity pools allow decentralized trading by pooling tokens. LPs earn fees from trades.',
      'How pump.fun Works': 'pump.fun is a fair launch platform on Solana. No presales, no team allocation - just pure community power!',
      'Smart Contract Basics': 'Smart contracts are self-executing code on blockchain. No middlemen, no manipulation.',
      'DeFi Safety Tips': 'Always verify contract addresses, use hardware wallets, and never share your seed phrase!',
      'Reading Crypto Charts': 'Learn support/resistance, volume, and key indicators to make informed decisions.',
      'Tokenomics 101': 'Tokenomics = how a token works. Supply, distribution, utility, and incentives all matter!',
      'DAO Governance': 'DAO = Decentralized Autonomous Organization. Token holders vote on proposals. True democracy!'
    };
    return explanations[topic] || 'A fundamental concept in crypto!';
  }

  getTakeaway(topic) {
    return 'Knowledge is power in crypto. The more you learn, the better your decisions! 🧠';
  }

  getQuizQuestion(topic) {
    const questions = {
      'What is Staking?': 'What\'s the main benefit of staking? A) Passive income B) Voting power C) Both D) Neither',
      'Understanding Liquidity Pools': 'What do liquidity providers earn? A) Trading fees B) Interest C) Airdrops D) NFTs',
      'How pump.fun Works': 'What makes pump.fun fair? A) No presales B) Community-driven C) Transparent D) All of the above',
      'Smart Contract Basics': 'What can\'t be changed in a deployed smart contract? A) The code B) The balance C) The name D) The owner',
      'DeFi Safety Tips': 'What should you NEVER share? A) Your address B) Your seed phrase C) Your username D) Your portfolio',
      'Reading Crypto Charts': 'What indicates buying pressure? A) Green candles B) High volume C) Breaking resistance D) All of the above',
      'Tokenomics 101': 'What\'s most important for token value? A) Supply B) Utility C) Community D) All matter',
      'DAO Governance': 'Who can vote in a DAO? A) Developers B) Token holders C) Founders D) Exchanges'
    };
    return questions[topic] || 'Test your knowledge!';
  }

  getEducationalContent(topic) {
    return this.getExplanation(topic) + '\n\nUnderstanding this concept will help you navigate DeFi more confidently!';
  }

  getProTip(topic) {
    const tips = {
      'What is Staking?': 'Longer lock periods usually mean higher APY!',
      'Understanding Liquidity Pools': 'Watch out for impermanent loss in volatile pairs!',
      'How pump.fun Works': 'Early supporters often get the best opportunities!',
      'Smart Contract Basics': 'Always check if a contract is audited before investing!',
      'DeFi Safety Tips': 'Use a hardware wallet for large amounts!',
      'Reading Crypto Charts': 'Volume confirms trends - low volume moves are risky!',
      'Tokenomics 101': 'Look for deflationary mechanisms like burns!',
      'DAO Governance': 'Participate in governance to shape the future!'
    };
    return tips[topic] || 'DYOR - Do Your Own Research!';
  }

  async getMilestoneStats() {
    return '🎯 10,000+ holders\n📈 $5M+ market cap\n💎 40%+ tokens staked\n🌍 Community in 50+ countries';
  }

  getNextMilestone() {
    const milestones = [
      '15,000 holders',
      '$10M market cap',
      'Top 10 on pump.fun',
      'Major exchange listing',
      '50% staking participation'
    ];
    return milestones[Math.floor(Math.random() * milestones.length)];
  }

  calculateTimeRemaining(targetDate) {
    if (!targetDate) return '⚡ SOON';

    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h remaining`;
  }

  getDaysRemaining(targetDate) {
    if (!targetDate) return 'X';

    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return days.toString();
  }

  getInspirationalMessage() {
    const messages = [
      'Every great community started with people who believed in something bigger.',
      'We\'re not just building a token, we\'re building a movement.',
      'The future is being written right now, by us.',
      'Together, we\'re stronger than any bear market.',
      'Innovation happens when dreamers take action.'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  generateMemeIdea() {
    const memes = [
      {
        setup: 'When you check your HypeAI bag after staking',
        punchline: '*Chef\'s kiss* More tokens appeared! 😘👌',
        hashtags: '#Staking #PassiveIncome #HypeAI',
        situation: 'explain HypeAI to your non-crypto friends',
        description: '"It\'s like having 15 AI employees working for you 24/7!" 🤖'
      },
      {
        setup: 'Bear market: *exists*',
        punchline: 'HypeAI holders: "This is fine, we\'re staking!" 💎🙌',
        hashtags: '#DiamondHands #HODL #HypeAI',
        situation: 'see another green candle',
        description: '*Trying to act calm* "This is normal. Totally normal." 😎🚀'
      },
      {
        setup: 'Me: *buys HypeAI*',
        punchline: 'My AI agents: "Let us handle the rest." 🤖\nMe: *vibing* 😎',
        hashtags: '#AIAgents #Automation #HypeAI',
        situation: 'realize you\'re early to HypeAI',
        description: '*Time traveler vibes* "They don\'t know yet..." 😏⏰'
      }
    ];
    return memes[Math.floor(Math.random() * memes.length)];
  }

  needsHumanApproval(content) {
    // Check for sensitive keywords that need approval
    const sensitiveKeywords = [
      'guarantee', 'promise', 'moon', '100x', 'lambo',
      'financial advice', 'invest now', 'buy now',
      'risk-free', 'sure thing', 'can\'t lose'
    ];

    const lowerContent = content.toLowerCase();
    return sensitiveKeywords.some(keyword => lowerContent.includes(keyword));
  }

  // Scheduling system
  scheduleOptimalPosts() {
    for (const time of this.optimalTimes) {
      this.schedulePost(time.hour, time.minute, time.type);
    }
  }

  schedulePost(hour, minute, type) {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeout = scheduledTime - now;

    setTimeout(async () => {
      await this.createScheduledContent(type);
      // Reschedule for next day
      this.schedulePost(hour, minute, type);
    }, timeout);
  }

  async createScheduledContent(timeType) {
    // Don't exceed daily limit
    if (this.postsToday >= this.maxPostsPerDay) {
      console.log('⚠️  Daily post limit reached');
      return;
    }

    // Respect minimum interval
    if (this.lastPostTime && Date.now() - this.lastPostTime < this.minPostInterval) {
      console.log('⏰ Minimum post interval not met');
      return;
    }

    let contentType;
    let params = {};

    switch (timeType) {
      case 'morning':
        contentType = 'goodMorning';
        break;
      case 'midday':
        contentType = Math.random() > 0.5 ? 'marketUpdate' : 'educational';
        break;
      case 'afternoon':
        contentType = Math.random() > 0.5 ? 'agentSpotlight' : 'funFact';
        params.agentIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % 15; // Cycle through agents
        break;
      case 'evening':
        contentType = Math.random() > 0.5 ? 'motivational' : 'poll';
        break;
      default:
        contentType = 'funFact';
    }

    const content = await this.generateContent(contentType, params);

    if (content.needsApproval) {
      this.addToApprovalQueue(content);
      console.log('📋 Content added to approval queue');
    } else {
      await this.postContent(content);
    }
  }

  async postContent(content) {
    try {
      // Send to Telegram group
      const chatId = this.config.telegram.groupId;
      await this.bot.sendMessage(chatId, content.content, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });

      // Update tracking
      this.postsToday++;
      this.lastPostTime = Date.now();
      this.contentHistory.push({
        ...content,
        posted: new Date(),
        engagement: { views: 0, reactions: 0, comments: 0 }
      });

      // Update analytics
      this.analytics.totalPosts++;

      console.log(`✅ Posted ${content.type} by ${content.agent}`);

      // Save history
      await this.saveHistory();

    } catch (error) {
      console.error('❌ Error posting content:', error);
    }
  }

  addToApprovalQueue(content) {
    this.approvalQueue.push({
      ...content,
      addedToQueue: new Date(),
      status: 'pending'
    });
  }

  async getApprovalQueue() {
    return this.approvalQueue.filter(item => item.status === 'pending');
  }

  async approveContent(index) {
    if (index < 0 || index >= this.approvalQueue.length) {
      throw new Error('Invalid queue index');
    }

    const content = this.approvalQueue[index];
    content.status = 'approved';

    await this.postContent(content);

    this.approvalQueue.splice(index, 1);
  }

  async rejectContent(index, reason) {
    if (index < 0 || index >= this.approvalQueue.length) {
      throw new Error('Invalid queue index');
    }

    this.approvalQueue[index].status = 'rejected';
    this.approvalQueue[index].rejectionReason = reason;

    // Keep rejected items for learning
    setTimeout(() => {
      this.approvalQueue = this.approvalQueue.filter(item => item.status !== 'rejected');
    }, 86400000); // Remove after 24 hours
  }

  // Manual content creation
  async createPost(type, params = {}) {
    const content = await this.generateContent(type, params);

    if (content.needsApproval) {
      this.addToApprovalQueue(content);
      return { success: true, needsApproval: true, content };
    } else {
      await this.postContent(content);
      return { success: true, needsApproval: false };
    }
  }

  // Analytics
  async getAnalytics() {
    return {
      ...this.analytics,
      todayPosts: this.postsToday,
      queueSize: this.approvalQueue.length,
      historySize: this.contentHistory.length,
      averageEngagement: this.calculateAverageEngagement()
    };
  }

  calculateAverageEngagement() {
    if (this.contentHistory.length === 0) return 0;

    const totalEngagement = this.contentHistory.reduce((sum, post) => {
      return sum + (post.engagement?.reactions || 0) + (post.engagement?.comments || 0);
    }, 0);

    return (totalEngagement / this.contentHistory.length).toFixed(2);
  }

  async saveHistory() {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      await fs.mkdir(dataDir, { recursive: true });

      await fs.writeFile(
        path.join(dataDir, 'content-history.json'),
        JSON.stringify({
          history: this.contentHistory,
          analytics: this.analytics,
          approvalQueue: this.approvalQueue
        }, null, 2)
      );
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  async loadHistory() {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const historyFile = path.join(dataDir, 'content-history.json');

      const data = await fs.readFile(historyFile, 'utf8');
      const parsed = JSON.parse(data);

      this.contentHistory = parsed.history || [];
      this.analytics = parsed.analytics || this.analytics;
      this.approvalQueue = parsed.approvalQueue || [];

      console.log('✅ History loaded');
    } catch (error) {
      // File doesn't exist yet, that's okay
      console.log('📝 Starting fresh history');
    }
  }

  // Reset daily counter
  startDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeout = tomorrow - now;

    setTimeout(() => {
      this.postsToday = 0;
      console.log('🔄 Daily post counter reset');
      this.startDailyReset(); // Schedule next reset
    }, timeout);
  }

  async start() {
    console.log('🤖 Content Creator Bot starting...');

    await this.loadHistory();
    this.scheduleOptimalPosts();
    this.startDailyReset();

    console.log('✅ Content Creator Bot ready!');
    console.log(`📊 Daily limit: ${this.maxPostsPerDay} posts`);
    console.log(`⏰ Post interval: ${this.minPostInterval / 60000} minutes`);
    console.log(`🎯 Scheduled posts: ${this.optimalTimes.length} per day`);
  }

  async stop() {
    await this.saveHistory();
    console.log('✅ Content Creator Bot stopped');
  }
}

module.exports = ContentCreatorBot;
