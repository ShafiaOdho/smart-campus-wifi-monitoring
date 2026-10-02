import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Gauge,
  MapPin,
  RefreshCw,
  X,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../services/store';
import { runSpeedTest, SpeedTestProgress } from '../services/speedTestEngine';
import { SpeedTestResult } from '../types';
import { HealthBadge } from './HealthBadge';
import { calculateHealthScore } from '../services/healthScoreEngine';

interface SpeedTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenComplaintWithTest?: (test: SpeedTestResult) => void;
}

export const SpeedTestModal: React.FC<SpeedTestModalProps> = ({
  isOpen,
  onClose,
  onOpenComplaintWithTest,
}) => {
  const { locations, currentUser, selectedLocationId, setSelectedLocationId, addSpeedTest, thresholds } =
    useAppStore();

  const [selectedLocId, setSelectedLocId] = useState<string>(selectedLocationId || locations[0]?.id || '');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<SpeedTestProgress>({
    phase: 'idle',
    progressPercent: 0,
    currentMbps: 0,
    currentPing: 0,
    currentJitter: 0,
    currentLoss: 0,
    statusMessage: 'Ready to benchmark your current campus Wi-Fi connection.',
  });
  const [completedResult, setCompletedResult] = useState<SpeedTestResult | null>(null);

  useEffect(() => {
    if (selectedLocationId) {
      setSelectedLocId(selectedLocationId);
    }
  }, [selectedLocationId]);

  if (!isOpen) return null;

  const currentLocation = locations.find((l) => l.id === selectedLocId) || locations[0];

  const handleStartTest = async () => {
    if (!currentLocation) return;
    setIsRunning(true);
    setCompletedResult(null);

    try {
      const result = await runSpeedTest(
        {
          location: currentLocation,
          userId: currentUser?.id || 'guest-student',
          userName: currentUser?.name || 'Campus Student',
        },
        (prog) => {
          setProgress(prog);
        }
      );

      setCompletedResult(result);
      addSpeedTest(result);

      if (result.healthScore >= 80) {
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Speed test error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Dial calculations
  const maxDialMbps = 100;
  const clampedMbps = Math.min(maxDialMbps, progress.currentMbps);
  const needleAngle = -120 + (clampedMbps / maxDialMbps) * 240;
  const arcTotal = 460.77;
  const arcProgress = (progress.progressPercent / 100) * arcTotal;

  const scoreDetails = completedResult
    ? calculateHealthScore(
        {
          downloadSpeed: completedResult.downloadSpeed,
          uploadSpeed: completedResult.uploadSpeed,
          ping: completedResult.ping,
          packetLoss: completedResult.packetLoss,
        },
        thresholds
      )
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3.5 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                Campus Wi-Fi Speed Benchmark
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Multi-stream throughput, latency, jitter, and packet loss diagnostic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body - overflow-x-hidden to prevent any horizontal scrollbar */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto overflow-x-hidden flex-1">
          {/* Location Selector Card */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 shrink-0">
                <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Select Your Campus Location:</span>
              </div>
              <div className="w-full sm:flex-1 sm:max-w-md">
                <select
                  value={selectedLocId}
                  disabled={isRunning}
                  onChange={(e) => {
                    setSelectedLocId(e.target.value);
                    setSelectedLocationId(e.target.value);
                    setCompletedResult(null);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 font-semibold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 shadow-sm"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.building})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {currentLocation && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 font-medium">AP Zone:</span> {currentLocation.floor} &bull;{' '}
                  <span className="text-slate-400 font-medium">Enterprise APs:</span> {currentLocation.apCount}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Current Health:</span>
                  <HealthBadge status={currentLocation.currentStatus} score={currentLocation.currentHealthScore} size="sm" />
                </div>
              </div>
            )}
          </div>

          {/* Symmetrical Speedometer Dial Canvas */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 p-5 border border-slate-200 shadow-inner overflow-hidden">
            <div className="relative w-72 sm:w-80 h-48 sm:h-52 flex items-center justify-center">
              <svg className="w-72 sm:w-80 h-72 sm:h-80 origin-center" viewBox="0 0 300 300">
                <defs>
                  <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="50%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Dial background track - 240 deg arc */}
                <circle
                  cx="150"
                  cy="150"
                  r="110"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="16"
                  strokeDasharray="460.77 691.15"
                  strokeDashoffset="-115.19"
                  strokeLinecap="round"
                  transform="rotate(90 150 150)"
                />

                {/* Animated active progress arc */}
                <circle
                  cx="150"
                  cy="150"
                  r="110"
                  fill="none"
                  stroke="url(#dialGradient)"
                  strokeWidth="16"
                  strokeDasharray={`${arcProgress} 691.15`}
                  strokeDashoffset="-115.19"
                  strokeLinecap="round"
                  transform="rotate(90 150 150)"
                  className="transition-all duration-150 ease-out"
                />

                {/* Scale tick marks */}
                <text x="65" y="225" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">0</text>
                <text x="60" y="140" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">25</text>
                <text x="150" y="55" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">50</text>
                <text x="240" y="140" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">75</text>
                <text x="235" y="225" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">100</text>
              </svg>

              {/* Centered needle pivoting from true center */}
              <div
                className="absolute top-1/2 left-1/2 w-1.5 h-20 sm:h-24 bg-gradient-to-t from-indigo-700 via-indigo-600 to-cyan-500 origin-bottom rounded-full shadow-lg transition-transform duration-100 ease-out"
                style={{
                  transform: `translate(-50%, -100%) rotate(${needleAngle}deg)`,
                }}
              />
              {/* Needle pivot cap */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white border-4 border-indigo-600 shadow-md" />
            </div>

            {/* Readout Display */}
            <div className="mt-1 text-center">
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 font-mono flex items-center justify-center gap-2">
                <span>{progress.currentMbps.toFixed(1)}</span>
                <span className="text-base font-bold text-indigo-600">Mbps</span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                {progress.statusMessage}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full mt-3.5 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 via-cyan-500 to-emerald-500 transition-all duration-200"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 font-bold mb-1">
                <ArrowDownCircle className="h-4 w-4" />
                <span>Download</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
                {completedResult ? completedResult.downloadSpeed : isRunning && progress.phase === 'download' ? progress.currentMbps.toFixed(1) : '--'}
                <span className="text-[11px] font-normal text-slate-500 ml-1">Mbps</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-600 font-bold mb-1">
                <ArrowUpCircle className="h-4 w-4" />
                <span>Upload</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
                {completedResult ? completedResult.uploadSpeed : isRunning && progress.phase === 'upload' ? progress.currentMbps.toFixed(1) : '--'}
                <span className="text-[11px] font-normal text-slate-500 ml-1">Mbps</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-bold mb-1">
                <Activity className="h-4 w-4" />
                <span>Ping / Latency</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
                {progress.currentPing || (completedResult ? completedResult.ping : '--')}
                <span className="text-[11px] font-normal text-slate-500 ml-1">ms</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 font-bold mb-1">
                <Zap className="h-4 w-4" />
                <span>Packet Loss</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
                {completedResult ? completedResult.packetLoss : progress.currentLoss}%
              </div>
            </div>
          </div>

          {/* Test Completed Summary & Health Score Breakdown */}
          {completedResult && scoreDetails && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 animate-in slide-in-from-bottom-2 duration-300 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 border border-indigo-200 font-black text-lg sm:text-xl font-mono shadow-sm">
                    {completedResult.healthScore}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">Health Index Score:</span>
                      <HealthBadge status={completedResult.healthStatus} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Protocol: {completedResult.connectionType} &bull; Signal: {completedResult.signalStrengthDbm} dBm
                    </p>
                  </div>
                </div>

                {onOpenComplaintWithTest && (
                  <button
                    onClick={() => {
                      onOpenComplaintWithTest(completedResult);
                      onClose();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Report Wi-Fi Issue</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2.5 border-t border-indigo-100 text-xs text-slate-600 text-center">
                <div>DL Score: <span className="text-slate-900 font-mono font-bold">{scoreDetails.subScores.download}</span></div>
                <div>UL Score: <span className="text-slate-900 font-mono font-bold">{scoreDetails.subScores.upload}</span></div>
                <div>Latency: <span className="text-slate-900 font-mono font-bold">{scoreDetails.subScores.ping}</span></div>
                <div>Reliability: <span className="text-slate-900 font-mono font-bold">{scoreDetails.subScores.packetLoss}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5 bg-slate-50/90 shrink-0">
          <div className="text-xs text-slate-500">
            {completedResult ? `Completed at ${new Date(completedResult.testedAt).toLocaleTimeString()}` : 'Ready to start'}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isRunning}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Close
            </button>
            <button
              onClick={handleStartTest}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 transition-all disabled:opacity-60"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Benchmarking...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>{completedResult ? 'Run Test Again' : 'Start Speed Test'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};