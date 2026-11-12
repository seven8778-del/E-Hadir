/**
 * Utility functions for formatting and string normalization
 */

export function normalizeStaffId(input: string): string {
  if (!input) return '';
  return input.trim().toUpperCase();
}

export function getCurrentTimestamp(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export function formatDateTime(isoOrFormatted: string | null): string {
  if (!isoOrFormatted) return '-';
  // If already in DD/MM/YYYY HH:MM:SS format
  if (isoOrFormatted.includes('/') && isoOrFormatted.includes(':')) {
    return isoOrFormatted;
  }
  try {
    const d = new Date(isoOrFormatted);
    if (isNaN(d.getTime())) return isoOrFormatted;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch {
    return isoOrFormatted;
  }
}

export function generateVerificationCode(staffId: string, timestamp: string): string {
  // Deterministic short hash for visual verification pass
  const raw = `${staffId}_${timestamp}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `EH-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}
