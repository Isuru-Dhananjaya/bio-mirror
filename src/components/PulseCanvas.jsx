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

    // Draw Axis Labels
    ctx.fillStyle = '#00ff41'; // neon green text
    ctx.font = '10px monospace';
    ctx.shadowBlur = 0;
    
    // Y-Axis label (Rotated)
    ctx.save();
    ctx.translate(12, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.6;
    ctx.fillText('Signal (Δ)', 0, 0);
    ctx.restore();

    // X-Axis label
    ctx.textAlign = 'right';
    ctx.globalAlpha = 0.6;
    ctx.fillText('Time (ms)', canvas.width - 10, canvas.height - 10);
    ctx.globalAlpha = 1.0;

    if (data.length === 0) return;

    // Draw ECG Signal with Smooth Natural Curves
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = isCompleted ? '#555555' : '#00ff41';
    ctx.shadowBlur = isCompleted ? 0 : 16;
    ctx.shadowColor = '#00ff41';
    ctx.lineWidth = 2.8;
    
    const step = canvas.width / (data.length - 1 || 1);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = (max - min) || 1;
    const threshold = min + (range * 0.6);

    const points = data.map((value, index) => {
      let displayValue = value;
      if (value > threshold) {
        displayValue = value + (value - threshold) * 1.5;
      }
      const adjustedMax = max + (max - threshold) * 1.5;
      const adjustedRange = (adjustedMax - min) || 1;
      const normalized = (displayValue - min) / adjustedRange;
      const y = canvas.height * 0.9 - (normalized * canvas.height * 0.8);
      return { x: index * step, y };
    });

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    if (points.length > 1) {
      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
    }
    ctx.stroke();

    // Draw Glowing Scanner Head at the live pulse front
    if (!isCompleted && points.length > 0) {
      const lastPoint = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00ff41';
      ctx.fill();
    }

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
          <span className="text-cyber-green text-[10px] md:text-base font-bold tracking-widest uppercase border border-cyber-green/50 px-2 md:px-4 py-1 md:py-2 rounded bg-cyber-green/10 text-center">
            RECORDING STOPPED
          </span>
        </div>
      )}
    </div>
  );
}
