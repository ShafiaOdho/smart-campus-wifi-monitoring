# Smart Campus Wi-Fi Monitoring & Network Health Dashboard
## Comprehensive Project Architecture & Technical Explanation Document

---

### Executive Summary
The **Smart Campus Wi-Fi Monitoring & Network Health Dashboard** is a full-stack, enterprise-grade telecommunication and campus IT operations platform. It bridges the gap between student/staff end-user connectivity experiences and central network engineering operations. 

The system provides 4 strictly isolated role portals:
1. **Student / End-User Portal**: Live Wi-Fi speed diagnostics, network health classification, and automated complaint submission with attached diagnostic telemetry.
2. **IT Support Staff Portal**: Real-time ticket management queue, poor-performing zones monitor, problem statement editing, technician field action logging, and live outage resolution.
3. **Network Engineer / Manager Portal**: High-level building comparisons, 24h & 7d throughput/latency trend analysis, recurring problem hotspot analysis, AP zone management, and multi-sheet formatted Excel report generation.
4. **Campus Administrator Portal**: Master RBAC permission control, AP device hardware CRUD, user directory provisioning, mathematical formula weight tuning, and comprehensive system analytics board.

---

### 1. Project Directory & Folder Structure

```
smart-campus-wifi-monitoring/
│
├── public/                       # Public static assets & favicon
│
├── src/                          # Application source code
│   ├── components/               # Reusable UI widgets & modular components
│   ├── services/                 # Core business logic, calculation engines, AI & Firebase
│   ├── types/                    # TypeScript interfaces, types & data models
│   ├── utils/                    # Data export engines (Multi-sheet Excel SpreadsheetML)
│   ├── views/                    # Dedicated role-based portal views
│   ├── App.tsx                   # Main app component, authentication routing & role shell
│   ├── index.css                 # Global CSS styles & Tailwind directives
│   └── main.tsx                  # React application DOM entrypoint
│
├── package.json                  # Dependencies, build scripts & metadata
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite build and bundling configuration
└── tailwind.config.js            # Tailwind theme, typography & palette configuration
```

---

### 2. Important Files & Component Purposes

| Folder | File Name | Purpose & Description |
| :--- | :--- | :--- |
| **`src/views/`** | `StudentView.tsx` | End-user dashboard: 1-click speed test probe, live campus status banner, signal strength indicators, and complaint filing modal. |
| **`src/views/`** | `ITSupportView.tsx` | IT Support technician console: Poor-performing locations monitor, complaint triage queue, inline problem statement editor, and field maintenance note logs. |
| **`src/views/`** | `NetworkManagerView.tsx` | Engineering portal: Building comparison bar charts, dual-axis latency/speed trend analysis, recurring failure mode analysis, and Excel report export. |
| **`src/views/`** | `AdminView.tsx` | Master administration console: System Analytics Board, User Directory & RBAC, Campus Building CRUD, AP Gateway inventory, and health score weight tuning. |
| **`src/views/`** | `AIInsightsView.tsx` | AI Predictive Operations Hub: Statistical anomaly detection, 24-hour peak congestion forecasting, and AI-recommended network remediations. |
| **`src/services/`** | `healthScoreEngine.ts` | Mathematical calculation engine: Evaluates download, upload, ping, and packet loss against configurable SLA weights to yield a 0–100 score. |
| **`src/services/`** | `speedTestEngine.ts` | Real network probing engine: Measures real latency (RTT), jitter, throughput, and signal telemetry via HTTP chunk probing and Web APIs. |
| **`src/services/`** | `aiAnalyticsEngine.ts` | Machine learning & analytical algorithms: Outage prediction, failure clustering, and traffic trend forecasting. |
| **`src/services/`** | `authService.ts` | Authentication pipeline: Firebase Auth registration, email verification, login routing, and Admin staff provisioning. |
| **`src/services/`** | `store.ts` | Central reactive application state store with localStorage persistence and cross-component reactive synchronization. |
| **`src/services/`** | `firestoreSync.ts` | Real-time Firebase Firestore database synchronization for tickets, user profiles, and test snapshots. |
| **`src/utils/`** | `excelExport.ts` | Multi-sheet structured Excel workbook (`.xls`) generator with color-coded headers, zebra striping, and numeric formulas. |
| **`src/components/`** | `SpeedTestModal.tsx` | Interactive speed test modal featuring live gauge animation, throughput graph, and diagnostic telemetry summaries. |
| **`src/components/`** | `ComplaintModal.tsx` | Intelligent issue ticket submission form with automated diagnostic snapshot attachment and AI category tagging. |
| **`src/components/`** | `NotificationCenter.tsx` | Real-time notification drawer streaming technician field actions, outages, and AI anomaly alerts. |
| **`src/components/`** | `CampusHeatmap.tsx` | Interactive 2D campus floor plan with color-coded visual health nodes and AP density indicators. |

---

### 3. How the Speed Test Feature Works

The Speed Test engine (`src/services/speedTestEngine.ts`) performs real network measurements:

```
[Start Test] ──> [Ping / Latency Probe] ──> [Jitter Calculation] ──> [Chunked Download Stream] ──> [Upload Probe] ──> [Health Score Engine]
```

1. **Latency (Ping) Measurement**:
   - Sends multiple sequential HTTP HEAD/GET probe packets to high-availability endpoints with precise browser high-resolution timestamps (`performance.now()`).
   - Calculates the Round-Trip Time (RTT) in milliseconds (`ms`).
2. **Jitter Calculation**:
   - Evaluates the standard deviation of latency variance across successive packet transmissions to determine connection stability.
3. **Download Throughput Measurement**:
   - Streams timed binary data chunks over HTTP fetch.
   - Calculates real-time bitrate: $\text{Speed (Mbps)} = \frac{\text{Bytes Received} \times 8}{\text{Elapsed Time (seconds)} \times 1,000,000}$.
   - Progressively updates the UI gauge and live throughput curve.
4. **Upload Throughput Probe**:
   - Performs timed payload transmission to measure upstream client capacity.
5. **Hardware & Radio Telemetry**:
   - Queries `navigator.connection` (Network Information API) for connection type (e.g., Wi-Fi, Ethernet, 4G/5G) and downlink estimates.
6. **Persistence**:
   - The completed probe snapshot is stored in the central store and Firestore, linking the measurement to the user's selected campus location.

---

### 4. Where Network Health Calculations Are Implemented

The health evaluation engine is located in **`src/services/healthScoreEngine.ts`**.

#### The Mathematical Health Formula:
The composite health score ($H \in [0, 100]$) is computed using a multi-factor weighted algorithm:

$$H = (S_{\text{download}} \times W_{\text{download}}) + (S_{\text{upload}} \times W_{\text{upload}}) + (S_{\text{ping}} \times W_{\text{ping}}) + (S_{\text{loss}} \times W_{\text{loss}})$$

* **Default Benchmark Weights (Configurable by Admin)**:
  * Download Speed Weight ($W_{\text{download}}$): **40%**
  * Latency / Ping Weight ($W_{\text{ping}}$): **25%**
  * Upload Speed Weight ($W_{\text{upload}}$): **20%**
  * Packet Loss Weight ($W_{\text{loss}}$): **15%**
* **Health Tier Classifications**:
  * **Excellent (85 – 100)**: Optimal high-throughput connection.
  * **Good (70 – 84)**: Standard operational quality.
  * **Fair (50 – 69)**: Watchlisted; sub-optimal latency or throughput.
  * **Poor (30 – 49)**: Degraded zone; technician dispatch suggested.
  * **Critical (< 30)**: Severe failure or gateway outage.

---

### 5. Where AI and Intelligent Features Are Implemented

Located in **`src/services/aiAnalyticsEngine.ts`** and **`src/views/AIInsightsView.tsx`**:

1. **Statistical Anomaly Detection (`detectNetworkAnomalies`)**:
   - Calculates moving baseline averages for latency, throughput, and packet loss per zone.
   - Computes statistical $Z$-scores; flags any metric deviation exceeding the configured threshold (e.g., >30% drop below baseline) as an active anomaly.
2. **Predictive Outage & Congestion Forecasting (`predictOutagesAndProblemLocations`)**:
   - Analyzes ticket arrival velocity and recent speed degradation rates.
   - Evaluates risk factors to forecast potential AP failures before total network disruption occurs.
3. **Smart Complaint Categorization & Root-Cause Clustering**:
   - Categorizes user problem statements and links them with attached speed test snapshots.
   - Highlights recurring failure modes (e.g., *Channel Interference*, *High Client Density*, *Gateway Gateway Timeout*).
4. **Automated Actionable Recommendations**:
   - Generates concrete remediation steps for network administrators (e.g., *"Reassign Library AP from CH 36 to CH 149"*, *"Increase Gateway Bandwidth Allocation by 25%"*).

---

### 6. System Component Connections & Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          REACT 19 FRONTEND                            │
│  (Tailwind CSS • Lucide Icons • Recharts • Framer Motion • HTML5 Canvas) │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌─────────────────────────────┐
│       CENTRAL APPLICATION STORE      │  │     ANALYTICS & ENGINES     │
│   (Reactive Store • LocalStorage)    │  │  (Health Score Engine • AI) │
└───────────────────▲──────────────────┘  └──────────────▲──────────────┘
                    │                                    │
                    ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   FIREBASE CLOUD BACKEND & DATABASE                    │
│   (Firebase Authentication • Cloud Firestore Real-time Sync • REST)    │
└────────────────────────────────────────────────────────────────────────┘
```

* **Frontend to Store**: React components subscribe to `useAppStore()`. When tickets, tests, or location parameters are modified, components re-render reactively.
* **Store to Firebase**: All user account modifications, tickets, and speed test snapshots are mirrored to Cloud Firestore via `src/services/firestoreSync.ts` and `src/services/authService.ts`.
* **Export Subsystem**: `src/utils/excelExport.ts` compiles the real-time database state into structured Microsoft XML Spreadsheet (`.xls`) format with full CSS styling.

---

### 7. Evaluation & Testing Credentials (For Judges)

The platform supports pre-configured accounts for instant role-based testing:

| Role Domain | Email Address | Password | Permissions & Available Features |
| :--- | :--- | :--- | :--- |
| **Campus Administrator** | `shafiaodho@gmail.com` *(or `admin@smartcampus.edu`)* | `admin@123` | **Full Master Access**: Analytics board, user provisioning & live RBAC, campus location CRUD, AP hardware status, formula weights tuning, Excel export, and live data purge. |
| **Network Engineer / Manager** | `r.rivera@admin.campus.edu` *(or `manager@smartcampus.edu`)* | `manager@123` | **Engineering Access**: Building comparisons, 24h/7d throughput curves, recurring hotspot analysis, location management, technician activity monitoring, and Excel export. |
| **IT Support Staff** | `jordan.h@it.campus.edu` *(or `support@smartcampus.edu`)* | `staff@123` | **Support Desk Access**: Complaint queue, lifecycle status updates, problem statement editor, poor zones monitor, technician field notes logging, and outage resolution. |
| **Student / End-User** | *Self Sign-Up on Login Dialog* | *Self-created* | **End-User Access**: Real Wi-Fi speed test probe, live campus status banner, personal speed history, and issue ticket submission. |

> **Note for Judges**: To switch between accounts on the live portal, click the user profile at the top right of the navigation bar and select **"Switch Account / Role"** or log out and log in with the credentials above.