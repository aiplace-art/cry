/**
 * Professional Image Generator for Twitter Posts
 * Uses Canvas API to create high-quality branded images
 */

import { createCanvas, registerFont, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProfessionalImageGenerator {
  constructor() {
    this.width = 1200;
    this.height = 675; // Twitter optimal ratio 16:9

    // HypeAI Brand Colors
    this.colors = {
      primary: '#00E5FF',     // Cyan
      secondary: '#00AAFF',   // Blue
      dark: '#0077FF',        // Dark Blue
      background: '#0A0E27',  // Dark Navy
      text: '#FFFFFF',
      accent: '#7C3AED'       // Purple
    };
  }

  /**
   * Generate minimalist style image
   */
  async generateMinimalist(options = {}) {
    const { title = 'HypeAI', subtitle = 'AI-Powered DeFi' } = options;

    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, this.colors.background);
    gradient.addColorStop(1, '#1a1f3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Geometric accent
    ctx.strokeStyle = this.colors.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(300, 100);
    ctx.stroke();

    // Title
    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(title, 100, 300);

    // Subtitle
    ctx.fillStyle = this.colors.primary;
    ctx.font = '36px Arial';
    ctx.fillText(subtitle, 100, 360);

    // Logo watermark (top right)
    ctx.fillStyle = this.colors.primary;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('HYPEAI', this.width - 60, 80);

    // BNB Chain badge
    ctx.fillStyle = this.colors.secondary;
    ctx.font = '20px Arial';
    ctx.fillText('ON BNB CHAIN', this.width - 60, 110);

    return canvas.toBuffer('image/png');
  }

  /**
   * Generate tech gradient style
   */
  async generateTechGradient(options = {}) {
    const { title = 'HypeAI Launch', subtitle = 'The Future of DeFi' } = options;

    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Multi-color gradient background
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, this.colors.dark);
    gradient.addColorStop(0.5, this.colors.accent);
    gradient.addColorStop(1, this.colors.primary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Overlay dark semi-transparent layer
    ctx.fillStyle = 'rgba(10, 14, 39, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Grid pattern overlay
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < this.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, this.height);
      ctx.stroke();
    }
    for (let i = 0; i < this.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(this.width, i);
      ctx.stroke();
    }

    // Central content box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(100, 200, this.width - 200, 275);

    // Border
    ctx.strokeStyle = this.colors.primary;
    ctx.lineWidth = 4;
    ctx.strokeRect(100, 200, this.width - 200, 275);

    // Title
    ctx.fillStyle = this.colors.primary;
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, this.width / 2, 320);

    // Subtitle
    ctx.fillStyle = this.colors.text;
    ctx.font = '36px Arial';
    ctx.fillText(subtitle, this.width / 2, 380);

    // BNB Chain badge
    ctx.fillStyle = this.colors.secondary;
    ctx.font = 'bold 28px Arial';
    ctx.fillText('POWERED BY BNB CHAIN', this.width / 2, 440);

    return canvas.toBuffer('image/png');
  }

  /**
   * Generate service showcase style
   */
  async generateServiceShowcase(service = {}) {
    const {
      name = 'AI Service',
      icon = '🤖',
      description = 'Professional AI services',
      price = 'Contact us'
    } = service;

    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Background
    const gradient = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, this.width / 2
    );
    gradient.addColorStop(0, '#1a1f3a');
    gradient.addColorStop(1, this.colors.background);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Service card
    ctx.fillStyle = 'rgba(0, 170, 255, 0.1)';
    ctx.fillRect(200, 150, this.width - 400, 375);

    ctx.strokeStyle = this.colors.primary;
    ctx.lineWidth = 3;
    ctx.strokeRect(200, 150, this.width - 400, 375);

    // Icon
    ctx.font = '120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(icon, this.width / 2, 280);

    // Service name
    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 48px Arial';
    ctx.fillText(name, this.width / 2, 360);

    // Description
    ctx.fillStyle = this.colors.primary;
    ctx.font = '24px Arial';
    const maxWidth = this.width - 480;
    this.wrapText(ctx, description, this.width / 2, 410, maxWidth, 32);

    // Price
    ctx.fillStyle = this.colors.secondary;
    ctx.font = 'bold 32px Arial';
    ctx.fillText(price, this.width / 2, 490);

    // Footer
    ctx.fillStyle = this.colors.text;
    ctx.font = '20px Arial';
    ctx.fillText('HypeAI • AI-Powered Services on BNB Chain', this.width / 2, 600);

    return canvas.toBuffer('image/png');
  }

  /**
   * Generate meme style image
   */
  async generateMeme(options = {}) {
    const {
      topText = 'WHEN YOU FIND',
      bottomText = 'HYPEAI ON BNB CHAIN'
    } = options;

    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Solid background
    ctx.fillStyle = this.colors.background;
    ctx.fillRect(0, 0, this.width, this.height);

    // Top text
    ctx.fillStyle = this.colors.text;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.font = 'bold 64px Impact, Arial';
    ctx.textAlign = 'center';
    ctx.strokeText(topText.toUpperCase(), this.width / 2, 120);
    ctx.fillText(topText.toUpperCase(), this.width / 2, 120);

    // Central emoji or icon
    ctx.font = '200px Arial';
    ctx.fillText('🚀', this.width / 2, 380);

    // Bottom text
    ctx.font = 'bold 64px Impact, Arial';
    ctx.strokeText(bottomText.toUpperCase(), this.width / 2, 580);
    ctx.fillText(bottomText.toUpperCase(), this.width / 2, 580);

    return canvas.toBuffer('image/png');
  }

  /**
   * Generate data visualization style
   */
  async generateDataViz(options = {}) {
    const {
      title = 'HypeAI Analytics',
      stats = [
        { label: 'Total Value Locked', value: '$1.2M' },
        { label: 'Active Users', value: '5,000+' },
        { label: 'Transactions', value: '50K+' }
      ]
    } = options;

    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = this.colors.background;
    ctx.fillRect(0, 0, this.width, this.height);

    // Title
    ctx.fillStyle = this.colors.primary;
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, this.width / 2, 100);

    // Stats grid
    const statWidth = 300;
    const statHeight = 150;
    const gap = 50;
    const startX = (this.width - (stats.length * statWidth + (stats.length - 1) * gap)) / 2;
    const startY = 200;

    stats.forEach((stat, index) => {
      const x = startX + index * (statWidth + gap);
      const y = startY;

      // Stat box
      ctx.fillStyle = 'rgba(0, 170, 255, 0.1)';
      ctx.fillRect(x, y, statWidth, statHeight);

      ctx.strokeStyle = this.colors.secondary;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, statWidth, statHeight);

      // Value
      ctx.fillStyle = this.colors.primary;
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(stat.value, x + statWidth / 2, y + 70);

      // Label
      ctx.fillStyle = this.colors.text;
      ctx.font = '20px Arial';
      this.wrapText(ctx, stat.label, x + statWidth / 2, y + 110, statWidth - 20, 24);
    });

    // Footer
    ctx.fillStyle = this.colors.secondary;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Powered by BNB Chain', this.width / 2, 550);

    return canvas.toBuffer('image/png');
  }

  /**
   * Helper: Wrap text to fit width
   */
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  /**
   * Save image to file
   */
  async saveImage(buffer, filename) {
    const outputPath = path.join(__dirname, filename);
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }
}

export default ProfessionalImageGenerator;
