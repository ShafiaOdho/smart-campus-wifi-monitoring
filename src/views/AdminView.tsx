import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownCircle,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Database,
  Download,
  Edit3,
  Filter,
  Flame,
  KeyRound,
  Layers,
  MapPin,
  PieChart as PieChartIcon,
  Plus,
  Radio,
  Save,
  Search,
  Shield,
  Sliders,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
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
import { useAppStore, store } from '../services/store';
import { CampusLocation, NetworkThresholdConfig, UserAccount, UserRole } from '../types';
import { HealthBadge } from '../components/HealthBadge';
import { MetricCard } from '../components/MetricCard';
import { createStaffAccountByAdmin } from '../services/authService';
import { exportCampusNetworkExcelReport } from '../utils/excelExport';

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  admin: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  manager: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  it_staff: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  student: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const CHART_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AdminView: React.FC = () => {
  const {
    locations,
    addLocation,
    updateLocation,
    deleteLocation,
    devices,
    addDevice,
    updateDeviceStatus,
    deleteDevice,
    users,
    addUser,
    updateUserDetails,
    updateUserRole,
    deleteUser,
    complaints,
    speedTests,
    staffNoteNotifications,
    thresholds,
    updateThresholds,
    clearDummyDataAndStartLive,
    resetToSampleData,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'users' | 'locations' | 'staff' | 'devices' | 'thresholds' | 'system'
  >('analytics');

  // Filter & Search states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [deviceSearchQuery, setDeviceSearchQuery] = useState('');

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserAccount | null>(null);

  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [isEditLocationModalOpen, setIsEditLocationModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<CampusLocation | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('it_staff');
  const [newUserDept, setNewUserDept] = useState('Campus IT Support');
  const [userSuccessMsg, setUserSuccessMsg] = useState(false);

  // New Device Form State
  const [newDevName, setNewDevName] = useState('');
  const [newDevLocId, setNewDevLocId] = useState(locations[0]?.id || '');
  const [newDevIp, setNewDevIp] = useState('');
  const [newDevModel, setNewDevModel] = useState('Cisco Catalyst 9130AX Wi-Fi 6');
  const [devSuccessMsg, setDevSuccessMsg] = useState(false);

  // New Location Form State
  const [newLocName, setNewLocName] = useState('');
  const [newLocBuilding, setNewLocBuilding] = useState('');
  const [newLocFloor, setNewLocFloor] = useState('Floor 1');
  const [newLocDescription, setNewLocDescription] = useState('');
  const [newLocApCount, setNewLocApCount] = useState(4);
  const [newLocDl, setNewLocDl] = useState(50);
  const [newLocPing, setNewLocPing] = useState(20);
  const [locSuccessMsg, setLocSuccessMsg] = useState(false);

  // Thresholds state
  const [tempThresholds, setTempThresholds] = useState<NetworkThresholdConfig>({ ...thresholds });
  const [thresholdSavedMsg, setThresholdSavedMsg] = useState(false);
  const [excelExportSuccessMsg, setExcelExportSuccessMsg] = useState(false);
  const [liveModeMsg, setLiveModeMsg] = useState(false);
  const [demoResetMsg, setDemoResetMsg] = useState(false);

  // Handler: Add User / Provision Staff
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    try {
      const newUser = await createStaffAccountByAdmin({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newUserRole,
        department: newUserDept.trim() || 'Campus Community',
      });
      addUser(newUser);
      setNewUserName('');
      setNewUserEmail('');
      setUserSuccessMsg(true);
      setIsAddUserModalOpen(false);
      setTimeout(() => setUserSuccessMsg(false), 3500);
    } catch (err) {
      console.error('Failed to provision user:', err);
    }
  };

  // Handler: Save Edited User
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    updateUserDetails(userToEdit.id, {
      name: userToEdit.name,
      department: userToEdit.department,
      role: userToEdit.role,
    });
    setIsEditUserModalOpen(false);
    setUserToEdit(null);
  };

  // Handler: Add Location
  const handleAddLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocBuilding.trim()) return;
    addLocation({
      name: newLocName.trim(),
      building: newLocBuilding.trim(),
      floor: newLocFloor.trim() || 'Floor 1',
      description: newLocDescription.trim() || 'Monitored campus zone.',
      currentStatus: 'Good',
      currentHealthScore: 80,
      avgDownload: newLocDl,
      avgUpload: Math.round(newLocDl * 0.4),
      avgPing: newLocPing,
      packetLoss: 0.6,
      apCount: newLocApCount,
      capacityScore: 65,
      coordinates: { x: 50, y: 50 },
    });
    setNewLocName('');
    setNewLocBuilding('');
    setNewLocFloor('Floor 1');
    setNewLocDescription('');
    setIsAddLocationModalOpen(false);
    setLocSuccessMsg(true);
    setTimeout(() => setLocSuccessMsg(false), 3500);
  };

  // Handler: Save Edited Location
  const handleEditLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationToEdit) return;
    updateLocation(locationToEdit.id, {
      name: locationToEdit.name,
      building: locationToEdit.building,
      floor: locationToEdit.floor,
      description: locationToEdit.description,
      apCount: locationToEdit.apCount,
      avgDownload: locationToEdit.avgDownload,
      avgPing: locationToEdit.avgPing,
    });
    setIsEditLocationModalOpen(false);
    setLocationToEdit(null);
  };

  // Handler: Add Device
  const handleAddDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevName.trim() || !newDevIp.trim()) return;
    const loc = locations.find((l) => l.id === newDevLocId) || locations[0];
    addDevice({
      name: newDevName.trim(),
      locationId: loc.id,
      locationName: loc.name,
      ipAddress: newDevIp.trim(),
      macAddress: '00:2B:67:8A:' + Math.floor(Math.random() * 89 + 10),
      status: 'Online',
      model: newDevModel,
      channel: 'CH 36 (5 GHz)',
      clientsConnected: Math.floor(Math.random() * 30 + 5),
    });
    setNewDevName('');
    setNewDevIp('');
    setDevSuccessMsg(true);
    setTimeout(() => setDevSuccessMsg(false), 3500);
  };

  // Handler: Save Thresholds
  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateThresholds(tempThresholds);
    setThresholdSavedMsg(true);
    setTimeout(() => setThresholdSavedMsg(false), 3500);
  };

  // Handler: Export System State JSON
  const handleExportSystemJson = () => {
    const fullState = store.getState();
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `SmartCampus_System_Backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handler: Export Excel Workbook
  const handleExportExcel = () => {
    exportCampusNetworkExcelReport({
      locations,
      complaints,
      devices,
      speedTests,
      staffNoteNotifications,
    });
    setExcelExportSuccessMsg(true);
    setTimeout(() => setExcelExportSuccessMsg(false), 3500);
  };

  // Analytics Computations
  const totalUsers = users.length;
  const studentsCount = users.filter((u) => u.role === 'student').length;
  const staffCount = users.filter((u) => u.role === 'it_staff').length;
  const managersCount = users.filter((u) => u.role === 'manager').length;
  const adminsCount = users.filter((u) => u.role === 'admin').length;

  const onlineAPs = devices.filter((d) => d.status === 'Online').length;
  const degradedAPs = devices.filter((d) => d.status === 'Degraded').length;
  const offlineAPs = devices.filter((d) => d.status === 'Offline').length;

  const avgDownload = Number(
    (speedTests.reduce((acc, t) => acc + t.downloadSpeed, 0) / (speedTests.length || 1)).toFixed(1)
  );
  const avgPing = Math.round(
    speedTests.reduce((acc, t) => acc + t.ping, 0) / (speedTests.length || 1)
  );

  const resolvedTickets = complaints.filter((c) => c.status === 'Resolved').length;
  const openTickets = complaints.filter((c) => c.status !== 'Resolved').length;
  const resolutionRate = Math.round((resolvedTickets / (complaints.length || 1)) * 100);

  // Role Breakdown Pie Data
  const roleDistributionData = [
    { name: 'Students', value: studentsCount, color: '#10b981' },
    { name: 'IT Support', value: staffCount, color: '#f59e0b' },
    { name: 'Engineers', value: managersCount, color: '#4f46e5' },
    { name: 'Admins', value: adminsCount, color: '#ef4444' },
  ];

  // 24-Hour System Bandwidth & Concurrency Data
  const systemTrafficTimeline = [
    { time: '00:00', throughput: 18, activeClients: 120, latency: 15 },
    { time: '04:00', throughput: 12, activeClients: 45, latency: 12 },
    { time: '08:00', throughput: 64, activeClients: 480, latency: 22 },
    { time: '10:00', throughput: 82, activeClients: 890, latency: 28 },
    { time: '12:00', throughput: 95, activeClients: 1140, latency: 38 },
    { time: '14:00', throughput: 88, activeClients: 1080, latency: 34 },
    { time: '16:00', throughput: 76, activeClients: 820, latency: 29 },
    { time: '18:00', throughput: 68, activeClients: 640, latency: 24 },
    { time: '20:00', throughput: 55, activeClients: 510, latency: 21 },
    { time: '22:00', throughput: 38, activeClients: 290, latency: 18 },
  ];

  // Building Hardware & Fleet Distribution
  const buildingFleetData = Array.from(new Set(locations.map((l) => l.building))).map((bldg) => {
    const bldgLocations = locations.filter((l) => l.building === bldg);
    const bldgLocIds = bldgLocations.map((l) => l.id);
    const bldgDevices = devices.filter((d) => bldgLocIds.includes(d.locationId));
    const online = bldgDevices.filter((d) => d.status === 'Online').length;
    const offline = bldgDevices.filter((d) => d.status !== 'Online').length;
    const totalAPs = bldgLocations.reduce((acc, l) => acc + l.apCount, 0);
    return {
      building: bldg.replace('Building', 'Bldg'),
      online,
      offline,
      capacity: totalAPs,
    };
  });

  // Complaint Category Breakdown
  const categoryCountMap: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCountMap[c.category] = (categoryCountMap[c.category] || 0) + 1;
  });
  const complaintCategoryData = Object.entries(categoryCountMap).map(([category, count]) => ({
    category,
    count,
  }));

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesQuery && matchesRole;
  });

  // Filtered Locations List
  const filteredLocations = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
      l.building.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
      l.floor.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );

  // Filtered Devices List
  const filteredDevices = devices.filter(
    (d) =>
      d.name.toLowerCase().includes(deviceSearchQuery.toLowerCase()) ||
      d.locationName.toLowerCase().includes(deviceSearchQuery.toLowerCase()) ||
      d.ipAddress.toLowerCase().includes(deviceSearchQuery.toLowerCase()) ||
      d.macAddress.toLowerCase().includes(deviceSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <span>Campus Infrastructure &amp; RBAC Administration</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Master control for user permissions, campus building topologies, hardware infrastructure, health thresholds, and system analytics
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('analytics')}
            className={
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ' +
              (activeTab === 'analytics'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900')
            }
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Analytics Board</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ' +
              (activeTab === 'users'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900')
            }
          >
            <Users className="h-3.5 w-3.5" />
            <span>Users &amp; RBAC ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ' +
              (activeTab === 'locations'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900')
            }
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Locations ({locations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ' +
              (activeTab === 'staff'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900')
            }
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>IT Staff ({staffCount + managersCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ' +
              (activeTab === 'devices'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900')
            }
          >
            <Radio className="h-3.5 w-3.5" />
            <span>AP Hardware ({devices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('thresholds')}
            className={
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ' +
              (activeTab === 'thresholds'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900')
            }
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Thresholds</span>
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ' +
              (activeTab === 'system'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900')
            }
          >
            <Database className="h-3.5 w-3.5" />
            <span>Reports &amp; Backup</span>
          </button>
        </div>
      </div>

      {/* Real-Time Live Mode Controller Box */}
      <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
              </span>
              <h3 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                <span>Production Mode &amp; Real-Time Data Engine</span>
              </h3>
              <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300 uppercase tracking-wider">
                Live Switch
              </span>
            </div>
            <p className="text-xs text-emerald-900/80 max-w-2xl leading-relaxed">
              Delete all mock speed tests, pre-seeded dummy complaint tickets, and placeholder logs. Switch to a <strong>100% clean, real-time database</strong> where only real user actions and live network tests are captured.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                if (confirm('Delete all dummy mock records and start 100% Real-Time Live Mode?')) {
                  clearDummyDataAndStartLive();
                  setLiveModeMsg(true);
                  setTimeout(() => setLiveModeMsg(false), 4500);
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 font-bold text-white text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Dummy Data &amp; Start Realtime</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Reload realistic hackathon demo sample datasets?')) {
                  resetToSampleData();
                  setDemoResetMsg(true);
                  setTimeout(() => setDemoResetMsg(false), 4000);
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 font-bold text-slate-700 text-xs shadow-sm transition-all cursor-pointer"
            >
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              <span>Reset Demo Seed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Alerts / Success Messages */}
      {liveModeMsg && (
        <div className="rounded-xl bg-emerald-100 border-2 border-emerald-300 p-3.5 text-xs font-extrabold text-emerald-900 flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
          <span>Dummy data successfully deleted! System is now operating in 100% Real-Time Live Mode. All tests and tickets are live.</span>
        </div>
      )}
      {demoResetMsg && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800 flex items-center gap-2">
          <Flame className="h-4 w-4 text-rose-600" />
          <span>Demo seed datasets reloaded successfully.</span>
        </div>
      )}
      {userSuccessMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>User account successfully provisioned and synchronized with Firebase!</span>
        </div>
      )}
      {locSuccessMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Campus location topology saved and monitored live.</span>
        </div>
      )}
      {excelExportSuccessMsg && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-xs font-bold text-indigo-800 flex items-center gap-2">
          <Download className="h-4 w-4 text-indigo-600" />
          <span>Multi-sheet styled Excel report exported successfully!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ANALYTICS BOARD (Graphs & System-Wide Analytics) */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="System User Population"
              value={totalUsers}
              unit="Accounts"
              trend={{ value: '+5.4%', isPositive: true }}
              icon={<Users className="h-5 w-5" />}
              subtitle={`${studentsCount} Students • ${staffCount + managersCount} Staff`}
            />
            <MetricCard
              title="AP Gateway Fleet Health"
              value={`${onlineAPs}/${devices.length}`}
              unit="APs Online"
              icon={<Radio className="h-5 w-5" />}
              subtitle={`${degradedAPs} Degraded • ${offlineAPs} Offline`}
            />
            <MetricCard
              title="Mean Campus Speed"
              value={avgDownload}
              unit="Mbps Mean"
              trend={{ value: '+3.2%', isPositive: true }}
              icon={<Activity className="h-5 w-5" />}
              subtitle={`Roundtrip Ping: ${avgPing} ms`}
            />
            <MetricCard
              title="Ticket Resolution Rate"
              value={`${resolutionRate}%`}
              unit="Resolved"
              trend={{ value: '+1.8%', isPositive: true }}
              icon={<CheckCircle2 className="h-5 w-5" />}
              subtitle={`${resolvedTickets} Resolved • ${openTickets} in Queue`}
            />
          </div>

          {/* Graphs Row 1: 24h Bandwidth & Load AreaChart + RBAC Role Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 24-Hour System Bandwidth & Concurrency AreaChart */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    <span>Campus Bandwidth Throughput &amp; Client Concurrency (24h)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live system load monitoring aggregated across all gateway controllers
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200">
                  Peak: 95 Mbps / 1,140 Devices
                </span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={systemTrafficTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminThroughputGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="adminClientGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="throughput"
                      name="Throughput (Mbps)"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#adminThroughputGrad)"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="activeClients"
                      name="Active Client Probes"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#adminClientGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RBAC Role Composition Donut Chart */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <PieChartIcon className="h-4 w-4 text-indigo-600" />
                  <span>RBAC Role Distribution</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Account permission breakdown across all registered portal users
                </p>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {roleDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} accounts`, name]}
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

              {/* Legend Summary List */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                {roleDistributionData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {item.value} ({((item.value / (totalUsers || 1)) * 100).toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Graphs Row 2: Building AP Fleet Health + Issue Category Inflow */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Building AP Fleet BarChart */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <span>AP Fleet Online vs. Offline Status by Building</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Hardware availability comparison across campus facility zones
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={buildingFleetData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="building" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="online" name="Online APs" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="offline" name="Offline / Degraded" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Complaint Inflow by Issue Category */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Wi-Fi Complaints &amp; Failure Mode Inflow</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Distribution of student-reported network pain points
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={complaintCategoryData}
                    margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis dataKey="category" type="category" tick={{ fill: '#475569', fontSize: 10 }} width={110} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" name="Reported Incidents" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER DIRECTORY & RBAC PERMISSIONS */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span>Authorized Personnel &amp; RBAC Directory</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage user roles, assign system privileges, edit staff profiles, and revoke unauthorized access
                </p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 font-bold text-white text-xs shadow-sm transition-all self-start sm:self-auto"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>+ Provision User / Staff</span>
              </button>
            </div>

            {/* Search and Role Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or department..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Role:
                </span>
                {(['all', 'student', 'it_staff', 'manager', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={
                      'px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ' +
                      (userRoleFilter === r
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                    }
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* User Directory Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Department / Unit</th>
                    <th className="py-3 px-4">Assigned Role (RBAC)</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const roleBadge = ROLE_COLORS[u.role] || ROLE_COLORS.student;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {u.name.charAt(0)}
                            </div>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">{u.email}</td>
                        <td className="py-3 px-4 text-slate-600">{u.department}</td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
                          >
                            <option value="student">Student (Speed Test &amp; Complaints)</option>
                            <option value="it_staff">IT Support (Ticketing &amp; Logs)</option>
                            <option value="manager">Network Manager (Analytics &amp; Zones)</option>
                            <option value="admin">Administrator (Full Control)</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setUserToEdit({ ...u });
                                setIsEditUserModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                              title="Edit user details"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete user account "${u.name}"?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No user accounts matched your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CAMPUS BUILDINGS & LOCATIONS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                  <span>Campus Buildings &amp; Monitored Zones</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure building physical layouts, floor designations, target throughput SLAs, and AP allocations
                </p>
              </div>
              <button
                onClick={() => setIsAddLocationModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 font-bold text-white text-xs shadow-sm transition-all self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Campus Location</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by zone name, building, or floor..."
                value={locationSearchQuery}
                onChange={(e) => setLocationSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Locations Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Zone / Location Name</th>
                    <th className="py-3 px-4">Building</th>
                    <th className="py-3 px-4">Floor</th>
                    <th className="py-3 px-4">Health Status</th>
                    <th className="py-3 px-4 text-right">Avg Download</th>
                    <th className="py-3 px-4 text-right">Ping Latency</th>
                    <th className="py-3 px-4 text-center">APs Deployed</th>
                    <th className="py-3 px-4 text-center">Open Complaints</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLocations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                          <span>{loc.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{loc.building}</td>
                      <td className="py-3 px-4 text-slate-600">{loc.floor}</td>
                      <td className="py-3 px-4">
                        <HealthBadge status={loc.currentStatus} score={loc.currentHealthScore} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-700">
                        {loc.avgDownload} Mbps
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">{loc.avgPing} ms</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">{loc.apCount}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-bold ${
                            loc.openComplaints > 0 ? 'text-rose-600' : 'text-slate-400'
                          }`}
                        >
                          {loc.openComplaints}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setLocationToEdit({ ...loc });
                              setIsEditLocationModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Edit location parameters"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete campus zone "${loc.name}"?`)) {
                                deleteLocation(loc.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete location"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: IT SUPPORT STAFF MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quick Provisioning Card */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-indigo-600" />
              <span>Provision Staff Account</span>
            </h3>
            <p className="text-xs text-slate-500">
              Create authorized credentials for IT Support Staff and Network Engineers.
            </p>
            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Staff Member Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Wright"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. m.wright@smartcampus.edu"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Role / Department</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-bold text-indigo-700"
                >
                  <option value="it_staff">IT Support Staff (Ticketing &amp; Resolution)</option>
                  <option value="manager">Network Engineer / Manager (Analytics &amp; Topology)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Department</label>
                <input
                  type="text"
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 font-bold text-white shadow-sm transition-all"
              >
                + Provision Staff Credentials
              </button>
            </form>
          </div>

          {/* Active IT Support Staff Roster */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <span>Active IT Support &amp; Network Operations Team</span>
            </h3>
            <p className="text-xs text-slate-500">
              Operational roster of technicians, network engineers, and ticket handlers
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users
                .filter((u) => u.role === 'it_staff' || u.role === 'manager')
                .map((staff) => {
                  const assignedTickets = complaints.filter(
                    (c) => c.assignedStaff?.toLowerCase() === staff.name.toLowerCase()
                  ).length;
                  const notesLogged = (staffNoteNotifications || []).filter(
                    (n) => n.author?.toLowerCase() === staff.name.toLowerCase()
                  ).length;

                  return (
                    <div
                      key={staff.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{staff.name}</div>
                            <div className="text-[11px] text-slate-500">{staff.email}</div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            staff.role === 'manager'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {staff.role === 'manager' ? 'Network Engineer' : 'IT Support'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                        <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                          <div className="text-[10px] text-slate-400">Assigned Tickets</div>
                          <div className="font-bold font-mono text-indigo-600">{assignedTickets}</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                          <div className="text-[10px] text-slate-400">Field Notes Logged</div>
                          <div className="font-bold font-mono text-emerald-600">{notesLogged}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AP HARDWARE & DEVICES */}
      {/* ========================================================================= */}
      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-600" />
              <span>Register AP Device</span>
            </h3>
            {devSuccessMsg && (
              <div className="rounded-lg bg-emerald-50 text-emerald-800 p-2 text-xs border border-emerald-200">
                Device registered in inventory!
              </div>
            )}
            <form onSubmit={handleAddDeviceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Device Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AP-LIB-02"
                  value={newDevName}
                  onChange={(e) => setNewDevName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Assigned Zone</label>
                <select
                  value={newDevLocId}
                  onChange={(e) => setNewDevLocId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">IP Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10.20.15.22"
                  value={newDevIp}
                  onChange={(e) => setNewDevIp(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Hardware Model</label>
                <select
                  value={newDevModel}
                  onChange={(e) => setNewDevModel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                >
                  <option value="Cisco Catalyst 9130AX Wi-Fi 6">Cisco Catalyst 9130AX Wi-Fi 6</option>
                  <option value="Aruba AP-535 Wi-Fi 6">Aruba AP-535 Wi-Fi 6</option>
                  <option value="Ubiquiti UniFi U6-Pro">Ubiquiti UniFi U6-Pro</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 font-bold text-white shadow-sm"
              >
                + Add AP Gateway
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Configured Campus Access Points</h3>
              <input
                type="text"
                placeholder="Search AP or IP..."
                value={deviceSearchQuery}
                onChange={(e) => setDeviceSearchQuery(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900 w-48"
              />
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Device Name</th>
                    <th className="py-2.5 px-3">Location Zone</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Hardware Model</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDevices.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{d.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{d.locationName}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{d.ipAddress}</td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">{d.model}</td>
                      <td className="py-2.5 px-3">
                        <select
                          value={d.status}
                          onChange={(e) =>
                            updateDeviceStatus(d.id, e.target.value as 'Online' | 'Offline' | 'Degraded')
                          }
                          className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${
                            d.status === 'Online'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : d.status === 'Degraded'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <option value="Online">Online</option>
                          <option value="Degraded">Degraded</option>
                          <option value="Offline">Offline</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => deleteDevice(d.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: HEALTH SCORE FORMULA THRESHOLDS */}
      {/* ========================================================================= */}
      {activeTab === 'thresholds' && (
        <form
          onSubmit={handleSaveThresholds}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-600" />
                <span>Network Health Score Formula Weights &amp; Benchmark Thresholds</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fine-tune algorithm weight percentages. When saved, all campus zones recalculate their composite health score instantly.
              </p>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 font-bold text-white text-xs shadow-sm"
            >
              Save Weights
            </button>
          </div>

          {thresholdSavedMsg && (
            <div className="rounded-lg bg-emerald-50 text-emerald-800 p-2 text-xs border border-emerald-200 font-bold">
              Formula weights and benchmarks applied live to all campus calculation engines!
            </div>
          )}

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Download Speed Weight</span>
                <span className="font-mono text-indigo-600">
                  {Math.round(tempThresholds.weightDownload * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={tempThresholds.weightDownload}
                onChange={(e) =>
                  setTempThresholds({
                    ...tempThresholds,
                    weightDownload: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-slate-400">Impact on final 0-100 composite health score.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Upload Speed Weight</span>
                <span className="font-mono text-cyan-600">
                  {Math.round(tempThresholds.weightUpload * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={tempThresholds.weightUpload}
                onChange={(e) =>
                  setTempThresholds({
                    ...tempThresholds,
                    weightUpload: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-cyan-600"
              />
              <p className="text-[11px] text-slate-400">Upstream client capacity impact.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Latency (Ping) Weight</span>
                <span className="font-mono text-emerald-600">
                  {Math.round(tempThresholds.weightPing * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={tempThresholds.weightPing}
                onChange={(e) =>
                  setTempThresholds({
                    ...tempThresholds,
                    weightPing: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-emerald-600"
              />
              <p className="text-[11px] text-slate-400">Real-time conferencing latency sensitivity.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Packet Loss Weight</span>
                <span className="font-mono text-amber-600">
                  {Math.round(tempThresholds.weightPacketLoss * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={tempThresholds.weightPacketLoss}
                onChange={(e) =>
                  setTempThresholds({
                    ...tempThresholds,
                    weightPacketLoss: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-amber-600"
              />
              <p className="text-[11px] text-slate-400">Transmission jitter &amp; dropped frame penalty.</p>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: REPORTS, BACKUP & SYSTEM MAINTENANCE */}
      {/* ========================================================================= */}
      {activeTab === 'system' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">System Reports, State Backups &amp; Maintenance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="font-bold text-indigo-950 flex items-center gap-1.5 mb-1">
                  <Download className="h-4 w-4 text-indigo-600" />
                  <span>Export Formatted Excel Report (.xls)</span>
                </div>
                <p className="text-slate-600">
                  Multi-sheet structured Excel workbook with executive KPI summaries, location benchmarks, ticket queue audit, and AP inventory.
                </p>
              </div>
              <button
                onClick={handleExportExcel}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 font-bold text-white shadow-sm transition-all text-center"
              >
                Download Excel Workbook
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Database className="h-4 w-4 text-slate-700" />
                  <span>Export Raw State JSON</span>
                </div>
                <p className="text-slate-500">
                  Complete telemetry and user database JSON backup for programmatic data archiving and migration.
                </p>
              </div>
              <button
                onClick={handleExportSystemJson}
                className="w-full rounded-xl bg-white border border-slate-300 py-2.5 font-bold text-slate-700 shadow-sm hover:bg-slate-100 text-center"
              >
                Export JSON State
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="font-bold text-rose-700 flex items-center gap-1.5 mb-1">
                  <Flame className="h-4 w-4 text-rose-600" />
                  <span>Reset Demo State</span>
                </div>
                <p className="text-slate-500">
                  Repopulate pre-configured realistic hackathon demonstration datasets.
                </p>
              </div>
              <button
                onClick={resetToSampleData}
                className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 font-bold text-white shadow-sm text-center"
              >
                Reset Demo Seed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PROVISION / ADD USER */}
      {/* ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-indigo-600" />
                <span>Provision User / Staff Account</span>
              </h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. j.hayes@smartcampus.edu"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Role (RBAC)</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-bold text-indigo-700"
                >
                  <option value="student">Student (Standard User)</option>
                  <option value="it_staff">IT Support Staff</option>
                  <option value="manager">Network Engineer / Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department / Faculty</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science / IT Services"
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 font-bold text-white shadow-sm"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER */}
      {/* ========================================================================= */}
      {isEditUserModalOpen && userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-indigo-600" />
                <span>Edit User Profile</span>
              </h3>
              <button
                onClick={() => setIsEditUserModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userToEdit.name}
                  onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={userToEdit.email}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Role (RBAC)</label>
                <select
                  value={userToEdit.role}
                  onChange={(e) => setUserToEdit({ ...userToEdit, role: e.target.value as UserRole })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-bold text-indigo-700"
                >
                  <option value="student">Student</option>
                  <option value="it_staff">IT Support Staff</option>
                  <option value="manager">Network Engineer / Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={userToEdit.department}
                  onChange={(e) => setUserToEdit({ ...userToEdit, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 font-bold text-white shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD LOCATION */}
      {/* ========================================================================= */}
      {isAddLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-600" />
                <span>Add Monitored Campus Location</span>
              </h3>
              <button
                onClick={() => setIsAddLocationModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddLocationSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Zone / Location Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Complex Lab 3"
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Building</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Block A"
                    value={newLocBuilding}
                    onChange={(e) => setNewLocBuilding(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Floor Designation</label>
                  <input
                    type="text"
                    value={newLocFloor}
                    onChange={(e) => setNewLocFloor(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">AP Count</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newLocApCount}
                    onChange={(e) => setNewLocApCount(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Speed (Mbps)</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={newLocDl}
                    onChange={(e) => setNewLocDl(parseInt(e.target.value) || 30)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. High-density student lecture area with dual Wi-Fi 6 APs"
                  value={newLocDescription}
                  onChange={(e) => setNewLocDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLocationModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 font-bold text-white shadow-sm"
                >
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT LOCATION */}
      {/* ========================================================================= */}
      {isEditLocationModalOpen && locationToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-indigo-600" />
                <span>Edit Campus Location: {locationToEdit.name}</span>
              </h3>
              <button
                onClick={() => setIsEditLocationModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditLocationSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Zone Name</label>
                  <input
                    type="text"
                    required
                    value={locationToEdit.name}
                    onChange={(e) => setLocationToEdit({ ...locationToEdit, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Building</label>
                  <input
                    type="text"
                    required
                    value={locationToEdit.building}
                    onChange={(e) => setLocationToEdit({ ...locationToEdit, building: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Floor</label>
                  <input
                    type="text"
                    value={locationToEdit.floor}
                    onChange={(e) => setLocationToEdit({ ...locationToEdit, floor: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">APs Deployed</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={locationToEdit.apCount}
                    onChange={(e) =>
                      setLocationToEdit({
                        ...locationToEdit,
                        apCount: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Benchmark DL</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={locationToEdit.avgDownload}
                    onChange={(e) =>
                      setLocationToEdit({
                        ...locationToEdit,
                        avgDownload: parseInt(e.target.value) || 30,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={locationToEdit.description}
                  onChange={(e) => setLocationToEdit({ ...locationToEdit, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditLocationModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 font-bold text-white shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
