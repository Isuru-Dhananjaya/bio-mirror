import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function VitalsCard({ title, value, unit, status, color, range }) {
  const { t } = useLanguage();
  
  const colorMap = {
    cyan: { text: 'text-cyber-cyan', border: 'border-cyber-cyan/30', bg: 'bg-cyber-cyan/10' },
    purple: { text: 'text-cyber-purple', border: 'border-cyber-purple/30', bg: 'bg-cyber-purple/10' },
    green: { text: 'text-cyber-green', border: 'border-cyber-green/30', bg: 'bg-cyber-green/10' }
  };

  return (
    <div className="flex-1 min-w-[140px] bg-cyber-dark/80 backdrop-blur-md border border-cyber-border rounded-xl p-4 shadow-lg hover:border-cyber-cyan/50 transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <h3 className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">{title}</h3>
        <span className={`text-[8px] px-2 py-0.5 rounded-full border font-bold tracking-widest ${colorMap[color].bg} ${colorMap[color].border} ${colorMap[color].text}`}>
          {status}
        </span>
      </div>
      
      <div className="mt-3 flex items-baseline space-x-1">
        <span className={`text-4xl md:text-5xl font-black font-mono tracking-tighter drop-shadow-[0_0_8px_currentColor] ${colorMap[color].text}`}>
          {value !== null ? value : '--'}
        </span>
        <span className="text-gray-500 font-mono text-xs">{unit}</span>
      </div>

      {range && (
        <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
          <span className="text-gray-500 text-[8px] uppercase tracking-widest">{t('normalRange')}</span>
          <span className="text-gray-400 font-mono text-[9px] bg-black px-2 py-0.5 rounded border border-gray-800">{range}</span>
        </div>
      )}
    </div>
  );
}
