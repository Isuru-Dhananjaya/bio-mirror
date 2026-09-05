import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { startAmbientMusic, updateAmbientMusic, stopAmbientMusic, toggleMute, getIsMuted, initAudio } from '../utils/audioHelper';
import HolographicHead from './HolographicHead';

export default function BioHealer({ onClose, userBpm = 75 }) {
  const { t } = useLanguage();
  const [muted, setMuted] = useState(() => getIsMuted());
  
  // Smart Breathing Logic based on user BPM
  // Normal cycle is 4-2-6. If highly stressed (BPM > 90), we start slightly faster
  // so the user can comfortably catch the rhythm, and we slow it down gradually.
  const [cycleConfig, setCycleConfig] = useState(() => {
    if (userBpm > 100) return { inhale: 3, hold: 1, exhale: 4 }; // Stressed: 8s cycle
    if (userBpm > 85) return { inhale: 4, hold: 2, exhale: 5 };  // Elevated: 11s cycle
    return { inhale: 4, hold: 2, exhale: 6 };                    // Normal: 12s cycle
  });

  const [state, setState] = useState({
    phase: 'ready',
    timer: 3,
    quoteIndex: 1,
    cyclesCompleted: 0
  });

  const lastPlayedPhase = useRef(null);

  // Start continuous ambient drone on mount, stop on unmount
  useEffect(() => {
    initAudio();
    startAmbientMusic();
    return () => {
      stopAmbientMusic();
    };
  }, []);

  // Update ambient drone parameters based on breath phase
  useEffect(() => {
    if (state.phase !== lastPlayedPhase.current) {
      lastPlayedPhase.current = state.phase;
      updateAmbientMusic(state.phase);
    }
  }, [state.phase]);

  // Gradually slow down the cycle config every 2 cycles to guide user to relaxation
  useEffect(() => {
    if (state.cyclesCompleted > 0 && state.cyclesCompleted % 2 === 0) {
      setCycleConfig(current => {
        const nextInhale = Math.min(current.inhale + 1, 5);
        const nextHold = Math.min(current.hold + 1, 2);
        const nextExhale = Math.min(current.exhale + 1, 8);
        return { inhale: nextInhale, hold: nextHold, exhale: nextExhale };
      });
    }
  }, [state.cyclesCompleted]);

  useEffect(() => {
    const interval = setInterval(() => {
      setState((s) => {
        if (s.timer > 1) {
          return { ...s, timer: s.timer - 1 };
        } else {
          // Transition Logic based on Dynamic Cycle Config
          if (s.phase === 'ready') {
            return { ...s, phase: 'inhale', timer: cycleConfig.inhale };
          } else if (s.phase === 'inhale') {
            return { ...s, phase: 'hold', timer: cycleConfig.hold };
          } else if (s.phase === 'hold') {
            return { ...s, phase: 'exhale', timer: cycleConfig.exhale };
          } else {
            return { 
              phase: 'inhale', 
              timer: cycleConfig.inhale, 
              quoteIndex: (s.quoteIndex % 5) + 1,
              cyclesCompleted: s.cyclesCompleted + 1
            };
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cycleConfig]);

  const handleToggleSound = () => {
    const newMuted = toggleMute();
    setMuted(newMuted);
    if (!newMuted) {
      startAmbientMusic();
      updateAmbientMusic(state.phase);
    }
  };

  const getPhaseText = () => {
    if (state.phase === 'ready') return t('ready');
    if (state.phase === 'inhale') return t('inhale');
    if (state.phase === 'hold') return t('hold');
    return t('exhale');
  };

  const getTransformStyle = () => {
    if (state.phase === 'ready') return { transform: 'scale(1.1)', transition: 'transform 3s ease-in-out' };
    if (state.phase === 'inhale') return { transform: 'scale(2.4)', transition: `transform ${cycleConfig.inhale}s ease-in-out` };
    if (state.phase === 'hold') return { transform: 'scale(2.4)', transition: `transform ${cycleConfig.hold}s linear` };
    return { transform: 'scale(0.8)', transition: `transform ${cycleConfig.exhale}s ease-in-out` };
  };

  const getGlowColors = () => {
    // Nature-inspired soft colors
    if (state.phase === 'ready') return 'from-teal-300 to-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.2)]';
    if (state.phase === 'inhale') return 'from-emerald-300 to-teal-500 shadow-[0_0_60px_rgba(52,211,153,0.3)]'; // Forest/Leaves
    if (state.phase === 'hold') return 'from-amber-200 to-orange-400 shadow-[0_0_60px_rgba(251,191,36,0.3)]'; // Sunrise/Warmth
    return 'from-sky-300 to-blue-500 shadow-[0_0_60px_rgba(125,211,252,0.3)]'; // Sky/Ocean
  };

  const getTextColor = () => {
    if (state.phase === 'ready') return 'text-teal-200 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]';
    if (state.phase === 'inhale') return 'text-emerald-100 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]';
    if (state.phase === 'hold') return 'text-amber-100 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]';
    return 'text-sky-100 drop-shadow-[0_0_8px_rgba(125,211,252,0.8)]';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050b0a]/95 flex flex-col items-center justify-center backdrop-blur-3xl overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className={`absolute w-[150vw] h-[150vw] md:w-[100vw] md:h-[100vw] rounded-full blur-[140px] transition-colors duration-[3000ms] opacity-20 ${state.phase === 'ready' ? 'bg-teal-700' : state.phase === 'inhale' ? 'bg-emerald-600' : state.phase === 'hold' ? 'bg-amber-600' : 'bg-sky-600'}`}></div>

      {/* Top Controls */}
      <div className="absolute top-6 right-6 flex items-center space-x-3 z-50">
        <button 
          onClick={handleToggleSound}
          title={muted ? t('muted') : t('audio')}
          className="text-gray-400 hover:text-white p-2.5 bg-gray-900/60 rounded-full transition-all hover:scale-110 border border-gray-700/80 backdrop-blur-md"
        >
          {muted ? <VolumeX size={20} className="text-red-400" /> : <Volume2 size={20} className="text-teal-300" />}
        </button>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white p-2.5 bg-gray-900/60 rounded-full transition-all hover:scale-110 border border-gray-700/80 backdrop-blur-md"
        >
          <X size={20} />
        </button>
      </div>

      <div className="text-center mb-20 z-20">
        <h2 className="text-xl md:text-2xl font-light tracking-[0.3em] text-white/90 uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          NATURAL HEALING
        </h2>
        <p className="text-gray-400/80 font-mono text-[10px] md:text-xs mt-3 uppercase tracking-[0.4em]">
          Deep Relaxation Rhythm
        </p>
      </div>

      {/* Sacred Geometry Hologram replaced with Meditating Human Visual */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-16">
        
        {/* Dynamic Breathing Visuals */}
        <HolographicHead phase={state.phase} cycleConfig={cycleConfig} />

        {/* Text inside the Hologram (Fixed position so it doesn't scale) */}
        <div className="absolute z-20 text-center pointer-events-none flex flex-col items-center justify-center">
          <div className={`font-light tracking-[0.3em] text-sm md:text-base uppercase transition-colors duration-[3000ms] ${getTextColor()}`}>
            {getPhaseText()}
          </div>
          <div className="text-white/90 font-light text-4xl md:text-5xl mt-2 drop-shadow-[0_2px_15px_rgba(255,255,255,0.4)]">
            {state.timer}
          </div>
        </div>
      </div>

      {/* Mindfulness Rotator / Preparation Prompt */}
      <div className="absolute bottom-16 w-full max-w-2xl px-6 text-center z-20">
        <div className="min-h-[80px] flex items-center justify-center">
          {state.phase === 'ready' ? (
            <p className="text-teal-200 text-base md:text-xl font-light tracking-wide animate-fade-in drop-shadow-[0_0_15px_rgba(45,212,191,0.4)] leading-relaxed">
              "{t('readyPrompt')}"
            </p>
          ) : (
            <p 
              key={state.quoteIndex} 
              className="text-gray-100 text-lg md:text-2xl font-light tracking-wide animate-fade-in drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] leading-relaxed"
            >
              "{t(`quote${state.quoteIndex}`)}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
