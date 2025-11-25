import { PrismaClient } from '@prisma/client';

// Configure Prisma for high-concurrency multi-instance environment
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling configuration for multiple instances
  // Each instance will have its own connection pool
  // PostgreSQL can handle ~200 connections, so with 100 instances:
  // connection_limit = total_connections / instances = 200 / 100 = 2 per instance
  // We use a conservative approach with connection_limit in DATABASE_URL
});

// Middleware to handle connection errors and retries
prisma.$use(async (params, next) => {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await next(params);
    } catch (error: any) {
      retries++;
      
      // Retry on connection errors
      if (
        retries < maxRetries &&
        (error.code === 'P1001' || // Can't reach database
         error.code === 'P1002' || // Database timeout
         error.code === 'P2024')   // Connection pool timeout
      ) {
        console.warn(`Database operation retry ${retries}/${maxRetries} for ${params.model}.${params.action}`);
        await new Promise(resolve => setTimeout(resolve, retries * 100)); // Exponential backoff
        continue;
      }
      
      throw error;
    }
  }
});

// Connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🔌 Disconnecting from database...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
};

process.on('beforeExit', gracefulShutdown);
process.on('SIGINT', async () => {
  await gracefulShutdown();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await gracefulShutdown();
  process.exit(0);
});

export default prisma;
