import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Grid, Typography, Box, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  Skeleton, TablePagination,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import KpiCard from '../kpi/KpiCard';
import BarChartCard from '../charts/BarChartCard';
import { useCustomerSummary } from '../../hooks/useCustomerSummary';
import type { PeriodCount } from '../../types';

const MONTHS_ABBR = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic',
];

function fmtMonth(p: string): string {
  const m = p.match(/^(\d{4})-(\d{2})$/);
  if (m) {
    const month = parseInt(m[2], 10);
    if (month >= 1 && month <= 12) return `${MONTHS_ABBR[month - 1]}-${m[1]}`;
  }
  return p;
}

interface CustomerSummaryDialogProps {
  open: boolean;
  onClose: () => void;
  customerId: number | null;
  customerName: string;
}

export default function CustomerSummaryDialog({ open, onClose, customerId }: CustomerSummaryDialogProps) {
  const { data, loading, fetchSummary } = useCustomerSummary();
  const [modelPage, setModelPage] = useState(0);
  const [fwPage, setFwPage] = useState(0);
  const [devPage, setDevPage] = useState(0);
  const rowsPerPage = 3;
  const devRowsPerPage = 10;
  const lastCustomerId = useRef<number | null>(null);

  useEffect(() => {
    if (open && customerId != null && customerId !== lastCustomerId.current) {
      lastCustomerId.current = customerId;
      fetchSummary(customerId);
    }
  }, [open, customerId, fetchSummary]);

  const modelPageItems = useMemo(() => {
    if (!data) return [];
    return data.topModels.slice(modelPage * rowsPerPage, modelPage * rowsPerPage + rowsPerPage);
  }, [data, modelPage]);

  const fwPageItems = useMemo(() => {
    if (!data) return [];
    return data.topFirmware.slice(fwPage * rowsPerPage, fwPage * rowsPerPage + rowsPerPage);
  }, [data, fwPage]);

  const devPageItems = useMemo(() => {
    if (!data) return [];
    return data.desyncedDevices.slice(devPage * devRowsPerPage, devPage * devRowsPerPage + devRowsPerPage);
  }, [data, devPage]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {data?.customerName ?? 'Cliente'}
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent>
        {loading && !data ? (
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map(i => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Skeleton variant="rectangular" sx={{ height: 100, borderRadius: 2 }} />
              </Grid>
            ))}
            <Grid size={12}><Skeleton variant="rectangular" sx={{ height: 250, borderRadius: 2 }} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rectangular" sx={{ height: 200, borderRadius: 2 }} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rectangular" sx={{ height: 200, borderRadius: 2 }} /></Grid>
            <Grid size={12}><Skeleton variant="rectangular" sx={{ height: 250, borderRadius: 2 }} /></Grid>
          </Grid>
        ) : data ? (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* KPI Cards */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard label="Total Equipos" value={data.totalDevices.toLocaleString()} subtitle="Sin depurar" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard label="Total Depurado" value={data.totalDepurated.toLocaleString()} subtitle="Equipos válidos" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard label="Sincronizados" value={data.onlineDevices.toLocaleString()} chip={{ label: `${data.totalDepurated ? Math.round(data.onlineDevices / data.totalDepurated * 100) : 0}%`, color: 'success' }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard label="Desincronizados" value={data.offlineDevices.toLocaleString()} chip={{ label: `${data.totalDepurated ? Math.round(data.offlineDevices / data.totalDepurated * 100) : 0}%`, color: 'error' }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard label="Duplicados" value={data.duplicateCount.toLocaleString()} chip={{ label: `${data.duplicateCount}`, color: 'warning' }} />
            </Grid>

            {/* Desync line chart */}
            <Grid size={12}>
              <Box sx={{ height: 250 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }} gutterBottom>Desincronización por Mes</Typography>
                {data.desyncTimeline.length > 0 ? (
                  <LineChart
                    xAxis={[{
                      scaleType: 'point',
                      data: data.desyncTimeline.map((d: PeriodCount) => fmtMonth(d.period)),
                      tickLabelStyle: { fontSize: 10 },
                    }]}
                    yAxis={[{
                      disableLine: true,
                      disableTicks: true,
                      tickLabelStyle: { display: 'none' },
                    }]}
                    series={[{
                      data: data.desyncTimeline.map((d: PeriodCount) => d.count),
                      color: '#D32F2F',
                      showMark: true,
                      label: 'Desincronizados',
                    }]}
                    height={200}
                    margin={{ top: 10, right: 10, bottom: 30, left: 10 }}
                    slotProps={{ legend: { hidden: true } } as never}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
                    Sin datos de desincronización
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Top Models + Top Firmware */}
            <Grid size={{ xs: 12, md: 6 }}>
              <BarChartCard title="Top Modelos" items={modelPageItems.map(m => ({ label: m.name, value: m.value, color: '#0066FF' }))} />
              {data.topModels.length > rowsPerPage && (
                <TablePagination
                  component="div" count={data.topModels.length} page={modelPage}
                  onPageChange={(_, p) => setModelPage(p)} rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[rowsPerPage]} labelRowsPerPage=""
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <BarChartCard title="Versiones de Firmware" items={fwPageItems.map(m => ({ label: m.name, value: m.value, color: '#466270' }))} />
              {data.topFirmware.length > rowsPerPage && (
                <TablePagination
                  component="div" count={data.topFirmware.length} page={fwPage}
                  onPageChange={(_, p) => setFwPage(p)} rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[rowsPerPage]} labelRowsPerPage=""
                />
              )}
            </Grid>

            {/* Desynced devices table */}
            <Grid size={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }} gutterBottom>Equipos Desincronizados</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Serie</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Modelo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Días Desinc.</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {devPageItems.map((d, i) => (
                        <TableRow key={`${d.serialNumber ?? ''}-${d.ipAddress ?? ''}-${i}`}>
                        <TableCell>{d.serialNumber ?? '—'}</TableCell>
                        <TableCell>{d.model ?? '—'}</TableCell>
                        <TableCell>{d.ipAddress ?? '—'}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={d.daysSinceLastContact != null ? `${d.daysSinceLastContact} días` : '—'}
                            color={d.daysSinceLastContact != null && d.daysSinceLastContact > 7 ? 'error' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {devPageItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                            Sin equipos desincronizados
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {data.desyncedDevices.length > devRowsPerPage && (
                <TablePagination
                  component="div" count={data.desyncedDevices.length} page={devPage}
                  onPageChange={(_, p) => setDevPage(p)} rowsPerPage={devRowsPerPage}
                  rowsPerPageOptions={[devRowsPerPage]} labelRowsPerPage=""
                />
              )}
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Error al cargar datos del cliente
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
