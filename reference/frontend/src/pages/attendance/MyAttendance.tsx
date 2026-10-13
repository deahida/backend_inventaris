import {
  useMemo,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import {
  LogIn,
  LogOut,
  Clock,
  CalendarCheck,
  MapPin,
  Camera,
} from 'lucide-react';

import { clsx } from 'clsx';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

import {
  AttendanceVerification,
  type VerificationResult,
} from '@/components/attendance/AttendanceVerification';

import { useAuth } from '@/contexts/AuthContext';
import { useAttendance } from '@/contexts/useAttendance';

import {
  formatAttendanceTime,
  formatAttendanceDate,
  getTodayLocalStr,
  getCurrentTimeStr,
} from '@/utils/date';

// ============================================================
// COMPONENT
// ============================================================

export default function MyAttendance() {
  const { user } =
    useAuth();

  const {
    records,
    getTodayRecord,
    getEmployeeAttendance,
    checkIn,
    checkOut,
  } = useAttendance();

  const today =
    getTodayLocalStr();

  const [
    verifyMode,
    setVerifyMode,
  ] = useState<
    'in' | 'out' | null
  >(null);

  // ==========================================================
  // TODAY RECORD
  // ==========================================================

  const todayRecord =
    user
      ? getTodayRecord(
          user.id,
          today
        )
      : null;

  // ==========================================================
  // HISTORY
  // ==========================================================

  const history =
    useMemo(() => {
      if (!user) {
        return [];
      }

      return getEmployeeAttendance(
        user.id
      ).slice(0, 10);
    }, [
      records,
      user,
      getEmployeeAttendance,
    ]);

  // ==========================================================
  // DERIVED STATE
  // ==========================================================

  const hasCheckedIn =
    !!todayRecord?.checkIn;

  const hasCheckedOut =
    !!todayRecord?.checkOut;

  // ==========================================================
  // VERIFICATION CONFIRM
  // ==========================================================

  const handleVerificationConfirm = (
    result: VerificationResult
  ) => {
    if (!user || !verifyMode) {
      return;
    }

    const timeStr =
      getCurrentTimeStr();

    // ========================================================
    // CHECK IN
    // ========================================================

    if (verifyMode === 'in') {
      const createdRecord =
        checkIn(
          user.id,
          user.name,
          result
        );

      if (!createdRecord) {
        toast.error(
          'Anda sudah melakukan Check In hari ini.'
        );

        setVerifyMode(null);
        return;
      }

      toast.success(
        createdRecord.status === 'terlambat'
          ? `Check In berhasil — ${timeStr} WIB (Terlambat)`
          : `Check In berhasil — ${timeStr} WIB`
      );
    }

    // ========================================================
    // CHECK OUT
    // ========================================================

    if (verifyMode === 'out') {
      const updatedRecord =
        checkOut(
          user.id,
          result
        );

      if (!updatedRecord) {
        toast.error(
          'Check Out tidak dapat dilakukan. Pastikan Anda sudah Check In dan belum Check Out.'
        );

        setVerifyMode(null);
        return;
      }

      toast.success(
        `Check Out berhasil — ${timeStr} WIB`
      );
    }

    setVerifyMode(null);
  };

  // ==========================================================
  // ROLE
  // ==========================================================

  const roleLabel =
    user?.role === 'admin'
      ? 'Administrator'
      : 'Kasir';

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <PageHeader
        title="Kehadiran Saya"
        subtitle={`Presensi harian ${roleLabel}`}
      />

      {/* ======================================================
          TODAY ATTENDANCE
      ====================================================== */}

      <Card>
        <div className="space-y-6">

          {/* HEADER */}
          <div className="flex items-start justify-between">

            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {user?.name}
              </h3>

              <p className="text-sm text-gray-500 mt-0.5">
                {user?.position} — {roleLabel}
              </p>

              <div className="flex items-center gap-1.5 mt-2">
                <CalendarCheck className="h-4 w-4 text-indigo-500" />

                <p className="text-sm text-indigo-700 font-medium">
                  {formatAttendanceDate(today)}
                </p>
              </div>
            </div>

            {todayRecord && (
              <StatusBadge
                status={
                  todayRecord.status
                }
              />
            )}
          </div>

          {/* ====================================================
              TIME
          ==================================================== */}

          <div className="grid grid-cols-2 gap-4">

            {/* CHECK IN */}
            <div
              className={clsx(
                'rounded-xl border-2 p-4 text-center transition-colors',
                hasCheckedIn
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-gray-200 bg-gray-50'
              )}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">

                <LogIn
                  className={clsx(
                    'h-4 w-4',
                    hasCheckedIn
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  )}
                />

                <p
                  className={clsx(
                    'text-xs font-medium',
                    hasCheckedIn
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  )}
                >
                  Check In
                </p>
              </div>

              <p
                className={clsx(
                  'text-2xl font-bold',
                  hasCheckedIn
                    ? 'text-emerald-700'
                    : 'text-gray-300'
                )}
              >
                {hasCheckedIn
                  ? formatAttendanceTime(
                      todayRecord!.checkIn
                    )
                  : '--:--'}
              </p>
            </div>

            {/* CHECK OUT */}
            <div
              className={clsx(
                'rounded-xl border-2 p-4 text-center transition-colors',
                hasCheckedOut
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-gray-200 bg-gray-50'
              )}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">

                <LogOut
                  className={clsx(
                    'h-4 w-4',
                    hasCheckedOut
                      ? 'text-amber-600'
                      : 'text-gray-400'
                  )}
                />

                <p
                  className={clsx(
                    'text-xs font-medium',
                    hasCheckedOut
                      ? 'text-amber-600'
                      : 'text-gray-400'
                  )}
                >
                  Check Out
                </p>
              </div>

              <p
                className={clsx(
                  'text-2xl font-bold',
                  hasCheckedOut
                    ? 'text-amber-700'
                    : 'text-gray-300'
                )}
              >
                {hasCheckedOut
                  ? formatAttendanceTime(
                      todayRecord!.checkOut
                    )
                  : '--:--'}
              </p>
            </div>

          </div>

          {/* ====================================================
              CHECK IN LOCATION
          ==================================================== */}

          {todayRecord?.checkInDistance !==
            null &&
            todayRecord?.checkInDistance !==
              undefined && (

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">

              <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />

              <p className="text-xs text-blue-700">
                Lokasi Check In terverifikasi —
                jarak dari toko:{' '}
                <strong>
                  {todayRecord.checkInDistance} meter
                </strong>
              </p>

            </div>
          )}

          {/* ====================================================
              CHECK OUT LOCATION
          ==================================================== */}

          {todayRecord?.checkOutDistance !==
            null &&
            todayRecord?.checkOutDistance !==
              undefined && (

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">

              <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />

              <p className="text-xs text-amber-700">
                Lokasi Check Out terverifikasi —
                jarak dari toko:{' '}
                <strong>
                  {todayRecord.checkOutDistance} meter
                </strong>
              </p>

            </div>
          )}

          {/* ====================================================
              INFO
          ==================================================== */}

          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">

            <div className="flex gap-2 text-gray-400">

              <Camera className="h-4 w-4 mt-0.5 flex-shrink-0" />

              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />

            </div>

            <p className="text-xs text-gray-500">
              Absensi memerlukan selfie sebagai
              bukti kehadiran dan GPS untuk
              memastikan Anda berada di lokasi
              Pro.com.
            </p>

          </div>

          {/* ====================================================
              BUTTONS
          ==================================================== */}

          <div className="flex gap-3">

            {/* CHECK IN */}
            <Button
              onClick={() =>
                setVerifyMode('in')
              }
              disabled={hasCheckedIn}
              className={clsx(
                'flex-1',
                !hasCheckedIn &&
                  'bg-indigo-600 hover:bg-indigo-700'
              )}
              size="lg"
            >
              <LogIn className="h-5 w-5 mr-2" />

              {hasCheckedIn
                ? 'Sudah Check In'
                : 'Check In'}
            </Button>

            {/* CHECK OUT */}
            <Button
              onClick={() =>
                setVerifyMode('out')
              }
              disabled={
                !hasCheckedIn ||
                hasCheckedOut
              }
              variant="outline"
              className={clsx(
                'flex-1',
                hasCheckedIn &&
                  !hasCheckedOut
                  ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                  : ''
              )}
              size="lg"
            >
              <LogOut className="h-5 w-5 mr-2" />

              {hasCheckedOut
                ? 'Sudah Check Out'
                : 'Check Out'}
            </Button>

          </div>
        </div>
      </Card>

      {/* ========================================================
          HISTORY
      ======================================================== */}

      <Card
        title="Riwayat Kehadiran"
        subtitle="10 entri terbaru"
      >
        {history.length === 0 ? (

          <div className="text-center py-8 text-gray-400">

            <Clock className="h-10 w-10 mx-auto mb-2 opacity-40" />

            <p className="text-sm">
              Belum ada riwayat kehadiran
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto -mx-6 -mb-6">

            <table className="w-full text-sm">

              <thead>
                <tr className="border-y border-gray-100 bg-gray-50">

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Check In
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Check Out
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Catatan
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {history.map(
                  (record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-3 text-gray-800 font-medium whitespace-nowrap">
                        {formatAttendanceDate(
                          record.date
                        )}
                      </td>

                      <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                        {formatAttendanceTime(
                          record.checkIn
                        )}
                      </td>

                      <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                        {formatAttendanceTime(
                          record.checkOut
                        )}
                      </td>

                      <td className="px-6 py-3">
                        <StatusBadge
                          status={
                            record.status
                          }
                        />
                      </td>

                      <td className="px-6 py-3 text-gray-500 max-w-xs truncate">
                        {record.note ||
                          record.notes ||
                          '—'}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          </div>
        )}
      </Card>

      {/* ========================================================
          VERIFICATION MODAL
      ======================================================== */}

      {verifyMode && (

        <AttendanceVerification
          isOpen={
            !!verifyMode
          }

          onClose={() =>
            setVerifyMode(null)
          }

          mode={verifyMode}

          onConfirm={
            handleVerificationConfirm
          }
        />

      )}

    </div>
  );
}