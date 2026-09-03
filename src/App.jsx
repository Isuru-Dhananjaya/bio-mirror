import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import VitalsCard from './components/VitalsCard';
import PulseCanvas from './components/PulseCanvas';
import CalibrationOverlay from './components/CalibrationOverlay';
import HistoryModal from './components/HistoryModal';
import BioHealer from './components/BioHealer';
import WrappedCard from './components/WrappedCard';
import { useCamera } from './hooks/useCamera';
import { initializeFaceMesh, drawFaceMesh, drawHologram, processFaceData } from './vision/faceTracking';
import { playThump, initAudio } from './utils/audioHelper';
import { saveScanResult } from './utils/storageHelper';
import { Info, AlertCircle, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

const getHealthInsight = (bpm, hrv, stress, t) => {
  if (!bpm || !hrv) return null;
  if (bpm > 100 && stress > 65) {
    return { type: 'warning', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50', title: t('highStressTitle'), msg: t('highStressMsg'), healable: true };
  }
  if (bpm < 55 && hrv > 60) {
    return { type: 'success', icon: CheckCircle2, color: 'text-cyber-green', bg: 'bg-cyber-green/10', border: 'border-cyber-green/50', title: t('athleticTitle'), msg: t('athleticMsg'), healable: false };
  }
  if (hrv < 25) {
    return { type: 'warning', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50', title: t('lowRecoveryTitle'), msg: t('lowRecoveryMsg'), healable: true };
  }
  if (bpm >= 60 && bpm <= 90 && stress <= 50) {
    return { type: 'success', icon: CheckCircle2, color: 'text-cyber-cyan', bg: 'bg-cyber-cyan/10', border: 'border-cyber-cyan/50', title: t('optimalTitle'), msg: t('optimalMsg'), healable: false };
  }
  return { type: 'info', icon: Info, color: 'text-cyber-purple', bg: 'bg-cyber-purple/10', border: 'border-cyber-purple/50', title: t('moderateTitle'), msg: t('moderateMsg'), healable: false };
};

function App() {
  const { t } = useLanguage();
  const { videoRef, hasPermission, error, startCamera, stopCamera } = useCamera();
  const [status, setStatus] = useState('IDLE');
  const [progress, setProgress] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [signalData, setSignalData] = useState([]);
  const [fps, setFps] = useState(0);
  const [liveAlert, setLiveAlert] = useState(null);

  const [finalBpm, setFinalBpm] = useState(null);
  const [finalHrv, setFinalHrv] = useState(null);
  const [finalStress, setFinalStress] = useState(null);
  const [finalBurnout, setFinalBurnout] = useState(null);
  const [insight, setInsight] = useState(null);
  const [showHealer, setShowHealer] = useState(false);

  const workerRef = useRef(null);
  const overlayRef = useRef(null); 
  const hologramRef = useRef(null); 
  const faceMeshControlsRef = useRef(null); 

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const scanningFrames = useRef(0);
  const lastThumpTime = useRef(0);
  const statusRef = useRef(status);
  
  const tempVitals = useRef({ bpm: null, hrv: null });
  const earSum = useRef(0);
  const earCount = useRef(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./workers/dspWorker.js', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'DSP_RESULT' && statusRef.current !== 'COMPLETED') {
        const { signal, bpm: newBpm, hrv: newHrv } = e.data.payload;
        if(signal) setSignalData(signal);
        
        if (newBpm) {
          tempVitals.current = { bpm: newBpm, hrv: newHrv };
          
          const now = performance.now();
          const msPerBeat = (60 / newBpm) * 1000;
          if (now - lastThumpTime.current > msPerBeat - 100) {
            playThump();
            lastThumpTime.current = now;
          }
        }
      }
    };

    return () => workerRef.current?.terminate();
  }, []);

  const handleStartSystem = () => {
    initAudio();
    setStatus('REQUESTING_CAMERA');
    setInsight(null);
    setLiveAlert(null);
    setFinalBurnout(null);
    earSum.current = 0;
    earCount.current = 0;
    startCamera();
  };

  const handleCancelScan = () => {
    setStatus('IDLE');
    setProgress(0);
    setLiveAlert(null);
    scanningFrames.current = 0;
    earSum.current = 0;
    earCount.current = 0;
    if (faceMeshControlsRef.current) faceMeshControlsRef.current.stop();
    stopCamera();
  };

  // DEVELOPER SHORTCUT: Instantly mock a completed scan
  const handleDevTest = () => {
    stopCamera();
    setStatus('COMPLETED');
    setFinalBpm(115); // High BPM
    setFinalHrv(18);  // Low HRV
    setFinalStress(85); // High Stress
    setFinalBurnout(80); // High Burnout
    setInsight(getHealthInsight(115, 18, 85, t));
  };

  useEffect(() => {
    if (error) {
      setStatus('ERROR');
      return;
    }
    
    if (!hasPermission || !videoRef.current || statusRef.current === 'IDLE') {
      return;
    }

    setStatus('INITIALIZING');

    const onResults = (results) => {
      frameCount.current++;
      const now = performance.now();
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }

      const currentStatus = statusRef.current;

      if (overlayRef.current && videoRef.current) {
        const overlayCanvas = overlayRef.current;
        const ctx = overlayCanvas.getContext('2d');
        if (overlayCanvas.width !== videoRef.current.videoWidth) {
           overlayCanvas.width = videoRef.current.videoWidth;
           overlayCanvas.height = videoRef.current.videoHeight;
        }
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
           drawFaceMesh(ctx, results.multiFaceLandmarks[0], overlayCanvas.width, overlayCanvas.height, currentStatus);
        }
      }

      // Render 3D Hologram
      if (hologramRef.current) {
        const holoCanvas = hologramRef.current;
        const hCtx = holoCanvas.getContext('2d');
        if (holoCanvas.width !== 300) {
          holoCanvas.width = 300;
          holoCanvas.height = 300;
        }
        const faceData = (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) ? results.multiFaceLandmarks[0] : null;
        drawHologram(hCtx, faceData, 300, 300, tempVitals.current.bpm, currentStatus);
      }

      if (currentStatus === 'COMPLETED') return;

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        if (currentStatus === 'INITIALIZING' || currentStatus === 'ERROR' || currentStatus === 'REQUESTING_CAMERA') {
          setStatus('SCANNING');
        }

        const faceMetrics = processFaceData(videoRef.current, results.multiFaceLandmarks);
        
        let shouldPauseScan = false;
        if (faceMetrics) {
          if (faceMetrics.ear) {
            earSum.current += faceMetrics.ear;
            earCount.current += 1;
          }

          if (faceMetrics.isMoving) {
            setLiveAlert('MOTION');
            shouldPauseScan = true;
          } else if (faceMetrics.brightness < 30) {
            setLiveAlert('LOW_LIGHT');
            shouldPauseScan = true;
          } else {
            setLiveAlert(null);
            if (workerRef.current) {
              workerRef.current.postMessage({ 
                type: 'NEW_FRAME', 
                payload: { r: faceMetrics.r, g: faceMetrics.g, b: faceMetrics.b, timestamp: performance.now() } 
              });
            }
          }
        }
        
        if (currentStatus === 'SCANNING') {
          if (!shouldPauseScan) {
            scanningFrames.current++;
          } else {
            scanningFrames.current = Math.max(0, scanningFrames.current - 5);
          }
          
          setProgress(Math.min((scanningFrames.current / 300) * 100, 100));
          
          if (scanningFrames.current >= 300) {
            setStatus('COMPLETED');
            setLiveAlert(null);
            
            let rawBpm = tempVitals.current.bpm || 75;
            let rawHrv = tempVitals.current.hrv || 45;
            
            const clampedBpm = Math.max(45, Math.min(180, rawBpm));
            const clampedHrv = Math.max(15, Math.min(120, rawHrv));
            const stressPercent = Math.round(Math.min(99, Math.max(5, (clampedBpm * 0.4) + (100 - clampedHrv) * 0.5)));
            
            const avgEar = earCount.current > 0 ? earSum.current / earCount.current : 0.28;
            const burnoutPercent = Math.round(Math.max(0, Math.min(100, ((0.30 - avgEar) / 0.12) * 100)));

            setFinalBpm(clampedBpm);
            setFinalHrv(clampedHrv);
            setFinalStress(stressPercent);
            setFinalBurnout(burnoutPercent);
            
            setInsight(getHealthInsight(clampedBpm, clampedHrv, stressPercent, t));
            saveScanResult(clampedBpm, clampedHrv, stressPercent);

            if (faceMeshControlsRef.current) {
              faceMeshControlsRef.current.stop();
            }
            stopCamera();
          }
        }
      } else {
        if (currentStatus === 'SCANNING') {
          setLiveAlert('NO_FACE');
          scanningFrames.current = Math.max(0, scanningFrames.current - 2);
          setProgress(Math.min((scanningFrames.current / 300) * 100, 100));
        }
      }
    };

    faceMeshControlsRef.current = initializeFaceMesh(videoRef.current, onResults);

    return () => {
      if (faceMeshControlsRef.current) faceMeshControlsRef.current.stop();
      stopCamera();
    };
  }, [hasPermission, error, stopCamera, t]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header fps={fps} onOpenHistory={() => setIsHistoryOpen(true)} />
      
      <main className="flex-1 p-4 md:p-6 flex flex-col lg:flex-row gap-6 relative z-10 overflow-y-auto">
        
        {/* The Cyber Mirror */}
        <div className="flex-1 lg:max-w-md xl:max-w-lg relative flex items-center justify-center border border-cyber-border bg-black rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
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
          
          {status !== 'COMPLETED' && status !== 'IDLE' && (
            <>
              <video 
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} 
              />
              <canvas 
                ref={overlayRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-20"
                style={{ transform: 'scaleX(-1)' }} 
              />
            </>
          )}
        </div>

        {/* Metrics & Graph */}
        <div className="flex-1 flex flex-col gap-4 md:gap-6">
          <div className="flex flex-row justify-between flex-wrap gap-4">
            <VitalsCard 
              title={t('heartRate')} 
              value={status === 'COMPLETED' ? finalBpm : null} 
              unit="BPM" 
              status={status === 'COMPLETED' ? (finalBpm > 100 ? t('high') : finalBpm < 60 ? t('low') : t('normal')) : (status === 'IDLE' ? t('standby') : t('scanning'))} 
              color={status === 'COMPLETED' ? (finalBpm > 100 || finalBpm < 60 ? 'orange' : 'cyan') : 'cyan'} 
              range="60 - 100"
            />
            <VitalsCard 
              title={t('heartRateVar')} 
              value={status === 'COMPLETED' ? finalHrv : null} 
              unit="MS" 
              status={status === 'COMPLETED' ? (finalHrv < 20 ? t('low') : finalHrv > 100 ? t('unusual') : t('optimal')) : (status === 'IDLE' ? t('standby') : '--')} 
              color={status === 'COMPLETED' ? (finalHrv < 20 || finalHrv > 100 ? 'orange' : 'blue') : 'blue'} 
              range="20 - 100"
            />
            <VitalsCard 
              title={t('stressLevel')} 
              value={status === 'COMPLETED' ? finalStress : null} 
              unit="%" 
              status={status === 'COMPLETED' ? (finalStress > 60 ? t('high') : t('normal')) : (status === 'IDLE' ? t('standby') : t('analyzing'))} 
              color={status === 'COMPLETED' ? (finalStress > 60 ? 'orange' : 'green') : 'green'} 
              range="0 - 60"
            />
            <VitalsCard 
              title={t('burnoutIndex')} 
              value={status === 'COMPLETED' ? finalBurnout : null} 
              unit="%" 
              status={status === 'COMPLETED' ? (finalBurnout > 50 ? t('fatigueHigh') : t('fatigueNormal')) : (status === 'IDLE' ? t('standby') : '--')} 
              color={status === 'COMPLETED' ? (finalBurnout > 50 ? 'orange' : 'purple') : 'purple'} 
              range="0 - 50"
            />
          </div>
          
          {/* Dynamic Medical Insight Alert */}
          {status === 'COMPLETED' && insight && (
            <div className={`w-full p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in ${insight.bg} ${insight.border} shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
              <div className="flex items-start space-x-4">
                <div className="shrink-0 mt-1">
                  <insight.icon size={24} className={insight.color} />
                </div>
                <div>
                  <h4 className={`text-xs font-black tracking-widest uppercase mb-1 ${insight.color}`}>{insight.title}</h4>
                  <p className="text-gray-300 text-[10px] md:text-xs font-mono leading-relaxed">{insight.msg}</p>
                </div>
              </div>
              
              {insight.healable && (
                <button 
                  onClick={() => setShowHealer(true)}
                  className="shrink-0 btn-cyber px-4 py-2 text-[10px] bg-orange-500/20 text-orange-500 border-orange-500 hover:bg-orange-500/40 hover:shadow-[0_0_15px_#ff8c00] flex items-center space-x-2"
                >
                  <Activity size={14} />
                  <span>{t('healingMode')}</span>
                </button>
              )}
            </div>
          )}

          {status === 'COMPLETED' && (
            <WrappedCard 
              bpm={finalBpm} 
              hrv={finalHrv} 
              stress={finalStress} 
              burnout={finalBurnout} 
            />
          )}

          {/* Lower Section: 3D Hologram + ECG Graph */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-[200px]">
            
            {/* 3D Hologram Twin */}
            <div className="w-full md:w-1/3 bg-black rounded-2xl border border-cyber-border p-4 shadow-lg flex flex-col relative overflow-hidden group">
              <div className="flex items-center justify-between z-10 mb-2">
                <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest pl-2 flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${status === 'COMPLETED' || status === 'IDLE' ? 'bg-gray-600' : 'bg-cyber-purple animate-pulse'}`}></div>
                  <span>{t('digitalTwin')}</span>
                </h3>
                
                <div className="relative group/info cursor-help">
                  <Info size={14} className="text-gray-500 hover:text-cyber-purple transition-colors" />
                  <div className="absolute top-full right-0 mt-2 w-56 opacity-0 group-hover/info:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-cyber-dark border border-cyber-purple/50 p-3 rounded-lg shadow-[0_0_15px_rgba(184,0,255,0.3)] text-left relative">
                      <div className="absolute -top-1.5 right-1 w-3 h-3 bg-cyber-dark border-t border-l border-cyber-purple/50 rotate-45"></div>
                      <h4 className="text-cyber-purple font-bold text-[10px] mb-1">{t('twinInfoTitle')}</h4>
                      <p className="text-gray-300 font-mono text-[9px] leading-relaxed">{t('twinInfoDesc')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 relative rounded-xl overflow-hidden bg-[#07090f] flex items-center justify-center border border-cyber-purple/20 group-hover:border-cyber-purple/50 transition-colors">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
                
                {/* Live Metrics HUD */}
                <div className="absolute top-2 left-2 flex flex-col space-y-1 z-20 pointer-events-none opacity-60">
                   <span className="text-[7px] font-mono text-cyber-purple tracking-widest">{t('twinNodes')}</span>
                   <span className="text-[7px] font-mono text-cyber-purple tracking-widest">{t('twinDepth')}</span>
                </div>

                <canvas 
                  ref={hologramRef} 
                  className="z-10 w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" 
                  style={{ transform: 'scaleX(-1)' }} 
                />
              </div>
            </div>

            {/* Medical ECG Monitor */}
            <div className="flex-1 w-full bg-black rounded-2xl border border-cyber-border p-4 shadow-lg flex flex-col relative overflow-hidden">
              <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4 pl-2 flex items-center space-x-2 z-10">
                <div className={`w-2 h-2 rounded-full ${status === 'COMPLETED' || status === 'IDLE' ? 'bg-gray-600' : 'bg-cyber-cyan animate-pulse'}`}></div>
                <span>{t('ecgScanner')}</span>
              </h3>
              <div className="flex-1 relative rounded-xl overflow-hidden bg-[#001100]">
                <PulseCanvas data={signalData} isCompleted={status === 'COMPLETED' || status === 'IDLE'} />
              </div>
            </div>

          </div>
          
          {/* Spacer for mobile scrolling */}
          <div className="h-32 md:h-12 w-full flex items-center justify-center opacity-30 mt-8 mb-8 pb-12">
             <span className="text-cyber-cyan text-[8px] font-mono tracking-widest uppercase">Powered by Bio-Mirror AI</span>
          </div>
        </div>

      </main>
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      {showHealer && <BioHealer onClose={() => setShowHealer(false)} />}
      
      {/* DEVELOPER FAST-FORWARD BUTTON */}
      {import.meta.env.DEV && (
        <button 
          onClick={handleDevTest}
          className="fixed bottom-4 left-4 z-[9999] bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg opacity-50 hover:opacity-100 transition-opacity"
        >
          [DEV] MOCK SCAN
        </button>
      )}
    </div>
  );
}

export default App;
