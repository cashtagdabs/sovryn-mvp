import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import WebSocket, { WebSocketServer } from 'ws';
import net from 'net';

interface VNCSession {
  displayNum: number;
  vncPort: number;
  wsPort: number;
  xvfbProcess?: ChildProcess;
  vncProcess?: ChildProcess;
  wsServer?: WebSocketServer;
}

class VNCProxy extends EventEmitter {
  private sessions: Map<string, VNCSession> = new Map();

  async startDisplay(sessionId: string, displayNum: number, vncPort: number, wsPort: number): Promise<void> {
    console.log(`[VNCProxy] Starting display :${displayNum} for session ${sessionId}`);

    const session: VNCSession = {
      displayNum,
      vncPort,
      wsPort,
    };

    try {
      // Start Xvfb (virtual framebuffer)
      session.xvfbProcess = spawn('Xvfb', [
        `:${displayNum}`,
        '-screen', '0', '1920x1080x24',
        '-ac',
      ], {
        stdio: 'pipe',
      });

      session.xvfbProcess.on('error', (err) => {
        console.error(`[VNCProxy] Xvfb error: ${err.message}`);
        this.emit('error', { sessionId, error: err.message });
      });

      // Wait for Xvfb to start
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Start x11vnc
      session.vncProcess = spawn('x11vnc', [
        '-display', `:${displayNum}`,
        '-rfbport', vncPort.toString(),
        '-nopw',
        '-forever',
        '-shared',
        '-noxdamage',
        '-cursor', 'arrow',
        '-ncache', '10',
      ], {
        stdio: 'pipe',
      });

      session.vncProcess.on('error', (err) => {
        console.error(`[VNCProxy] x11vnc error: ${err.message}`);
        this.emit('error', { sessionId, error: err.message });
      });

      // Wait for VNC to start
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Start WebSocket proxy
      await this.startWebSocketProxy(sessionId, session, vncPort, wsPort);

      this.sessions.set(sessionId, session);
      console.log(`[VNCProxy] Display :${displayNum} started successfully`);
      this.emit('display:started', { sessionId, displayNum, vncPort, wsPort });

    } catch (error) {
      await this.stopDisplay(sessionId);
      throw error;
    }
  }

  private async startWebSocketProxy(sessionId: string, session: VNCSession, vncPort: number, wsPort: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const wss = new WebSocketServer({ port: wsPort });

      wss.on('listening', () => {
        console.log(`[VNCProxy] WebSocket proxy listening on port ${wsPort}`);
        session.wsServer = wss;
        resolve();
      });

      wss.on('error', (err) => {
        console.error(`[VNCProxy] WebSocket server error: ${err.message}`);
        reject(err);
      });

      wss.on('connection', (ws: WebSocket) => {
        console.log(`[VNCProxy] Client connected to session ${sessionId}`);

        // Connect to VNC server
        const vncSocket = net.createConnection(vncPort, 'localhost');

        vncSocket.on('connect', () => {
          console.log(`[VNCProxy] Connected to VNC server on port ${vncPort}`);
        });

        vncSocket.on('data', (data: Buffer) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
          }
        });

        vncSocket.on('error', (err) => {
          console.error(`[VNCProxy] VNC socket error: ${err.message}`);
          ws.close();
        });

        vncSocket.on('close', () => {
          console.log(`[VNCProxy] VNC connection closed`);
          ws.close();
        });

        ws.on('message', (data: Buffer) => {
          if (vncSocket.writable) {
            vncSocket.write(data);
          }
        });

        ws.on('close', () => {
          console.log(`[VNCProxy] WebSocket client disconnected`);
          vncSocket.destroy();
        });

        ws.on('error', (err) => {
          console.error(`[VNCProxy] WebSocket error: ${err.message}`);
          vncSocket.destroy();
        });
      });
    });
  }

  async stopDisplay(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.log(`[VNCProxy] Stopping display for session ${sessionId}`);

    // Close WebSocket server
    if (session.wsServer) {
      session.wsServer.close();
    }

    // Kill VNC process
    if (session.vncProcess) {
      session.vncProcess.kill('SIGTERM');
    }

    // Kill Xvfb process
    if (session.xvfbProcess) {
      session.xvfbProcess.kill('SIGTERM');
    }

    this.sessions.delete(sessionId);
    this.emit('display:stopped', { sessionId });
  }

  async stopAllDisplays(): Promise<void> {
    const sessionIds = Array.from(this.sessions.keys());
    await Promise.all(sessionIds.map(id => this.stopDisplay(id)));
  }

  getSession(sessionId: string): VNCSession | undefined {
    return this.sessions.get(sessionId);
  }
}

// Singleton instance
export const vncProxy = new VNCProxy();

// Alternative: Simple screenshot-based streaming for environments without Xvfb
export class ScreenshotStreamer extends EventEmitter {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  startStreaming(sessionId: string, getScreenshot: () => Promise<string>, intervalMs: number = 100): void {
    if (this.intervals.has(sessionId)) {
      this.stopStreaming(sessionId);
    }

    const interval = setInterval(async () => {
      try {
        const screenshot = await getScreenshot();
        this.emit('frame', { sessionId, screenshot });
      } catch (error) {
        // Ignore errors during streaming
      }
    }, intervalMs);

    this.intervals.set(sessionId, interval);
    console.log(`[ScreenshotStreamer] Started streaming for session ${sessionId}`);
  }

  stopStreaming(sessionId: string): void {
    const interval = this.intervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(sessionId);
      console.log(`[ScreenshotStreamer] Stopped streaming for session ${sessionId}`);
    }
  }

  stopAllStreaming(): void {
    this.intervals.forEach((interval, sessionId) => {
      clearInterval(interval);
      console.log(`[ScreenshotStreamer] Stopped streaming for session ${sessionId}`);
    });
    this.intervals.clear();
  }
}

export const screenshotStreamer = new ScreenshotStreamer();
