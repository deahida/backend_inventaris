import React, {
  useMemo,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import {
  Download,
  FileText,
  FileSpreadsheet,
  Users,
  UserCheck,
  Clock,
  UserX,
  AlertCircle,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';

import { useAttendance } from '@/contexts/useAttendance';

import { mockEmployees } from '@/mock/employees';

import { getCurrentMonthStr } from '@/utils/formatters';

// ============================================================
// TYPES
// ============================================================

interface EmployeeSummary {
  name: string;
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
  alpha: number;
  total: number;
}

// ============================================================
// COMPONENT
// ============================================================

export default function AttendanceReport() {
  const [
    month,
    setMonth,
  ] = useState(
    getCurrentMonthStr()
  );

  const [
    employeeId,
    setEmployeeId,
  ] = useState<
    number | 'Semua'
  >('Semua');

  const {
    records,
  } = useAttendance();

  // ==========================================================
  // FILTER DATA
  // ==========================================================

  const filteredData =
    useMemo(() => {
      return records.filter(
        (record) => {

          const matchMonth =
            record.date.startsWith(
              month
            );

          const matchEmployee =
            employeeId === 'Semua' ||
            record.employeeId ===
              employeeId;

          return (
            matchMonth &&
            matchEmployee
          );
        }
      );
    }, [
      records,
      month,
      employeeId,
    ]);

  // ==========================================================
  // STATS
  // ==========================================================

  const stats =
    useMemo(() => {
      return {
        total:
          filteredData.length,

        hadir:
          filteredData.filter(
            (record) =>
              record.status ===
              'hadir'
          ).length,

        terlambat:
          filteredData.filter(
            (record) =>
              record.status ===
              'terlambat'
          ).length,

        izin:
          filteredData.filter(
            (record) =>
              record.status ===
              'izin'
          ).length,

        sakit:
          filteredData.filter(
            (record) =>
              record.status ===
              'sakit'
          ).length,

        alpha:
          filteredData.filter(
            (record) =>
              record.status ===
              'alpha'
          ).length,
      };
    }, [
      filteredData,
    ]);

  // ==========================================================
  // EMPLOYEE SUMMARY
  // ==========================================================

  const employeeSummary =
    useMemo(() => {
      const summary:
        Record<
          number,
          EmployeeSummary
        > = {};

      // ------------------------------------------------------
      // INITIAL EMPLOYEE
      // ------------------------------------------------------

      mockEmployees.forEach(
        (employee) => {

          if (
            employeeId !==
              'Semua' &&
            employee.id !==
              employeeId
          ) {
            return;
          }

          summary[
            employee.id
          ] = {
            name:
              employee.name,

            hadir: 0,

            terlambat: 0,

            izin: 0,

            sakit: 0,

            alpha: 0,

            total: 0,
          };
        }
      );

      // ------------------------------------------------------
      // FILL ATTENDANCE
      // ------------------------------------------------------

      filteredData.forEach(
        (record) => {

          const employee =
            summary[
              record.employeeId
            ];

          if (!employee) {
            return;
          }

          switch (
            record.status
          ) {

            case 'hadir':
              employee.hadir += 1;
              break;

            case 'terlambat':
              employee.terlambat += 1;
              break;

            case 'izin':
              employee.izin += 1;
              break;

            case 'sakit':
              employee.sakit += 1;
              break;

            case 'alpha':
              employee.alpha += 1;
              break;

          }

          employee.total += 1;
        }
      );

      return Object.values(
        summary
      ).filter(
        (employee) =>
          employee.total > 0
      );

    }, [
      filteredData,
      employeeId,
    ]);

  // ==========================================================
  // EXPORT
  // ==========================================================

  const handleExport = (
    type: string
  ) => {
    /*
     * Export sebenarnya akan kita
     * sambungkan nanti setelah backend
     * dan generator PDF/Excel ditentukan.
     *
     * Untuk sekarang UI tetap bekerja
     * tanpa mengubah desain.
     */
    toast.success(
      `Berhasil mengekspor data ke ${type}`
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="space-y-6">

      <PageHeader
        title="Laporan Kehadiran"
        action={
          <div className="flex gap-2">

            <Button
              variant="outline"
              leftIcon={
                <FileText className="w-4 h-4" />
              }
              onClick={() =>
                handleExport(
                  'PDF'
                )
              }
            >
              PDF
            </Button>

            <Button
              variant="outline"
              leftIcon={
                <FileSpreadsheet className="w-4 h-4" />
              }
              onClick={() =>
                handleExport(
                  'Excel'
                )
              }
            >
              Excel
            </Button>

            <Button
              leftIcon={
                <Download className="w-4 h-4" />
              }
              onClick={() =>
                handleExport(
                  'Cetak'
                )
              }
            >
              Cetak
            </Button>

          </div>
        }
      />

      {/* ======================================================
          FILTER
      ====================================================== */}

      <Card className="p-4 flex flex-col sm:flex-row gap-4">

        <input
          type="month"
          className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={month}
          onChange={(e) =>
            setMonth(
              e.target.value
            )
          }
        />

        <select
          className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={employeeId}
          onChange={(e) => {

            const value =
              e.target.value;

            setEmployeeId(
              value === 'Semua'
                ? 'Semua'
                : Number(value)
            );
          }}
        >

          <option value="Semua">
            Semua Karyawan
          </option>

          {mockEmployees.map(
            (employee) => (
              <option
                key={employee.id}
                value={employee.id}
              >
                {employee.name}
              </option>
            )
          )}

        </select>

      </Card>

      {/* ======================================================
          STATS
      ====================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

        <StatCard
          title="Total"
          value={stats.total}
          icon={Users}
          color="indigo"
        />

        <StatCard
          title="Hadir"
          value={stats.hadir}
          icon={UserCheck}
          color="emerald"
        />

        <StatCard
          title="Terlambat"
          value={stats.terlambat}
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Izin"
          value={stats.izin}
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Sakit"
          value={stats.sakit}
          icon={AlertCircle}
          color="indigo"
        />

        <StatCard
          title="Alpha"
          value={stats.alpha}
          icon={UserX}
          color="red"
        />

      </div>

      {/* ======================================================
          EMPLOYEE SUMMARY
      ====================================================== */}

      <Card title="Ringkasan Per Karyawan">

        <div className="overflow-x-auto p-4">

          <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Karyawan
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hadir
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terlambat
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Izin
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sakit
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alpha
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>

              </tr>

            </thead>

            <tbody className="bg-white divide-y divide-gray-200">

              {employeeSummary.map(
                (employee) => (
                  <tr
                    key={employee.name}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {employee.hadir}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {employee.terlambat}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {employee.izin}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {employee.sakit}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {employee.alpha}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {employee.total}
                    </td>

                  </tr>
                )
              )}

              {employeeSummary.length ===
                0 && (

                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    Tidak ada data kehadiran
                    untuk periode ini.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
}