'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
}

export function useChat(initialConversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const router = useRouter();

  // Load conversation messages if ID provided
  useEffect(() => {
    if (initialConversationId) {
      fetchConversation(initialConversationId);
    }
  }, [initialConversationId]);

  const fetchConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role.toLowerCase() as 'user' | 'assistant',
          content: msg.content,
          model: msg.model,
        })));
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const sendMessage = useCallback(async (content: string, modelId: string) => {
    const userMessage: Message = {
      role: 'user',
      content,
    };

    // Store the original message count for safe rollback
    const originalMessageCount = messages.length;

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let assistantMessageAdded = false;

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          modelId,
          messages: [...messages, userMessage],
          conversationId,
        }),
      });

      if (!response.ok) {
        // Try to read server response for better debugging
        let bodyText = '';
        try {
          bodyText = await response.text();
        } catch (e) {
          bodyText = '<unreadable response body>';
        }
        console.error('Chat send failed', { status: response.status, body: bodyText });
        if (response.status === 401) {
          // Not authenticated — guide user to sign in
          // Use window navigation here because this is client hook
          window.location.href = '/sign-in';
          return;
        }
        throw new Error('Failed to send message: ' + bodyText);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let assistantMessage: Message = {
        role: 'assistant',
        content: '',
        model: modelId,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      assistantMessageAdded = true;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'conversation') {
                  setConversationId(data.id);
                  if (!initialConversationId) {
                    router.push(`/chat/${data.id}`);
                  }
                } else if (data.type === 'content') {
                  assistantMessage.content += data.content;
                  setMessages((prev) => [
                    ...prev.slice(0, -1),
                    { ...assistantMessage },
                  ]);
                } else if (data.type === 'done') {
                  assistantMessage.id = data.messageId;
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');

      // Safe rollback: restore to original message count
      setMessages((prev) => {
        if (assistantMessageAdded) {
          // Both user and assistant messages were added, remove both
          return prev.slice(0, originalMessageCount);
        } else {
          // Only user message was added, remove just that
          return prev.slice(0, -1);
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, conversationId, initialConversationId, router]);

  return {
    messages,
    isLoading,
    sendMessage,
    conversationId,
  };
}
