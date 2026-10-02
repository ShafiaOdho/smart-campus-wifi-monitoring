import React from 'react';
import { HealthStatus } from '../types';
import { getStatusColor } from '../services/healthScoreEngine';

interface HealthBadgeProps {
  status: HealthStatus;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const HealthBadge: React.FC<HealthBadgeProps> = ({
  status,
  score,
  size = 'md',
  showDot = true,
}) => {
  const colors = getStatusColor(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colors.border} ${colors.badgeBg} ${colors.badgeText} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {status === 'Critical' || status === 'Poor' ? (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors.dot}`}
            />
          ) : null}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${colors.dot}`} />
        </span>
      )}
      <span>{status}</span>
      {score !== undefined && (
        <span className="opacity-75 font-mono text-[11px]">({score}/100)</span>
      )}
    </span>
  );
};