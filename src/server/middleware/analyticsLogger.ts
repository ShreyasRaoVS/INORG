import { Request, Response, NextFunction } from 'express';
import { cache } from '../config/redis';

export interface RequestLog {
  timestamp: string;
  path: string;
  method: string;
  userId?: string;
  userEmail?: string;
  statusCode: number;
  responseTime: number;
  ip: string;
  userAgent: string;
}

// Log request analytics
export async function logRequest(log: RequestLog) {
  try {
    // Store in Redis with TTL
    const logKey = `analytics:request:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    await cache.set(logKey, log, 604800); // 7 days TTL
    
    // Increment counters
    const today = new Date().toISOString().split('T')[0];
    await cache.increment(`analytics:requests:${today}`, 86400);
    
    if (log.userId) {
      await cache.increment(`analytics:user:${log.userId}:${today}`, 86400);
    }
    
    // Track endpoint usage
    await cache.increment(`analytics:endpoint:${log.path}:${today}`, 86400);
  } catch (err) {
    console.error('Failed to log analytics:', err);
  }
}

// Middleware to track requests
export function analyticsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    const responseTime = Date.now() - startTime;
    
    const log: RequestLog = {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      userId: (req as any).user?.id,
      userEmail: (req as any).user?.email,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    };
    
    // Log asynchronously
    logRequest(log).catch(console.error);
    
    return originalSend.call(this, data);
  };
  
  next();
}

// Get analytics data
export async function getAnalytics(days: number = 7) {
  try {
    const stats: any = {
      requestsByDay: {},
      topEndpoints: {},
      activeUsers: new Set(),
      averageResponseTime: 0,
      statusCodes: {},
    };
    
    // Get today's date
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const requests = await cache.get<number>(`analytics:requests:${dateStr}`);
      stats.requestsByDay[dateStr] = requests || 0;
    }
    
    return stats;
  } catch (err) {
    console.error('Failed to get analytics:', err);
    return null;
  }
}

// Get user activity
export async function getUserActivity(userId: string, days: number = 30) {
  try {
    const activity: Record<string, number> = {};
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = await cache.get<number>(`analytics:user:${userId}:${dateStr}`);
      activity[dateStr] = count || 0;
    }
    
    return activity;
  } catch (err) {
    console.error('Failed to get user activity:', err);
    return {};
  }
}
