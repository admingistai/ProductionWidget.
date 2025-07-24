import { VercelRequest } from '@vercel/node';

/**
 * Validate service key from Authorization header
 */
export function validateServiceKey(req: VercelRequest): boolean {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const providedKey = authHeader.substring(7); // Remove 'Bearer ' prefix
  const validServiceKey = process.env.SERVICE_KEY;
  
  if (!validServiceKey) {
    console.error('SERVICE_KEY environment variable not set');
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (providedKey.length !== validServiceKey.length) {
    return false;
  }
  
  let mismatch = 0;
  for (let i = 0; i < providedKey.length; i++) {
    mismatch |= providedKey.charCodeAt(i) ^ validServiceKey.charCodeAt(i);
  }
  
  return mismatch === 0;
}

/**
 * Extract session ID from headers
 */
export function getSessionId(req: VercelRequest): string | null {
  return req.headers['x-session-id'] as string || null;
}

/**
 * Extract client version from headers
 */
export function getClientVersion(req: VercelRequest): string | null {
  return req.headers['x-client-version'] as string || null;
}