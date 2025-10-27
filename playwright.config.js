import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { outputFolder: 'tests/e2e/reports/html' }],
        ['json', { outputFile: 'tests/e2e/reports/results.json' }],
        ['junit', { outputFile: 'tests/e2e/reports/junit.xml' }],
        ['list']
    ],

    use: {
        baseURL: 'http://localhost:8080',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

        // Collect coverage
        contextOptions: {
            recordVideo: {
                dir: 'tests/e2e/videos/'
            }
        }
    },

    projects: [
        // Desktop browsers
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 }
            },
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                viewport: { width: 1920, height: 1080 }
            },
        },
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                viewport: { width: 1920, height: 1080 }
            },
        },

        // Mobile devices
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
        {
            name: 'iPhone SE',
            use: { ...devices['iPhone SE'] },
        },
        {
            name: 'Galaxy S9+',
            use: { ...devices['Galaxy S9+'] },
        },
        {
            name: 'iPad Mini',
            use: { ...devices['iPad Mini'] },
        },

        // Tablet
        {
            name: 'iPad Pro',
            use: { ...devices['iPad Pro'] },
        },
    ],

    webServer: {
        command: 'npx http-server -p 8080',
        url: 'http://localhost:8080',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },

    // Global timeout
    timeout: 30000,
    expect: {
        timeout: 5000
    },
});
