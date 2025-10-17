#!/usr/bin/env node

/**
 * Convert SVG logos to PNG for Twitter using Puppeteer
 * Twitter Requirements:
 * - Profile Picture: 400x400px minimum
 * - Banner: 1500x500px
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function convertSvgToPng(svgPath, outputPath, width, height) {
    console.log(`🖼️  Converting ${path.basename(svgPath)} → ${path.basename(outputPath)}`);
    console.log(`   Size: ${width}x${height}px`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width, height });

        // Read SVG content
        const svgContent = await fs.readFile(svgPath, 'utf-8');

        // Create HTML with SVG
        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        * { margin: 0; padding: 0; }
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${width}px;
            height: ${height}px;
            background: #ffffff;
        }
        svg {
            max-width: 100%;
            max-height: 100%;
        }
    </style>
</head>
<body>
    ${svgContent}
</body>
</html>
        `;

        await page.setContent(html);
        await page.waitForTimeout(500);

        // Take screenshot
        await page.screenshot({
            path: outputPath,
            type: 'png',
            omitBackground: false
        });

        console.log(`   ✅ Created: ${outputPath}`);
    } finally {
        await browser.close();
    }
}

async function main() {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎨 HypeAI Logo Converter');
    console.log('   Converting SVG → PNG for Twitter');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const tasks = [
        // Twitter Profile Picture (400x400)
        {
            input: 'website/logo-icon-only.svg',
            output: 'website/logo-twitter-profile-400.png',
            width: 400,
            height: 400,
            desc: 'Twitter Profile (стандарт)'
        },
        // Twitter Profile Picture HD (1024x1024)
        {
            input: 'website/logo-icon-only.svg',
            output: 'website/logo-twitter-profile-1024.png',
            width: 1024,
            height: 1024,
            desc: 'Twitter Profile (HD)'
        },
        // Twitter Banner (1500x500)
        {
            input: 'website/logo-official.svg',
            output: 'website/logo-twitter-banner-1500x500.png',
            width: 1500,
            height: 500,
            desc: 'Twitter Banner'
        }
    ];

    for (const task of tasks) {
        console.log(`📦 ${task.desc}`);
        await convertSvgToPng(task.input, task.output, task.width, task.height);
        console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Готово! PNG логотипы созданы');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📁 Файлы в папке: website/');
    console.log('');
    console.log('   🔹 logo-twitter-profile-400.png (400x400)');
    console.log('      → Аватар Twitter (стандартный)');
    console.log('');
    console.log('   🔹 logo-twitter-profile-1024.png (1024x1024)');
    console.log('      → Аватар Twitter (высокое качество)');
    console.log('');
    console.log('   🔹 logo-twitter-banner-1500x500.png (1500x500)');
    console.log('      → Баннер Twitter');
    console.log('');
    console.log('🔗 Также доступны анимированные версии:');
    console.log('   • website/logo-premium-animated.html (самый стильный)');
    console.log('   • website/logo-lightning-animated.html');
    console.log('   • website/logo-animated.html');
    console.log('');
}

main().catch(error => {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
});
