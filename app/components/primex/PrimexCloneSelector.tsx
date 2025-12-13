'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Clone {
  name: string;
  role: string;
  model: string;
  temperature: number;
  capabilities: string[];
  restrictions: string[];
}

interface CloneResponse {
  clone: string;
  role: string;
  response: string;
  model: string;
  temperature: number;
}

export default function PrimexCloneSelector() {
  const [clones, setClones] = useState<Record<string, Clone>>({});
  const [selectedClone, setSelectedClone] = useState<string>('architect');
  const [message, setMessage] = useState<string>('');
  const [response, setResponse] = useState<CloneResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<{clone: string, message: string, response: string}>>([]);

  useEffect(() => {
    fetchClones();
  }, []);

  const fetchClones = async () => {
    try {
      const res = await fetch('/api/primex/clones');
      if (!res.ok) {
        throw new Error('Failed to fetch clones');
      }
      const data = await res.json();
      setClones(data.clones);
    } catch (error) {
      console.error('Error fetching clones:', error);
      toast.error('Failed to load PRIMEX clones');
    }
  };

  const invokeClone = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/primex/invoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clone: selectedClone,
          message: message,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to invoke clone');
      }

      const data: CloneResponse = await res.json();
      setResponse(data);
      setHistory([...history, { clone: data.clone, message, response: data.response }]);
      setMessage('');
      toast.success(`${data.clone} responded`);
    } catch (error: any) {
      console.error('Error invoking clone:', error);
      toast.error(error.message || 'Failed to invoke clone');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      invokeClone();
    }
  };

  const currentClone = clones[selectedClone];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            PRIMEX SOVEREIGN
          </h1>
          <p className="text-gray-400 mt-2">Multi-Agent AI Operations Platform</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Clone Selector Sidebar */}
          <div className="lg:col-span-1 bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/20">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">AI Clones</h2>
            <div className="space-y-2">
              {Object.entries(clones).map(([key, clone]) => (
                <button
                  key={key}
                  onClick={() => setSelectedClone(key)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedClone === key
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/50'
                      : 'bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="font-bold text-sm">{clone.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{clone.role}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Interface */}
          <div className="lg:col-span-3 space-y-6">
            {/* Clone Details */}
            {currentClone && (
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
                <h2 className="text-2xl font-bold text-cyan-400 mb-2">{currentClone.name}</h2>
                <p className="text-gray-400 mb-4">{currentClone.role}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Model:</span>
                    <span className="ml-2 text-white">{currentClone.model}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Temperature:</span>
                    <span className="ml-2 text-white">{currentClone.temperature}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-gray-500 text-sm">Capabilities:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentClone.capabilities.slice(0, 3).map((cap, idx) => (
                      <span key={idx} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Command Interface */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
              <h3 className="text-lg font-bold mb-4 text-cyan-400">Command Interface</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Enter command for ${currentClone?.name || 'clone'}... (Ctrl+Enter to execute)`}
                className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
              <button
                onClick={invokeClone}
                disabled={loading}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30"
              >
                {loading ? 'Executing...' : 'Execute Command'}
              </button>
            </div>

            {/* Response Panel */}
            {response && (
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
                <h3 className="text-lg font-bold mb-4 text-cyan-400">Response from {response.clone}</h3>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                    {response.response}
                  </pre>
                </div>
              </div>
            )}

            {/* History Panel */}
            {history.length > 0 && (
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
                <h3 className="text-lg font-bold mb-4 text-cyan-400">Command History</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {history.slice().reverse().map((item, idx) => (
                    <div key={idx} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-xs text-cyan-400 font-bold mb-2">{item.clone}</div>
                      <div className="text-sm text-gray-400 mb-2">→ {item.message}</div>
                      <div className="text-sm text-gray-300">
                        {item.response.substring(0, 200)}
                        {item.response.length > 200 ? '...' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
