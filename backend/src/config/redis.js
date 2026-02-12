const Redis = require('ioredis');
const { logger } = require('../utils/logger');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redisClient.on('connect', () => {
    logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
    logger.error('Redis client error:', err);
});

// Create a duplicate client for pub/sub (required for socket.io adapter)
const createRedisClient = () => {
    return new Redis(redisUrl, {
        maxRetriesPerRequest: 3
    });
};

module.exports = {
    redisClient,
    createRedisClient
};
