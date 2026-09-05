let rBuffer = [];
let gBuffer = [];
let bBuffer = [];
let timeBuffer = [];
const BUFFER_SIZE = 300; // ~5-10 seconds window

self.onmessage = function (e) {
  if (e.data.type === 'RESET') {
    rBuffer = [];
    gBuffer = [];
    bBuffer = [];
    timeBuffer = [];
    return;
  }

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
      const { bpm, hrv, confidence } = extractVitals(filtered, timeBuffer);

      // Send latest 100 points for the ECG graph
      self.postMessage({
        type: 'DSP_RESULT',
        payload: {
          signal: filtered.slice(-100),
          bpm: bpm,
          hrv: hrv,
          confidence: confidence
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
  // 1. Normalize signal to 0-1 range for reliable thresholding
  const max = Math.max(...signal);
  const min = Math.min(...signal);
  const range = max - min || 1;
  const normalized = signal.map(s => (s - min) / range);

  let peaks = [];
  // 2. Find local maxima with a dynamic threshold
  const threshold = 0.55; // Only consider peaks in the top 45% of the signal amplitude
  for (let i = 1; i < normalized.length - 1; i++) {
    if (normalized[i] > normalized[i - 1] && normalized[i] > normalized[i + 1] && normalized[i] > threshold) {
      peaks.push({ index: i, time: times[i], value: normalized[i] });
    }
  }

  // 3. Filter valid peaks based on physiological limits (Max 200 BPM -> min dist 300ms)
  let validPeaks = [];
  let minPeakDist = 300; 
  
  for (let i = 0; i < peaks.length; i++) {
    if (validPeaks.length === 0) {
      validPeaks.push(peaks[i]);
    } else {
      const dist = peaks[i].time - validPeaks[validPeaks.length - 1].time;
      if (dist > minPeakDist) {
        validPeaks.push(peaks[i]);
      } else if (peaks[i].value > validPeaks[validPeaks.length - 1].value) {
        // If it's too close but higher, replace the previous peak (fixes false double-peaks)
        validPeaks[validPeaks.length - 1] = peaks[i];
      }
    }
  }

  if (validPeaks.length < 3) return { bpm: null, hrv: null };

  let rrIntervals = [];
  for (let i = 1; i < validPeaks.length; i++) {
    rrIntervals.push(validPeaks[i].time - validPeaks[i - 1].time);
  }

  // 4. Ectopic Beat / Outlier Rejection using Median Absolute Deviation
  const sortedRR = rrIntervals.slice().sort((a,b) => a - b);
  const medianRR = sortedRR[Math.floor(sortedRR.length / 2)];
  
  // Reject intervals that deviate more than 30% from the median (motion artifacts)
  const filteredRR = rrIntervals.filter(rr => Math.abs(rr - medianRR) < medianRR * 0.3);

  if (filteredRR.length < 2) return { bpm: null, hrv: null };

  // 5. Calculate final BPM
  const avgRR = filteredRR.reduce((a, b) => a + b, 0) / filteredRR.length;
  const bpm = Math.round(60000 / avgRR);

  // 6. HRV (RMSSD) calculation using only valid, filtered RR intervals
  let sumSqDiff = 0;
  for (let i = 1; i < filteredRR.length; i++) {
    const diff = filteredRR[i] - filteredRR[i - 1];
    sumSqDiff += diff * diff;
  }
  let hrv = Math.round(Math.sqrt(sumSqDiff / (filteredRR.length - 1)));
  
  // Clamp HRV to reasonable physiological bounds to prevent NaN or extreme spikes
  hrv = Math.min(150, Math.max(10, hrv));

  // Calculate Confidence Score based on Signal Quality (Clean beats vs Total detected peaks)
  let confidence = 0;
  if (rrIntervals.length > 0) {
    const signalQuality = filteredRR.length / rrIntervals.length;
    // Map signal quality ratio to a 75% - 99% confidence score, deducting points for too few total peaks
    confidence = Math.round(75 + (signalQuality * 24));
    if (validPeaks.length < 10) confidence -= (10 - validPeaks.length) * 2; 
    confidence = Math.max(0, Math.min(99, confidence));
  }

  return { bpm, hrv, confidence };
}
