let rBuffer = [];
let gBuffer = [];
let bBuffer = [];
let timeBuffer = [];
const BUFFER_SIZE = 300; // ~5-10 seconds window

self.onmessage = function (e) {
  if (e.data.type === 'NEW_FRAME') {
    const { r, g, b, timestamp } = e.data.payload;
    
    rBuffer.push(r);
    gBuffer.push(g);
    bBuffer.push(b);
    timeBuffer.push(timestamp);

    if (rBuffer.length > BUFFER_SIZE) {
      rBuffer.shift();
      gBuffer.shift();
      bBuffer.shift();
      timeBuffer.shift();
    }

    // Need at least ~2 seconds of data to run CHROM
    if (rBuffer.length > 60) {
      const chromSignal = applyCHROM(rBuffer, gBuffer, bBuffer);
      const filtered = bandpassFilter(chromSignal, 0.75, 3.0); // 45 to 180 BPM
      const { bpm, hrv } = extractVitals(filtered, timeBuffer);

      // Send latest 100 points for the ECG graph
      self.postMessage({
        type: 'DSP_RESULT',
        payload: {
          signal: filtered.slice(-100),
          bpm: bpm,
          hrv: hrv
        }
      });
    }
  }
};

// CHROM Algorithm (Chrominance-based method for rPPG)
function applyCHROM(R, G, B) {
  const meanR = R.reduce((a, b) => a + b, 0) / R.length;
  const meanG = G.reduce((a, b) => a + b, 0) / G.length;
  const meanB = B.reduce((a, b) => a + b, 0) / B.length;

  const X = [];
  const Y = [];
  
  for (let i = 0; i < R.length; i++) {
    const rn = R[i] / (meanR || 1);
    const gn = G[i] / (meanG || 1);
    const bn = B[i] / (meanB || 1);

    // X = 3Rn - 2Gn, Y = 1.5Rn + Gn - 1.5Bn
    X.push(3 * rn - 2 * gn);
    Y.push(1.5 * rn + gn - 1.5 * bn);
  }

  const stdX = standardDeviation(X);
  const stdY = standardDeviation(Y);
  const alpha = stdX / (stdY || 1);

  // S = X - alpha * Y
  return X.map((x, i) => x - alpha * Y[i]);
}

function standardDeviation(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

function bandpassFilter(signal, lowCut, highCut) {
  // Simple moving average bandpass (Approximation for Edge Computing)
  const windowSize = 5;
  let smoothed = [];
  
  // Lowpass
  for (let i = 0; i < signal.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - windowSize); j <= i; j++) {
      sum += signal[j];
      count++;
    }
    smoothed.push(sum / count);
  }

  // Highpass (Subtract moving average of larger window)
  const largeWindow = 30;
  let filtered = [];
  for (let i = 0; i < smoothed.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - largeWindow); j <= i; j++) {
      sum += smoothed[j];
      count++;
    }
    filtered.push(smoothed[i] - (sum / count));
  }
  return filtered;
}

function extractVitals(signal, times) {
  let peaks = [];
  // Find local maxima
  for (let i = 1; i < signal.length - 1; i++) {
    if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1] && signal[i] > 0) {
      peaks.push({ index: i, time: times[i], value: signal[i] });
    }
  }

  // Filter valid peaks
  let validPeaks = [];
  let minPeakDist = 300; // ms (Max 200 BPM)
  
  for (let i = 0; i < peaks.length; i++) {
    if (validPeaks.length === 0 || (peaks[i].time - validPeaks[validPeaks.length - 1].time) > minPeakDist) {
      validPeaks.push(peaks[i]);
    }
  }

  if (validPeaks.length < 3) return { bpm: null, hrv: null };

  let rrIntervals = [];
  for (let i = 1; i < validPeaks.length; i++) {
    rrIntervals.push(validPeaks[i].time - validPeaks[i - 1].time);
  }

  // BPM calculation
  const avgRR = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
  const bpm = Math.round(60000 / avgRR);

  // HRV (RMSSD) calculation
  let sumSqDiff = 0;
  for (let i = 1; i < rrIntervals.length; i++) {
    const diff = rrIntervals[i] - rrIntervals[i - 1];
    sumSqDiff += diff * diff;
  }
  const hrv = Math.round(Math.sqrt(sumSqDiff / (rrIntervals.length - 1)));

  return { bpm, hrv };
}
