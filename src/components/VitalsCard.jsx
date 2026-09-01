import React from 'react';

export default function VitalsCard({ title, value, unit, status }) {
  return (
    <div className="bg-cyber-panel border border-cyber-border p-4 rounded-sm shadow-neon flex flex-col justify-center items-center w-full md:w-40 h-32">
      <span className="text-cyber-dim text-xs uppercase tracking-wider mb-2 text-center">{title}</span>
      <div className="flex items-baseline space-x-1">
        <span className="text-4xl font-bold text-cyber-green drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]">
          {value !== null ? value : '--'}
        </span>
        {unit && <span className="text-cyber-dim text-sm">{unit}</span>}
      </div>
      {status && <span className="mt-2 text-xs text-cyber-green opacity-80 text-center">{status}</span>}
    </div>
  );
}
