'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Monitor, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  MousePointer,
  Eye,
  Loader2
} from 'lucide-react';

interface BrowserViewPanelProps {
  sessionId: string;
  streamUrl?: string;
  isInteractive: boolean;
  onConnectionChange?: (connected: boolean) => void;
  className?: string;
}

export const BrowserViewPanel: React.FC<BrowserViewPanelProps> = ({
  sessionId,
  streamUrl,
  isInteractive,
  onConnectionChange,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);

  // Connect to screenshot stream (fallback mode)
  const connectToScreenshotStream = useCallback((socket: WebSocket) => {
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'frame' && data.screenshot) {
          drawScreenshot(data.screenshot);
          setFrameCount(prev => prev + 1);
        }
      } catch (e) {
        // Binary VNC data - would need noVNC library for full support
        console.log('Received binary data, VNC mode not fully implemented');
      }
    };
  }, []);

  // Draw screenshot to canvas
  const drawScreenshot = useCallback((dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setIsLoading(false);
    };
    img.src = dataUrl;
  }, []);

  // Connect to WebSocket
  useEffect(() => {
    if (!streamUrl) return;

    setIsLoading(true);
    setError(null);

    const ws = new WebSocket(streamUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[BrowserView] Connected to stream');
      setIsConnected(true);
      onConnectionChange?.(true);
    };

    ws.onclose = () => {
      console.log('[BrowserView] Disconnected from stream');
      setIsConnected(false);
      onConnectionChange?.(false);
    };

    ws.onerror = (err) => {
      console.error('[BrowserView] WebSocket error:', err);
      setError('Failed to connect to browser stream');
      setIsConnected(false);
      onConnectionChange?.(false);
    };

    connectToScreenshotStream(ws);

    return () => {
      ws.close();
    };
  }, [streamUrl, connectToScreenshotStream, onConnectionChange]);

  // Handle mouse events when interactive
  const handleMouseEvent = useCallback((event: React.MouseEvent<HTMLCanvasElement>, type: string) => {
    if (!isInteractive || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.round((event.clientX - rect.left) * scaleX);
    const y = Math.round((event.clientY - rect.top) * scaleY);

    wsRef.current.send(JSON.stringify({
      type: 'mouse',
      event: type,
      x,
      y,
      button: event.button,
    }));
  }, [isInteractive]);

  // Handle keyboard events when interactive
  const handleKeyEvent = useCallback((event: React.KeyboardEvent<HTMLCanvasElement>, type: string) => {
    if (!isInteractive || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    event.preventDefault();
    wsRef.current.send(JSON.stringify({
      type: 'keyboard',
      event: type,
      key: event.key,
      keyCode: event.keyCode,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
    }));
  }, [isInteractive]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Reconnect
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    // The useEffect will handle reconnection when streamUrl changes
    // For manual reconnect, we need to force a re-render
    setIsConnected(false);
    setIsLoading(true);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`bg-gray-900 rounded-xl border border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">Live Browser View</span>
          {isInteractive ? (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
              <MousePointer className="w-3 h-3" />
              Interactive
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
              <Eye className="w-3 h-3" />
              View Only
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Connection status */}
          <div className={`flex items-center gap-1 text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>

          {/* Frame counter */}
          {isConnected && (
            <span className="text-xs text-gray-500">
              {frameCount} frames
            </span>
          )}

          {/* Reconnect button */}
          <button
            onClick={reconnect}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Reconnect"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-gray-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Canvas container */}
      <div className="relative aspect-video bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <span className="text-sm text-gray-400">Connecting to browser...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <WifiOff className="w-8 h-8 text-red-500" />
              <span className="text-sm text-red-400">{error}</span>
              <button
                onClick={reconnect}
                className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={`w-full h-full object-contain ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
          tabIndex={isInteractive ? 0 : -1}
          onMouseDown={(e) => handleMouseEvent(e, 'mousedown')}
          onMouseUp={(e) => handleMouseEvent(e, 'mouseup')}
          onMouseMove={(e) => handleMouseEvent(e, 'mousemove')}
          onClick={(e) => handleMouseEvent(e, 'click')}
          onDoubleClick={(e) => handleMouseEvent(e, 'dblclick')}
          onContextMenu={(e) => {
            e.preventDefault();
            handleMouseEvent(e, 'contextmenu');
          }}
          onKeyDown={(e) => handleKeyEvent(e, 'keydown')}
          onKeyUp={(e) => handleKeyEvent(e, 'keyup')}
        />

        {/* Interactive mode overlay hint */}
        {isInteractive && isConnected && !isLoading && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-gray-300">
            Click and type to interact with the browser
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserViewPanel;
