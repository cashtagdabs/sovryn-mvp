import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupWebSocketServer } from './websocket-server';
import { sessionManager } from './session-manager';
import { puppeteerController } from './puppeteer-controller';
import { vncProxy, screenshotStreamer } from './vnc-proxy';
import { agentOrchestrator } from './agent-orchestrator';

const app = express();
const httpServer = createServer(app);
const isMac = process.platform === 'darwin';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  const navigatorAvailable = await agentOrchestrator.checkModelAvailable();
  
  res.json({ 
    status: 'ok',
    platform: process.platform,
    activeSessions: sessionManager.getActiveSessions().length,
    navigatorModel: navigatorAvailable ? 'available' : 'not found',
    timestamp: new Date().toISOString(),
  });
});

// REST API endpoints

// Create session
app.post('/api/sessions', async (req, res) => {
  try {
    const { userId, task, url, maxSteps } = req.body;
    
    if (!userId || !task) {
      return res.status(400).json({ error: 'userId and task are required' });
    }

    const session = sessionManager.createSession({ userId, task, url, maxSteps });
    
    // On Mac, skip VNC (not needed - browser window is visible)
    if (!isMac) {
      try {
        await vncProxy.startDisplay(session.id, session.displayNum, session.vncPort, session.wsPort);
      } catch (error) {
        console.warn('[API] VNC not available, using screenshot streaming');
      }
    }

    // Launch browser
    await puppeteerController.launchBrowser(session);

    // Start screenshot streaming for live view
    screenshotStreamer.startStreaming(session.id, () => puppeteerController.getScreenshot(session.id));

    res.json({
      sessionId: session.id,
      streamUrl: `ws://${process.env.BROWSER_SERVICE_HOST || 'localhost'}:${process.env.BROWSER_SERVICE_PORT || 3001}`,
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

// ============================================
// AGENT ORCHESTRATOR ENDPOINTS (NEW)
// ============================================

// Start AI agent task
app.post('/api/sessions/:id/agent/start', async (req, res) => {
  const sessionId = req.params.id;
  const session = sessionManager.getSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Check if NAVIGATOR model is available
  const modelAvailable = await agentOrchestrator.checkModelAvailable();
  if (!modelAvailable) {
    return res.status(503).json({ 
      error: 'NAVIGATOR model not available',
      hint: 'Run: ollama create navigator -f primex-backend/ollama/clone-prompts/navigator.Modelfile'
    });
  }

  // Start the agent task (non-blocking)
  agentOrchestrator.runTask(sessionId, session.task)
    .then(result => {
      console.log(`[API] Agent task completed for ${sessionId}:`, result);
    })
    .catch(error => {
      console.error(`[API] Agent task failed for ${sessionId}:`, error);
    });

  res.json({ 
    success: true, 
    message: 'Agent task started',
    sessionId,
    task: session.task,
  });
});

// Cancel AI agent task
app.post('/api/sessions/:id/agent/cancel', (req, res) => {
  const sessionId = req.params.id;
  agentOrchestrator.cancelTask(sessionId);
  res.json({ success: true, message: 'Task cancellation requested' });
});

// Check NAVIGATOR model status
app.get('/api/agent/status', async (req, res) => {
  const modelAvailable = await agentOrchestrator.checkModelAvailable();
  res.json({
    navigatorModel: modelAvailable ? 'available' : 'not found',
    ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    hint: modelAvailable ? null : 'Run: ollama create navigator -f primex-backend/ollama/clone-prompts/navigator.Modelfile',
  });
});

// ============================================
// BROWSER CONTROL ENDPOINTS
// ============================================

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

// Click
app.post('/api/sessions/:id/click', async (req, res) => {
  try {
    const { selector } = req.body;
    await puppeteerController.click(req.params.id, selector);
    res.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Type
app.post('/api/sessions/:id/type', async (req, res) => {
  try {
    const { selector, text } = req.body;
    await puppeteerController.type(req.params.id, selector, text);
    res.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Scroll
app.post('/api/sessions/:id/scroll', async (req, res) => {
  try {
    const { direction } = req.body;
    await puppeteerController.scroll(req.params.id, direction || 'down');
    res.json({ success: true });
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

// Get page info (for debugging)
app.get('/api/sessions/:id/page-info', async (req, res) => {
  try {
    const pageInfo = await puppeteerController.getPageInfo(req.params.id);
    res.json(pageInfo);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// End session
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    
    // Cancel any running agent task
    agentOrchestrator.cancelTask(sessionId);
    
    // Stop streaming
    screenshotStreamer.stopStreaming(sessionId);
    
    // Stop VNC (if running)
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

// Forward agent events to WebSocket clients
agentOrchestrator.on('step_start', (data) => {
  io.to(`session:${data.sessionId}`).emit('agent:step_start', data);
});

agentOrchestrator.on('action_decided', (data) => {
  io.to(`session:${data.sessionId}`).emit('agent:action_decided', data);
});

agentOrchestrator.on('action_executed', (data) => {
  io.to(`session:${data.sessionId}`).emit('agent:action_executed', data);
});

agentOrchestrator.on('action_failed', (data) => {
  io.to(`session:${data.sessionId}`).emit('agent:action_failed', data);
});

agentOrchestrator.on('takeover_requested', (data) => {
  io.to(`session:${data.sessionId}`).emit('agent:takeover_requested', data);
});

agentOrchestrator.on('task_complete', (data) => {
  io.to(`session:${data.sessionId}`).emit('agent:task_complete', data);
});

agentOrchestrator.on('task_cancelled', (data) => {
  io.to(`session:${data.sessionId}`).emit('agent:task_cancelled', data);
});

agentOrchestrator.on('waiting_for_user', (data) => {
  io.to(`session:${data.sessionId}`).emit('agent:waiting_for_user', data);
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
╔═══════════════════════════════════════════════════════════════╗
║           PRIMEX SOVEREIGN - Browser Service                  ║
╠═══════════════════════════════════════════════════════════════╣
║  Platform:       ${process.platform.padEnd(42)}║
║  HTTP Server:    http://localhost:${String(PORT).padEnd(27)}║
║  WebSocket:      ws://localhost:${String(PORT).padEnd(29)}║
║  Health Check:   http://localhost:${PORT}/health${' '.repeat(21)}║
║  Agent Status:   http://localhost:${PORT}/api/agent/status${' '.repeat(10)}║
╠═══════════════════════════════════════════════════════════════╣
║  To create NAVIGATOR model, run:                              ║
║  ollama create navigator -f                                   ║
║    primex-backend/ollama/clone-prompts/navigator.Modelfile    ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

export { app, httpServer, io };
