import { createClient } from 'redis';

// Redis client for session management, caching, and Socket.IO adapter
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis: Too many reconnection attempts, giving up');
        return new Error('Too many reconnection attempts');
      }
      // Exponential backoff: 50ms, 100ms, 200ms, 400ms, etc.
      const delay = Math.min(retries * 50, 3000);
      console.log(`🔄 Redis: Reconnecting in ${delay}ms (attempt ${retries})`);
      return delay;
    },
  },
});

const redisPublisher = redisClient.duplicate();
const redisSubscriber = redisClient.duplicate();

// Error handling
redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('🔗 Redis Client: Connecting...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis Client: Ready');
});

redisPublisher.on('error', (err) => {
  console.error('❌ Redis Publisher Error:', err);
});

redisSubscriber.on('error', (err) => {
  console.error('❌ Redis Subscriber Error:', err);
});

// Initialize connections
export async function connectRedis() {
  try {
    await redisClient.connect();
    await redisPublisher.connect();
    await redisSubscriber.connect();
    console.log('✅ All Redis connections established');
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
}

// Health check
export async function checkRedisConnection(): Promise<boolean> {
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectRedis() {
  console.log('🔌 Disconnecting from Redis...');
  await redisClient.quit();
  await redisPublisher.quit();
  await redisSubscriber.quit();
  console.log('✅ Redis disconnected');
}

// Cache helper functions
export const cache = {
  // Get cached data
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  // Set cached data with optional TTL (in seconds)
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redisClient.setEx(key, ttl, serialized);
      } else {
        await redisClient.set(key, serialized);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  },

  // Delete cached data
  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  },

  // Delete multiple keys matching a pattern
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error(`Cache deletePattern error for pattern ${pattern}:`, error);
    }
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      return (await redisClient.exists(key)) === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  },

  // Increment counter (useful for rate limiting)
  async increment(key: string, ttl?: number): Promise<number> {
    try {
      const value = await redisClient.incr(key);
      if (ttl && value === 1) {
        await redisClient.expire(key, ttl);
      }
      return value;
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  },
};

export { redisClient, redisPublisher, redisSubscriber };
