/**
 * Date/time formatting utilities for the attendance system.
 * Produces human-readable Indonesian date/time strings.
 */

/**
 * Format an ISO timestamp or time string into a readable WIB time.
 * Handles full ISO strings (e.g. "2026-09-29T07:30:00.000Z")
 * and simple HH:mm strings.
 *
 * @example
 *   formatAttendanceTime("2026-09-29T07:30:00.000Z") → "07:30 WIB"
 *   formatAttendanceTime("07:30") → "07:30 WIB"
 *   formatAttendanceTime(null) → "-"
 */
export function formatAttendanceTime(value: string | null | undefined): string {
  if (!value) return '-';

  // Full ISO string — parse as Date and extract hours/minutes in WIB (UTC+7)
  if (value.includes('T') || value.includes('Z') || value.includes('+')) {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    // Format as WIB (UTC+7) — Intl formats in local timezone so we use a fixed offset
    const hours = String(date.getUTCHours() + 7).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    // Handle hour overflow past midnight
    const h = Number(hours) % 24;
    return `${String(h).padStart(2, '0')}:${minutes} WIB`;
  }

  // Already "HH:mm" format
  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${value} WIB`;
  }

  return value;
}

/**
 * Format a date string into an Indonesian long-form date.
 * Handles both "YYYY-MM-DD" and ISO strings.
 *
 * @example
 *   formatAttendanceDate("2026-09-29") → "29 September 2026, Selasa"
 */
export function formatAttendanceDate(value: string): string {
  // Strip time portion if present so we parse as local date
  const dateOnly = value.split('T')[0];
  // Parse as local midnight (avoids UTC offset shifting the day)
  const [year, month, day] = dateOnly.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Get today's date as YYYY-MM-DD in local time.
 */
export function getTodayLocalStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get the current time as "HH:mm" string in local time.
 */
export function getCurrentTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
