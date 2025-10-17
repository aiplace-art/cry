/**
 * HypeAI Dashboard - Performance Monitoring Suite
 *
 * Tests for:
 * - Load time metrics
 * - Frame rate (FPS)
 * - Memory usage
 * - Memory leak detection
 * - Network efficiency
 * - Animation performance
 *
 * Usage:
 * 1. Open dashboard in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy and paste this entire script
 * 4. Run: PerformanceMonitor.runAll()
 */

class PerformanceMonitor {
    constructor() {
        this.results = {
            loadTime: {},
            fps: [],
            memory: [],
            network: {},
            animations: {},
            score: 0
        };

        this.thresholds = {
            loadTime: {
                fcp: 1500,      // First Contentful Paint (ms)
                lcp: 2500,      // Largest Contentful Paint (ms)
                tti: 3500,      // Time to Interactive (ms)
                total: 5000     // Total load time (ms)
            },
            fps: {
                min: 55,        // Minimum acceptable FPS
                target: 60      // Target FPS
            },
            memory: {
                initial: 20,    // Initial heap (MB)
                afterUse: 50,   // After 5 minutes (MB)
                leak: 100       // Memory leak threshold (MB)
            },
            network: {
                total: 500,     // Total transfer (KB)
                requests: 20    // Max number of requests
            }
        };
    }

    // ==================== Load Time Metrics ====================

    async measureLoadTime() {
        console.log('📊 Measuring Load Time Performance...');

        if (!performance || !performance.getEntriesByType) {
            console.error('❌ Performance API not supported');
            return null;
        }

        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        const metrics = {
            // Navigation Timing
            dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnection: navigation.connectEnd - navigation.connectStart,
            requestTime: navigation.responseStart - navigation.requestStart,
            responseTime: navigation.responseEnd - navigation.responseStart,
            domProcessing: navigation.domComplete - navigation.domLoading,

            // Paint Timing
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,

            // DOM Events
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,

            // Total Time
            totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
        };

        // Calculate LCP (requires PerformanceObserver)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP observation failed:', e);
            }
        }

        this.results.loadTime = metrics;
        this.displayLoadTimeResults(metrics);

        return metrics;
    }

    displayLoadTimeResults(metrics) {
        console.log('\n📈 LOAD TIME RESULTS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`DNS Lookup:              ${metrics.dnsLookup.toFixed(2)}ms`);
        console.log(`TCP Connection:          ${metrics.tcpConnection.toFixed(2)}ms`);
        console.log(`Request Time:            ${metrics.requestTime.toFixed(2)}ms`);
        console.log(`Response Time:           ${metrics.responseTime.toFixed(2)}ms`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`First Paint (FP):        ${metrics.firstPaint.toFixed(2)}ms ${this.getStatus(metrics.firstPaint, this.thresholds.loadTime.fcp)}`);
        console.log(`First Contentful Paint:  ${metrics.firstContentfulPaint.toFixed(2)}ms ${this.getStatus(metrics.firstContentfulPaint, this.thresholds.loadTime.fcp)}`);

        if (metrics.largestContentfulPaint) {
            console.log(`Largest Contentful Paint: ${metrics.largestContentfulPaint.toFixed(2)}ms ${this.getStatus(metrics.largestContentfulPaint, this.thresholds.loadTime.lcp)}`);
        }

        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`DOM Processing:          ${metrics.domProcessing.toFixed(2)}ms`);
        console.log(`DOM Content Loaded:      ${metrics.domContentLoaded.toFixed(2)}ms`);
        console.log(`Load Complete:           ${metrics.loadComplete.toFixed(2)}ms`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`⏱️  TOTAL LOAD TIME:     ${metrics.totalLoadTime.toFixed(2)}ms ${this.getStatus(metrics.totalLoadTime, this.thresholds.loadTime.total)}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // ==================== FPS Measurement ====================

    async measureFPS(duration = 5000) {
        console.log(`📊 Measuring FPS for ${duration / 1000} seconds...`);

        return new Promise((resolve) => {
            const frames = [];
            let lastTime = performance.now();
            let frameCount = 0;

            const measureFrame = (currentTime) => {
                const delta = currentTime - lastTime;
                const fps = 1000 / delta;
                frames.push(fps);
                lastTime = currentTime;
                frameCount++;

                if (currentTime < startTime + duration) {
                    requestAnimationFrame(measureFrame);
                } else {
                    this.results.fps = frames;
                    this.displayFPSResults(frames);
                    resolve(frames);
                }
            };

            const startTime = performance.now();
            requestAnimationFrame(measureFrame);
        });
    }

    displayFPSResults(frames) {
        const avgFPS = frames.reduce((a, b) => a + b, 0) / frames.length;
        const minFPS = Math.min(...frames);
        const maxFPS = Math.max(...frames);
        const droppedFrames = frames.filter(fps => fps < 55).length;
        const droppedPercentage = (droppedFrames / frames.length * 100).toFixed(2);

        console.log('\n🎮 FPS RESULTS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Average FPS:             ${avgFPS.toFixed(2)} ${this.getStatus(avgFPS, this.thresholds.fps.min, true)}`);
        console.log(`Minimum FPS:             ${minFPS.toFixed(2)}`);
        console.log(`Maximum FPS:             ${maxFPS.toFixed(2)}`);
        console.log(`Frames Measured:         ${frames.length}`);
        console.log(`Dropped Frames (<55):    ${droppedFrames} (${droppedPercentage}%)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // ==================== Memory Measurement ====================

    measureMemory() {
        console.log('📊 Measuring Memory Usage...');

        if (!performance.memory) {
            console.warn('⚠️  Memory API not available (Chrome only)');
            console.log('💡 Run in Chrome with --enable-precise-memory-info flag');
            return null;
        }

        const memory = {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
            timestamp: Date.now()
        };

        this.results.memory.push(memory);
        this.displayMemoryResults(memory);

        return memory;
    }

    displayMemoryResults(memory) {
        const usedMB = (memory.used / 1024 / 1024).toFixed(2);
        const totalMB = (memory.total / 1024 / 1024).toFixed(2);
        const limitMB = (memory.limit / 1024 / 1024).toFixed(2);
        const percentage = ((memory.used / memory.total) * 100).toFixed(2);

        console.log('\n💾 MEMORY USAGE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Used Heap:               ${usedMB} MB ${this.getStatus(parseFloat(usedMB), this.thresholds.memory.initial)}`);
        console.log(`Total Heap:              ${totalMB} MB`);
        console.log(`Heap Limit:              ${limitMB} MB`);
        console.log(`Usage:                   ${percentage}%`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // ==================== Memory Leak Detection ====================

    async detectMemoryLeaks(duration = 30000, interval = 5000) {
        console.log(`📊 Monitoring for Memory Leaks (${duration / 1000}s)...`);
        console.log('💡 Interacting with the dashboard while monitoring...\n');

        if (!performance.memory) {
            console.warn('⚠️  Memory API not available. Run in Chrome.');
            return null;
        }

        const snapshots = [];
        const iterations = duration / interval;

        for (let i = 0; i < iterations; i++) {
            const snapshot = {
                iteration: i + 1,
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                timestamp: Date.now()
            };

            snapshots.push(snapshot);

            console.log(`📸 Snapshot ${i + 1}/${iterations}: ${(snapshot.used / 1024 / 1024).toFixed(2)} MB`);

            if (i < iterations - 1) {
                await this.wait(interval);
            }
        }

        this.displayLeakAnalysis(snapshots);
        return snapshots;
    }

    displayLeakAnalysis(snapshots) {
        const firstUsed = snapshots[0].used;
        const lastUsed = snapshots[snapshots.length - 1].used;
        const growth = lastUsed - firstUsed;
        const growthMB = (growth / 1024 / 1024).toFixed(2);
        const growthPercentage = ((growth / firstUsed) * 100).toFixed(2);

        console.log('\n🔍 MEMORY LEAK ANALYSIS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Initial Memory:          ${(firstUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Final Memory:            ${(lastUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Growth:                  ${growthMB} MB (${growthPercentage}%)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (growth > this.thresholds.memory.leak * 1024 * 1024) {
            console.log('❌ POTENTIAL MEMORY LEAK DETECTED!');
            console.log(`   Growth exceeds ${this.thresholds.memory.leak}MB threshold`);
        } else if (growthPercentage > 50) {
            console.log('⚠️  WARNING: High memory growth detected');
            console.log('   Consider investigating for inefficiencies');
        } else {
            console.log('✅ No significant memory leaks detected');
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // ==================== Network Analysis ====================

    analyzeNetwork() {
        console.log('📊 Analyzing Network Performance...');

        const resources = performance.getEntriesByType('resource');

        let totalSize = 0;
        const breakdown = {
            script: { count: 0, size: 0 },
            stylesheet: { count: 0, size: 0 },
            image: { count: 0, size: 0 },
            font: { count: 0, size: 0 },
            other: { count: 0, size: 0 }
        };

        resources.forEach(resource => {
            const size = resource.transferSize || resource.encodedBodySize || 0;
            totalSize += size;

            let type = 'other';
            if (resource.name.match(/\.js$/)) type = 'script';
            else if (resource.name.match(/\.css$/)) type = 'stylesheet';
            else if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) type = 'image';
            else if (resource.name.match(/\.(woff|woff2|ttf|eot)$/)) type = 'font';

            breakdown[type].count++;
            breakdown[type].size += size;
        });

        this.results.network = {
            totalRequests: resources.length,
            totalSize: totalSize,
            breakdown: breakdown
        };

        this.displayNetworkResults();
    }

    displayNetworkResults() {
        const { totalRequests, totalSize, breakdown } = this.results.network;
        const totalKB = (totalSize / 1024).toFixed(2);

        console.log('\n🌐 NETWORK ANALYSIS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Total Requests:          ${totalRequests} ${this.getStatus(totalRequests, this.thresholds.network.requests)}`);
        console.log(`Total Transfer:          ${totalKB} KB ${this.getStatus(parseFloat(totalKB), this.thresholds.network.total)}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        Object.keys(breakdown).forEach(type => {
            const { count, size } = breakdown[type];
            if (count > 0) {
                console.log(`${type.padEnd(15)} ${count.toString().padStart(3)} files  ${(size / 1024).toFixed(2).padStart(8)} KB`);
            }
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // ==================== Animation Performance ====================

    async testAnimationPerformance() {
        console.log('📊 Testing Animation Performance...');

        const testCases = [
            { name: 'Countdown Timer', selector: '#countdown' },
            { name: 'Activity Feed', selector: '.activity-feed' },
            { name: 'Agent Cards', selector: '.agent-card' },
            { name: 'Chart Updates', selector: 'canvas' }
        ];

        const results = {};

        for (const test of testCases) {
            const element = document.querySelector(test.selector);
            if (!element) {
                console.warn(`⚠️  Element not found: ${test.selector}`);
                continue;
            }

            results[test.name] = await this.measureElementPerformance(element);
        }

        this.results.animations = results;
        this.displayAnimationResults(results);
    }

    async measureElementPerformance(element) {
        const frames = [];
        let lastTime = performance.now();

        return new Promise((resolve) => {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 16.67) { // Slower than 60fps
                        frames.push({
                            duration: entry.duration,
                            type: entry.entryType
                        });
                    }
                }
            });

            observer.observe({ entryTypes: ['measure'] });

            setTimeout(() => {
                observer.disconnect();
                resolve({
                    slowFrames: frames.length,
                    avgDuration: frames.length > 0
                        ? frames.reduce((a, b) => a + b.duration, 0) / frames.length
                        : 0
                });
            }, 2000);
        });
    }

    displayAnimationResults(results) {
        console.log('\n✨ ANIMATION PERFORMANCE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        Object.keys(results).forEach(name => {
            const { slowFrames, avgDuration } = results[name];
            console.log(`${name}:`);
            console.log(`  Slow Frames:           ${slowFrames}`);
            console.log(`  Avg Duration:          ${avgDuration.toFixed(2)}ms`);
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // ==================== Utilities ====================

    getStatus(value, threshold, greaterIsBetter = false) {
        if (greaterIsBetter) {
            return value >= threshold ? '✅' : '❌';
        }
        return value <= threshold ? '✅' : '❌';
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    calculateScore() {
        let score = 100;
        const { loadTime, fps, memory, network } = this.results;

        // Load time scoring (30 points)
        if (loadTime.totalLoadTime > this.thresholds.loadTime.total) score -= 10;
        if (loadTime.firstContentfulPaint > this.thresholds.loadTime.fcp) score -= 10;
        if (loadTime.largestContentfulPaint > this.thresholds.loadTime.lcp) score -= 10;

        // FPS scoring (30 points)
        if (fps.length > 0) {
            const avgFPS = fps.reduce((a, b) => a + b, 0) / fps.length;
            if (avgFPS < this.thresholds.fps.min) score -= 30;
            else if (avgFPS < this.thresholds.fps.target) score -= 15;
        }

        // Memory scoring (20 points)
        if (memory.length > 0) {
            const lastMemory = memory[memory.length - 1].used / 1024 / 1024;
            if (lastMemory > this.thresholds.memory.leak) score -= 20;
            else if (lastMemory > this.thresholds.memory.afterUse) score -= 10;
        }

        // Network scoring (20 points)
        if (network.totalSize) {
            const sizeKB = network.totalSize / 1024;
            if (sizeKB > this.thresholds.network.total) score -= 10;
            if (network.totalRequests > this.thresholds.network.requests) score -= 10;
        }

        this.results.score = Math.max(0, score);
        return this.results.score;
    }

    displayFinalScore() {
        const score = this.calculateScore();

        console.log('\n' + '━'.repeat(50));
        console.log('🎯 FINAL PERFORMANCE SCORE');
        console.log('━'.repeat(50));
        console.log(`\n         ${score}/100`);

        if (score >= 90) {
            console.log('\n         ⭐⭐⭐⭐⭐ EXCELLENT');
        } else if (score >= 75) {
            console.log('\n         ⭐⭐⭐⭐ GOOD');
        } else if (score >= 60) {
            console.log('\n         ⭐⭐⭐ FAIR');
        } else {
            console.log('\n         ⭐⭐ NEEDS IMPROVEMENT');
        }

        console.log('\n' + '━'.repeat(50) + '\n');
    }

    // ==================== Main Test Runner ====================

    async runAll() {
        console.clear();
        console.log('\n🚀 HypeAI Dashboard - Performance Test Suite');
        console.log('━'.repeat(50) + '\n');

        try {
            // 1. Load Time
            await this.measureLoadTime();
            await this.wait(1000);

            // 2. FPS
            await this.measureFPS(5000);
            await this.wait(1000);

            // 3. Memory
            this.measureMemory();
            await this.wait(1000);

            // 4. Network
            this.analyzeNetwork();
            await this.wait(1000);

            // 5. Animations
            await this.testAnimationPerformance();

            // Final Score
            this.displayFinalScore();

            console.log('✅ Performance testing complete!');
            console.log('\n💡 TIP: Run PerformanceMonitor.detectMemoryLeaks(30000) for leak detection');
            console.log('💡 TIP: Results saved in PerformanceMonitor.results\n');

        } catch (error) {
            console.error('❌ Error during performance testing:', error);
        }
    }

    // Quick tests
    async quickTest() {
        console.log('🏃 Running Quick Performance Test...\n');
        await this.measureLoadTime();
        this.measureMemory();
        this.analyzeNetwork();
        this.displayFinalScore();
    }
}

// Create global instance
window.PerformanceMonitor = new PerformanceMonitor();

// Auto-run message
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 HypeAI Dashboard Performance Monitor Loaded');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📋 Available Commands:');
console.log('  PerformanceMonitor.runAll()              - Run all tests');
console.log('  PerformanceMonitor.quickTest()           - Quick performance check');
console.log('  PerformanceMonitor.measureLoadTime()     - Test load time');
console.log('  PerformanceMonitor.measureFPS(5000)      - Test FPS (5 seconds)');
console.log('  PerformanceMonitor.measureMemory()       - Check memory usage');
console.log('  PerformanceMonitor.detectMemoryLeaks()   - 30s leak detection');
console.log('  PerformanceMonitor.analyzeNetwork()      - Network analysis');
console.log('  PerformanceMonitor.results               - View all results\n');
console.log('💡 Run: PerformanceMonitor.runAll() to start!\n');
