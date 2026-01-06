# Self-Hosted Browser Streaming Architecture

## Overview

This architecture enables real-time browser viewing and control handoff between AI automation and users, completely self-hosted with zero external costs.

## Architecture Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Sovryn MVP Frontend (Next.js)               │    │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐   │    │
│  │  │ TakeOverPanel   │  │  BrowserViewPanel (noVNC)   │   │    │
│  │  │ - Task Input    │  │  - Live browser stream      │   │    │
│  │  │ - Step Progress │  │  - Mouse/keyboard input     │   │    │
│  │  │ - Control Btns  │  │  - Fullscreen toggle        │   │    │
│  │  └─────────────────┘  └─────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket (Socket.io + noVNC)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Browser Streaming Service                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Node.js Backend                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │
│  │  │ Session Mgr │  │ Puppeteer   │  │ WebSocket Proxy │  │    │
│  │  │ - Create    │  │ Controller  │  │ (websockify)    │  │    │
│  │  │ - Pause     │  │ - Navigate  │  │ - VNC → WS      │  │    │
│  │  │ - Resume    │  │ - Execute   │  │ - Bidirectional │  │    │
│  │  │ - Handoff   │  │ - AI Tasks  │  │                 │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                Virtual Display Stack                     │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │
│  │  │    Xvfb     │  │  x11vnc     │  │    Chrome       │  │    │
│  │  │  (Display)  │◄─│ (VNC Srv)   │◄─│  (Puppeteer)    │  │    │
│  │  │  :99        │  │  Port 5900  │  │  Headful Mode   │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Components

**BrowserViewPanel.tsx**
- Embeds noVNC client for live browser streaming
- Handles mouse/keyboard events when user has control
- Shows connection status and quality indicators
- Toggle between view-only and interactive modes

**Enhanced TakeOverPanel.tsx**
- Existing component extended with browser view integration
- "Watch AI" button to open live stream
- "Take Control" / "Return Control" buttons
- Visual indicator of who has control (AI vs User)

### 2. Backend Service (browser-service/)

**session-manager.ts**
- Creates/destroys browser sessions
- Tracks session state (AI_CONTROL, USER_CONTROL, PAUSED)
- Manages handoff between AI and user
- Stores session metadata in memory (Redis for production)

**puppeteer-controller.ts**
- Launches Chrome in headful mode on virtual display
- Executes AI automation tasks
- Pauses execution when user takes control
- Resumes when control returned

**websocket-server.ts**
- Socket.io for control messages (pause, resume, handoff)
- Proxies VNC connection via websockify
- Broadcasts session state changes

### 3. Virtual Display Stack (Docker)

**Xvfb** - Virtual framebuffer providing display :99
**x11vnc** - VNC server capturing the virtual display
**websockify** - Converts VNC protocol to WebSocket for browser
**Chrome** - Puppeteer-controlled browser in headful mode

## Data Flow

### AI Automation Mode
1. User submits task via TakeOverPanel
2. Backend creates session, launches Chrome on Xvfb
3. Puppeteer executes automation steps
4. noVNC streams display to frontend (view-only)
5. User watches AI work in real-time

### User Takeover Mode
1. User clicks "Take Control"
2. Backend pauses Puppeteer execution
3. noVNC switches to interactive mode
4. User controls browser directly (mouse, keyboard)
5. User completes action (login, CAPTCHA, etc.)
6. User clicks "Return Control"
7. Backend resumes Puppeteer execution

## API Endpoints

### POST /api/browser-session
Create new browser session
```json
{
  "task": "Navigate to site and perform action",
  "url": "https://example.com",
  "maxSteps": 10
}
```

### PUT /api/browser-session/:id/control
Transfer control
```json
{
  "action": "take_control" | "return_control" | "pause" | "resume"
}
```

### GET /api/browser-session/:id/stream
Get WebSocket URL for noVNC connection

### DELETE /api/browser-session/:id
End session and cleanup

## WebSocket Events

### Client → Server
- `session:create` - Start new session
- `session:control` - Take/return control
- `session:pause` - Pause AI execution
- `session:resume` - Resume AI execution
- `session:end` - Terminate session

### Server → Client
- `session:created` - Session ready with stream URL
- `session:step` - AI completed a step
- `session:control_changed` - Control transferred
- `session:error` - Error occurred
- `session:ended` - Session terminated

## File Structure

```
sovryn-mvp/
├── app/
│   ├── api/
│   │   └── browser-session/
│   │       ├── route.ts
│   │       └── [id]/
│   │           ├── route.ts
│   │           ├── control/route.ts
│   │           └── stream/route.ts
│   └── components/
│       ├── BrowserViewPanel.tsx
│       └── TakeOverPanel.tsx (enhanced)
├── browser-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── session-manager.ts
│   │   ├── puppeteer-controller.ts
│   │   └── websocket-server.ts
│   └── docker-compose.yml
└── lib/
    └── browser-client.ts
```

## Security Considerations

1. **Session Isolation** - Each session runs in isolated container
2. **Token Auth** - Sessions require valid user token
3. **Timeout** - Sessions auto-terminate after inactivity
4. **No Credentials Storage** - User enters creds directly in browser
5. **HTTPS Only** - All WebSocket connections over WSS

## Scalability Path

1. **Single Instance** - One Docker container, multiple sessions via display numbers
2. **Horizontal Scale** - Multiple containers behind load balancer
3. **Kubernetes** - Auto-scaling based on session demand
