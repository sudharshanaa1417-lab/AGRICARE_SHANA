import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  title: string;
  value: number | string | null;
  unit: string;
  icon: LucideIcon;
  colorClass: string;
  statusLabel?: string;
  statusColor?: 'green' | 'amber' | 'rose' | 'gray';
  subtext?: string;
  min?: number;
  max?: number;
  isStale?: boolean;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  colorClass,
  statusLabel,
  statusColor = 'green',
  subtext,
  min,
  max,
  isStale = false
}) => {
  const getBadgeStyle = () => {
    switch (statusColor) {
      case 'green':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const numericVal = typeof value === 'number' ? value : null;
  const progressPct =
    numericVal !== null && min !== undefined && max !== undefined
      ? Math.min(100, Math.max(0, ((numericVal - min) / (max - min)) * 100))
      : null;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-forest-100/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2.5 rounded-2xl ${colorClass}`}>
            <Icon size={18} />
          </div>
          <span className="text-xs font-bold text-gray-600 line-clamp-1">{title}</span>
        </div>
        {statusLabel && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase ${getBadgeStyle()}`}
          >
            {statusLabel}
          </span>
        )}
      </div>

      {/* Main Measurement Value */}
      <div className="my-1">
        {value !== null && value !== undefined ? (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-mono">
              {typeof value === 'number' ? value.toFixed(1) : value}
            </span>
            <span className="text-xs font-semibold text-gray-500">{unit}</span>
          </div>
        ) : (
          <div className="py-1">
            <span className="text-xs text-gray-400 font-medium italic">
              Sensor not connected
            </span>
          </div>
        )}

        {/* Progress Bar (e.g. Moisture / Humidity / Battery) */}
        {progressPct !== null && (
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                statusColor === 'green'
                  ? 'bg-emerald-500'
                  : statusColor === 'amber'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Subtext info */}
      <div className="mt-2 text-[10px] text-gray-400 font-medium flex items-center justify-between">
        <span>{subtext || (isStale ? 'Stale reading (>45s ago)' : 'Live telemetry stream')}</span>
        {min !== undefined && max !== undefined && (
          <span className="text-gray-300">
            {min} - {max} {unit}
          </span>
        )}
      </div>
    </div>
  );
};
