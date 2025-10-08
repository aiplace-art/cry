const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { logger } = require('../config/logger');

let wss = null;
const clients = new Map();

/**
 * Setup WebSocket server
 */
const setupWebSocket = (server) => {
  wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', async (ws, req) => {
    logger.info('New WebSocket connection');

    // Handle authentication
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'auth') {
          await handleAuthentication(ws, data.token);
        } else if (data.type === 'subscribe') {
          handleSubscription(ws, data.channels);
        } else if (data.type === 'unsubscribe') {
          handleUnsubscription(ws, data.channels);
        }
      } catch (error) {
        logger.error(`WebSocket message error: ${error.message}`);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      handleDisconnection(ws);
      logger.info('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      logger.error(`WebSocket error: ${error.message}`);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connection established',
      timestamp: new Date().toISOString()
    }));
  });

  logger.info('WebSocket server initialized');

  // Start price update broadcast
  startPriceUpdates();

  return wss;
};

/**
 * Handle client authentication
 */
const handleAuthentication = async (ws, token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Store authenticated client
    clients.set(ws, {
      userId: decoded.userId,
      walletAddress: decoded.walletAddress,
      subscriptions: new Set(),
      authenticated: true
    });

    ws.send(JSON.stringify({
      type: 'auth_success',
      message: 'Authentication successful',
      userId: decoded.userId
    }));

    logger.info(`Client authenticated: ${decoded.userId}`);
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'auth_error',
      message: 'Authentication failed'
    }));
    logger.error(`Authentication error: ${error.message}`);
  }
};

/**
 * Handle channel subscriptions
 */
const handleSubscription = (ws, channels) => {
  const client = clients.get(ws);

  if (!client) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Not authenticated'
    }));
    return;
  }

  if (Array.isArray(channels)) {
    channels.forEach(channel => client.subscriptions.add(channel));
  } else {
    client.subscriptions.add(channels);
  }

  ws.send(JSON.stringify({
    type: 'subscribed',
    channels: Array.from(client.subscriptions)
  }));

  logger.info(`Client subscribed to: ${channels}`);
};

/**
 * Handle channel unsubscriptions
 */
const handleUnsubscription = (ws, channels) => {
  const client = clients.get(ws);

  if (!client) return;

  if (Array.isArray(channels)) {
    channels.forEach(channel => client.subscriptions.delete(channel));
  } else {
    client.subscriptions.delete(channels);
  }

  ws.send(JSON.stringify({
    type: 'unsubscribed',
    channels: Array.from(client.subscriptions)
  }));
};

/**
 * Handle client disconnection
 */
const handleDisconnection = (ws) => {
  clients.delete(ws);
};

/**
 * Broadcast message to specific channel
 */
const broadcast = (channel, data) => {
  clients.forEach((client, ws) => {
    if (client.subscriptions.has(channel) && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'update',
        channel,
        data,
        timestamp: new Date().toISOString()
      }));
    }
  });
};

/**
 * Send message to specific user
 */
const sendToUser = (userId, data) => {
  clients.forEach((client, ws) => {
    if (client.userId === userId && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'notification',
        data,
        timestamp: new Date().toISOString()
      }));
    }
  });
};

/**
 * Broadcast price updates
 */
const startPriceUpdates = () => {
  const tokenService = require('../services/token.service');

  // Update prices every 30 seconds
  setInterval(async () => {
    try {
      const symbols = ['BTC', 'ETH', 'USDT', 'USDC', 'DAI'];
      const prices = await tokenService.getTokenPrices(symbols);

      broadcast('prices', {
        prices: prices.map(p => ({
          symbol: p.symbol,
          price: p.price,
          change24h: p.change24h
        }))
      });
    } catch (error) {
      logger.error(`Price update broadcast error: ${error.message}`);
    }
  }, 30000);
};

/**
 * Broadcast transaction update
 */
const broadcastTransaction = (userId, transaction) => {
  sendToUser(userId, {
    type: 'transaction',
    transaction
  });
};

/**
 * Broadcast stake update
 */
const broadcastStakeUpdate = (userId, stake) => {
  sendToUser(userId, {
    type: 'stake',
    stake
  });
};

/**
 * Broadcast AI prediction
 */
const broadcastAIPrediction = (prediction) => {
  broadcast(`ai:${prediction.tokenSymbol}`, {
    type: 'prediction',
    prediction
  });
};

module.exports = {
  setupWebSocket,
  broadcast,
  sendToUser,
  broadcastTransaction,
  broadcastStakeUpdate,
  broadcastAIPrediction
};
