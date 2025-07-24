import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from './lib/cors';
import { validateOpenAIConfig } from './lib/openai';

/**
 * Health check endpoint to verify API is running
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  setCorsHeaders(res);
  
  // Basic health check
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      serviceKey: !!process.env.SERVICE_KEY,
      openaiConfig: validateOpenAIConfig().valid
    }
  };
  
  const allChecksPass = Object.values(health.checks).every(check => check === true);
  
  res.status(allChecksPass ? 200 : 503).json({
    ...health,
    status: allChecksPass ? 'ok' : 'degraded'
  });
}