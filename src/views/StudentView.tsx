import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  History,
  Radio,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../services/store';
import { HealthBadge } from '../components/HealthBadge';
import { MetricCard } from '../components/MetricCard';
import { SpeedTestResult } from '../types';

interface StudentViewProps {
  onOpenSpeedTest: () => void;
  onOpenComplaint: (snapshot?: SpeedTestResult) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  onOpenSpeedTest,
  onOpenComplaint,
}) => {
  const { speedTests, complaints, currentUser } = useAppStore();

  const userTests = currentUser ? speedTests.filter((t) => t.userId === currentUser.id) : speedTests;
  const latestTest = userTests.length > 0 ? userTests[0] : speedTests[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Speed Test Action Banner (Clean, un-cluttered interface) */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-white to-blue-50/70 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-bold text-indigo-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Campus Wireless Network Portal</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Test Your Current <span className="text-indigo-600">Wi-Fi Connection</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Run a real multi-stream speed diagnostic from your device. Your probe helps IT support pinpoint dead zones, verify network quality, and calculate campus health scores.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 shrink-0 lg:w-72">
            <button
              onClick={onOpenSpeedTest}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-4 text-sm sm:text-base font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-98"
            >
              <Zap className="h-5 w-5 text-yellow-300" />
              <span>Run Speed Test Now</span>
            </button>

            <button
              onClick={() => onOpenComplaint(latestTest)}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-3.5 text-xs sm:text-sm font-bold text-slate-700 transition-all shadow-sm"
            >
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span>Report Wi-Fi Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Your Latest Download"
          value={latestTest ? latestTest.downloadSpeed : '--'}
          unit="Mbps"
          icon={<ArrowDownCircle className="h-6 w-6" />}
          subtitle={latestTest ? `Tested in ${latestTest.locationName}` : 'No test taken yet'}
        />
        <MetricCard
          title="Your Latest Upload"
          value={latestTest ? latestTest.uploadSpeed : '--'}
          unit="Mbps"
          icon={<ArrowUpCircle className="h-6 w-6" />}
          subtitle={latestTest ? `Protocol: ${latestTest.connectionType || 'Wi-Fi'}` : 'Ready'}
        />
        <MetricCard
          title="Network Latency"
          value={latestTest ? latestTest.ping : '--'}
          unit="ms"
          icon={<Activity className="h-6 w-6" />}
          subtitle={latestTest ? `Packet Loss: ${latestTest.packetLoss}%` : 'Normal'}
        />
        <MetricCard
          title="Wi-Fi Health Score"
          value={latestTest ? `${latestTest.healthScore}/100` : '--'}
          icon={<Radio className="h-6 w-6" />}
          subtitle={latestTest ? `Status: ${latestTest.healthStatus}` : 'Run a diagnostic test'}
        />
      </div>

      {/* Two-Column Section: Personal History & Complaint Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Speed Test History */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <History className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Your Speed Test Logs</h3>
            </div>
            <span className="text-xs sm:text-sm text-slate-500 font-mono font-medium">
              {userTests.length > 0 ? `${userTests.length} Personal Tests` : `${speedTests.length} Total Tests`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="pb-3.5 pl-2">Location</th>
                  <th className="pb-3.5">Download</th>
                  <th className="pb-3.5">Upload</th>
                  <th className="pb-3.5">Ping</th>
                  <th className="pb-3.5">Health</th>
                  <th className="pb-3.5 pr-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(userTests.length > 0 ? userTests : speedTests).slice(0, 8).map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pl-2 font-semibold text-slate-900 max-w-[200px] truncate">
                      {test.locationName}
                    </td>
                    <td className="py-3.5 font-mono font-extrabold text-indigo-600">
                      {test.downloadSpeed} <span className="text-xs text-slate-400 font-normal">Mbps</span>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-slate-700">
                      {test.uploadSpeed} <span className="text-xs text-slate-400 font-normal">Mbps</span>
                    </td>
                    <td className="py-3.5 font-mono text-slate-600">{test.ping} ms</td>
                    <td className="py-3.5">
                      <HealthBadge status={test.healthStatus} score={test.healthScore} size="sm" showDot={false} />
                    </td>
                    <td className="py-3.5 pr-2 text-right text-slate-500 font-mono text-xs">
                      {new Date(test.testedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Complaints Tracker */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-rose-600" />
                <h3 className="text-lg font-bold text-slate-900">Your Submitted Tickets</h3>
              </div>
              <button
                onClick={() => onOpenComplaint()}
                className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                + New Ticket
              </button>
            </div>

            <div className="space-y-3.5">
              {complaints.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                      {c.locationName}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">{c.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                    <span>Category: <strong className="text-slate-700">{c.category}</strong></span>
                    <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {c.itNotes.length > 0 && (
                    <div className="mt-2 rounded-lg bg-white p-2.5 text-xs text-indigo-800 border border-indigo-100 shadow-sm">
                      <strong>IT Update ({c.itNotes[0].author}):</strong> {c.itNotes[0].text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-100">
            <button
              onClick={() => onOpenComplaint()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-xs sm:text-sm font-bold text-slate-700 transition-colors"
            >
              <FileText className="h-4 w-4 text-rose-600" />
              <span>Submit New Wi-Fi Complaint</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};