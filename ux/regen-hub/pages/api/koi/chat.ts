import type { NextApiRequest, NextApiResponse } from 'next';

type ChatMessage = { role: 'user' | 'assistant' | 'system' | string; content: string };

function pickReply(payload: any): string {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  if (typeof payload.reply === 'string') return payload.reply;
  if (typeof payload.message === 'string') return payload.message;
  if (typeof payload.output_text === 'string') return payload.output_text;

  // OpenAI-compatible shape
  const oa = payload.choices?.[0]?.message?.content;
  if (typeof oa === 'string') return oa;

  // Some APIs return `data: { reply: ... }`
  if (typeof payload.data?.reply === 'string') return payload.data.reply;
  return '';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const baseUrl = process.env.KOI_API_BASE_URL;
  const apiKey = process.env.KOI_API_KEY;
  const chatPath = process.env.KOI_API_CHAT_PATH ?? '/chat';

  if (!baseUrl) {
    return res.status(501).json({
      reply:
        'KOI API is not configured. Set KOI_API_BASE_URL (and optionally KOI_API_KEY) in your environment to enable mentor chat.',
      meta: { configured: false },
    });
  }

  const { messages, context } = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {}) as {
    messages?: ChatMessage[];
    context?: Record<string, unknown>;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing messages[]' });
  }

  const url = `${baseUrl.replace(/\/$/, '')}${chatPath.startsWith('/') ? chatPath : `/${chatPath}`}`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ messages, context }),
    });

    const text = await upstream.text();
    const payload = text ? (() => {
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    })() : null;

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        reply: 'Mentor service returned an error.',
        meta: { upstreamStatus: upstream.status, upstreamBody: payload },
      });
    }

    const reply = pickReply(payload);
    return res.status(200).json({
      reply: reply || 'No reply returned from mentor service.',
      meta: { upstreamStatus: upstream.status },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to reach mentor service.';
    return res.status(502).json({ reply: msg, meta: { configured: true } });
  }
}
