import React from 'react';
import { getStatusColor, cn } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  CheckCheck,
  type LucideIcon,
} from 'lucide-react';

interface StatusBadgeProps {
  status: string | null | undefined;
  label?: string;
  icon?: LucideIcon | React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

export function getStatusDefaultIcon(status: string | null | undefined): LucideIcon | null {
  const s = (status || '').toLowerCase().trim();
  switch (s) {
    case 'active':
    case 'posted':
    case 'completed':
    case 'approved':
    case 'success':
    case 'sinkron':
    case 'v1-approved':
      return CheckCircle2;
    case 'finalized':
      return CheckCheck;
    case 'draft':
    case 'inactive':
    case 'pending':
      return Clock;
    case 'reversed':
    case 'cancelled':
    case 'rejected':
    case 'danger':
    case 'failed':
      return XCircle;
    case 'in_progress':
    case 'warning':
    case 'alert':
      return AlertTriangle;
    default:
      return null;
  }
}

export function StatusBadge({
  status,
  label,
  icon,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const color = getStatusColor(status);

  // Strip any emoji characters that may be passed in strings
  const rawLabel = label || status || '-';
  const displayLabel = rawLabel
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .trim() || '-';

  const StatusIcon = icon || (showIcon ? getStatusDefaultIcon(status) : null);

  const renderIcon = () => {
    if (!StatusIcon) {
      return <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />;
    }
    if (React.isValidElement(StatusIcon)) {
      return StatusIcon;
    }
    const IconComponent = StatusIcon as React.ComponentType<{ className?: string }>;
    return <IconComponent className="w-3 h-3 mr-1 shrink-0 stroke-[2.2]" />;
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize select-none',
        color.bg,
        color.text,
        color.border,
        className
      )}
    >
      {renderIcon()}
      <span>{displayLabel}</span>
    </span>
  );
}
