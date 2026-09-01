let buffer = [];
const BUFFER_SIZE = 300; // 5 seconds at 60fps

// Simple moving average
function smooth(data, windowSize) {
  let result = [];
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
      sum += data[j];
      count++;
    }
    result.push(sum / count);
  }
  return result;
}

// Standard Deviation
function std(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

self.onmessage = function (e) {
  const { type, payload } = e.data;
  
  if (type === 'NEW_FRAME') {
    buffer.push(payload);
    if (buffer.length > BUFFER_SIZE) {
      buffer.shift();
    }

    if (buffer.length >= 60) {
      // POS Algorithm (Plane-Orthogonal-to-Skin)
      const meanR = buffer.reduce((acc, val) => acc + val.r, 0) / buffer.length;
      const meanG = buffer.reduce((acc, val) => acc + val.g, 0) / buffer.length;
      const meanB = buffer.reduce((acc, val) => acc + val.b, 0) / buffer.length;

      const X = [];
      const Y = [];

      for (let i = 0; i < buffer.length; i++) {
        const rNorm = buffer[i].r / meanR;
        const gNorm = buffer[i].g / meanG;
        const bNorm = buffer[i].b / meanB;

        X.push(gNorm - bNorm);
        Y.push(gNorm + bNorm - 2 * rNorm);
      }

      const stdX = std(X);
      const stdY = Math.max(std(Y), 0.0001); 
      const alpha = stdX / stdY;

      const posSignal = [];
      for (let i = 0; i < buffer.length; i++) {
        posSignal.push(X[i] + alpha * Y[i]);
      }

      // Simple bandpass filter equivalent (Smooth + Baseline subtraction)
      const smoothed = smooth(posSignal, 5);
      const baseline = smooth(posSignal, 30);
      const filtered = smoothed.map((val, i) => val - baseline[i]);

      // Simple Peak Detection
      let peaks = 0;
      for(let i = 1; i < filtered.length - 1; i++){
        // Look for local maxima above a threshold
        if(filtered[i] > filtered[i-1] && filtered[i] > filtered[i+1] && filtered[i] > 0.01){
           peaks++;
        }
      }
      
      const seconds = buffer.length / 60;
      let bpm = Math.round((peaks / seconds) * 60);

      self.postMessage({
        type: 'DSP_RESULT',
        payload: {
          signal: filtered,
          bpm: (bpm > 40 && bpm < 180) ? bpm : null,
          hrv: bpm ? Math.round(Math.random() * 20 + 40) : null // Mock HRV for now
        }
      });
    }
  }
};
