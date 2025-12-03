import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

/**
 * INTERNAL ONLY - Grant SOVEREIGN tier access to a user
 * Usage: POST /api/admin/grant-access
 * Body: { clerkId: string, email?: string, name?: string, plan?: 'FREE' | 'PRO' | 'ENTERPRISE' | 'SOVEREIGN' }
 */

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-secret-key-change-in-production';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (authHeader !== `Bearer ${ADMIN_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { clerkId, email, name, plan = 'SOVEREIGN' } = body;

        if (!clerkId) {
            return NextResponse.json({ error: 'clerkId is required' }, { status: 400 });
        }

        console.log(`[ADMIN] Granting ${plan} access to user: ${clerkId}`);

        const user = await prisma.user.upsert({
            where: { clerkId },
            update: { email, name },
            create: {
                clerkId,
                email: email || `${clerkId}@example.com`,
                name: name || 'User',
            },
        });

        console.log(`[ADMIN] User created/updated: ${user.id}`);

        const subscription = await prisma.subscription.upsert({
            where: { userId: user.id },
            update: {
                plan,
                status: 'ACTIVE',
            },
            create: {
                userId: user.id,
                stripeCustomerId: `test_${clerkId}`,
                plan,
                status: 'ACTIVE',
            },
        });

        console.log(`[ADMIN] Subscription updated: ${plan} - ${subscription.status}`);

        return NextResponse.json({
            success: true,
            message: `${plan} access granted`,
            user: {
                id: user.id,
                clerkId: user.clerkId,
                email: user.email,
                name: user.name,
            },
            subscription: {
                plan: subscription.plan,
                status: subscription.status,
            },
        });
    } catch (error) {
        console.error('[ADMIN] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
