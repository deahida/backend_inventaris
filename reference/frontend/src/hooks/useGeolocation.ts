import { useState, useCallback } from 'react';
import { isWithinAttendanceRadius } from '@/utils/geofence';

export type GeolocationStatus =
  | 'idle'
  | 'requesting'
  | 'success'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'error';

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  distance: number;
  withinRadius: boolean;
}

export interface UseGeolocationReturn {
  status: GeolocationStatus;
  error: string | null;
  result: GeolocationResult | null;
  requestLocation: () => void;
  reset: () => void;
}

/**
 * React hook for browser Geolocation API via navigator.geolocation.getCurrentPosition().
 *
 * Validates the user's position against the Pro.com store geofence.
 * GPS coordinates are ready to be sent to the Laravel API alongside the selfie.
 */
export function useGeolocation(): UseGeolocationReturn {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeolocationResult | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
  }, []);

  const requestLocation = useCallback(() => {
    setError(null);
    setResult(null);

    if (!navigator.geolocation) {
      setStatus('unavailable');
      setError('Browser Anda tidak mendukung GPS/Lokasi. Gunakan browser modern seperti Chrome atau Firefox.');
      return;
    }

    setStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const { distance, withinRadius } = isWithinAttendanceRadius(latitude, longitude);

        setResult({ latitude, longitude, accuracy, distance, withinRadius });
        setStatus('success');
        setError(null);
      },
      (err) => {
        switch (err.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            setStatus('denied');
            setError(
              'Izin lokasi diperlukan untuk absensi. Harap aktifkan izin lokasi di pengaturan browser Anda.'
            );
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            setStatus('unavailable');
            setError(
              'Lokasi tidak dapat dideteksi saat ini. Pastikan GPS aktif dan coba lagi.'
            );
            break;
          case GeolocationPositionError.TIMEOUT:
            setStatus('timeout');
            setError('Waktu habis saat mendeteksi lokasi. Pastikan GPS aktif dan coba lagi.');
            break;
          default:
            setStatus('error');
            setError('Gagal mendapatkan lokasi. Silakan coba lagi.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0,
      }
    );
  }, []);

  return { status, error, result, requestLocation, reset };
}
