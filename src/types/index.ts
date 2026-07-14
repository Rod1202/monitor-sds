export interface CustomerRestDTO {
  customerId: number;
  name: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export type ConnectivityStatus = 'Online' | 'Offline' | 'Unknown';

export interface KPIs {
  totalClients: number;
  activeClients: number;
  expiredClients: number;
  totalDevices: number;
  onlinePct: number;
  offlinePct: number;
  coverageClients: number;
  discoveredLast30d: number;
}

export interface PeriodCount {
  period: string;
  count: number;
}

export interface NamedValue {
  name: string;
  value: number;
}

export interface CustomerDevice {
  name: string;
  devices: number;
}

export interface ModelCount {
  name: string;
  count: number;
}

export interface Charts {
  discoveredWeekly: PeriodCount[];
  discoveredMonthly: PeriodCount[];
  discoveredYearly: PeriodCount[];
  desyncWeekly: PeriodCount[];
  desyncMonthly: PeriodCount[];
  desyncYearly: PeriodCount[];
  registeredWeekly: PeriodCount[];
  registeredMonthly: PeriodCount[];
  registeredYearly: PeriodCount[];
  monitorStatus: NamedValue[];
  manufacturerDist: NamedValue[];
  devicesByCustomer: CustomerDevice[];
  topModels: ModelCount[];
  discoveredHistorical: PeriodCount[];
}

export interface Extras {
  avgAgeDays: number | null;
  avgLastContactHours: number | null;
}

export interface StatusResponse {
  kpis: KPIs;
  charts: Charts;
  extras: Extras;
  comparison: {
    totalClients: KpiComparison;
    activeClients: KpiComparison;
    expiredClients: KpiComparison;
    totalDevices: KpiComparison;
    onlinePct: KpiComparison;
    offlinePct: KpiComparison;
    coverageClients: KpiComparison;
    discoveredLast30d: KpiComparison;
  };
}

export interface AlertDeviceRow {
  customer_name: string;
  serial_number: string | null;
  model: string | null;
  last_contact: string | null;
  monitor_status: string | null;
  ip_address: string | null;
}

export interface DuplicateSerialRow {
  serial_number: string | null;
  customer_name: string;
  device_id: number;
  model: string | null;
  manufacturer: string | null;
}

export interface TimelineEntry {
  snapshot_id: number;
  customer_name: string;
  estado: string;
  created_at: string;
  device_id: number;
  serial_number: string | null;
}

export interface AlertCards {
  noContact24h: number;
  noContact7d: number;
  neverContacted: number;
  duplicateSerials: number;
}

export interface AlertTables {
  noContact24h: AlertDeviceRow[];
  noContact7d: AlertDeviceRow[];
  neverContacted: AlertDeviceRow[];
  duplicateSerials: DuplicateSerialRow[];
}

export interface CustomerDetailsItem {
  customerId: number;
  name: string;
  status: string;
  createdDate: string | null;
  deviceCount: number;
}

export interface OfflineDeviceInfo {
  serialNumber: string | null;
  model: string | null;
  daysSinceLastContact: number | null;
  ipAddress: string | null;
}

export interface NewDeviceInfo {
  serialNumber: string | null;
  model: string | null;
  discoveryDate: string | null;
  ipAddress: string | null;
}

export interface CustomerDetailsResponse {
  customers: CustomerDetailsItem[];
  offlineDevices: Record<number, OfflineDeviceInfo[]>;
  newDevices: Record<number, NewDeviceInfo[]>;
}

export interface CustomerSummaryResponse {
  customerName: string;
  totalDevices: number;
  totalDepurated: number;
  onlineDevices: number;
  offlineDevices: number;
  unknownDevices: number;
  duplicateCount: number;
  desyncTimeline: PeriodCount[];
  topModels: NamedValue[];
  topFirmware: NamedValue[];
  desyncedDevices: {
    serialNumber: string | null;
    model: string | null;
    ipAddress: string | null;
    daysSinceLastContact: number | null;
  }[];
}

export interface KpiComparison {
  previousValue: number;
  change: number;
  changePct: number | null;
}

export interface AlertCardsWithComparison {
  noContact24h: number;
  noContact7d: number;
  neverContacted: number;
  duplicateSerials: number;
  comparison: {
    noContact24h: KpiComparison;
    noContact7d: KpiComparison;
    neverContacted: KpiComparison;
    duplicateSerials: KpiComparison;
  };
}

export interface AlertsResponse {
  alertCards: AlertCardsWithComparison;
  tables: AlertTables;
  timeline: TimelineEntry[];
}
