'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';

export default function TestChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/primex/chat');
      const data = await res.json();
      setStatus(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    try {
      const res = await fetch('/api/primex/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          conversation_history: messages,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        { role: 'error', content: `Error: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">PRIMEX Test Chat</h1>

        {/* Health Check */}
        <div className="mb-8">
          <button
            onClick={checkHealth}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Check Backend Health
          </button>
          {status && (
            <pre className="mt-4 bg-gray-800 p-4 rounded overflow-auto text-sm">
              {status}
            </pre>
          )}
        </div>

        {/* Chat Messages */}
        <div className="bg-gray-800 rounded-lg p-6 mb-4 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-400">No messages yet. Start chatting!</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 ${
                  msg.role === 'user'
                    ? 'text-blue-400'
                    : msg.role === 'error'
                    ? 'text-red-400'
                    : 'text-green-400'
                }`}
              >
                <strong>{msg.role}:</strong> {msg.content}
              </div>
            ))
          )}
          {loading && <p className="text-gray-400 animate-pulse">Thinking...</p>}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
