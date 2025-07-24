import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions } from './lib/cors';
import { validateServiceKey, getSessionId } from './lib/auth';
import { checkRateLimit } from './lib/rate-limit';
import { getChatCompletion, validateOpenAIConfig } from './lib/openai';
import type { ChatRequest, APIResponse } from '../src/types/widget';

/**
 * Main chat API endpoint handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers for all responses
  setCorsHeaders(res);
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        message: 'Method not allowed',
        type: 'method_not_allowed'
      }
    } as APIResponse);
  }
  
  try {
    // Validate service key
    if (!validateServiceKey(req)) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or missing service key',
          type: 'authentication_failed',
          code: 'INVALID_SERVICE_KEY'
        }
      } as APIResponse);
    }
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(req);
    if (!rateLimitResult.allowed) {
      res.setHeader('Retry-After', rateLimitResult.retryAfter?.toString() || '60');
      return res.status(429).json({
        success: false,
        error: {
          message: 'Rate limit exceeded. Please try again later.',
          type: 'rate_limit_exceeded',
          code: 'RATE_LIMIT'
        }
      } as APIResponse);
    }
    
    // Validate OpenAI configuration
    const configCheck = validateOpenAIConfig();
    if (!configCheck.valid) {
      console.error('OpenAI configuration error:', configCheck.error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'AI service not properly configured',
          type: 'configuration_error',
          code: 'CONFIG_ERROR'
        }
      } as APIResponse);
    }
    
    // Parse and validate request body
    const chatRequest = req.body as ChatRequest;
    
    if (!chatRequest.question || typeof chatRequest.question !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Question is required',
          type: 'validation_error',
          code: 'MISSING_QUESTION'
        }
      } as APIResponse);
    }
    
    if (chatRequest.question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Question cannot be empty',
          type: 'validation_error',
          code: 'EMPTY_QUESTION'
        }
      } as APIResponse);
    }
    
    if (chatRequest.question.length > 1000) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Question is too long (max 1000 characters)',
          type: 'validation_error',
          code: 'QUESTION_TOO_LONG'
        }
      } as APIResponse);
    }
    
    if (!chatRequest.websiteContext) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Website context is required',
          type: 'validation_error',
          code: 'MISSING_CONTEXT'
        }
      } as APIResponse);
    }
    
    // Log request info (without sensitive data)
    const sessionId = getSessionId(req);
    console.log('Chat request:', {
      sessionId,
      questionLength: chatRequest.question.length,
      conversationLength: chatRequest.conversation?.length || 0,
      contextTokens: chatRequest.websiteContext.estimatedTokens
    });
    
    // Get chat completion from OpenAI
    const result = await getChatCompletion({
      question: chatRequest.question,
      websiteContext: chatRequest.websiteContext,
      conversation: chatRequest.conversation || [],
      customSystemPrompt: chatRequest.customSystemPrompt
    });
    
    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        answer: result.answer,
        usage: result.usage
      }
    } as APIResponse);
    
  } catch (error) {
    // Log error details
    console.error('Chat API error:', error);
    
    // Handle known error types
    if (error instanceof Error) {
      // Don't expose internal error details in production
      const isProduction = process.env.NODE_ENV === 'production';
      const errorMessage = isProduction && !error.message.includes('AI service') 
        ? 'An error occurred processing your request' 
        : error.message;
      
      return res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          type: 'internal_error',
          code: 'INTERNAL_ERROR'
        }
      } as APIResponse);
    }
    
    // Unknown error type
    return res.status(500).json({
      success: false,
      error: {
        message: 'An unexpected error occurred',
        type: 'unknown_error',
        code: 'UNKNOWN_ERROR'
      }
    } as APIResponse);
  }
}