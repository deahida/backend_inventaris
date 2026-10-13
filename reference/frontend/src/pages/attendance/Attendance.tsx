import React, {
  useMemo,
} from 'react';

import {
  Users,
  UserCheck,
  Clock,
  UserX,
  AlertCircle,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

import { useAttendance } from '@/contexts/useAttendance';

import {
  formatTime,
  getTodayStr,
} from '@/utils/formatters';

export default function Attendance() {
  const today =
    getTodayStr();

  const {
    records,
  } = useAttendance();

  // ==========================================================
  // TODAY ATTENDANCE
  // ==========================================================

  const todayAttendance =
    useMemo(() => {
      return records.filter(
        (record) =>
          record.date === today
      );
    }, [
      records,
      today,
    ]);

  // ==========================================================
  // STATS
  // ==========================================================

  const stats =
    useMemo(() => {
      return {
        hadir:
          todayAttendance.filter(
            (record) =>
              record.status ===
              'hadir'
          ).length,

        terlambat:
          todayAttendance.filter(
            (record) =>
              record.status ===
              'terlambat'
          ).length,

        izin:
          todayAttendance.filter(
            (record) =>
              record.status ===
              'izin'
          ).length,

        sakit:
          todayAttendance.filter(
            (record) =>
              record.status ===
              'sakit'
          ).length,

        alpha:
          todayAttendance.filter(
            (record) =>
              record.status ===
              'alpha'
          ).length,
      };
    }, [
      todayAttendance,
    ]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="space-y-6">

      <PageHeader
        title="Kehadiran Hari Ini"
      />

      {/* ======================================================
          STATS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">

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
          TABLE
      ====================================================== */}

      <Card>

        <div className="overflow-x-auto">

          <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catatan
                </th>

              </tr>

            </thead>

            <tbody className="bg-white divide-y divide-gray-200">

              {todayAttendance.map(
                (record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {record.employeeName}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkIn
                        ? formatTime(
                            record.checkIn
                          )
                        : '-'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkOut
                        ? formatTime(
                            record.checkOut
                          )
                        : '-'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={
                          record.status
                        }
                      />
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {record.note ||
                        record.notes ||
                        '-'}
                    </td>

                  </tr>
                )
              )}

              {todayAttendance.length === 0 && (

                <tr>

                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Belum ada data kehadiran hari ini.
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