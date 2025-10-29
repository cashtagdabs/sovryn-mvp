'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Zap, Brain, Command, Loader2 } from 'lucide-react';
import { AI_PROVIDERS, getModelById } from '@/app/lib/ai/providers';
import { useChat } from '@/app/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ModelSelector } from './ModelSelector';
import { cn } from '@/app/lib/utils';

interface ChatInterfaceProps {
  conversationId?: string;
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo-preview');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, sendMessage } = useChat(conversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    
    await sendMessage(message, selectedModel);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const model = getModelById(selectedModel);
  const ModelIcon = model?.provider === 'openai' ? Sparkles : 
                   model?.provider === 'anthropic' ? Brain :
                   model?.provider === 'groq' ? Zap : Command;

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2"
            >
              <ModelIcon className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-lg font-semibold text-white">SOVRYN AI</h2>
              <p className="text-sm text-white/60">Multi-Model Intelligence</p>
            </div>
          </div>
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="mx-auto mb-8 h-24 w-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-900">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">
                  Welcome to SOVRYN
                </h3>
                <p className="text-white/60">
                  The most advanced AI platform. Choose your model and start chatting.
                </p>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage key={message.id || index} message={message} />
              ))
            )}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 text-white/60"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl p-4">
          <div className="relative flex items-end space-x-2">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className={cn(
                  'w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12',
                  'text-white placeholder-white/40 backdrop-blur-sm',
                  'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                  'transition-all duration-200'
                )}
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  'absolute bottom-2 right-2 rounded-lg p-2',
                  'text-white transition-all duration-200',
                  'hover:bg-purple-500/20',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-white/40">
              {model && `Using ${model.name} • $${model.inputCost}/1M tokens`}
            </p>
            <p className="text-xs text-white/40">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
