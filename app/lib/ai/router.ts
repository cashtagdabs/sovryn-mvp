import { getOpenAIClient, getAnthropicClient, getGroqClient, getModelById } from './providers';
import { Message } from '@prisma/client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  modelId: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  userId?: string;
  conversationId?: string;
}

export interface ChatCompletionResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIRouter {
  async chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const model = getModelById(options.modelId);
    if (!model) {
      throw new Error(`Model ${options.modelId} not found`);
    }

    const provider = model.provider;

    switch (provider) {
      case 'openai':
        return this.chatWithOpenAI(options);
      case 'anthropic':
        return this.chatWithAnthropic(options);
      case 'groq':
        return this.chatWithGroq(options);
      default:
        throw new Error(`Provider ${provider} not supported`);
    }
  }

  async *chatStream(options: ChatCompletionOptions): AsyncGenerator<string> {
    const model = getModelById(options.modelId);
    if (!model) {
      throw new Error(`Model ${options.modelId} not found`);
    }

    const provider = model.provider;

    switch (provider) {
      case 'openai':
        yield* this.chatStreamOpenAI(options);
        break;
      case 'anthropic':
        yield* this.chatStreamAnthropic(options);
        break;
      case 'groq':
        yield* this.chatStreamGroq(options);
        break;
      default:
        throw new Error(`Provider ${provider} not supported`);
    }
  }

  private async chatWithOpenAI(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await client.chat.completions.create({
      model: options.modelId,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      model: response.model,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }

  private async *chatStreamOpenAI(options: ChatCompletionOptions): AsyncGenerator<string> {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI client not initialized');
    }

    const stream = await client.chat.completions.create({
      model: options.modelId,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  private async chatWithAnthropic(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const client = getAnthropicClient();
    if (!client) {
      throw new Error('Anthropic client not initialized');
    }

    // Convert messages to Anthropic format
    const systemMessage = options.messages.find((m) => m.role === 'system');
    const messages = options.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const response = await client.messages.create({
      model: options.modelId,
      messages,
      system: systemMessage?.content,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 4096,
    });

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  private async *chatStreamAnthropic(options: ChatCompletionOptions): AsyncGenerator<string> {
    const client = getAnthropicClient();
    if (!client) {
      throw new Error('Anthropic client not initialized');
    }

    const systemMessage = options.messages.find((m) => m.role === 'system');
    const messages = options.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const stream = await client.messages.create({
      model: options.modelId,
      messages,
      system: systemMessage?.content,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }

  private async chatWithGroq(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const client = getGroqClient();
    if (!client) {
      throw new Error('Groq client not initialized');
    }

    const response = await client.chat.completions.create({
      model: options.modelId,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      model: response.model,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }

  private async *chatStreamGroq(options: ChatCompletionOptions): AsyncGenerator<string> {
    const client = getGroqClient();
    if (!client) {
      throw new Error('Groq client not initialized');
    }

    const stream = await client.chat.completions.create({
      model: options.modelId,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}

export const aiRouter = new AIRouter();
