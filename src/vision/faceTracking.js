export function initializeFaceMesh(videoElement, onResultsCallback) {
  const FaceMesh = window.FaceMesh;
  const Camera = window.Camera;

  const faceMesh = new FaceMesh({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  faceMesh.onResults(onResultsCallback);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });

  camera.start();

  return {
    stop: () => {
      camera.stop();
      faceMesh.close();
    }
  };
}

// Temporary canvas for pixel extraction
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

export function extractROI(videoElement, landmarks) {
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;
  
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  const getAverageColor = (cx, cy, size = 15) => {
    const x = Math.max(0, Math.floor(cx * canvas.width) - Math.floor(size / 2));
    const y = Math.max(0, Math.floor(cy * canvas.height) - Math.floor(size / 2));
    
    if (x + size > canvas.width || y + size > canvas.height) return {r:0, g:0, b:0};
    
    const imgData = ctx.getImageData(x, y, size, size).data;
    
    let r = 0, g = 0, b = 0;
    let count = 0;
    for (let i = 0; i < imgData.length; i += 4) {
      r += imgData[i];
      g += imgData[i + 1];
      b += imgData[i + 2];
      count++;
    }
    return { r: r / count, g: g / count, b: b / count };
  };

  if (!landmarks || landmarks.length === 0) return null;
  
  const face = landmarks[0];
  const forehead = getAverageColor(face[10].x, face[10].y, 20);
  const leftCheek = getAverageColor(face[234].x, face[234].y, 20);
  const rightCheek = getAverageColor(face[454].x, face[454].y, 20);

  return {
    r: (forehead.r + leftCheek.r + rightCheek.r) / 3,
    g: (forehead.g + leftCheek.g + rightCheek.g) / 3,
    b: (forehead.b + leftCheek.b + rightCheek.b) / 3,
    timestamp: performance.now()
  };
}

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
