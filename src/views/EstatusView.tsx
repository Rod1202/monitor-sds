import { useState } from 'react';
import { Grid, Skeleton, Typography, Box } from '@mui/material';
import {
  People, PeopleAlt, PersonOff, Print, Sensors, CalendarMonth,
  WifiOff, FiberNew, SyncAlt,
} from '@mui/icons-material';
import { useStatus } from '../hooks/useStatus';
import { useCustomerDetails } from '../hooks/useCustomerDetails';
import KpiCard from '../components/kpi/KpiCard';
import InfoCard from '../components/kpi/InfoCard';
import DashboardLineChart from '../components/charts/DashboardLineChart';
import DonutChartCard from '../components/charts/DonutChartCard';
import BarChartCard from '../components/charts/BarChartCard';
import ClientesDialog from '../components/dialogs/ClientesDialog';
import OfflineDialog from '../components/dialogs/OfflineDialog';
import NewDevicesDialog from '../components/dialogs/NewDevicesDialog';
import type { NamedValue } from '../types';

function EmptySeries({ message }: { message: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
      <Typography variant="body2" color="text.secondary">{message}</Typography>
    </Box>
  );
}

function getManufacturerColor(name: string): string {
  const colors = ['#0050cb', '#466270', '#a33200', '#F9A825', '#2E7D32', '#D32F2F'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function EstatusView() {
  const { data, loading, error } = useStatus();
  const customerDetails = useCustomerDetails();

  const [dialog, setDialog] = useState<'total' | 'active' | 'expired' | 'offline' | 'new' | 'uncovered' | null>(null);

  const customers = customerDetails.data?.customers ?? [];
  const offlineDevices = customerDetails.data?.offlineDevices ?? {};
  const newDevices = customerDetails.data?.newDevices ?? {};

  function openDialog(d: typeof dialog) {
    customerDetails.fetchData();
    setDialog(d);
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="error" variant="h2" gutterBottom>Error al cargar datos</Typography>
        <Typography color="text.secondary">{error}</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3, lg: 1.5 }}>
            <Skeleton variant="rectangular" sx={{ height: 120, borderRadius: 3 }} />
          </Grid>
        ))}
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" sx={{ height: 280, borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const { kpis, charts, extras } = data!;

  const donutSegments = charts.monitorStatus.map((s: NamedValue) => {
    const color = s.name === 'Online' ? '#2E7D32' : s.name === 'Offline' ? '#D32F2F' : '#727687';
    return { label: s.name, value: s.value, color };
  });

  const manufacturerDonut = charts.manufacturerDist.map((m: NamedValue) => ({
    label: m.name, value: m.value, color: getManufacturerColor(m.name),
  }));

  const customerBar = charts.devicesByCustomer.map(d => ({
    label: d.name, value: d.devices,
  }));

  const modelBar = charts.topModels.map(m => ({
    label: m.name, value: m.count, color: getManufacturerColor(m.name),
  }));

  return (
    <Grid container spacing={2}>
      {/* Row 1: KPI Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1.5 }}>
        <KpiCard label="Total Clientes" value={kpis.totalClients.toLocaleString()} icon={<People />} iconBgColor="#0066FF" onClick={() => openDialog('total')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1.5 }}>
        <KpiCard label="Clientes Activos" value={kpis.activeClients.toLocaleString()} icon={<PeopleAlt />} iconBgColor="#2E7D32" chip={{ label: 'Activo', color: 'success' }} onClick={() => openDialog('active')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1.5 }}>
        <KpiCard label="Expirados" value={kpis.expiredClients.toLocaleString()} icon={<PersonOff />} iconBgColor="#D32F2F" chip={{ label: 'Red', color: 'error' }} onClick={() => openDialog('expired')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1.5 }}>
        <KpiCard label="Total Equipos" value={kpis.totalDevices.toLocaleString()} icon={<Print />} iconBgColor="#0066FF" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1.5 }}>
        <KpiCard label="Sincronizado" value={`${kpis.onlinePct}%`} icon={<SyncAlt />} iconBgColor="#2E7D32" progress={{ value: kpis.onlinePct, color: 'success' }} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1.5 }}>
        <KpiCard label="Offline" value={`${kpis.offlinePct}%`} icon={<WifiOff />} iconBgColor="#D32F2F" progress={{ value: kpis.offlinePct, color: 'error' }} onClick={() => openDialog('offline')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1.5 }}>
        <KpiCard label="Coberturados" value={`${kpis.coverageClients}`} icon={<Sensors />} iconBgColor="#0288D1" onClick={() => openDialog('uncovered')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 1.5 }}>
        <KpiCard label="Descubiertos (30d)" value={`+${kpis.discoveredLast30d}`} icon={<FiberNew />} iconBgColor="#F9A825" trend="up" onClick={() => openDialog('new')} />
      </Grid>

      {/* Row 2: Unified Line Chart with tabs */}
      <Grid size={12}>
        <DashboardLineChart charts={charts} loading={loading} />
      </Grid>

      {/* Row 3: Donuts */}
      <Grid size={{ xs: 12, md: 6 }}>
        <DonutChartCard
          title="Estado de Monitoreo"
          segments={donutSegments}
          total={kpis.totalDevices}
          totalLabel="Total Equipos"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        {manufacturerDonut.length > 0 ? (
          <DonutChartCard title="Equipos por Fabricante" segments={manufacturerDonut} />
        ) : (
          <EmptySeries message="Sin datos de fabricantes" />
        )}
      </Grid>

      {/* Row 4: Bar Charts */}
      <Grid size={{ xs: 12, md: 6 }}>
        {customerBar.length > 0 ? (
          <BarChartCard title="Top Equipos por Cliente" items={customerBar} />
        ) : (
          <EmptySeries message="Sin datos por cliente" />
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        {modelBar.length > 0 ? (
          <BarChartCard title="Top Modelos" items={modelBar} />
        ) : (
          <EmptySeries message="Sin datos de modelos" />
        )}
      </Grid>

      {/* Row 5: Info Cards */}
      <Grid size={{ xs: 12, md: 6 }}>
        <InfoCard
          label="Antigüedad Promedio del Parque"
          value={extras.avgAgeDays != null ? `${extras.avgAgeDays} días` : '—'}
          unit=""
          icon={<CalendarMonth sx={{ fontSize: 28 }} />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <InfoCard
          label="Último Contacto Promedio"
          value={extras.avgLastContactHours != null ? `${extras.avgLastContactHours} h` : '—'}
          unit=""
          icon={<Sensors sx={{ fontSize: 28 }} />}
        />
      </Grid>

      {/* Dialogs */}
      <ClientesDialog
        open={dialog === 'total'}
        onClose={() => setDialog(null)}
        customers={customers}
        title="Todos los Clientes"
      />
      <ClientesDialog
        open={dialog === 'active'}
        onClose={() => setDialog(null)}
        customers={customers}
        filter="ACTIVE"
        title="Clientes Activos"
      />
      <ClientesDialog
        open={dialog === 'expired'}
        onClose={() => setDialog(null)}
        customers={customers}
        filter="EXPIRED"
        title="Clientes Expirados"
      />
      <OfflineDialog
        open={dialog === 'offline'}
        onClose={() => setDialog(null)}
        customers={customers}
        offlineDevices={offlineDevices}
      />
      <NewDevicesDialog
        open={dialog === 'new'}
        onClose={() => setDialog(null)}
        customers={customers}
        newDevices={newDevices}
      />
      <ClientesDialog
        open={dialog === 'uncovered'}
        onClose={() => setDialog(null)}
        customers={customers.filter(c => c.status === 'ACTIVE' && c.deviceCount === 0)}
        title="Clientes sin Equipos Registrados"
      />
    </Grid>
  );
}
