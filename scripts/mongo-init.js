// MongoDB initialization script
db = db.getSiblingDB('crypto_db');

// Create collections
db.createCollection('users');
db.createCollection('stakes');
db.createCollection('transactions');
db.createCollection('tokenprices');
db.createCollection('aipredictions');

// Create indexes
db.users.createIndex({ "walletAddress": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { sparse: true });
db.stakes.createIndex({ "userId": 1 });
db.stakes.createIndex({ "status": 1 });
db.transactions.createIndex({ "txHash": 1 }, { unique: true });
db.transactions.createIndex({ "userId": 1 });
db.tokenprices.createIndex({ "symbol": 1 });
db.tokenprices.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 3600 });
db.aipredictions.createIndex({ "symbol": 1 });
db.aipredictions.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 86400 });

print('MongoDB initialized successfully!');
