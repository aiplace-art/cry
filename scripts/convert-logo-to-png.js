#!/usr/bin/env node

/**
 * Convert SVG logos to PNG for Twitter
 * Twitter Requirements:
 * - Profile Picture: 400x400px minimum (recommended: 400x400)
 * - Banner: 1500x500px
 */

const fs = require('fs').promises;
const { createCanvas, loadImage } = require('canvas');

async function convertSvgToPng(svgPath, outputPath, width, height) {
    try {
        console.log(`🖼️  Converting ${svgPath} to PNG...`);

        // Read SVG
        const svgContent = await fs.readFile(svgPath, 'utf-8');

        // Create canvas
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Create data URL from SVG
        const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

        // Load and draw image
        const img = await loadImage(svgDataUrl);

        // Fill transparent background (Twitter uses white)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw centered
        const scale = Math.min(width / img.width, height / img.height);
        const x = (width - img.width * scale) / 2;
        const y = (height - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Save PNG
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(outputPath, buffer);

        console.log(`✅ Created: ${outputPath} (${width}x${height})`);

        return outputPath;
    } catch (error) {
        console.error(`❌ Error converting ${svgPath}:`, error.message);
        throw error;
    }
}

async function main() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎨 Converting HypeAI Logos to PNG');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // Twitter Profile Picture (400x400)
    await convertSvgToPng(
        'website/logo-icon-only.svg',
        'website/logo-twitter-profile.png',
        400,
        400
    );

    // Twitter Profile Picture (larger, 1024x1024 for better quality)
    await convertSvgToPng(
        'website/logo-icon-only.svg',
        'website/logo-twitter-profile-hd.png',
        1024,
        1024
    );

    // Twitter Banner (1500x500)
    await convertSvgToPng(
        'website/logo-official.svg',
        'website/logo-twitter-banner.png',
        1500,
        500
    );

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All PNG logos created!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📁 Files created:');
    console.log('   • logo-twitter-profile.png (400x400) - Стандартный аватар');
    console.log('   • logo-twitter-profile-hd.png (1024x1024) - HD аватар');
    console.log('   • logo-twitter-banner.png (1500x500) - Баннер');
    console.log('');
    console.log('📍 Location: /Users/ai.place/Crypto/website/');
    console.log('');
}

main().catch(console.error);
