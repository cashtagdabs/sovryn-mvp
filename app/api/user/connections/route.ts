import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/db';

// GET /api/user/connections - List all OAuth connections for current user
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if OAuthConnection table exists (schema might not be migrated)
        try {
            const connections = await prisma.oAuthConnection.findMany({
                where: { userId },
                select: {
                    id: true,
                    provider: true,
                    providerUsername: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json({ connections });
        } catch (dbError: any) {
            // Table might not exist yet - return empty
            if (dbError?.code === 'P2021') {
                return NextResponse.json({ connections: [] });
            }
            throw dbError;
        }
    } catch (error) {
        console.error('Error fetching connections:', error);
        return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
    }
}
