// Initialize MongoDB Database for Crypto Project

db = db.getSiblingDB('crypto_dev');

// Create collections with validation
db.createCollection('events', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['eventName', 'blockNumber', 'transactionHash', 'timestamp'],
      properties: {
        eventName: {
          bsonType: 'string',
          description: 'Name of the blockchain event'
        },
        contractAddress: {
          bsonType: 'string',
          description: 'Contract address that emitted the event'
        },
        blockNumber: {
          bsonType: 'int',
          description: 'Block number where event occurred'
        },
        transactionHash: {
          bsonType: 'string',
          description: 'Transaction hash'
        },
        args: {
          bsonType: 'object',
          description: 'Event arguments'
        },
        timestamp: {
          bsonType: 'date',
          description: 'Event timestamp'
        }
      }
    }
  }
});

db.createCollection('price_history', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tokenAddress', 'price', 'timestamp'],
      properties: {
        tokenAddress: {
          bsonType: 'string',
          description: 'Token contract address'
        },
        price: {
          bsonType: 'double',
          description: 'Token price in USD'
        },
        volume24h: {
          bsonType: 'double',
          description: '24 hour trading volume'
        },
        marketCap: {
          bsonType: 'double',
          description: 'Market capitalization'
        },
        timestamp: {
          bsonType: 'date',
          description: 'Price snapshot timestamp'
        }
      }
    }
  }
});

db.createCollection('analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['metricType', 'value', 'timestamp'],
      properties: {
        metricType: {
          bsonType: 'string',
          enum: ['holders', 'transactions', 'volume', 'tvl', 'apr'],
          description: 'Type of analytics metric'
        },
        value: {
          bsonType: 'double',
          description: 'Metric value'
        },
        metadata: {
          bsonType: 'object',
          description: 'Additional metric metadata'
        },
        timestamp: {
          bsonType: 'date',
          description: 'Metric timestamp'
        }
      }
    }
  }
});

db.createCollection('user_sessions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['walletAddress', 'sessionToken', 'createdAt'],
      properties: {
        walletAddress: {
          bsonType: 'string',
          description: 'User wallet address'
        },
        sessionToken: {
          bsonType: 'string',
          description: 'Session authentication token'
        },
        ipAddress: {
          bsonType: 'string',
          description: 'User IP address'
        },
        userAgent: {
          bsonType: 'string',
          description: 'Browser user agent'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Session creation time'
        },
        expiresAt: {
          bsonType: 'date',
          description: 'Session expiration time'
        }
      }
    }
  }
});

// Create indexes
db.events.createIndex({ transactionHash: 1 }, { unique: true });
db.events.createIndex({ blockNumber: -1 });
db.events.createIndex({ eventName: 1 });
db.events.createIndex({ timestamp: -1 });

db.price_history.createIndex({ tokenAddress: 1, timestamp: -1 });
db.price_history.createIndex({ timestamp: -1 });

db.analytics.createIndex({ metricType: 1, timestamp: -1 });
db.analytics.createIndex({ timestamp: -1 });

db.user_sessions.createIndex({ walletAddress: 1 });
db.user_sessions.createIndex({ sessionToken: 1 }, { unique: true });
db.user_sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('MongoDB initialized successfully for crypto_dev database');
