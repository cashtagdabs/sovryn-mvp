import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const PRIMEX_API_URL = process.env.PRIMEX_API_URL || 'http://localhost:8000';

interface PrimexQuery {
  clone: string;
  message: string;
  context?: string;
  temperature?: number;
  stream?: boolean;
}

interface PrimexResponse {
  clone: string;
  role: string;
  response: string;
  model: string;
  temperature: number;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { clone, message, context, temperature } = body;

    if (!clone || !message) {
      return NextResponse.json(
        { error: 'Clone and message are required' },
        { status: 400 }
      );
    }

    // Check if user has sovereign access
    const isSovereign = await checkSovereignAccess(userId);
    
    if (!isSovereign) {
      return NextResponse.json(
        { error: 'Sovereign access required for PRIMEX clones' },
        { status: 403 }
      );
    }

    // Forward request to PRIMEX backend
    const primexQuery: PrimexQuery = {
      clone,
      message,
      context,
      temperature
    };

    const response = await fetch(`${PRIMEX_API_URL}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(primexQuery),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'PRIMEX invocation failed' },
        { status: response.status }
      );
    }

    const data: PrimexResponse = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('PRIMEX API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkSovereignAccess(userId: string): Promise<boolean> {
  // Check if user has sovereign role in database
  // For now, check against environment variable
  const sovereignUserId = process.env.SOVEREIGN_USER_ID;
  return userId === sovereignUserId;
}
