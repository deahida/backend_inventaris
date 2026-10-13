/**
 * Format number as Indonesian Rupiah currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Format date with time
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format short date (DD/MM/YYYY)
 */
export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Format time only — handles both full ISO timestamps and HH:mm strings.
 * Returns "HH:mm WIB" for ISO strings, "HH:mm" for plain time strings.
 */
export function formatTime(timeStr: string | null): string {
  if (!timeStr) return '-';

  // Full ISO string (e.g. "2026-09-29T07:30:00.000Z")
  if (timeStr.includes('T') || timeStr.includes('Z') || timeStr.includes('+')) {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    // Convert to WIB (UTC+7)
    const h = (date.getUTCHours() + 7) % 24;
    const m = date.getUTCMinutes();
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} WIB`;
  }

  // Already "HH:mm" or "HH:mm:ss"
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }

  return timeStr;
}


/**
 * Format number with dot separator (Indonesian)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Generate a unique ID
 */
export function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Generate invoice number
 */
export function generateInvoice(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(2);
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${y}${m}${d}-${rand}`;
}

/**
 * Generate product/supplier code
 */
export function generateCode(prefix: string): string {
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}-${rand}`;
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current month as YYYY-MM string
 */
export function getCurrentMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

/**
 * Classname helper for status badges
 */
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    aktif: 'bg-emerald-100 text-emerald-700',
    nonaktif: 'bg-gray-100 text-gray-600',
    selesai: 'bg-emerald-100 text-emerald-700',
    dibatalkan: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
    hadir: 'bg-emerald-100 text-emerald-700',
    terlambat: 'bg-amber-100 text-amber-700',
    izin: 'bg-blue-100 text-blue-700',
    sakit: 'bg-orange-100 text-orange-700',
    alpha: 'bg-red-100 text-red-700',
    baru: 'bg-blue-100 text-blue-700',
    bekas: 'bg-amber-100 text-amber-700',
    refurbished: 'bg-purple-100 text-purple-700',
  };
  return map[status.toLowerCase()] || 'bg-gray-100 text-gray-600';
}

/**
 * Get status label in Indonesian
 */
export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    aktif: 'Aktif',
    nonaktif: 'Nonaktif',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
    pending: 'Pending',
    hadir: 'Hadir',
    terlambat: 'Terlambat',
    izin: 'Izin',
    sakit: 'Sakit',
    alpha: 'Alpha',
    baru: 'Baru',
    bekas: 'Bekas',
    refurbished: 'Refurbished',
    masuk: 'Masuk',
    keluar: 'Keluar',
    penjualan: 'Penjualan',
    penyesuaian: 'Penyesuaian',
    tunai: 'Tunai',
    transfer: 'Transfer',
    debit: 'Debit',
  };
  return map[status.toLowerCase()] || status;
}
