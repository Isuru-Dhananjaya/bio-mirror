import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import VitalsCard from './components/VitalsCard';
import PulseCanvas from './components/PulseCanvas';
import CalibrationOverlay from './components/CalibrationOverlay';
import { useCamera } from './hooks/useCamera';
import { initializeFaceMesh, extractROI } from './vision/faceTracking';
import { initAudio, playThump } from './utils/audioHelper';

function App() {
  const { videoRef, hasPermission } = useCamera();
  const [status, setStatus] = useState('INITIALIZING');
  const [progress, setProgress] = useState(0);
  const [bpm, setBpm] = useState(null);
  const [hrv, setHrv] = useState(null);
  const [signalData, setSignalData] = useState([]);
  const [fps, setFps] = useState(0);

  const workerRef = useRef(null);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const scanningFrames = useRef(0);
  const lastThumpTime = useRef(0);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./workers/dspWorker.js', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'DSP_RESULT') {
        const { signal, bpm: newBpm, hrv: newHrv } = e.data.payload;
        setSignalData(signal);
        
        if (newBpm) {
          setBpm(newBpm);
          setHrv(newHrv);
          
          // Naive rate limiting for the heartbeat sound (approximate spacing based on BPM)
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
    if (!hasPermission || !videoRef.current) return;

    let faceMeshControls;

    const onResults = (results) => {
      // Calculate real-time FPS
      frameCount.current++;
      const now = performance.now();
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        if (status === 'INITIALIZING' || status === 'ERROR') setStatus('SCANNING');
        
        if (status === 'SCANNING') {
          scanningFrames.current++;
          setProgress(Math.min((scanningFrames.current / 150) * 100, 100)); // ~2.5 seconds at 60fps
          if (scanningFrames.current >= 150) {
            setStatus('READY');
          }
        }

        // Extract RGB Region of Interest (ROI)
        const roi = extractROI(videoRef.current, results.multiFaceLandmarks);
        if (roi && workerRef.current) {
          workerRef.current.postMessage({ type: 'NEW_FRAME', payload: roi });
        }
      } else {
        setStatus('ERROR');
        scanningFrames.current = 0;
        setProgress(0);
        setBpm(null);
      }
    };

    faceMeshControls = initializeFaceMesh(videoRef.current, onResults);

    return () => {
      if (faceMeshControls) faceMeshControls.stop();
    };
  }, [hasPermission, status]);

  // We must init audio context strictly on user interaction
  const handleStart = () => {
    initAudio();
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-cyber-dark text-cyber-green" onClick={handleStart}>
      <CalibrationOverlay status={status} progress={progress} />
      
      <Header fps={fps} />
      
      <main className="flex-1 p-4 flex flex-col gap-4 relative z-10">
        {/* Camera Feed hidden but used as source */}
        <video 
          ref={videoRef}
          className="absolute opacity-0 pointer-events-none w-1 h-1"
        />

        <div className="flex-1 w-full max-h-[50vh]">
          <PulseCanvas data={signalData} />
        </div>
        
        <div className="flex flex-row justify-around flex-wrap gap-4 pt-4">
          <VitalsCard title="Heart Rate" value={bpm} unit="BPM" status={bpm ? 'NORMAL' : 'CALCULATING...'} />
          <VitalsCard title="HRV" value={hrv} unit="MS" status={hrv ? 'OPTIMAL' : '--'} />
          <VitalsCard title="Stress Level" value={bpm ? (bpm > 90 ? 'HIGH' : 'LOW') : null} status="BASED ON HRV" />
        </div>
      </main>
      
      <div className="absolute bottom-2 right-4 text-cyber-dim text-[10px] font-mono z-50">
        Click anywhere to enable audio sync.
      </div>
    </div>
  );
}

export default App;
