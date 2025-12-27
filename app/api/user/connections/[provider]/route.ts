import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/db';

// DELETE /api/user/connections/[provider] - Disconnect an OAuth provider
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { provider } = await params;

        if (!provider) {
            return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
        }

        // Delete the OAuth connection
        await prisma.oAuthConnection.deleteMany({
            where: {
                userId,
                provider,
            },
        });

        return NextResponse.json({ success: true, message: `${provider} disconnected` });
    } catch (error) {
        console.error('Error disconnecting provider:', error);
        return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }
}

// GET /api/user/connections/[provider] - Get specific connection details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { provider } = await params;

        const connection = await prisma.oAuthConnection.findFirst({
            where: {
                userId,
                provider,
            },
            select: {
                id: true,
                provider: true,
                providerUsername: true,
                createdAt: true,
            },
        });

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
        }

        return NextResponse.json({ connection });
    } catch (error) {
        console.error('Error fetching connection:', error);
        return NextResponse.json({ error: 'Failed to fetch connection' }, { status: 500 });
    }
}
