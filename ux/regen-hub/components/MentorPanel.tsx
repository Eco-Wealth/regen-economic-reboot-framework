import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import type { KoiChatRequest } from '@/lib/types';
import { useMentorChat } from '@/hooks/useMentorChat';

export function MentorPanel(props: { context?: KoiChatRequest['context']; className?: string; compact?: boolean }) {
  const { messages, loading, streaming, error, sendMessage, clear } = useMentorChat({ context: props.context });
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading, streaming]);

  const onSend = async () => {
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void onSend();
    }
  };

  return (
    <div className={clsx('flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm', props.className)}>
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Mentor</h2>
          <p className="text-xs text-gray-600">GaiaAI via <span className="font-mono">/api/koi/chat</span></p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Clear
        </button>
      </div>

      <div ref={listRef} className={clsx('flex-1 overflow-auto px-4 py-3', props.compact ? 'max-h-80' : 'min-h-[20rem]')}>
        <div className="space-y-3">
          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <div key={`${m.createdAt ?? i}-${i}`} className={clsx('flex', isUser ? 'justify-end' : 'justify-start')}>
                <div
                  className={clsx(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm',
                    isUser ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-900',
                  )}
                >
                  {m.content}
                  {m.partial ? <span className="ml-0.5 inline-block animate-pulse">▍</span> : null}
                </div>
              </div>
            );
          })}

          {loading ? (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-700">
                Thinking…
              </div>
            </div>
          ) : null}
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="border-t border-gray-100 p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask GaiaAI…"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={() => void onSend()}
            disabled={loading || streaming || !input.trim()}
            className={clsx(
              'rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm',
              'hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
              (loading || streaming || !input.trim()) && 'opacity-60',
            )}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
