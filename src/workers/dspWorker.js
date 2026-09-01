let buffer = [];
const BUFFER_SIZE = 300; // 5 seconds at 60fps

// Simple moving average for smoothing
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
      // 1. POS Algorithm (Plane-Orthogonal-to-Skin)
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

      // 2. Advanced Bandpass Equivalent Filter
      const smoothed = smooth(posSignal, 5); // Low pass
      const baseline = smooth(posSignal, 35); // High pass
      const filtered = smoothed.map((val, i) => val - baseline[i]);

      // 3. Robust Peak Detection (Find R-peaks)
      let peaks = [];
      let threshold = Math.max(...filtered) * 0.45; // Dynamic threshold based on signal strength
      
      for(let i = 2; i < filtered.length - 2; i++){
        if(filtered[i] > filtered[i-1] && filtered[i] > filtered[i-2] && 
           filtered[i] > filtered[i+1] && filtered[i] > filtered[i+2] && 
           filtered[i] > threshold) {
           peaks.push(i);
        }
      }

      // Filter peaks that are too close (Minimum distance 15 frames @ 60fps = max 240 BPM)
      let validPeaks = [];
      for (let i = 0; i < peaks.length; i++) {
         if (validPeaks.length === 0 || (peaks[i] - validPeaks[validPeaks.length - 1]) >= 15) {
            validPeaks.push(peaks[i]);
         }
      }

      let bpm = null;
      let hrv = null;
      
      // 4. Medical-Grade Calculation (RMSSD & Inter-Beat Intervals)
      if (validPeaks.length > 2) {
         let intervals = [];
         for (let i = 1; i < validPeaks.length; i++) {
            intervals.push((validPeaks[i] - validPeaks[i-1]) * (1000 / 60)); // Convert frames to MS
         }
         
         // Average IBI -> BPM
         const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
         let calculatedBpm = Math.round(60000 / avgInterval);
         
         if (calculatedBpm >= 40 && calculatedBpm <= 180) {
            bpm = calculatedBpm;
         }

         // RMSSD (Root Mean Square of Successive Differences) for precise HRV
         let sumSqDiff = 0;
         for (let i = 1; i < intervals.length; i++) {
            sumSqDiff += Math.pow(intervals[i] - intervals[i-1], 2);
         }
         hrv = Math.round(Math.sqrt(sumSqDiff / (intervals.length - 1)));
      }

      self.postMessage({
        type: 'DSP_RESULT',
        payload: {
          signal: filtered,
          bpm: bpm,
          hrv: hrv
        }
      });
    }
  }
};
