import React, { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  subtitle,
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              {value}
            </span>
            {unit && <span className="text-sm font-semibold text-slate-500">{unit}</span>}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium">
              <span className={trend.isPositive ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                {trend.value}
              </span>
              <span className="text-slate-400 font-normal">vs normal baseline</span>
            </div>
          )}
        </div>
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 border border-indigo-100 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
};