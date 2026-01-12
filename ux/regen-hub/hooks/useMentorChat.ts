import { useCallback, useMemo, useRef, useState } from 'react';
import { koiApi } from '@/lib/apiClient';
import type { ChatMessage, KoiChatRequest } from '@/lib/types';

export interface UseMentorChatOptions {
  initialMessages?: ChatMessage[];
  context?: KoiChatRequest['context'];
}

const DEFAULT_GREETING: ChatMessage = {
  role: 'assistant',
  content: 'GaiaAI mentor online. Ask about projects, rewards, or governance actions and I’ll help you plan next steps.',
  createdAt: Date.now(),
};

function splitIntoStreamTokens(text: string): string[] {
  // Split in a way that keeps whitespace tokens so streaming doesn't "eat" spaces.
  const tokens = text.split(/(\s+)/g);
  return tokens.filter((t) => t.length > 0);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useMentorChat(options: UseMentorChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(options.initialMessages ?? [DEFAULT_GREETING]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestMessagesRef = useRef(messages);
  latestMessagesRef.current = messages;

  // Used to cancel/ignore stale streaming updates.
  const streamRunIdRef = useRef(0);

  const simulateTokenStream = useCallback(async (fullText: string, onUpdate: (partialText: string) => void, runId: number) => {
    const tokens = splitIntoStreamTokens(fullText);
    if (tokens.length <= 1) {
      onUpdate(fullText);
      return;
    }

    // Tradeoff: smooth typing effect without excessive re-renders.
    const chunkSize = 3;
    const delayMs = 28;
    let acc = '';

    for (let i = 0; i < tokens.length; i += chunkSize) {
      if (streamRunIdRef.current !== runId) return;
      acc += tokens.slice(i, i + chunkSize).join('');
      onUpdate(acc);
      await sleep(delayMs);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, extraContext?: KoiChatRequest['context']) => {
      const trimmed = content.trim();
      if (!trimmed || loading || streaming) return;

      setError(null);
      setLoading(true);

      const userMsg: ChatMessage = { role: 'user', content: trimmed, createdAt: Date.now() };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const req: KoiChatRequest = {
          messages: [...latestMessagesRef.current, userMsg],
          context: { ...(options.context ?? {}), ...(extraContext ?? {}) },
        };

        const res = await koiApi.chat(req);
        // Network response received; any remaining work is UI streaming.
        setLoading(false);

        // Simulated streaming: append an empty assistant message, then fill it in.
        const assistantCreatedAt = Date.now() + 1;
        const assistantMsg: ChatMessage = { role: 'assistant', content: '', createdAt: assistantCreatedAt, partial: true };
        setMessages((prev) => [...prev, assistantMsg]);

        setStreaming(true);
        const runId = streamRunIdRef.current + 1;
        streamRunIdRef.current = runId;

        await simulateTokenStream(res.reply, (partialText) => {
          if (streamRunIdRef.current !== runId) return;
          setMessages((prev) =>
            prev.map((m) => (m.createdAt === assistantCreatedAt ? { ...m, content: partialText, partial: true } : m)),
          );
        }, runId);

        if (streamRunIdRef.current === runId) {
          setMessages((prev) =>
            prev.map((m) => (m.createdAt === assistantCreatedAt ? { ...m, content: res.reply, partial: false } : m)),
          );
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to reach GaiaAI/KOI service.';
        setError(msg);
      } finally {
        setStreaming(false);
        setLoading(false);
      }
    },
    [loading, options.context, simulateTokenStream, streaming],
  );

  const clear = useCallback(() => {
    // Cancel any in-flight streaming render.
    streamRunIdRef.current += 1;
    setStreaming(false);
    setLoading(false);

    setMessages(options.initialMessages ?? [{ ...DEFAULT_GREETING, createdAt: Date.now() }]);
    setError(null);
  }, [options.initialMessages]);

  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === 'assistant') return messages[i];
    }
    return null;
  }, [messages]);

  return {
    messages,
    loading,
    streaming,
    error,
    sendMessage,
    clear,
    lastAssistant,
  };
}
