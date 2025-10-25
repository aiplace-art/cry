/**
 * Premium Image Generator - Advanced visual styles for Twitter
 * Features: Glassmorphism, 3D Gradients, Neon Cyberpunk, Abstract Geometry, Cinematic
 */

import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PremiumImageGenerator {
  constructor() {
    // Full HD resolution for maximum quality (Twitter supports up to 4096x4096)
    this.width = 1920;
    this.height = 1080; // 16:9 Full HD

    // HypeAI Brand Colors
    this.colors = {
      primary: '#00E5FF',     // Cyan
      secondary: '#00AAFF',   // Blue
      dark: '#0077FF',        // Dark Blue
      background: '#0A0E27',  // Dark Navy
      text: '#FFFFFF',
      accent: '#7C3AED',      // Purple
      gold: '#F3BA2F',        // BNB Gold
      black: '#000000'
    };
  }

  /**
   * Glassmorphism style - modern frosted glass effect with advanced blur
   */
  async generateGlassmorphism(options = {}) {
    const {
      title = 'HypeAI',
      subtitle = 'AI-Powered DeFi Platform',
      stats = null
    } = options;

    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Multi-gradient cosmic background
    const bgGradient = ctx.createRadialGradient(
      this.width * 0.3, this.height * 0.3, 0,
      this.width * 0.7, this.height * 0.7, this.width * 0.8
    );
    bgGradient.addColorStop(0, '#0077FF');
    bgGradient.addColorStop(0.4, '#00AAFF');
    bgGradient.addColorStop(0.7, '#00E5FF');
    bgGradient.addColorStop(1, '#0A0E27');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Blurred orbs for depth (glassmorphism background) - scaled for 1920x1080
    this.drawBlurredOrb(ctx, 320, 240, 288, this.colors.primary, 0.15);
    this.drawBlurredOrb(ctx, 1600, 800, 352, this.colors.gold, 0.12);
    this.drawBlurredOrb(ctx, 960, 160, 224, this.colors.dark, 0.1);

    // Main glass card with rounded corners - scaled for 1920x1080
    const cardX = 240, cardY = 240, cardW = 1440, cardH = 600, radius = 48;

    // Glass background (semi-transparent white)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    this.roundRect(ctx, cardX, cardY, cardW, cardH, radius, true, false);

    // Frosted glass border with gradient
    const borderGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    borderGradient.addColorStop(0, 'rgba(0, 229, 255, 0.6)');
    borderGradient.addColorStop(0.5, 'rgba(243, 186, 47, 0.6)');
    borderGradient.addColorStop(1, 'rgba(0, 119, 255, 0.6)');
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 3;
    this.roundRect(ctx, cardX, cardY, cardW, cardH, radius, false, true);

    // Inner highlight (glassmorphism lighting effect)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + radius + 10, cardY + 10);
    ctx.lineTo(cardX + cardW - radius - 10, cardY + 10);
    ctx.stroke();

    // Hexagon logo accent - scaled
    this.drawHexagon(ctx, this.width / 2, 416, 80, this.colors.primary, 0.25);

    // Title with glow effect - scaled font
    ctx.save();
    ctx.shadowColor = this.colors.primary;
    ctx.shadowBlur = 48;
    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 110px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, this.width / 2, 576);
    ctx.restore();

    // Subtitle - scaled font
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '52px Arial';
    ctx.fillText(subtitle, this.width / 2, 656);

    // Divider with gradient - scaled
    const dividerGradient = ctx.createLinearGradient(480, 704, 1440, 704);
    dividerGradient.addColorStop(0, 'rgba(0, 229, 255, 0)');
    dividerGradient.addColorStop(0.5, 'rgba(0, 229, 255, 0.6)');
    dividerGradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.strokeStyle = dividerGradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(480, 704);
    ctx.lineTo(1440, 704);
    ctx.stroke();

    // Stats - scaled font
    if (stats) {
      ctx.fillStyle = this.colors.gold;
      ctx.font = 'bold 42px Arial';
      ctx.fillText(stats, this.width / 2, 768);
    }

    // BNB Chain badge (bottom right) - scaled
    ctx.fillStyle = 'rgba(243, 186, 47, 0.15)';
    ctx.fillRect(cardX + cardW - 288, cardY + cardH - 96, 256, 64);
    ctx.strokeStyle = this.colors.gold;
    ctx.lineWidth = 3;
    ctx.strokeRect(cardX + cardW - 288, cardY + cardH - 96, 256, 64);
    ctx.fillStyle = this.colors.gold;
    ctx.font = 'bold 29px Arial';
    ctx.fillText('ON BNB CHAIN', cardX + cardW - 160, cardY + cardH - 56);

    return this.exportHighQuality(canvas);
  }

  /**
   * 3D Gradient style - vibrant multi-layered gradients
   */
  async generate3DGradient(options = {}) {
    const {
      title = 'HypeAI Features',
      subtitle = 'Next-Generation DeFi',
      highlight = null
    } = options;

    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Multi-layer gradient background
    const bg1 = ctx.createLinearGradient(0, 0, this.width, 0);
    bg1.addColorStop(0, '#ff0080');
    bg1.addColorStop(0.5, '#7928ca');
    bg1.addColorStop(1, '#0070f3');
    ctx.fillStyle = bg1;
    ctx.fillRect(0, 0, this.width, this.height);

    // Overlay gradient for depth
    const bg2 = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, this.height
    );
    bg2.addColorStop(0, 'rgba(0, 0, 0, 0)');
    bg2.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = bg2;
    ctx.fillRect(0, 0, this.width, this.height);

    // 3D geometric shapes - scaled for 1920x1080
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);

    // Floating cubes effect - scaled
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + i * 0.03})`;
      ctx.fillRect(-320 - i * 80, -320 - i * 80, 640 + i * 160, 640 + i * 160);
      ctx.restore();
    }

    ctx.restore();

    // Content box with gradient border - scaled
    const borderGradient = ctx.createLinearGradient(400, 352, 1520, 352);
    borderGradient.addColorStop(0, this.colors.primary);
    borderGradient.addColorStop(0.5, this.colors.accent);
    borderGradient.addColorStop(1, this.colors.gold);

    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 6;
    ctx.strokeRect(400, 352, 1120, 376);

    // Title with gradient - scaled font
    const titleGradient = ctx.createLinearGradient(0, 480, this.width, 480);
    titleGradient.addColorStop(0, this.colors.primary);
    titleGradient.addColorStop(1, this.colors.text);
    ctx.fillStyle = titleGradient;
    ctx.font = 'bold 102px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, this.width / 2, 496);

    // Subtitle - scaled font
    ctx.fillStyle = this.colors.text;
    ctx.font = '52px Arial';
    ctx.fillText(subtitle, this.width / 2, 592);

    // Highlight - scaled font
    if (highlight) {
      ctx.fillStyle = this.colors.gold;
      ctx.font = 'bold 45px Arial';
      ctx.fillText(highlight, this.width / 2, 672);
    }

    return this.exportHighQuality(canvas);
  }

  /**
   * Neon Cyberpunk style - electric neon aesthetic
   */
  async generateNeonCyberpunk(options = {}) {
    const {
      title = 'HypeAI',
      subtitle = 'The Future is Now',
      tagline = 'BNB Chain'
    } = options;

    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Dark cyberpunk background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, this.width, this.height);

    // Grid lines - scaled
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
    ctx.lineWidth = 2;

    // Perspective grid - scaled for 1920x1080
    for (let i = 0; i < 20; i++) {
      const y = this.height - i * 64;
      const offset = i * 48;
      ctx.beginPath();
      ctx.moveTo(0 + offset, y);
      ctx.lineTo(this.width - offset, y);
      ctx.stroke();
    }

    for (let i = -10; i < 30; i++) {
      const x = this.width / 2 + i * 96;
      ctx.beginPath();
      ctx.moveTo(x, this.height);
      ctx.lineTo(this.width / 2, 0);
      ctx.stroke();
    }

    // Neon glow title
    ctx.textAlign = 'center';

    // Multiple layers for neon effect - scaled font
    for (let i = 5; i > 0; i--) {
      ctx.shadowColor = this.colors.primary;
      ctx.shadowBlur = i * 16;
      ctx.fillStyle = this.colors.primary;
      ctx.font = 'bold 154px Arial';
      ctx.fillText(title, this.width / 2, 400);
    }

    // Subtitle with purple neon - scaled font
    ctx.shadowColor = this.colors.accent;
    ctx.shadowBlur = 32;
    ctx.fillStyle = this.colors.accent;
    ctx.font = '67px Arial';
    ctx.fillText(subtitle, this.width / 2, 528);

    // Tagline with gold neon - scaled font
    ctx.shadowColor = this.colors.gold;
    ctx.shadowBlur = 24;
    ctx.fillStyle = this.colors.gold;
    ctx.font = 'bold 52px Arial';
    ctx.fillText(tagline, this.width / 2, 640);

    // Neon border - scaled
    ctx.strokeStyle = this.colors.primary;
    ctx.lineWidth = 5;
    ctx.shadowBlur = 40;
    ctx.strokeRect(160, 240, this.width - 320, 480);

    return this.exportHighQuality(canvas);
  }

  /**
   * Abstract Geometry style - modern geometric patterns
   */
  async generateAbstractGeo(options = {}) {
    const {
      title = 'HypeAI Community',
      subtitle = 'Join the Revolution',
      stats = null
    } = options;

    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Base gradient
    const bg = ctx.createLinearGradient(0, 0, this.width, this.height);
    bg.addColorStop(0, '#1e3a8a');
    bg.addColorStop(1, '#312e81');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.width, this.height);

    // Random geometric shapes - scaled for 1920x1080
    const shapes = [
      { x: 320, y: 160, size: 240, rotation: 0.3, color: 'rgba(0, 229, 255, 0.2)' },
      { x: 1440, y: 800, size: 320, rotation: 0.7, color: 'rgba(124, 58, 237, 0.2)' },
      { x: 1600, y: 240, size: 192, rotation: 1.2, color: 'rgba(243, 186, 47, 0.2)' },
      { x: 480, y: 880, size: 288, rotation: 0.5, color: 'rgba(0, 170, 255, 0.2)' },
    ];

    shapes.forEach(shape => {
      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate(shape.rotation);
      ctx.fillStyle = shape.color;
      ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);

      // Border - scaled
      ctx.strokeStyle = shape.color.replace('0.2', '0.5');
      ctx.lineWidth = 3;
      ctx.strokeRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
      ctx.restore();
    });

    // Content area - scaled
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(320, 352, 1280, 376);

    // Title - scaled font
    ctx.fillStyle = this.colors.primary;
    ctx.font = 'bold 102px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, this.width / 2, 496);

    // Subtitle - scaled font
    ctx.fillStyle = this.colors.text;
    ctx.font = '58px Arial';
    ctx.fillText(subtitle, this.width / 2, 592);

    // Stats - scaled font
    if (stats) {
      ctx.fillStyle = this.colors.gold;
      ctx.font = 'bold 45px Arial';
      ctx.fillText(stats, this.width / 2, 680);
    }

    return this.exportHighQuality(canvas);
  }

  /**
   * Cinematic style - movie poster aesthetic
   */
  async generateCinematic(options = {}) {
    const {
      title = 'HYPEAI LAUNCH',
      subtitle = 'The Revolution Begins',
      date = 'COMING SOON'
    } = options;

    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Dark vignette background
    const radial = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, this.height
    );
    radial.addColorStop(0, '#1a1a2e');
    radial.addColorStop(1, '#000000');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, this.width, this.height);

    // Light rays effect - scaled
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      const rayGradient = ctx.createLinearGradient(0, -this.height, 0, this.height);
      rayGradient.addColorStop(0, 'rgba(0, 229, 255, 0)');
      rayGradient.addColorStop(0.5, 'rgba(0, 229, 255, 0.05)');
      rayGradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = rayGradient;
      ctx.fillRect(-80, -this.height, 160, this.height * 2);
    }
    ctx.restore();

    // Main title - cinematic style - scaled font
    ctx.fillStyle = this.colors.text;
    ctx.font = 'bold 154px Arial';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '16px';

    // Title shadow for depth - scaled
    ctx.shadowColor = this.colors.primary;
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 8;
    ctx.fillText(title, this.width / 2, 448);

    // Accent line - scaled
    ctx.shadowBlur = 0;
    ctx.fillStyle = this.colors.gold;
    ctx.fillRect(this.width / 2 - 480, 496, 960, 6);

    // Subtitle - scaled font
    ctx.fillStyle = this.colors.primary;
    ctx.font = '67px Arial';
    ctx.fillText(subtitle, this.width / 2, 608);

    // Date/tagline - scaled font
    ctx.fillStyle = this.colors.gold;
    ctx.font = 'bold 58px Arial';
    ctx.fillText(date, this.width / 2, 720);

    // Bottom bar - scaled
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 928, this.width, 152);

    ctx.fillStyle = this.colors.text;
    ctx.font = '38px Arial';
    ctx.fillText('POWERED BY BNB CHAIN', this.width / 2, 1008);

    return this.exportHighQuality(canvas);
  }

  /**
   * Helper: High-quality image export with automatic format optimization
   * Exports as PNG with maximum quality, falls back to high-quality JPEG if >5MB
   */
  exportHighQuality(canvas) {
    // Export as high-quality PNG (compression level 3 = balanced quality/size)
    const pngBuffer = canvas.toBuffer('image/png', {
      compressionLevel: 3,        // 0=max quality huge file, 9=max compression
      filters: canvas.PNG_FILTER_NONE  // No filters = maximum quality
    });

    // Twitter limit: 5MB for images
    // If PNG > 5MB, use high-quality JPEG instead
    if (pngBuffer.length > 5 * 1024 * 1024) {
      console.log(`PNG size ${(pngBuffer.length / 1024 / 1024).toFixed(2)}MB exceeds 5MB, using JPEG 95%`);
      return canvas.toBuffer('image/jpeg', {
        quality: 0.95,              // 95% quality (0.0-1.0)
        progressive: true,          // Progressive JPEG for faster loading
        chromaSubsampling: false    // No chroma subsampling = better quality
      });
    }

    return pngBuffer;
  }

  /**
   * Helper: Save generated image
   */
  async saveImage(buffer, filename) {
    const outputPath = path.join(__dirname, filename);
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }

  // ==================== ADVANCED HELPER METHODS ====================

  /**
   * Draw rounded rectangle
   */
  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  /**
   * Draw blurred orb for glassmorphism
   */
  drawBlurredOrb(ctx, x, y, radius, color, alpha) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, this.hexToRgba(color, alpha));
    gradient.addColorStop(1, this.hexToRgba(color, 0));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw hexagon shape
   */
  drawHexagon(ctx, x, y, size, color, alpha = 1, strokeOnly = false) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();

    if (strokeOnly) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      ctx.fillStyle = this.hexToRgba(color, alpha);
      ctx.fill();
    }
  }

  /**
   * Convert hex to rgba
   */
  hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

export default PremiumImageGenerator;
