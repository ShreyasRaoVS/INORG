import { Request, Response, NextFunction } from 'express';
import { cache } from '../config/redis';

export interface ErrorLog {
  timestamp: string;
  error: string;
  stack?: string;
  path: string;
  method: string;
  userId?: string;
  userEmail?: string;
  ip: string;
  userAgent: string;
  body?: any;
  query?: any;
  statusCode: number;
}

// Log error to Redis for real-time monitoring
export async function logError(errorLog: ErrorLog) {
  try {
    const errorKey = `error:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    await cache.set(errorKey, errorLog, 86400); // 24 hours TTL
    
    // Also maintain a list of recent errors
    const recentErrorsKey = 'errors:recent';
    const recentErrors = await cache.get<string[]>(recentErrorsKey) || [];
    recentErrors.unshift(errorKey);
    
    // Keep only last 100 errors
    if (recentErrors.length > 100) {
      recentErrors.pop();
    }
    
    await cache.set(recentErrorsKey, recentErrors, 86400);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error logged:', {
        time: errorLog.timestamp,
        path: errorLog.path,
        error: errorLog.error,
        user: errorLog.userEmail || 'anonymous',
      });
    }
  } catch (err) {
    console.error('Failed to log error to Redis:', err);
  }
}

// Middleware to log all errors
export function errorLoggerMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    error: err.message || 'Unknown error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.id,
    userEmail: (req as any).user?.email,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.get('user-agent') || 'unknown',
    body: req.method !== 'GET' ? req.body : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    statusCode: err.statusCode || 500,
  };

  // Log error asynchronously
  logError(errorLog).catch(console.error);

  // Pass to error handler
  next(err);
}

// Get recent errors (for admin dashboard)
export async function getRecentErrors(limit: number = 20): Promise<ErrorLog[]> {
  try {
    const recentErrorsKey = 'errors:recent';
    const errorKeys = await cache.get<string[]>(recentErrorsKey) || [];
    
    const errors: ErrorLog[] = [];
    for (const key of errorKeys.slice(0, limit)) {
      const error = await cache.get<ErrorLog>(key);
      if (error) {
        errors.push(error);
      }
    }
    
    return errors;
  } catch (err) {
    console.error('Failed to get recent errors:', err);
    return [];
  }
}

// Get error statistics
export async function getErrorStats() {
  try {
    const errors = await getRecentErrors(100);
    
    const stats = {
      total: errors.length,
      last24Hours: errors.filter(e => {
        const errorTime = new Date(e.timestamp).getTime();
        const now = Date.now();
        return now - errorTime < 86400000; // 24 hours
      }).length,
      byPath: {} as Record<string, number>,
      byStatusCode: {} as Record<number, number>,
      byUser: {} as Record<string, number>,
    };

    errors.forEach(error => {
      // Count by path
      stats.byPath[error.path] = (stats.byPath[error.path] || 0) + 1;
      
      // Count by status code
      stats.byStatusCode[error.statusCode] = (stats.byStatusCode[error.statusCode] || 0) + 1;
      
      // Count by user
      if (error.userEmail) {
        stats.byUser[error.userEmail] = (stats.byUser[error.userEmail] || 0) + 1;
      }
    });

    return stats;
  } catch (err) {
    console.error('Failed to get error stats:', err);
    return null;
  }
}
