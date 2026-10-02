export type UserRole = 'student' | 'it_staff' | 'manager' | 'admin';

export type HealthStatus = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';

export type ComplaintCategory =
  | 'No Internet'
  | 'Slow Internet'
  | 'High Ping'
  | 'Frequent Disconnection'
  | 'Weak Signal'
  | 'Website / Service Unavailable'
  | 'Other';

export type ComplaintStatus =
  | 'Submitted'
  | 'Reviewed'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  createdAt: string;
}

export interface NetworkDevice {
  id: string;
  name: string;
  locationId: string;
  locationName: string;
  ipAddress: string;
  macAddress: string;
  status: 'Online' | 'Offline' | 'Degraded';
  model: string;
  channel: string;
  clientsConnected: number;
  lastSeen: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  building: string;
  floor: string;
  description: string;
  currentStatus: HealthStatus;
  currentHealthScore: number;
  avgDownload: number; // Mbps
  avgUpload: number; // Mbps
  avgPing: number; // ms
  packetLoss: number; // %
  totalTests: number;
  openComplaints: number;
  resolvedComplaints: number;
  apCount: number;
  capacityScore: number;
  coordinates: { x: number; y: number };
}

export interface SpeedTestResult {
  id: string;
  userId: string;
  userName: string;
  locationId: string;
  locationName: string;
  building: string;
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  ping: number; // ms
  jitter: number; // ms
  packetLoss: number; // %
  healthScore: number; // 0-100
  healthStatus: HealthStatus;
  testedAt: string;
  connectionType?: string;
  signalStrengthDbm?: number;
}

export interface ITNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  statusChange?: ComplaintStatus;
}

export interface StaffNoteNotification {
  id: string;
  complaintId: string;
  ticketNumber: string;
  locationName: string;
  author: string;
  text: string;
  timestamp: string;
  statusChange?: ComplaintStatus;
  isRead: boolean;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  locationId: string;
  locationName: string;
  building: string;
  category: ComplaintCategory;
  description: string;
  relatedTestId?: string;
  testSnapshot?: {
    downloadSpeed: number;
    uploadSpeed: number;
    ping: number;
    packetLoss: number;
    healthScore: number;
  };
  status: ComplaintStatus;
  assignedStaff?: string;
  priority: PriorityLevel;
  itNotes: ITNote[];
  createdAt: string;
  resolvedAt?: string;
  aiSuggestedCategory?: ComplaintCategory;
  aiConfidence?: number;
}

export interface OutageAlert {
  id: string;
  locationId: string;
  locationName: string;
  building: string;
  title: string;
  description: string;
  severity: 'Warning' | 'Major' | 'Critical';
  detectedAt: string;
  resolved: boolean;
  autoDetected: boolean;
  affectedUsersEstimate: number;
}

export interface AIAnomaly {
  id: string;
  locationId: string;
  locationName: string;
  metric: 'Download Speed' | 'Latency' | 'Packet Loss' | 'Complaint Spike';
  baselineValue: number;
  observedValue: number;
  deviationPercent: number;
  severity: 'Low' | 'Medium' | 'High';
  detectedAt: string;
  explanation: string;
}

export interface PeakUsageForecast {
  locationId: string;
  locationName: string;
  peakWindow: string;
  predictedDegradationPct: number;
  expectedThroughputDropMbps: number;
  recommendedAction: string;
}

export interface AIRecommendation {
  id: string;
  locationId: string;
  locationName: string;
  priority: 'Urgent' | 'High' | 'Moderate' | 'Low';
  title: string;
  actionableStep: string;
  rationale: string;
  impactEstimate: string;
}

export interface NetworkThresholdConfig {
  weightDownload: number;
  weightUpload: number;
  weightPing: number;
  weightPacketLoss: number;
  targetDownloadMbps: number;
  targetUploadMbps: number;
  targetPingMs: number;
  thresholdExcellent: number;
  thresholdGood: number;
  thresholdFair: number;
  thresholdPoor: number;
  outageAutoTriggerComplaintCount: number;
  anomalyDropThresholdPercent: number;
}