import {
  useCallback,
  useState,
} from 'react';

import type { ReactNode } from 'react';

import { mockAttendance } from '@/mock/attendance';
import { getTodayLocalStr } from '@/utils/date';

import {
  AttendanceContext,
  type AttendanceRecord,
  type AttendanceVerificationData,
} from './attendance-context';

// ============================================================
// HELPER
// ============================================================

function normalizeDate(date: string): string {
  return date.split('T')[0];
}

// ============================================================
// INITIAL DATA
// ============================================================

/**
 * Data awal masih memakai mockAttendance
 * supaya frontend tetap mempunyai data testing.
 *
 * Setelah backend Laravel dibuat,
 * bagian ini nantinya diganti dengan API.
 */
const initialAttendanceRecords: AttendanceRecord[] =
  mockAttendance.map((record) => ({
    id: record.id,

    employeeId:
      record.employeeId,

    employeeName:
      record.employeeName,

    date:
      normalizeDate(record.date),

    checkIn:
      record.checkIn,

    checkOut:
      record.checkOut,

    status:
      record.status,

    // ========================================================
    // CHECK IN
    // ========================================================

    checkInPhoto:
      null,

    checkInLatitude:
      null,

    checkInLongitude:
      null,

    checkInDistance:
      null,

    // ========================================================
    // CHECK OUT
    // ========================================================

    checkOutPhoto:
      null,

    checkOutLatitude:
      null,

    checkOutLongitude:
      null,

    checkOutDistance:
      null,

    // ========================================================
    // NOTES
    // ========================================================

    note:
      record.note,

    notes:
      record.notes,

    createdAt:
      record.createdAt,
  }));

// ============================================================
// ATTENDANCE STATUS
// ============================================================

/**
 * Jam masuk normal sampai 08:00.
 *
 * Setelah 08:00 => terlambat.
 */
function determineAttendanceStatus():
  | 'hadir'
  | 'terlambat' {
  const now = new Date();

  const hour =
    now.getHours();

  const minute =
    now.getMinutes();

  if (
    hour > 8 ||
    (hour === 8 && minute > 0)
  ) {
    return 'terlambat';
  }

  return 'hadir';
}

// ============================================================
// PROVIDER
// ============================================================

export function AttendanceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [records, setRecords] =
    useState<AttendanceRecord[]>(
      initialAttendanceRecords
    );

  // ==========================================================
  // CHECK IN
  // ==========================================================

  const checkIn = useCallback(
    (
      employeeId: number,
      employeeName: string,
      data: AttendanceVerificationData
    ): AttendanceRecord | null => {
      const today =
        getTodayLocalStr();

      /*
       * Cari data absensi hari ini.
       */
      const existingRecord =
        records.find(
          (record) =>
            record.employeeId ===
              employeeId &&
            record.date === today
        );

      /*
       * Tidak boleh Check In dua kali
       * pada hari yang sama.
       */
      if (existingRecord?.checkIn) {
        return null;
      }

      const now =
        new Date().toISOString();

      const newRecord: AttendanceRecord = {
        id: Date.now(),

        employeeId,
        employeeName,

        date: today,

        checkIn: now,
        checkOut: null,

        status:
          determineAttendanceStatus(),

        // ====================================================
        // CHECK IN EVIDENCE
        // ====================================================

        checkInPhoto:
          data.photo,

        checkInLatitude:
          data.latitude,

        checkInLongitude:
          data.longitude,

        checkInDistance:
          data.distance,

        // ====================================================
        // CHECK OUT BELUM ADA
        // ====================================================

        checkOutPhoto:
          null,

        checkOutLatitude:
          null,

        checkOutLongitude:
          null,

        checkOutDistance:
          null,

        note:
          undefined,

        notes:
          undefined,

        createdAt:
          now,
      };

      setRecords(
        (currentRecords) => [
          ...currentRecords,
          newRecord,
        ]
      );

      return newRecord;
    },
    [records]
  );

  // ==========================================================
  // CHECK OUT
  // ==========================================================

  const checkOut = useCallback(
    (
      employeeId: number,
      data: AttendanceVerificationData
    ): AttendanceRecord | null => {
      const today =
        getTodayLocalStr();

      /*
       * Cari attendance hari ini.
       */
      const existingRecord =
        records.find(
          (record) =>
            record.employeeId ===
              employeeId &&
            record.date === today
        );

      /*
       * Tidak bisa Check Out jika:
       *
       * 1. Belum Check In
       * 2. Sudah Check Out
       */
      if (
        !existingRecord ||
        !existingRecord.checkIn ||
        existingRecord.checkOut
      ) {
        return null;
      }

      const now =
        new Date().toISOString();

      /*
       * Update record tanpa menghilangkan
       * bukti Check In.
       */
      const updatedRecord: AttendanceRecord = {
        ...existingRecord,

        checkOut:
          now,

        // ====================================================
        // CHECK OUT EVIDENCE
        // ====================================================

        checkOutPhoto:
          data.photo,

        checkOutLatitude:
          data.latitude,

        checkOutLongitude:
          data.longitude,

        checkOutDistance:
          data.distance,
      };

      setRecords(
        (currentRecords) =>
          currentRecords.map(
            (record) =>
              record.id ===
                existingRecord.id
                ? updatedRecord
                : record
          )
      );

      return updatedRecord;
    },
    [records]
  );

  // ==========================================================
  // GET TODAY RECORD
  // ==========================================================

  const getTodayRecord = useCallback(
    (
      employeeId: number,
      date: string
    ): AttendanceRecord | null => {
      return (
        records.find(
          (record) =>
            record.employeeId ===
              employeeId &&
            record.date === date
        ) ?? null
      );
    },
    [records]
  );

  // ==========================================================
  // GET EMPLOYEE ATTENDANCE
  // ==========================================================

  const getEmployeeAttendance =
    useCallback(
      (
        employeeId: number
      ): AttendanceRecord[] => {
        return records
          .filter(
            (record) =>
              record.employeeId ===
              employeeId
          )
          .sort(
            (a, b) =>
              new Date(b.date).getTime() -
              new Date(a.date).getTime()
          );
      },
      [records]
    );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AttendanceContext.Provider
      value={{
        records,

        checkIn,
        checkOut,

        getTodayRecord,
        getEmployeeAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}