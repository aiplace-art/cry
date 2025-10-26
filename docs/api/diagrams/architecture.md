# Architecture Diagrams

Visual representation of HypeAI API architecture and data flows.

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web App<br/>React]
        Mobile[Mobile App<br/>React Native]
        SDK[SDK<br/>JS/Python/Go]
    end

    subgraph "API Gateway"
        Gateway[NGINX<br/>Load Balancer]
        RateLimit[Rate Limiter<br/>Redis]
    end

    subgraph "Application Layer"
        API[REST API<br/>Node.js/Express]
        WS[WebSocket Server<br/>Socket.io]
        Auth[Auth Service<br/>JWT]
    end

    subgraph "Business Logic"
        Presale[Presale Service]
        Payment[Payment Service]
        Analytics[Analytics Service]
        Referral[Referral Service]
    end

    subgraph "Data Layer"
        Postgres[(PostgreSQL<br/>Primary DB)]
        Redis[(Redis<br/>Cache)]
        MongoDB[(MongoDB<br/>Analytics)]
    end

    subgraph "Blockchain"
        BSC[BNB Smart Chain]
        Oracle[Price Oracle]
    end

    subgraph "External Services"
        Stripe[Stripe<br/>Payments]
        Email[SendGrid<br/>Email]
        SMS[Twilio<br/>SMS]
    end

    Web --> Gateway
    Mobile --> Gateway
    SDK --> Gateway

    Gateway --> RateLimit
    RateLimit --> API
    RateLimit --> WS

    API --> Auth
    WS --> Auth

    API --> Presale
    API --> Payment
    API --> Analytics
    API --> Referral

    Presale --> Postgres
    Presale --> Redis
    Presale --> BSC

    Payment --> Stripe
    Payment --> Postgres
    Payment --> BSC

    Analytics --> MongoDB
    Analytics --> Redis

    BSC --> Oracle

    API --> Email
    API --> SMS

    style Web fill:#00e5ff
    style Mobile fill:#00e5ff
    style API fill:#0077ff
    style WS fill:#0077ff
    style Postgres fill:#336791
    style BSC fill:#f3ba2f
```

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth
    participant Redis
    participant DB

    Client->>API: POST /auth/login
    API->>DB: Query user by email
    DB-->>API: User data
    API->>Auth: Verify password
    Auth-->>API: Password valid
    API->>Auth: Generate JWT token
    Auth-->>API: Access + Refresh tokens
    API->>Redis: Store refresh token
    API-->>Client: Return tokens + user data

    Note over Client: Store tokens securely

    Client->>API: GET /users/me (with token)
    API->>Auth: Validate JWT
    Auth-->>API: Token valid
    API->>DB: Get user data
    DB-->>API: User data
    API-->>Client: Return user profile

    Note over Client: Token expired

    Client->>API: POST /auth/refresh
    API->>Redis: Verify refresh token
    Redis-->>API: Token valid
    API->>Auth: Generate new access token
    Auth-->>API: New access token
    API-->>Client: Return new token
```

## 💰 Token Purchase Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Payment
    participant Blockchain
    participant Database
    participant WebSocket

    User->>Frontend: Click "Buy Tokens"
    Frontend->>API: POST /tokens/purchase
    API->>Database: Check presale availability
    Database-->>API: Tokens available

    alt Payment Method: Crypto
        API->>Blockchain: Generate payment address
        Blockchain-->>API: Payment address
        API-->>Frontend: Return address + QR
        Frontend-->>User: Show payment details
        User->>Blockchain: Send crypto
        Blockchain->>API: Webhook: Payment received
    else Payment Method: Card
        API->>Payment: Create Stripe session
        Payment-->>API: Checkout URL
        API-->>Frontend: Return checkout URL
        Frontend-->>User: Redirect to Stripe
        User->>Payment: Complete payment
        Payment->>API: Webhook: Payment successful
    end

    API->>Database: Create transaction
    API->>Database: Update user balance
    API->>Blockchain: Mint tokens (if auto)
    Blockchain-->>API: Transaction hash
    API->>Database: Update transaction status
    API->>WebSocket: Broadcast update
    WebSocket-->>Frontend: Real-time update
    Frontend-->>User: Show success + tx hash
```

## 🌐 WebSocket Communication

```mermaid
sequenceDiagram
    participant Client
    participant WSServer
    participant Auth
    participant Redis
    participant EventBus

    Client->>WSServer: Connect
    WSServer-->>Client: Connection established

    Client->>WSServer: {"type": "auth", "token": "..."}
    WSServer->>Auth: Validate JWT
    Auth-->>WSServer: Token valid
    WSServer->>Redis: Store connection
    WSServer-->>Client: {"type": "auth_success"}

    Client->>WSServer: {"type": "subscribe", "channels": [...]}
    WSServer->>Redis: Add to channel subscribers
    WSServer-->>Client: {"type": "subscribed"}

    Note over EventBus: New presale purchase

    EventBus->>WSServer: presale_update event
    WSServer->>Redis: Get channel subscribers
    Redis-->>WSServer: Subscriber list
    WSServer-->>Client: {"type": "presale_update", "data": {...}}

    Note over Client: Heartbeat

    loop Every 30s
        Client->>WSServer: {"type": "ping"}
        WSServer-->>Client: {"type": "pong"}
    end

    Client->>WSServer: Disconnect
    WSServer->>Redis: Remove connection
```

## 📊 Analytics Pipeline

```mermaid
graph LR
    subgraph "Data Sources"
        API[API Events]
        WS[WebSocket Events]
        Blockchain[Blockchain Events]
    end

    subgraph "Event Processing"
        Queue[Message Queue<br/>RabbitMQ]
        Stream[Stream Processor<br/>Apache Kafka]
    end

    subgraph "Storage"
        Timeseries[TimescaleDB<br/>Metrics]
        Analytics[MongoDB<br/>Analytics]
        Cache[Redis<br/>Real-time]
    end

    subgraph "Analysis"
        Aggregator[Data Aggregator]
        ML[ML Models<br/>Predictions]
    end

    subgraph "Visualization"
        Dashboard[Admin Dashboard]
        API_Out[Analytics API]
    end

    API --> Queue
    WS --> Queue
    Blockchain --> Queue

    Queue --> Stream
    Stream --> Timeseries
    Stream --> Analytics
    Stream --> Cache

    Timeseries --> Aggregator
    Analytics --> Aggregator
    Cache --> Aggregator

    Aggregator --> ML
    ML --> Dashboard

    Aggregator --> API_Out
    API_Out --> Dashboard

    style API fill:#00e5ff
    style Queue fill:#ff6b00
    style Analytics fill:#4caf50
    style Dashboard fill:#9c27b0
```

## 🔄 Presale State Machine

```mermaid
stateDiagram-v2
    [*] --> NotStarted

    NotStarted --> Active: Start presale
    Active --> Paused: Pause
    Paused --> Active: Resume
    Active --> SoldOut: All tokens sold
    Active --> Ended: End time reached
    SoldOut --> Ended: Complete
    Ended --> [*]

    state Active {
        [*] --> AcceptingPurchases
        AcceptingPurchases --> ProcessingPayment: Purchase initiated
        ProcessingPayment --> MintingTokens: Payment confirmed
        MintingTokens --> AcceptingPurchases: Tokens minted
        ProcessingPayment --> AcceptingPurchases: Payment failed
    }

    note right of NotStarted
        Presale configured
        Waiting for start time
    end note

    note right of Active
        Accepting purchases
        Real-time updates
        Token minting
    end note

    note right of SoldOut
        All tokens sold
        No more purchases
    end note

    note right of Ended
        Presale completed
        Final statistics
    end note
```

## 🏦 Payment Processing

```mermaid
graph TB
    Start[User Initiates Purchase] --> Method{Payment Method?}

    Method -->|Crypto| Crypto[Crypto Payment]
    Method -->|Card| Card[Card Payment]

    Crypto --> GenerateAddr[Generate Payment Address]
    GenerateAddr --> ShowQR[Show QR + Address]
    ShowQR --> WaitCrypto[Wait for Transaction]
    WaitCrypto --> VerifyTx[Verify on Blockchain]

    Card --> CreateSession[Create Stripe Session]
    CreateSession --> Redirect[Redirect to Stripe]
    Redirect --> ProcessCard[Process Card Payment]

    VerifyTx --> Confirmed{Confirmed?}
    ProcessCard --> Success{Success?}

    Confirmed -->|Yes| UpdateDB[Update Database]
    Confirmed -->|No| Failed[Mark Failed]

    Success -->|Yes| UpdateDB
    Success -->|No| Failed

    UpdateDB --> MintTokens[Mint Tokens]
    MintTokens --> NotifyUser[Notify User]
    NotifyUser --> BroadcastWS[Broadcast via WebSocket]
    BroadcastWS --> End[Complete]

    Failed --> RetryOption{Retry?}
    RetryOption -->|Yes| Start
    RetryOption -->|No| End

    style Start fill:#00e5ff
    style UpdateDB fill:#4caf50
    style End fill:#4caf50
    style Failed fill:#f44336
```

## 🔍 Database Schema

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : makes
    USERS ||--o{ REFERRALS : refers
    USERS {
        uuid id PK
        string email UK
        string username UK
        string password_hash
        decimal balance
        string referral_code UK
        timestamp created_at
        timestamp updated_at
    }

    TRANSACTIONS ||--|| PRESALE_ROUNDS : belongs_to
    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        uuid round_id FK
        decimal amount
        decimal tokens
        string payment_method
        string status
        string tx_hash
        timestamp created_at
    }

    PRESALE_ROUNDS {
        uuid id PK
        integer round_number
        decimal token_price
        decimal tokens_total
        decimal tokens_sold
        decimal bonus_percentage
        timestamp start_date
        timestamp end_date
    }

    REFERRALS {
        uuid id PK
        uuid referrer_id FK
        uuid referee_id FK
        decimal commission
        timestamp created_at
    }

    ANALYTICS {
        uuid id PK
        date date
        integer total_users
        decimal total_raised
        decimal tokens_sold
        json metrics
    }
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Load Balancing"
        LB[Load Balancer<br/>AWS ALB]
        CDN[CloudFront CDN]
    end

    subgraph "Application Tier"
        API1[API Instance 1]
        API2[API Instance 2]
        API3[API Instance 3]
        WS1[WebSocket 1]
        WS2[WebSocket 2]
    end

    subgraph "Data Tier"
        RDS[(RDS PostgreSQL<br/>Multi-AZ)]
        ElastiCache[(ElastiCache<br/>Redis)]
        DocDB[(DocumentDB<br/>MongoDB)]
    end

    subgraph "Blockchain"
        BSC_Node[BSC Node]
        BSC_Backup[BSC Backup Node]
    end

    subgraph "Monitoring"
        CloudWatch[CloudWatch]
        Sentry[Sentry]
        Datadog[Datadog]
    end

    CDN --> LB
    LB --> API1
    LB --> API2
    LB --> API3
    LB --> WS1
    LB --> WS2

    API1 --> RDS
    API2 --> RDS
    API3 --> RDS

    API1 --> ElastiCache
    API2 --> ElastiCache
    API3 --> ElastiCache

    WS1 --> ElastiCache
    WS2 --> ElastiCache

    API1 --> DocDB
    API2 --> DocDB
    API3 --> DocDB

    API1 --> BSC_Node
    BSC_Node -.Backup.-> BSC_Backup

    API1 --> CloudWatch
    API1 --> Sentry
    API1 --> Datadog

    style LB fill:#ff9800
    style RDS fill:#336791
    style ElastiCache fill:#d62728
    style BSC_Node fill:#f3ba2f
```

## 📈 Scaling Strategy

```mermaid
graph LR
    subgraph "Horizontal Scaling"
        AutoScale[Auto Scaling Group]
        API1[API Instance]
        API2[API Instance]
        API3[API Instance]
        APIx[... more instances]
    end

    subgraph "Database Scaling"
        Primary[(Primary DB)]
        Read1[(Read Replica 1)]
        Read2[(Read Replica 2)]
    end

    subgraph "Cache Layer"
        Redis1[Redis Primary]
        Redis2[Redis Replica]
    end

    AutoScale --> API1
    AutoScale --> API2
    AutoScale --> API3
    AutoScale --> APIx

    API1 -->|Write| Primary
    API1 -->|Read| Read1
    API2 -->|Read| Read2

    Primary -.Replication.-> Read1
    Primary -.Replication.-> Read2

    API1 --> Redis1
    API2 --> Redis1
    Redis1 -.Replication.-> Redis2

    style AutoScale fill:#4caf50
    style Primary fill:#336791
    style Redis1 fill:#d62728
```

## 🔗 Related Documentation

- [API Reference](../spec/openapi.yaml)
- [Quickstart Guide](../guides/quickstart.md)
- [Authentication](../guides/authentication.md)
- [WebSocket Integration](../guides/websocket.md)
