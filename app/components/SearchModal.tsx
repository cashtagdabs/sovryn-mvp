'use client';

import { useState, useEffect } from 'react';
import { Search, X, MessageCircle, FileText, Settings as SettingsIcon } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === 'Escape') {
        onClose();
      }
      // Open on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus input when modal opens
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Mock search results (replace with real API call)
  useEffect(() => {
    if (query.length > 0) {
      // Simulate search
      const mockResults = [
        {
          type: 'conversation',
          icon: <MessageCircle className="w-4 h-4" />,
          title: 'Chat about PRIMEX features',
          description: 'Discussion about AI model capabilities...',
          href: '/chat/123',
        },
        {
          type: 'page',
          icon: <FileText className="w-4 h-4" />,
          title: 'Subscription Plans',
          description: 'View and manage your subscription',
          href: '/subscription',
        },
        {
          type: 'settings',
          icon: <SettingsIcon className="w-4 h-4" />,
          title: 'Account Settings',
          description: 'Manage your profile and preferences',
          href: '/settings',
        },
      ].filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(mockResults);
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
            <Search className="w-5 h-5 text-white/60" />
            <input
              id="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations, pages, settings..."
              className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-lg"
            />
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {query.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/40">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Start typing to search...</p>
                <p className="text-xs mt-2">
                  Try searching for conversations, pages, or settings
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/40">
                <p className="text-sm">No results found for "{query}"</p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((result, index) => (
                  <a
                    key={index}
                    href={result.href}
                    onClick={onClose}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div className="mt-1 text-purple-400 group-hover:text-purple-300">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium group-hover:text-purple-300 transition-colors">
                        {result.title}
                      </div>
                      <div className="text-sm text-white/60 truncate">
                        {result.description}
                      </div>
                    </div>
                    <div className="text-xs text-white/40 capitalize">
                      {result.type}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-2 py-1 bg-white/10 rounded">↑↓</kbd> Navigate
              </span>
              <span>
                <kbd className="px-2 py-1 bg-white/10 rounded">Enter</kbd> Select
              </span>
            </div>
            <span>
              <kbd className="px-2 py-1 bg-white/10 rounded">Esc</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
