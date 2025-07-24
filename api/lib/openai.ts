import OpenAI from 'openai';
import type { ChatMessage } from '../../src/types/widget';
import type { OptimizedContext } from '../../src/content-optimizer';

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

/**
 * Get or create OpenAI client instance
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    openaiClient = new OpenAI({
      apiKey,
      maxRetries: 2,
      timeout: 30000, // 30 seconds
    });
  }
  
  return openaiClient;
}

/**
 * Build system prompt with website context
 */
function buildSystemPrompt(websiteContext: OptimizedContext, customPrompt?: string): string {
  const basePrompt = customPrompt || 'You are a helpful AI assistant embedded on a website.';
  
  return `${basePrompt}

You are currently embedded on a website with the following context:

Business Profile: ${websiteContext.businessProfile}

Page Summary: ${websiteContext.summary}

Current Page Context: ${websiteContext.pageContext}

Key Features: ${websiteContext.keyFeatures.join(', ')}

Use this context to provide relevant and helpful responses to user questions. Be concise, friendly, and focused on helping users with information about this website or business.`;
}

/**
 * Convert conversation history to OpenAI format
 */
function buildMessages(
  systemPrompt: string,
  question: string,
  conversation: ChatMessage[]
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Add conversation history (last 5 messages)
  const recentConversation = conversation.slice(-5);
  for (const msg of recentConversation) {
    messages.push({ role: 'user', content: msg.question });
    messages.push({ role: 'assistant', content: msg.answer });
  }
  
  // Add current question
  messages.push({ role: 'user', content: question });
  
  return messages;
}

export interface ChatCompletionOptions {
  question: string;
  websiteContext: OptimizedContext;
  conversation: ChatMessage[];
  customSystemPrompt?: string;
}

export interface ChatCompletionResult {
  answer: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Get chat completion from OpenAI
 */
export async function getChatCompletion({
  question,
  websiteContext,
  conversation,
  customSystemPrompt
}: ChatCompletionOptions): Promise<ChatCompletionResult> {
  try {
    const client = getOpenAIClient();
    const systemPrompt = buildSystemPrompt(websiteContext, customSystemPrompt);
    const messages = buildMessages(systemPrompt, question, conversation);
    
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    const maxTokens = parseInt(process.env.MAX_TOKENS || '1000', 10);
    
    const completion = await client.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
    });
    
    const choice = completion.choices[0];
    if (!choice?.message?.content) {
      throw new Error('No response generated from OpenAI');
    }
    
    return {
      answer: choice.message.content.trim(),
      usage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      } : undefined
    };
    
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      // Handle specific OpenAI errors
      if (error.status === 429) {
        throw new Error('AI service rate limit exceeded. Please try again later.');
      } else if (error.status === 401) {
        throw new Error('AI service authentication failed.');
      } else if (error.status === 503) {
        throw new Error('AI service temporarily unavailable.');
      }
      throw new Error(`AI service error: ${error.message}`);
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Validate OpenAI configuration
 */
export function validateOpenAIConfig(): { valid: boolean; error?: string } {
  if (!process.env.OPENAI_API_KEY) {
    return { valid: false, error: 'OPENAI_API_KEY not configured' };
  }
  
  if (process.env.OPENAI_API_KEY.length < 20) {
    return { valid: false, error: 'OPENAI_API_KEY appears to be invalid' };
  }
  
  return { valid: true };
}