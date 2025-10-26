# Error Handling Best Practices

Comprehensive guide to handling errors in HypeAI API.

## 🎯 Error Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "field_name",
      "value": "invalid_value",
      "constraint": "constraint_violated"
    }
  }
}
```

## 📋 Error Codes

### Authentication Errors (401)

| Code | Message | Action |
|------|---------|--------|
| `UNAUTHORIZED` | Invalid or expired token | Re-authenticate |
| `TOKEN_EXPIRED` | Access token has expired | Refresh token |
| `INVALID_CREDENTIALS` | Invalid email or password | Check credentials |
| `ACCOUNT_LOCKED` | Account temporarily locked | Wait or contact support |

### Validation Errors (400)

| Code | Message | Action |
|------|---------|--------|
| `VALIDATION_ERROR` | Request validation failed | Check input format |
| `INVALID_EMAIL` | Invalid email format | Use valid email |
| `PASSWORD_TOO_WEAK` | Password doesn't meet requirements | Strengthen password |
| `MISSING_FIELD` | Required field missing | Add required field |

### Business Logic Errors (402, 409)

| Code | Message | Action |
|------|---------|--------|
| `INSUFFICIENT_BALANCE` | Not enough funds | Add funds |
| `PRESALE_NOT_ACTIVE` | Presale is not active | Wait for presale start |
| `TOKENS_SOLD_OUT` | No tokens available | Check availability |
| `DUPLICATE_EMAIL` | Email already registered | Use different email |
| `REFERRAL_CODE_INVALID` | Invalid referral code | Check code |

### Rate Limiting (429)

| Code | Message | Action |
|------|---------|--------|
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry |
| `DAILY_LIMIT_REACHED` | Daily limit exceeded | Try tomorrow |

### Server Errors (500, 503)

| Code | Message | Action |
|------|---------|--------|
| `INTERNAL_ERROR` | Internal server error | Retry or contact support |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | Check status page |
| `BLOCKCHAIN_ERROR` | Blockchain interaction failed | Retry later |

## 💻 Implementation Examples

### JavaScript/TypeScript

```typescript
class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleAPICall<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (error.response) {
      const { code, message, details } = error.response.data.error;

      switch (code) {
        case 'TOKEN_EXPIRED':
          // Auto-refresh token
          await refreshToken();
          return handleAPICall(apiCall); // Retry

        case 'UNAUTHORIZED':
          // Redirect to login
          window.location.href = '/login';
          throw new APIError(code, message, details);

        case 'RATE_LIMIT_EXCEEDED':
          // Exponential backoff
          await delay(calculateBackoff(error));
          return handleAPICall(apiCall); // Retry

        case 'INSUFFICIENT_BALANCE':
          // Show user-friendly message
          showNotification('Please add funds to continue');
          throw new APIError(code, message, details);

        default:
          throw new APIError(code, message, details);
      }
    }

    // Network error
    if (error.request) {
      throw new APIError('NETWORK_ERROR', 'Network request failed');
    }

    // Unknown error
    throw error;
  }
}

// Usage
try {
  const result = await handleAPICall(() =>
    api.post('/tokens/purchase', {
      amount: 1000,
      paymentMethod: 'bnb'
    })
  );
  console.log('Success:', result);
} catch (error) {
  if (error instanceof APIError) {
    console.error(`Error ${error.code}: ${error.message}`);
  }
}
```

### React Error Boundary

```tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);

    // Log to error tracking service
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary
      fallback={<ErrorPage />}
      onError={(error) => {
        // Send to monitoring service
        Sentry.captureException(error);
      }}
    >
      <Dashboard />
    </ErrorBoundary>
  );
}
```

### Axios Interceptor

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.hypeai.io/v1'
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expired - refresh and retry
    if (
      error.response?.status === 401 &&
      error.response?.data?.error?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Rate limit - retry with backoff
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;

      await new Promise(resolve => setTimeout(resolve, delay));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Python Exception Handling

```python
import requests
from typing import Optional
from time import sleep

class APIError(Exception):
    def __init__(self, code: str, message: str, details: Optional[dict] = None):
        self.code = code
        self.message = message
        self.details = details
        super().__init__(message)

class HypeAIClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()

    def _handle_error(self, response: requests.Response):
        try:
            error_data = response.json()
            error = error_data.get('error', {})
            raise APIError(
                code=error.get('code', 'UNKNOWN'),
                message=error.get('message', 'Unknown error'),
                details=error.get('details')
            )
        except ValueError:
            raise APIError('PARSE_ERROR', 'Failed to parse error response')

    def _request(self, method: str, endpoint: str, **kwargs):
        max_retries = 3
        retry_delay = 1

        for attempt in range(max_retries):
            try:
                response = self.session.request(
                    method,
                    f"{self.base_url}{endpoint}",
                    **kwargs
                )

                if response.ok:
                    return response.json()

                # Handle specific errors
                if response.status_code == 401:
                    # Try to refresh token
                    if self._refresh_token():
                        continue  # Retry with new token
                    raise APIError('UNAUTHORIZED', 'Authentication failed')

                elif response.status_code == 429:
                    # Rate limit - exponential backoff
                    sleep(retry_delay * (2 ** attempt))
                    continue

                else:
                    self._handle_error(response)

            except requests.RequestException as e:
                if attempt == max_retries - 1:
                    raise APIError('NETWORK_ERROR', str(e))
                sleep(retry_delay)

        raise APIError('MAX_RETRIES', 'Maximum retry attempts exceeded')

# Usage
try:
    result = client.purchase_tokens(1000, 'bnb')
    print(f"Success: {result}")
except APIError as e:
    if e.code == 'INSUFFICIENT_BALANCE':
        print("Please add funds to your account")
    elif e.code == 'RATE_LIMIT_EXCEEDED':
        print("Too many requests. Please wait.")
    else:
        print(f"Error {e.code}: {e.message}")
```

## 🔄 Retry Strategies

### Exponential Backoff

```typescript
async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, i);
      const jitter = Math.random() * 1000;

      await new Promise(resolve =>
        setTimeout(resolve, delay + jitter)
      );
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const result = await exponentialBackoff(
  () => api.post('/tokens/purchase', data),
  3,
  2000
);
```

### Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailure = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// Usage
const breaker = new CircuitBreaker(5, 60000);

try {
  const result = await breaker.execute(() =>
    api.post('/tokens/purchase', data)
  );
} catch (error) {
  console.error('Circuit breaker prevented request');
}
```

## 🎯 User-Friendly Messages

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Please log in to continue',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  INSUFFICIENT_BALANCE: 'You don\'t have enough funds. Please add more.',
  PRESALE_NOT_ACTIVE: 'The presale hasn\'t started yet. Stay tuned!',
  TOKENS_SOLD_OUT: 'Sorry, all tokens have been sold out.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment.',
  NETWORK_ERROR: 'Connection problem. Please check your internet.',
  INTERNAL_ERROR: 'Something went wrong. Please try again later.'
};

function getUserFriendlyMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] || 'An unexpected error occurred';
}

// Usage in UI
function handleError(error: APIError) {
  toast.error(getUserFriendlyMessage(error.code));

  // Log technical details
  console.error(`[${error.code}] ${error.message}`, error.details);
}
```

## 📊 Error Logging

```typescript
import * as Sentry from '@sentry/browser';

function logError(
  error: APIError,
  context?: Record<string, any>
) {
  // Console logging (development)
  if (process.env.NODE_ENV === 'development') {
    console.group(`❌ API Error: ${error.code}`);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
    console.error('Context:', context);
    console.groupEnd();
  }

  // Sentry (production)
  Sentry.captureException(error, {
    tags: {
      errorCode: error.code
    },
    contexts: {
      api: {
        endpoint: context?.endpoint,
        method: context?.method,
        statusCode: context?.statusCode
      }
    },
    extra: {
      details: error.details
    }
  });

  // Custom analytics
  analytics.track('API Error', {
    code: error.code,
    message: error.message,
    endpoint: context?.endpoint
  });
}
```

## 🧪 Testing Error Handling

```typescript
import { renderHook } from '@testing-library/react';
import { useAuth } from '@hypeai/react-sdk';

describe('Error Handling', () => {
  it('should handle token expiration', async () => {
    const { result } = renderHook(() => useAuth());

    // Mock API to return expired token error
    mockAPI.onPost('/auth/login').reply(401, {
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired'
      }
    });

    await expect(
      result.current.login('test@example.com', 'password')
    ).rejects.toThrow('TOKEN_EXPIRED');
  });

  it('should retry on rate limit', async () => {
    let attempts = 0;

    mockAPI.onPost('/tokens/purchase').reply(() => {
      attempts++;
      if (attempts < 3) {
        return [429, {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests'
          }
        }];
      }
      return [200, { success: true }];
    });

    const result = await purchaseTokens(1000, 'bnb');
    expect(attempts).toBe(3);
    expect(result.success).toBe(true);
  });
});
```

## 🔗 Related Documentation

- [API Reference](../spec/openapi.yaml)
- [Authentication Guide](./authentication.md)
- [Rate Limiting](./rate-limiting.md)
- [Best Practices](./best-practices.md)
