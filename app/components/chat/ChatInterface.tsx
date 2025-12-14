'use client';

import { useState } from 'react';
import { useChat } from '@/app/hooks/useChat';
import { ModelSelector } from './ModelSelector';
import { ChatMessage } from './ChatMessage';

interface ChatInterfaceProps {
  conversationId?: string;
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [modelId, setModelId] = useState<string>('primex-ultra');
  const { messages, isLoading, sendMessage } = useChat(conversationId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    await sendMessage(input.trim(), modelId);
    setInput('');
  };

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h1 className="text-lg font-semibold">SOVRYN AI Chat</h1>
        <ModelSelector value={modelId} onChange={setModelId} />
      </header>

      <main className="flex-1 overflow-y-auto space-y-4 px-4 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-white/50">
            Start a conversation by sending a message below.
          </p>
        )}
        {messages.map((m, idx) => (
          <ChatMessage key={m.id ?? idx} message={m} />
        ))}
      </main>

      <form
        onSubmit={handleSubmit}
        className="border-t border-white/10 bg-black/60 px-4 py-3"
      >
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            placeholder="Ask anything..."
            className="flex-1 resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold disabled:opacity-50 hover:bg-purple-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? 'Thinking…' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

