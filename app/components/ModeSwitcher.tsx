'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, MessageSquare } from 'lucide-react';

interface ModeSwitcherProps {
  currentMode: 'public' | 'sovereign';
  hasSovereignAccess: boolean;
}

export default function ModeSwitcher({ currentMode, hasSovereignAccess }: ModeSwitcherProps) {
  const router = useRouter();

  const switchMode = (mode: 'public' | 'sovereign') => {
    if (mode === 'sovereign' && !hasSovereignAccess) {
      return;
    }
    
    if (mode === 'public') {
      router.push('/chat');
    } else {
      router.push('/primex');
    }
  };

  return (
    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg p-1 border border-cyan-500/20">
      <button
        onClick={() => switchMode('public')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
          currentMode === 'public'
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        }`}
      >
        <MessageSquare size={18} />
        <span className="font-medium">Public Mode</span>
      </button>
      
      <button
        onClick={() => switchMode('sovereign')}
        disabled={!hasSovereignAccess}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
          currentMode === 'sovereign'
            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
            : hasSovereignAccess
            ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            : 'text-gray-600 cursor-not-allowed opacity-50'
        }`}
      >
        <Shield size={18} />
        <span className="font-medium">Sovereign Mode</span>
        {hasSovereignAccess && (
          <span className="ml-1 px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full">
            PRIMEX
          </span>
        )}
      </button>
    </div>
  );
}
