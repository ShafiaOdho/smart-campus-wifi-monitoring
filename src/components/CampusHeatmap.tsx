import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Building,
  CheckCircle2,
  ChevronRight,
  Filter,
  Flame,
  Info,
  Layers,
  MapPin,
  Radio,
  Wifi,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../services/store';
import { CampusLocation, HealthStatus } from '../types';
import { HealthBadge } from './HealthBadge';
import { getStatusColor } from '../services/healthScoreEngine';

interface CampusHeatmapProps {
  onSelectLocationForTest?: (locationId: string) => void;
  onSelectLocationForComplaint?: (locationId: string) => void;
}

export const CampusHeatmap: React.FC<CampusHeatmapProps> = ({
  onSelectLocationForTest,
  onSelectLocationForComplaint,
}) => {
  const { locations, selectedLocationId, setSelectedLocationId, outages } = useAppStore();
  const [activeBuildingFilter, setActiveBuildingFilter] = useState<string>('all');

  const selectedLoc = locations.find((l) => l.id === selectedLocationId) || locations[0];

  const buildings = Array.from(new Set(locations.map((l) => l.building)));

  const filteredLocations =
    activeBuildingFilter === 'all'
      ? locations
      : locations.filter((l) => l.building === activeBuildingFilter);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
      {/* Heatmap Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold text-white">Live Campus Wi-Fi Heatmap</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial health status, RF congestion, and active outage zones across campus
          </p>
        </div>

        {/* Building Filter & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/60 p-1 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400 ml-1.5" />
            <select
              value={activeBuildingFilter}
              onChange={(e) => setActiveBuildingFilter(e.target.value)}
              className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-slate-900 text-white">All Campus Buildings ({locations.length})</option>
              {buildings.map((b) => (
                <option key={b} value={b} className="bg-slate-900 text-white">
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Good (≥70)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Fair (50-69)
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Poor/Critical (&lt;50)
            </span>
          </div>
        </div>
      </div>

      {/* Main Heatmap Canvas / Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Map Layout */}
        <div className="lg:col-span-8 relative min-h-[380px] rounded-xl border border-slate-800 bg-slate-950/80 p-6 overflow-hidden flex flex-col justify-between">
          {/* Cyber Grid Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle, #6366f1 1px, transparent 1px), linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
              backgroundSize: '32px 32px, 64px 64px, 64px 64px',
            }}
          />

          {/* Campus Quadrant Labels */}
          <div className="relative z-10 flex justify-between text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-600">
            <span>North Campus (Academic Quad)</span>
            <span>East Wing (Labs & R&D)</span>
          </div>

          {/* Interactive Location Nodes */}
          <div className="relative z-10 my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredLocations.map((loc) => {
              const isSelected = loc.id === selectedLoc?.id;
              const colors = getStatusColor(loc.currentStatus);
              const hasOutage = outages.some((o) => o.locationId === loc.id && !o.resolved);

              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocationId(loc.id)}
                  className={`group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  {/* Status Pulse Glow */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        {loc.currentStatus === 'Critical' || loc.currentStatus === 'Poor' || hasOutage ? (
                          <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style={{ backgroundColor: colors.hex }}
                          />
                        ) : null}
                        <span
                          className="relative inline-flex rounded-full h-3 w-3"
                          style={{ backgroundColor: colors.hex }}
                        />
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {loc.name}
                      </h4>
                    </div>

                    {hasOutage && (
                      <span className="flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        OUTAGE
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{loc.building}</p>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
                    <div className="flex items-center gap-1 font-mono text-white">
                      <span className="text-indigo-400 font-bold">{loc.avgDownload}</span>
                      <span className="text-[10px] text-slate-500">Mbps</span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-slate-400 text-[11px]">
                      <span>{loc.avgPing}ms</span>
                    </div>

                    <HealthBadge status={loc.currentStatus} score={loc.currentHealthScore} size="sm" showDot={false} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-10 flex justify-between text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-600">
            <span>South Wing (Student Hub & Residences)</span>
            <span>West Campus Gate</span>
          </div>
        </div>

        {/* Selected Location Deep Inspection Panel */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-950/90 p-5 flex flex-col justify-between">
          {selectedLoc ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-300">{selectedLoc.building}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-1">{selectedLoc.name}</h4>
                  <p className="text-xs text-slate-400">{selectedLoc.floor}</p>
                </div>
                <HealthBadge status={selectedLoc.currentStatus} score={selectedLoc.currentHealthScore} size="md" />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{selectedLoc.description}</p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Avg Download</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {selectedLoc.avgDownload} <span className="text-xs font-normal text-slate-400">Mbps</span>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Avg Upload</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {selectedLoc.avgUpload} <span className="text-xs font-normal text-slate-400">Mbps</span>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Avg Latency</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {selectedLoc.avgPing} <span className="text-xs font-normal text-slate-400">ms</span>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Packet Loss</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {selectedLoc.packetLoss}%
                  </div>
                </div>
              </div>

              {/* Infrastructure Stats */}
              <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Active AP Antennas:</span>
                  <span className="font-semibold text-white">{selectedLoc.apCount} Enterprise APs</span>
                </div>
                <div className="flex justify-between">
                  <span>RF Contention Load:</span>
                  <span className="font-semibold text-amber-400">{selectedLoc.capacityScore}% (High)</span>
                </div>
                <div className="flex justify-between">
                  <span>Open IT Complaints:</span>
                  <span className="font-semibold text-rose-400">{selectedLoc.openComplaints} Tickets</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Speed Tests:</span>
                  <span className="font-semibold text-white">{selectedLoc.totalTests} Recorded</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onSelectLocationForTest && onSelectLocationForTest(selectedLoc.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/20"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Run Live Speed Test Here</span>
                </button>

                <button
                  onClick={() => onSelectLocationForComplaint && onSelectLocationForComplaint(selectedLoc.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                  <span>Report Problem in this Area</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-10">
              <MapPin className="h-8 w-8 mb-2 opacity-50" />
              <span>Select any location on the heatmap to inspect telemetry.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
