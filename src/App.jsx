import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import PulseCanvas from './components/PulseCanvas';
import CalibrationOverlay from './components/CalibrationOverlay';
import HistoryModal from './components/HistoryModal';
import BioHealer from './components/BioHealer';
import LiveScanner from './components/LiveScanner';
import ResultSummary from './components/ResultSummary';
import HologramEcg from './components/HologramEcg';
import AboutModal from './components/AboutModal';
import UserProfileModal from './components/UserProfileModal';
import { useCamera } from './hooks/useCamera';
import { initializeFaceMesh, drawFaceMesh, drawHologram, processFaceData } from './vision/faceTracking';
import { playThump, initAudio } from './utils/audioHelper';
import { saveScanResult } from './utils/storageHelper';
import { Info, AlertCircle, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { getHealthInsight } from './utils/healthLogic';

function App() {
  const { t } = useLanguage();
  const { userProfile } = useAuth();
  const { videoRef, hasPermission, error, startCamera, stopCamera } = useCamera();
  const [status, setStatus] = useState('IDLE'); // IDLE | REQUESTING_PROFILE | REQUESTING_CAMERA | INITIALIZING | CALIBRATING | SCANNING | COMPLETED | ERROR
  const [progress, setProgress] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [signalData, setSignalData] = useState([]);
  const [fps, setFps] = useState(0);
  const [liveAlert, setLiveAlert] = useState(null);

  const [finalBpm, setFinalBpm] = useState(null);
  const [finalHrv, setFinalHrv] = useState(null);
  const [finalStress, setFinalStress] = useState(null);
  const [finalBurnout, setFinalBurnout] = useState(null);
  const [finalConfidence, setFinalConfidence] = useState(null);
  const [insight, setInsight] = useState(null);
  const [showHealer, setShowHealer] = useState(false);

  useEffect(() => {
    const openAbout = () => setIsAboutOpen(true);
    const openProfile = () => setIsProfileModalOpen(true);
    window.addEventListener('open-about', openAbout);
    window.addEventListener('open-profile', openProfile);
    return () => {
      window.removeEventListener('open-about', openAbout);
      window.removeEventListener('open-profile', openProfile);
    };
  }, []);

  const workerRef = useRef(null);
  const overlayRef = useRef(null); 
  const hologramRef = useRef(null); 
  const faceMeshControlsRef = useRef(null); 

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const scanningFrames = useRef(0);
  const calibratingFrames = useRef(0);
  const lastThumpTime = useRef(0);
  const statusRef = useRef(status);
  
  const tempVitals = useRef({ bpm: null, hrv: null, confidence: null });
  const earSum = useRef(0);
  const earCount = useRef(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./workers/dspWorker.js', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'DSP_RESULT' && statusRef.current !== 'COMPLETED') {
        const { signal, bpm: newBpm, hrv: newHrv, confidence } = e.data.payload;
        if(signal) setSignalData(signal);
        
        if (newBpm) {
          tempVitals.current = { bpm: newBpm, hrv: newHrv, confidence };
          
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

  useEffect(() => {
    if (status === 'COMPLETED' && finalBpm !== null) {
      let age = 25;
      let gender = 'male';
      let height = null;
      let weight = null;
      try {
        const savedProfile = localStorage.getItem('bioMirrorProfile');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          age = parsed.age || 25;
          gender = parsed.gender || 'male';
          height = parsed.height || null;
          weight = parsed.weight || null;
        }
      } catch (e) {}
      setInsight(getHealthInsight(finalBpm, finalHrv, finalStress, finalBurnout, t, age, gender, height, weight));
    }
  }, [t, status, finalBpm, finalHrv, finalStress, finalBurnout]);

  const handleStartSystem = (forceStart = false) => {
    // Prevent event object from being truthy
    const isForced = forceStart === true;
    if (!userProfile && !isForced) {
      setIsProfileModalOpen(true);
      return;
    }
    initAudio();
    
    // FULL RESET FOR NEW SCAN
    workerRef.current?.postMessage({ type: 'RESET' });
    setStatus('REQUESTING_CAMERA');
    setProgress(0);
    setInsight(null);
    setLiveAlert(null);
    setFinalBpm(null);
    setFinalHrv(null);
    setFinalStress(null);
    setFinalBurnout(null);
    setFinalConfidence(null);
    setSignalData([]);
    
    scanningFrames.current = 0;
    calibratingFrames.current = 0;
    earSum.current = 0;
    earCount.current = 0;
    tempVitals.current = { bpm: null, hrv: null, confidence: null };
    
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
    setInsight(getHealthInsight(115, 18, 85, 80, t));
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
        let activeStatus = currentStatus;
        if (currentStatus === 'INITIALIZING' || currentStatus === 'ERROR' || currentStatus === 'REQUESTING_CAMERA') {
          setStatus('CALIBRATING');
          activeStatus = 'CALIBRATING';
        }

        const faceMetrics = processFaceData(videoRef.current, results.multiFaceLandmarks);
        
        let shouldPauseScan = false;
        if (faceMetrics) {
          // Ignore blinks (< 0.15) so we get the true resting eyelid state
          if (faceMetrics.ear && faceMetrics.ear > 0.15) {
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

        if (activeStatus === 'CALIBRATING') {
          if (!shouldPauseScan) {
            calibratingFrames.current++;
          }
          setProgress(Math.min((calibratingFrames.current / 150) * 100, 100)); // 5 seconds calibration
          
          if (calibratingFrames.current >= 150) {
            setStatus('SCANNING');
            setProgress(0);
          }
        } else if (activeStatus === 'SCANNING') {
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
            
            // Eye Fatigue based on resting eyelid openness (0.30 = fully open, 0.22 = drooped/tired)
            const eyeFatigue = Math.max(0, Math.min(100, ((0.30 - avgEar) / 0.08) * 100));
            // Systemic Fatigue based on Heart Rate Variability (Low HRV = tired system)
            const hrvFatigue = Math.max(0, Math.min(100, (100 - clampedHrv)));
            
            // Burnout is a balanced combination of Eye droopiness (60%) and Systemic stress (40%)
            const burnoutPercent = Math.round((eyeFatigue * 0.6) + (hrvFatigue * 0.4));
            setFinalBpm(clampedBpm);
            setFinalHrv(clampedHrv);
            setFinalStress(stressPercent);
            setFinalBurnout(burnoutPercent);
            
            const rawConfidence = tempVitals.current.confidence || 85;
            setFinalConfidence(rawConfidence);
            
            // Extract from local storage to avoid stale closures
            let age = 25;
            let gender = 'male';
            let height = null;
            let weight = null;
            try {
              const savedProfile = localStorage.getItem('bioMirrorProfile');
              if (savedProfile) {
                const parsed = JSON.parse(savedProfile);
                age = parsed.age || 25;
                gender = parsed.gender || 'male';
                height = parsed.height || null;
                weight = parsed.weight || null;
              }
            } catch (e) {
              console.error(e);
            }
            
            setInsight(getHealthInsight(clampedBpm, clampedHrv, stressPercent, burnoutPercent, t, age, gender, height, weight));
            saveScanResult(clampedBpm, clampedHrv, stressPercent, rawConfidence);

            if (faceMeshControlsRef.current) {
              faceMeshControlsRef.current.stop();
            }
            stopCamera();
          }
        }
      } else {
        if (currentStatus === 'SCANNING' || currentStatus === 'CALIBRATING') {
          setLiveAlert('NO_FACE');
          if (currentStatus === 'SCANNING') {
            scanningFrames.current = Math.max(0, scanningFrames.current - 2);
            setProgress(Math.min((scanningFrames.current / 300) * 100, 100));
          }
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
        
        <LiveScanner 
          status={status} 
          progress={progress} 
          error={error} 
          liveAlert={liveAlert} 
          signalData={signalData} 
          videoRef={videoRef} 
          overlayRef={overlayRef} 
          hologramRef={hologramRef} 
          handleStartSystem={handleStartSystem} 
          handleCancelScan={handleCancelScan} 
        />

        {/* Metrics & Graph */}
        <div className="flex-1 flex flex-col gap-4 md:gap-6">
          <ResultSummary 
            status={status}
            finalBpm={finalBpm}
            finalHrv={finalHrv}
            finalStress={finalStress}
            finalBurnout={finalBurnout}
            finalConfidence={finalConfidence}
            insight={insight}
            setShowHealer={setShowHealer}
            onScanAgain={handleStartSystem}
          />

          {/* Lower Section: 3D Hologram + ECG Graph */}
          <HologramEcg 
            status={status} 
            hologramRef={hologramRef} 
            signalData={signalData} 
          />
          
          {/* Spacer for mobile scrolling */}
          <div className="h-12 w-full flex items-center justify-center opacity-30 mt-4 pb-4">
             <span className="text-cyber-cyan text-[8px] font-mono tracking-widest uppercase">Powered by Bio-Mirror</span>
          </div>
        </div>

      </main>
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        onComplete={() => { setIsProfileModalOpen(false); handleStartSystem(true); }} 
      />
      {showHealer && <BioHealer onClose={() => setShowHealer(false)} userBpm={finalBpm} />}
      
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
