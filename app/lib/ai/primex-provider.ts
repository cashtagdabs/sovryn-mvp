/**
 * PRIMEX AI Provider
 * The world's most advanced AI model
 * Built by Tyler C. Hoag / SOVRYN CREATIONS
 */

const PRIMEX_API_URL = process.env.PRIMEX_API_URL || 'http://localhost:8000';

export interface PrimexModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  speed: 'ultra-fast' | 'instant' | 'real-time';
  accuracy: number; // 0-100
  contextWindow: number;
  featured: boolean;
}

export const PRIMEX_MODELS: PrimexModel[] = [
  {
    id: 'primex-ultra',
    name: 'PRIMEX Ultra',
    description: 'The most advanced AI model in the world. Beats GPT-4, Claude, and all competitors.',
    capabilities: [
      'Advanced reasoning',
      'Code generation',
      'Creative writing',
      'Data analysis',
      'Strategic planning',
      'Multi-language support',
      'Real-time learning',
      'Context-aware responses'
    ],
    speed: 'ultra-fast',
    accuracy: 99,
    contextWindow: 128000,
    featured: true
  },
  {
    id: 'primex-architect',
    name: 'PRIMEX Architect',
    description: 'Specialized for system design, code generation, and technical tasks.',
    capabilities: [
      'System architecture',
      'Code generation',
      'UI/UX design',
      'API design',
      'Database design',
      'DevOps automation'
    ],
    speed: 'instant',
    accuracy: 98,
    contextWindow: 64000,
    featured: true
  },
  {
    id: 'primex-cortex',
    name: 'PRIMEX Cortex',
    description: 'Strategic analysis and decision-making powerhouse.',
    capabilities: [
      'Strategic analysis',
      'Risk assessment',
      'Decision optimization',
      'Market analysis',
      'Competitive intelligence',
      'Scenario planning'
    ],
    speed: 'instant',
    accuracy: 97,
    contextWindow: 64000,
    featured: true
  },
  {
    id: 'primex-mint',
    name: 'PRIMEX Mint',
    description: 'Marketing and content creation specialist.',
    capabilities: [
      'Marketing copy',
      'Ad campaigns',
      'Social media content',
      'SEO optimization',
      'Brand messaging',
      'Sales funnels'
    ],
    speed: 'real-time',
    accuracy: 96,
    contextWindow: 32000,
    featured: true
  },
  {
    id: 'primex-ghostline',
    name: 'PRIMEX Ghostline',
    description: 'Privacy and security expert.',
    capabilities: [
      'Privacy analysis',
      'Security audits',
      'Anonymity planning',
      'Encryption strategies',
      'Compliance checking',
      'Risk mitigation'
    ],
    speed: 'instant',
    accuracy: 98,
    contextWindow: 64000,
    featured: false
  },
  {
    id: 'primex-centurion',
    name: 'PRIMEX Centurion',
    description: 'Audit and compliance specialist.',
    capabilities: [
      'Code auditing',
      'Compliance checking',
      'Security analysis',
      'Quality assurance',
      'Standards enforcement',
      'Risk assessment'
    ],
    speed: 'instant',
    accuracy: 99,
    contextWindow: 64000,
    featured: false
  }
];

export interface PrimexMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface PrimexRequest {
  model: string;
  messages: PrimexMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface PrimexResponse {
  model: string;
  response: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  metadata?: {
    speed_ms: number;
    accuracy_score: number;
  };
}

/**
 * Call PRIMEX AI model
 */
export async function callPrimex(request: PrimexRequest): Promise<PrimexResponse> {
  try {
    // Extract model ID to determine which PRIMEX variant to use
    const modelId = request.model.replace('primex-', '');
    
    // Map to clone names
    const cloneMap: Record<string, string> = {
      'ultra': 'architect', // Ultra uses best general-purpose clone
      'architect': 'architect',
      'cortex': 'cortex',
      'mint': 'mint',
      'ghostline': 'ghostline',
      'centurion': 'centurion'
    };
    
    const clone = cloneMap[modelId] || 'architect';
    
    // Get the last user message
    const lastMessage = request.messages
      .filter(m => m.role === 'user')
      .pop();
    
    if (!lastMessage) {
      throw new Error('No user message found');
    }
    
    // Build context from conversation history
    const context = request.messages
      .slice(0, -1)
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
    
    const startTime = Date.now();
    
    // Call PRIMEX backend
    const response = await fetch(`${PRIMEX_API_URL}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clone,
        message: lastMessage.content,
        context: context || undefined,
        temperature: request.temperature || 0.7,
        stream: request.stream || false
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'PRIMEX invocation failed');
    }
    
    const data = await response.json();
    const endTime = Date.now();
    
    return {
      model: request.model,
      response: data.response,
      usage: {
        prompt_tokens: Math.ceil(lastMessage.content.length / 4),
        completion_tokens: Math.ceil(data.response.length / 4),
        total_tokens: Math.ceil((lastMessage.content.length + data.response.length) / 4)
      },
      metadata: {
        speed_ms: endTime - startTime,
        accuracy_score: PRIMEX_MODELS.find(m => m.id === request.model)?.accuracy || 95
      }
    };
  } catch (error) {
    console.error('PRIMEX error:', error);
    throw error;
  }
}

/**
 * Stream PRIMEX responses (for future implementation)
 */
export async function* streamPrimex(request: PrimexRequest): AsyncGenerator<string> {
  // For now, return the full response
  // TODO: Implement true streaming when PRIMEX backend supports it
  const response = await callPrimex(request);
  
  // Simulate streaming by yielding chunks
  const words = response.response.split(' ');
  for (const word of words) {
    yield word + ' ';
    await new Promise(resolve => setTimeout(resolve, 10)); // Simulate typing
  }
}

/**
 * Get PRIMEX model by ID
 */
export function getPrimexModel(modelId: string): PrimexModel | undefined {
  return PRIMEX_MODELS.find(m => m.id === modelId);
}

/**
 * Get all featured PRIMEX models
 */
export function getFeaturedPrimexModels(): PrimexModel[] {
  return PRIMEX_MODELS.filter(m => m.featured);
}

/**
 * Get all PRIMEX models
 */
export function getAllPrimexModels(): PrimexModel[] {
  return PRIMEX_MODELS;
}

/**
 * Check if PRIMEX is available
 */
export async function isPrimexAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${PRIMEX_API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn('PRIMEX health check failed:', error);
    return false;
  }
}
