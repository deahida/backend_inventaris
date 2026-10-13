import { useEffect } from 'react';
import { MapPin, Loader2, AlertCircle, ShieldAlert, WifiOff, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGeolocation } from '@/hooks/useGeolocation';
import { STORE_LOCATION, ATTENDANCE_RADIUS_METERS } from '@/utils/geofence';

interface LocationVerificationProps {
  /** Called with location result — null means verification failed */
  onResult: (result: { latitude: number; longitude: number; distance: number; withinRadius: boolean } | null) => void;
}

/**
 * LocationVerification component — requests GPS position and validates
 * it against the Pro.com store geofence.
 *
 * Shows real-time feedback: coordinates, distance from store, and
 * whether the user is inside the allowed area.
 */
export function LocationVerification({ onResult }: LocationVerificationProps) {
  const { status, error, result, requestLocation, reset } = useGeolocation();

  // Notify parent whenever result changes
  useEffect(() => {
    if (status === 'success' && result) {
      onResult({
        latitude: result.latitude,
        longitude: result.longitude,
        distance: result.distance,
        withinRadius: result.withinRadius,
      });
    } else if (status !== 'idle' && status !== 'requesting') {
      // Failed state — clear parent result
      onResult(null);
    }
  }, [status, result, onResult]);

  const handleRetry = () => {
    reset();
    onResult(null);
    requestLocation();
  };

  return (
    <div className="space-y-4">
      {/* ── INFO CARD ── */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium text-gray-700">Lokasi Toko</p>
        </div>
        <p className="text-xs text-gray-500 ml-6">{STORE_LOCATION.address}</p>
        <p className="text-xs text-gray-400 ml-6 mt-0.5">Radius absensi: {ATTENDANCE_RADIUS_METERS} meter</p>
      </div>

      {/* ── IDLE ── */}
      {status === 'idle' && (
        <Button onClick={requestLocation} className="w-full">
          <MapPin className="h-4 w-4 mr-2" />
          Deteksi Lokasi
        </Button>
      )}

      {/* ── REQUESTING ── */}
      {status === 'requesting' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Mendeteksi lokasi...</p>
            <p className="text-xs text-blue-600 mt-0.5">Harap izinkan akses lokasi GPS</p>
          </div>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {status === 'success' && result && (
        <div className="space-y-3">
          {/* Coordinate detail */}
          <div className="rounded-lg border border-gray-200 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Latitude</span>
              <span className="font-mono text-gray-800">{result.latitude.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Longitude</span>
              <span className="font-mono text-gray-800">{result.longitude.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Akurasi GPS</span>
              <span className="text-gray-800">±{Math.round(result.accuracy)} meter</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between text-sm">
              <span className="text-gray-500">Jarak dari toko</span>
              <span className="font-semibold text-gray-800">{result.distance} meter</span>
            </div>
          </div>

          {/* Geofence status */}
          {result.withinRadius ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Lokasi Terdeteksi</p>
                <p className="text-sm text-emerald-700 mt-0.5">
                  Anda berada dalam area absensi Pro.com ({result.distance} meter dari toko).
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Di Luar Area Absensi</p>
                <p className="text-sm text-red-700 mt-0.5">
                  Anda harus berada di lokasi Pro.com untuk melakukan absensi.
                  Jarak Anda saat ini: <strong>{result.distance} meter</strong> (maks. {ATTENDANCE_RADIUS_METERS} meter).
                </p>
              </div>
            </div>
          )}

          <Button variant="outline" onClick={handleRetry} size="sm" className="w-full">
            <MapPin className="h-4 w-4 mr-2" />
            Perbarui Lokasi
          </Button>
        </div>
      )}

      {/* ── ERROR STATES ── */}
      {(status === 'denied' || status === 'unavailable' || status === 'timeout' || status === 'error') && error && (
        <div className="space-y-3">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
            {status === 'denied'
              ? <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              : status === 'unavailable'
              ? <WifiOff className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              : <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className="text-sm font-medium text-red-800">
                {status === 'denied' ? 'Izin Lokasi Ditolak'
                  : status === 'unavailable' ? 'GPS Tidak Tersedia'
                  : status === 'timeout' ? 'Waktu Habis'
                  : 'Kesalahan Lokasi'}
              </p>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button onClick={handleRetry} className="w-full">
            <MapPin className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      )}
    </div>
  );
}
