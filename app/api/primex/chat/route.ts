import { NextRequest, NextResponse } from 'next/server';

const PRIMEX_BACKEND_URL = process.env.PRIMEX_BACKEND_URL || 'http://localhost:8000';

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

    // Call PRIMEX backend
    const response = await fetch(`${PRIMEX_BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        model,
        conversation_history,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'PRIMEX backend error');
    }

    const data = await response.json();

    return NextResponse.json({
      response: data.response,
      model: data.model,
    });
  } catch (error: any) {
    console.error('PRIMEX API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Health check - call PRIMEX backend
    const response = await fetch(`${PRIMEX_BACKEND_URL}/health`);
    const data = await response.json();
    
    return NextResponse.json({
      status: 'ok',
      primex: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
