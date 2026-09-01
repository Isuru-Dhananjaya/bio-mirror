import React from 'react';

export default function VitalsCard({ title, value, unit, status, color = "cyan" }) {
  const colorMap = {
    green: "text-cyber-green drop-shadow-[0_0_8px_#00ff41]",
    cyan: "text-cyber-cyan drop-shadow-[0_0_8px_#00f0ff]",
    purple: "text-cyber-purple drop-shadow-[0_0_8px_#b800ff]",
  };
  
  const borderMap = {
    green: "hover:border-cyber-green/50",
    cyan: "hover:border-cyber-cyan/50",
    purple: "hover:border-cyber-purple/50",
  };

  const textClass = colorMap[color] || colorMap.cyan;
  const hoverClass = borderMap[color] || borderMap.cyan;

  return (
    <div className={`bg-cyber-panel/60 backdrop-blur-md border border-cyber-border p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center w-full md:flex-1 h-36 relative overflow-hidden transition-all duration-300 ${hoverClass} hover:bg-cyber-panel/90 group`}>
      
      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">{title}</span>
      
      <div className="flex items-baseline space-x-1">
        <span className={`text-5xl font-black ${textClass}`}>
          {value !== null ? value : '--'}
        </span>
        {unit && <span className="text-gray-500 text-xs font-bold tracking-widest ml-1">{unit}</span>}
      </div>
      
      {status && (
        <span className={`mt-4 px-4 py-1.5 rounded-full text-[9px] uppercase font-bold tracking-widest ${status.includes('SCANNING') || status.includes('CALCULATING') ? 'bg-cyber-cyan/10 text-cyber-cyan animate-pulse border border-cyber-cyan/20' : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'}`}>
          {status}
        </span>
      )}
    </div>
  );
}
