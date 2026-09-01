import React, { useEffect, useRef } from 'react';

export default function PulseCanvas({ data = [], isCompleted = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Hospital Monitor Grid (Small squares and large squares)
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < canvas.width; i += 15) {
      ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
    }
    for (let i = 0; i < canvas.height; i += 15) {
      ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
    }
    ctx.strokeStyle = '#002200';
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < canvas.width; i += 75) {
      ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
    }
    for (let i = 0; i < canvas.height; i += 75) {
      ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
    }
    ctx.strokeStyle = '#004400';
    ctx.stroke();

    if (data.length === 0) return;

    // Draw ECG Signal
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isCompleted ? '#555555' : '#00ff00'; // Gray out if finished, classic bright green otherwise
    ctx.shadowBlur = isCompleted ? 0 : 12;
    ctx.shadowColor = '#00ff00';
    ctx.lineWidth = 2.5;
    
    ctx.beginPath();
    const step = canvas.width / (data.length - 1 || 1);
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = (max - min) || 1;
    const threshold = min + (range * 0.6); // Top 40% for QRS spike simulation
    
    data.forEach((value, index) => {
      const x = index * step;
      
      // Simulate sharp hospital ECG QRS peaks visually for the rPPG feed
      let displayValue = value;
      if (value > threshold) {
        displayValue = value + (value - threshold) * 1.5; // Sharpen peaks
      }

      // Re-normalize to max height (leave padding)
      const adjustedMax = max + (max - threshold) * 1.5;
      const adjustedRange = (adjustedMax - min) || 1;
      const normalized = (displayValue - min) / adjustedRange;
      
      const y = canvas.height * 0.9 - (normalized * canvas.height * 0.8);
      
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.stroke();

  }, [data, isCompleted]);

  return (
    <div className="w-full h-full relative">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={300} 
        className="w-full h-full object-fill mix-blend-screen"
      />
      {isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <span className="text-cyber-green font-bold tracking-widest uppercase border border-cyber-green/50 px-4 py-2 rounded bg-cyber-green/10">
            RECORDING STOPPED
          </span>
        </div>
      )}
    </div>
  );
}
