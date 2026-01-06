# Browser Streaming & Control Handoff Setup Guide

This guide explains how to set up and use the self-hosted browser streaming feature in Sovryn MVP. This feature allows users to watch AI work in real-time and take over browser control at any time.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)

---

## Overview

The Browser Streaming feature enables:

- **Real-time viewing**: Watch AI navigate and interact with websites
- **Control handoff**: Take over browser control for logins, CAPTCHAs, or sensitive actions
- **Seamless resume**: Return control to AI and continue automation
- **Session persistence**: Logged-in sessions can be reused

### How It Works

```
User → Frontend → WebSocket → Browser Service → Puppeteer → Chrome
                     ↓
              Screenshot Stream
                     ↓
            Live Browser View
```

1. User submits a task through the LiveTakeOverPanel
2. Browser Service launches Chrome in a virtual display
3. Screenshots are streamed to the frontend in real-time
4. User can take control at any time for manual actions
5. Control returns to AI to continue automation

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start the browser service
docker-compose -f docker-compose.browser.yml up -d

# Check status
docker-compose -f docker-compose.browser.yml ps

# View logs
docker-compose -f docker-compose.browser.yml logs -f browser-service
```

### Option 2: Local Development

```bash
# Install system dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y xvfb x11vnc chromium-browser

# Navigate to browser service
cd browser-service

# Install Node.js dependencies
npm install

# Start the service
./start-dev.sh
```

### Add to Your Page

```tsx
import { LiveTakeOverPanel } from '@/app/components/LiveTakeOverPanel';

export default function MyPage() {
  return (
    <LiveTakeOverPanel 
      userId="user_123"
      serverUrl="http://localhost:3001"
    />
  );
}
```

---

## Architecture

### Components

| Component | Description | Port |
|-----------|-------------|------|
| Browser Service | Node.js server managing browser sessions | 3001 |
| Xvfb | Virtual framebuffer for headless display | - |
| x11vnc | VNC server capturing the display | 5900 |
| WebSocket Proxy | Streams VNC to web clients | 6080+ |
| Puppeteer | Controls Chrome browser | - |

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │ LiveTakeOverPanel│    │    BrowserViewPanel        │ │
│  │ - Task input     │    │    - Canvas display        │ │
│  │ - Control buttons│    │    - Mouse/keyboard events │ │
│  └────────┬─────────┘    └─────────────┬──────────────┘ │
└───────────┼────────────────────────────┼────────────────┘
            │ Socket.io                   │ WebSocket
            ▼                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Browser Service                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │Session Mgr  │  │ Puppeteer   │  │  Screenshot     │  │
│  │- Create     │  │ Controller  │  │  Streamer       │  │
│  │- Handoff    │  │- Navigate   │  │  - 10 FPS       │  │
│  │- State      │  │- Execute    │  │  - Base64 PNG   │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Chrome (Puppeteer)                      ││
│  │              Running on Xvfb :99                     ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## Installation

### System Requirements

- **OS**: Linux (Ubuntu 20.04+ recommended) or Docker
- **Node.js**: 18.x or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Disk**: 1GB for dependencies

### Linux Dependencies

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
    xvfb \
    x11vnc \
    chromium-browser \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2
```

### Node.js Dependencies

```bash
cd browser-service
npm install
```

---

## Configuration

### Environment Variables

Create a `.env` file in `browser-service/`:

```env
# Server
BROWSER_SERVICE_PORT=3001
BROWSER_SERVICE_HOST=localhost
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Display
DISPLAY=:99
```

### Frontend Configuration

Add to your main `.env`:

```env
NEXT_PUBLIC_BROWSER_SERVICE_URL=http://localhost:3001
```

---

## Usage

### Basic Usage

```tsx
'use client';

import { LiveTakeOverPanel } from '@/app/components/LiveTakeOverPanel';
import { useUser } from '@clerk/nextjs';

export default function BrowserPage() {
  const { user } = useUser();
  
  if (!user) return <div>Please sign in</div>;
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Browser Automation</h1>
      <LiveTakeOverPanel 
        userId={user.id}
        serverUrl={process.env.NEXT_PUBLIC_BROWSER_SERVICE_URL}
      />
    </div>
  );
}
```

### Using the Hook Directly

```tsx
import { useBrowserSession } from '@/app/hooks/useBrowserSession';

function MyComponent() {
  const {
    isConnected,
    session,
    streamUrl,
    createSession,
    takeControl,
    returnControl,
  } = useBrowserSession({
    userId: 'user_123',
    serverUrl: 'http://localhost:3001',
  });

  const handleStart = async () => {
    await createSession(
      'Navigate to Google and search for Sovryn',
      'https://google.com',
      10
    );
  };

  return (
    <div>
      <button onClick={handleStart}>Start Task</button>
      {session?.state === 'AI_CONTROL' && (
        <button onClick={takeControl}>Take Control</button>
      )}
      {session?.state === 'USER_CONTROL' && (
        <button onClick={returnControl}>Return to AI</button>
      )}
    </div>
  );
}
```

### Control Flow

1. **Start Task**: User describes what they want the AI to do
2. **Watch AI**: AI navigates and performs actions while user watches
3. **Take Control**: User clicks "Take Control" for manual actions
4. **Interact**: User can click, type, and navigate in the browser
5. **Return Control**: User clicks "Return Control" to let AI continue
6. **Complete**: Task finishes or user ends the session

---

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions` | Create new browser session |
| GET | `/api/sessions/:id` | Get session details |
| GET | `/api/sessions?userId=X` | Get user's sessions |
| PUT | `/api/sessions/:id/control` | Change control (take/return) |
| POST | `/api/sessions/:id/navigate` | Navigate to URL |
| POST | `/api/sessions/:id/step` | Execute automation step |
| GET | `/api/sessions/:id/screenshot` | Get current screenshot |
| DELETE | `/api/sessions/:id` | End session |

### WebSocket Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `auth` | `{ userId }` | Authenticate connection |
| `session:create` | `{ task, url?, maxSteps? }` | Create session |
| `session:join` | `{ sessionId }` | Join existing session |
| `session:take_control` | `{ sessionId }` | Take control from AI |
| `session:return_control` | `{ sessionId }` | Return control to AI |
| `session:pause` | `{ sessionId }` | Pause session |
| `session:resume` | `{ sessionId, asUser? }` | Resume session |
| `session:end` | `{ sessionId }` | End session |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `session:ready` | `{ sessionId, streamUrl, session }` | Session created |
| `session:state_changed` | `{ sessionId, state }` | State changed |
| `session:step` | `{ sessionId, step }` | Step completed |
| `session:control_changed` | `{ sessionId, controller }` | Control changed |
| `session:frame` | `{ sessionId, screenshot }` | New frame |
| `session:error` | `{ sessionId, error }` | Error occurred |
| `session:completed` | `{ sessionId }` | Task completed |

---

## Troubleshooting

### Common Issues

#### "Cannot connect to browser service"

1. Check if the service is running:
   ```bash
   curl http://localhost:3001/health
   ```

2. Check Docker logs:
   ```bash
   docker-compose -f docker-compose.browser.yml logs browser-service
   ```

3. Verify CORS settings match your frontend URL

#### "Browser not launching"

1. Check Xvfb is running:
   ```bash
   ps aux | grep Xvfb
   ```

2. Check Chrome dependencies:
   ```bash
   chromium --version
   ```

3. Increase shared memory (Docker):
   ```yaml
   shm_size: '2gb'
   ```

#### "Screenshots not streaming"

1. Check WebSocket connection in browser console
2. Verify the streamUrl is correct
3. Check for firewall blocking ports 6080-6090

### Debug Mode

Enable verbose logging:

```bash
DEBUG=* npm run dev
```

View VNC directly (for debugging):

```bash
# Install a VNC viewer
sudo apt-get install tigervnc-viewer

# Connect to VNC
vncviewer localhost:5900
```

---

## Production Deployment

### Docker Production Setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  browser-service:
    image: your-registry/sovryn-browser-service:latest
    restart: always
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - FRONTEND_URL=https://your-domain.com
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

### Nginx Reverse Proxy

```nginx
upstream browser_service {
    server localhost:3001;
}

server {
    listen 443 ssl;
    server_name browser.your-domain.com;

    location / {
        proxy_pass http://browser_service;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Security Considerations

1. **Authentication**: Always verify userId against your auth system
2. **Rate Limiting**: Limit sessions per user
3. **Timeout**: Auto-terminate idle sessions
4. **Network**: Run browser service in isolated network
5. **Secrets**: Never expose API keys through browser automation

### Scaling

For high traffic:

1. Use Redis for session state
2. Run multiple browser service instances
3. Use load balancer with sticky sessions
4. Consider Kubernetes for auto-scaling

---

## Support

For issues and feature requests, please open an issue in the repository.
