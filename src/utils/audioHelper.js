let audioCtx;
let isMuted = false;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const toggleMute = () => {
  isMuted = !isMuted;
  return isMuted;
};

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
