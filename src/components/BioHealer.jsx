import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { startAmbientMusic, updateAmbientMusic, stopAmbientMusic, toggleMute, getIsMuted, initAudio } from '../utils/audioHelper';

export default function BioHealer({ onClose }) {
  const { t } = useLanguage();
  const [muted, setMuted] = useState(() => getIsMuted());
  
  // State with gentle preparation phase ('ready' -> 'inhale' -> 'hold' -> 'exhale')
  const [state, setState] = useState({
    phase: 'ready',
    timer: 3,
    quoteIndex: 1
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

  useEffect(() => {
    const interval = setInterval(() => {
      setState((s) => {
        if (s.timer > 1) {
          return { ...s, timer: s.timer - 1 };
        } else {
          // Transition Logic: 3s Ready -> 4s Inhale -> 2s Hold -> 6s Exhale
          if (s.phase === 'ready') {
            return { ...s, phase: 'inhale', timer: 4 };
          } else if (s.phase === 'inhale') {
            return { ...s, phase: 'hold', timer: 2 };
          } else if (s.phase === 'hold') {
            return { ...s, phase: 'exhale', timer: 6 };
          } else {
            return { phase: 'inhale', timer: 4, quoteIndex: (s.quoteIndex % 5) + 1 };
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
    if (state.phase === 'inhale') return { transform: 'scale(2.4)', transition: 'transform 4s ease-in-out' };
    if (state.phase === 'hold') return { transform: 'scale(2.4)', transition: 'transform 2s linear' };
    return { transform: 'scale(0.8)', transition: 'transform 6s ease-in-out' };
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

      {/* Sacred Geometry Hologram */}
      <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mb-16">
        
        {/* Dynamic Breathing Mandala */}
        <div 
          className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center z-10 rounded-full"
          style={getTransformStyle()}
        >
          
          {/* Layer 1: Liquid Lotus Petals (Spinning slowly) */}
          <div className={`absolute inset-[-20%] rounded-[40%] bg-gradient-to-tr opacity-[0.35] blur-[3px] animate-[spin_10s_linear_infinite] transition-colors duration-[3000ms] ${getGlowColors()}`}></div>
          
          {/* Layer 2: Counter-spinning Petals */}
          <div className={`absolute inset-[-10%] rounded-[45%] bg-gradient-to-bl opacity-[0.45] blur-[2px] animate-[spin_15s_linear_infinite_reverse] transition-colors duration-[3000ms] ${getGlowColors()}`}></div>
          
          {/* Layer 3: Inner Sacred Ring */}
          <div className="absolute inset-2 rounded-[35%] border border-white/20 animate-[spin_25s_linear_infinite]"></div>
          <div className="absolute inset-4 rounded-full border border-white/10 border-dashed animate-[spin_20s_linear_infinite_reverse]"></div>

          {/* Solid Glowing Core */}
          <div className="absolute inset-6 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center">
            {/* Core Pulse */}
            <div className={`absolute inset-0 rounded-full animate-ping opacity-30 bg-gradient-to-t transition-colors duration-[3000ms] ${getGlowColors()}`} style={{ animationDuration: '3s' }}></div>
          </div>
        </div>

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
