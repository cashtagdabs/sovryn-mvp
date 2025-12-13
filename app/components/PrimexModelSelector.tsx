'use client';

import { useState } from 'react';
import { Star, Zap, Shield, TrendingUp, Award, Check } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  badge?: string;
  speed: string;
  accuracy: number;
  featured: boolean;
  recommended: boolean;
}

const MODELS: Model[] = [
  {
    id: 'primex-ultra',
    name: 'PRIMEX Ultra',
    provider: 'PRIMEX',
    description: 'The world\'s most advanced AI. Beats GPT-4, Claude, and all competitors.',
    badge: 'BEST',
    speed: 'Ultra Fast',
    accuracy: 99,
    featured: true,
    recommended: true
  },
  {
    id: 'primex-architect',
    name: 'PRIMEX Architect',
    provider: 'PRIMEX',
    description: 'Specialized for code, system design, and technical tasks.',
    badge: 'FASTEST',
    speed: 'Instant',
    accuracy: 98,
    featured: true,
    recommended: false
  },
  {
    id: 'primex-cortex',
    name: 'PRIMEX Cortex',
    provider: 'PRIMEX',
    description: 'Strategic analysis and decision-making powerhouse.',
    badge: 'SMART',
    speed: 'Instant',
    accuracy: 97,
    featured: true,
    recommended: false
  },
  {
    id: 'primex-mint',
    name: 'PRIMEX Mint',
    provider: 'PRIMEX',
    description: 'Marketing and content creation specialist.',
    badge: 'CREATIVE',
    speed: 'Real-time',
    accuracy: 96,
    featured: true,
    recommended: false
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI (Legacy)',
    description: 'Traditional cloud AI. Slower and more expensive than PRIMEX.',
    speed: 'Medium',
    accuracy: 85,
    featured: false,
    recommended: false
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic (Legacy)',
    description: 'Traditional cloud AI. Slower and more expensive than PRIMEX.',
    speed: 'Medium',
    accuracy: 83,
    featured: false,
    recommended: false
  }
];

interface PrimexModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

export default function PrimexModelSelector({ selectedModel, onModelSelect }: PrimexModelSelectorProps) {
  const [showAll, setShowAll] = useState(false);
  
  const displayModels = showAll ? MODELS : MODELS.filter(m => m.featured);
  const primexModels = displayModels.filter(m => m.provider === 'PRIMEX');
  const legacyModels = displayModels.filter(m => m.provider !== 'PRIMEX');

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Choose Your AI Model
        </h2>
        <p className="text-gray-400">
          PRIMEX models are faster, smarter, and more private than any competitor
        </p>
      </div>

      {/* PRIMEX Models Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Award className="text-yellow-400" size={24} />
          <h3 className="text-xl font-bold text-white">PRIMEX Models (Recommended)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {primexModels.map((model) => (
            <button
              key={model.id}
              onClick={() => onModelSelect(model.id)}
              className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                selectedModel === model.id
                  ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/50'
                  : 'border-gray-700 bg-gray-800/50 hover:border-cyan-500/50 hover:bg-gray-800'
              }`}
            >
              {/* Badge */}
              {model.badge && (
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    model.badge === 'BEST' 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                      : model.badge === 'FASTEST'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black'
                      : 'bg-gradient-to-r from-purple-400 to-pink-500 text-black'
                  }`}>
                    {model.badge}
                  </span>
                </div>
              )}

              {/* Selected Indicator */}
              {selectedModel === model.id && (
                <div className="absolute top-4 left-4">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                    <Check size={16} className="text-black" />
                  </div>
                </div>
              )}

              {/* Model Info */}
              <div className={model.badge ? 'mt-8' : ''}>
                <h4 className="text-lg font-bold text-white mb-2">{model.name}</h4>
                <p className="text-sm text-gray-400 mb-4">{model.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Zap size={16} className="text-yellow-400" />
                    <span className="text-gray-300">{model.speed}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400" />
                    <span className="text-gray-300">{model.accuracy}% Accuracy</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield size={16} className="text-green-400" />
                    <span className="text-gray-300">Private</span>
                  </div>
                </div>

                {/* Recommended */}
                {model.recommended && (
                  <div className="mt-4 flex items-center gap-2 text-cyan-400 text-sm font-semibold">
                    <TrendingUp size={16} />
                    <span>Most Popular Choice</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Legacy Models Section */}
      {showAll && legacyModels.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-gray-400">Legacy Models (Not Recommended)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {legacyModels.map((model) => (
              <button
                key={model.id}
                onClick={() => onModelSelect(model.id)}
                className={`relative p-6 rounded-xl border-2 transition-all text-left opacity-60 ${
                  selectedModel === model.id
                    ? 'border-gray-500 bg-gray-800/50'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                {/* Selected Indicator */}
                {selectedModel === model.id && (
                  <div className="absolute top-4 left-4">
                    <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center">
                      <Check size={16} className="text-black" />
                    </div>
                  </div>
                )}

                {/* Model Info */}
                <div>
                  <h4 className="text-lg font-bold text-gray-300 mb-2">{model.name}</h4>
                  <p className="text-sm text-gray-500 mb-4">{model.description}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Zap size={16} className="text-gray-500" />
                      <span className="text-gray-500">{model.speed}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-gray-500" />
                      <span className="text-gray-500">{model.accuracy}% Accuracy</span>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="mt-4 text-xs text-yellow-600">
                    ⚠️ Slower and more expensive than PRIMEX
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toggle Legacy Models */}
      <div className="text-center">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-gray-400 hover:text-white transition-colors underline"
        >
          {showAll ? 'Hide legacy models' : 'Show legacy models (not recommended)'}
        </button>
      </div>

      {/* Why PRIMEX Banner */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
        <h4 className="text-lg font-bold text-white mb-3">Why PRIMEX is Better</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
              <Zap size={16} />
              <span>10x Faster</span>
            </div>
            <p className="text-gray-400">Instant responses, no waiting</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
              <Star size={16} />
              <span>More Accurate</span>
            </div>
            <p className="text-gray-400">Better quality than GPT-4</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
              <Shield size={16} />
              <span>100% Private</span>
            </div>
            <p className="text-gray-400">Your data stays secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
