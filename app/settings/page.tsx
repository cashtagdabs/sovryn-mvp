'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface OAuthConnection {
  id: string;
  provider: string;
  providerUsername: string | null;
  createdAt: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<OAuthConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Check for success/error params
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'github_connected') {
      setMessage({ type: 'success', text: 'GitHub connected successfully!' });
    } else if (success === 'google_connected') {
      setMessage({ type: 'success', text: 'Google connected successfully!' });
    } else if (success === 'dropbox_connected') {
      setMessage({ type: 'success', text: 'Dropbox connected successfully!' });
    } else if (error) {
      const errorMessages: Record<string, string> = {
        github_denied: 'GitHub authorization was denied',
        google_denied: 'Google authorization was denied',
        dropbox_denied: 'Dropbox authorization was denied',
        missing_params: 'Missing authorization parameters',
        token_error: 'Failed to get access token',
        callback_error: 'OAuth callback failed',
        github_not_configured: 'GitHub OAuth is not configured',
        user_not_found: 'User not found',
      };
      setMessage({ type: 'error', text: errorMessages[error] || 'An error occurred' });
    }

    fetchConnections();
  }, [searchParams]);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/user/connections');
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectService = async (provider: string) => {
    try {
      const response = await fetch(`/api/user/connections/${provider}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setConnections(connections.filter(c => c.provider !== provider));
        setMessage({ type: 'success', text: `${provider} disconnected successfully` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to disconnect ${provider}` });
    }
  };

  const isConnected = (provider: string) => {
    return connections.some(c => c.provider === provider);
  };

  const getConnection = (provider: string) => {
    return connections.find(c => c.provider === provider);
  };

  const services = [
    {
      id: 'github',
      name: 'GitHub',
      icon: '🐙',
      description: 'Access repositories, create pull requests, manage issues',
      connectUrl: '/api/auth/github',
    },
    {
      id: 'google',
      name: 'Google',
      icon: '📧',
      description: 'Access Gmail, Google Drive, and Calendar',
      connectUrl: '/api/auth/google',
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: '📦',
      description: 'Access and manage your Dropbox files',
      connectUrl: '/api/auth/dropbox',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-400 mt-1">Manage your connected accounts and preferences</p>
          </div>
          <Link 
            href="/chat"
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
          >
            ← Back to Chat
          </Link>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-900/50 border border-green-500 text-green-300' 
              : 'bg-red-900/50 border border-red-500 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Connected Accounts */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold">Connected Accounts</h2>
            <p className="text-sm text-gray-400 mt-1">
              Connect your accounts to enable PRIMEX to access your data
            </p>
          </div>

          <div className="divide-y divide-gray-800">
            {services.map((service) => {
              const connected = isConnected(service.id);
              const connection = getConnection(service.id);

              return (
                <div key={service.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{service.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        {connected && (
                          <span className="px-2 py-0.5 text-xs bg-green-900/50 text-green-400 rounded-full">
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{service.description}</p>
                      {connected && connection?.providerUsername && (
                        <p className="text-xs text-purple-400 mt-1">
                          Connected as: {connection.providerUsername}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    {connected ? (
                      <button
                        onClick={() => disconnectService(service.id)}
                        className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <a
                        href={service.connectUrl}
                        className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition inline-block"
                      >
                        Connect
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Environment Setup Notice */}
        <div className="mt-8 p-6 bg-gray-900/50 rounded-xl border border-gray-800">
          <h3 className="font-semibold text-yellow-400 mb-2">⚙️ OAuth Setup Required</h3>
          <p className="text-sm text-gray-400 mb-4">
            To enable OAuth connections, add these environment variables:
          </p>
          <div className="bg-black/50 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
            <div className="text-gray-500"># GitHub OAuth (create at github.com/settings/developers)</div>
            <div><span className="text-purple-400">GITHUB_CLIENT_ID</span>=your_github_oauth_app_client_id</div>
            <div><span className="text-purple-400">GITHUB_CLIENT_SECRET</span>=your_github_oauth_app_client_secret</div>
            <div className="text-gray-500 mt-2"># Google OAuth (create at console.cloud.google.com)</div>
            <div><span className="text-purple-400">GOOGLE_CLIENT_ID</span>=your_google_oauth_client_id</div>
            <div><span className="text-purple-400">GOOGLE_CLIENT_SECRET</span>=your_google_oauth_client_secret</div>
            <div className="text-gray-500 mt-2"># Dropbox OAuth (create at dropbox.com/developers)</div>
            <div><span className="text-purple-400">DROPBOX_CLIENT_ID</span>=your_dropbox_app_key</div>
            <div><span className="text-purple-400">DROPBOX_CLIENT_SECRET</span>=your_dropbox_app_secret</div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold">Preferences</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
              <label htmlFor="theme-select" className="text-gray-300">Theme</label>
              <select 
                id="theme-select"
                title="Select theme"
                className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
              >
                <option>Dark</option>
                <option>Light</option>
                <option>System</option>
              </select>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
              <label htmlFor="model-select" className="text-gray-300">Default AI Model</label>
              <select 
                id="model-select"
                title="Select default AI model"
                className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
              >
                <option>PRIMEX Ultra</option>
                <option>LLaMA 3.3 70B (Groq)</option>
                <option>GPT-4 Turbo</option>
                <option>Claude 3 Sonnet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-gray-900 rounded-xl border border-red-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-900/50">
            <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
          </div>
          <div className="px-6 py-4">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
