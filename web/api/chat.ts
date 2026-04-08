/**
 * api/chat.ts — Vercel Edge Function for Groq AI chat
 *
 * Reads GROQ_API_KEY from server-side env only — never exposed to the browser bundle.
 * Set it in Vercel dashboard → Project Settings → Environment Variables.
 *
 * Handles: 401, 429, timeout (25s), missing key, malformed AI response.
 */
export const config = { runtime: 'edge' };

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TIMEOUT_MS = 25_000;

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: string;
}

function jsonResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }, 405);
  }

  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) {
    return jsonResponse(
      { error: 'AI service is not configured on this server.', code: 'NO_KEY' },
      503,
    );
  }

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body', code: 'BAD_REQUEST' }, 400);
  }

  const { messages, context } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonResponse({ error: 'messages array is required', code: 'BAD_REQUEST' }, 400);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are SpendWise AI, a helpful and friendly personal finance assistant. Be concise, practical, and encouraging. Keep responses under 200 words unless complex analysis is needed.${context ? ` User financial context: ${context}` : ''}`,
          },
          ...messages.slice(-10),
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (groqRes.status === 401) {
      return jsonResponse(
        { error: 'AI service authentication failed. Check your GROQ_API_KEY.', code: 'AUTH_ERROR' },
        502,
      );
    }

    if (groqRes.status === 429) {
      const retryAfter = groqRes.headers.get('retry-after') ?? '60';
      return jsonResponse(
        {
          error: 'AI rate limit reached. Please wait a moment and try again.',
          code: 'RATE_LIMIT',
          retryAfter: Number(retryAfter),
        },
        429,
      );
    }

    if (!groqRes.ok) {
      let detail = '';
      try {
        const errBody = (await groqRes.json()) as { error?: { message?: string } };
        detail = errBody?.error?.message ?? '';
      } catch {}
      return jsonResponse(
        { error: `AI service error (${groqRes.status})`, code: 'API_ERROR', detail },
        502,
      );
    }

    let data: { choices?: Array<{ message?: { content?: string } }> };
    try {
      data = (await groqRes.json()) as typeof data;
    } catch {
      return jsonResponse({ error: 'Malformed response from AI service.', code: 'MALFORMED' }, 502);
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return jsonResponse({ error: 'AI returned an empty response.', code: 'EMPTY_REPLY' }, 502);
    }

    return jsonResponse({ reply });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      return jsonResponse(
        { error: 'AI request timed out. Please try again.', code: 'TIMEOUT' },
        504,
      );
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    return jsonResponse({ error: 'Internal server error', code: 'INTERNAL', detail: message }, 500);
  }
}
