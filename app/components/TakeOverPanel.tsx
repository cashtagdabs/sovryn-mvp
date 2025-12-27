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
  ChevronUp
} from 'lucide-react';

interface TakeOverStep {
  step: number;
  action: string;
  result: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
}

interface TakeOverSession {
  id: string;
  status: 'running' | 'completed' | 'paused' | 'failed';
  task: string;
  steps: TakeOverStep[];
  currentStep: number;
  totalSteps: number;
  startedAt: string;
  completedAt?: string;
}

interface TakeOverPanelProps {
  onClose?: () => void;
  defaultModel?: string;
}

export const TakeOverPanel: React.FC<TakeOverPanelProps> = ({
  onClose,
  defaultModel = 'primex-ultra'
}) => {
  const [task, setTask] = useState('');
  const [context, setContext] = useState('');
  const [maxSteps, setMaxSteps] = useState(10);
  const [model, setModel] = useState(defaultModel);
  const [session, setSession] = useState<TakeOverSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoProgress, setAutoProgress] = useState(false);
  const stepsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest step
  useEffect(() => {
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.steps]);

  // Auto-progress effect
  useEffect(() => {
    if (autoProgress && session?.status === 'running' && !isLoading) {
      const timer = setTimeout(() => {
        continueSession();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoProgress, session, isLoading]);

  const startTakeOver = useCallback(async () => {
    if (!task.trim()) {
      setError('Please enter a task description');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/takeover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: task.trim(),
          context: context.trim() || undefined,
          maxSteps,
          model
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start take-over');
      }

      setSession({
        id: data.sessionId,
        status: data.status,
        task: task.trim(),
        steps: data.step ? [data.step] : [],
        currentStep: data.currentStep || 1,
        totalSteps: data.totalSteps || maxSteps,
        startedAt: new Date().toISOString()
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [task, context, maxSteps, model]);

  const continueSession = useCallback(async () => {
    if (!session) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/takeover', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          action: 'continue',
          model
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to continue');
      }

      setSession(prev => prev ? {
        ...prev,
        status: data.status,
        currentStep: data.currentStep,
        steps: data.step ? [...prev.steps, data.step] : prev.steps,
        completedAt: data.status === 'completed' ? new Date().toISOString() : undefined
      } : null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [session, model]);

  const pauseSession = useCallback(async () => {
    if (!session) return;

    setAutoProgress(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/takeover', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          action: 'pause'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to pause');
      }

      setSession(prev => prev ? { ...prev, status: 'paused' } : null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const resetSession = () => {
    setSession(null);
    setTask('');
    setContext('');
    setError(null);
    setAutoProgress(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'failed':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-yellow-500 bg-yellow-500/10';
    }
  };

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
              <h2 className="font-bold text-lg">Take Over Mode</h2>
              <p className="text-sm text-gray-400">Autonomous AI Task Execution</p>
            </div>
          </div>
          {session && (
            <div className="flex items-center gap-2">
              {getStatusIcon(session.status)}
              <span className="text-sm capitalize">{session.status}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!session ? (
          // Setup Form
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Task Description</label>
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Describe the task you want the AI to complete autonomously..."
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-24"
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
              <div className="space-y-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Context</label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Any additional context or constraints..."
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="max-steps-input">Max Steps</label>
                    <input
                      id="max-steps-input"
                      type="number"
                      value={maxSteps}
                      onChange={(e) => setMaxSteps(Math.max(1, Math.min(50, parseInt(e.target.value) || 10)))}
                      min={1}
                      max={50}
                      aria-label="Maximum number of steps"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="model-select">Model</label>
                    <select
                      id="model-select"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      aria-label="Select AI model"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="primex-ultra">PRIMEX Ultra</option>
                      <option value="primex-architect">PRIMEX Architect</option>
                      <option value="primex-cortex">PRIMEX Cortex</option>
                      <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                      <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoProgress}
                    onChange={(e) => setAutoProgress(e.target.checked)}
                    className="rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm">Auto-progress (execute all steps automatically)</span>
                </label>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={startTakeOver}
              disabled={isLoading || !task.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initiating...
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  Start Take Over
                </>
              )}
            </button>
          </div>
        ) : (
          // Session View
          <div className="space-y-4">
            {/* Task Summary */}
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Task</div>
              <div className="font-medium">{session.task}</div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${(session.currentStep / session.totalSteps) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-400">
                {session.currentStep}/{session.totalSteps}
              </span>
            </div>

            {/* Steps */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {session.steps.map((step, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${getStepStatusColor(step.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">Step {step.step}</span>
                      {step.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {step.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                      {step.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm font-medium mt-1">{step.action}</div>
                  <div className="text-xs text-gray-400 mt-1">{step.result}</div>
                </div>
              ))}
              <div ref={stepsEndRef} />
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2">
              {session.status === 'running' || session.status === 'paused' ? (
                <>
                  {session.status === 'running' ? (
                    <button
                      onClick={pauseSession}
                      disabled={isLoading}
                      className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={continueSession}
                      disabled={isLoading}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Resume
                    </button>
                  )}
                  <button
                    onClick={continueSession}
                    disabled={isLoading || session.status !== 'running'}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <SkipForward className="w-4 h-4" />
                    Next Step
                  </button>
                </>
              ) : (
                <button
                  onClick={resetSession}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
                >
                  New Task
                </button>
              )}
            </div>

            {/* Auto-progress toggle */}
            {(session.status === 'running' || session.status === 'paused') && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoProgress}
                  onChange={(e) => setAutoProgress(e.target.checked)}
                  className="rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-400">
                  Auto-progress {autoProgress && '(executing automatically...)'}
                </span>
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeOverPanel;
