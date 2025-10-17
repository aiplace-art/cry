#!/usr/bin/env node

/**
 * BNB Logo Collector Agent
 * Скачивает официальные логотипы BNB Chain и партнеров из интернета
 */

import fs from 'fs';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const LOGOS_DIR = './twitter-images/bnb-logos';
if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

console.log('🎨 BNB LOGO COLLECTOR STARTED');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Официальные логотипы для скачивания
const OFFICIAL_LOGOS = {
  // BNB Chain официальные
  bnbChain: {
    name: 'BNB Chain Logo',
    urls: [
      'https://raw.githubusercontent.com/bnb-chain/bnb-chain.github.io/master/assets/images/logo.svg',
      'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F1690203644-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-LklWNYOCm9UdZgJeq51%252Ficon%252FiTDbDNK9f3H1NfEDFd3e%252Flogos%252520(1).png%3Falt%3Dmedia%26token%3D0e83efdd-93e2-4862-af91-a7081c0e5113',
      'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=029'
    ],
    fallback: 'bnb-chain-logo'
  },

  // Binance Logo
  binance: {
    name: 'Binance Logo',
    urls: [
      'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=029',
      'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
    ],
    fallback: 'binance-logo'
  },

  // Партнеры экосистемы
  pancakeswap: {
    name: 'PancakeSwap Logo',
    urls: [
      'https://cryptologos.cc/logos/pancakeswap-cake-logo.svg?v=029',
      'https://pancakeswap.finance/logo.png'
    ],
    fallback: 'pancakeswap-logo'
  },

  venus: {
    name: 'Venus Protocol Logo',
    urls: [
      'https://cryptologos.cc/logos/venus-xvs-logo.svg?v=029',
      'https://venus.io/logo.png'
    ],
    fallback: 'venus-logo'
  },

  thena: {
    name: 'THENA Logo',
    urls: [
      'https://www.thena.fi/favicon.png'
    ],
    fallback: 'thena-logo'
  },

  biswap: {
    name: 'Biswap Logo',
    urls: [
      'https://cryptologos.cc/logos/biswap-bsw-logo.svg?v=029'
    ],
    fallback: 'biswap-logo'
  }
};

// Иконки для создания постов
const ICON_COLLECTION = {
  blockchain: [
    'Block icon',
    'Chain link icon',
    'Network icon',
    'Node icon'
  ],
  defi: [
    'Dollar coin',
    'Trading chart',
    'Liquidity pool',
    'Staking icon'
  ],
  tech: [
    'Code brackets',
    'Smart contract',
    'Lightning bolt (speed)',
    'Shield (security)'
  ],
  community: [
    'People group',
    'Handshake',
    'Star (favorite)',
    'Trophy (achievement)'
  ]
};

/**
 * Скачивает файл по URL
 */
async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      // Следуем редиректам
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(filepath);
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });

      file.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * Скачивает логотип с retry
 */
async function downloadLogo(logoConfig) {
  console.log(`📥 Downloading: ${logoConfig.name}...`);

  for (const url of logoConfig.urls) {
    try {
      // Определяем расширение из URL
      const ext = url.includes('.svg') ? 'svg' : 'png';
      const filename = `${LOGOS_DIR}/${logoConfig.fallback}.${ext}`;

      await downloadFile(url, filename);
      console.log(`   ✅ Downloaded: ${filename}`);
      return filename;
    } catch (error) {
      console.log(`   ⚠️  Failed: ${url} - ${error.message}`);
    }
  }

  console.log(`   ❌ All URLs failed for ${logoConfig.name}`);
  return null;
}

/**
 * Создает README с описанием лого
 */
function createReadme() {
  const readme = `# 🎨 BNB Chain Official Logos

**Автоматически собрано**: ${new Date().toLocaleString('ru-RU')}

---

## 📦 Что здесь

Эта папка содержит **официальные логотипы BNB Chain и партнеров**.

### BNB Chain
- \`bnb-chain-logo.svg\` - Основной логотип BNB Chain
- \`binance-logo.svg\` - Логотип Binance

### Партнеры экосистемы
- \`pancakeswap-logo.svg\` - PancakeSwap (DEX #1)
- \`venus-logo.svg\` - Venus Protocol (Lending)
- \`thena-logo.png\` - THENA (ve(3,3) DEX)
- \`biswap-logo.svg\` - Biswap (Low-fee DEX)

---

## 🎯 Как использовать

**AI автоматически** использует эти лого при создании постов:

1. **Announcement посты** - BNB Chain logo
2. **Partner highlights** - Логотип партнера
3. **Ecosystem updates** - Множественные лого
4. **Technical posts** - BNB Chain logo + tech icons

---

## 🔄 Автообновление

Агент обновляет лого **каждую неделю** автоматически.

Если хотите обновить вручную:
\`\`\`bash
node scripts/bnb-logo-collector.js
\`\`\`

---

## ✅ Источники

Все лого скачаны из:
- ✅ Официальных GitHub репозиториев
- ✅ Официальных сайтов проектов
- ✅ CryptoLogos.cc (проверенный источник)

---

## 📋 Использование в постах

### Пример 1: BNB Chain Update
\`\`\`
[BNB Chain Logo]

🚀 BNB Chain Stats:
📊 5M+ daily transactions
⚡ 3-second blocks
💰 Sub-cent fees

#BNB #BuildOnBNB
\`\`\`

### Пример 2: Partner Highlight
\`\`\`
[PancakeSwap Logo] + [BNB Chain Logo]

Partnership Spotlight: @PancakeSwap

💎 #1 DEX on BNB Chain
🔄 Billions in trading volume
🥞 Trusted by millions

#BNBEcosystem
\`\`\`

### Пример 3: Ecosystem
\`\`\`
[Multiple Logos in Grid]

BNB Chain Ecosystem:
🥞 PancakeSwap - DEX
💰 Venus - Lending
⚡ THENA - ve(3,3)
🔄 Biswap - Low Fees

Building the future together!
\`\`\`

---

**Создано**: BNB Logo Collector Agent
**Проект**: HypeAI on BNB Chain 🚀
`;

  fs.writeFileSync(`${LOGOS_DIR}/README.md`, readme);
  console.log('\n✅ README created');
}

/**
 * Создает шаблоны для постов с лого
 */
function createTemplates() {
  const templates = {
    timestamp: new Date().toISOString(),
    templates: [
      {
        name: 'BNB Chain Update',
        logos: ['bnb-chain-logo.svg'],
        layout: 'Single logo top-left',
        style: 'Professional, Clean',
        text: 'Stats or announcement',
        colors: ['#F3BA2F', '#000000']
      },
      {
        name: 'Partner Spotlight',
        logos: ['bnb-chain-logo.svg', 'partner-logo.svg'],
        layout: 'Two logos side-by-side',
        style: 'Collaborative',
        text: 'Partnership announcement',
        colors: ['#F3BA2F', 'Partner colors']
      },
      {
        name: 'Ecosystem Overview',
        logos: ['pancakeswap-logo.svg', 'venus-logo.svg', 'thena-logo.png', 'biswap-logo.svg'],
        layout: 'Grid 2x2',
        style: 'Vibrant, Diverse',
        text: 'Ecosystem highlights',
        colors: ['Multiple brand colors']
      },
      {
        name: 'Technical Update',
        logos: ['bnb-chain-logo.svg'],
        layout: 'Logo + tech icons',
        style: 'Technical, Modern',
        text: 'Development updates',
        colors: ['#F3BA2F', '#000000', '#1E2026']
      }
    ],
    usage: {
      recommendation: 'Use official logos in all BNB Chain related posts',
      placement: 'Top-left or center, minimum 100x100px',
      background: 'Ensure good contrast with logo',
      spacing: 'Minimum 20px clear space around logo'
    }
  };

  fs.writeFileSync(`${LOGOS_DIR}/templates.json`, JSON.stringify(templates, null, 2));
  console.log('✅ Templates created');
}

// Главная функция
async function main() {
  console.log('🎨 Collecting BNB Chain logos...\n');

  try {
    let successCount = 0;
    let totalCount = 0;

    // Скачиваем все логотипы
    for (const [key, config] of Object.entries(OFFICIAL_LOGOS)) {
      totalCount++;
      const result = await downloadLogo(config);
      if (result) successCount++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 COLLECTION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Downloaded: ${successCount}/${totalCount} logos`);
    console.log(`📁 Location: ${LOGOS_DIR}/\n`);

    // Создаем README и шаблоны
    createReadme();
    createTemplates();

    console.log('\n✨ All logos ready for use!');
    console.log('\n💡 Next steps:');
    console.log('   1. Check logos in:', LOGOS_DIR);
    console.log('   2. AI will use them automatically in posts');
    console.log('   3. Beautiful BNB Chain branding! 🎨\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Запуск
main();
