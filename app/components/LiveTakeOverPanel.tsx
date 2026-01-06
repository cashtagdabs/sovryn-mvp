'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Zap,
  Bot,
  ChevronDown,
  ChevronUp,
  Monitor,
  Hand,
  ArrowLeftRight,
  Eye,
  MousePointer,
  Wifi,
  WifiOff,
  ExternalLink,
  Maximize2,
  X
} from 'lucide-react';
import { useBrowserSession, SessionStep, SessionState } from '../hooks/useBrowserSession';
import { BrowserViewPanel } from './BrowserViewPanel';

interface LiveTakeOverPanelProps {
  userId: string;
  serverUrl?: string;
  onClose?: () => void;
  defaultModel?: string;
}

export const LiveTakeOverPanel: React.FC<LiveTakeOverPanelProps> = ({
  userId,
  serverUrl = process.env.NEXT_PUBLIC_BROWSER_SERVICE_URL || 'http://localhost:3001',
  onClose,
  defaultModel = 'primex-ultra'
}) => {
  const [task, setTask] = useState('');
  const [url, setUrl] = useState('');
  const [maxSteps, setMaxSteps] = useState(10);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBrowserView, setShowBrowserView] = useState(true);
  const [isFullscreenBrowser, setIsFullscreenBrowser] = useState(false);
  const stepsEndRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    isConnecting,
    connectionError,
    session,
    streamUrl,
    isLoading,
    error,
    connect,
    createSession,
    takeControl,
    returnControl,
    pauseSession,
    resumeSession,
    endSession,
  } = useBrowserSession({ userId, serverUrl });

  // Auto-scroll to latest step
  useEffect(() => {
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.steps]);

  const handleStartTask = useCallback(async () => {
    if (!task.trim()) return;
    await createSession(task.trim(), url.trim() || undefined, maxSteps);
  }, [task, url, maxSteps, createSession]);

  const handleTakeControl = useCallback(() => {
    takeControl();
  }, [takeControl]);

  const handleReturnControl = useCallback(() => {
    returnControl();
  }, [returnControl]);

  const handlePause = useCallback(() => {
    pauseSession();
  }, [pauseSession]);

  const handleResume = useCallback(() => {
    resumeSession(false);
  }, [resumeSession]);

  const handleEnd = useCallback(() => {
    endSession();
  }, [endSession]);

  const handleReset = useCallback(() => {
    setTask('');
    setUrl('');
  }, []);

  const getStateColor = (state: SessionState): string => {
    switch (state) {
      case 'AI_CONTROL': return 'text-blue-400 bg-blue-500/20';
      case 'USER_CONTROL': return 'text-green-400 bg-green-500/20';
      case 'PAUSED': return 'text-yellow-400 bg-yellow-500/20';
      case 'COMPLETED': return 'text-purple-400 bg-purple-500/20';
      case 'ERROR': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStateIcon = (state: SessionState) => {
    switch (state) {
      case 'AI_CONTROL': return <Bot className="w-4 h-4" />;
      case 'USER_CONTROL': return <Hand className="w-4 h-4" />;
      case 'PAUSED': return <Pause className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'ERROR': return <XCircle className="w-4 h-4" />;
      default: return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-500/10';
      case 'failed': return 'border-red-500 bg-red-500/10';
      default: return 'border-yellow-500 bg-yellow-500/10';
    }
  };

  const isInteractive = session?.state === 'USER_CONTROL';

  return (
    <div className="bg-gray-900 text-white rounded-xl border border-purple-500/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 border-b border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Live Take Over Mode</h2>
              <p className="text-sm text-gray-400">Watch AI work & take control anytime</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Connection status */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
            </div>

            {/* Session state */}
            {session && (
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${getStateColor(session.state)}`}>
                {getStateIcon(session.state)}
                <span className="capitalize">{session.state.replace('_', ' ')}</span>
              </div>
            )}

            {onClose && (
              <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!isConnected && !isConnecting && (
          <div className="text-center py-8">
            <WifiOff className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Not connected to browser service</p>
            {connectionError && (
              <p className="text-red-400 text-sm mb-4">{connectionError}</p>
            )}
            <button
              onClick={connect}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Connect
            </button>
          </div>
        )}

        {isConnecting && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Connecting to browser service...</p>
          </div>
        )}

        {isConnected && !session && (
          // Setup Form
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Task Description</label>
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Describe the task you want the AI to complete..."
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Starting URL (optional)</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div>
                  <label className="block text-sm font-medium mb-2">Max Steps</label>
                  <input
                    type="number"
                    value={maxSteps}
                    onChange={(e) => setMaxSteps(Math.max(1, Math.min(50, parseInt(e.target.value) || 10)))}
                    min={1}
                    max={50}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleStartTask}
              disabled={!task.trim() || isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Task
                </>
              )}
            </button>
          </div>
        )}

        {isConnected && session && (
          // Active Session
          <div className="space-y-4">
            {/* Task info */}
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Current Task</div>
              <div className="font-medium">{session.task}</div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${(session.currentStep / session.maxSteps) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-400">
                {session.currentStep}/{session.maxSteps}
              </span>
            </div>

            {/* Browser View Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowBrowserView(!showBrowserView)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Monitor className="w-4 h-4" />
                {showBrowserView ? 'Hide' : 'Show'} Browser View
              </button>
              
              {showBrowserView && streamUrl && (
                <button
                  onClick={() => setIsFullscreenBrowser(true)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                >
                  <Maximize2 className="w-3 h-3" />
                  Fullscreen
                </button>
              )}
            </div>

            {/* Browser View */}
            {showBrowserView && streamUrl && (
              <BrowserViewPanel
                sessionId={session.id}
                streamUrl={streamUrl}
                isInteractive={isInteractive}
                className="border border-gray-700"
              />
            )}

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {session.state === 'AI_CONTROL' && (
                <>
                  <button
                    onClick={handleTakeControl}
                    className="py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Hand className="w-4 h-4" />
                    Take Control
                  </button>
                  <button
                    onClick={handlePause}
                    className="py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    Pause AI
                  </button>
                </>
              )}

              {session.state === 'USER_CONTROL' && (
                <>
                  <button
                    onClick={handleReturnControl}
                    className="py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors col-span-2"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    Return Control to AI
                  </button>
                </>
              )}

              {session.state === 'PAUSED' && (
                <>
                  <button
                    onClick={handleResume}
                    className="py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Resume AI
                  </button>
                  <button
                    onClick={() => resumeSession(true)}
                    className="py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Hand className="w-4 h-4" />
                    Take Over
                  </button>
                </>
              )}
            </div>

            {/* Steps Log */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {session.steps.map((step, index) => (
                <div 
                  key={index}
                  className={`p-2 rounded-lg border-l-4 ${getStepStatusColor(step.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">Step {step.step}</span>
                      {step.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-500" />}
                      {step.status === 'failed' && <XCircle className="w-3 h-3 text-red-500" />}
                      {step.status === 'pending' && <Clock className="w-3 h-3 text-yellow-500" />}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm mt-1">{step.action}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{step.result}</div>
                </div>
              ))}
              <div ref={stepsEndRef} />
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* End Session */}
            {(session.state === 'COMPLETED' || session.state === 'ERROR') ? (
              <button
                onClick={handleReset}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                New Task
              </button>
            ) : (
              <button
                onClick={handleEnd}
                className="w-full py-2 bg-red-600/50 hover:bg-red-600 rounded-lg font-medium transition-colors"
              >
                End Session
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Browser Modal */}
      {isFullscreenBrowser && streamUrl && session && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${getStateColor(session.state)}`}>
              {getStateIcon(session.state)}
              <span className="capitalize">{session.state.replace('_', ' ')}</span>
            </div>
            
            {session.state === 'AI_CONTROL' && (
              <button
                onClick={handleTakeControl}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-full text-sm font-medium flex items-center gap-1"
              >
                <Hand className="w-4 h-4" />
                Take Control
              </button>
            )}
            
            {session.state === 'USER_CONTROL' && (
              <button
                onClick={handleReturnControl}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-medium flex items-center gap-1"
              >
                <ArrowLeftRight className="w-4 h-4" />
                Return to AI
              </button>
            )}
            
            <button
              onClick={() => setIsFullscreenBrowser(false)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <BrowserViewPanel
            sessionId={session.id}
            streamUrl={streamUrl}
            isInteractive={isInteractive}
            className="h-full rounded-none border-0"
          />
        </div>
      )}
    </div>
  );
};

export default LiveTakeOverPanel;
