import { createContext } from 'react';

import type { AttendanceStatus } from '@/types';

// ============================================================
// VERIFICATION DATA
// ============================================================

export interface AttendanceVerificationData {
  /**
   * Selfie sebagai bukti kehadiran.
   *
   * Saat ini berupa base64 data URL.
   * Nanti akan dikirim ke Laravel sebagai file upload.
   */
  photo: string;

  latitude: number;
  longitude: number;

  /**
   * Jarak dari lokasi toko dalam meter.
   */
  distance: number;
}

// ============================================================
// ATTENDANCE RECORD
// ============================================================

export interface AttendanceRecord {
  id: number;

  employeeId: number;
  employeeName: string;

  date: string;

  checkIn: string | null;
  checkOut: string | null;

  status: AttendanceStatus;

  // ==========================================================
  // CHECK IN VERIFICATION
  // ==========================================================

  checkInPhoto: string | null;
  checkInLatitude: number | null;
  checkInLongitude: number | null;
  checkInDistance: number | null;

  // ==========================================================
  // CHECK OUT VERIFICATION
  // ==========================================================

  checkOutPhoto: string | null;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  checkOutDistance: number | null;

  // ==========================================================
  // NOTES
  // ==========================================================

  note?: string;
  notes?: string;

  createdAt?: string;
}

// ============================================================
// CONTEXT TYPE
// ============================================================

export interface AttendanceContextType {
  records: AttendanceRecord[];

  /**
   * Melakukan Check In.
   *
   * Return:
   * - AttendanceRecord jika berhasil
   * - null jika gagal
   */
  checkIn: (
    employeeId: number,
    employeeName: string,
    data: AttendanceVerificationData
  ) => AttendanceRecord | null;

  /**
   * Melakukan Check Out.
   *
   * Return:
   * - AttendanceRecord jika berhasil
   * - null jika gagal
   */
  checkOut: (
    employeeId: number,
    data: AttendanceVerificationData
  ) => AttendanceRecord | null;

  /**
   * Mengambil attendance hari tertentu
   * milik seorang karyawan.
   */
  getTodayRecord: (
    employeeId: number,
    date: string
  ) => AttendanceRecord | null;

  /**
   * Mengambil semua attendance
   * milik seorang karyawan.
   */
  getEmployeeAttendance: (
    employeeId: number
  ) => AttendanceRecord[];
}

// ============================================================
// CONTEXT
// ============================================================

export const AttendanceContext =
  createContext<
    AttendanceContextType | undefined
  >(undefined);