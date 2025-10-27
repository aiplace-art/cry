import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,
    reporter: [
        ['html', { outputFolder: 'tests/reports/html' }],
        ['json', { outputFile: 'tests/reports/results.json' }],
        ['list']
    ],

    use: {
        baseURL: 'http://localhost:8080',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

        contextOptions: {
            recordVideo: {
                dir: 'tests/reports/videos/'
            }
        }
    },

    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 }
            },
        }
    ],

    // No webServer - assume server is already running on 8080
    timeout: 30000,
    expect: {
        timeout: 5000
    },
});
