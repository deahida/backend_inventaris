import type { Attendance } from '@/types';

export const mockAttendance: Attendance[] = [];

const generateMockAttendance = () => {
  let id = 1;
  const dates = [
    '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05',
    '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12',
    '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19',
    '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26',
  ];
  // employeeId 1 = Ahmad Fauzi (admin), 2 = Siti Nurhaliza (cashier)
  const employeeIds = [1, 2, 4, 6, 8];
  const names: Record<number, string> = {
    1: 'Ahmad Fauzi',
    2: 'Siti Nurhaliza',
    4: 'Dewi Lestari',
    6: 'Anisa Rahma',
    8: 'Maya Sari',
  };

  dates.forEach((date) => {
    employeeIds.forEach((empId) => {
      const rand = Math.random();
      let status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpha' = 'hadir';
      // Store times as simple "HH:mm" strings — NOT ISO timestamps
      // This avoids timezone confusion and the broken display bug
      let checkIn: string | null = '07:55';
      let checkOut: string | null = '17:05';
      let note = '';

      if (rand > 0.9) {
        status = 'sakit';
        checkIn = null;
        checkOut = null;
        note = 'Demam';
      } else if (rand > 0.85) {
        status = 'izin';
        checkIn = null;
        checkOut = null;
        note = 'Urusan keluarga';
      } else if (rand > 0.75) {
        status = 'alpha';
        checkIn = null;
        checkOut = null;
      } else if (rand > 0.6) {
        status = 'terlambat';
        checkIn = '08:' + String(20 + Math.floor(Math.random() * 30)).padStart(2, '0');
        note = 'Macet';
      }

      mockAttendance.push({
        id: id++,
        employeeId: empId,
        employeeName: names[empId],
        // Store date as plain YYYY-MM-DD (no time part) to avoid timezone shift
        date,
        checkIn,
        checkOut,
        status,
        note,
        createdAt: date,
      });
    });
  });
};

generateMockAttendance();
