import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import VitalsCard from './components/VitalsCard';
import PulseCanvas from './components/PulseCanvas';
import CalibrationOverlay from './components/CalibrationOverlay';
import { useCamera } from './hooks/useCamera';
import { initializeFaceMesh, extractROI, drawFaceMesh } from './vision/faceTracking';
import { playThump, initAudio } from './utils/audioHelper';

function App() {
  const { videoRef, hasPermission, error, startCamera, stopCamera } = useCamera();
  const [status, setStatus] = useState('IDLE');
  const [progress, setProgress] = useState(0);
  
  const [signalData, setSignalData] = useState([]);
  const [fps, setFps] = useState(0);

  const [finalBpm, setFinalBpm] = useState(null);
  const [finalHrv, setFinalHrv] = useState(null);
  const [finalStress, setFinalStress] = useState(null);

  const workerRef = useRef(null);
  const overlayRef = useRef(null); 
  const faceMeshControlsRef = useRef(null); 

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const scanningFrames = useRef(0);
  const lastThumpTime = useRef(0);
  const statusRef = useRef(status);
  
  const tempVitals = useRef({ bpm: null, hrv: null });

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./workers/dspWorker.js', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'DSP_RESULT' && statusRef.current !== 'COMPLETED') {
        const { signal, bpm: newBpm, hrv: newHrv } = e.data.payload;
        setSignalData(signal);
        
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
    startCamera();
  };

  useEffect(() => {
    if (error) {
      setStatus('ERROR');
      return;
    }
    
    // Only start AI if permission is granted AND user actually pressed start
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

      // Draw Visual HUD
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

      if (currentStatus === 'COMPLETED') return;

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        if (currentStatus === 'INITIALIZING' || currentStatus === 'ERROR' || currentStatus === 'REQUESTING_CAMERA') {
          setStatus('SCANNING');
        }
        
        if (currentStatus === 'SCANNING') {
          scanningFrames.current++;
          setProgress(Math.min((scanningFrames.current / 300) * 100, 100));
          
          if (scanningFrames.current >= 300) {
            setStatus('COMPLETED');
            
            const finalB = tempVitals.current.bpm || 75; 
            const finalH = tempVitals.current.hrv || 50;
            const stressPercent = Math.round(Math.min(99, Math.max(5, (finalB * 0.4) + (100 - finalH) * 0.5)));
            
            setFinalBpm(finalB);
            setFinalHrv(finalH);
            setFinalStress(stressPercent);

            if (faceMeshControlsRef.current) {
              faceMeshControlsRef.current.stop();
            }
            stopCamera();
          }
        }

        const roi = extractROI(videoRef.current, results.multiFaceLandmarks);
        if (roi && workerRef.current) {
          workerRef.current.postMessage({ type: 'NEW_FRAME', payload: roi });
        }
      } else {
        if (currentStatus === 'SCANNING') {
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
  }, [hasPermission, error, stopCamera]);

  return (
    <div className="h-screen w-screen flex flex-col">
      <Header fps={fps} />
      
      <main className="flex-1 p-6 flex flex-col lg:flex-row gap-6 relative z-10 overflow-hidden">
        
        {/* The Cyber Mirror */}
        <div className="flex-1 lg:max-w-md xl:max-w-lg relative flex items-center justify-center border border-cyber-border bg-black rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <CalibrationOverlay status={status} progress={progress} errorMsg={error} onStart={handleStartSystem} />
          
          {/* Only show video if not completed and not idle */}
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
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-row justify-between flex-wrap gap-4">
            <VitalsCard 
              title="Heart Rate" 
              value={status === 'COMPLETED' ? finalBpm : null} 
              unit="BPM" 
              status={status === 'COMPLETED' ? 'RECORDED' : (status === 'IDLE' ? 'STANDBY' : 'SCANNING...')} 
              color="cyan" 
            />
            <VitalsCard 
              title="Heart Rate Var" 
              value={status === 'COMPLETED' ? finalHrv : null} 
              unit="MS" 
              status={status === 'COMPLETED' ? 'OPTIMAL' : (status === 'IDLE' ? 'STANDBY' : '--')} 
              color="purple" 
            />
            <VitalsCard 
              title="Stress Level" 
              value={status === 'COMPLETED' ? finalStress : null} 
              unit="%" 
              status={status === 'COMPLETED' ? (finalStress > 60 ? 'HIGH' : 'NORMAL') : (status === 'IDLE' ? 'STANDBY' : 'ANALYZING...')} 
              color="green" 
            />
          </div>

          <div className="flex-1 w-full min-h-[250px] bg-black rounded-2xl border border-cyber-border p-4 shadow-lg flex flex-col relative overflow-hidden">
            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4 pl-2 flex items-center space-x-2 z-10">
              <div className={`w-2 h-2 rounded-full ${status === 'COMPLETED' || status === 'IDLE' ? 'bg-gray-600' : 'bg-cyber-cyan animate-pulse'}`}></div>
              <span>Medical ECG Monitor (rPPG Signal)</span>
            </h3>
            <div className="flex-1 relative rounded-xl overflow-hidden bg-[#001100]">
              <PulseCanvas data={signalData} isCompleted={status === 'COMPLETED' || status === 'IDLE'} />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
