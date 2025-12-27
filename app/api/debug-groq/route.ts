import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function GET(req: NextRequest) {
    const results: any = {
        timestamp: new Date().toISOString(),
        env: {
            GROQ_API_KEY_SET: !!process.env.GROQ_API_KEY,
            GROQ_API_KEY_LENGTH: process.env.GROQ_API_KEY?.length || 0,
            GROQ_API_KEY_PREFIX: process.env.GROQ_API_KEY?.substring(0, 10) || 'NOT SET',
        },
    };

    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            results.error = 'GROQ_API_KEY is not set';
            return NextResponse.json(results, { status: 500 });
        }

        results.clientCreation = 'attempting...';
        const client = new Groq({ apiKey });
        results.clientCreation = 'success';

        results.apiCall = 'attempting...';
        const response = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: 'Say "Groq works!" and nothing else.' }],
            max_tokens: 20,
        });

        results.apiCall = 'success';
        results.response = response.choices[0]?.message?.content || 'No content';
        results.model = response.model;

        return NextResponse.json(results, { status: 200 });
    } catch (error: any) {
        results.error = {
            message: error?.message || 'Unknown error',
            name: error?.name,
            status: error?.status,
            code: error?.code,
            type: error?.type,
            errorDetails: error?.error,
            stack: error?.stack?.split('\n').slice(0, 5),
        };
        return NextResponse.json(results, { status: 500 });
    }
}
