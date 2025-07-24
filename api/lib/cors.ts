import { VercelResponse } from '@vercel/node';

/**
 * Configure CORS headers for cross-origin widget embedding
 */
export function setCorsHeaders(res: VercelResponse, origin?: string): void {
  // Allow all origins for now, but could be restricted to specific domains
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-ID, X-Client-Version, x-client-version, x-session-id');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.setHeader('Access-Control-Allow-Credentials', 'false');
}

/**
 * Handle preflight OPTIONS request
 */
export function handleOptions(res: VercelResponse): void {
  setCorsHeaders(res);
  res.status(200).end();
}