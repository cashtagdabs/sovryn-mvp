import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

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
  vncPort: number;
  wsPort: number;
  displayNum: number;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

export interface CreateSessionOptions {
  userId: string;
  task: string;
  url?: string;
  maxSteps?: number;
}

class SessionManager extends EventEmitter {
  private sessions: Map<string, BrowserSession> = new Map();
  private nextDisplayNum: number = 99;
  private nextVncPort: number = 5900;
  private nextWsPort: number = 6080;

  constructor() {
    super();
  }

  createSession(options: CreateSessionOptions): BrowserSession {
    const id = uuidv4();
    const displayNum = this.nextDisplayNum++;
    const vncPort = this.nextVncPort++;
    const wsPort = this.nextWsPort++;

    const session: BrowserSession = {
      id,
      userId: options.userId,
      task: options.task,
      url: options.url,
      state: 'INITIALIZING',
      steps: [],
      currentStep: 0,
      maxSteps: options.maxSteps || 10,
      vncPort,
      wsPort,
      displayNum,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(id, session);
    this.emit('session:created', session);
    
    console.log(`[SessionManager] Created session ${id} on display :${displayNum}`);
    return session;
  }

  getSession(id: string): BrowserSession | undefined {
    return this.sessions.get(id);
  }

  getUserSessions(userId: string): BrowserSession[] {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId);
  }

  updateSessionState(id: string, state: SessionState): BrowserSession | undefined {
    const session = this.sessions.get(id);
    if (session) {
      session.state = state;
      session.updatedAt = new Date();
      this.emit('session:state_changed', { sessionId: id, state });
      console.log(`[SessionManager] Session ${id} state changed to ${state}`);
    }
    return session;
  }

  addStep(id: string, step: Omit<SessionStep, 'step' | 'timestamp'>): SessionStep | undefined {
    const session = this.sessions.get(id);
    if (session) {
      const newStep: SessionStep = {
        ...step,
        step: session.currentStep + 1,
        timestamp: new Date().toISOString(),
      };
      session.steps.push(newStep);
      session.currentStep = newStep.step;
      session.updatedAt = new Date();
      this.emit('session:step', { sessionId: id, step: newStep });
      return newStep;
    }
    return undefined;
  }

  takeControl(id: string): boolean {
    const session = this.sessions.get(id);
    if (session && session.state === 'AI_CONTROL') {
      session.state = 'USER_CONTROL';
      session.updatedAt = new Date();
      this.emit('session:control_changed', { sessionId: id, controller: 'USER' });
      console.log(`[SessionManager] User took control of session ${id}`);
      return true;
    }
    return false;
  }

  returnControl(id: string): boolean {
    const session = this.sessions.get(id);
    if (session && session.state === 'USER_CONTROL') {
      session.state = 'AI_CONTROL';
      session.updatedAt = new Date();
      this.emit('session:control_changed', { sessionId: id, controller: 'AI' });
      console.log(`[SessionManager] AI regained control of session ${id}`);
      return true;
    }
    return false;
  }

  pauseSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (session && (session.state === 'AI_CONTROL' || session.state === 'USER_CONTROL')) {
      const previousState = session.state;
      session.state = 'PAUSED';
      session.updatedAt = new Date();
      this.emit('session:paused', { sessionId: id, previousState });
      console.log(`[SessionManager] Session ${id} paused`);
      return true;
    }
    return false;
  }

  resumeSession(id: string, asUser: boolean = false): boolean {
    const session = this.sessions.get(id);
    if (session && session.state === 'PAUSED') {
      session.state = asUser ? 'USER_CONTROL' : 'AI_CONTROL';
      session.updatedAt = new Date();
      this.emit('session:resumed', { sessionId: id, controller: asUser ? 'USER' : 'AI' });
      console.log(`[SessionManager] Session ${id} resumed with ${asUser ? 'USER' : 'AI'} control`);
      return true;
    }
    return false;
  }

  setError(id: string, error: string): void {
    const session = this.sessions.get(id);
    if (session) {
      session.state = 'ERROR';
      session.error = error;
      session.updatedAt = new Date();
      this.emit('session:error', { sessionId: id, error });
      console.error(`[SessionManager] Session ${id} error: ${error}`);
    }
  }

  completeSession(id: string): void {
    const session = this.sessions.get(id);
    if (session) {
      session.state = 'COMPLETED';
      session.updatedAt = new Date();
      this.emit('session:completed', { sessionId: id });
      console.log(`[SessionManager] Session ${id} completed`);
    }
  }

  deleteSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (session) {
      this.sessions.delete(id);
      this.emit('session:deleted', { sessionId: id });
      console.log(`[SessionManager] Session ${id} deleted`);
      return true;
    }
    return false;
  }

  getAllSessions(): BrowserSession[] {
    return Array.from(this.sessions.values());
  }

  getActiveSessions(): BrowserSession[] {
    return Array.from(this.sessions.values()).filter(
      s => s.state !== 'COMPLETED' && s.state !== 'ERROR'
    );
  }
}

// Singleton instance
export const sessionManager = new SessionManager();
