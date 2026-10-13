import { useState, useRef, useCallback, useEffect } from 'react';

export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'captured'
  | 'denied'
  | 'unavailable'
  | 'error';

export interface UseCameraReturn {
  status: CameraStatus;
  error: string | null;
  capturedImage: string | null; // base64 data URL
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  startCamera: () => Promise<void>;
  capturePhoto: () => void;
  retakePhoto: () => void;
  stopCamera: () => void;
}

/**
 * React hook for browser camera access via navigator.mediaDevices.getUserMedia().
 *
 * Prefers the front-facing camera (facingMode: 'user').
 * Captured image is returned as a base64 data URL (ready for multipart/form-data
 * upload to Laravel by converting to Blob when the API is integrated).
 */
export function useCamera(): UseCameraReturn {
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Stop stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setError(null);
    setCapturedImage(null);

    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('unavailable');
      setError('Browser Anda tidak mendukung akses kamera. Gunakan browser modern seperti Chrome atau Firefox.');
      return;
    }

    setStatus('requesting');

    try {
      // Request front-facing camera; fall back to any camera
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch {
        // Retry without facingMode constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      setStatus('active');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {
          // Autoplay may be blocked; not critical
        });
      }
    } catch (err: unknown) {
      stopCamera();
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setStatus('denied');
          setError('Izin kamera diperlukan untuk melakukan absensi. Harap aktifkan izin kamera di pengaturan browser Anda.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setStatus('unavailable');
          setError('Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera yang terhubung.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setStatus('error');
          setError('Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi lain dan coba lagi.');
        } else {
          setStatus('error');
          setError(`Gagal mengakses kamera: ${err.message}`);
        }
      } else {
        setStatus('error');
        setError('Terjadi kesalahan saat mengakses kamera. Silakan coba lagi.');
      }
    }
  }, [stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the image (front camera shows mirrored — capture as-is)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    setStatus('captured');
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setStatus('idle');
  }, []);

  return {
    status,
    error,
    capturedImage,
    videoRef,
    canvasRef,
    startCamera,
    capturePhoto,
    retakePhoto,
    stopCamera,
  };
}
