'use client';

import { motion } from 'framer-motion';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/app/lib/utils';

interface ChatMessageProps {
  message: {
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    model?: string;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative flex gap-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
        )}
      >
        {isUser ? (
          <User className="h-6 w-6 text-white" />
        ) : (
          <Bot className="h-6 w-6 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'relative max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-purple-500/20 text-white'
            : 'bg-white/10 text-white/90'
        )}
      >
        {!isUser && message.model && (
          <div className="mb-1 text-xs text-white/50">{message.model}</div>
        )}
        
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="rounded bg-white/10 px-1 py-0.5" {...props}>
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Copy Button */}
        {!isUser && (
          <button
            onClick={copyToClipboard}
            className={cn(
              'absolute -right-2 -top-2 rounded-lg p-1.5',
              'bg-white/10 opacity-0 group-hover:opacity-100',
              'transition-all duration-200 hover:bg-white/20'
            )}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 text-white/60" />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
