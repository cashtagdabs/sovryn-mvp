import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const PRIMEX_API_URL = process.env.PRIMEX_API_URL || 'http://localhost:8000';

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

    // Fetch clones from PRIMEX backend
    const response = await fetch(`${PRIMEX_API_URL}/clones`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch clones' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
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
