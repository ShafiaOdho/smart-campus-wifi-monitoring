# Smart Campus Wi-Fi Monitoring & Network Health Dashboard
## Enterprise Architecture & Role-Based System Documentation

---

## 1. Executive Summary
This project delivers a **Smart Campus Wi-Fi Monitoring & Network Health Platform** engineered with a clean, modern enterprise Light Theme UI. It provides strict Role-Based Access Control (RBAC), separated role workspaces, live speed testing, automated outage detection, AP device management, and autonomous AI predictive analytics.

---

## 2. Distinct Role-Based Workspaces

### 1. Student / End User Portal
- **Real-Time Speed Testing**: Run live multi-stream download, upload, ping, and packet loss benchmarks on the active campus Wi-Fi connection.
- **Location Selection**: Select any admin-managed campus location (Computer Labs, Library floors, Hostels, Cafeteria).
- **Personal Test History**: View past benchmark logs and health index trends.
- **Ticket Submission**: Report Wi-Fi issues with auto-attached speed test metrics and real-time NLP classification.
- **Campus Outage Ticker**: Real-time awareness of active network blackouts.

### 2. IT Support Staff Workspace
- **Ticket Queue**: Filterable support board with statuses (`Submitted` $\rightarrow$ `Reviewed` $\rightarrow$ `Assigned` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved`).
- **Attached Diagnostics**: View the user's attached download, upload, ping, and packet loss snapshot directly within the ticket.
- **Investigation Logs**: Log technician maintenance notes and assign tickets.
- **Outage Resolution**: One-click resolution for active outage clusters.

### 3. Network Engineer / IT Manager Workspace
- **Executive Telemetry Cards**: Average speed, baseline latency, problem zones, active AP device counts.
- **Visual Analytics (Recharts)**:
  - **Bandwidth vs. Latency Curves**: 24-hour and 7-day hourly area charts.
  - **Location Comparison**: Building-by-building throughput and health score bar chart.
  - **Issue Category Breakdown**: Donut chart of common student complaints.
- **AP Performance Matrix**: Table ranking all zones by throughput, latency, AP density, and open tickets.

### 4. Administrator Control Center
- **Wi-Fi Access Point (AP) Management**: Full CRUD interface to register, monitor, and manage physical AP devices (Device Name, Assigned Location, IP Address, MAC Address, Model, Online/Offline Status).
- **Location & Topology Management**: Provision new campus buildings, rooms, and assign AP counts.
- **User & Staff Directory (RBAC)**: Manage user accounts, faculty departments, and assign permissions.
- **Health Formula Configurator**: Tune weights for Download throughput, Upload, Latency, and Packet Loss in real time.
- **System Backup**: Export complete telemetry datasets to JSON.

### 5. AI Intelligence Hub (Section 10)
- **AI Executive IT Briefing**: Natural language summary with campus health letter grades ($A, B+, C$).
- **Network Anomaly Detector**: Flags throughput drops ($>35\%$) and latency spikes ($>200\%$) vs baseline.
- **Outage Risk Predictor**: Probability scoring for imminent failures based on test velocity and ticket density.
- **Peak Concurrency Forecast**: Predicts degradation windows (e.g. *12:00 PM – 2:30 PM in Library Floor 2*).
- **Actionable Upgrade Recommendations**: Hardware/channel tuning steps with estimated performance ROI.

---

## 3. How to Run & Demo
1. Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.
2. Use the top right **Role Switcher** (`Student`, `IT Support`, `Network Engineer`, `Administrator`) to demonstrate each perspective.