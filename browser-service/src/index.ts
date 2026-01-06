import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupWebSocketServer } from './websocket-server';
import { sessionManager } from './session-manager';
import { puppeteerController } from './puppeteer-controller';
import { vncProxy, screenshotStreamer } from './vnc-proxy';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeSessions: sessionManager.getActiveSessions().length,
    timestamp: new Date().toISOString(),
  });
});

// REST API endpoints (for non-WebSocket clients)

// Create session
app.post('/api/sessions', async (req, res) => {
  try {
    const { userId, task, url, maxSteps } = req.body;
    
    if (!userId || !task) {
      return res.status(400).json({ error: 'userId and task are required' });
    }

    const session = sessionManager.createSession({ userId, task, url, maxSteps });
    
    // Try to start VNC display (may fail in environments without Xvfb)
    try {
      await vncProxy.startDisplay(session.id, session.displayNum, session.vncPort, session.wsPort);
    } catch (error) {
      console.warn('[API] VNC not available, using screenshot streaming');
    }

    // Launch browser
    await puppeteerController.launchBrowser(session);

    // If VNC failed, start screenshot streaming
    if (!vncProxy.getSession(session.id)) {
      screenshotStreamer.startStreaming(session.id, () => puppeteerController.getScreenshot(session.id));
    }

    res.json({
      sessionId: session.id,
      streamUrl: `ws://${process.env.BROWSER_SERVICE_HOST || 'localhost'}:${session.wsPort}`,
      session: {
        id: session.id,
        state: session.state,
        task: session.task,
        currentStep: session.currentStep,
        maxSteps: session.maxSteps,
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Create session error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// Get session
app.get('/api/sessions/:id', (req, res) => {
  const session = sessionManager.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json({ session });
});

// Get all sessions for user
app.get('/api/sessions', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const sessions = sessionManager.getUserSessions(userId);
  res.json({ sessions });
});

// Control session
app.put('/api/sessions/:id/control', (req, res) => {
  const { action } = req.body;
  const sessionId = req.params.id;
  const session = sessionManager.getSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  let success = false;
  switch (action) {
    case 'take_control':
      success = sessionManager.takeControl(sessionId);
      break;
    case 'return_control':
      success = sessionManager.returnControl(sessionId);
      break;
    case 'pause':
      success = sessionManager.pauseSession(sessionId);
      break;
    case 'resume':
      success = sessionManager.resumeSession(sessionId);
      break;
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }

  if (success) {
    res.json({ success: true, state: sessionManager.getSession(sessionId)?.state });
  } else {
    res.status(400).json({ error: 'Action not allowed in current state' });
  }
});

// Navigate
app.post('/api/sessions/:id/navigate', async (req, res) => {
  try {
    const { url } = req.body;
    await puppeteerController.navigateTo(req.params.id, url);
    res.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Execute step
app.post('/api/sessions/:id/step', async (req, res) => {
  try {
    const { action, script } = req.body;
    const step = await puppeteerController.executeStep(req.params.id, action, script);
    res.json({ step });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Get screenshot
app.get('/api/sessions/:id/screenshot', async (req, res) => {
  try {
    const screenshot = await puppeteerController.getScreenshot(req.params.id);
    res.json({ screenshot });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// End session
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    
    // Stop streaming
    screenshotStreamer.stopStreaming(sessionId);
    
    // Stop VNC
    await vncProxy.stopDisplay(sessionId);
    
    // Close browser
    await puppeteerController.closeBrowser(sessionId);
    
    // Complete session
    sessionManager.completeSession(sessionId);
    
    res.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Setup WebSocket server
const io = setupWebSocketServer(httpServer);

// Forward screenshot frames to WebSocket clients
screenshotStreamer.on('frame', ({ sessionId, screenshot }) => {
  io.to(`session:${sessionId}`).emit('session:frame', { sessionId, screenshot });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Server] Shutting down...');
  await puppeteerController.closeAllBrowsers();
  await vncProxy.stopAllDisplays();
  screenshotStreamer.stopAllStreaming();
  httpServer.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Server] Interrupted, shutting down...');
  await puppeteerController.closeAllBrowsers();
  await vncProxy.stopAllDisplays();
  screenshotStreamer.stopAllStreaming();
  httpServer.close();
  process.exit(0);
});

// Start server
const PORT = process.env.BROWSER_SERVICE_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║         Sovryn Browser Streaming Service                  ║
╠═══════════════════════════════════════════════════════════╣
║  HTTP Server:    http://localhost:${PORT}                    ║
║  WebSocket:      ws://localhost:${PORT}                      ║
║  Health Check:   http://localhost:${PORT}/health             ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export { app, httpServer, io };
