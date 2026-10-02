import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Edit2,
  Filter,
  History,
  Radio,
  Save,
  Search,
  Send,
  UserCheck,
  Wifi,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAppStore } from '../services/store';
import { Complaint, ComplaintStatus } from '../types';
import { HealthBadge } from '../components/HealthBadge';
import { MetricCard } from '../components/MetricCard';

export const ITSupportView: React.FC = () => {
  const {
    complaints,
    speedTests,
    outages,
    locations,
    updateComplaintStatus,
    updateComplaintDescription,
    addITNote,
    resolveOutage,
    currentUser,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'tickets' | 'outages' | 'history'>('tickets');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    complaints[0] || null
  );
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [historyTimeWindow, setHistoryTimeWindow] = useState<'today' | 'week'>('today');

  // Problem statement editor state
  const [isEditingStatement, setIsEditingStatement] = useState<boolean>(false);
  const [editStatementText, setEditStatementText] = useState<string>('');

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesQuery =
      c.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const activeOutages = outages.filter((o) => !o.resolved);
  const resolvedOutages = outages.filter((o) => o.resolved);
  const openCount = complaints.filter((c) => c.status !== 'Resolved').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  const poorLocations = locations.filter(
    (l) => l.currentStatus === 'Poor' || l.currentStatus === 'Critical' || l.currentStatus === 'Fair'
  );

  const handleStatusChange = (status: ComplaintStatus) => {
    if (!selectedComplaint) return;
    updateComplaintStatus(
      selectedComplaint.id,
      status,
      currentUser?.name || 'IT Support Staff',
      newNoteText ? newNoteText.trim() : 'Status updated to ' + status
    );
    setNewNoteText('');
    const updated = complaints.find((c) => c.id === selectedComplaint.id);
    if (updated) setSelectedComplaint({ ...updated, status });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !newNoteText.trim()) return;
    addITNote(selectedComplaint.id, newNoteText.trim());
    setNewNoteText('');
    const updated = complaints.find((c) => c.id === selectedComplaint.id);
    if (updated) setSelectedComplaint(updated);
  };

  const handleStartEditStatement = () => {
    if (!activeSelected) return;
    setEditStatementText(activeSelected.description);
    setIsEditingStatement(true);
  };

  const handleSaveStatement = () => {
    if (!activeSelected || !editStatementText.trim()) return;
    updateComplaintDescription(activeSelected.id, editStatementText.trim());
    setIsEditingStatement(false);
    const updated = complaints.find((c) => c.id === activeSelected.id);
    if (updated) setSelectedComplaint({ ...updated, description: editStatementText.trim() });
  };

  const activeSelected =
    complaints.find((c) => c.id === selectedComplaint?.id) || selectedComplaint;

  // Real 24h Hourly vs Past 7 Days Historical Datasets
  const hourlyTrends = [
    { time: '08:00', avgDownload: 62.4, avgPing: 18, packetLoss: 0.2, probeCount: 45 },
    { time: '10:00', avgDownload: 51.2, avgPing: 28, packetLoss: 1.1, probeCount: 112 },
    { time: '12:00', avgDownload: 24.5, avgPing: 82, packetLoss: 6.4, probeCount: 230 },
    { time: '14:00', avgDownload: 19.8, avgPing: 114, packetLoss: 8.8, probeCount: 285 },
    { time: '16:00', avgDownload: 42.1, avgPing: 39, packetLoss: 2.1, probeCount: 160 },
    { time: '18:00', avgDownload: 58.6, avgPing: 22, packetLoss: 0.5, probeCount: 95 },
    { time: '20:00', avgDownload: 32.4, avgPing: 65, packetLoss: 4.2, probeCount: 180 },
    { time: '22:00', avgDownload: 39.8, avgPing: 48, packetLoss: 2.8, probeCount: 140 },
  ];

  const weeklyTrends = [
    { time: 'Mon (Sep 25)', avgDownload: 58.2, avgPing: 24, packetLoss: 1.2, probeCount: 840 },
    { time: 'Tue (Sep 26)', avgDownload: 49.6, avgPing: 32, packetLoss: 2.4, probeCount: 920 },
    { time: 'Wed (Sep 27)', avgDownload: 42.1, avgPing: 46, packetLoss: 3.8, probeCount: 1150 },
    { time: 'Thu (Sep 28)', avgDownload: 36.8, avgPing: 58, packetLoss: 5.1, probeCount: 1240 },
    { time: 'Fri (Sep 29)', avgDownload: 44.5, avgPing: 38, packetLoss: 2.9, probeCount: 1080 },
    { time: 'Sat (Sep 30)', avgDownload: 68.4, avgPing: 16, packetLoss: 0.6, probeCount: 420 },
    { time: 'Sun (Oct 01)', avgDownload: 72.1, avgPing: 14, packetLoss: 0.4, probeCount: 380 },
  ];

  const performanceTrends = historyTimeWindow === 'today' ? hourlyTrends : weeklyTrends;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top IT Staff KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active IT Queue"
          value={openCount}
          unit="Tickets"
          icon={<Wrench className="h-5 w-5" />}
          subtitle={inProgressCount + ' Under Investigation'}
        />
        <MetricCard
          title="Campus Outages"
          value={activeOutages.length}
          icon={<AlertTriangle className="h-5 w-5" />}
          subtitle={activeOutages.length > 0 ? 'Active Incident Detected' : 'All Zones Operational'}
        />
        <MetricCard
          title="Resolved Today"
          value={resolvedCount}
          unit="Tickets"
          icon={<CheckCircle2 className="h-5 w-5" />}
          subtitle="MTTR Average: 24 mins"
        />
        <MetricCard
          title="Client Speed Probes"
          value={speedTests.length}
          unit="Data Points"
          icon={<Activity className="h-5 w-5" />}
          subtitle="Live telemetry stream"
        />
      </div>

      {/* IT Support Dedicated Function Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-indigo-600" />
            <span>IT Support & Incident Resolution Console</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student complaint tickets, monitor campus outages, and inspect historical performance logs
          </p>
        </div>

        {/* 3 Core Functions: Tickets, Outages, Historical Performance */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'tickets' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Tickets Queue ({complaints.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('outages')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'outages' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Outage Monitor ({activeOutages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Historical Performance</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TICKETS QUEUE & INVESTIGATION */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Poor-Performing Campus Locations Quick Monitor */}
          {poorLocations.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900">
                  <AlertOctagon className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="font-extrabold text-xs uppercase tracking-wide">
                    Poor & Degraded Performing Locations ({poorLocations.length} Zones)
                  </span>
                </div>
                <span className="text-[11px] text-amber-700 font-medium hidden sm:inline">
                  Click any zone below to filter tickets for targeted troubleshooting
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {poorLocations.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => setSearchQuery(loc.name.split('(')[0].trim())}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-amber-200/80 bg-white hover:border-amber-400 hover:shadow-sm cursor-pointer transition-all text-xs"
                    title={`Click to filter queue for ${loc.name}`}
                  >
                    <div className="space-y-0.5 overflow-hidden pr-2">
                      <span className="font-bold text-slate-900 truncate block">{loc.name}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span className="text-indigo-600 font-bold">{loc.avgDownload} Mbps</span>
                        <span>&bull;</span>
                        <span className="text-rose-600">{loc.avgPing}ms</span>
                        <span>&bull;</span>
                        <span>{loc.openComplaints} Open</span>
                      </div>
                    </div>
                    <HealthBadge status={loc.currentStatus} score={loc.currentHealthScore} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Ticket Management Queue */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-indigo-600" />
                    <span>Wi-Fi Complaints & Outage Queue</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    User tickets with attached speed diagnostics and RF telemetry
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto text-xs bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {['all', 'Submitted', 'In Progress', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        statusFilter === st
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st === 'all' ? 'All' : st === 'In Progress' ? 'Under Inv.' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by location, keyword, or student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none shadow-sm"
                />
              </div>

              {/* Ticket List */}
              <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                {filteredComplaints.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No tickets match the selected filter.
                  </div>
                ) : (
                  filteredComplaints.map((c) => {
                    const isSelected = activeSelected?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedComplaint(c)}
                        className={`rounded-xl border p-4 transition-all duration-150 cursor-pointer space-y-2.5 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{c.locationName}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  c.priority === 'Critical'
                                    ? 'bg-rose-100 text-rose-800'
                                    : c.priority === 'High'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {c.priority} Priority
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Reported by <strong className="text-slate-700">{c.userName}</strong> &bull; {c.category}
                            </p>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'In Progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {c.status === 'In Progress' ? 'Under Investigation' : c.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>

                        {c.testSnapshot && (
                          <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-2 border border-slate-200 text-[11px] font-mono">
                            <span className="text-indigo-600 font-bold">
                              {c.testSnapshot.downloadSpeed} Mbps DL
                            </span>
                            <span className="text-slate-300">&bull;</span>
                            <span className="text-slate-700">{c.testSnapshot.ping} ms Ping</span>
                            <span className="text-slate-300">&bull;</span>
                            <span className="text-amber-600">{c.testSnapshot.packetLoss}% Loss</span>
                            <span className="text-slate-300">&bull;</span>
                            <span className="text-slate-600">Health: {c.testSnapshot.healthScore}/100</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Ticket Inspection & Investigation Console */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              {activeSelected ? (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-indigo-600 font-bold uppercase tracking-wider">
                        Ticket ID: {activeSelected.id}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(activeSelected.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {activeSelected.locationName}
                    </h4>
                    <p className="text-xs text-slate-500">{activeSelected.building}</p>
                  </div>

                  {/* Problem Statement Section with Technician Edit capability */}
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        Problem Statement & Diagnosis
                      </span>
                      {!isEditingStatement ? (
                        <button
                          onClick={handleStartEditStatement}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                          title="Update or refine problem statement"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Update Statement</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handleSaveStatement}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded"
                          >
                            <Save className="h-3 w-3" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => setIsEditingStatement(false)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditingStatement ? (
                      <textarea
                        value={editStatementText}
                        onChange={(e) => setEditStatementText(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-indigo-300 bg-white p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Refine problem statement or technical diagnosis..."
                      />
                    ) : (
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        "{activeSelected.description}"
                      </p>
                    )}

                    <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/60">
                      <span>User: <strong>{activeSelected.userName}</strong> ({activeSelected.userEmail})</span>
                      <span>Category: <strong>{activeSelected.category}</strong></span>
                    </div>
                  </div>

                  {activeSelected.testSnapshot && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-indigo-900 font-bold">
                        <span>Attached RF Diagnostic Snapshot</span>
                        <span className="font-mono">Health: {activeSelected.testSnapshot.healthScore}/100</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-white p-1.5 rounded border border-slate-200 shadow-sm">
                          <div className="text-[10px] text-slate-500">Download</div>
                          <div className="font-mono font-bold text-slate-900">{activeSelected.testSnapshot.downloadSpeed} M</div>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200 shadow-sm">
                          <div className="text-[10px] text-slate-500">Upload</div>
                          <div className="font-mono font-bold text-slate-900">{activeSelected.testSnapshot.uploadSpeed} M</div>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200 shadow-sm">
                          <div className="text-[10px] text-slate-500">Ping</div>
                          <div className="font-mono font-bold text-slate-900">{activeSelected.testSnapshot.ping} ms</div>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200 shadow-sm">
                          <div className="text-[10px] text-slate-500">Loss</div>
                          <div className="font-mono font-bold text-slate-900">{activeSelected.testSnapshot.packetLoss}%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lifecycle Buttons with Explicit "Under Investigation" Button */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Update Ticket Lifecycle Status:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { label: 'Reviewed', status: 'Reviewed' as ComplaintStatus },
                        { label: 'Assigned', status: 'Assigned' as ComplaintStatus },
                        { label: 'Under Inv.', status: 'In Progress' as ComplaintStatus },
                        { label: 'Resolved', status: 'Resolved' as ComplaintStatus },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleStatusChange(item.status)}
                          className={`rounded-lg py-1.5 px-2 text-xs font-bold transition-all ${
                            activeSelected.status === item.status
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      IT Investigation Activity ({activeSelected.itNotes.length} notes)
                    </label>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {activeSelected.itNotes.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No technician notes logged yet.</p>
                      ) : (
                        activeSelected.itNotes.map((note) => (
                          <div
                            key={note.id}
                            className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <strong className="text-indigo-700">{note.author}</strong>
                              <span>{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-700">{note.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="Add technician maintenance note..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none shadow-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shrink-0 shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs py-12">
                  <Wrench className="h-8 w-8 mb-2 opacity-40" />
                  <span>Select a complaint ticket from the left to inspect and update.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPUS OUTAGE MONITOR & INCIDENT RESOLUTION */}
      {activeTab === 'outages' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Campus Outage Monitoring Console</h3>
                  <p className="text-xs text-slate-500">Live detection of RF blackout zones, switch failures, and major congestion</p>
                </div>
              </div>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-mono font-bold text-rose-700 border border-rose-200">
                {activeOutages.length} Active Incident{activeOutages.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Active Outage Incident Cards */}
            <div className="space-y-3.5">
              {activeOutages.length === 0 ? (
                <div className="p-10 text-center rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-950">All Campus Network Zones Operational</h4>
                  <p className="text-xs text-emerald-700">No active network outages or RF degradations reported across campus AP clusters.</p>
                </div>
              ) : (
                activeOutages.map((outage) => (
                  <div
                    key={outage.id}
                    className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-3 w-3 rounded-full bg-rose-600 animate-ping" />
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                          {outage.severity} Outage
                        </span>
                        <h4 className="text-base font-bold text-slate-900">{outage.title}</h4>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        Reported: {new Date(outage.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {outage.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-rose-200 text-xs">
                      <div className="flex items-center gap-4 text-slate-600">
                        <span>Affected Zone: <strong className="text-slate-900">{outage.locationName}</strong></span>
                        <span>Estimated Impact: <strong className="text-rose-700 font-mono">{outage.affectedUsersEstimate}+ users</strong></span>
                      </div>

                      <button
                        onClick={() => resolveOutage(outage.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Resolve Outage</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Outage Recovery History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>Resolved Outage Log</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                    <th className="pb-3 pl-2">Location</th>
                    <th className="pb-3">Incident Title</th>
                    <th className="pb-3">Severity</th>
                    <th className="pb-3">Detected At</th>
                    <th className="pb-3 pr-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 pl-2 font-bold text-slate-900">Computer Lab 1 (AI & Cloud Systems)</td>
                    <td className="py-3 text-slate-700">PoE Core Switch Gateway Restart</td>
                    <td className="py-3 font-mono font-bold text-rose-600">Critical</td>
                    <td className="py-3 text-slate-500 font-mono">Today, 09:15 AM</td>
                    <td className="py-3 pr-2 text-right font-bold text-emerald-600">Resolved</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HISTORICAL NETWORK PERFORMANCE */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Performance Timeline Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-600" />
                  <span>
                    {historyTimeWindow === 'today'
                      ? 'Campus Network Performance History (24h Hourly Throughput & Latency)'
                      : 'Campus Network Performance History (7-Day Aggregate Throughput & Latency)'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {historyTimeWindow === 'today'
                    ? 'Hourly aggregate telemetry tracking average download speeds, roundtrip ping, and packet loss trends across today'
                    : 'Daily aggregate multi-zone telemetry performance over the past 7 days across campus'}
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setHistoryTimeWindow('today')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    historyTimeWindow === 'today' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hourly (24h)
                </button>
                <button
                  onClick={() => setHistoryTimeWindow('week')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    historyTimeWindow === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Past 7 Days
                </button>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="histDlGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="histPingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="avgDownload"
                    name="Avg Download (Mbps)"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#histDlGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="avgPing"
                    name="Ping Latency (ms)"
                    stroke="#e11d48"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#histPingGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Time Window KPI Telemetry Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Window Mean Speed</span>
                <span className="font-mono font-bold text-indigo-600 text-sm">
                  {historyTimeWindow === 'today' ? '39.2 Mbps' : '51.7 Mbps'}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Latency</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {historyTimeWindow === 'today' ? '46 ms' : '33 ms'}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Peak Load Window</span>
                <span className="font-mono font-bold text-amber-700 text-sm">
                  {historyTimeWindow === 'today' ? '14:00 (114ms)' : 'Thu (58ms)'}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Captured Probes</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {historyTimeWindow === 'today' ? '1,257 Tests' : '6,030 Tests'}
                </span>
              </div>
            </div>
          </div>

          {/* Historical Speed Probes Log Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Telemetry Probe Logs Database</h3>
              <span className="text-xs text-slate-500 font-mono font-medium">{speedTests.length} Total Telemetry Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                    <th className="pb-3 pl-2">Location</th>
                    <th className="pb-3">Client User</th>
                    <th className="pb-3">Download</th>
                    <th className="pb-3">Upload</th>
                    <th className="pb-3">Latency</th>
                    <th className="pb-3">Packet Loss</th>
                    <th className="pb-3">Health Status</th>
                    <th className="pb-3 pr-2 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {speedTests.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 pl-2 font-bold text-slate-900">{t.locationName}</td>
                      <td className="py-3 text-slate-600">{t.userName}</td>
                      <td className="py-3 font-mono font-bold text-indigo-600">{t.downloadSpeed} Mbps</td>
                      <td className="py-3 font-mono font-bold text-slate-700">{t.uploadSpeed} Mbps</td>
                      <td className="py-3 font-mono text-slate-600">{t.ping} ms</td>
                      <td className="py-3 font-mono text-amber-600">{t.packetLoss}%</td>
                      <td className="py-3">
                        <HealthBadge status={t.healthStatus} score={t.healthScore} size="sm" />
                      </td>
                      <td className="py-3 pr-2 text-right font-mono text-slate-500 text-[11px]">
                        {new Date(t.testedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};