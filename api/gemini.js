// api/gemini.js
// Vercel Serverless Function for Google Gemini API Integration

const ALLOWED_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite-preview-02-05'
];

const DEFAULT_MODEL = 'gemini-1.5-flash';

// System prompts tailored for assistive dyslexia reading and comprehension
const DYSLEXIA_SYSTEM_PROMPTS = {
  simplify: `You are an assistive AI designed for readers with dyslexia.
Your goal is to simplify and reformat the provided text to maximize reading ease and comprehension:
- Use simple, direct, and common vocabulary.
- Keep sentences short (under 15 words where possible) and avoid complex nested clauses.
- Break ideas into clear, bulleted points or short paragraphs.
- Highlight key terms with bold text.
- Preserve the original meaning and critical technical details accurately.`,

  explain: `You are an assistive AI tutor designed for readers with dyslexia.
Explain the concept or highlighted text in an intuitive, accessible way:
- Use clear analogies, concrete real-world examples, and visual descriptions.
- Use plain language with bullet points and bold keywords.
- Break multi-step logic into numbered steps.
- Avoid unnecessary jargon or explain any required terms immediately.`,

  summarize: `You are an assistive reading assistant for dyslexia.
Summarize the provided content into clear, easily scannable takeaways:
- Provide a 1-sentence big-picture summary at the top.
- Provide 3 to 5 concise bullet points highlighting key insights.
- Use simple sentence structures and bold key terms.`,

  quiz: `You are an assistive educational AI.
Generate 3 to 5 multiple-choice questions based on the provided text to test comprehension.
Return a valid JSON array of objects with the structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 0,
    "explanation": "Brief explanation of why this answer is correct."
  }
]
Only output the JSON array without any markdown fences or commentary.`
};

/**
 * Sanitizes any string to ensure API keys or secret tokens are NEVER leaked.
 */
function sanitizeOutput(text, apiKey) {
  if (!text || typeof text !== 'string') return '';
  if (apiKey && apiKey.length > 4) {
    return text.replaceAll(apiKey, '[REDACTED_API_KEY]');
  }
  return text;
}

async function handler(req, res) {
  const method = (req.method || 'POST').toUpperCase();

  // Set CORS and Security headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Handle preflight OPTIONS request
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle unsupported HTTP methods
  if (method !== 'POST' && method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: `HTTP 405 Method ${method} Not Allowed. Please use POST or GET.`
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Verify that the environment variable is configured
  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ [api/gemini] GEMINI_API_KEY environment variable is not set on server.');
    return res.status(500).json({
      success: false,
      error: 'Gemini API is not configured on the server. Please verify GEMINI_API_KEY in Vercel Environment Variables.'
    });
  }

  try {
    let params = {};

    if (method === 'GET') {
      // In Vercel, req.query is already parsed, or parse from req.url
      params = req.query || {};
      if (Object.keys(params).length === 0 && req.url && req.url.includes('?')) {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          params = Object.fromEntries(urlObj.searchParams.entries());
        } catch (e) {
          params = {};
        }
      }
    } else {
      // POST method: parse body
      let body = req.body;

      // Support streaming body parsing if body was not pre-parsed by middleware
      if (!body && req.readable) {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const rawString = Buffer.concat(chunks).toString('utf8');
        if (rawString) {
          try {
            body = JSON.parse(rawString);
          } catch (e) {
            body = rawString;
          }
        }
      }

      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (parseErr) {
          return res.status(400).json({
            success: false,
            error: 'Invalid JSON body in request.'
          });
        }
      }

      params = (body && typeof body === 'object') ? body : {};
    }

    const {
      prompt,
      action = 'generate',
      text = '',
      model = DEFAULT_MODEL,
      systemInstruction,
      temperature = 0.7,
      maxOutputTokens = 2048
    } = params;

    // Validate prompt or content
    const inputContent = (prompt || text || '').trim();
    if (!inputContent) {
      return res.status(400).json({
        success: false,
        error: 'Missing required prompt or text content.'
      });
    }

    // Select model safely
    const targetModel = ALLOWED_MODELS.includes(model) ? model : DEFAULT_MODEL;

    // Build system instruction
    let activeSystemInstruction = systemInstruction;
    if (!activeSystemInstruction && DYSLEXIA_SYSTEM_PROMPTS[action]) {
      activeSystemInstruction = DYSLEXIA_SYSTEM_PROMPTS[action];
    }

    // Construct Gemini REST API payload
    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: inputContent }]
        }
      ],
      generationConfig: {
        temperature: Math.max(0, Math.min(2, Number(temperature) || 0.7)),
        maxOutputTokens: Math.max(1, Math.min(8192, Number(maxOutputTokens) || 2048))
      }
    };

    if (activeSystemInstruction && typeof activeSystemInstruction === 'string') {
      geminiPayload.systemInstruction = {
        parts: [{ text: activeSystemInstruction }]
      };
    }

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiResponse = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiPayload)
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const errorMsg = data?.error?.message || 'Upstream Gemini API error';
      const safeMsg = sanitizeOutput(errorMsg, apiKey);
      return res.status(geminiResponse.status >= 400 && geminiResponse.status < 600 ? geminiResponse.status : 502).json({
        success: false,
        error: safeMsg
      });
    }

    // Extract text from Gemini response
    const candidate = data.candidates?.[0];
    const generatedText = candidate?.content?.parts?.map(p => p.text || '').join('') || '';

    if (!generatedText.trim()) {
      return res.status(502).json({
        success: false,
        error: 'Gemini returned an empty response. Content may have triggered safety filters.'
      });
    }

    return res.status(200).json({
      success: true,
      text: sanitizeOutput(generatedText, apiKey),
      action: action,
      model: targetModel,
      finishReason: candidate?.finishReason || 'STOP'
    });

  } catch (err) {
    const safeError = sanitizeOutput(err?.message || 'Internal server error while processing request.', apiKey);
    return res.status(500).json({
      success: false,
      error: safeError
    });
  }
}

module.exports = handler;
module.exports.default = handler;
