/* ===================================
   Retry Manager
   Handles network resilience with exponential backoff
   =================================== */

class RetryManager {
    constructor(config = {}) {
        this.maxRetries = config.maxRetries || 3;
        this.baseDelay = config.baseDelay || 1000;
        this.maxDelay = config.maxDelay || 10000;
        this.strategy = config.strategy || 'exponential'; // 'exponential' | 'linear' | 'fixed'
        this.timeout = config.timeout || 10000;
    }

    async execute(fn, context = {}) {
        let lastError;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await this.executeWithTimeout(fn, this.timeout);
            } catch (error) {
                lastError = error;

                if (attempt === this.maxRetries) {
                    throw new Error(
                        `Failed after ${this.maxRetries} retries: ${error.message}`
                    );
                }

                // Check if error is retryable
                if (!this.isRetryable(error)) {
                    throw error;
                }

                const delay = this.calculateDelay(attempt);
                console.warn(
                    `Retry ${attempt + 1}/${this.maxRetries} after ${delay}ms`,
                    error.message
                );

                await this.sleep(delay);
            }
        }

        throw lastError;
    }

    async executeWithTimeout(fn, timeoutMs) {
        return Promise.race([
            fn(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
            )
        ]);
    }

    isRetryable(error) {
        // Don't retry client errors (4xx) except 429 (rate limit)
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
            return false;
        }

        // Retry network errors, timeouts, 5xx errors
        const retryableErrors = [
            'NetworkError',
            'TimeoutError',
            'AbortError',
            'TypeError',
            'Request timeout'
        ];

        return retryableErrors.some(type =>
            error.name === type || error.message.includes(type)
        ) || (error.status >= 500);
    }

    calculateDelay(attempt) {
        let delay;

        switch (this.strategy) {
            case 'exponential':
                delay = Math.min(
                    this.baseDelay * Math.pow(2, attempt),
                    this.maxDelay
                );
                break;
            case 'linear':
                delay = Math.min(
                    this.baseDelay * (attempt + 1),
                    this.maxDelay
                );
                break;
            case 'fixed':
            default:
                delay = this.baseDelay;
        }

        // Add jitter to prevent thundering herd
        return delay + Math.random() * 100;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Fetch with abort controller for cancellation
async function fetchWithAbort(url, options = {}) {
    const controller = new AbortController();
    const timeout = options.timeout || 10000;

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
            error.status = response.status;
            throw error;
        }

        return response;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            const timeoutError = new Error(`Request timeout after ${timeout}ms`);
            timeoutError.name = 'TimeoutError';
            throw timeoutError;
        }

        throw error;
    }
}

// Export
window.RetryManager = RetryManager;
window.fetchWithAbort = fetchWithAbort;
