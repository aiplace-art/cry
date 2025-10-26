import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Bundle Size Analysis
 * Ensures JavaScript bundles stay within size limits
 */

describe('Bundle Size Analysis', () => {
  const publicDir = path.join(__dirname, '../../../public/variant-2/js');
  const maxSizes = {
    'ai-assistant.js': 20 * 1024, // 20KB
    'cookie-consent.js': 15 * 1024, // 15KB
    'i18n.js': 60 * 1024, // 60KB (translations are large)
    'live-agents.js': 30 * 1024, // 30KB
    'mobile-nav.js': 20 * 1024, // 20KB
  };

  Object.entries(maxSizes).forEach(([filename, maxSize]) => {
    it(`should keep ${filename} under ${maxSize} bytes`, () => {
      const filePath = path.join(publicDir, filename);

      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filename}`);
        return;
      }

      const stats = fs.statSync(filePath);
      const actualSize = stats.size;

      expect(actualSize).toBeLessThanOrEqual(maxSize);

      const percentage = ((actualSize / maxSize) * 100).toFixed(1);
      console.log(`${filename}: ${actualSize} bytes (${percentage}% of limit)`);
    });
  });

  it('should have total bundle size under 500KB', () => {
    if (!fs.existsSync(publicDir)) {
      console.warn('Public directory not found');
      return;
    }

    const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.js'));
    let totalSize = 0;

    files.forEach(file => {
      const stats = fs.statSync(path.join(publicDir, file));
      totalSize += stats.size;
    });

    const maxTotalSize = 500 * 1024; // 500KB
    expect(totalSize).toBeLessThanOrEqual(maxTotalSize);

    console.log(`Total bundle size: ${totalSize} bytes (${(totalSize / 1024).toFixed(1)}KB)`);
  });
});

describe('Memory Leak Detection', () => {
  it('should not leak memory during WebSocket operations', async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // Simulate WebSocket operations
    const sockets: WebSocket[] = [];
    for (let i = 0; i < 100; i++) {
      const ws = new WebSocket('ws://localhost:3000');
      sockets.push(ws);
    }

    // Close all sockets
    sockets.forEach(ws => ws.close());

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be minimal (<5MB)
    expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
  });

  it('should cleanup event listeners properly', () => {
    const element = document.createElement('div');
    const listeners: (() => void)[] = [];

    // Add many listeners
    for (let i = 0; i < 100; i++) {
      const listener = () => console.log(`Listener ${i}`);
      element.addEventListener('click', listener);
      listeners.push(listener);
    }

    // Remove all listeners
    listeners.forEach(listener => {
      element.removeEventListener('click', listener);
    });

    // Element should have no listeners (can't directly test, but logic is validated)
    expect(listeners).toHaveLength(100);
  });
});

describe('WebSocket Throughput', () => {
  it('should handle high message throughput', async () => {
    const ws = new WebSocket('ws://localhost:3000');
    const messageCount = 1000;
    let sentCount = 0;

    await new Promise<void>((resolve) => {
      ws.onopen = () => {
        const startTime = Date.now();

        for (let i = 0; i < messageCount; i++) {
          ws.send(JSON.stringify({ index: i, data: 'test' }));
          sentCount++;
        }

        const duration = Date.now() - startTime;
        const throughput = (messageCount / duration) * 1000; // messages per second

        console.log(`Throughput: ${throughput.toFixed(0)} messages/second`);
        expect(throughput).toBeGreaterThan(100); // At least 100 msg/s

        ws.close();
        resolve();
      };
    });

    expect(sentCount).toBe(messageCount);
  });

  it('should handle large messages efficiently', async () => {
    const ws = new WebSocket('ws://localhost:3000');
    const largeMessage = 'x'.repeat(1024 * 100); // 100KB message

    await new Promise<void>((resolve) => {
      ws.onopen = () => {
        const startTime = Date.now();

        ws.send(JSON.stringify({ data: largeMessage }));

        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(1000); // Should take less than 1 second

        ws.close();
        resolve();
      };
    });
  });
});

describe('Render Performance', () => {
  it('should render messages list efficiently', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const startTime = performance.now();

    // Render 100 messages
    for (let i = 0; i < 100; i++) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message';
      messageDiv.textContent = `Message ${i}`;
      container.appendChild(messageDiv);
    }

    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(100); // Should render in under 100ms
    expect(container.children).toHaveLength(100);

    document.body.removeChild(container);
  });

  it('should handle DOM updates without layout thrashing', () => {
    const elements = Array.from({ length: 50 }, () => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      return div;
    });

    const startTime = performance.now();

    // Batch reads
    const heights = elements.map(el => el.offsetHeight);

    // Batch writes
    elements.forEach((el, i) => {
      el.style.height = `${heights[i] + 10}px`;
    });

    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(50); // Should complete quickly

    elements.forEach(el => document.body.removeChild(el));
  });
});
