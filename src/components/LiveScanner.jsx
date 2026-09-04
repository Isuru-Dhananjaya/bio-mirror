import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import CalibrationOverlay from './CalibrationOverlay';
import PulseCanvas from './PulseCanvas';

export default function LiveScanner({ 
  status, progress, error, liveAlert, signalData, videoRef, overlayRef, hologramRef, handleStartSystem, handleCancelScan 
}) {
  const { t } = useLanguage();
  
  return (
    <>
      {/* The Cyber Mirror */}
      <div className="flex-1 min-h-[40vh] lg:min-h-0 lg:max-w-md xl:max-w-lg relative flex items-center justify-center border border-cyber-border bg-black rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <CalibrationOverlay status={status} progress={progress} errorMsg={error} onStart={handleStartSystem} onCancel={handleCancelScan} />
        
        {/* Dynamic Warning HUD */}
        {liveAlert && status === 'SCANNING' && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-50 animate-pulse bg-red-900/80 border border-red-500 rounded-lg p-3 flex flex-col items-center">
            <ShieldAlert className="text-red-500 mb-1" size={24} />
            <span className="text-red-500 font-black tracking-widest text-[10px] text-center w-full max-w-[200px]">
              {liveAlert === 'MOTION' ? t('alertMotion') : liveAlert === 'LOW_LIGHT' ? t('alertLowLight') : "FACE LOST"}
            </span>
          </div>
        )}
        
        {/* Video and Canvas ALWAYS mounted to prevent videoRef.current from being null during startCamera */}
        <div className={`absolute inset-0 w-full h-full ${status === 'COMPLETED' || status === 'IDLE' ? 'hidden' : 'block'}`}>
          <video 
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} 
          />
          <canvas 
            ref={overlayRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-20"
            style={{ transform: 'scaleX(-1)' }} 
          />
        </div>
      </div>
    </>
  );
}
