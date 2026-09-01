import React, { useEffect, useRef } from 'react';

export default function PulseCanvas({ data = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (data.length === 0) return;

    // Draw settings for Cyberpunk look
    ctx.lineJoin = 'round';

    // Draw grid
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#003b00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
    }
    ctx.stroke();

    // Draw signal
    ctx.strokeStyle = '#00ff41';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ff41';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    const step = canvas.width / (data.length - 1 || 1);
    
    // Auto-scale Y based on min/max of current data window
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = (max - min) || 1;
    
    data.forEach((value, index) => {
      const x = index * step;
      // Normalize and map to canvas height (leaving 20% padding)
      const normalized = (value - min) / range;
      const y = canvas.height * 0.9 - (normalized * canvas.height * 0.8);
      
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

  }, [data]);

  return (
    <div className="w-full h-full relative bg-cyber-panel border border-cyber-border rounded-sm overflow-hidden shadow-[inset_0_0_20px_rgba(0,59,0,0.5)]">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={300} 
        className="w-full h-full object-fill"
      />
      <div className="absolute top-2 left-3 text-cyber-dim text-[10px] tracking-widest font-bold">RAW rPPG SIGNAL [POS ALGORITHM]</div>
    </div>
  );
}
