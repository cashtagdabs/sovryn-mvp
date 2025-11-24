'use client';

import { useState } from 'react';
import { ChevronDown, Sparkles, Brain, Zap, Crown, Bot } from 'lucide-react';
import { AI_PROVIDERS } from '@/app/lib/ai/providers';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/app/lib/utils';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getModelIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return Sparkles;
      case 'anthropic':
        return Brain;
      case 'groq':
        return Zap;
      case 'ollama':
        return Bot;
      default:
        return Sparkles;
    }
  };

  const selectedModel = AI_PROVIDERS.flatMap((p) => p.models).find((m) => m.id === value);
  const selectedProvider = AI_PROVIDERS.find((p) =>
    p.models.some((m) => m.id === value)
  );

  const Icon = selectedProvider ? getModelIcon(selectedProvider.id) : Sparkles;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center space-x-2 rounded-xl border border-white/10',
          'bg-white/5 px-4 py-2 text-white backdrop-blur-sm',
          'transition-all duration-200 hover:bg-white/10',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">
          {selectedModel?.name || 'Select Model'}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', duration: 0.2 }}
              className={cn(
                'absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl',
                'border border-white/10 bg-black/90 backdrop-blur-xl',
                'shadow-2xl shadow-purple-500/10'
              )}
            >
              <div className="max-h-96 overflow-y-auto p-2">
                {AI_PROVIDERS.map((provider) => {
                  const ProviderIcon = getModelIcon(provider.id);
                  return (
                    <div key={provider.id} className="mb-2">
                      <div className="mb-1 flex items-center space-x-2 px-3 py-2">
                        <ProviderIcon className="h-4 w-4 text-white/60" />
                        <span className="text-sm font-medium text-white/80">
                          {provider.name}
                        </span>
                      </div>
                      {provider.models.map((model) => {
                        const isPremium = model.inputCost > 5;
                        return (
                          <button
                            key={model.id}
                            onClick={() => {
                              onChange(model.id);
                              setIsOpen(false);
                            }}
                            className={cn(
                              'flex w-full items-center justify-between rounded-lg px-3 py-2.5',
                              'text-left transition-all duration-200',
                              value === model.id
                                ? 'bg-purple-500/20 text-white'
                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">
                                    {model.name}
                                  </span>
                                  {isPremium && (
                                    <Crown className="h-3 w-3 text-yellow-500" />
                                  )}
                                </div>
                                <div className="mt-0.5 flex items-center space-x-3 text-xs text-white/50">
                                  <span>{(model.contextWindow / 1000).toFixed(0)}K context</span>
                                  <span>•</span>
                                  <span>
                                    {model.inputCost === 0
                                      ? 'free'
                                      : `$${model.inputCost}/1M tokens`
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                            {value === model.id && (
                              <motion.div
                                layoutId="selected-model"
                                className="h-2 w-2 rounded-full bg-purple-500"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
