#!/usr/bin/env node

/**
 * Color Test Script - визуальная демонстрация цветов бренда
 */

import { HYPEAI_BRAND, BNB_CHAIN, COMBINED_PALETTE, COLOR_SCHEMES } from './brand-colors.js';

console.log('\n🎨 HYPEAI + BNB CHAIN BRAND COLORS\n');
console.log('━'.repeat(60));

console.log('\n📘 HYPEAI BRAND COLORS:');
console.log('  Primary:   ', HYPEAI_BRAND.primary, '  ⚡ Electric Cyan');
console.log('  Secondary: ', HYPEAI_BRAND.secondary, '  🔵 Blue');
console.log('  Accent:    ', HYPEAI_BRAND.accent, '  🌊 Dark Blue');

console.log('\n📗 BNB CHAIN COLORS:');
console.log('  Gold:      ', BNB_CHAIN.gold, '  🪙 BNB Gold');
console.log('  Yellow:    ', BNB_CHAIN.yellow, '  ⚡ BNB Yellow');
console.log('  Dark:      ', BNB_CHAIN.dark, '  🌑 BNB Dark');

console.log('\n🎨 GRADIENTS:');
console.log('  Cosmic:    ', HYPEAI_BRAND.gradient.cosmic);
console.log('  Energy:    ', HYPEAI_BRAND.gradient.energy);
console.log('  Hybrid:    ', BNB_CHAIN.gradient.hybrid);
console.log('  Energy Flow:', BNB_CHAIN.gradient.energyFlow);

console.log('\n🌈 COMBINED PALETTE:');
console.log('  Background:', COMBINED_PALETTE.background, '🌌 Dark Space');
console.log('  Text:      ', COMBINED_PALETTE.text, '  ⚪ White');
console.log('  HypeAI:    ', COMBINED_PALETTE.hypeai, '  ⚡ Primary');
console.log('  BNB:       ', COMBINED_PALETTE.bnb, '  🪙 Gold');

console.log('\n📊 COLOR SCHEMES:');
Object.entries(COLOR_SCHEMES).forEach(([name, scheme]) => {
  console.log(`\n  ${name.toUpperCase()}:`);
  console.log('    Primary:   ', scheme.primary);
  console.log('    Accent:    ', scheme.accent || scheme.secondary);
  console.log('    Background:', scheme.background);
});

console.log('\n━'.repeat(60));
console.log('✅ All colors loaded successfully!\n');
