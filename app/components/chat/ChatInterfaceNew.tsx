'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatInterfaceNew() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/primex/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversation_history: messages,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage: Message = { role: 'assistant', content: data.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-800/30 mb-6">
              <h2 className="text-3xl font-bold mb-2">Welcome to PRIMEX</h2>
              <p className="text-gray-400">The most advanced AI with complete privacy</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => setInput('Explain quantum computing in simple terms')}
                className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-blue-500/50 transition text-left"
              >
                <div className="text-sm text-blue-400 mb-1">💡 Learn</div>
                <div className="text-sm">Explain quantum computing</div>
              </button>
              <button
                onClick={() => setInput('Write a Python function to sort a list')}
                className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-blue-500/50 transition text-left"
              >
                <div className="text-sm text-purple-400 mb-1">💻 Code</div>
                <div className="text-sm">Write Python code</div>
              </button>
              <button
                onClick={() => setInput('Create a marketing strategy for a startup')}
                className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-blue-500/50 transition text-left"
              >
                <div className="text-sm text-green-400 mb-1">📈 Business</div>
                <div className="text-sm">Marketing strategy</div>
              </button>
              <button
                onClick={() => setInput('Write a creative short story')}
                className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-blue-500/50 transition text-left"
              >
                <div className="text-sm text-pink-400 mb-1">✨ Create</div>
                <div className="text-sm">Write a story</div>
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-4 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 border border-gray-700'
                }`}
              >
                <div className="text-sm font-semibold mb-2">
                  {msg.role === 'user' ? '👤 You' : '🤖 PRIMEX'}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex gap-4">
            <div className="max-w-[80%] p-4 rounded-2xl bg-gray-800 border border-gray-700">
              <div className="text-sm font-semibold mb-2">🤖 PRIMEX</div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Message PRIMEX..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg transition font-semibold"
            >
              Send
            </button>
          </div>
          
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span>Powered by PRIMEX • 100% Private • No Data Collection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
