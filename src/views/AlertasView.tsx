import { Grid, Typography, Box, Skeleton } from '@mui/material';
import {
  WifiOff, RunningWithErrors, DeviceUnknown, ContentCopy,
  NotificationImportant, Warning as WarningIcon, CloudOff, DynamicFeed,
} from '@mui/icons-material';
import { useAlerts } from '../hooks/useAlerts';
import KpiCard from '../components/kpi/KpiCard';
import DataTable, { StatusChip } from '../components/tables/DataTable';

const alertKpiConfig = [
  {
    key: 'noContact24h' as const, label: 'Sin contacto 24h',
    icon: <WifiOff />, iconBgColor: '#D32F2F', iconColor: '#fff',
    chipColor: 'error' as const, chipLabel: 'Crítico',
  },
  {
    key: 'noContact7d' as const, label: 'Sin contacto 7 días',
    icon: <RunningWithErrors />, iconBgColor: '#F9A825', iconColor: '#fff',
    chipColor: 'warning' as const, chipLabel: 'Seguimiento',
  },
  {
    key: 'neverContacted' as const, label: 'Nunca Contactados',
    icon: <DeviceUnknown />, iconBgColor: '#466270', iconColor: '#fff',
    chipColor: 'default' as const, chipLabel: 'Red',
  },
  {
    key: 'duplicateSerials' as const, label: 'SN Duplicados',
    icon: <ContentCopy />, iconBgColor: '#0066FF', iconColor: '#fff',
    chipColor: 'primary' as const, chipLabel: 'Conflicto',
  },
];

function getTimeAgo(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffH / 24);
  if (diffD > 0) return `${diffD}d ${diffH % 24}h`;
  return `${diffH}h ${Math.floor((diffMs % 3600000) / 60000)}m`;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const cols24h = [
  { key: 'customer_name', label: 'Cliente' },
  { key: 'serial_number', label: 'Serial Number' },
  {
    key: 'monitor_status', label: 'Estado',
    render: () => <StatusChip label="OFFLINE" color="error" />,
  },
  { key: 'last_contact', label: 'Último Contacto', render: (row: Record<string, unknown>) => getTimeAgo(row.last_contact as string) },
];

const cols7d = [
  { key: 'customer_name', label: 'Cliente' },
  { key: 'serial_number', label: 'Serial Number' },
  { key: 'model', label: 'Modelo' },
  { key: 'ip_address', label: 'IP' },
];

const colsNunca = [
  { key: 'customer_name', label: 'Cliente' },
  { key: 'serial_number', label: 'Serial Number' },
  { key: 'last_contact', label: 'Fecha Registro', render: (row: Record<string, unknown>) => fmtDate(row.last_contact as string) },
  { key: 'ip_address', label: 'IP Intento' },
];

const colsDuplicados = [
  { key: 'serial_number', label: 'SN' },
  { key: 'customer_name', label: 'Cliente' },
  { key: 'device_id', label: 'Device ID' },
  { key: 'model', label: 'Modelo' },
];

export default function AlertasView() {
  const { data, loading, error } = useAlerts();

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="error" variant="h2" gutterBottom>Error al cargar alertas</Typography>
        <Typography color="text.secondary">{error}</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Skeleton variant="rectangular" sx={{ height: 120, borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const { alertCards, tables } = data!;

  return (
    <Grid container spacing={2}>
      {/* KPI Cards */}
      {alertKpiConfig.map((kpi) => {
        const value = alertCards[kpi.key];
        return (
          <Grid key={kpi.key} size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label={kpi.label}
              value={String(value).padStart(2, '0')}
              icon={kpi.icon}
              iconBgColor={kpi.iconBgColor}
              iconColor={kpi.iconColor}
              chip={{ label: kpi.chipLabel, color: kpi.chipColor }}
            />
          </Grid>
        );
      })}

      {/* Row 3: Tables */}
      <Grid size={{ xs: 12, xl: 6 }}>
        <DataTable
          title="Equipos sin contacto 24h"
          columns={cols24h}
          rows={tables.noContact24h as unknown as Record<string, unknown>[]}
          titleIcon={<NotificationImportant />}
          titleColor="error.main"
        />
      </Grid>
      <Grid size={{ xs: 12, xl: 6 }}>
        <DataTable
          title="Equipos sin contacto 7 días"
          columns={cols7d}
          rows={tables.noContact7d as unknown as Record<string, unknown>[]}
          titleIcon={<WarningIcon />}
          titleColor="warning.main"
        />
      </Grid>
      <Grid size={{ xs: 12, xl: 6 }}>
        <DataTable
          title="Equipos Nunca Contactados"
          columns={colsNunca}
          rows={tables.neverContacted as unknown as Record<string, unknown>[]}
          titleIcon={<CloudOff />}
          titleColor="secondary.main"
        />
      </Grid>
      <Grid size={{ xs: 12, xl: 6 }}>
        <DataTable
          title="Serial Number Duplicado"
          columns={colsDuplicados}
          rows={tables.duplicateSerials as unknown as Record<string, unknown>[]}
          titleIcon={<DynamicFeed />}
          titleColor="primary.main"
        />
      </Grid>
    </Grid>
  );
}
