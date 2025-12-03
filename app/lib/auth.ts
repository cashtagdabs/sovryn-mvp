import { NextRequest } from 'next/server';
import { auth as clerkAuth } from '@clerk/nextjs/server';

/**
 * getUserId - returns the authenticated Clerk userId.
 * In development allows bypass via `x-dev-clerk-id` header for local testing.
 */
export async function getUserId(req?: NextRequest) {
    try {
        const { userId } = await clerkAuth();
        if (userId) return userId;
    } catch (e) {
        // swallow and try dev header below
    }

    if (process.env.NODE_ENV !== 'production') {
        // NextRequest may not be available in some code paths; accept undefined
        // Look for the header on the request object if provided
        const headerId = (req && (req.headers.get ? req.headers.get('x-dev-clerk-id') : (req as any).headers['x-dev-clerk-id'])) || process.env.DEV_CLERK_ID;
        if (headerId) return headerId as string;
    }

    return null;
}
