import { HealthStatus, NetworkThresholdConfig } from '../types';

export const DEFAULT_THRESHOLDS: NetworkThresholdConfig = {
  weightDownload: 0.35,
  weightUpload: 0.20,
  weightPing: 0.25,
  weightPacketLoss: 0.20,
  targetDownloadMbps: 50,
  targetUploadMbps: 20,
  targetPingMs: 30,
  thresholdExcellent: 85,
  thresholdGood: 70,
  thresholdFair: 50,
  thresholdPoor: 30,
  outageAutoTriggerComplaintCount: 3,
  anomalyDropThresholdPercent: 35,
};

export function calculateHealthScore(
  metrics: {
    downloadSpeed: number;
    uploadSpeed: number;
    ping: number;
    packetLoss: number;
  },
  config: NetworkThresholdConfig = DEFAULT_THRESHOLDS
): { score: number; status: HealthStatus; subScores: { download: number; upload: number; ping: number; packetLoss: number } } {
  const { downloadSpeed, uploadSpeed, ping, packetLoss } = metrics;

  let downloadSub = Math.min(100, (downloadSpeed / config.targetDownloadMbps) * 100);
  if (downloadSpeed < 2) downloadSub = downloadSpeed * 10;

  let uploadSub = Math.min(100, (uploadSpeed / config.targetUploadMbps) * 100);
  if (uploadSpeed < 1) uploadSub = uploadSpeed * 15;

  let pingSub = 100;
  if (ping > config.targetPingMs) {
    pingSub = Math.max(0, 100 - ((ping - config.targetPingMs) / (300 - config.targetPingMs)) * 100);
  }

  let lossSub = Math.max(0, 100 - packetLoss * 10);
  if (packetLoss > 5) {
    lossSub = Math.max(0, 50 - (packetLoss - 5) * 10);
  }

  const totalScore = Math.round(
    downloadSub * config.weightDownload +
    uploadSub * config.weightUpload +
    pingSub * config.weightPing +
    lossSub * config.weightPacketLoss
  );

  const boundedScore = Math.max(0, Math.min(100, totalScore));
  const status = getHealthStatusFromScore(boundedScore, config);

  return {
    score: boundedScore,
    status,
    subScores: {
      download: Math.round(downloadSub),
      upload: Math.round(uploadSub),
      ping: Math.round(pingSub),
      packetLoss: Math.round(lossSub),
    },
  };
}

export function getHealthStatusFromScore(
  score: number,
  config: NetworkThresholdConfig = DEFAULT_THRESHOLDS
): HealthStatus {
  if (score >= config.thresholdExcellent) return 'Excellent';
  if (score >= config.thresholdGood) return 'Good';
  if (score >= config.thresholdFair) return 'Fair';
  if (score >= config.thresholdPoor) return 'Poor';
  return 'Critical';
}

export function getStatusColor(status: HealthStatus): {
  badgeBg: string;
  badgeText: string;
  border: string;
  dot: string;
  hex: string;
} {
  switch (status) {
    case 'Excellent':
      return {
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        hex: '#10b981',
      };
    case 'Good':
      return {
        badgeBg: 'bg-blue-50',
        badgeText: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        hex: '#3b82f6',
      };
    case 'Fair':
      return {
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        hex: '#f59e0b',
      };
    case 'Poor':
      return {
        badgeBg: 'bg-orange-50',
        badgeText: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
        hex: '#f97316',
      };
    case 'Critical':
      return {
        badgeBg: 'bg-rose-50',
        badgeText: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        hex: '#ef4444',
      };
  }
}