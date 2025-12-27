'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Code, Sparkles, AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { collaborationService } from '../utils/collaboration';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: any;
  isError?: boolean;
}

interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
}

interface CodeAnalysis {
  issues: CodeIssue[];
  suggestions: Array<{
    type: 'refactor' | 'optimization' | 'bug-fix';
    message: string;
    code?: string;
  }>;
  metrics: {
    complexity: number;
    lines: number;
    functions?: number;
    issueCount?: number;
  };
}

interface AIChatInterfaceProps {
  initialContext?: string;
  onAnalysisComplete?: (analysis: CodeAnalysis) => void;
}

export const AIChatInterface: React.FC<AIChatInterfaceProps> = ({
  initialContext = '',
  onAnalysisComplete
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentFileContext, setCurrentFileContext] = useState<string>(initialContext);
  const [isConnected, setIsConnected] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<CodeAnalysis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    // Set up collaboration service listeners
    const unsubConnStatus = collaborationService.on('connection-status', (data) => {
      setIsConnected(data.connected);
    });

    const unsubAIResponse = collaborationService.on('ai-chat-response', (data) => {
      const assistantMessage: ChatMessage = {
        id: `response-${Date.now()}`,
        role: 'assistant',
        content: data.response?.text || 'No response received',
        timestamp: new Date(),
        context: data.response,
        isError: data.response?.error
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    });

    const unsubAIError = collaborationService.on('ai-chat-error', (data) => {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${data.error || 'Unknown error occurred'}`,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    });

    const unsubAnalysisResult = collaborationService.on('code-analysis-result', (data) => {
      setCurrentAnalysis(data.analysis);
      onAnalysisComplete?.(data.analysis);
      
      const analysisMessage: ChatMessage = {
        id: `analysis-${Date.now()}`,
        role: 'assistant',
        content: formatAnalysisResult(data.analysis),
        timestamp: new Date(),
        context: data.analysis
      };
      
      setMessages(prev => [...prev, analysisMessage]);
      setIsLoading(false);
    });

    // Check initial connection status
    setIsConnected(collaborationService.getConnectionStatus());

    return () => {
      unsubConnStatus();
      unsubAIResponse();
      unsubAIError();
      unsubAnalysisResult();
    };
  }, [onAnalysisComplete]);

  const formatAnalysisResult = (analysis: CodeAnalysis): string => {
    let result = '📊 **Code Analysis Results**\n\n';
    
    // Metrics
    result += `**Metrics:**\n`;
    result += `- Lines: ${analysis.metrics.lines}\n`;
    result += `- Complexity: ${analysis.metrics.complexity}\n`;
    result += `- Functions: ${analysis.metrics.functions || 'N/A'}\n`;
    result += `- Issues Found: ${analysis.metrics.issueCount || analysis.issues.length}\n\n`;

    // Issues
    if (analysis.issues.length > 0) {
      result += `**Issues (${analysis.issues.length}):**\n`;
      analysis.issues.forEach((issue, i) => {
        const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
        result += `${i + 1}. ${icon} [Line ${issue.line || '?'}] ${issue.message}\n`;
      });
      result += '\n';
    }

    // Suggestions
    if (analysis.suggestions.length > 0) {
      result += `**Suggestions (${analysis.suggestions.length}):**\n`;
      analysis.suggestions.forEach((suggestion, i) => {
        result += `${i + 1}. 💡 ${suggestion.message}\n`;
      });
    }

    return result;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
      context: {
        currentFile: currentFileContext,
        timestamp: new Date().toISOString()
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    collaborationService.sendAIChatMessage({
      message: input,
      context: {
        code: currentFileContext,
        model: 'primex-ultra'
      },
      messageId: userMessage.id
    });
  };

  const analyzeCurrentCode = async () => {
    if (!currentFileContext.trim()) {
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        role: 'system',
        content: 'Please paste some code in the context area first.',
        timestamp: new Date()
      }]);
      return;
    }

    setIsLoading(true);
    
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      role: 'system',
      content: '🔍 Analyzing code...',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMessage]);

    collaborationService.sendCodeAnalysis({
      code: currentFileContext,
      filePath: 'current-context.ts',
      analysisType: 'full'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Connection Status */}
      <div className={`px-3 py-1 text-xs flex items-center gap-2 ${isConnected ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        {isConnected ? 'Connected to collaboration server' : 'Disconnected - messages will queue'}
      </div>

      {/* File Context Display */}
      <div className="p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium flex items-center gap-2">
            <Code className="w-4 h-4" />
            Code Context
          </span>
          <button 
            onClick={analyzeCurrentCode}
            disabled={!currentFileContext.trim() || isLoading}
            className="text-xs bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Analyze Code
          </button>
        </div>
        <textarea
          value={currentFileContext}
          onChange={(e) => setCurrentFileContext(e.target.value)}
          placeholder="Paste code here for context and analysis..."
          className="w-full p-2 text-xs bg-gray-900 border border-gray-700 rounded font-mono h-24 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Analysis Summary (if available) */}
      {currentAnalysis && (
        <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-red-400" />
              {currentAnalysis.issues.filter(i => i.type === 'error').length} errors
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-yellow-400" />
              {currentAnalysis.issues.filter(i => i.type === 'warning').length} warnings
            </span>
            <span className="text-gray-400">
              Complexity: {currentAnalysis.metrics.complexity}
            </span>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Start a conversation or analyze some code</p>
            <p className="text-xs mt-1">Powered by PRIMEX AI</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : message.role === 'system'
                  ? 'bg-gray-700 text-gray-300'
                  : message.isError
                  ? 'bg-red-900/50 text-red-200 border border-red-700'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              <div className="text-xs opacity-60 mt-1 flex items-center gap-2">
                {message.timestamp.toLocaleTimeString()}
                {message.role === 'assistant' && !message.isError && (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your code or request analysis..."
            className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;
