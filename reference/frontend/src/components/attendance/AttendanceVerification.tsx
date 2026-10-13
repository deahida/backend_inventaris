import { useState, useCallback } from 'react';
import { CheckCircle2, Circle, Camera, MapPin, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CameraCapture } from './CameraCapture';
import { LocationVerification } from './LocationVerification';

type Step = 'camera' | 'location' | 'confirm';

interface LocationResult {
  latitude: number;
  longitude: number;
  distance: number;
  withinRadius: boolean;
}

export interface VerificationResult {
  photo: string; // base64 data URL (for future multipart upload to Laravel)
  latitude: number;
  longitude: number;
  distance: number;
}

interface AttendanceVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  /** "Check In" or "Check Out" */
  mode: 'in' | 'out';
  /** Called with verification data when user confirms */
  onConfirm: (result: VerificationResult) => void;
}

const stepLabels: Record<Step, string> = {
  camera: 'Kamera',
  location: 'Lokasi GPS',
  confirm: 'Konfirmasi',
};

const steps: Step[] = ['camera', 'location', 'confirm'];

/**
 * AttendanceVerification modal — multi-step wizard:
 * 1. Camera selfie capture
 * 2. GPS location verification
 * 3. Summary & confirmation
 *
 * The Confirm button is only enabled when BOTH camera and GPS pass.
 */
export function AttendanceVerification({
  isOpen,
  onClose,
  mode,
  onConfirm,
}: AttendanceVerificationProps) {
  const [currentStep, setCurrentStep] = useState<Step>('camera');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [locationResult, setLocationResult] = useState<LocationResult | null>(null);

  const cameraVerified = !!capturedPhoto;
  const locationVerified = !!(locationResult?.withinRadius);
  const canConfirm = cameraVerified && locationVerified;

  const handleClose = () => {
    // Reset all state on close
    setCapturedPhoto(null);
    setLocationResult(null);
    setCurrentStep('camera');
    onClose();
  };

  const handleCameraCapture = useCallback((dataUrl: string) => {
    setCapturedPhoto(dataUrl);
  }, []);

  const handleLocationResult = useCallback((result: LocationResult | null) => {
    setLocationResult(result);
  }, []);

  const handleConfirm = () => {
    if (!capturedPhoto || !locationResult) return;
    onConfirm({
      photo: capturedPhoto,
      latitude: locationResult.latitude,
      longitude: locationResult.longitude,
      distance: locationResult.distance,
    });
    handleClose();
  };

  const goToStep = (step: Step) => setCurrentStep(step);

  const modeLabel = mode === 'in' ? 'Check In' : 'Check Out';
  const modeColor = mode === 'in' ? 'indigo' : 'amber';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Verifikasi Absensi — ${modeLabel}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* ── STEP INDICATOR ── */}
        <div className="flex items-center gap-0">
          {steps.map((step, idx) => {
            const isActive = currentStep === step;
            const isDone =
              (step === 'camera' && cameraVerified) ||
              (step === 'location' && locationVerified) ||
              (step === 'confirm' && canConfirm);
            const isClickable = idx === 0 || (idx === 1 && cameraVerified) || (idx === 2 && cameraVerified);

            return (
              <div key={step} className="flex items-center flex-1">
                <button
                  onClick={() => isClickable && goToStep(step)}
                  disabled={!isClickable}
                  className={clsx(
                    'flex flex-col items-center gap-1 flex-1 transition-colors',
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  )}
                >
                  <div
                    className={clsx(
                      'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
                      isActive
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : isDone
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    )}
                  >
                    {isDone && !isActive
                      ? <CheckCircle2 className="h-4 w-4" />
                      : idx + 1
                    }
                  </div>
                  <span
                    className={clsx(
                      'text-xs font-medium',
                      isActive ? 'text-indigo-600' : isDone ? 'text-emerald-600' : 'text-gray-400'
                    )}
                  >
                    {stepLabels[step]}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div
                    className={clsx(
                      'h-0.5 flex-shrink-0 w-8 mt-[-16px]',
                      (step === 'camera' && cameraVerified) || (step === 'location' && locationVerified)
                        ? 'bg-emerald-400'
                        : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── STEP CONTENT ── */}
        <div className="min-h-[300px]">
          {currentStep === 'camera' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="h-4 w-4 text-indigo-500" />
                <h4 className="text-sm font-semibold text-gray-700">Langkah 1: Ambil Selfie</h4>
              </div>
              <CameraCapture onCapture={handleCameraCapture} />
              {cameraVerified && (
                <Button
                  className="w-full"
                  onClick={() => goToStep('location')}
                >
                  Lanjut ke Verifikasi Lokasi →
                </Button>
              )}
            </div>
          )}

          {currentStep === 'location' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-indigo-500" />
                <h4 className="text-sm font-semibold text-gray-700">Langkah 2: Verifikasi Lokasi GPS</h4>
              </div>
              <LocationVerification onResult={handleLocationResult} />
              {locationVerified && (
                <Button
                  className="w-full"
                  onClick={() => goToStep('confirm')}
                >
                  Lanjut ke Konfirmasi →
                </Button>
              )}
            </div>
          )}

          {currentStep === 'confirm' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                <h4 className="text-sm font-semibold text-gray-700">Langkah 3: Konfirmasi Absensi</h4>
              </div>

              {/* Verification summary */}
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-700">Ringkasan Verifikasi</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {/* Camera row */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={clsx('p-1.5 rounded-lg', cameraVerified ? 'bg-emerald-100' : 'bg-gray-100')}>
                        <Camera className={clsx('h-4 w-4', cameraVerified ? 'text-emerald-600' : 'text-gray-400')} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Kamera</p>
                        <p className={clsx('text-xs', cameraVerified ? 'text-emerald-600' : 'text-gray-400')}>
                          {cameraVerified ? 'Foto berhasil diambil' : 'Belum selesai'}
                        </p>
                      </div>
                    </div>
                    {cameraVerified
                      ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      : <Circle className="h-5 w-5 text-gray-300" />
                    }
                  </div>

                  {/* Location row */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={clsx('p-1.5 rounded-lg', locationVerified ? 'bg-emerald-100' : 'bg-gray-100')}>
                        <MapPin className={clsx('h-4 w-4', locationVerified ? 'text-emerald-600' : 'text-gray-400')} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Lokasi GPS</p>
                        <p className={clsx('text-xs', locationVerified ? 'text-emerald-600' : locationResult && !locationResult.withinRadius ? 'text-red-500' : 'text-gray-400')}>
                          {locationResult?.withinRadius
                            ? `Dalam area absensi (${locationResult.distance} meter)`
                            : locationResult
                            ? `Di luar area (${locationResult.distance} meter)`
                            : 'Belum selesai'}
                        </p>
                      </div>
                    </div>
                    {locationVerified
                      ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      : <Circle className="h-5 w-5 text-gray-300" />
                    }
                  </div>

                  {/* Distance row */}
                  {locationResult && (
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                      <p className="text-sm text-gray-500">Jarak dari lokasi toko</p>
                      <p className="text-sm font-semibold text-gray-800">{locationResult.distance} meter</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selfie thumbnail */}
              {capturedPhoto && (
                <div className="flex items-center gap-3">
                  <img
                    src={capturedPhoto}
                    alt="Foto selfie"
                    className="h-16 w-16 rounded-lg object-cover border border-gray-200 scale-x-[-1]"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Foto Selfie</p>
                    <p className="text-xs text-gray-500">Akan dikirim bersama data absensi</p>
                  </div>
                </div>
              )}

              {/* Not within radius warning */}
              {locationResult && !locationResult.withinRadius && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700 font-medium">Verifikasi Lokasi Gagal</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Anda harus berada di lokasi Pro.com untuk melakukan absensi.
                    Kembali ke langkah Lokasi GPS untuk mencoba lagi.
                  </p>
                </div>
              )}

              {/* Confirm button */}
              <Button
                className={clsx(
                  'w-full',
                  modeColor === 'amber'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400'
                    : ''
                )}
                disabled={!canConfirm}
                onClick={handleConfirm}
                size="lg"
              >
                <ShieldCheck className="h-5 w-5 mr-2" />
                {canConfirm ? `Konfirmasi ${modeLabel}` : 'Selesaikan Verifikasi Terlebih Dahulu'}
              </Button>

              {!canConfirm && (
                <p className="text-xs text-center text-gray-400">
                  {!cameraVerified && !locationVerified
                    ? 'Kamera dan Lokasi GPS belum diverifikasi'
                    : !cameraVerified
                    ? 'Kembali ke langkah Kamera'
                    : 'Kembali ke langkah Lokasi GPS'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
