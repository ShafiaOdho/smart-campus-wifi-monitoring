import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownCircle,
  BarChart3,
  Building2,
  CheckCheck,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Flame,
  LineChart as LineChartIcon,
  MessageSquare,
  PieChart as PieChartIcon,
  Plus,
  Radio,
  Sparkles,
  Trash2,
  TrendingDown,
  User,
  Wifi,
  Wrench,
  X,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAppStore } from '../services/store';
import { MetricCard } from '../components/MetricCard';
import { HealthBadge } from '../components/HealthBadge';
import { exportCampusNetworkExcelReport } from '../utils/excelExport';

export const NetworkManagerView: React.FC = () => {
  const {
    locations,
    addLocation,
    deleteLocation,
    speedTests,
    complaints,
    devices,
    staffNoteNotifications,
    markNoteNotificationAsRead,
    markAllNoteNotificationsAsRead,
  } = useAppStore();

  const [activeViewTab, setActiveViewTab] = useState<'analytics' | 'locations'>('analytics');
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState(false);

  // New location form state
  const [newLocName, setNewLocName] = useState('');
  const [newLocBuilding, setNewLocBuilding] = useState('');
  const [newLocFloor, setNewLocFloor] = useState('Floor 1');
  const [newLocDescription, setNewLocDescription] = useState('');
  const [newLocApCount, setNewLocApCount] = useState(4);
  const [newLocTargetDl, setNewLocTargetDl] = useState(50);
  const [newLocTargetPing, setNewLocTargetPing] = useState(20);

  const handleAddLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocBuilding.trim()) return;
    addLocation({
      name: newLocName.trim(),
      building: newLocBuilding.trim(),
      floor: newLocFloor.trim(),
      description: newLocDescription.trim() || 'Monitored campus network zone.',
      currentStatus: 'Good',
      currentHealthScore: 80,
      avgDownload: newLocTargetDl,
      avgUpload: Math.round(newLocTargetDl * 0.4),
      avgPing: newLocTargetPing,
      packetLoss: 0.8,
      apCount: newLocApCount,
      capacityScore: 65,
      coordinates: { x: Math.floor(Math.random() * 60 + 20), y: Math.floor(Math.random() * 60 + 20) },
    });
    setNewLocName('');
    setNewLocBuilding('');
    setNewLocDescription('');
    setIsAddLocationOpen(false);
  };

  const handleExportReport = () => {
    exportCampusNetworkExcelReport({
      locations,
      complaints,
      devices,
      speedTests,
      staffNoteNotifications,
    });
    setExportSuccessMsg(true);
    setTimeout(() => setExportSuccessMsg(false), 3500);
  };

  const totalTestsCount = speedTests.length;
  const avgDownloadAll = Number(
    (speedTests.reduce((acc, t) => acc + t.downloadSpeed, 0) / (totalTestsCount || 1)).toFixed(1)
  );
  const avgPingAll = Math.round(
    speedTests.reduce((acc, t) => acc + t.ping, 0) / (totalTestsCount || 1)
  );
  const poorLocationsCount = locations.filter(
    (l) => l.currentStatus === 'Poor' || l.currentStatus === 'Critical'
  ).length;
  const openComplaintsCount = complaints.filter((c) => c.status !== 'Resolved').length;

  const hourlyData = [
    { hour: '08:00', download: 68, upload: 32, ping: 18, activeUsers: 240 },
    { hour: '10:00', download: 54, upload: 25, ping: 26, activeUsers: 580 },
    { hour: '12:00', download: 28, upload: 11, ping: 85, activeUsers: 920 },
    { hour: '14:00', download: 22, upload: 9, ping: 110, activeUsers: 1040 },
    { hour: '16:00', download: 45, upload: 20, ping: 42, activeUsers: 780 },
    { hour: '18:00', download: 62, upload: 28, ping: 22, activeUsers: 450 },
    { hour: '20:00', download: 38, upload: 14, ping: 68, activeUsers: 810 },
    { hour: '22:00', download: 42, upload: 16, ping: 55, activeUsers: 620 },
  ];

  const weeklyData = [
    { hour: 'Mon', download: 58.2, upload: 27, ping: 24, activeUsers: 3400 },
    { hour: 'Tue', download: 49.6, upload: 22, ping: 32, activeUsers: 4100 },
    { hour: 'Wed', download: 42.1, upload: 18, ping: 46, activeUsers: 4650 },
    { hour: 'Thu', download: 36.8, upload: 15, ping: 58, activeUsers: 4890 },
    { hour: 'Fri', download: 44.5, upload: 19, ping: 38, activeUsers: 4200 },
    { hour: 'Sat', download: 68.4, upload: 34, ping: 16, activeUsers: 1850 },
    { hour: 'Sun', download: 72.1, upload: 36, ping: 14, activeUsers: 1600 },
  ];

  const activeTrendData = timeRange === '24h' ? hourlyData : weeklyData;

  const buildingComparisonData = locations.map((loc) => ({
    name: loc.name.split('(')[0].trim(),
    download: loc.avgDownload,
    upload: loc.avgUpload,
    ping: loc.avgPing,
    health: loc.currentHealthScore,
  }));

  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const categoryPieData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const PIE_COLORS = ['#4f46e5', '#0284c7', '#d97706', '#e11d48', '#9333ea', '#059669', '#64748b'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            <span>Network Engineering & IT Management Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor overall campus health, compare buildings, analyze speed & latency curves, review recurring problems, and manage campus locations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-tabs: Analytics vs Location Management */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveViewTab('analytics')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeViewTab === 'analytics'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Health & Analytics</span>
            </button>
            <button
              onClick={() => setActiveViewTab('locations')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeViewTab === 'locations'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Campus Locations ({locations.length})</span>
            </button>
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-800 transition-colors shadow-sm"
            title="Download multi-section styled Microsoft Excel Spreadsheet (.xls) report"
          >
            <Download className="h-3.5 w-3.5 text-emerald-700" />
            <span>{exportSuccessMsg ? 'Excel Report Downloaded!' : 'Export Excel Report (.xls)'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERALL NETWORK HEALTH & ANALYTICS */}
      {activeViewTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Campus Avg Throughput"
              value={avgDownloadAll}
              unit="Mbps"
              icon={<ArrowDownCircle className="h-5 w-5" />}
              trend={{ value: '+12%', isPositive: true }}
            />
            <MetricCard
              title="Network Latency"
              value={avgPingAll}
              unit="ms"
              icon={<Activity className="h-5 w-5" />}
              trend={{ value: '-8ms', isPositive: true }}
            />
            <MetricCard
              title="Active AP Devices"
              value={devices.length}
              unit="APs"
              icon={<Wifi className="h-5 w-5" />}
              subtitle={devices.filter((d) => d.status === 'Online').length + ' Online'}
            />
            <MetricCard
              title="Problem Zones"
              value={poorLocationsCount}
              unit="Zones"
              icon={<AlertTriangle className="h-5 w-5" />}
              subtitle={locations.length - poorLocationsCount + ' Healthy Zones'}
            />
            <MetricCard
              title="Active IT Tickets"
              value={openComplaintsCount}
              unit="Open"
              icon={<Flame className="h-5 w-5" />}
              subtitle="Support in progress"
            />
          </div>

          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Hourly Throughput & Latency Chart */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4 text-indigo-600" />
                    <span>
                      {timeRange === '24h'
                        ? 'Throughput vs. Latency Trends (24h Hourly)'
                        : 'Throughput vs. Latency Trends (Past 7 Days Aggregate)'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {timeRange === '24h'
                      ? 'Bandwidth consumption and latency curve across campus AP gateways today'
                      : 'Daily average bandwidth consumption and latency curve over the past week'}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setTimeRange('24h')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      timeRange === '24h' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Today (24h)
                  </button>
                  <button
                    onClick={() => setTimeRange('7d')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      timeRange === '7d' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Past 7 Days
                  </button>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dlColorLight" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="pingColorLight" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.75rem',
                        color: '#0f172a',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="download"
                      name="Download Speed (Mbps)"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#dlColorLight)"
                    />
                    <Area
                      type="monotone"
                      dataKey="ping"
                      name="Ping Latency (ms)"
                      stroke="#e11d48"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#pingColorLight)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Complaint Category Distribution Donut */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-4 mb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-cyan-600" />
                    <span>Issue Category Breakdown</span>
                  </h3>
                  <p className="text-xs text-slate-500">Distribution of reported issues</p>
                </div>

                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-1 text-xs pt-2 border-t border-slate-100">
                {categoryPieData.slice(0, 3).map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      {cat.name}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{cat.value} reports</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recurring Problem Hotspots & Root Cause Review */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <AlertOctagon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recurring Network Problems & Hotspot Analysis
                  </h3>
                  <p className="text-xs text-slate-500">
                    High-frequency incident clusters and chronic degradation zones identified across student feedback
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                3 Active Hotspots
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-950">Library Floor 2 (Quiet Study)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800 font-mono">
                    5 Tickets
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>Chronic Slow Speeds & Dropped Connections:</strong> RF channel overlap on 5GHz band with nearby lecture hall APs causing severe packet loss (14.5%).
                </p>
                <div className="pt-1 text-[10px] text-rose-700 font-medium">
                  Recommendation: Deploy 2 additional Wi-Fi 6 APs and lower transmit power.
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950">Student Cafeteria & Lounge</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-800 font-mono">
                    3 Tickets
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>Peak Lunch Concurrency Drop:</strong> 76+ concurrent devices between 12:30 PM - 2:00 PM exceeds single outdoor AP buffer pool.
                </p>
                <div className="pt-1 text-[10px] text-amber-700 font-medium">
                  Recommendation: Enable band-steering and install second AP on cafeteria terrace.
                </div>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950">Hostel Block C (Undergrad Dorms)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-200 text-indigo-800 font-mono">
                    4 Tickets
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>Evening Latency Spikes (110ms+):</strong> Heavy streaming & gaming traffic on 2.4GHz channels causing high jitter.
                </p>
                <div className="pt-1 text-[10px] text-indigo-700 font-medium">
                  Recommendation: Configure QoS priority queues for academic portals.
                </div>
              </div>
            </div>
          </div>

          {/* Building-by-Building Comparison Matrix */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                <span>Campus Location Performance & Health Comparison</span>
              </h3>
              <p className="text-xs text-slate-500">
                Comparative multi-zone benchmarking across throughput, latency, AP density, and ticket density
              </p>
            </div>

            <div className="h-64 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buildingComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="download" name="Avg Download (Mbps)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="health" name="Health Score (0-100)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Table Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                    <th className="pb-3 pl-2">Location</th>
                    <th className="pb-3">Building & Floor</th>
                    <th className="pb-3">Avg Download</th>
                    <th className="pb-3">Avg Latency</th>
                    <th className="pb-3">Packet Loss</th>
                    <th className="pb-3">AP Density</th>
                    <th className="pb-3">Open Tickets</th>
                    <th className="pb-3 pr-2 text-right">Health Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {locations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pl-2 font-bold text-slate-900">{loc.name}</td>
                      <td className="py-3 text-slate-500">{loc.building} &bull; {loc.floor}</td>
                      <td className="py-3 font-mono font-bold text-indigo-600">{loc.avgDownload} Mbps</td>
                      <td className="py-3 font-mono text-slate-700">{loc.avgPing} ms</td>
                      <td className="py-3 font-mono text-amber-600">{loc.packetLoss}%</td>
                      <td className="py-3 text-slate-700 font-mono">{loc.apCount} APs</td>
                      <td className="py-3">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            loc.openComplaints > 0
                              ? 'bg-rose-100 text-rose-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {loc.openComplaints}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <HealthBadge status={loc.currentStatus} score={loc.currentHealthScore} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live IT Staff Field Notes & Maintenance Feed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      IT Support Technician Field Notes & Live Logs
                    </h3>
                    {(staffNoteNotifications || []).filter((n) => !n.isRead).length > 0 && (
                      <span className="bg-indigo-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                        {(staffNoteNotifications || []).filter((n) => !n.isRead).length} Unread
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Direct field updates and troubleshooting logs submitted by network support staff on student tickets
                  </p>
                </div>
              </div>

              {(staffNoteNotifications || []).filter((n) => !n.isRead).length > 0 && (
                <button
                  onClick={markAllNoteNotificationsAsRead}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 text-xs font-bold text-indigo-700 transition-colors shadow-sm"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Mark All Read</span>
                </button>
              )}
            </div>

            {(staffNoteNotifications || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No technician notes logged in the system.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(staffNoteNotifications || []).map((notif) => (
                  <div
                    key={notif.id}
                    className={`rounded-xl border p-4 text-xs space-y-2.5 transition-all ${
                      !notif.isRead
                        ? 'border-indigo-300 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-200'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800 font-bold text-xs uppercase">
                          {notif.author.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{notif.author}</span>
                            {!notif.isRead && (
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{notif.ticketNumber}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Location: <strong className="text-slate-800">{notif.locationName}</strong>
                      </div>
                      <p className="text-xs text-slate-700 italic">"{notif.text}"</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      {notif.statusChange ? (
                        <span className="px-2 py-0.5 rounded-md font-mono font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-200">
                          Lifecycle: {notif.statusChange}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Technician Note</span>
                      )}

                      {!notif.isRead && (
                        <button
                          onClick={() => markNoteNotificationAsRead(notif.id)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CAMPUS LOCATIONS & ZONE MANAGEMENT */}
      {activeViewTab === 'locations' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  <span>Campus Network Locations & AP Allocations</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Provision new monitored zones, edit target performance baselines, and manage hardware AP assignments
                </p>
              </div>

              <button
                onClick={() => setIsAddLocationOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Monitored Location</span>
              </button>
            </div>

            {/* Locations Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{loc.name}</h4>
                      <p className="text-xs text-slate-500">{loc.building} &bull; {loc.floor}</p>
                    </div>
                    <HealthBadge status={loc.currentStatus} score={loc.currentHealthScore} size="sm" />
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{loc.description}</p>

                  <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-slate-200 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">AP Count</div>
                      <div className="font-mono font-bold text-slate-900">{loc.apCount} APs</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Avg Speed</div>
                      <div className="font-mono font-bold text-indigo-600">{loc.avgDownload} M</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Latency</div>
                      <div className="font-mono font-bold text-slate-700">{loc.avgPing} ms</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {loc.openComplaints} Open Ticket{loc.openComplaints !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => deleteLocation(loc.id)}
                      className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium"
                      title="Delete this campus location"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Campus Location Modal */}
      {isAddLocationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                <span>Add Monitored Campus Zone</span>
              </h3>
              <button
                onClick={() => setIsAddLocationOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddLocationSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Complex Lecture Hall B"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Building</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Block"
                    value={newLocBuilding}
                    onChange={(e) => setNewLocBuilding(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Floor</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Floor 2"
                    value={newLocFloor}
                    onChange={(e) => setNewLocFloor(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">AP Count</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newLocApCount}
                    onChange={(e) => setNewLocApCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target DL (M)</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={newLocTargetDl}
                    onChange={(e) => setNewLocTargetDl(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Ping</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={newLocTargetPing}
                    onChange={(e) => setNewLocTargetPing(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe venue usage, RF characteristics, and concurrency..."
                  value={newLocDescription}
                  onChange={(e) => setNewLocDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddLocationOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};