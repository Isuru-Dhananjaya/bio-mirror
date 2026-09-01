import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

export function initializeFaceMesh(videoElement, onResultsCallback) {
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
  
  // Draw the current video frame to the hidden canvas
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  const getAverageColor = (cx, cy, size = 15) => {
    const x = Math.max(0, Math.floor(cx * canvas.width) - Math.floor(size / 2));
    const y = Math.max(0, Math.floor(cy * canvas.height) - Math.floor(size / 2));
    
    // Ensure we don't go out of bounds
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
  // 10: Forehead, 234: Left Cheek, 454: Right Cheek
  const forehead = getAverageColor(face[10].x, face[10].y, 20);
  const leftCheek = getAverageColor(face[234].x, face[234].y, 20);
  const rightCheek = getAverageColor(face[454].x, face[454].y, 20);

  // Combine the ROIs
  return {
    r: (forehead.r + leftCheek.r + rightCheek.r) / 3,
    g: (forehead.g + leftCheek.g + rightCheek.g) / 3,
    b: (forehead.b + leftCheek.b + rightCheek.b) / 3,
    timestamp: performance.now()
  };
}
