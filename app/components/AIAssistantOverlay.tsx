'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, MessageSquare, FolderOpen, Users, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { AIChatInterface } from './AIChatInterface';
import { collaborationService } from '../utils/collaboration';

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
  cursor?: { x: number; y: number };
  isTyping?: boolean;
}

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
}

interface AIAssistantOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'chat' | 'files' | 'collaboration';
}

export const AIAssistantOverlay: React.FC<AIAssistantOverlayProps> = ({
  isOpen,
  onClose,
  initialTab = 'chat'
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'collaboration'>(initialTab);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize collaboration
    const userData = {
      name: 'Current User',
      color: '#8B5CF6'
    };
    
    collaborationService.joinRoom('main-workspace', userData);

    const unsubUserJoined = collaborationService.on('user-joined', (data) => {
      setCollaborators(data.roomUsers || []);
    });

    const unsubUserLeft = collaborationService.on('user-left', (data) => {
      setCollaborators(data.roomUsers || []);
    });

    const unsubRoomState = collaborationService.on('room-state', (data) => {
      setCollaborators(data.users || []);
    });

    const unsubConnStatus = collaborationService.on('connection-status', (data) => {
      setIsConnected(data.connected);
    });

    const unsubTyping = collaborationService.on('user-typing', (data) => {
      setCollaborators(prev => 
        prev.map(c => c.id === data.userId ? { ...c, isTyping: data.isTyping } : c)
      );
    });

    // Set initial connection status
    setIsConnected(collaborationService.getConnectionStatus());

    return () => {
      unsubUserJoined();
      unsubUserLeft();
      unsubRoomState();
      unsubConnStatus();
      unsubTyping();
    };
  }, []);

  const loadMockFiles = useCallback(() => {
    // Mock file system - in production, this would come from an API
    setFiles([
      { name: 'app', path: '/app', type: 'directory' },
      { name: 'components', path: '/app/components', type: 'directory' },
      { name: 'ChatInterface.tsx', path: '/app/components/ChatInterface.tsx', type: 'file' },
      { name: 'page.tsx', path: '/app/page.tsx', type: 'file' },
      { name: 'layout.tsx', path: '/app/layout.tsx', type: 'file' },
      { name: 'package.json', path: '/package.json', type: 'file' },
    ]);
    setActiveTab('files');
  }, []);

  const loadFileContent = useCallback(async (filePath: string) => {
    // Mock file content - in production, this would fetch from API
    const mockContent = `// File: ${filePath}
import React from 'react';

export default function Component() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}
`;
    setSelectedFileContent(mockContent);
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isMaximized 
          ? 'inset-4' 
          : 'right-4 bottom-4 w-[420px] h-[600px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-semibold text-white">PRIMEX AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            aria-label={isMaximized ? 'Minimize' : 'Maximize'}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4 text-gray-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 px-4 flex items-center justify-center gap-2 text-sm transition-colors ${
            activeTab === 'chat' 
              ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          AI Chat
        </button>
        <button
          onClick={loadMockFiles}
          className={`flex-1 py-2.5 px-4 flex items-center justify-center gap-2 text-sm transition-colors ${
            activeTab === 'files' 
              ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Files
        </button>
        <button
          onClick={() => setActiveTab('collaboration')}
          className={`flex-1 py-2.5 px-4 flex items-center justify-center gap-2 text-sm transition-colors ${
            activeTab === 'collaboration' 
              ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Team ({collaborators.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <AIChatInterface initialContext={selectedFileContent} />
        )}
        
        {activeTab === 'files' && (
          <div className="h-full flex">
            {/* File Tree */}
            <div className="w-1/2 border-r border-gray-700 overflow-y-auto p-2">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-2">
                Project Files
              </div>
              {files.map((file) => (
                <button
                  key={file.path}
                  onClick={() => file.type === 'file' && loadFileContent(file.path)}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${
                    file.type === 'file' 
                      ? 'hover:bg-gray-800 cursor-pointer' 
                      : 'text-gray-500'
                  }`}
                >
                  {file.type === 'directory' ? (
                    <FolderOpen className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <div className="w-4 h-4 flex items-center justify-center text-xs text-blue-400">
                      📄
                    </div>
                  )}
                  <span className={file.type === 'directory' ? 'text-gray-400' : 'text-white'}>
                    {file.name}
                  </span>
                </button>
              ))}
            </div>

            {/* File Preview */}
            <div className="w-1/2 overflow-y-auto">
              {selectedFileContent ? (
                <pre className="p-3 text-xs font-mono text-gray-300 whitespace-pre-wrap">
                  {selectedFileContent}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Select a file to preview
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'collaboration' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              Active Collaborators
            </div>
            
            {collaborators.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No other collaborators online</p>
                <p className="text-xs mt-1">Share the workspace link to invite others</p>
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                      style={{ backgroundColor: collaborator.color || '#8B5CF6' }}
                    >
                      {collaborator.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white">{collaborator.name}</div>
                      <div className="text-xs text-gray-500">
                        {collaborator.isTyping ? (
                          <span className="text-purple-400">Typing...</span>
                        ) : (
                          'Online'
                        )}
                      </div>
                    </div>
                    {collaborator.cursor && (
                      <div className="text-xs text-gray-500">
                        ({collaborator.cursor.x}, {collaborator.cursor.y})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Collaboration Settings */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Settings className="w-3 h-3" />
                Settings
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" className="rounded" defaultChecked />
                  Show cursor positions
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" className="rounded" defaultChecked />
                  Enable real-time sync
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  Share AI conversations
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantOverlay;
