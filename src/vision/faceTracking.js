export const initializeFaceMesh = (videoElement, onResultsCallback) => {
  const FaceMesh = window.FaceMesh;

  const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: false, // Turned off to drastically boost FPS
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  faceMesh.onResults(onResultsCallback);

  let isRunning = true;
  let lastVideoTime = -1;

  const tick = async () => {
    if (!isRunning) return;
    
    // Only process if the video has a new frame to save CPU
    if (videoElement && videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
      if (videoElement.currentTime !== lastVideoTime) {
        lastVideoTime = videoElement.currentTime;
        try {
          await faceMesh.send({ image: videoElement });
        } catch (err) {
          console.error("FaceMesh Error:", err);
        }
      }
    }
    requestAnimationFrame(tick);
  };

  tick();

  return {
    stop: () => {
      isRunning = false;
      faceMesh.close();
    }
  };
};

let roiCanvas = null;
let lastNose = null;

// Helper to get 2D distance
const getDist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

// Calculate Eye Aspect Ratio (EAR) for a single eye
const calculateEAR = (landmarks, indices) => {
  const p1 = landmarks[indices[0]];
  const p2 = landmarks[indices[1]];
  const p3 = landmarks[indices[2]];
  const p4 = landmarks[indices[3]];
  const p5 = landmarks[indices[4]];
  const p6 = landmarks[indices[5]];

  const vertical1 = getDist(p2, p6);
  const vertical2 = getDist(p3, p5);
  const horizontal = getDist(p1, p4);

  return (vertical1 + vertical2) / (2.0 * horizontal);
};

export const processFaceData = (videoElement, multiFaceLandmarks) => {
  if (!multiFaceLandmarks || !multiFaceLandmarks[0]) return null;
  const landmarks = multiFaceLandmarks[0];

  // 1. Live Motion Tracking (Nose Tip: index 1)
  const nose = landmarks[1];
  let isMoving = false;
  if (lastNose) {
    const dist = getDist(nose, lastNose);
    if (dist > 0.008) isMoving = true;
  }
  lastNose = { x: nose.x, y: nose.y };

  // 2. Eye Aspect Ratio (EAR) for Burnout/Fatigue Detection
  // Left eye indices: 33, 160, 158, 133, 153, 144
  // Right eye indices: 362, 385, 387, 263, 373, 380
  const leftEAR = calculateEAR(landmarks, [33, 160, 158, 133, 153, 144]);
  const rightEAR = calculateEAR(landmarks, [362, 385, 387, 263, 373, 380]);
  const avgEAR = (leftEAR + rightEAR) / 2.0;

  // 3. Dynamic Masking (Tight Forehead Bounding Box)
  if (!roiCanvas) {
    roiCanvas = document.createElement('canvas');
    roiCanvas.width = 64;
    roiCanvas.height = 64;
  }
  const ctx = roiCanvas.getContext('2d', { willReadFrequently: true });
  
  // Strict forehead landmarks (excluding eyebrows & hair)
  const top = Math.min(landmarks[10].y, landmarks[109].y);
  const bottom = landmarks[9].y;
  const left = landmarks[109].x;
  const right = landmarks[338].x;

  const x = Math.max(0, left * videoElement.videoWidth);
  const y = Math.max(0, top * videoElement.videoHeight);
  const w = (right - left) * videoElement.videoWidth;
  const h = (bottom - top) * videoElement.videoHeight;

  if (w <= 0 || h <= 0) return null;

  ctx.drawImage(videoElement, x, y, w, h, 0, 0, 64, 64);
  const imgData = ctx.getImageData(0, 0, 64, 64).data;

  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < imgData.length; i += 4) {
    r += imgData[i];
    g += imgData[i + 1];
    b += imgData[i + 2];
    count++;
  }

  const avgR = r / count;
  const avgG = g / count;
  const avgB = b / count;

  // 4. Smart Light Detector (Luminance)
  const brightness = (avgR + avgG + avgB) / 3;

  return { r: avgR, g: avgG, b: avgB, brightness, isMoving, ear: avgEAR };
};

// NEW: Visual Face Tracking HUD
export function drawFaceMesh(ctx, face, width, height, status) {
  if (!face) return;
  
  const isScanning = status === 'SCANNING';
  const isCompleted = status === 'COMPLETED';
  
  const color = isScanning ? '#00f0ff' : (isCompleted ? '#00ff41' : '#b800ff');
  const bgColor = isScanning ? 'rgba(0, 240, 255, 0.4)' : (isCompleted ? 'rgba(0, 255, 65, 0.4)' : 'rgba(184, 0, 255, 0.4)');

  // Draw ROI Measurement Nodes
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.fillStyle = bgColor;
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;

  const drawNode = (index) => {
    ctx.beginPath();
    ctx.arc(face[index].x * width, face[index].y * height, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  };
  
  // Forehead and Cheeks (Where blood flow is extracted)
  drawNode(10);
  drawNode(234);
  drawNode(454);
  
  // Face Bounding Target
  const minX = Math.min(...face.map(p => p.x)) * width - 20;
  const maxX = Math.max(...face.map(p => p.x)) * width + 20;
  const minY = Math.min(...face.map(p => p.y)) * height - 20;
  const maxY = Math.max(...face.map(p => p.y)) * height + 20;
  
  const boxW = maxX - minX;
  const boxH = maxY - minY;

  // Targeting Brackets
  ctx.shadowBlur = 0;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  const len = 30;
  
  ctx.beginPath(); ctx.moveTo(minX, minY + len); ctx.lineTo(minX, minY); ctx.lineTo(minX + len, minY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(maxX - len, minY); ctx.lineTo(maxX, minY); ctx.lineTo(maxX, minY + len); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(minX, maxY - len); ctx.lineTo(minX, maxY); ctx.lineTo(minX + len, maxY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(maxX - len, maxY); ctx.lineTo(maxX, maxY); ctx.lineTo(maxX, maxY - len); ctx.stroke();

  // Scanning Laser Animation
  if (isScanning) {
    const scanY = minY + ((performance.now() / 15) % boxH);
    ctx.beginPath();
    ctx.moveTo(minX, scanY);
    ctx.lineTo(maxX, scanY);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

// NEW: Extreme WOW 3D Digital Twin Hologram
export function drawHologram(ctx, face, width, height, bpm, status) {
  ctx.clearRect(0, 0, width, height);

  if (!face || status === 'IDLE' || status === 'REQUESTING_CAMERA') {
    ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText("AWAITING BIOMETRICS", width / 2, height / 2);
    return;
  }

  // Determine Hologram Color based on Heart Rate
  let r = 0, g = 240, b = 255; // Default: Cyber Cyan
  if (bpm && bpm > 90) { 
    r = 255; g = 80; b = 0; // High BPM: Orange/Red Glow
  } else if (bpm && bpm > 75) { 
    r = 0; g = 255; b = 65; // Moderate: Cyber Green Glow
  }

  // Find face boundaries to scale and center the 3D model
  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  face.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const faceWidth = maxX - minX;
  
  // Scale factor to fit inside the canvas beautifully
  const scale = (width * 0.7) / faceWidth;

  // Draw 3D Point Cloud
  face.forEach((point, i) => {
    // Normalize, Scale, and Center
    const x = (point.x - centerX) * scale + (width / 2);
    const y = (point.y - centerY) * scale + (height / 2);
    
    // Z coordinate provides true 3D depth (closer to camera = bigger/brighter)
    const depth = Math.max(0.1, 1 - (point.z * 5)); 
    const size = depth * 1.5;
    const opacity = Math.max(0.15, depth);

    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    
    // Add heavy glowing effect to select key points for sci-fi look
    if (i % 8 === 0) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
    } else {
      ctx.shadowBlur = 0;
    }
    
    ctx.fill();
  });
}
