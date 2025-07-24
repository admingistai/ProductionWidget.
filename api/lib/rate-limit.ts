import { VercelRequest } from '@vercel/node';

// In-memory storage for rate limiting (works with Vercel's serverless functions)
// Note: This resets when the function cold starts, which is acceptable for basic rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Get rate limit configuration from environment or use defaults
 */
function getRateLimitConfig(): RateLimitConfig {
  return {
    maxRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '20', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10) // 1 minute default
  };
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(req: VercelRequest): { allowed: boolean; retryAfter?: number } {
  const config = getRateLimitConfig();
  
  // Use service key or IP as identifier
  const authHeader = req.headers.authorization;
  const serviceKey = authHeader?.substring(7) || ''; // Remove 'Bearer ' prefix
  const identifier = serviceKey || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  
  const now = Date.now();
  const rateLimitData = rateLimitMap.get(identifier);
  
  // Clean up old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, data] of rateLimitMap.entries()) {
      if (data.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!rateLimitData || rateLimitData.resetTime < now) {
    // First request or window expired
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return { allowed: true };
  }
  
  if (rateLimitData.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000); // in seconds
    return { allowed: false, retryAfter };
  }
  
  // Increment count
  rateLimitData.count++;
  return { allowed: true };
}

/**
 * Get remaining requests for an identifier
 */
export function getRemainingRequests(req: VercelRequest): number {
  const config = getRateLimitConfig();
  const authHeader = req.headers.authorization;
  const serviceKey = authHeader?.substring(7) || '';
  const identifier = serviceKey || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  
  const rateLimitData = rateLimitMap.get(identifier);
  if (!rateLimitData || rateLimitData.resetTime < Date.now()) {
    return config.maxRequests;
  }
  
  return Math.max(0, config.maxRequests - rateLimitData.count);
}