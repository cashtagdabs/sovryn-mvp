import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function GET() {
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    let groqTest = 'not tested';

    if (groqKey) {
        try {
            const client = new Groq({ apiKey: groqKey });
            const response = await client.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: 'Say "OK"' }],
                max_tokens: 10,
            });
            groqTest = `SUCCESS: ${response.choices[0]?.message?.content}`;
        } catch (err: any) {
            groqTest = `ERROR: ${err.message || err.status || JSON.stringify(err)}`;
        }
    }

    return NextResponse.json({
        env: {
            GROQ_API_KEY: groqKey ? `${groqKey.substring(0, 8)}...${groqKey.substring(groqKey.length - 4)}` : 'NOT SET',
            OPENAI_API_KEY: openaiKey ? `${openaiKey.substring(0, 8)}...` : 'NOT SET',
            ANTHROPIC_API_KEY: anthropicKey ? `${anthropicKey.substring(0, 8)}...` : 'NOT SET',
        },
        groqTest,
        timestamp: new Date().toISOString(),
    });
}
