import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(`${APP_URL}/settings?error=github_denied`);
    }

    if (!code || !state) {
        return NextResponse.redirect(`${APP_URL}/settings?error=missing_params`);
    }

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        return NextResponse.redirect(`${APP_URL}/settings?error=github_not_configured`);
    }

    try {
        // Decode state to get userId
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        const { userId } = stateData;

        if (!userId) {
            return NextResponse.redirect(`${APP_URL}/settings?error=invalid_state`);
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error('[GitHub OAuth] Token error:', tokenData.error);
            return NextResponse.redirect(`${APP_URL}/settings?error=token_error`);
        }

        const accessToken = tokenData.access_token;

        // Get GitHub user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        const githubUser = await userResponse.json();

        // Store the connection in database
        // First, find the user by clerkId
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return NextResponse.redirect(`${APP_URL}/settings?error=user_not_found`);
        }

        // Upsert the OAuth connection
        await prisma.oAuthConnection.upsert({
            where: {
                userId_provider: {
                    userId: user.id,
                    provider: 'github',
                },
            },
            update: {
                accessToken,
                providerAccountId: githubUser.id.toString(),
                providerUsername: githubUser.login,
                updatedAt: new Date(),
            },
            create: {
                id: `oauth_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                userId: user.id,
                provider: 'github',
                accessToken,
                providerAccountId: githubUser.id.toString(),
                providerUsername: githubUser.login,
            },
        });

        return NextResponse.redirect(`${APP_URL}/settings?success=github_connected`);
    } catch (error) {
        console.error('[GitHub OAuth] Callback error:', error);
        return NextResponse.redirect(`${APP_URL}/settings?error=callback_error`);
    }
}
