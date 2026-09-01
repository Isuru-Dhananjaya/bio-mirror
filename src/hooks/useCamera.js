import { useState, useEffect, useRef } from 'react';

export function useCamera() {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null;

    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
            frameRate: { ideal: 60, max: 60 }
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Note: Needs to be muted and playsInline for some mobile browsers
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.play();
        }
        setHasPermission(true);
      } catch (err) {
        console.error('Camera error:', err);
        setError(err.message || 'Camera access denied');
        setHasPermission(false);
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { videoRef, hasPermission, error };
}
