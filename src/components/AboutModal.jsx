import React from 'react';
import { X, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AboutModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-cyber-panel border border-cyber-border rounded-2xl w-full max-w-lg shadow-[0_0_30px_rgba(0,240,255,0.15)] relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-cyber-border/50 flex justify-between items-center bg-black/50">
          <div className="flex items-center space-x-3">
            <Cpu className="text-cyber-cyan animate-pulse" size={24} />
            <h2 className="text-lg font-black tracking-widest text-white uppercase drop-shadow-[0_0_8px_#00f0ff]">
              About Bio-Mirror
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white bg-gray-800/50 hover:bg-red-500/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-h-[70vh] hide-scrollbar">
          
          <div className="space-y-2">
            <h3 className="text-cyber-purple font-bold text-xs tracking-widest uppercase flex items-center space-x-2">
              <Activity size={14} />
              <span>How it Works (rPPG Technology)</span>
            </h3>
            <p className="text-gray-300 text-[10px] md:text-xs leading-relaxed font-mono">
              Bio-Mirror uses a technology called <strong className="text-white">rPPG (Remote Photoplethysmography)</strong>. 
              Every time your heart beats, blood rushes to your face, causing microscopic changes in your skin color. 
              Our AI detects these invisible color changes through your camera to calculate your Heart Rate, HRV, and Stress levels with clinical-grade accuracy.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-cyber-purple font-bold text-xs tracking-widest uppercase flex items-center space-x-2">
              <Cpu size={14} />
              <span>Edge AI Processing</span>
            </h3>
            <p className="text-gray-300 text-[10px] md:text-xs leading-relaxed font-mono">
              The Digital Twin maps exactly 468 3D points on your face. We intentionally disabled heavy tracking (like eye pupils) 
              so it runs extremely fast on your mobile device (Edge Computing) without draining battery.
            </p>
          </div>

          <div className="bg-cyber-green/5 border border-cyber-green/30 p-4 rounded-xl space-y-2">
            <h3 className="text-cyber-green font-bold text-xs tracking-widest uppercase flex items-center space-x-2">
              <ShieldCheck size={14} />
              <span>100% Private & Secure</span>
            </h3>
            <p className="text-gray-300 text-[10px] md:text-xs leading-relaxed font-mono">
              Your camera feed <strong className="text-cyber-green">never leaves your phone</strong>. 
              All AI processing happens entirely inside your browser. We do not record or send video data to any server. 
              Only the final numbers (like your BPM) are saved to your account.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyber-border/50 bg-black/30 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/50 rounded-lg text-xs font-bold tracking-widest hover:bg-cyber-cyan/30 transition-colors">
            UNDERSTOOD
          </button>
        </div>
      </div>
    </div>
  );
}
