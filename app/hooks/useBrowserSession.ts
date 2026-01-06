'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export type SessionState = 'INITIALIZING' | 'AI_CONTROL' | 'USER_CONTROL' | 'PAUSED' | 'COMPLETED' | 'ERROR';

export interface SessionStep {
  step: number;
  action: string;
  result: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  screenshot?: string;
}

export interface BrowserSession {
  id: string;
  userId: string;
  task: string;
  url?: string;
  state: SessionState;
  steps: SessionStep[];
  currentStep: number;
  maxSteps: number;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

interface UseBrowserSessionOptions {
  userId: string;
  serverUrl?: string;
  autoConnect?: boolean;
}

interface UseBrowserSessionReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // Session state
  session: BrowserSession | null;
  streamUrl: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  createSession: (task: string, url?: string, maxSteps?: number) => Promise<void>;
  joinSession: (sessionId: string) => void;
  takeControl: () => void;
  returnControl: () => void;
  pauseSession: () => void;
  resumeSession: (asUser?: boolean) => void;
  executeStep: (action: string, script?: string) => Promise<void>;
  navigateTo: (url: string) => Promise<void>;
  endSession: () => void;
  getScreenshot: () => Promise<string | null>;
}

export function useBrowserSession(options: UseBrowserSessionOptions): UseBrowserSessionReturn {
  const { userId, serverUrl = 'http://localhost:3001', autoConnect = true } = options;
  
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [session, setSession] = useState<BrowserSession | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to server
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    
    setIsConnecting(true);
    setConnectionError(null);

    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[useBrowserSession] Connected to server');
      setIsConnected(true);
      setIsConnecting(false);
      
      // Authenticate
      socket.emit('auth', { userId });
    });

    socket.on('disconnect', (reason) => {
      console.log('[useBrowserSession] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[useBrowserSession] Connection error:', err.message);
      setConnectionError(err.message);
      setIsConnecting(false);
    });

    // Session events
    socket.on('session:ready', ({ sessionId, streamUrl: url, session: sessionData }) => {
      console.log('[useBrowserSession] Session ready:', sessionId);
      setSession(sessionData);
      setStreamUrl(url);
      setIsLoading(false);
    });

    socket.on('session:joined', ({ session: sessionData, streamUrl: url }) => {
      setSession(sessionData);
      setStreamUrl(url);
      setIsLoading(false);
    });

    socket.on('session:state_changed', ({ sessionId, state }) => {
      setSession(prev => prev && prev.id === sessionId ? { ...prev, state } : prev);
    });

    socket.on('session:step', ({ sessionId, step }) => {
      setSession(prev => {
        if (!prev || prev.id !== sessionId) return prev;
        return {
          ...prev,
          steps: [...prev.steps, step],
          currentStep: step.step,
        };
      });
    });

    socket.on('session:control_changed', ({ sessionId, controller }) => {
      setSession(prev => {
        if (!prev || prev.id !== sessionId) return prev;
        return {
          ...prev,
          state: controller === 'USER' ? 'USER_CONTROL' : 'AI_CONTROL',
        };
      });
    });

    socket.on('session:control_taken', ({ sessionId }) => {
      console.log('[useBrowserSession] Control taken');
    });

    socket.on('session:control_returned', ({ sessionId }) => {
      console.log('[useBrowserSession] Control returned');
    });

    socket.on('session:paused', ({ sessionId }) => {
      setSession(prev => prev && prev.id === sessionId ? { ...prev, state: 'PAUSED' } : prev);
    });

    socket.on('session:resumed', ({ sessionId }) => {
      // State will be updated by state_changed event
    });

    socket.on('session:error', ({ sessionId, error: err }) => {
      setError(err);
      setSession(prev => prev && prev.id === sessionId ? { ...prev, state: 'ERROR', error: err } : prev);
      setIsLoading(false);
    });

    socket.on('session:completed', ({ sessionId }) => {
      setSession(prev => prev && prev.id === sessionId ? { ...prev, state: 'COMPLETED' } : prev);
    });

    socket.on('session:ended', ({ sessionId }) => {
      if (session?.id === sessionId) {
        setSession(null);
        setStreamUrl(null);
      }
    });

    socket.on('session:step_completed', ({ sessionId, step }) => {
      setSession(prev => {
        if (!prev || prev.id !== sessionId) return prev;
        return {
          ...prev,
          steps: [...prev.steps, step],
          currentStep: step.step,
        };
      });
    });

    socket.on('session:step_error', ({ sessionId, error: err }) => {
      setError(err);
    });

    socket.on('session:navigated', ({ sessionId, url }) => {
      console.log('[useBrowserSession] Navigated to:', url);
    });

    socket.on('session:navigate_error', ({ sessionId, error: err }) => {
      setError(err);
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    // Frame updates for screenshot streaming
    socket.on('session:frame', ({ sessionId, screenshot }) => {
      // This is handled by BrowserViewPanel directly
    });

    socketRef.current = socket;
  }, [serverUrl, userId, session?.id]);

  // Disconnect from server
  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
    setSession(null);
    setStreamUrl(null);
  }, []);

  // Create new session
  const createSession = useCallback(async (task: string, url?: string, maxSteps?: number) => {
    if (!socketRef.current?.connected) {
      setError('Not connected to server');
      return;
    }

    setIsLoading(true);
    setError(null);

    socketRef.current.emit('session:create', {
      userId,
      task,
      url,
      maxSteps: maxSteps || 10,
    });
  }, [userId]);

  // Join existing session
  const joinSession = useCallback((sessionId: string) => {
    if (!socketRef.current?.connected) {
      setError('Not connected to server');
      return;
    }

    setIsLoading(true);
    socketRef.current.emit('session:join', { sessionId });
  }, []);

  // Take control from AI
  const takeControl = useCallback(() => {
    if (!socketRef.current?.connected || !session) return;
    socketRef.current.emit('session:take_control', { sessionId: session.id });
  }, [session]);

  // Return control to AI
  const returnControl = useCallback(() => {
    if (!socketRef.current?.connected || !session) return;
    socketRef.current.emit('session:return_control', { sessionId: session.id });
  }, [session]);

  // Pause session
  const pauseSession = useCallback(() => {
    if (!socketRef.current?.connected || !session) return;
    socketRef.current.emit('session:pause', { sessionId: session.id });
  }, [session]);

  // Resume session
  const resumeSession = useCallback((asUser: boolean = false) => {
    if (!socketRef.current?.connected || !session) return;
    socketRef.current.emit('session:resume', { sessionId: session.id, asUser });
  }, [session]);

  // Execute AI step
  const executeStep = useCallback(async (action: string, script?: string) => {
    if (!socketRef.current?.connected || !session) {
      setError('Not connected or no active session');
      return;
    }

    socketRef.current.emit('session:execute_step', {
      sessionId: session.id,
      action,
      script,
    });
  }, [session]);

  // Navigate to URL
  const navigateTo = useCallback(async (url: string) => {
    if (!socketRef.current?.connected || !session) {
      setError('Not connected or no active session');
      return;
    }

    socketRef.current.emit('session:navigate', {
      sessionId: session.id,
      url,
    });
  }, [session]);

  // End session
  const endSession = useCallback(() => {
    if (!socketRef.current?.connected || !session) return;
    socketRef.current.emit('session:end', { sessionId: session.id });
  }, [session]);

  // Get screenshot
  const getScreenshot = useCallback(async (): Promise<string | null> => {
    if (!socketRef.current?.connected || !session) return null;

    return new Promise((resolve) => {
      const handler = ({ sessionId, screenshot }: { sessionId: string; screenshot: string }) => {
        if (sessionId === session.id) {
          socketRef.current?.off('session:screenshot', handler);
          resolve(screenshot);
        }
      };

      socketRef.current?.on('session:screenshot', handler);
      socketRef.current?.emit('session:screenshot', { sessionId: session.id });

      // Timeout after 5 seconds
      setTimeout(() => {
        socketRef.current?.off('session:screenshot', handler);
        resolve(null);
      }, 5000);
    });
  }, [session]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    connectionError,
    session,
    streamUrl,
    isLoading,
    error,
    connect,
    disconnect,
    createSession,
    joinSession,
    takeControl,
    returnControl,
    pauseSession,
    resumeSession,
    executeStep,
    navigateTo,
    endSession,
    getScreenshot,
  };
}

export default useBrowserSession;
