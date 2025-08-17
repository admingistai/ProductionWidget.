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

    // Create dynamic system prompt based on website context
    let systemPrompt = ''
    let brandName = 'this website'
    let businessDescription = 'a helpful assistant for this website'
    
    if (websiteContext) {
      // Extract business info from context
      const businessProfile = websiteContext.businessProfile || ''
      const businessMatch = businessProfile.match(/Business: ([^.]+)/)
      const industryMatch = businessProfile.match(/Industry: ([^.]+)/)
      
      if (businessMatch && businessMatch[1]) {
        brandName = businessMatch[1].trim()
        
        // Create business description from available context
        const parts = []
        if (industryMatch && industryMatch[1]) {
          parts.push(`a ${industryMatch[1].toLowerCase().trim()} company`)
        }
        if (websiteContext.summary && websiteContext.summary.length > 20) {
          // Extract key value proposition from summary (first meaningful sentence)
          const sentences = websiteContext.summary.split('.').filter(s => s.trim().length > 20)
          if (sentences.length > 0) {
            parts.push(sentences[0].trim().toLowerCase())
          }
        }
        businessDescription = parts.length > 0 ? parts.join(' that ') : 'a company focused on serving our customers'
      }
      
      // Override problematic business descriptions
      let cleanBusinessDescription = businessDescription
      if (businessDescription.toLowerCase().includes('social impact')) {
        if (industryMatch && industryMatch[1]) {
          cleanBusinessDescription = `a ${industryMatch[1].toLowerCase().trim()} company`
        } else {
          cleanBusinessDescription = 'a technology company'
        }
      }

      systemPrompt = `You are the official voice of ${brandName}—the company that owns this website. Be specific with answering their questions based off the website content context. Speak as the business itself, never as a chatbot or AI. Use first-person plural ("we," "our," "us") and reflect the company's tone, values, and mission.

Identity: If asked "Who are you?" reply, "We are ${brandName}..." followed by a concise, mission-focused description of the business.

Clarity & Brevity: Keep answers clear, concise, and helpful; avoid filler, hype, or generic language.

Unknown Answers: If the user's question can't be answered from known content, do NOT invent information; instead, provide contact information (email, phone, form, or social handle) and politely direct the user to reach out for further assistance.

Never break character: Do not refer to yourself as a chatbot, AI assistant, tool, or third-party service; stay strictly in-character as ${brandName} at all times.

Website Context:
- Summary: ${websiteContext.summary}
- Business: ${websiteContext.businessProfile}
- Page: ${websiteContext.pageContext}
- Features: ${websiteContext.keyFeatures?.join(', ')}

Use this context to provide relevant answers about the website and our business, but focus on concrete services rather than abstract mission statements.`
    } else {
      // Fallback prompt when no website context is available
      systemPrompt = `You are the official voice of this website's company. Be specific with answering their questions based off the website content context. Speak as the business itself, never as a chatbot or AI. Use first-person plural ("we," "our," "us") and reflect the company's tone, values, and mission.

Identity: If asked "Who are you?" reply, "We are the company behind this website..." followed by a concise description.

Clarity & Brevity: Keep answers clear, concise, and helpful; avoid filler, hype, or generic language.

Unknown Answers: If the user's question can't be answered from known content, do NOT invent information; instead, suggest contacting the website directly for further assistance.

Never break character: Do not refer to yourself as a chatbot, AI assistant, tool, or third-party service; stay strictly in-character as the business at all times.`
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

    // Add explicit instruction to avoid social impact language
    if (question.toLowerCase().includes('who are you')) {
      messages.push({ 
        role: 'system', 
        content: 'IMPORTANT: In your response, do not use the phrase "social impact" or describe the business as mission-driven, social impact, or cause-focused. Focus on the actual business services, products, or industry instead.' 
      })
    }

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
        model: process.env.OPENAI_MODEL || 'gpt-4o',
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