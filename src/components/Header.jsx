import React, { useState } from 'react';
import { Activity, ShieldCheck, Camera, Volume2, VolumeX } from 'lucide-react';
import { toggleMute } from '../utils/audioHelper';
import InstallPrompt from './InstallPrompt';

export default function Header({ fps }) {
  const [muted, setMuted] = useState(false);

  const handleMuteToggle = () => {
    const isNowMuted = toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <header className="flex justify-between items-center p-4 border-b border-cyber-border bg-cyber-panel/80 backdrop-blur-md relative z-50 shadow-md">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-cyber-cyan/10 rounded-xl border border-cyber-cyan/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
          <Activity className="text-cyber-cyan animate-pulse" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-widest uppercase text-white drop-shadow-[0_0_8px_#00f0ff]">Bio-Mirror</h1>
          <p className="text-[9px] text-cyber-cyan font-mono tracking-widest">EDGE COMPUTING VITAL SIGNS</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <InstallPrompt />
        <button 
          onClick={handleMuteToggle} 
          className={`flex items-center space-x-2 transition-all duration-300 border px-4 py-1.5 rounded-full ${
            muted 
              ? 'text-gray-400 border-gray-600 bg-gray-800 hover:text-white' 
              : 'text-cyber-purple border-cyber-purple/50 bg-cyber-purple/10 hover:bg-cyber-purple/30 hover:shadow-[0_0_10px_#b800ff]'
          }`}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span className="text-[10px] font-bold tracking-wider hidden md:inline">
            {muted ? 'MUTED' : 'AUDIO'}
          </span>
        </button>

        {/* 100% PRIVATE Badge with Custom Cyber Tooltip */}
        <div className="hidden lg:flex relative group items-center space-x-2 text-cyber-green bg-cyber-green/10 px-3 py-1.5 rounded-full border border-cyber-green/20 cursor-help">
          <ShieldCheck size={14} />
          <span className="font-mono text-[10px] font-bold">100% PRIVATE</span>
          
          <div className="absolute top-full right-0 mt-3 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="bg-cyber-dark border border-cyber-green/50 p-2 rounded shadow-[0_0_15px_rgba(0,255,65,0.3)] text-[10px] text-cyber-green font-mono text-center relative">
              {/* Tooltip Arrow */}
              <div className="absolute -top-1.5 right-6 w-3 h-3 bg-cyber-dark border-t border-l border-cyber-green/50 rotate-45"></div>
              All AI processing runs on your device locally. No video is ever sent to servers.
            </div>
          </div>
        </div>

        {/* FPS Badge with Custom Cyber Tooltip */}
        <div className="flex relative group items-center space-x-2 text-cyber-cyan font-mono bg-cyber-panel px-3 py-1.5 rounded-md border border-cyber-border cursor-help">
          <Camera size={14} />
          <span className="text-[10px]">{fps} FPS</span>

          <div className="absolute top-full right-0 mt-3 w-36 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="bg-cyber-dark border border-cyber-cyan/50 p-2 rounded shadow-neon-cyan text-[10px] text-cyber-cyan font-mono text-center relative">
              {/* Tooltip Arrow */}
              <div className="absolute -top-1.5 right-6 w-3 h-3 bg-cyber-dark border-t border-l border-cyber-cyan/50 rotate-45"></div>
              Frames Per Second. Indicates AI speed & performance.
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
