const { Server } = require('socket.io');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store active rooms and users
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a collaboration room
  socket.on('join-room', (roomId, userData) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    
    rooms.get(roomId).set(socket.id, {
      ...userData,
      cursor: null,
      lastSeen: Date.now()
    });
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      userData,
      roomUsers: Array.from(rooms.get(roomId).values())
    });
    
    // Send current room state to the joining user
    socket.emit('room-state', {
      roomId,
      users: Array.from(rooms.get(roomId).values())
    });
    
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Handle cursor movement
  socket.on('cursor-move', (data) => {
    const { roomId, position, userData } = data;
    
    if (rooms.has(roomId)) {
      const user = rooms.get(roomId).get(socket.id);
      if (user) {
        user.cursor = position;
        user.lastSeen = Date.now();
      }
    }
    
    socket.to(roomId).emit('cursor-update', {
      userId: socket.id,
      position,
      userData
    });
  });

  // Handle text edits
  socket.on('text-edit', (data) => {
    const { roomId, edit, documentState } = data;
    socket.to(roomId).emit('text-update', {
      userId: socket.id,
      edit,
      documentState
    });
  });

  // Handle selection changes
  socket.on('selection-change', (data) => {
    const { roomId, selection } = data;
    socket.to(roomId).emit('selection-update', {
      userId: socket.id,
      selection
    });
  });

  // Handle AI chat messages
  socket.on('ai-chat-message', async (data) => {
    const { roomId, message, context, messageId, shareWithRoom } = data;
    
    try {
      // Process AI response via the main app's API
      const response = await processAIChat(message, context);
      
      socket.emit('ai-chat-response', {
        messageId,
        response
      });
      
      // Broadcast to others in the room if it's a shared conversation
      if (shareWithRoom) {
        socket.to(roomId).emit('ai-chat-response', {
          messageId,
          response,
          fromUser: socket.id
        });
      }
    } catch (error) {
      socket.emit('ai-chat-error', {
        messageId,
        error: error.message || 'AI processing failed'
      });
    }
  });

  // Handle code analysis requests
  socket.on('code-analysis', async (data) => {
    const { roomId, code, filePath, analysisType, analysisId } = data;
    
    try {
      const analysis = await analyzeCode(code, filePath, analysisType);
      socket.emit('code-analysis-result', {
        analysisId,
        analysis
      });
    } catch (error) {
      socket.emit('code-analysis-error', {
        analysisId,
        error: error.message || 'Analysis failed'
      });
    }
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('user-typing', {
      userId: socket.id,
      isTyping: true
    });
  });

  socket.on('typing-stop', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('user-typing', {
      userId: socket.id,
      isTyping: false
    });
  });

  socket.on('disconnect', () => {
    // Remove user from all rooms
    rooms.forEach((roomUsers, roomId) => {
      if (roomUsers.has(socket.id)) {
        roomUsers.delete(socket.id);
        socket.to(roomId).emit('user-left', {
          userId: socket.id,
          roomUsers: Array.from(roomUsers.values())
        });
        
        if (roomUsers.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
    
    console.log('User disconnected:', socket.id);
  });
});

// AI chat processing - integrates with your existing AI router
async function processAIChat(message, context) {
  try {
    // Call the main app's chat API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        model: context?.model || 'primex-ultra',
        context: context
      })
    });

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    const data = await response.json();
    
    return {
      text: data.content || data.message || 'No response generated',
      model: data.model || 'primex-ultra',
      suggestions: data.suggestions || [],
      references: context?.files || []
    };
  } catch (error) {
    console.error('AI Chat Error:', error);
    return {
      text: `Error processing message: ${error.message}`,
      error: true
    };
  }
}

// Code analysis function
async function analyzeCode(code, filePath, analysisType) {
  const lines = code.split('\n');
  const issues = [];
  const suggestions = [];

  // Basic static analysis
  lines.forEach((line, index) => {
    // Check for console.log statements
    if (line.includes('console.log')) {
      issues.push({
        type: 'warning',
        message: 'Remove console.log before production',
        line: index + 1,
        severity: 'low'
      });
    }

    // Check for TODO comments
    if (line.includes('TODO') || line.includes('FIXME')) {
      issues.push({
        type: 'info',
        message: `Found ${line.includes('TODO') ? 'TODO' : 'FIXME'} comment`,
        line: index + 1,
        severity: 'low'
      });
    }

    // Check for empty catch blocks
    if (line.includes('catch') && lines[index + 1]?.trim() === '}') {
      issues.push({
        type: 'warning',
        message: 'Empty catch block - consider handling the error',
        line: index + 1,
        severity: 'medium'
      });
    }

    // Check for any type usage
    if (line.includes(': any') || line.includes('<any>')) {
      issues.push({
        type: 'warning',
        message: 'Avoid using "any" type - use proper typing',
        line: index + 1,
        severity: 'medium'
      });
    }
  });

  // Generate suggestions based on analysis type
  if (analysisType === 'full' || analysisType === 'security') {
    // Check for potential security issues
    if (code.includes('eval(')) {
      issues.push({
        type: 'error',
        message: 'Avoid using eval() - security risk',
        line: lines.findIndex(l => l.includes('eval(')) + 1,
        severity: 'high'
      });
    }

    if (code.includes('innerHTML')) {
      issues.push({
        type: 'warning',
        message: 'innerHTML can be a XSS vulnerability - use textContent or sanitize input',
        line: lines.findIndex(l => l.includes('innerHTML')) + 1,
        severity: 'high'
      });
    }
  }

  // Count functions (basic regex)
  const functionCount = (code.match(/function\s+\w+|=>\s*{|async\s+\(/g) || []).length;

  // Calculate complexity (simplified)
  const complexity = 
    (code.match(/if|else|for|while|switch|catch|&&|\|\||\?/g) || []).length + 1;

  return {
    issues,
    suggestions: [
      {
        type: 'optimization',
        message: 'Consider extracting complex logic into separate functions',
        applicable: complexity > 10
      },
      {
        type: 'refactor',
        message: 'Large file detected - consider splitting into modules',
        applicable: lines.length > 300
      }
    ].filter(s => s.applicable),
    metrics: {
      complexity,
      lines: lines.length,
      functions: functionCount,
      issueCount: issues.length
    },
    filePath,
    analysisType,
    timestamp: new Date().toISOString()
  };
}

const PORT = process.env.COLLABORATION_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Collaboration server running on port ${PORT}`);
  console.log(`   WebSocket endpoint: ws://localhost:${PORT}`);
});

module.exports = { app, server, io };
