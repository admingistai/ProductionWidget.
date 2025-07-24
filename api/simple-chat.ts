/**
 * Simple Backend API Route for Widget Chat
 * Handles OpenAI integration securely with your API key
 * 
 * This is a simplified version for easy deployment to Vercel, Railway, etc.
 */

interface ChatRequest {
  question: string
  websiteContext?: {
    summary: string
    businessProfile: string
    pageContext: string
    keyFeatures: string[]
  }
  conversation?: Array<{
    id: string
    question: string
    answer: string
    timestamp: string
  }>
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-ID, X-Client-Version')

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: { message: 'Method not allowed' } 
    })
  }

  try {
    // Get OpenAI API key from environment (YOU set this on your backend)
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('❌ OPENAI_API_KEY not configured in environment')
      return res.status(500).json({
        success: false,
        error: { message: 'AI service not configured' }
      })
    }

    // Optional: Validate service key (for extra security)
    const serviceKey = process.env.WIDGET_SERVICE_KEY
    if (serviceKey) {
      const authHeader = req.headers.authorization
      const providedKey = authHeader?.replace('Bearer ', '')
      if (providedKey !== serviceKey) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' }
        })
      }
    }

    // Parse request
    const { question, websiteContext, conversation = [] }: ChatRequest = req.body

    // Validate request
    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Question is required' }
      })
    }

    if (question.length > 1000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Question too long (max 1000 characters)' }
      })
    }

    // Build OpenAI conversation
    const messages: OpenAIMessage[] = []

    // System prompt with website context
    let systemPrompt = 'You are a helpful AI assistant embedded in a website. Answer questions concisely and helpfully.'
    
    if (websiteContext) {
      systemPrompt += `\n\nWebsite Context:\n- Summary: ${websiteContext.summary}\n- Business: ${websiteContext.businessProfile}\n- Page: ${websiteContext.pageContext}\n- Features: ${websiteContext.keyFeatures?.join(', ')}\n\nUse this context to provide relevant answers about the website.`
    }

    messages.push({ role: 'system', content: systemPrompt })

    // Add recent conversation history (last 5 messages)
    const recentConversation = conversation.slice(-5)
    for (const msg of recentConversation) {
      messages.push({ role: 'user', content: msg.question })
      messages.push({ role: 'assistant', content: msg.answer })
    }

    // Add current question
    messages.push({ role: 'user', content: question.trim() })

    console.log('🤖 Calling OpenAI API...', { 
      messages: messages.length,
      hasContext: !!websiteContext 
    })

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
      })
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json().catch(() => ({}))
      console.error('❌ OpenAI API Error:', openaiResponse.status, error)
      
      return res.status(500).json({
        success: false,
        error: { 
          message: 'AI service error: ' + (error.error?.message || 'Request failed')
        }
      })
    }

    const data = await openaiResponse.json()
    const answer = data.choices?.[0]?.message?.content

    if (!answer) {
      console.error('❌ No answer from OpenAI:', data)
      return res.status(500).json({
        success: false,
        error: { message: 'No response generated' }
      })
    }

    console.log('✅ OpenAI response successful')
    
    // Success response
    return res.status(200).json({
      success: true,
      data: {
        answer: answer.trim(),
        usage: data.usage
      }
    })

  } catch (error) {
    console.error('❌ Backend API Error:', error)
    return res.status(500).json({
      success: false,
      error: { 
        message: 'Internal server error'
      }
    })
  }
}