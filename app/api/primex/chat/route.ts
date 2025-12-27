import { NextRequest, NextResponse } from 'next/server';

const PRIMEX_BACKEND_URL = process.env.PRIMEX_BACKEND_URL || 'http://localhost:8000';
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

// Fallback to Ollama directly when PRIMEX backend is unavailable
async function chatWithOllama(message: string, model: string, history: any[]) {
  const messages = [
    ...history.map((msg: any) => ({
      role: msg.role || 'user',
      content: msg.content || ''
    })),
    { role: 'user', content: message }
  ];

  const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'llama3.2:1b',
      messages,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return {
    response: data.message?.content || 'No response from model',
    model: model || 'llama3.2:1b',
    source: 'ollama-direct'
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, model = 'llama3.2:1b', conversation_history = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Try PRIMEX backend first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${PRIMEX_BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model, conversation_history }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          response: data.response,
          model: data.model,
          source: 'primex-backend'
        });
      }
    } catch (backendError) {
      console.warn('[PRIMEX] Backend unavailable, falling back to Ollama');
    }

    // Fallback to Ollama directly
    const result = await chatWithOllama(message, model, conversation_history);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('PRIMEX API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  let primexStatus = 'offline';
  let ollamaStatus = 'offline';
  let availableModels: string[] = [];

  // Check PRIMEX backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${PRIMEX_BACKEND_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      primexStatus = 'online';
      availableModels = data.available_models || [];
    }
  } catch (e) {
    // PRIMEX backend not available
  }

  // Check Ollama directly
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      ollamaStatus = 'online';
      if (!availableModels.length && data.models) {
        availableModels = data.models.map((m: any) => m.name);
      }
    }
  } catch (e) {
    // Ollama not available
  }

  return NextResponse.json({
    status: primexStatus === 'online' || ollamaStatus === 'online' ? 'ok' : 'degraded',
    primex: primexStatus,
    ollama: ollamaStatus,
    availableModels,
    message: primexStatus === 'offline' && ollamaStatus === 'online'
      ? 'Using Ollama directly (PRIMEX backend offline)'
      : undefined
  });
}
