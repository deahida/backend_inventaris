import { useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, Loader2, CameraOff, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { useCamera } from '@/hooks/useCamera';

interface CameraCaptureProps {
  /** Called when a photo is captured successfully */
  onCapture: (imageDataUrl: string) => void;
  /** Called when user cancels camera */
  onCancel?: () => void;
}

/**
 * CameraCapture component — displays a live camera preview, allows
 * photo capture, preview, and retake.
 *
 * Uses the useCamera hook (navigator.mediaDevices.getUserMedia).
 * The captured image is a base64 JPEG data URL that can later be
 * converted to a Blob and sent via multipart/form-data to Laravel.
 */
export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const {
    status,
    error,
    capturedImage,
    videoRef,
    canvasRef,
    startCamera,
    capturePhoto,
    retakePhoto,
    stopCamera,
  } = useCamera();

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When image is captured, notify parent
  useEffect(() => {
    if (status === 'captured' && capturedImage) {
      onCapture(capturedImage);
    }
  }, [status, capturedImage, onCapture]);

  return (
    <div className="space-y-4">
      {/* ── VIDEO / PREVIEW AREA ── */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {/* Live video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={clsx(
            'absolute inset-0 w-full h-full object-cover',
            // Mirror for selfie feel
            'scale-x-[-1]',
            status !== 'active' && 'hidden'
          )}
        />

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Captured image preview */}
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Foto selfie"
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />
        )}

        {/* States overlay */}
        {status === 'requesting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <Loader2 className="h-10 w-10 animate-spin mb-3 text-indigo-400" />
            <p className="text-sm font-medium">Memuat kamera...</p>
            <p className="text-xs text-gray-400 mt-1">Harap izinkan akses kamera</p>
          </div>
        )}

        {status === 'idle' && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <Camera className="h-10 w-10 mb-3 text-gray-400" />
            <p className="text-sm text-gray-300">Kamera belum aktif</p>
          </div>
        )}

        {/* Capture guide frame (only while camera is active) */}
        {status === 'active' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-44 h-56 border-2 border-white/50 rounded-full opacity-60" />
          </div>
        )}

        {/* Checkmark badge on captured */}
        {status === 'captured' && capturedImage && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* ── ERROR STATES ── */}
      {(status === 'denied' || status === 'unavailable' || status === 'error') && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
          {status === 'denied'
            ? <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            : status === 'unavailable'
            ? <CameraOff className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            : <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          }
          <div>
            <p className="text-sm font-medium text-red-800">
              {status === 'denied' ? 'Izin Kamera Ditolak' : status === 'unavailable' ? 'Kamera Tidak Tersedia' : 'Kesalahan Kamera'}
            </p>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── ACTIONS ── */}
      <div className="flex gap-3 justify-center">
        {status === 'active' && (
          <Button
            onClick={capturePhoto}
            size="lg"
            className="w-full"
          >
            <Camera className="h-5 w-5 mr-2" />
            Ambil Foto
          </Button>
        )}

        {status === 'captured' && capturedImage && (
          <>
            <Button variant="outline" onClick={retakePhoto} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Ulangi
            </Button>
            <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-md flex items-center justify-center gap-2 text-sm font-medium text-emerald-700 py-2">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Foto Berhasil Diambil
            </div>
          </>
        )}

        {(status === 'denied' || status === 'unavailable' || status === 'error' || status === 'idle') && (
          <Button onClick={startCamera} className="flex-1">
            <Camera className="h-4 w-4 mr-2" />
            {status === 'idle' ? 'Buka Kamera' : 'Coba Lagi'}
          </Button>
        )}

        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Batal
          </Button>
        )}
      </div>

      {status === 'active' && (
        <p className="text-xs text-center text-gray-400">
          Pastikan wajah Anda terlihat jelas di dalam bingkai
        </p>
      )}
    </div>
  );
}
