let audioCtx;
let isMuted = false;
let ambientNodes = null;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const getIsMuted = () => isMuted;

export const playThump = () => {
  if (!audioCtx || isMuted) return;
  
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    // Deep sub-bass frequencies for a realistic thump
    osc.frequency.setValueAtTime(45, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
  } catch(e) {
    console.error("Audio playback interrupted", e);
  }
};

export const startAmbientMusic = () => {
  if (!audioCtx) initAudio();
  if (ambientNodes || isMuted) return;

  try {
    const root = 136.1; // Om frequency (Deep relaxation)
    const masterGain = audioCtx.createGain();
    const now = audioCtx.currentTime;
    
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.3, now + 3);
    masterGain.connect(audioCtx.destination);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);
    filter.connect(masterGain);

    // Create 3 harmonic oscillators for a warm, natural pad sound
    const oscs = [root/2, root, root * 1.5].map(freq => {
      const osc = audioCtx.createOscillator();
      osc.type = 'triangle'; // Warm, soft wave
      const oscGain = audioCtx.createGain();
      oscGain.gain.value = 0.3; 
      osc.frequency.value = freq;
      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      return { osc, oscGain };
    });

    // Slow LFO for gentle phasing like the wind/ocean
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05; // 20s sweep
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 50; 
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    ambientNodes = { masterGain, filter, oscs, lfo };
  } catch (e) {
    console.error("Ambient audio error", e);
  }
};

export const updateAmbientMusic = (phase) => {
  if (!ambientNodes || !audioCtx) return;
  const now = audioCtx.currentTime;
  const { filter, masterGain } = ambientNodes;

  try {
    filter.frequency.cancelScheduledValues(now);
    masterGain.gain.cancelScheduledValues(now);
    
    // Smooth volume and brightness transitions that match the breath
    if (phase === 'inhale') {
      filter.frequency.linearRampToValueAtTime(600, now + 4);
      masterGain.gain.linearRampToValueAtTime(0.4, now + 4);
    } else if (phase === 'hold') {
      filter.frequency.linearRampToValueAtTime(600, now + 2);
      masterGain.gain.linearRampToValueAtTime(0.4, now + 2);
    } else if (phase === 'exhale') {
      filter.frequency.linearRampToValueAtTime(150, now + 6);
      masterGain.gain.linearRampToValueAtTime(0.15, now + 6);
    } else if (phase === 'ready') {
      filter.frequency.linearRampToValueAtTime(250, now + 3);
      masterGain.gain.linearRampToValueAtTime(0.2, now + 3);
    }
  } catch(e) {}
};

export const stopAmbientMusic = () => {
  if (!ambientNodes || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    ambientNodes.masterGain.gain.cancelScheduledValues(now);
    ambientNodes.masterGain.gain.linearRampToValueAtTime(0, now + 1);
    
    const nodesToClean = ambientNodes;
    ambientNodes = null;

    setTimeout(() => {
      try {
        nodesToClean.oscs.forEach(({osc}) => osc.stop());
        nodesToClean.lfo.stop();
      } catch(e) {}
    }, 1500);
  } catch(e) {}
};

export const toggleMute = () => {
  isMuted = !isMuted;
  if (isMuted) {
    stopAmbientMusic();
  }
  return isMuted;
};
