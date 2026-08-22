// js/gemini.js
// Client-side helper module for secure Gemini AI capabilities via backend /api/gemini
// NOTE: No API keys are stored or exposed here. All requests proxy through /api/gemini.

const ReadXGemini = (function () {
  const ENDPOINT = '/api/gemini';

  /**
   * Core request dispatcher to serverless backend
   */
  async function request(payload) {
    const debugInfo = {
      endpoint: ENDPOINT,
      action: payload.action || 'generate',
      model: payload.model || 'gemini-1.5-flash',
      promptPreview: payload.prompt ? (payload.prompt.length > 80 ? payload.prompt.slice(0, 80) + '...' : payload.prompt) : ''
    };

    console.log('🚀 [ReadXGemini Request]', debugInfo);

    let response;
    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (netErr) {
      console.error('❌ [ReadXGemini Network Error]', netErr);
      throw new Error(`Network connection error: Unable to reach ${ENDPOINT}. (${netErr.message})`);
    }

    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();

    console.log('📥 [ReadXGemini Response]', {
      status: response.status,
      statusText: response.statusText,
      contentType: contentType,
      rawBody: rawText ? (rawText.length > 300 ? rawText.slice(0, 300) + '...' : rawText) : '(empty)'
    });

    let data = null;
    if (rawText && rawText.trim()) {
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn('⚠️ [ReadXGemini Non-JSON response received]');
        // If HTTP 200 with plain text, treat rawText as valid output
        if (response.ok) {
          data = { success: true, text: rawText };
        }
      }
    }

    // Handle non-200 HTTP statuses
    if (!response.ok) {
      let errorMessage = '';

      if (data && (data.error || data.message)) {
        errorMessage = typeof data.error === 'string' ? data.error : (data.error?.message || data.message);
      } else if (rawText) {
        // Strip HTML if server returned an HTML error page (e.g. 404/500/504)
        const cleanMsg = rawText.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        errorMessage = cleanMsg ? cleanMsg.slice(0, 260) : `Server returned HTTP ${response.status} (${response.statusText})`;
      } else {
        errorMessage = `Server returned HTTP ${response.status} (${response.statusText || 'Error'})`;
      }

      if (response.status === 404) {
        errorMessage = `Endpoint ${ENDPOINT} returned 404 Not Found. If testing locally on a static server, /api/gemini requires Vercel CLI ('vercel dev') or serverless deployment.`;
      }

      console.error('❌ [ReadXGemini Error]', errorMessage);
      throw new Error(errorMessage);
    }

    if (!data) {
      throw new Error(`Empty response received from server (HTTP ${response.status})`);
    }

    if (data.success === false) {
      throw new Error(data.error || 'Gemini API request failed.');
    }

    // Support both standard { success: true, text: "..." } and raw Gemini structure
    let extractedText = '';
    if (typeof data.text === 'string') {
      extractedText = data.text;
    } else if (data.candidates && data.candidates[0]?.content?.parts) {
      extractedText = data.candidates[0].content.parts.map(p => p.text || '').join('');
    } else if (typeof data === 'string') {
      extractedText = data;
    }

    if (!extractedText.trim()) {
      throw new Error('Gemini returned an empty response. Please try rephrasing your request.');
    }

    console.log('✅ [ReadXGemini Success]', {
      action: payload.action,
      responseLength: extractedText.length
    });

    return {
      success: true,
      text: extractedText,
      action: payload.action,
      model: data.model || payload.model
    };
  }

  /**
   * General text generation
   * @param {Object} opts { prompt, action, model, temperature, systemInstruction }
   */
  async function generate(opts = {}) {
    const payload = {
      prompt: opts.prompt || opts.text || '',
      action: opts.action || 'generate',
      model: opts.model || 'gemini-1.5-flash',
      temperature: opts.temperature ?? 0.7,
      systemInstruction: opts.systemInstruction
    };
    const res = await request(payload);
    return res.text;
  }

  /**
   * Simplifies text for dyslexia accessibility
   * @param {string} text 
   * @param {Object} options 
   */
  async function simplifyText(text, options = {}) {
    if (!text || !text.trim()) throw new Error('Text to simplify cannot be empty.');
    const res = await request({
      action: 'simplify',
      prompt: text,
      ...options
    });
    return res.text;
  }

  /**
   * Explains a complex concept or technical term
   * @param {string} concept 
   * @param {Object} options 
   */
  async function explainConcept(concept, options = {}) {
    if (!concept || !concept.trim()) throw new Error('Concept to explain cannot be empty.');
    const res = await request({
      action: 'explain',
      prompt: concept,
      ...options
    });
    return res.text;
  }

  /**
   * Generates a concise summary
   * @param {string} text 
   * @param {Object} options 
   */
  async function summarizeText(text, options = {}) {
    if (!text || !text.trim()) throw new Error('Text to summarize cannot be empty.');
    const res = await request({
      action: 'summarize',
      prompt: text,
      ...options
    });
    return res.text;
  }

  /**
   * Generates multiple-choice quiz questions
   * @param {string} text 
   * @param {Object} options 
   */
  async function generateQuiz(text, options = {}) {
    if (!text || !text.trim()) throw new Error('Content for quiz generation cannot be empty.');
    const res = await request({
      action: 'quiz',
      prompt: text,
      ...options
    });
    
    // Attempt to parse JSON response for structured quiz questions
    try {
      const cleaned = res.text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      return res.text;
    }
  }

  return {
    generate,
    simplifyText,
    explainConcept,
    summarizeText,
    generateQuiz
  };
})();

if (typeof window !== 'undefined') {
  window.ReadXGemini = ReadXGemini;
}
