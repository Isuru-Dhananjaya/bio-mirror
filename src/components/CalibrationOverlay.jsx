import React from 'react';
import { AlertTriangle, VideoOff, Loader, CheckCircle, ScanFace, Activity } from 'lucide-react';

export default function CalibrationOverlay({ status, progress, errorMsg, onStart }) {
  if (status === 'READY') return null;

  if (status === 'IDLE') {
    return (
      <div className="absolute inset-0 z-40 bg-[#07090f]/80 flex flex-col items-center justify-center backdrop-blur-md">
        <div className="bg-cyber-panel/90 border border-cyber-cyan/30 p-8 rounded-2xl shadow-neon-cyan flex flex-col items-center max-w-sm w-full mx-4 backdrop-blur-lg">
          <Activity size={50} className="text-cyber-cyan drop-shadow-[0_0_10px_#00f0ff] mb-6 animate-pulse" />
          <h2 className="text-xl font-black tracking-widest uppercase mb-2 text-white drop-shadow-[0_0_5px_#00f0ff]">
            SYSTEM STANDBY
          </h2>
          <p className="text-gray-300 font-mono text-center text-[10px] mb-8 leading-relaxed px-2">
            Click below to initialize the Edge AI scanner and grant camera access.
          </p>
          <button onClick={onStart} className="btn-cyber w-full py-4 text-xs animate-pulse hover:animate-none">
            INITIALIZE SCANNER
          </button>
        </div>
      </div>
    );
  }

  // 1. Unobtrusive Top HUD for Scanning and Initializing
  if (status === 'SCANNING' || status === 'INITIALIZING') {
    return (
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-sm pointer-events-none">
        <div className="bg-cyber-panel/80 border border-cyber-cyan/40 p-4 rounded-xl shadow-[0_4px_20px_rgba(0,240,255,0.2)] backdrop-blur-md flex flex-col items-center transition-all duration-500">
          {status === 'INITIALIZING' ? (
            <div className="flex items-center space-x-3">
              <Loader size={16} className="text-cyber-cyan animate-spin" />
              <span className="text-cyber-cyan font-bold tracking-widest text-[10px] drop-shadow-[0_0_5px_#00f0ff]">LOADING AI ENGINE...</span>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex justify-between items-center w-full mb-2">
                <span className="text-cyber-cyan font-bold tracking-widest text-[10px] animate-pulse flex items-center gap-2 drop-shadow-[0_0_5px_#00f0ff]">
                  <ScanFace size={14} /> EXTRACTING VITALS
                </span>
                <span className="text-cyber-cyan font-mono font-bold text-[12px] drop-shadow-[0_0_5px_#00f0ff]">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-cyber-cyan/20">
                <div 
                  className="h-full bg-cyber-cyan shadow-[0_0_8px_#00f0ff] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isDeviceInUse = errorMsg && errorMsg.toLowerCase().includes('device in use');

  if (status === 'COMPLETED') {
    return (
      <div className="absolute inset-0 z-40 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
        <div className="bg-cyber-panel/90 border border-cyber-green/50 p-6 rounded-2xl shadow-[0_0_30px_rgba(0,255,65,0.2)] flex flex-col items-center max-w-xs w-full mx-4 backdrop-blur-lg">
          <CheckCircle size={50} className="text-cyber-green drop-shadow-[0_0_15px_#00ff41] mb-4" />
          <h2 className="text-lg font-black tracking-widest uppercase mb-2 text-white drop-shadow-[0_0_5px_#00ff41]">
            SCAN COMPLETE
          </h2>
          <p className="text-gray-300 font-mono text-center text-[10px] mb-6 leading-relaxed px-2">
            Vital signs successfully recorded. Camera hardware disabled.
          </p>
          <button onClick={() => window.location.reload()} className="btn-cyber text-[10px] w-full py-3 bg-cyber-green/20 text-cyber-green border-cyber-green hover:bg-cyber-green/40 hover:shadow-[0_0_20px_#00ff41] pointer-events-auto">
            START NEW SCAN
          </button>
        </div>
      </div>
    );
  }

  // ERROR or REQUESTING_CAMERA
  return (
    <div className="absolute inset-0 z-40 bg-[#07090f]/90 flex flex-col items-center justify-center backdrop-blur-md">
      <div className="bg-cyber-panel/90 border border-cyber-cyan/30 p-8 rounded-2xl shadow-neon-cyan flex flex-col items-center max-w-md w-full mx-4 pointer-events-auto">
        <div className="relative mb-6">
          <VideoOff size={60} className={`${status === 'ERROR' ? 'text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]' : 'text-cyber-cyan opacity-50'}`} />
        </div>
        
        <h2 className={`text-xl font-black tracking-widest uppercase mb-4 text-center ${status === 'ERROR' ? 'text-red-500' : 'text-white drop-shadow-[0_0_5px_#00f0ff]'}`}>
          {status === 'REQUESTING_CAMERA' ? 'Camera Required' : 'Hardware Locked'}
        </h2>
        
        <p className="text-gray-300 font-mono text-center text-xs mb-6 leading-relaxed px-2">
          {status === 'REQUESTING_CAMERA' 
            ? 'Please click "Allow" on your browser\'s camera permission prompt to proceed.' 
            : (isDeviceInUse ? 'Your webcam is used by another app (Zoom/Skype). Close it and refresh.' : 'Camera access denied or hardware failure.')}
        </p>

        {status === 'ERROR' && (
          <button onClick={() => window.location.reload()} className="btn-cyber text-xs w-full mt-2">
            RELOAD APPLICATION
          </button>
        )}
      </div>
    </div>
  );
}
