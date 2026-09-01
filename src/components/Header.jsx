import React from 'react';
import { Activity, ShieldCheck, Camera } from 'lucide-react';

export default function Header({ fps }) {
  return (
    <header className="flex justify-between items-center p-4 border-b border-cyber-border bg-cyber-panel bg-opacity-80 backdrop-blur-sm shadow-neon relative z-50">
      <div className="flex items-center space-x-3">
        <Activity className="text-cyber-green animate-pulse" />
        <h1 className="text-xl font-bold tracking-widest uppercase">Bio-Mirror</h1>
      </div>
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2 text-cyber-dim">
          <ShieldCheck size={16} />
          <span className="hidden md:inline">100% Edge Privacy</span>
        </div>
        <div className="flex items-center space-x-2 font-mono">
          <Camera size={16} />
          <span>{fps} FPS</span>
        </div>
      </div>
    </header>
  );
}
