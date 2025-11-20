import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';

export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxTokens: number;
  inputCost: number; // per 1M tokens
  outputCost: number; // per 1M tokens
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      {
        id: 'gpt-4-turbo-preview',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        contextWindow: 128000,
        maxTokens: 4096,
        inputCost: 10,
        outputCost: 30,
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        contextWindow: 8192,
        maxTokens: 4096,
        inputCost: 30,
        outputCost: 60,
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        contextWindow: 16384,
        maxTokens: 4096,
        inputCost: 0.5,
        outputCost: 1.5,
      },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        contextWindow: 200000,
        maxTokens: 4096,
        inputCost: 15,
        outputCost: 75,
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        provider: 'anthropic',
        contextWindow: 200000,
        maxTokens: 4096,
        inputCost: 3,
        outputCost: 15,
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        contextWindow: 200000,
        maxTokens: 4096,
        inputCost: 0.25,
        outputCost: 1.25,
      },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    models: [
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        provider: 'groq',
        contextWindow: 32768,
        maxTokens: 4096,
        inputCost: 0.27,
        outputCost: 0.27,
      },
      {
        id: 'llama2-70b-4096',
        name: 'LLaMA2 70B',
        provider: 'groq',
        contextWindow: 4096,
        maxTokens: 4096,
        inputCost: 0.7,
        outputCost: 0.8,
      },
    ],
  },
];

export const getModelById = (modelId: string): AIModel | undefined => {
  for (const provider of AI_PROVIDERS) {
    const model = provider.models.find((m) => m.id === modelId);
    if (model) return model;
  }
  return undefined;
};

export const getProviderById = (providerId: string): AIProvider | undefined => {
  return AI_PROVIDERS.find((p) => p.id === providerId);
};

// Initialize AI clients
let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;
let groqClient: Groq | null = null;

export const getOpenAIClient = () => {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
};

export const getAnthropicClient = () => {
  if (!anthropicClient && process.env.ANTHROPIC_API_KEY) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
};

export const getGroqClient = () => {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
};
