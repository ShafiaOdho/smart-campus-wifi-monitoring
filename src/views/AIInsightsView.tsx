import React, { useState } from 'react';
import {
  Activity,
  Bot,
  Clock,
  Flame,
  Lightbulb,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../services/store';
import {
  forecastPeakUsage,
  generateAIExecutiveSummary,
  generateNetworkRecommendations,
} from '../services/aiAnalyticsEngine';
import { HealthBadge } from '../components/HealthBadge';

export const AIInsightsView: React.FC = () => {
  const { locations, speedTests, complaints, anomalies, outagePredictions } = useAppStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const peakForecasts = forecastPeakUsage(locations);
  const recommendations = generateNetworkRecommendations(locations, complaints);
  const aiExecutiveSummary = generateAIExecutiveSummary(
    locations,
    speedTests,
    complaints,
    anomalies
  );

  const handleRefreshInsights = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top AI Header Banner - High-contrast readable typography */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-white to-cyan-50/70 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-xs sm:text-sm font-bold text-indigo-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-indigo-600 animate-spin" />
              <span>Section 10 AI Intelligence Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Campus AI <span className="text-indigo-600">Predictive Analytics</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Synthesizing client speed diagnostics, RF congestion data, and NLP ticket classifications to forecast outages, flag anomalies, and recommend network upgrades.
            </p>
          </div>

          <button
            onClick={handleRefreshInsights}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-md hover:shadow-lg transition-all shrink-0 active:scale-98"
          >
            <RefreshCw className={"h-5 w-5 " + (isRefreshing ? 'animate-spin' : '')} />
            <span>Re-compute AI Models</span>
          </button>
        </div>
      </div>

      {/* 1. AI Executive IT Briefing */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">AI Executive IT Summary & Briefing</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Natural language synthesis for CIO & Network Engineering</p>
            </div>
          </div>
          <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-xs sm:text-sm font-mono font-bold text-indigo-700 border border-indigo-200 shadow-sm">
            Health Grade: {aiExecutiveSummary.healthGrade}
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 p-6 border border-slate-200 space-y-4">
          <h4 className="text-base sm:text-lg font-bold text-indigo-950 flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-indigo-600 shrink-0" />
            <span>{aiExecutiveSummary.headline}</span>
          </h4>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {aiExecutiveSummary.executiveBriefing}
          </p>

          <div className="space-y-2 pt-3 border-t border-slate-200">
            {aiExecutiveSummary.bulletPoints.map((pt, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-normal">
                <span className="text-indigo-600 font-bold text-base leading-none mt-0.5">&bull;</span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Anomaly Detection & Outage Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Network Anomaly Detection Feed */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Activity className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Live Network Anomaly Detection</h3>
                <p className="text-xs sm:text-sm text-slate-500">Statistical deviation from location baseline</p>
              </div>
            </div>
            <span className="rounded-lg bg-amber-50 px-3 py-1 text-xs sm:text-sm font-bold text-amber-700 border border-amber-200 font-mono">
              {anomalies.length} Flagged
            </span>
          </div>

          <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
            {anomalies.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                All campus AP zones operating within normal statistical parameters.
              </div>
            ) : (
              anomalies.map((anom) => (
                <div
                  key={anom.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900">{anom.locationName}</span>
                    <span className="rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                      {anom.metric} ({anom.deviationPercent}% deviation)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{anom.explanation}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200 font-mono">
                    <span>Baseline: {anom.baselineValue} &rarr; Observed: {anom.observedValue}</span>
                    <span>{new Date(anom.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Outage Prediction & Problem Location Risk */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Flame className="h-5 w-5 text-rose-600" />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Outage Prediction & Problem Zones</h3>
                <p className="text-xs sm:text-sm text-slate-500">Risk probability index combining tests and tickets</p>
              </div>
            </div>
            <span className="rounded-lg bg-rose-50 px-3 py-1 text-xs sm:text-sm font-bold text-rose-700 border border-rose-200 font-mono">
              {outagePredictions.problemLocations.length} High Risk
            </span>
          </div>

          <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
            {outagePredictions.problemLocations.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No high-risk outage clusters detected.
              </div>
            ) : (
              outagePredictions.problemLocations.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-rose-950 text-sm sm:text-base">{item.location.name}</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200">
                      Risk: {item.riskScore}%
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">{item.reason}</p>
                  <div className="flex items-center justify-between text-xs text-rose-700 pt-2 border-t border-rose-200 font-medium">
                    <span>AP Load: {item.location.capacityScore}% capacity</span>
                    <HealthBadge status={item.location.currentStatus} score={item.location.currentHealthScore} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Peak Usage Forecasting */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-cyan-600" />
            <span>Peak Usage & Degradation Window Forecasting</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Predicts times when Wi-Fi performance drops due to high student concurrency
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {peakForecasts.map((f, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-slate-900 text-sm sm:text-base">{f.locationName}</span>
                <span className="font-mono text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-200 font-bold text-xs sm:text-sm">
                  {f.peakWindow}
                </span>
              </div>

              <div className="flex items-center gap-5 text-xs sm:text-sm">
                <div className="text-slate-600">
                  Predicted Drop: <strong className="text-rose-600 font-mono text-sm">-{f.predictedDegradationPct}%</strong>
                </div>
                <div className="text-slate-600">
                  Throughput Loss: <strong className="text-amber-700 font-mono text-sm">~{f.expectedThroughputDropMbps} Mbps</strong>
                </div>
              </div>

              <div className="rounded-lg bg-white p-3 text-xs sm:text-sm text-slate-700 border border-slate-200 shadow-sm leading-relaxed">
                <strong className="text-indigo-600 font-semibold">Recommended Action: </strong>
                {f.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Network Improvement Recommendations */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Lightbulb className="h-5 w-5 text-emerald-600" />
            <span>AI Network Improvement & Infrastructure Recommendations</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Actionable engineering steps prioritized by performance impact and complaint resolution ROI
          </p>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={"px-2.5 py-1 rounded-md text-xs font-bold " + (
                      rec.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : rec.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    )}
                  >
                    {rec.priority} Priority
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">{rec.title}</h4>
                </div>
                <span className="text-xs sm:text-sm text-slate-500 font-semibold">{rec.locationName}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong className="text-emerald-700 font-semibold">Action: </strong>
                {rec.actionableStep}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-slate-200 text-xs sm:text-sm text-slate-500 font-medium">
                <span>Rationale: {rec.rationale}</span>
                <span className="font-bold text-indigo-600">{rec.impactEstimate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
