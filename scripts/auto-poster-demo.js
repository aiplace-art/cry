#!/usr/bin/env node

/**
 * Auto-Poster DEMO Mode - Shows image generation without posting to Twitter
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load content bank
function loadContentBank() {
  const content = fs.readFileSync('./scripts/twitter-content/tweets-bank.json', 'utf8');
  return JSON.parse(content);
}

// Load posting history
function loadPostingHistory() {
  const historyPath = './data/project-coordination/posting-history.json';
  if (fs.existsSync(historyPath)) {
    return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  }
  return { posted: [], lastIndex: 0 };
}

// Get next tweet to post
function getNextTweet(contentBank, history) {
  const tweets = contentBank.tweets;
  const availableTweets = tweets.filter(tweet => !history.posted.includes(tweet.id));
  
  if (availableTweets.length === 0) {
    console.log('📝 All tweets posted! Using first tweet for demo...');
    return tweets[0];
  }
  
  return availableTweets[0];
}

// BNB Template mapping
const BNB_TEMPLATE_MAP = {
  technical: './scripts/twitter-media/bnb-templates/technical.png',
  features: './scripts/twitter-media/bnb-templates/features.png',
  community: './scripts/twitter-media/bnb-templates/community.png',
  education: './scripts/twitter-media/bnb-templates/education.png',
  launch: './scripts/twitter-media/bnb-templates/launch.png',
  engagement: './scripts/twitter-media/bnb-templates/engagement.png',
  viral: './scripts/twitter-media/bnb-templates/viral.png',
  introduction: './scripts/twitter-media/bnb-templates/introduction.png'
};

// Helper functions
function extractTitle(text) {
  const firstLine = text.split('\n')[0];
  return firstLine.substring(0, 50).trim();
}

function extractService(tweetData) {
  const serviceMap = {
    technical: { name: 'AI Development', icon: '🧠', description: 'Build intelligent systems with 42 AI agents', price: 'From $499/mo' },
    features: { name: 'Smart Automation', icon: '⚡', description: 'Automate workflows with AI-powered agents', price: 'From $299/mo' },
    community: { name: 'AI Community', icon: '👥', description: 'Join our thriving AI community on BNB Chain', price: 'Free' }
  };
  return serviceMap[tweetData.category] || {
    name: 'HypeAI Services',
    icon: '🤖',
    description: 'Professional AI services on BNB Chain',
    price: 'Contact us'
  };
}

function extractTopText(text) {
  const lines = text.split('\n').filter(line => line.trim());
  return lines[0] || 'HYPEAI';
}

// Generate image for tweet
async function generateImage(tweetData) {
  try {
    console.log(`   🎨 Generating professional image for category: ${tweetData.category}`);
    
    const { default: ProfessionalImageGenerator } = await import('./twitter-media/professional-image-generator.js');
    const generator = new ProfessionalImageGenerator();
    
    // Map category to style
    const styleMap = {
      introduction: 'minimalist',
      features: 'serviceShowcase',
      community: 'techGradient',
      education: 'dataViz',
      launch: 'techGradient',
      technical: 'serviceShowcase',
      engagement: 'meme',
      viral: 'meme'
    };
    
    const style = styleMap[tweetData.category] || 'minimalist';
    let mediaBuffer = null;
    
    // Generate based on style
    switch(style) {
      case 'minimalist':
        mediaBuffer = await generator.generateMinimalist({
          title: extractTitle(tweetData.text),
          subtitle: 'AI-Powered DeFi on BNB Chain'
        });
        break;
      
      case 'techGradient':
        mediaBuffer = await generator.generateTechGradient({
          title: extractTitle(tweetData.text),
          subtitle: 'The Future of AI on BNB Chain'
        });
        break;
      
      case 'serviceShowcase':
        const service = extractService(tweetData);
        mediaBuffer = await generator.generateServiceShowcase(service);
        break;
      
      case 'meme':
        mediaBuffer = await generator.generateMeme({
          topText: extractTopText(tweetData.text),
          bottomText: 'POWERED BY BNB CHAIN'
        });
        break;
      
      case 'dataViz':
        mediaBuffer = await generator.generateDataViz({
          title: extractTitle(tweetData.text),
          stats: [
            { label: 'AI Agents', value: '42' },
            { label: 'Services', value: '15+' },
            { label: 'On BNB Chain', value: '✓' }
          ]
        });
        break;
    }
    
    if (mediaBuffer) {
      const tempPath = `/tmp/hypeai-demo-${tweetData.category}-${Date.now()}.png`;
      fs.writeFileSync(tempPath, mediaBuffer);
      console.log(`   ✅ Professional image generated: ${style}`);
      console.log(`   📁 Saved to: ${tempPath}`);
      return tempPath;
    }
    
  } catch (genError) {
    console.log(`   ⚠️  Generation failed: ${genError.message}`);
  }
  
  // Fallback to BNB template
  const templatePath = BNB_TEMPLATE_MAP[tweetData.category];
  if (templatePath && fs.existsSync(templatePath)) {
    console.log(`   🎨 Using BNB Chain template: ${tweetData.category}`);
    return templatePath;
  }
  
  return null;
}

// Main demo
async function demo() {
  console.log('🎨 AUTO-POSTER DEMO MODE');
  console.log('━'.repeat(60));
  console.log(`⏰ Time: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`);
  console.log('━'.repeat(60) + '\n');
  
  try {
    const contentBank = loadContentBank();
    const history = loadPostingHistory();
    
    console.log(`📊 Content Bank Status:`);
    console.log(`   Total tweets: ${contentBank.meta.total_tweets}`);
    console.log(`   Posted: ${history.posted.length}`);
    console.log(`   Remaining: ${contentBank.meta.total_tweets - history.posted.length}\n`);
    
    // Get next tweet
    const nextTweet = getNextTweet(contentBank, history);
    
    console.log(`📤 Next Tweet #${nextTweet.id}:`);
    console.log(`   Category: ${nextTweet.category}`);
    console.log(`   Text: ${nextTweet.text.substring(0, 100)}...\n`);
    
    // Generate image
    const imagePath = await generateImage(nextTweet);
    
    if (imagePath) {
      const stats = fs.statSync(imagePath);
      console.log(`\n✅ SUCCESS!`);
      console.log(`   Image: ${imagePath}`);
      console.log(`   Size: ${(stats.size / 1024).toFixed(1)}KB`);
      console.log(`\n📷 Preview image:`);
      console.log(`   open ${imagePath}\n`);
      
      console.log(`🐦 Would post to Twitter:`);
      console.log(`   Text: ${nextTweet.text}`);
      console.log(`   Image: ✅ Attached`);
      console.log(`   Hashtags: ${nextTweet.hashtags.join(' ')}\n`);
    } else {
      console.log(`\n❌ No image generated`);
    }
    
  } catch (error) {
    console.error('\n❌ Demo error:', error.message);
  }
  
  console.log('━'.repeat(60));
  console.log('🎉 DEMO FINISHED');
  console.log('━'.repeat(60) + '\n');
  console.log('💡 To post to Twitter for real:');
  console.log('   1. Add Twitter API credentials to .env.marketing');
  console.log('   2. Run: node scripts/auto-poster.js\n');
}

demo().catch(console.error);
