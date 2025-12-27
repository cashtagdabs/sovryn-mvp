'use client';

import React from 'react';
import { TakeOverPanel } from '../TakeOverPanel';

export default function TakeOverSection() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Take Over Mode
        </h2>
        <span className="text-sm text-gray-500">Autonomous Task Execution</span>
      </div>
      <TakeOverPanel defaultModel="primex-ultra" />
    </div>
  );
}
