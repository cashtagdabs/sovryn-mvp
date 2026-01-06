# Sovryn Browser Streaming Service
# Self-hosted browser automation with real-time streaming and control handoff

FROM node:20-slim

# Install dependencies for Puppeteer, Xvfb, and VNC
RUN apt-get update && apt-get install -y \
    # Chromium dependencies
    chromium \
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
    libxrandr2 \
    xdg-utils \
    # Virtual display
    xvfb \
    # VNC server
    x11vnc \
    # Window manager (lightweight)
    fluxbox \
    # Utilities
    dbus-x11 \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create startup script
RUN echo '#!/bin/bash\n\
# Start Xvfb\n\
Xvfb :99 -screen 0 1920x1080x24 -ac &\n\
sleep 1\n\
\n\
# Start fluxbox window manager\n\
DISPLAY=:99 fluxbox &\n\
sleep 1\n\
\n\
# Start x11vnc\n\
x11vnc -display :99 -rfbport 5900 -nopw -forever -shared -noxdamage &\n\
sleep 1\n\
\n\
# Set display for Node.js\n\
export DISPLAY=:99\n\
\n\
# Start the Node.js server\n\
exec node dist/index.js\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose ports
# 3001 - HTTP/WebSocket server
# 5900 - VNC server (internal)
# 6080+ - WebSocket VNC proxies (dynamic)
EXPOSE 3001 5900 6080-6090

# Environment variables
ENV NODE_ENV=production
ENV BROWSER_SERVICE_PORT=3001
ENV BROWSER_SERVICE_HOST=0.0.0.0
ENV DISPLAY=:99

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the service
CMD ["/app/start.sh"]
