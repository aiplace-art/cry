#!/usr/bin/env node

/**
 * BNB Chain Image Generator
 * Создает картинки в стиле BNB Chain для Twitter
 */

import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';

const OUTPUT_DIR = './twitter-images/generated';
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🎨 BNB CHAIN IMAGE GENERATOR STARTED');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// BNB Chain фирменные цвета (с официального сайта bnbchain.org)
const BNB_COLORS = {
  // Официальные цвета BNB Chain
  darkBg: '#14151A',      // Primary Dark Background (official)
  accentYellow: '#FFE900', // Accent Yellow (official)
  lightText: '#C4C5CB',   // Light Text (official)
  darkText: '#181A1E',    // Dark Text (official)

  // Дополнительные
  gold: '#F3BA2F',        // BNB Gold (legacy)
  white: '#FFFFFF',       // White
  black: '#000000'        // Pure Black
};

// Шаблоны изображений
const IMAGE_TEMPLATES = {
  announcement: {
    name: 'BNB Announcement',
    size: { width: 1200, height: 675 },
    style: 'Bold header with gradient background'
  },
  stats: {
    name: 'BNB Stats',
    size: { width: 1200, height: 675 },
    style: 'Clean infographic with metrics'
  },
  community: {
    name: 'Community Highlight',
    size: { width: 1200, height: 675 },
    style: 'Warm, welcoming design'
  },
  technical: {
    name: 'Technical Update',
    size: { width: 1200, height: 675 },
    style: 'Professional, tech-focused'
  }
};

/**
 * Создает gradient в стиле BNB (ОФИЦИАЛЬНЫЙ)
 */
function createBNBGradient(ctx, width, height, type = 'primary') {
  const gradient = ctx.createLinearGradient(0, 0, width, height);

  if (type === 'primary') {
    // Официальный gradient: Yellow → Green
    gradient.addColorStop(0, BNB_COLORS.accentYellow); // #FFE900
    gradient.addColorStop(1, '#00FF7F');                 // Green (from official site)
  } else if (type === 'dark') {
    // Dark background gradient
    gradient.addColorStop(0, BNB_COLORS.darkBg);   // #14151A
    gradient.addColorStop(1, BNB_COLORS.darkText); // #181A1E
  } else if (type === 'accent') {
    // Accent gradient
    gradient.addColorStop(0, BNB_COLORS.accentYellow); // #FFE900
    gradient.addColorStop(1, BNB_COLORS.gold);         // #F3BA2F
  }

  return gradient;
}

/**
 * Добавляет BNB logo (ОФИЦИАЛЬНЫЙ СТИЛЬ)
 */
function addBNBLogo(ctx, x, y, size = 80) {
  // Фон для лого (dark background)
  ctx.fillStyle = BNB_COLORS.darkBg; // #14151A (official)
  ctx.beginPath();
  ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
  ctx.fill();

  // Обводка (accent yellow)
  ctx.strokeStyle = BNB_COLORS.accentYellow; // #FFE900
  ctx.lineWidth = 3;
  ctx.stroke();

  // Текст "BNB" (accent yellow)
  ctx.fillStyle = BNB_COLORS.accentYellow; // #FFE900 (official)
  ctx.font = `bold ${size * 0.35}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BNB', x + size/2, y + size/2);
}

/**
 * Добавляет декоративные элементы
 */
function addDecorativeElements(ctx, width, height) {
  ctx.globalAlpha = 0.1;

  // Геометрические формы
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 100 + 50;

    ctx.strokeStyle = BNB_COLORS.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();

    if (i % 2 === 0) {
      // Круги
      ctx.arc(x, y, size, 0, Math.PI * 2);
    } else {
      // Квадраты
      ctx.rect(x, y, size, size);
    }

    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;
}

/**
 * Генерирует изображение объявления
 */
async function generateAnnouncement(title, subtitle) {
  console.log('📢 Generating announcement image...');

  const canvas = createCanvas(1200, 675);
  const ctx = canvas.getContext('2d');

  // Gradient фон
  const gradient = createBNBGradient(ctx, 1200, 675, 'dark');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 675);

  // Золотая полоса
  const goldGradient = createBNBGradient(ctx, 1200, 200, 'primary');
  ctx.fillStyle = goldGradient;
  ctx.fillRect(0, 200, 1200, 200);

  // Декоративные элементы
  addDecorativeElements(ctx, 1200, 675);

  // BNB Logo
  addBNBLogo(ctx, 80, 80, 100);

  // Заголовок
  ctx.fillStyle = BNB_COLORS.white;
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 600, 300);

  // Подзаголовок
  ctx.fillStyle = BNB_COLORS.black;
  ctx.font = '48px sans-serif';
  ctx.fillText(subtitle, 600, 380);

  // Footer
  ctx.fillStyle = BNB_COLORS.white;
  ctx.font = '32px sans-serif';
  ctx.fillText('Built on BNB Chain', 600, 580);

  // Сохранение
  const filename = `${OUTPUT_DIR}/bnb-announcement-${Date.now()}.png`;
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);

  console.log(`✅ Generated: ${filename}`);
  return filename;
}

/**
 * Генерирует изображение со статистикой
 */
async function generateStats(stats) {
  console.log('📊 Generating stats image...');

  const canvas = createCanvas(1200, 675);
  const ctx = canvas.getContext('2d');

  // Светлый фон
  ctx.fillStyle = BNB_COLORS.lightGray;
  ctx.fillRect(0, 0, 1200, 675);

  // Темная шапка
  const darkGradient = createBNBGradient(ctx, 1200, 150, 'dark');
  ctx.fillStyle = darkGradient;
  ctx.fillRect(0, 0, 1200, 150);

  // BNB Logo
  addBNBLogo(ctx, 50, 35, 80);

  // Заголовок
  ctx.fillStyle = BNB_COLORS.gold;
  ctx.font = 'bold 56px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('BNB Chain Stats', 180, 95);

  // Статистика (4 блока)
  const statBlocks = Object.entries(stats).slice(0, 4);
  const blockWidth = 250;
  const startX = 100;
  const startY = 250;

  statBlocks.forEach(([label, value], index) => {
    const x = startX + (index % 2) * 550;
    const y = startY + Math.floor(index / 2) * 200;

    // Блок с градиентом
    const blockGradient = createBNBGradient(ctx, blockWidth, 150, 'primary');
    ctx.fillStyle = blockGradient;
    ctx.fillRect(x, y, blockWidth, 150);

    // Значение
    ctx.fillStyle = BNB_COLORS.black;
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(value, x + blockWidth/2, y + 60);

    // Лейбл
    ctx.fillStyle = BNB_COLORS.darkGray;
    ctx.font = '24px sans-serif';
    ctx.fillText(label, x + blockWidth/2, y + 110);
  });

  // Footer
  ctx.fillStyle = BNB_COLORS.darkGray;
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('#BuildOnBNB', 600, 630);

  // Сохранение
  const filename = `${OUTPUT_DIR}/bnb-stats-${Date.now()}.png`;
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);

  console.log(`✅ Generated: ${filename}`);
  return filename;
}

/**
 * Генерирует community изображение
 */
async function generateCommunity(message) {
  console.log('🤝 Generating community image...');

  const canvas = createCanvas(1200, 675);
  const ctx = canvas.getContext('2d');

  // Gradient фон (accent)
  const gradient = createBNBGradient(ctx, 1200, 675, 'accent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 675);

  // Декоративные круги
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 1200;
    const y = Math.random() * 675;
    const size = Math.random() * 150 + 50;

    ctx.fillStyle = BNB_COLORS.white;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // BNB Logo
  addBNBLogo(ctx, 60, 60, 100);

  // Сообщение
  ctx.fillStyle = BNB_COLORS.white;
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 20;

  // Разбиваем на строки
  const words = message.split(' ');
  let line = '';
  let y = 300;

  words.forEach((word, index) => {
    const testLine = line + word + ' ';
    if (ctx.measureText(testLine).width > 1000 && line !== '') {
      ctx.fillText(line, 600, y);
      line = word + ' ';
      y += 80;
    } else {
      line = testLine;
    }
  });
  ctx.fillText(line, 600, y);

  // Footer
  ctx.shadowBlur = 0;
  ctx.font = '36px sans-serif';
  ctx.fillText('BNB Chain Community', 600, 600);

  // Сохранение
  const filename = `${OUTPUT_DIR}/bnb-community-${Date.now()}.png`;
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);

  console.log(`✅ Generated: ${filename}`);
  return filename;
}

/**
 * Генерирует technical изображение
 */
async function generateTechnical(title, features) {
  console.log('⚙️ Generating technical image...');

  const canvas = createCanvas(1200, 675);
  const ctx = canvas.getContext('2d');

  // Черный фон
  ctx.fillStyle = BNB_COLORS.black;
  ctx.fillRect(0, 0, 1200, 675);

  // Сетка (tech style)
  ctx.strokeStyle = BNB_COLORS.darkGray;
  ctx.lineWidth = 1;
  for (let i = 0; i < 1200; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 675);
    ctx.stroke();
  }
  for (let i = 0; i < 675; i += 50) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(1200, i);
    ctx.stroke();
  }

  // Золотая рамка
  ctx.strokeStyle = BNB_COLORS.gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 1120, 595);

  // BNB Logo
  addBNBLogo(ctx, 80, 80, 80);

  // Заголовок
  const titleGradient = createBNBGradient(ctx, 800, 60, 'primary');
  ctx.fillStyle = titleGradient;
  ctx.font = 'bold 56px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, 200, 130);

  // Фичи
  ctx.fillStyle = BNB_COLORS.white;
  ctx.font = '36px sans-serif';
  let y = 230;

  features.forEach((feature, index) => {
    // Чекбокс
    ctx.fillStyle = BNB_COLORS.gold;
    ctx.fillRect(100, y - 25, 30, 30);

    ctx.fillStyle = BNB_COLORS.black;
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓', 115, y);

    // Текст
    ctx.fillStyle = BNB_COLORS.white;
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(feature, 160, y);

    y += 80;
  });

  // Footer
  ctx.fillStyle = BNB_COLORS.gold;
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Built on BNB Chain', 1120, 615);

  // Сохранение
  const filename = `${OUTPUT_DIR}/bnb-technical-${Date.now()}.png`;
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);

  console.log(`✅ Generated: ${filename}`);
  return filename;
}

// Главная функция
async function main() {
  console.log('🎨 Generating BNB Chain images...\n');

  try {
    // Генерация разных типов изображений
    await generateAnnouncement('HypeAI Launch', 'On BNB Chain');
    await generateStats({
      'TVL': '$2.5B+',
      'Projects': '1000+',
      'Tx/Day': '5M+',
      'Block Time': '3 sec'
    });
    await generateCommunity('Build the Future on BNB Chain');
    await generateTechnical('BNB Chain Features', [
      'Fast 3-second blocks',
      'Sub-cent transaction fees',
      'EVM Compatible',
      'Solidity Support',
      'Large Ecosystem'
    ]);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ IMAGE GENERATION COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📁 Images saved to: ${OUTPUT_DIR}/`);
    console.log('\n✨ All images use BNB Chain branding!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Запуск
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateAnnouncement, generateStats, generateCommunity, generateTechnical };
