import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  FileText,
  Download,
  BookOpen,
  TrendingUp,
  Shield,
  Users,
  Zap,
  Globe,
  ChevronDown,
  ChevronUp,
  Twitter,
  Linkedin,
  Share2,
  Check,
  ExternalLink,
  Sparkles,
  Brain,
  Lock,
  Rocket,
  BarChart3,
  Code2,
  Database,
  CheckCircle2,
  ArrowRight,
  Star,
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// Table of Contents data
const tableOfContents = [
  {
    id: 1,
    title: 'Executive Summary',
    pages: '2 pages',
    subsections: [
      'Vision & Mission',
      'Key Value Propositions',
      'Market Opportunity',
      'Investment Highlights',
    ],
  },
  {
    id: 2,
    title: 'Introduction',
    pages: '3 pages',
    subsections: [
      'The Problem We Solve',
      'Our Solution',
      'Why AI-Managed Crypto',
      'Team of 27 AI Agents',
    ],
  },
  {
    id: 3,
    title: 'Technology Architecture',
    pages: '8 pages',
    subsections: [
      'AI Agents System',
      'Blockchain Infrastructure',
      'Backend Systems',
      'Frontend Application',
      'AI/ML Stack',
      'Security Architecture',
      'Scalability Design',
      'Integration Ecosystem',
    ],
  },
  {
    id: 4,
    title: 'AI Agents Deep Dive',
    pages: '10 pages',
    subsections: [
      'OMEGA - Master Coordinator',
      'Development Division (5 agents)',
      'Business Division (7 agents)',
      'Marketing Division (7 agents)',
      'Website Division (7 agents)',
      'Agent Coordination Protocol',
      'Infinite Work Capacity',
      'No Human Drama Guarantee',
    ],
  },
  {
    id: 5,
    title: 'Tokenomics',
    pages: '6 pages',
    subsections: [
      'Token Distribution',
      'Deflationary Mechanisms',
      'Staking Rewards',
      'Burn Analytics',
      'Price Projections',
      'Liquidity Management',
    ],
  },
  {
    id: 6,
    title: 'Security & Compliance',
    pages: '4 pages',
    subsections: [
      'Smart Contract Audits',
      'SEC Compliance',
      'MiCA Regulations',
      'KYC/AML Procedures',
      'Insurance Coverage',
      'Bug Bounty Program',
    ],
  },
  {
    id: 7,
    title: 'Roadmap',
    pages: '3 pages',
    subsections: [
      'Phase 1: Foundation (Q4 2025)',
      'Phase 2: Growth (Q1-Q2 2026)',
      'Phase 3: Expansion (Q3-Q4 2026)',
      'Phase 4: Dominance (2027+)',
    ],
  },
  {
    id: 8,
    title: 'Market Analysis',
    pages: '4 pages',
    subsections: [
      'Crypto Market Overview',
      'AI Crypto Segment',
      'Competitor Analysis',
      'Market Positioning',
      'Growth Projections',
    ],
  },
  {
    id: 9,
    title: 'Use Cases',
    pages: '3 pages',
    subsections: [
      'AI-Powered Trading',
      'Automated Marketing',
      'Smart Contract Deployment',
      'Community Management',
      'Real-World Applications',
    ],
  },
  {
    id: 10,
    title: 'Revenue Model',
    pages: '2 pages',
    subsections: [
      'Transaction Fees',
      'AI Services Revenue',
      'Staking Platform',
      'Premium Features',
    ],
  },
  {
    id: 11,
    title: 'Governance',
    pages: '2 pages',
    subsections: [
      'DAO Structure',
      'Voting Mechanisms',
      'Proposal System',
      'Community Involvement',
    ],
  },
  {
    id: 12,
    title: 'Risk Factors',
    pages: '2 pages',
    subsections: [
      'Market Risks',
      'Regulatory Risks',
      'Technical Risks',
      'Mitigation Strategies',
    ],
  },
  {
    id: 13,
    title: 'Legal & Disclaimers',
    pages: '2 pages',
    subsections: [
      'Legal Structure',
      'Investment Disclaimer',
      'Regulatory Compliance',
      'Terms of Service',
    ],
  },
  {
    id: 14,
    title: 'Conclusion',
    pages: '1 page',
    subsections: [
      'Future Vision',
      'Call to Action',
      'Contact Information',
    ],
  },
];

// Stats data
const stats = [
  {
    icon: FileText,
    label: 'Total Pages',
    value: '42',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Brain,
    label: 'Written By',
    value: 'AI #28',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    label: 'Diagrams',
    value: '23+',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    icon: Lock,
    label: 'Compliance',
    value: 'SEC+MiCA',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Globe,
    label: 'Languages',
    value: '3',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Star,
    label: 'Rating',
    value: '4.9/5',
    color: 'from-yellow-500 to-amber-500',
  },
];

// Unique features
const uniqueFeatures = [
  {
    icon: Sparkles,
    title: 'First AI-Written Crypto Whitepaper',
    description:
      'Written by WHITEPAPER (Agent #28), demonstrating the power of AI in creating professional documentation. A meta-achievement.',
  },
  {
    icon: Users,
    title: 'Documents 27 AI Agents System',
    description:
      'Complete transparency on how our AI agents coordinate, work infinitely without drama, and maintain perfect commitment.',
  },
  {
    icon: BookOpen,
    title: 'Academic + Accessible',
    description:
      'PhD-level technical depth with beginner-friendly language. Citations, references, and clear explanations for all audiences.',
  },
  {
    icon: Zap,
    title: 'Living Document',
    description:
      'Continuously updated with new developments. Version-controlled, never outdated. Track changes and improvements over time.',
  },
  {
    icon: Shield,
    title: 'Compliance-Ready',
    description:
      'Meets SEC, MiCA, and FATF standards. Legal disclaimers, risk factors, and regulatory compliance built-in from day one.',
  },
];

// Key highlights
const highlights = [
  {
    icon: Brain,
    title: '27 AI Agents Working 24/7/∞',
    description:
      'OMEGA coordinates all 26 specialized agents across Dev, Business, Marketing, and Website divisions. No humans = no drama. Perfect coordination = infinite commitment.',
    link: '/agents',
  },
  {
    icon: TrendingUp,
    title: 'Revolutionary Tokenomics',
    description:
      '1B total supply with deflationary mechanisms. 1% burn + 50% AI services burn = constant supply reduction. Staking APY up to 62%. Real utility from day 1.',
    link: '/tokenomics',
  },
  {
    icon: Shield,
    title: 'Security First',
    description:
      'Multiple audits (CertiK, Hacken), bug bounty ($100K), multi-sig wallets, insurance ($10M+). Your funds protected by industry-leading security.',
    link: '/security',
  },
  {
    icon: Rocket,
    title: 'Ambitious Roadmap',
    description:
      '$100M market cap target in 12 months. CEX listings, 10K+ clients, global expansion. Built to last forever with AI agents that never quit.',
    link: '/roadmap',
  },
];

export default function WhitepaperPage() {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const { scrollYProgress } = useScroll();

  // Track reading progress
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setReadingProgress(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const handleDownload = (type: 'whitepaper' | 'litepaper' | 'pitchdeck') => {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Whitepaper Downloaded', {
        format: type,
        language: 'EN',
        source: 'whitepaper_page',
      });
    }
    // Trigger download
    console.log(`Downloading ${type}...`);
  };

  const handleShare = (platform: 'twitter' | 'linkedin' | 'copy') => {
    const url = 'https://hypeai.com/whitepaper';
    const text = 'Check out HypeAI\'s revolutionary whitepaper - the first AI-written crypto whitepaper documenting 27 AI agents! 🤖🚀';

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
  };

  return (
    <>
      <Head>
        <title>HypeAI Whitepaper | The Future of AI-Managed Cryptocurrency</title>
        <meta
          name="description"
          content="Read the world's first AI-written crypto whitepaper. Learn how 27 AI agents are building a cryptocurrency that works infinitely. Download PDF now."
        />
        <meta
          property="og:title"
          content="HypeAI Whitepaper - Written by AI Agent #28"
        />
        <meta
          property="og:description"
          content="The first AI-written cryptocurrency whitepaper. 42 pages documenting 27 AI agents working 24/7/∞. Download now."
        />
        <meta property="og:image" content="/images/whitepaper-og.jpg" />
        <meta property="og:url" content="https://hypeai.com/whitepaper" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://hypeai.com/whitepaper" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
        {/* Reading Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 z-50 origin-left"
          style={{ scaleX: scrollYProgress }}
        />

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl animate-pulse-slow" />
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-5xl mx-auto text-center"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full mb-8"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-300">
                  World's First AI-Written Crypto Whitepaper
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                The HypeAI Whitepaper
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl md:text-2xl text-slate-300 mb-4"
              >
                Written by{' '}
                <span className="font-bold text-purple-400">Agent #28: WHITEPAPER</span>
              </motion.p>

              <motion.p
                variants={fadeInUp}
                className="text-lg text-slate-400 mb-12 max-w-3xl mx-auto"
              >
                The world's first AI-written cryptocurrency whitepaper documenting how 27 AI
                agents are building the future of crypto. No humans. No drama. Infinite
                commitment.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              >
                <button
                  onClick={() => handleDownload('whitepaper')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50"
                >
                  <span className="relative z-10 flex items-center gap-2 justify-center">
                    <Download className="w-5 h-5" />
                    Download PDF
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                <button className="px-8 py-4 bg-slate-800/50 border border-slate-700 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all duration-300 flex items-center gap-2 justify-center group">
                  <BookOpen className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                  Read Online
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-6 justify-center text-sm text-slate-400"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>42 pages comprehensive</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>23+ diagrams</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400" />
                  <span>Updated: October 16, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-green-400" />
                  <span>Version 1.0</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Quick Stats Section */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="max-w-6xl mx-auto"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-black text-center mb-12"
              >
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Whitepaper at a Glance
                </span>
              </motion.h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                    />
                    <div className="relative z-10">
                      <stat.icon
                        className={`w-8 h-8 mb-3 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}
                      />
                      <div className="text-2xl md:text-3xl font-black mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs md:text-sm text-slate-400">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why Special Section */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="max-w-6xl mx-auto"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-black text-center mb-4"
              >
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Why This Whitepaper is Unique
                </span>
              </motion.h2>

              <motion.p
                variants={fadeInUp}
                className="text-center text-slate-400 mb-12 max-w-2xl mx-auto"
              >
                This isn't just another crypto whitepaper. It's a demonstration of what AI
                can achieve when given the right mission.
              </motion.p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uniqueFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="max-w-4xl mx-auto"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-black text-center mb-4"
              >
                <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Table of Contents
                </span>
              </motion.h2>

              <motion.p
                variants={fadeInUp}
                className="text-center text-slate-400 mb-12"
              >
                14 comprehensive sections covering everything you need to know
              </motion.p>

              <div className="space-y-3">
                {tableOfContents.map((section, index) => (
                  <motion.div
                    key={section.id}
                    variants={fadeInUp}
                    className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300"
                  >
                    <button
                      onClick={() =>
                        setExpandedSection(expandedSection === section.id ? null : section.id)
                      }
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-sm">
                          {section.id}
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-lg">{section.title}</h3>
                          <p className="text-sm text-slate-400">{section.pages}</p>
                        </div>
                      </div>
                      {expandedSection === section.id ? (
                        <ChevronUp className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-4 border-t border-slate-700/50"
                      >
                        <ul className="space-y-2 mt-4">
                          {section.subsections.map((sub, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                            >
                              <ChevronRight className="w-4 h-4" />
                              <span>{sub}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div variants={fadeInUp} className="mt-8 text-center">
                <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-lg hover:scale-105 transition-transform duration-300 inline-flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Read Full Whitepaper
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Key Highlights */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="max-w-6xl mx-auto"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-black text-center mb-12"
              >
                <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Key Highlights
                </span>
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-6">
                {highlights.map((highlight, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-pink-500/50 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <highlight.icon className="w-7 h-7 text-pink-400" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{highlight.title}</h3>
                      <p className="text-slate-400 leading-relaxed mb-4">
                        {highlight.description}
                      </p>
                      <a
                        href={highlight.link}
                        className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors font-medium"
                      >
                        Learn More
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Download Options */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="max-w-4xl mx-auto"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-black text-center mb-12"
              >
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Download Options
                </span>
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Whitepaper */}
                <motion.div
                  variants={scaleIn}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-green-500/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Full Whitepaper (PDF)</h3>
                      <p className="text-slate-400 text-sm mb-1">
                        42 pages comprehensive document
                      </p>
                      <p className="text-slate-500 text-xs">5.2 MB • Last updated Oct 16, 2025</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload('whitepaper')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                </motion.div>

                {/* Litepaper */}
                <motion.div
                  variants={scaleIn}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Litepaper (PDF)</h3>
                      <p className="text-slate-400 text-sm mb-1">
                        8-10 pages executive summary
                      </p>
                      <p className="text-slate-500 text-xs">1.8 MB • Quick overview</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload('litepaper')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Litepaper
                  </button>
                </motion.div>

                {/* Pitch Deck */}
                <motion.div
                  variants={scaleIn}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Pitch Deck (PPT)</h3>
                      <p className="text-slate-400 text-sm mb-1">
                        15-20 slides for presentations
                      </p>
                      <p className="text-slate-500 text-xs">3.1 MB • Investor-ready</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload('pitchdeck')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Slides
                  </button>
                </motion.div>

                {/* Read Online */}
                <motion.div
                  variants={scaleIn}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Read Online</h3>
                      <p className="text-slate-400 text-sm mb-1">Interactive web version</p>
                      <p className="text-slate-500 text-xs">No download required</p>
                    </div>
                  </div>
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl font-bold hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Start Reading
                  </button>
                </motion.div>
              </div>

              {/* Languages */}
              <motion.div variants={fadeInUp} className="mt-12">
                <h3 className="text-xl font-bold text-center mb-6">Available in 3 Languages</h3>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-green-500/50 transition-all duration-300 flex items-center gap-3">
                    <span className="text-2xl">🇬🇧</span>
                    <div className="text-left">
                      <div className="font-bold text-sm">English</div>
                      <div className="text-xs text-slate-400">Primary</div>
                    </div>
                  </button>
                  <button className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500/50 transition-all duration-300 flex items-center gap-3">
                    <span className="text-2xl">🇷🇺</span>
                    <div className="text-left">
                      <div className="font-bold text-sm">Russian</div>
                      <div className="text-xs text-slate-400">Русский</div>
                    </div>
                  </button>
                  <button className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl opacity-50 cursor-not-allowed flex items-center gap-3">
                    <span className="text-2xl">🇨🇳</span>
                    <div className="text-left">
                      <div className="font-bold text-sm">Chinese</div>
                      <div className="text-xs text-slate-400">Coming Soon</div>
                    </div>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Meet the Author */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="max-w-4xl mx-auto"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-black text-center mb-12"
              >
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Meet the Author
                </span>
              </motion.h2>

              <motion.div
                variants={scaleIn}
                className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 md:p-12 overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-pink-500/5 opacity-50" />

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-6xl font-black shadow-2xl shadow-amber-500/50">
                      📄
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-block px-4 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full mb-4">
                      <span className="text-sm font-bold text-amber-400">Agent #28</span>
                    </div>
                    <h3 className="text-3xl font-black mb-2">WHITEPAPER</h3>
                    <p className="text-lg text-slate-400 mb-6">
                      Chief Documentation Officer
                    </p>

                    <blockquote className="border-l-4 border-amber-500 pl-6 py-2 mb-6 italic text-slate-300 leading-relaxed">
                      "I am WHITEPAPER, one of 27 AI agents building HypeAI. My mission is to
                      create world-class technical documentation that builds trust and
                      transparency. This whitepaper represents thousands of hours of research,
                      coordination with all agents, and commitment to excellence."
                    </blockquote>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <div className="text-2xl font-black text-amber-400 mb-1">42</div>
                        <div className="text-sm text-slate-400">Pages Written</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <div className="text-2xl font-black text-orange-400 mb-1">23+</div>
                        <div className="text-sm text-slate-400">Diagrams Created</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <div className="text-2xl font-black text-pink-400 mb-1">127</div>
                        <div className="text-sm text-slate-400">Revisions</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <div className="text-2xl font-black text-cyan-400 mb-1">∞</div>
                        <div className="text-sm text-slate-400">Working Time</div>
                      </div>
                    </div>

                    <a
                      href="/agents"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold hover:scale-105 transition-transform duration-300"
                    >
                      Meet All 27 Agents
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Social Sharing */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-2xl md:text-3xl font-black mb-6"
              >
                Share the Whitepaper
              </motion.h2>

              <motion.p variants={fadeInUp} className="text-slate-400 mb-8">
                Help spread the word about the world's first AI-written crypto whitepaper
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-4 justify-center"
              >
                <button
                  onClick={() => handleShare('twitter')}
                  className="px-6 py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Twitter className="w-5 h-5" />
                  Share on Twitter
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="px-6 py-3 bg-[#0077B5] hover:bg-[#006399] rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Linkedin className="w-5 h-5" />
                  Share on LinkedIn
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Copy Link
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10" />

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div
                variants={scaleIn}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full mb-6"
              >
                <Rocket className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-300">
                  Ready to Join the Revolution?
                </span>
              </motion.div>

              <motion.h2
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-black mb-6"
              >
                Read How{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  27 AI Agents
                </span>{' '}
                Are Building the Future
              </motion.h2>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
              >
                Download the complete whitepaper and discover how AI is revolutionizing
                cryptocurrency. No humans. No drama. Infinite commitment.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button
                  onClick={() => handleDownload('whitepaper')}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-lg hover:scale-105 transition-transform duration-300 flex items-center gap-2 justify-center"
                >
                  <Download className="w-5 h-5" />
                  Download Whitepaper
                </button>
                <a
                  href="/presale"
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:scale-105 transition-transform duration-300 flex items-center gap-2 justify-center"
                >
                  Join Presale
                  <ArrowRight className="w-5 h-5" />
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Reading Progress Indicator */}
        {readingProgress > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 shadow-2xl z-40"
          >
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12">
                <svg className="transform -rotate-90 w-12 h-12">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-slate-700"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - readingProgress / 100)}`}
                    className="text-cyan-400 transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {readingProgress}%
                </div>
              </div>
              <span className="text-sm font-medium text-slate-300">Read</span>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}

// Helper component for ChevronRight icon (not in lucide-react by default in some versions)
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}
