'use client';

import { io, Socket } from 'socket.io-client';

interface CollaborationMessage {
    type: 'cursor_move' | 'text_edit' | 'selection' | 'presence' | 'ai_chat' | 'code_analysis';
    userId: string;
    payload: any;
    timestamp: number;
}

interface AIChatMessage {
    message: string;
    context: any;
    messageId: string;
    shareWithRoom?: boolean;
}

interface CodeAnalysisRequest {
    code: string;
    filePath: string;
    analysisType: 'full' | 'quick' | 'security';
    analysisId?: string;
}

interface UserData {
    name: string;
    avatar?: string;
    color?: string;
}

interface CursorPosition {
    x: number;
    y: number;
    line?: number;
    column?: number;
}

type EventCallback = (data: any) => void;

class CollaborationService {
    private socket: Socket | null = null;
    private listeners: Map<string, EventCallback[]> = new Map();
    private roomId: string = 'global';
    private userData: UserData | null = null;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    constructor() {
        if (typeof window !== 'undefined') {
            this.initializeSocketIO();
        }
    }

    private initializeSocketIO() {
        const serverUrl = process.env.NEXT_PUBLIC_COLLABORATION_URL || 'http://localhost:3001';

        this.socket = io(serverUrl, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to collaboration server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connection-status', { connected: true });

            // Rejoin room if we had one
            if (this.roomId && this.userData) {
                this.joinRoom(this.roomId, this.userData);
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from collaboration server:', reason);
            this.isConnected = false;
            this.emit('connection-status', { connected: false, reason });
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
            this.reconnectAttempts++;
            this.emit('connection-error', { error: error.message, attempts: this.reconnectAttempts });
        });

        // Set up event listeners
        this.socket.on('ai-chat-response', (data: any) => {
            this.emit('ai-chat-response', data);
        });

        this.socket.on('ai-chat-error', (data: any) => {
            this.emit('ai-chat-error', data);
        });

        this.socket.on('code-analysis-result', (data: any) => {
            this.emit('code-analysis-result', data);
        });

        this.socket.on('code-analysis-error', (data: any) => {
            this.emit('code-analysis-error', data);
        });

        this.socket.on('cursor-update', (data: any) => {
            this.emit('cursor-update', data);
        });

        this.socket.on('text-update', (data: any) => {
            this.emit('text-update', data);
        });

        this.socket.on('selection-update', (data: any) => {
            this.emit('selection-update', data);
        });

        this.socket.on('user-joined', (data: any) => {
            this.emit('user-joined', data);
        });

        this.socket.on('user-left', (data: any) => {
            this.emit('user-left', data);
        });

        this.socket.on('user-typing', (data: any) => {
            this.emit('user-typing', data);
        });

        this.socket.on('room-state', (data: any) => {
            this.emit('room-state', data);
        });
    }

    joinRoom(roomId: string, userData?: UserData) {
        this.roomId = roomId;
        if (userData) {
            this.userData = userData;
        }

        if (this.socket && this.isConnected) {
            this.socket.emit('join-room', roomId, this.userData || {
                name: 'Anonymous',
                color: this.generateRandomColor()
            });
        }
    }

    leaveRoom(roomId?: string) {
        const targetRoom = roomId || this.roomId;
        if (this.socket) {
            this.socket.emit('leave-room', targetRoom);
        }
    }

    sendAIChatMessage(messageData: AIChatMessage) {
        if (this.socket && this.isConnected) {
            this.socket.emit('ai-chat-message', {
                roomId: this.roomId,
                ...messageData
            });
        } else {
            console.warn('Cannot send AI chat message - not connected');
            this.emit('ai-chat-error', {
                messageId: messageData.messageId,
                error: 'Not connected to collaboration server'
            });
        }
    }

    sendCodeAnalysis(analysisData: CodeAnalysisRequest) {
        const analysisId = analysisData.analysisId || `analysis-${Date.now()}`;

        if (this.socket && this.isConnected) {
            this.socket.emit('code-analysis', {
                roomId: this.roomId,
                ...analysisData,
                analysisId
            });
        } else {
            console.warn('Cannot send code analysis - not connected');
            this.emit('code-analysis-error', {
                analysisId,
                error: 'Not connected to collaboration server'
            });
        }

        return analysisId;
    }

    trackCursor(position: CursorPosition) {
        if (this.socket && this.isConnected) {
            this.socket.emit('cursor-move', {
                roomId: this.roomId,
                position,
                userData: this.userData
            });
        }
    }

    trackTextEdit(edit: any, documentState: any) {
        if (this.socket && this.isConnected) {
            this.socket.emit('text-edit', {
                roomId: this.roomId,
                edit,
                documentState
            });
        }
    }

    trackSelection(selection: any) {
        if (this.socket && this.isConnected) {
            this.socket.emit('selection-change', {
                roomId: this.roomId,
                selection
            });
        }
    }

    startTyping() {
        if (this.socket && this.isConnected) {
            this.socket.emit('typing-start', { roomId: this.roomId });
        }
    }

    stopTyping() {
        if (this.socket && this.isConnected) {
            this.socket.emit('typing-stop', { roomId: this.roomId });
        }
    }

    on(event: string, callback: EventCallback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    off(event: string, callback?: EventCallback) {
        if (callback) {
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        } else {
            this.listeners.delete(event);
        }
    }

    private emit(event: string, data: any) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    private generateRandomColor(): string {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
            '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    getCurrentRoom(): string {
        return this.roomId;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
        }
    }

    reconnect() {
        if (this.socket) {
            this.socket.connect();
        }
    }
}

// Singleton instance
export const collaborationService = new CollaborationService();
