import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: string | number | Date | null | undefined,
  dateFormat: string = 'dd MMM yyyy'
): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(d)) return String(date);
    return format(d, dateFormat);
  } catch {
    return String(date);
  }
}

export function formatDateTime(
  date: string | number | Date | null | undefined,
  dateFormat: string = 'dd MMM yyyy HH:mm'
): string {
  return formatDate(date, dateFormat);
}

export function formatNumber(
  value: number | string | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined || value === '') return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatQuantity(
  qty: number | string | null | undefined,
  unitSymbol?: string | null
): string {
  const formatted = formatNumber(qty, 2);
  return unitSymbol ? `${formatted} ${unitSymbol}` : formatted;
}

export function getStatusColor(status: string | null | undefined): {
  bg: string;
  text: string;
  border: string;
} {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'active':
    case 'posted':
    case 'completed':
    case 'approved':
    case 'success':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      };
    case 'finalized':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      };
    case 'draft':
    case 'inactive':
    case 'pending':
      return {
        bg: 'bg-neutral-100',
        text: 'text-neutral-700',
        border: 'border-neutral-200',
      };
    case 'reversed':
    case 'cancelled':
    case 'rejected':
    case 'danger':
    case 'failed':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
      };
    case 'in_progress':
    case 'warning':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
      };
    default:
      return {
        bg: 'bg-neutral-100',
        text: 'text-neutral-700',
        border: 'border-neutral-200',
      };
  }
}

export function getMovementTypeLabel(type: string | null | undefined): string {
  switch ((type || '').toLowerCase()) {
    case 'in':
    case 'receipt':
    case 'incoming':
      return 'Penerimaan (In)';
    case 'out':
    case 'dispatch':
    case 'outgoing':
      return 'Pengeluaran (Out)';
    case 'transfer':
      return 'Transfer Lokasi';
    case 'production_input':
      return 'Input Produksi';
    case 'production_output':
      return 'Output Produksi';
    case 'adjustment':
      return 'Penyesuaian Stok';
    case 'loss':
      return 'Loss / Limbah';
    default:
      return type || '-';
  }
}
