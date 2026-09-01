import React from 'react';
import { ScanFace, AlertTriangle } from 'lucide-react';

export default function CalibrationOverlay({ status, progress, message }) {
  if (status === 'READY') return null;

  return (
    <div className="absolute inset-0 z-40 bg-cyber-dark bg-opacity-95 flex flex-col items-center justify-center backdrop-blur-md">
      <div className="relative">
        <ScanFace size={100} className={`text-cyber-green ${status === 'SCANNING' ? 'animate-pulse drop-shadow-[0_0_15px_rgba(0,255,65,0.8)]' : 'opacity-50'}`} />
        {status === 'SCANNING' && (
          <div className="absolute inset-0 border-t-4 border-cyber-green rounded-full animate-spin"></div>
        )}
      </div>
      
      <h2 className="mt-8 text-2xl font-bold tracking-widest uppercase text-cyber-green drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]">
        {status === 'INITIALIZING' ? 'Initializing Optics...' : 
         status === 'SCANNING' ? 'Calibrating...' : 
         status === 'ERROR' ? 'Calibration Failed' : 'Waiting...'}
      </h2>
      
      <p className="mt-2 text-cyber-dim font-mono max-w-md text-center text-sm">
        {message || 'Please face the camera directly and hold still. Ensure adequate lighting.'}
      </p>

      {status === 'SCANNING' && (
        <div className="mt-8 w-64 h-2 border border-cyber-border rounded-full overflow-hidden bg-cyber-panel">
          <div 
            className="h-full bg-cyber-green shadow-neon transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="mt-6 flex items-center space-x-2 text-red-500 font-mono text-sm border border-red-900 bg-black p-2 rounded">
          <AlertTriangle size={16} />
          <span>{message || 'Check lighting and motion'}</span>
        </div>
      )}
    </div>
  );
}
