import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function VitalsCard({ title, value, unit, status, color, range }) {
  const { t } = useLanguage();
  
  const colorMap = {
    cyan: { text: 'text-cyber-cyan', border: 'border-cyber-cyan/30', bg: 'bg-cyber-cyan/10' },
    purple: { text: 'text-cyber-purple', border: 'border-cyber-purple/30', bg: 'bg-cyber-purple/10' },
    green: { text: 'text-cyber-green', border: 'border-cyber-green/30', bg: 'bg-cyber-green/10' },
    blue: { text: 'text-blue-500', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
    orange: { text: 'text-orange-500', border: 'border-orange-500/30', bg: 'bg-orange-500/10' }
  };
  
  const theme = colorMap[color] || colorMap.cyan;

  return (
    <div className="flex-1 min-w-[120px] md:min-w-[140px] bg-cyber-dark/80 backdrop-blur-md border border-cyber-border rounded-xl p-3 md:p-4 shadow-lg hover:border-cyber-cyan/50 transition-all duration-300 group">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1.5 md:gap-0">
        <h3 className="text-gray-400 text-[9px] md:text-[10px] font-bold tracking-widest uppercase leading-tight">{title}</h3>
        <span className={`text-[7px] md:text-[8px] px-2 py-0.5 rounded-full border font-bold tracking-widest truncate max-w-full ${theme.bg} ${theme.border} ${theme.text}`}>
          {status}
        </span>
      </div>
      
      <div className="mt-2 md:mt-3 flex items-baseline space-x-1">
        <span className={`text-3xl md:text-5xl font-black font-mono tracking-tighter drop-shadow-[0_0_8px_currentColor] ${theme.text}`}>
          {value !== null ? value : '--'}
        </span>
        <span className="text-gray-500 font-mono text-xs">{unit}</span>
      </div>

      {range && (
        <div className="mt-2 md:mt-4 pt-2 md:pt-3 border-t border-gray-800 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
          <span className="text-gray-500 text-[6px] md:text-[8px] uppercase tracking-widest">{t('normalRange')}</span>
          <span className="text-gray-400 font-mono text-[7px] md:text-[9px] bg-black px-1.5 md:px-2 py-0.5 rounded border border-gray-800">{range}</span>
        </div>
      )}
    </div>
  );
}
