import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const PRIMEX_API_URL = process.env.PRIMEX_API_URL || 'http://localhost:8000';

// Default clones when PRIMEX backend is unavailable
const DEFAULT_CLONES = [
  {
    id: 'primex-ultra',
    name: 'PRIMEX Ultra',
    description: 'Advanced AI assistant with sovereign capabilities',
    model: 'llama3.2:1b',
    status: 'available',
    features: ['chat', 'analysis', 'reasoning']
  },
  {
    id: 'primex-lite',
    name: 'PRIMEX Lite',
    description: 'Fast, lightweight assistant for quick tasks',
    model: 'llama3.2:1b',
    status: 'available',
    features: ['chat', 'summarization']
  }
];

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Try to fetch clones from PRIMEX backend
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${PRIMEX_API_URL}/clones`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (fetchError) {
      console.warn('[PRIMEX] Backend unavailable, using default clones');
    }

    // Return default clones when backend is unavailable
    return NextResponse.json({
      clones: DEFAULT_CLONES,
      source: 'fallback',
      message: 'PRIMEX backend offline - using default configuration'
    });
  } catch (error) {
    console.error('PRIMEX clones API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkSovereignAccess(userId: string): Promise<boolean> {
  const sovereignUserId = process.env.SOVEREIGN_USER_ID;
  return userId === sovereignUserId;
}
