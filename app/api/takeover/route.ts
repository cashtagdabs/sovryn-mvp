import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/db';
import { aiRouter } from '@/app/lib/ai/router';

/**
 * Take Over API Route
 * Enables autonomous AI task execution mode where the AI takes control
 * and completes a multi-step task without requiring user input at each step.
 */

interface TakeOverRequest {
    task: string;
    context?: string;
    maxSteps?: number;
    model?: string;
    conversationId?: string;
    autoApprove?: boolean;
}

interface TakeOverStep {
    step: number;
    action: string;
    result: string;
    status: 'completed' | 'pending' | 'failed';
    timestamp: string;
}

interface TakeOverSession {
    id: string;
    status: 'running' | 'completed' | 'paused' | 'failed';
    task: string;
    steps: TakeOverStep[];
    currentStep: number;
    totalSteps: number;
    startedAt: string;
    completedAt?: string;
}

// In-memory store for active sessions (in production, use Redis or database)
const activeSessions = new Map<string, TakeOverSession>();

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify user exists in database
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const body: TakeOverRequest = await req.json();
        const { task, context, maxSteps = 10, model = 'primex-ultra', conversationId, autoApprove = false } = body;

        if (!task) {
            return NextResponse.json(
                { error: 'Task description is required' },
                { status: 400 }
            );
        }

        // Create a new take-over session
        const sessionId = `takeover_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const session: TakeOverSession = {
            id: sessionId,
            status: 'running',
            task,
            steps: [],
            currentStep: 0,
            totalSteps: maxSteps,
            startedAt: new Date().toISOString()
        };

        activeSessions.set(sessionId, session);

        // Create or get conversation for tracking
        let conversation;
        if (conversationId) {
            conversation = await prisma.conversation.findUnique({
                where: { id: conversationId }
            });
        }

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    userId: user.id,
                    title: `Take Over: ${task.substring(0, 50)}...`,
                }
            });
        }

        // System prompt for autonomous execution
        const systemPrompt = `You are an autonomous AI agent in "Take Over" mode. Your task is to complete the following objective step by step.

OBJECTIVE: ${task}

${context ? `CONTEXT: ${context}` : ''}

RULES:
1. Break down the task into clear, executable steps
2. Execute each step and report progress
3. If you encounter an error, attempt to resolve it or report the issue
4. Provide a clear status after each step: [COMPLETED], [PENDING], or [FAILED]
5. Continue until the task is fully complete or you've reached the step limit
6. Be concise but thorough in your explanations

FORMAT YOUR RESPONSE AS:
STEP [N]: [Action description]
STATUS: [COMPLETED/PENDING/FAILED]
RESULT: [What was accomplished or what needs attention]
NEXT: [What the next step will be, or "TASK COMPLETE" if done]`;

        // Execute the first step
        const messages = [
            { role: 'system' as const, content: systemPrompt },
            { role: 'user' as const, content: `Begin the take-over process. Execute Step 1 of the task: "${task}"` }
        ];

        try {
            const response = await aiRouter.chat({
                modelId: model,
                messages,
                temperature: 0.3, // Lower temperature for more consistent autonomous execution
                maxTokens: 2048,
                userId: user.id,
                conversationId: conversation.id
            });

            // Parse the response to extract step info
            const stepInfo = parseStepResponse(response.content, 1);
            session.steps.push(stepInfo);
            session.currentStep = 1;

            // Store the user message
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    userId: user.id,
                    role: 'USER',
                    content: `[TAKE OVER MODE INITIATED]\nTask: ${task}`,
                    model: model as any
                }
            });

            // Store the AI response
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    userId: user.id,
                    role: 'ASSISTANT',
                    content: response.content,
                    model: model as any
                }
            });

            // Check if task is complete
            if (response.content.includes('TASK COMPLETE') || stepInfo.status === 'completed' && response.content.toLowerCase().includes('complete')) {
                session.status = 'completed';
                session.completedAt = new Date().toISOString();
            }

            activeSessions.set(sessionId, session);

            return NextResponse.json({
                sessionId,
                conversationId: conversation.id,
                status: session.status,
                currentStep: session.currentStep,
                totalSteps: session.totalSteps,
                step: stepInfo,
                response: response.content,
                model: response.model
            });

        } catch (error) {
            session.status = 'failed';
            session.steps.push({
                step: 1,
                action: 'Initialize take-over',
                result: error instanceof Error ? error.message : 'Unknown error',
                status: 'failed',
                timestamp: new Date().toISOString()
            });

            activeSessions.set(sessionId, session);

            return NextResponse.json({
                sessionId,
                conversationId: conversation.id,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Take over initialization failed'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('[TakeOver] Error:', error);
        return NextResponse.json(
            { error: 'Failed to initiate take-over mode' },
            { status: 500 }
        );
    }
}

// Continue an existing take-over session
export async function PUT(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const { sessionId, action, conversationId, model = 'primex-ultra' } = await req.json();

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        const session = activeSessions.get(sessionId);

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found or expired' },
                { status: 404 }
            );
        }

        if (action === 'pause') {
            session.status = 'paused';
            activeSessions.set(sessionId, session);
            return NextResponse.json({ sessionId, status: 'paused', session });
        }

        if (action === 'resume' || action === 'continue') {
            if (session.currentStep >= session.totalSteps) {
                session.status = 'completed';
                session.completedAt = new Date().toISOString();
                return NextResponse.json({
                    sessionId,
                    status: 'completed',
                    message: 'Maximum steps reached',
                    session
                });
            }

            session.status = 'running';
            const nextStep = session.currentStep + 1;

            // Build context from previous steps
            const previousStepsContext = session.steps
                .map(s => `Step ${s.step}: ${s.action} - ${s.status}`)
                .join('\n');

            const continuePrompt = `Continue with Step ${nextStep}. 

Previous steps completed:
${previousStepsContext}

Execute the next step to complete the task: "${session.task}"`;

            const messages = [
                { role: 'system' as const, content: `You are in autonomous "Take Over" mode. Continue executing the task step by step.` },
                { role: 'user' as const, content: continuePrompt }
            ];

            const response = await aiRouter.chat({
                modelId: model,
                messages,
                temperature: 0.3,
                maxTokens: 2048,
                userId: user.id,
                conversationId
            });

            const stepInfo = parseStepResponse(response.content, nextStep);
            session.steps.push(stepInfo);
            session.currentStep = nextStep;

            // Store in database
            if (conversationId) {
                await prisma.message.create({
                    data: {
                        conversationId,
                        userId: user.id,
                        role: 'ASSISTANT',
                        content: response.content,
                        model: model as any
                    }
                });
            }

            // Check completion
            if (response.content.includes('TASK COMPLETE') ||
                (stepInfo.status === 'completed' && response.content.toLowerCase().includes('done'))) {
                session.status = 'completed';
                session.completedAt = new Date().toISOString();
            }

            activeSessions.set(sessionId, session);

            return NextResponse.json({
                sessionId,
                conversationId,
                status: session.status,
                currentStep: session.currentStep,
                totalSteps: session.totalSteps,
                step: stepInfo,
                response: response.content,
                model: response.model
            });
        }

        return NextResponse.json(
            { error: 'Invalid action. Use: pause, resume, continue' },
            { status: 400 }
        );

    } catch (error) {
        console.error('[TakeOver] Continue error:', error);
        return NextResponse.json(
            { error: 'Failed to continue take-over session' },
            { status: 500 }
        );
    }
}

// Get session status
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const sessionId = req.nextUrl.searchParams.get('sessionId');

        if (sessionId) {
            const session = activeSessions.get(sessionId);
            if (!session) {
                return NextResponse.json(
                    { error: 'Session not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json({ session });
        }

        // Return all active sessions for this user (simplified - in production, filter by user)
        const sessions = Array.from(activeSessions.values());
        return NextResponse.json({ sessions });

    } catch (error) {
        console.error('[TakeOver] Get error:', error);
        return NextResponse.json(
            { error: 'Failed to get session status' },
            { status: 500 }
        );
    }
}

// Helper function to parse step response
function parseStepResponse(content: string, stepNumber: number): TakeOverStep {
    let status: 'completed' | 'pending' | 'failed' = 'pending';

    if (content.includes('[COMPLETED]') || content.includes('STATUS: COMPLETED')) {
        status = 'completed';
    } else if (content.includes('[FAILED]') || content.includes('STATUS: FAILED')) {
        status = 'failed';
    }

    // Extract action from STEP line
    const stepMatch = content.match(/STEP\s*\[?\d+\]?\s*:?\s*(.+?)(?:\n|STATUS)/i);
    const action = stepMatch ? stepMatch[1].trim() : `Step ${stepNumber} execution`;

    // Extract result
    const resultMatch = content.match(/RESULT:\s*(.+?)(?:\n|NEXT|$)/i);
    const result = resultMatch ? resultMatch[1].trim() : content.substring(0, 200);

    return {
        step: stepNumber,
        action,
        result,
        status,
        timestamp: new Date().toISOString()
    };
}
