import React, {
  useMemo,
  useState,
} from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';

import { useAttendance } from '@/contexts/useAttendance';

import { mockEmployees } from '@/mock/employees';

import {
  formatDate,
  formatTime,
  getCurrentMonthStr,
} from '@/utils/formatters';

export default function AttendanceHistory() {
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

  const [
    status,
    setStatus,
  ] = useState('Semua');

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    perPage,
    setPerPage,
  ] = useState(10);

  const {
    records,
  } = useAttendance();

  // ==========================================================
  // FILTER DATA
  // ==========================================================

  const filteredData =
    useMemo(() => {
      return records
        .filter((record) => {

          const matchMonth =
            record.date.startsWith(
              month
            );

          const matchEmployee =
            employeeId === 'Semua' ||
            record.employeeId ===
              employeeId;

          const matchStatus =
            status === 'Semua' ||
            record.status ===
              status;

          return (
            matchMonth &&
            matchEmployee &&
            matchStatus
          );
        })
        .sort(
          (a, b) =>
            new Date(
              b.date
            ).getTime() -
            new Date(
              a.date
            ).getTime()
        );
    }, [
      records,
      month,
      employeeId,
      status,
    ]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages =
    Math.ceil(
      filteredData.length /
        perPage
    );

  const paginatedData =
    filteredData.slice(
      (currentPage - 1) *
        perPage,
      currentPage *
        perPage
    );

  // ==========================================================
  // RESET PAGE WHEN FILTER CHANGES
  // ==========================================================

  const handleMonthChange = (
    value: string
  ) => {
    setMonth(value);
    setCurrentPage(1);
  };

  const handleEmployeeChange = (
    value: string
  ) => {
    setEmployeeId(
      value === 'Semua'
        ? 'Semua'
        : Number(value)
    );

    setCurrentPage(1);
  };

  const handleStatusChange = (
    value: string
  ) => {
    setStatus(value);
    setCurrentPage(1);
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="space-y-6">

      <PageHeader
        title="Riwayat Kehadiran"
      />

      <Card>

        {/* ====================================================
            FILTER
        ==================================================== */}

        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">

          <input
            type="month"
            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={month}
            onChange={(e) =>
              handleMonthChange(
                e.target.value
              )
            }
          />

          <select
            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={employeeId}
            onChange={(e) =>
              handleEmployeeChange(
                e.target.value
              )
            }
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

          <select
            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={status}
            onChange={(e) =>
              handleStatusChange(
                e.target.value
              )
            }
          >

            <option value="Semua">
              Semua Status
            </option>

            <option value="hadir">
              Hadir
            </option>

            <option value="terlambat">
              Terlambat
            </option>

            <option value="izin">
              Izin
            </option>

            <option value="sakit">
              Sakit
            </option>

            <option value="alpha">
              Alpha
            </option>

          </select>

        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="overflow-x-auto">

          <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Karyawan
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

              {paginatedData.map(
                (record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(
                        record.date
                      )}
                    </td>

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

              {paginatedData.length ===
                0 && (

                <tr>

                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Tidak ada data kehadiran
                    untuk filter yang dipilih.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* ====================================================
            PAGINATION
        ==================================================== */}

        <div className="p-4 border-t border-gray-200">

          <Pagination
            currentPage={
              currentPage
            }
            totalPages={
              totalPages || 1
            }
            onPageChange={
              setCurrentPage
            }
            perPage={
              perPage
            }
            onPerPageChange={(
              value
            ) => {
              setPerPage(value);
              setCurrentPage(1);
            }}
            total={
              filteredData.length
            }
          />

        </div>

      </Card>

    </div>
  );
}