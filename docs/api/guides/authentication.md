# Authentication Guide

Complete guide to authentication and authorization in the HypeAI API.

## 🔑 Overview

HypeAI uses **JWT (JSON Web Tokens)** for authentication. All authenticated endpoints require a valid JWT token in the `Authorization` header.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 Authentication Flow

### Registration Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database

    Client->>API: POST /auth/register
    API->>Database: Check email uniqueness
    Database-->>API: Email available
    API->>Database: Create user
    API->>API: Generate JWT token
    API-->>Client: Return token + user data
    Client->>Client: Store token
```

### Login Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database

    Client->>API: POST /auth/login
    API->>Database: Find user by email
    Database-->>API: User found
    API->>API: Verify password
    API->>API: Generate JWT token
    API-->>Client: Return token + user data
    Client->>Client: Store token
```

## 📝 Endpoints

### Register New User

**POST** `/auth/register`

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe",
  "referralCode": "REF123ABC" // Optional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "johndoe",
    "balance": 0,
    "referralCode": "REF456DEF",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Validation Rules:**
- Email: Valid format, unique
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Username: 3-30 chars, alphanumeric + underscores

**Error Responses:**
```json
// 400 - Invalid input
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password must be at least 8 characters",
    "details": {
      "field": "password"
    }
  }
}

// 409 - Email already exists
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Email already registered"
  }
}
```

### Login

**POST** `/auth/login`

Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "johndoe",
    "balance": 15000,
    "referralCode": "REF456DEF"
  }
}
```

**Error Responses:**
```json
// 401 - Invalid credentials
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}

// 429 - Rate limit exceeded
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many login attempts. Please try again in 15 minutes."
  }
}
```

### Refresh Token

**POST** `/auth/refresh`

Get a new access token using refresh token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### Logout

**POST** `/auth/logout`

Invalidate current token (blacklist).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 💻 Implementation Examples

### JavaScript/TypeScript

```typescript
class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor(private baseURL: string) {}

  async register(
    email: string,
    password: string,
    username: string
  ) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    const data = await response.json();
    this.setTokens(data.token, data.refreshToken);
    return data.user;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    const data = await response.json();
    this.setTokens(data.token, data.refreshToken);
    return data.user;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.refreshToken}`
      }
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.token = data.token;
    this.saveToken('access_token', data.token);
    return data.token;
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token;
  }

  logout() {
    this.clearTokens();
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    this.saveToken('access_token', accessToken);
    this.saveToken('refresh_token', refreshToken);
  }

  private clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private saveToken(key: string, token: string) {
    localStorage.setItem(key, token);
  }
}

// Usage
const auth = new AuthService('https://api.hypeai.io/v1');

try {
  const user = await auth.login('user@example.com', 'SecurePass123!');
  console.log('Logged in:', user);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### React Hook

```typescript
import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load token from localStorage on mount
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      setToken(savedToken);
      // Optionally fetch user data
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('https://api.hypeai.io/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('access_token', data.token);
    localStorage.setItem('refresh_token', data.refreshToken);
  };

  const register = async (
    email: string,
    password: string,
    username: string
  ) => {
    const response = await fetch('https://api.hypeai.io/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('access_token', data.token);
    localStorage.setItem('refresh_token', data.refreshToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage in components
function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Python

```python
import requests
from typing import Optional
from datetime import datetime, timedelta

class AuthService:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.token_expires_at: Optional[datetime] = None

    def register(
        self,
        email: str,
        password: str,
        username: str
    ) -> dict:
        response = requests.post(
            f"{self.base_url}/auth/register",
            json={
                "email": email,
                "password": password,
                "username": username
            }
        )
        response.raise_for_status()

        data = response.json()
        self._set_tokens(data['token'], data['refreshToken'], data['expiresIn'])
        return data['user']

    def login(self, email: str, password: str) -> dict:
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={
                "email": email,
                "password": password
            }
        )
        response.raise_for_status()

        data = response.json()
        self._set_tokens(data['token'], data['refreshToken'], data['expiresIn'])
        return data['user']

    def refresh_access_token(self) -> str:
        if not self.refresh_token:
            raise Exception("No refresh token available")

        response = requests.post(
            f"{self.base_url}/auth/refresh",
            headers={"Authorization": f"Bearer {self.refresh_token}"}
        )
        response.raise_for_status()

        data = response.json()
        self.token = data['token']
        self.token_expires_at = datetime.now() + timedelta(seconds=data['expiresIn'])
        return data['token']

    def get_token(self) -> Optional[str]:
        # Auto-refresh if token is expired
        if self.token_expires_at and datetime.now() >= self.token_expires_at:
            self.refresh_access_token()
        return self.token

    def logout(self):
        self.token = None
        self.refresh_token = None
        self.token_expires_at = None

    def _set_tokens(self, access_token: str, refresh_token: str, expires_in: int):
        self.token = access_token
        self.refresh_token = refresh_token
        self.token_expires_at = datetime.now() + timedelta(seconds=expires_in)

# Usage
auth = AuthService("https://api.hypeai.io/v1")

try:
    user = auth.login("user@example.com", "SecurePass123!")
    print(f"Logged in: {user['username']}")
except requests.HTTPError as e:
    print(f"Login failed: {e}")
```

## 🔒 Security Best Practices

### 1. Token Storage

**✅ Good:**
- Use `httpOnly` cookies (server-side)
- Secure session storage (client-side)
- Environment variables (server-side)

**❌ Bad:**
- localStorage (XSS vulnerable)
- URL parameters
- Plain text files

### 2. Token Lifecycle

```javascript
// Implement automatic token refresh
setInterval(async () => {
  const expiresAt = getTokenExpirationTime();
  const now = Date.now();

  // Refresh 5 minutes before expiration
  if (expiresAt - now < 5 * 60 * 1000) {
    await refreshToken();
  }
}, 60000); // Check every minute
```

### 3. Error Handling

```typescript
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = auth.getToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    // Try to refresh token
    try {
      await auth.refreshAccessToken();
      // Retry original request
      return authenticatedFetch(url, options);
    } catch {
      // Refresh failed, logout user
      auth.logout();
      window.location.href = '/login';
    }
  }

  return response;
}
```

## 📊 Rate Limiting

Authentication endpoints have strict rate limits:

- **Registration**: 3 attempts per hour per IP
- **Login**: 5 attempts per minute per IP
- **Token Refresh**: 10 per hour per user

Rate limit headers:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1642694400
```

## 🧪 Testing

```typescript
describe('Authentication', () => {
  it('should register new user', async () => {
    const user = await auth.register(
      'test@example.com',
      'SecurePass123!',
      'testuser'
    );

    expect(user).toHaveProperty('id');
    expect(user.email).toBe('test@example.com');
    expect(auth.isAuthenticated()).toBe(true);
  });

  it('should login existing user', async () => {
    const user = await auth.login(
      'test@example.com',
      'SecurePass123!'
    );

    expect(user).toHaveProperty('id');
    expect(auth.getToken()).toBeTruthy();
  });

  it('should refresh expired token', async () => {
    // Simulate token expiration
    jest.advanceTimersByTime(3600000);

    const newToken = await auth.refreshAccessToken();
    expect(newToken).toBeTruthy();
    expect(auth.getToken()).toBe(newToken);
  });
});
```

## 🔗 Related Guides

- [Quickstart](./quickstart.md)
- [Error Handling](./error-handling.md)
- [WebSocket Integration](./websocket.md)
- [SDK Examples](../sdk/README.md)
