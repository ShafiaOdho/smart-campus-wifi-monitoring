import {
  CampusLocation,
  Complaint,
  NetworkDevice,
  SpeedTestResult,
  StaffNoteNotification,
} from '../types';

function escapeXml(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface ExportReportData {
  locations: CampusLocation[];
  complaints: Complaint[];
  devices: NetworkDevice[];
  speedTests: SpeedTestResult[];
  staffNoteNotifications: StaffNoteNotification[];
}

export function exportCampusNetworkExcelReport(data: ExportReportData) {
  const { locations, complaints, devices, speedTests, staffNoteNotifications } = data;

  const totalTestsCount = speedTests.length;
  const avgDownloadAll = Number(
    (speedTests.reduce((acc, t) => acc + t.downloadSpeed, 0) / (totalTestsCount || 1)).toFixed(1)
  );
  const avgPingAll = Math.round(
    speedTests.reduce((acc, t) => acc + t.ping, 0) / (totalTestsCount || 1)
  );
  const avgUploadAll = Number(
    (speedTests.reduce((acc, t) => acc + t.uploadSpeed, 0) / (totalTestsCount || 1)).toFixed(1)
  );
  const poorLocationsCount = locations.filter(
    (l) => l.currentStatus === 'Poor' || l.currentStatus === 'Critical'
  ).length;
  const healthyLocationsCount = locations.length - poorLocationsCount;
  const openComplaintsCount = complaints.filter((c) => c.status !== 'Resolved').length;
  const resolvedComplaintsCount = complaints.filter((c) => c.status === 'Resolved').length;

  const onlineDevicesCount = devices.filter((d) => d.status === 'Online').length;
  const offlineDevicesCount = devices.filter((d) => d.status === 'Offline').length;
  const degradedDevicesCount = devices.filter((d) => d.status === 'Degraded').length;

  const generatedDate = new Date().toLocaleString();
  const fileDate = new Date().toISOString().split('T')[0];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>Smart Campus Wi-Fi Operations &amp; Health Report</Title>
  <Subject>Network Infrastructure Telemetry &amp; Support Audit</Subject>
  <Author>SmartCampus Network Operations</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <!-- Default Normal Style -->
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>

  <!-- Banner / Header Styles -->
  <Style ss:ID="MainTitle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="15" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E1B4B" ss:Pattern="Solid"/>
  </Style>

  <Style ss:ID="SubBanner">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Italic="1" ss:Color="#475569"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
  </Style>

  <Style ss:ID="SectionHeader">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#4338CA" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#312E81"/>
   </Borders>
  </Style>

  <!-- Table Column Headers -->
  <Style ss:ID="TableHeader">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#312E81" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E1B4B"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#6366F1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#6366F1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#6366F1"/>
   </Borders>
  </Style>

  <Style ss:ID="TableHeaderCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#312E81" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E1B4B"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#6366F1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#6366F1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#6366F1"/>
   </Borders>
  </Style>

  <Style ss:ID="TableHeaderRight">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#312E81" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E1B4B"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#6366F1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#6366F1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#6366F1"/>
   </Borders>
  </Style>

  <!-- Cell Data Styles (Odd / White) -->
  <Style ss:ID="CellLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="CellLeftBold">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="CellCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="CellRight">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="CellWrap">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <!-- Number Formats -->
  <Style ss:ID="CellNumber">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="0.0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="CellInteger">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <NumberFormat ss:Format="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <!-- Zebra Striping (Even Rows / Slate Tint) -->
  <Style ss:ID="ZebraLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="ZebraLeftBold">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="ZebraCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="ZebraRight">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="ZebraNumber">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="0.0"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="ZebraInteger">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <NumberFormat ss:Format="0"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="ZebraWrap">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <!-- Status Badges -->
  <Style ss:ID="BadgeExcellent">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Bold="1" ss:Color="#15803D"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
   </Borders>
  </Style>

  <Style ss:ID="BadgeGood">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
   </Borders>
  </Style>

  <Style ss:ID="BadgeFair">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Bold="1" ss:Color="#B45309"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
   </Borders>
  </Style>

  <Style ss:ID="BadgePoor">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Bold="1" ss:Color="#B91C1C"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
   </Borders>
  </Style>

  <Style ss:ID="BadgeCritical">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Bold="1" ss:Color="#BE123C"/>
   <Interior ss:Color="#FFE4E6" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDA4AF"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDA4AF"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDA4AF"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDA4AF"/>
   </Borders>
  </Style>

  <!-- Priority Badges -->
  <Style ss:ID="PriorityCritical">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Bold="1" ss:Color="#BE123C"/>
   <Interior ss:Color="#FFE4E6" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDA4AF"/>
   </Borders>
  </Style>
  <Style ss:ID="PriorityHigh">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Bold="1" ss:Color="#B45309"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
   </Borders>
  </Style>
  <Style ss:ID="PriorityMedium">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Color="#334155"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
  <Style ss:ID="PriorityLow">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Color="#64748B"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>

  <!-- KPI Value Card Style -->
  <Style ss:ID="KPIValue">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="12" ss:Bold="1" ss:Color="#312E81"/>
   <Interior ss:Color="#EEF2FF" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C7D2FE"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C7D2FE"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C7D2FE"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C7D2FE"/>
   </Borders>
  </Style>
 </Styles>

 <!-- ========================================================= -->
 <!-- WORKSHEET 1: EXECUTIVE KPI SUMMARY -->
 <!-- ========================================================= -->
 <Worksheet ss:Name="Executive Summary">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="220"/>
   <Column ss:Width="110"/>
   <Column ss:Width="80"/>
   <Column ss:Width="320"/>
   <Column ss:Width="140"/>

   <!-- Main Title -->
   <Row ss:Height="36">
    <Cell ss:MergeAcross="4" ss:StyleID="MainTitle"><Data ss:Type="String">SMART CAMPUS WI-FI NETWORK - EXECUTIVE HEALTH &amp; OPERATIONS REPORT</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="4" ss:StyleID="SubBanner"><Data ss:Type="String">Report Generated: ${escapeXml(generatedDate)} | Directorate: Network Operations &amp; IT Infrastructure | Platform Version: 2.4.0-Production</Data></Cell>
   </Row>
   <Row ss:Height="12"></Row>

   <!-- KPI Table Header -->
   <Row ss:Height="24">
    <Cell ss:MergeAcross="4" ss:StyleID="SectionHeader"><Data ss:Type="String">1. CORE NETWORK HEALTH &amp; PERFORMANCE BENCHMARKS</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Core Performance Indicator</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Observed Metric</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Unit</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Benchmark Evaluation &amp; Operational Context</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Health Classification</Data></Cell>
   </Row>

   <Row ss:Height="22">
    <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">Campus Mean Download Speed</Data></Cell>
    <Cell ss:StyleID="KPIValue"><Data ss:Type="Number">${avgDownloadAll}</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">Mbps</Data></Cell>
    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">Aggregated throughput averaged across all live client speed probes</Data></Cell>
    <Cell ss:StyleID="${avgDownloadAll >= 50 ? 'BadgeExcellent' : avgDownloadAll >= 30 ? 'BadgeGood' : 'BadgeFair'}"><Data ss:Type="String">${avgDownloadAll >= 50 ? 'Optimal' : avgDownloadAll >= 30 ? 'Acceptable' : 'Degraded'}</Data></Cell>
   </Row>

   <Row ss:Height="22">
    <Cell ss:StyleID="ZebraLeftBold"><Data ss:Type="String">Campus Mean Upload Speed</Data></Cell>
    <Cell ss:StyleID="KPIValue"><Data ss:Type="Number">${avgUploadAll}</Data></Cell>
    <Cell ss:StyleID="ZebraCenter"><Data ss:Type="String">Mbps</Data></Cell>
    <Cell ss:StyleID="ZebraLeft"><Data ss:Type="String">Upstream client transmission capacity across active gateways</Data></Cell>
    <Cell ss:StyleID="${avgUploadAll >= 20 ? 'BadgeExcellent' : 'BadgeGood'}"><Data ss:Type="String">${avgUploadAll >= 20 ? 'Optimal' : 'Standard'}</Data></Cell>
   </Row>

   <Row ss:Height="22">
    <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">Network Roundtrip Latency (Ping)</Data></Cell>
    <Cell ss:StyleID="KPIValue"><Data ss:Type="Number">${avgPingAll}</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">ms</Data></Cell>
    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">Target threshold: &lt; 30 ms for optimal real-time conferencing</Data></Cell>
    <Cell ss:StyleID="${avgPingAll <= 30 ? 'BadgeExcellent' : avgPingAll <= 50 ? 'BadgeGood' : 'BadgePoor'}"><Data ss:Type="String">${avgPingAll <= 30 ? 'Low Latency' : avgPingAll <= 50 ? 'Moderate' : 'High Latency'}</Data></Cell>
   </Row>

   <Row ss:Height="22">
    <Cell ss:StyleID="ZebraLeftBold"><Data ss:Type="String">Total Monitored Campus Zones</Data></Cell>
    <Cell ss:StyleID="KPIValue"><Data ss:Type="Number">${locations.length}</Data></Cell>
    <Cell ss:StyleID="ZebraCenter"><Data ss:Type="String">Zones</Data></Cell>
    <Cell ss:StyleID="ZebraLeft"><Data ss:Type="String">${healthyLocationsCount} zones operating normally / ${poorLocationsCount} zones require remediation</Data></Cell>
    <Cell ss:StyleID="${poorLocationsCount === 0 ? 'BadgeExcellent' : 'BadgeFair'}"><Data ss:Type="String">${poorLocationsCount === 0 ? '100% Normal' : String(poorLocationsCount) + ' Degraded'}</Data></Cell>
   </Row>

   <Row ss:Height="22">
    <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">Access Point Fleet Health</Data></Cell>
    <Cell ss:StyleID="KPIValue"><Data ss:Type="Number">${devices.length}</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">APs</Data></Cell>
    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${onlineDevicesCount} Online | ${degradedDevicesCount} Degraded | ${offlineDevicesCount} Offline</Data></Cell>
    <Cell ss:StyleID="${offlineDevicesCount === 0 ? 'BadgeGood' : 'BadgePoor'}"><Data ss:Type="String">${offlineDevicesCount === 0 ? 'Operational' : String(offlineDevicesCount) + ' Offline'}</Data></Cell>
   </Row>

   <Row ss:Height="22">
    <Cell ss:StyleID="ZebraLeftBold"><Data ss:Type="String">Open Wi-Fi Support Tickets</Data></Cell>
    <Cell ss:StyleID="KPIValue"><Data ss:Type="Number">${openComplaintsCount}</Data></Cell>
    <Cell ss:StyleID="ZebraCenter"><Data ss:Type="String">Tickets</Data></Cell>
    <Cell ss:StyleID="ZebraLeft"><Data ss:Type="String">${resolvedComplaintsCount} resolved tickets archived in queue</Data></Cell>
    <Cell ss:StyleID="${openComplaintsCount === 0 ? 'BadgeExcellent' : openComplaintsCount < 5 ? 'BadgeGood' : 'BadgePoor'}"><Data ss:Type="String">${openComplaintsCount === 0 ? 'Queue Clear' : String(openComplaintsCount) + ' In Progress'}</Data></Cell>
   </Row>

   <Row ss:Height="16"></Row>

   <!-- Section: Health Breakdown -->
   <Row ss:Height="24">
    <Cell ss:MergeAcross="4" ss:StyleID="SectionHeader"><Data ss:Type="String">2. CAMPUS ZONE HEALTH SCORE DISTRIBUTION</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Health Tier</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Zone Count</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Percentage</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Action Policy</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Classification</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">Excellent (Health &gt;= 85)</Data></Cell>
    <Cell ss:StyleID="CellInteger"><Data ss:Type="Number">${locations.filter((l) => l.currentStatus === 'Excellent').length}</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${((locations.filter((l) => l.currentStatus === 'Excellent').length / (locations.length || 1)) * 100).toFixed(0)}%</Data></Cell>
    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">Zero intervention needed; maintaining continuous SLA monitoring</Data></Cell>
    <Cell ss:StyleID="BadgeExcellent"><Data ss:Type="String">EXCELLENT</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="ZebraLeftBold"><Data ss:Type="String">Good (Health 70 - 84)</Data></Cell>
    <Cell ss:StyleID="ZebraInteger"><Data ss:Type="Number">${locations.filter((l) => l.currentStatus === 'Good').length}</Data></Cell>
    <Cell ss:StyleID="ZebraCenter"><Data ss:Type="String">${((locations.filter((l) => l.currentStatus === 'Good').length / (locations.length || 1)) * 100).toFixed(0)}%</Data></Cell>
    <Cell ss:StyleID="ZebraLeft"><Data ss:Type="String">Normal operations; periodic load balance checks</Data></Cell>
    <Cell ss:StyleID="BadgeGood"><Data ss:Type="String">GOOD</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">Fair (Health 50 - 69)</Data></Cell>
    <Cell ss:StyleID="CellInteger"><Data ss:Type="Number">${locations.filter((l) => l.currentStatus === 'Fair').length}</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${((locations.filter((l) => l.currentStatus === 'Fair').length / (locations.length || 1)) * 100).toFixed(0)}%</Data></Cell>
    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">Watchlisted; technician investigation recommended</Data></Cell>
    <Cell ss:StyleID="BadgeFair"><Data ss:Type="String">FAIR</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="ZebraLeftBold"><Data ss:Type="String">Poor / Critical (Health &lt; 50)</Data></Cell>
    <Cell ss:StyleID="ZebraInteger"><Data ss:Type="Number">${poorLocationsCount}</Data></Cell>
    <Cell ss:StyleID="ZebraCenter"><Data ss:Type="String">${((poorLocationsCount / (locations.length || 1)) * 100).toFixed(0)}%</Data></Cell>
    <Cell ss:StyleID="ZebraLeft"><Data ss:Type="String">Immediate dispatch required; AP hardware reboot / channel reassignment</Data></Cell>
    <Cell ss:StyleID="BadgePoor"><Data ss:Type="String">ATTENTION</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- ========================================================= -->
 <!-- WORKSHEET 2: CAMPUS LOCATIONS BENCHMARK -->
 <!-- ========================================================= -->
 <Worksheet ss:Name="Campus Locations">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="200"/>
   <Column ss:Width="160"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="80"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>

   <!-- Sheet Header -->
   <Row ss:Height="32">
    <Cell ss:MergeAcross="11" ss:StyleID="MainTitle"><Data ss:Type="String">CAMPUS LOCATION PERFORMANCE &amp; TELEMETRY BENCHMARKS</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="11" ss:StyleID="SubBanner"><Data ss:Type="String">Complete comparative benchmark across all campus buildings, zones, and access point clusters</Data></Cell>
   </Row>
   <Row ss:Height="10"></Row>

   <!-- Column Headers -->
   <Row ss:Height="24">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Zone / Location Name</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Building</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Floor</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Health Score</Data></Cell>
    <Cell ss:StyleID="TableHeaderRight"><Data ss:Type="String">Download (Mbps)</Data></Cell>
    <Cell ss:StyleID="TableHeaderRight"><Data ss:Type="String">Upload (Mbps)</Data></Cell>
    <Cell ss:StyleID="TableHeaderRight"><Data ss:Type="String">Ping (ms)</Data></Cell>
    <Cell ss:StyleID="TableHeaderRight"><Data ss:Type="String">Packet Loss</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">APs Deployed</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Open Issues</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Resolved</Data></Cell>
   </Row>

   ${locations
     .map((loc, idx) => {
       const isEven = idx % 2 === 0;
       const leftStyle = isEven ? 'ZebraLeft' : 'CellLeft';
       const leftBoldStyle = isEven ? 'ZebraLeftBold' : 'CellLeftBold';
       const centerStyle = isEven ? 'ZebraCenter' : 'CellCenter';
       const numberStyle = isEven ? 'ZebraNumber' : 'CellNumber';
       const integerStyle = isEven ? 'ZebraInteger' : 'CellInteger';

       let statusStyle = 'BadgeGood';
       if (loc.currentStatus === 'Excellent') statusStyle = 'BadgeExcellent';
       else if (loc.currentStatus === 'Good') statusStyle = 'BadgeGood';
       else if (loc.currentStatus === 'Fair') statusStyle = 'BadgeFair';
       else if (loc.currentStatus === 'Poor') statusStyle = 'BadgePoor';
       else if (loc.currentStatus === 'Critical') statusStyle = 'BadgeCritical';

       return `
   <Row ss:Height="22">
    <Cell ss:StyleID="${leftBoldStyle}"><Data ss:Type="String">${escapeXml(loc.name)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(loc.building)}</Data></Cell>
    <Cell ss:StyleID="${centerStyle}"><Data ss:Type="String">${escapeXml(loc.floor)}</Data></Cell>
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(loc.currentStatus)}</Data></Cell>
    <Cell ss:StyleID="${integerStyle}"><Data ss:Type="Number">${loc.currentHealthScore}</Data></Cell>
    <Cell ss:StyleID="${numberStyle}"><Data ss:Type="Number">${loc.avgDownload}</Data></Cell>
    <Cell ss:StyleID="${numberStyle}"><Data ss:Type="Number">${loc.avgUpload}</Data></Cell>
    <Cell ss:StyleID="${integerStyle}"><Data ss:Type="Number">${loc.avgPing}</Data></Cell>
    <Cell ss:StyleID="${numberStyle}"><Data ss:Type="Number">${loc.packetLoss}</Data></Cell>
    <Cell ss:StyleID="${integerStyle}"><Data ss:Type="Number">${loc.apCount}</Data></Cell>
    <Cell ss:StyleID="${integerStyle}"><Data ss:Type="Number">${loc.openComplaints}</Data></Cell>
    <Cell ss:StyleID="${integerStyle}"><Data ss:Type="Number">${loc.resolvedComplaints}</Data></Cell>
   </Row>`;
     })
     .join('')}
  </Table>
 </Worksheet>

 <!-- ========================================================= -->
 <!-- WORKSHEET 3: WI-FI COMPLAINTS & TICKETS -->
 <!-- ========================================================= -->
 <Worksheet ss:Name="Wi-Fi Complaints">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="110"/>
   <Column ss:Width="180"/>
   <Column ss:Width="150"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="150"/>
   <Column ss:Width="180"/>
   <Column ss:Width="260"/>
   <Column ss:Width="100"/>
   <Column ss:Width="80"/>
   <Column ss:Width="80"/>
   <Column ss:Width="140"/>

   <!-- Sheet Header -->
   <Row ss:Height="32">
    <Cell ss:MergeAcross="11" ss:StyleID="MainTitle"><Data ss:Type="String">CAMPUS WI-FI COMPLAINT QUEUE &amp; RESOLUTION AUDIT</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="11" ss:StyleID="SubBanner"><Data ss:Type="String">Student and staff support tickets with attached automated diagnostic telemetry snapshots</Data></Cell>
   </Row>
   <Row ss:Height="10"></Row>

   <!-- Column Headers -->
   <Row ss:Height="24">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Ticket ID</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Location Zone</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Problem Category</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Priority</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Reported By</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">User Email</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Problem Statement / Issue Details</Data></Cell>
    <Cell ss:StyleID="TableHeaderRight"><Data ss:Type="String">Speed (Mbps)</Data></Cell>
    <Cell ss:StyleID="TableHeaderRight"><Data ss:Type="String">Ping (ms)</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Tech Notes</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Submission Date</Data></Cell>
   </Row>

   ${complaints
     .map((c, idx) => {
       const isEven = idx % 2 === 0;
       const leftStyle = isEven ? 'ZebraLeft' : 'CellLeft';
       const leftBoldStyle = isEven ? 'ZebraLeftBold' : 'CellLeftBold';
       const wrapStyle = isEven ? 'ZebraWrap' : 'CellWrap';
       const integerStyle = isEven ? 'ZebraInteger' : 'CellInteger';
       const rightStyle = isEven ? 'ZebraRight' : 'CellRight';

       let priorityStyle = 'PriorityMedium';
       if (c.priority === 'Critical') priorityStyle = 'PriorityCritical';
       else if (c.priority === 'High') priorityStyle = 'PriorityHigh';
       else if (c.priority === 'Low') priorityStyle = 'PriorityLow';

       let statusStyle = 'BadgeFair';
       if (c.status === 'Resolved') statusStyle = 'BadgeExcellent';
       else if (c.status === 'In Progress') statusStyle = 'BadgeGood';
       else if (c.status === 'Assigned') statusStyle = 'BadgeFair';
       else if (c.status === 'Reviewed') statusStyle = 'PriorityMedium';

       const testSpeed = c.testSnapshot ? c.testSnapshot.downloadSpeed : 'N/A';
       const testPing = c.testSnapshot ? c.testSnapshot.ping : 'N/A';
       const formattedDate = new Date(c.createdAt).toLocaleString();

       return `
   <Row ss:Height="24">
    <Cell ss:StyleID="${leftBoldStyle}"><Data ss:Type="String">${escapeXml(c.id)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(c.locationName)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(c.category)}</Data></Cell>
    <Cell ss:StyleID="${priorityStyle}"><Data ss:Type="String">${escapeXml(c.priority)}</Data></Cell>
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(c.status)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(c.userName)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(c.userEmail)}</Data></Cell>
    <Cell ss:StyleID="${wrapStyle}"><Data ss:Type="String">${escapeXml(c.description)}</Data></Cell>
    <Cell ss:StyleID="${rightStyle}"><Data ss:Type="String">${escapeXml(testSpeed)}</Data></Cell>
    <Cell ss:StyleID="${rightStyle}"><Data ss:Type="String">${escapeXml(testPing)}</Data></Cell>
    <Cell ss:StyleID="${integerStyle}"><Data ss:Type="Number">${c.itNotes ? c.itNotes.length : 0}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(formattedDate)}</Data></Cell>
   </Row>`;
     })
     .join('')}
  </Table>
 </Worksheet>

 <!-- ========================================================= -->
 <!-- WORKSHEET 4: FIELD TECHNICIAN LOGS -->
 <!-- ========================================================= -->
 <Worksheet ss:Name="Technician Logs">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="160"/>
   <Column ss:Width="160"/>
   <Column ss:Width="110"/>
   <Column ss:Width="180"/>
   <Column ss:Width="130"/>
   <Column ss:Width="360"/>

   <!-- Sheet Header -->
   <Row ss:Height="32">
    <Cell ss:MergeAcross="5" ss:StyleID="MainTitle"><Data ss:Type="String">IT SUPPORT STAFF MAINTENANCE NOTES &amp; ACTIONS LOG</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="5" ss:StyleID="SubBanner"><Data ss:Type="String">Real-time audit log of support staff diagnostics, hardware interventions, and status updates</Data></Cell>
   </Row>
   <Row ss:Height="10"></Row>

   <!-- Column Headers -->
   <Row ss:Height="24">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Timestamp</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Technician Name</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Ticket Reference</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Campus Location</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Lifecycle Status</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Technical Maintenance Notes &amp; Findings</Data></Cell>
   </Row>

   ${(staffNoteNotifications || [])
     .map((note, idx) => {
       const isEven = idx % 2 === 0;
       const leftStyle = isEven ? 'ZebraLeft' : 'CellLeft';
       const leftBoldStyle = isEven ? 'ZebraLeftBold' : 'CellLeftBold';
       const centerStyle = isEven ? 'ZebraCenter' : 'CellCenter';
       const wrapStyle = isEven ? 'ZebraWrap' : 'CellWrap';
       const noteDate = new Date(note.timestamp).toLocaleString();

       return `
   <Row ss:Height="24">
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(noteDate)}</Data></Cell>
    <Cell ss:StyleID="${leftBoldStyle}"><Data ss:Type="String">${escapeXml(note.author)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(note.ticketNumber)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(note.locationName)}</Data></Cell>
    <Cell ss:StyleID="${centerStyle}"><Data ss:Type="String">${escapeXml(note.statusChange || 'Note Logged')}</Data></Cell>
    <Cell ss:StyleID="${wrapStyle}"><Data ss:Type="String">${escapeXml(note.text)}</Data></Cell>
   </Row>`;
     })
     .join('')}
  </Table>
 </Worksheet>

 <!-- ========================================================= -->
 <!-- WORKSHEET 5: SPEED TEST HISTORY -->
 <!-- ========================================================= -->
 <Worksheet ss:Name="Speed Test Probes">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="110"/>
   <Column ss:Width="160"/>
   <Column ss:Width="180"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="160"/>

   <!-- Sheet Header -->
   <Row ss:Height="32">
    <Cell ss:MergeAcross="8" ss:StyleID="MainTitle"><Data ss:Type="String">CAMPUS SPEED TEST MEASUREMENT LOG</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="8" ss:StyleID="SubBanner"><Data ss:Type="String">End-user network performance probes with throughput, latency, and signal telemetry</Data></Cell>
   </Row>
   <Row ss:Height="10"></Row>

   <!-- Column Headers -->
   <Row ss:Height="24">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Probe ID</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">User / Probe Name</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Campus Location</Data></Cell>
    <Cell ss:StyleID="TableHeaderRight"><Data ss:Type="String">Download (Mbps)</Data></Cell>
    <Cell ss:StyleID="TableHeaderRight"><Data ss:Type="String">Upload (Mbps)</Data></Cell>
    <Cell ss:StyleID="TableHeaderRight"><Data ss:Type="String">Ping (ms)</Data></Cell>
    <Cell ss:StyleID="TableHeaderRight"><Data ss:Type="String">Jitter (ms)</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Health Rating</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Timestamp</Data></Cell>
   </Row>

   ${speedTests
     .slice(0, 100)
     .map((t, idx) => {
       const isEven = idx % 2 === 0;
       const leftStyle = isEven ? 'ZebraLeft' : 'CellLeft';
       const leftBoldStyle = isEven ? 'ZebraLeftBold' : 'CellLeftBold';
       const numberStyle = isEven ? 'ZebraNumber' : 'CellNumber';
       const integerStyle = isEven ? 'ZebraInteger' : 'CellInteger';

       let badgeStyle = 'BadgeGood';
       if (t.healthStatus === 'Excellent') badgeStyle = 'BadgeExcellent';
       else if (t.healthStatus === 'Good') badgeStyle = 'BadgeGood';
       else if (t.healthStatus === 'Fair') badgeStyle = 'BadgeFair';
       else if (t.healthStatus === 'Poor') badgeStyle = 'BadgePoor';
       else if (t.healthStatus === 'Critical') badgeStyle = 'BadgeCritical';

       const testTime = new Date(t.testedAt).toLocaleString();

       return `
   <Row ss:Height="22">
    <Cell ss:StyleID="${leftBoldStyle}"><Data ss:Type="String">${escapeXml(t.id)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(t.userName)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(t.locationName)}</Data></Cell>
    <Cell ss:StyleID="${numberStyle}"><Data ss:Type="Number">${t.downloadSpeed}</Data></Cell>
    <Cell ss:StyleID="${numberStyle}"><Data ss:Type="Number">${t.uploadSpeed}</Data></Cell>
    <Cell ss:StyleID="${integerStyle}"><Data ss:Type="Number">${t.ping}</Data></Cell>
    <Cell ss:StyleID="${integerStyle}"><Data ss:Type="Number">${t.jitter}</Data></Cell>
    <Cell ss:StyleID="${badgeStyle}"><Data ss:Type="String">${escapeXml(t.healthStatus)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(testTime)}</Data></Cell>
   </Row>`;
     })
     .join('')}
  </Table>
 </Worksheet>

 <!-- ========================================================= -->
 <!-- WORKSHEET 6: ACCESS POINT HARDWARE -->
 <!-- ========================================================= -->
 <Worksheet ss:Name="Access Points">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="140"/>
   <Column ss:Width="180"/>
   <Column ss:Width="130"/>
   <Column ss:Width="140"/>
   <Column ss:Width="150"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="160"/>

   <!-- Sheet Header -->
   <Row ss:Height="32">
    <Cell ss:MergeAcross="8" ss:StyleID="MainTitle"><Data ss:Type="String">CAMPUS ACCESS POINT HARDWARE INVENTORY</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="8" ss:StyleID="SubBanner"><Data ss:Type="String">Wi-Fi Gateway and Access Point hardware status, channel allocations, and active client load</Data></Cell>
   </Row>
   <Row ss:Height="10"></Row>

   <!-- Column Headers -->
   <Row ss:Height="24">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">AP Identifier</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Assigned Zone</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">IP Address</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">MAC Address</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Hardware Model</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Channel</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Active Clients</Data></Cell>
    <Cell ss:StyleID="TableHeaderCenter"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Last Heartbeat</Data></Cell>
   </Row>

   ${devices
     .map((d, idx) => {
       const isEven = idx % 2 === 0;
       const leftStyle = isEven ? 'ZebraLeft' : 'CellLeft';
       const leftBoldStyle = isEven ? 'ZebraLeftBold' : 'CellLeftBold';
       const centerStyle = isEven ? 'ZebraCenter' : 'CellCenter';
       const integerStyle = isEven ? 'ZebraInteger' : 'CellInteger';

       let devStatusStyle = 'BadgeGood';
       if (d.status === 'Online') devStatusStyle = 'BadgeExcellent';
       else if (d.status === 'Degraded') devStatusStyle = 'BadgeFair';
       else if (d.status === 'Offline') devStatusStyle = 'BadgePoor';

       const lastSeenTime = new Date(d.lastSeen).toLocaleString();

       return `
   <Row ss:Height="22">
    <Cell ss:StyleID="${leftBoldStyle}"><Data ss:Type="String">${escapeXml(d.name)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(d.locationName)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(d.ipAddress)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(d.macAddress)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(d.model)}</Data></Cell>
    <Cell ss:StyleID="${centerStyle}"><Data ss:Type="String">${escapeXml(d.channel)}</Data></Cell>
    <Cell ss:StyleID="${integerStyle}"><Data ss:Type="Number">${d.clientsConnected}</Data></Cell>
    <Cell ss:StyleID="${devStatusStyle}"><Data ss:Type="String">${escapeXml(d.status)}</Data></Cell>
    <Cell ss:StyleID="${leftStyle}"><Data ss:Type="String">${escapeXml(lastSeenTime)}</Data></Cell>
   </Row>`;
     })
     .join('')}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SmartCampus_Network_Report_${fileDate}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
