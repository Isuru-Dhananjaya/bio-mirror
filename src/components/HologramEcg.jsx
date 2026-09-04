import React from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import PulseCanvas from './PulseCanvas';

export default function HologramEcg({ status, hologramRef, signalData }) {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-row gap-2 md:gap-6 flex-1 min-h-[150px] md:min-h-[200px]">
      
      {/* 3D Hologram Twin */}
      <div className="w-1/2 md:w-1/3 bg-black rounded-2xl border border-cyber-border p-2 md:p-4 shadow-lg flex flex-col relative overflow-hidden group">
        <div className="flex items-center justify-between z-10 mb-2">
          <h3 className="text-gray-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest pl-1 md:pl-2 flex items-center space-x-1 md:space-x-2">
            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${status === 'COMPLETED' || status === 'IDLE' ? 'bg-gray-600' : 'bg-cyber-purple animate-pulse'}`}></div>
            <span className="truncate">{t('digitalTwin')}</span>
          </h3>
          
          <div className="relative group/info cursor-help hidden md:block">
            <Info size={14} className="text-gray-500 hover:text-cyber-purple transition-colors" />
            <div className="absolute top-full right-0 mt-2 w-56 opacity-0 group-hover/info:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className="bg-cyber-dark border border-cyber-purple/50 p-3 rounded-lg shadow-[0_0_15px_rgba(184,0,255,0.3)] text-left relative">
                <div className="absolute -top-1.5 right-1 w-3 h-3 bg-cyber-dark border-t border-l border-cyber-purple/50 rotate-45"></div>
                <h4 className="text-cyber-purple font-bold text-[10px] mb-1">{t('twinInfoTitle')}</h4>
                <p className="text-gray-300 font-mono text-[9px] leading-relaxed">{t('twinInfoDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative rounded-xl overflow-hidden bg-[#07090f] flex items-center justify-center border border-cyber-purple/20 group-hover:border-cyber-purple/50 transition-colors">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
          
          {/* Live Metrics HUD */}
          <div className="absolute top-1 left-1 md:top-2 md:left-2 flex flex-col z-20 pointer-events-none opacity-60">
             <span className="text-[5px] md:text-[7px] font-mono text-cyber-purple tracking-widest">{t('twinNodes')}</span>
          </div>

          <canvas 
            ref={hologramRef} 
            className="z-10 w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" 
            style={{ transform: 'scaleX(-1)' }} 
          />
        </div>
      </div>

      {/* Medical ECG Monitor */}
      <div className="flex-1 w-1/2 md:w-full bg-black rounded-2xl border border-cyber-border p-2 md:p-4 shadow-lg flex flex-col relative overflow-hidden">
        <h3 className="text-gray-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-2 md:mb-4 pl-1 md:pl-2 flex items-center space-x-1 md:space-x-2 z-10">
          <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${status === 'COMPLETED' || status === 'IDLE' ? 'bg-gray-600' : 'bg-cyber-cyan animate-pulse'}`}></div>
          <span className="truncate">{t('ecgScanner')}</span>
        </h3>
        <div className="flex-1 relative rounded-xl overflow-hidden bg-[#001100]">
          <PulseCanvas data={signalData} isCompleted={status === 'COMPLETED' || status === 'IDLE'} />
        </div>
      </div>

    </div>
  );
}
