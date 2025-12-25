import { getOpenAIClient, getAnthropicClient, getGroqClient, getModelById } from './providers';
import { resolveFallbackModel, healthManager } from './fallback';
import { Message } from '@prisma/client';

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'https://magnolia-nonperjured-lani.ngrok-free.dev';
const PRIMEX_BACKEND_URL = process.env.PRIMEX_BACKEND_URL || 'http://localhost:8000';

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
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  fallback?: boolean; // Indicates fallback was used
}

export class AIRouter {
  async chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    let model = getModelById(options.modelId);
    if (!model) {
      throw new Error(`Model ${options.modelId} not found`);
    }

    let provider = model.provider;
    let actualModelId = options.modelId;
    let usedFallback = false;

    // Try primary provider first
    try {
      return await this.executeChat(provider, actualModelId, options);
    } catch (error) {
      console.warn(
        `[Router] Primary provider ${provider} failed for ${options.modelId}: ${error instanceof Error ? error.message : 'unknown error'}`
      );

      // Invalidate health cache for this provider
      healthManager.invalidateCache(provider);

      // Attempt fallback if primary is PRIMEX
      if (provider === 'primex' || provider === 'ollama') {
        console.log(`[Router] Attempting fallback for ${options.modelId}`);
        const fallbackModelId = await resolveFallbackModel(actualModelId);

        if (fallbackModelId) {
          // Extract actual model ID if in format 'provider:model'
          const actualFallbackModelId = fallbackModelId.includes(':')
            ? fallbackModelId.split(':')[1]
            : fallbackModelId;
          const fallbackModel = getModelById(actualFallbackModelId);
          if (fallbackModel) {
            try {
              const result = await this.executeChat(fallbackModel.provider, actualFallbackModelId, options);
              result.fallback = true;
              return result;
            } catch (fallbackError) {
              console.error(
                `[Router] Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : 'unknown error'}`
              );
            }
          }
        }
      }

      // Re-throw original error if all attempts failed
      throw error;
    }
  }

  async *chatStream(options: ChatCompletionOptions): AsyncGenerator<string> {
    let model = getModelById(options.modelId);
    if (!model) {
      throw new Error(`Model ${options.modelId} not found`);
    }

    let provider = model.provider;
    let actualModelId = options.modelId;

    console.log(`[Router] chatStream called for model: ${options.modelId}, provider: ${provider}`);

    // Try primary provider first
    try {
      yield* this.executeStreamChat(provider, actualModelId, options);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'unknown error';
      console.warn(`[Router] Primary provider ${provider} failed for ${options.modelId}: ${errorMsg}`);

      healthManager.invalidateCache(provider);

      // Attempt fallback if primary is PRIMEX or Ollama
      if (provider === 'primex' || provider === 'ollama') {
        console.log(`[Router] Attempting fallback for ${options.modelId}`);
        const fallbackModelId = await resolveFallbackModel(actualModelId);
        console.log(`[Router] Resolved fallback: ${fallbackModelId}`);

        if (fallbackModelId) {
          // Extract actual model ID if in format 'provider:model'
          const actualFallbackModelId = fallbackModelId.includes(':')
            ? fallbackModelId.split(':')[1]
            : fallbackModelId;
          const fallbackModel = getModelById(actualFallbackModelId);
          console.log(`[Router] Fallback model lookup: ${actualFallbackModelId} -> ${fallbackModel?.provider}`);

          if (fallbackModel) {
            try {
              console.log(`[Router] Executing fallback stream with provider: ${fallbackModel.provider}, model: ${actualFallbackModelId}`);
              yield* this.executeStreamChat(fallbackModel.provider, actualFallbackModelId, options);
              return; // Success
            } catch (fallbackError) {
              const fallbackErrorMsg = fallbackError instanceof Error ? fallbackError.message : 'unknown error';
              console.error(`[Router] Fallback stream also failed: ${fallbackErrorMsg}`);
              // Throw a more descriptive error
              throw new Error(`Primary (${provider}): ${errorMsg}. Fallback (${fallbackModel.provider}): ${fallbackErrorMsg}`);
            }
          }
        }
      }

      throw error;
    }
  }

  private async executeChat(
    provider: string,
    modelId: string,
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    switch (provider) {
      case 'openai':
        return this.chatWithOpenAI({ ...options, modelId });
      case 'anthropic':
        return this.chatWithAnthropic({ ...options, modelId });
      case 'groq':
        return this.chatWithGroq({ ...options, modelId });
      case 'primex':
        return this.chatWithPrimex({ ...options, modelId });
      case 'ollama':
        return this.chatWithOllama({ ...options, modelId });
      default:
        throw new Error(`Provider ${provider} not supported`);
    }
  }

  private async *executeStreamChat(
    provider: string,
    modelId: string,
    options: ChatCompletionOptions
  ): AsyncGenerator<string> {
    console.log(`[Router] executeStreamChat - provider: ${provider}, modelId: ${modelId}`);
    const updatedOptions = { ...options, modelId };

    switch (provider) {
      case 'openai':
        yield* this.chatStreamOpenAI(updatedOptions);
        break;
      case 'anthropic':
        yield* this.chatStreamAnthropic(updatedOptions);
        break;
      case 'groq':
        yield* this.chatStreamGroq(updatedOptions);
        break;
      case 'primex':
        yield* this.chatStreamPrimex(updatedOptions);
        break;
      case 'ollama':
        yield* this.chatStreamOllama(updatedOptions);
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

  private async chatWithPrimex(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const response = await fetch(`${PRIMEX_BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.modelId,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`PRIMEX request failed with status ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data?.content || data?.response || '',
      model: options.modelId,
      usage: data?.usage
        ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
        : undefined,
    };
  }

  private async *chatStreamPrimex(options: ChatCompletionOptions): AsyncGenerator<string> {
    const completion = await this.chatWithPrimex(options);
    if (completion.content) {
      yield completion.content;
    }
  }

  private async chatWithOllama(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.modelId,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data?.response || '',
      model: options.modelId,
      usage: data?.usage
        ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
        : data?.usage?.total_tokens
          ? { totalTokens: data.usage.total_tokens }
          : undefined,
    };
  }

  private async *chatStreamOllama(options: ChatCompletionOptions): AsyncGenerator<string> {
    const completion = await this.chatWithOllama(options);
    if (completion.content) {
      yield completion.content;
    }
  }
}

export const aiRouter = new AIRouter();
