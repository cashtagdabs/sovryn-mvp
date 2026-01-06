import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { sessionManager, BrowserSession, CreateSessionOptions } from './session-manager';
import { puppeteerController } from './puppeteer-controller';

interface ClientSocket extends Socket {
  userId?: string;
  sessionId?: string;
}

export function setupWebSocketServer(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Forward session manager events to connected clients
  sessionManager.on('session:created', (session: BrowserSession) => {
    io.to(`user:${session.userId}`).emit('session:created', sanitizeSession(session));
  });

  sessionManager.on('session:state_changed', ({ sessionId, state }) => {
    const session = sessionManager.getSession(sessionId);
    if (session) {
      io.to(`session:${sessionId}`).emit('session:state_changed', { sessionId, state });
      io.to(`user:${session.userId}`).emit('session:state_changed', { sessionId, state });
    }
  });

  sessionManager.on('session:step', ({ sessionId, step }) => {
    io.to(`session:${sessionId}`).emit('session:step', { sessionId, step });
  });

  sessionManager.on('session:control_changed', ({ sessionId, controller }) => {
    io.to(`session:${sessionId}`).emit('session:control_changed', { sessionId, controller });
  });

  sessionManager.on('session:error', ({ sessionId, error }) => {
    io.to(`session:${sessionId}`).emit('session:error', { sessionId, error });
  });

  sessionManager.on('session:completed', ({ sessionId }) => {
    io.to(`session:${sessionId}`).emit('session:completed', { sessionId });
  });

  sessionManager.on('session:paused', ({ sessionId }) => {
    io.to(`session:${sessionId}`).emit('session:paused', { sessionId });
  });

  sessionManager.on('session:resumed', ({ sessionId }) => {
    io.to(`session:${sessionId}`).emit('session:resumed', { sessionId });
  });

  io.on('connection', (socket: ClientSocket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Authenticate user
    socket.on('auth', ({ userId }: { userId: string }) => {
      socket.userId = userId;
      socket.join(`user:${userId}`);
      console.log(`[WebSocket] User ${userId} authenticated`);
      
      // Send existing sessions
      const sessions = sessionManager.getUserSessions(userId);
      socket.emit('sessions:list', sessions.map(sanitizeSession));
    });

    // Create new browser session
    socket.on('session:create', async (options: CreateSessionOptions) => {
      if (!socket.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      try {
        const session = sessionManager.createSession({
          ...options,
          userId: socket.userId,
        });

        socket.sessionId = session.id;
        socket.join(`session:${session.id}`);

        // Launch browser
        await puppeteerController.launchBrowser(session);

        socket.emit('session:ready', {
          sessionId: session.id,
          streamUrl: getStreamUrl(session),
          session: sanitizeSession(session),
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        socket.emit('session:error', { error: errorMessage });
      }
    });

    // Join existing session
    socket.on('session:join', ({ sessionId }: { sessionId: string }) => {
      const session = sessionManager.getSession(sessionId);
      if (session && session.userId === socket.userId) {
        socket.sessionId = sessionId;
        socket.join(`session:${sessionId}`);
        socket.emit('session:joined', {
          session: sanitizeSession(session),
          streamUrl: getStreamUrl(session),
        });
      } else {
        socket.emit('error', { message: 'Session not found or access denied' });
      }
    });

    // Take control from AI
    socket.on('session:take_control', ({ sessionId }: { sessionId: string }) => {
      const session = sessionManager.getSession(sessionId);
      if (session && session.userId === socket.userId) {
        if (sessionManager.takeControl(sessionId)) {
          socket.emit('session:control_taken', { sessionId });
        } else {
          socket.emit('error', { message: 'Cannot take control in current state' });
        }
      }
    });

    // Return control to AI
    socket.on('session:return_control', ({ sessionId }: { sessionId: string }) => {
      const session = sessionManager.getSession(sessionId);
      if (session && session.userId === socket.userId) {
        if (sessionManager.returnControl(sessionId)) {
          socket.emit('session:control_returned', { sessionId });
        } else {
          socket.emit('error', { message: 'Cannot return control in current state' });
        }
      }
    });

    // Pause session
    socket.on('session:pause', ({ sessionId }: { sessionId: string }) => {
      const session = sessionManager.getSession(sessionId);
      if (session && session.userId === socket.userId) {
        sessionManager.pauseSession(sessionId);
      }
    });

    // Resume session
    socket.on('session:resume', ({ sessionId, asUser }: { sessionId: string; asUser?: boolean }) => {
      const session = sessionManager.getSession(sessionId);
      if (session && session.userId === socket.userId) {
        sessionManager.resumeSession(sessionId, asUser);
      }
    });

    // Execute AI step
    socket.on('session:execute_step', async ({ sessionId, action, script }: { sessionId: string; action: string; script?: string }) => {
      const session = sessionManager.getSession(sessionId);
      if (session && session.userId === socket.userId && session.state === 'AI_CONTROL') {
        try {
          const step = await puppeteerController.executeStep(sessionId, action, script);
          if (step) {
            socket.emit('session:step_completed', { sessionId, step });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          socket.emit('session:step_error', { sessionId, error: errorMessage });
        }
      }
    });

    // Navigate to URL
    socket.on('session:navigate', async ({ sessionId, url }: { sessionId: string; url: string }) => {
      const session = sessionManager.getSession(sessionId);
      if (session && session.userId === socket.userId) {
        try {
          await puppeteerController.navigateTo(sessionId, url);
          socket.emit('session:navigated', { sessionId, url });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          socket.emit('session:navigate_error', { sessionId, error: errorMessage });
        }
      }
    });

    // Get screenshot
    socket.on('session:screenshot', async ({ sessionId }: { sessionId: string }) => {
      const session = sessionManager.getSession(sessionId);
      if (session && session.userId === socket.userId) {
        try {
          const screenshot = await puppeteerController.getScreenshot(sessionId);
          socket.emit('session:screenshot', { sessionId, screenshot });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          socket.emit('error', { message: errorMessage });
        }
      }
    });

    // End session
    socket.on('session:end', async ({ sessionId }: { sessionId: string }) => {
      const session = sessionManager.getSession(sessionId);
      if (session && session.userId === socket.userId) {
        await puppeteerController.closeBrowser(sessionId);
        sessionManager.completeSession(sessionId);
        socket.leave(`session:${sessionId}`);
        socket.emit('session:ended', { sessionId });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function sanitizeSession(session: BrowserSession): Partial<BrowserSession> {
  return {
    id: session.id,
    userId: session.userId,
    task: session.task,
    url: session.url,
    state: session.state,
    steps: session.steps,
    currentStep: session.currentStep,
    maxSteps: session.maxSteps,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    error: session.error,
  };
}

function getStreamUrl(session: BrowserSession): string {
  const host = process.env.BROWSER_SERVICE_HOST || 'localhost';
  const port = session.wsPort;
  return `ws://${host}:${port}`;
}
