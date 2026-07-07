import { useState, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Typography,
  Chip, Box, IconButton, List, ListItemButton, ListItemText, TextField,
  InputAdornment,
} from '@mui/material';
import { Close, ArrowBack, Circle, Search } from '@mui/icons-material';
import type { CustomerDetailsItem, OfflineDeviceInfo } from '../../types';

interface OfflineDialogProps {
  open: boolean;
  onClose: () => void;
  customers: CustomerDetailsItem[];
  offlineDevices: Record<number, OfflineDeviceInfo[]>;
}

function hasOffline(c: CustomerDetailsItem, devices: Record<number, OfflineDeviceInfo[]>): boolean {
  return (devices[c.customerId]?.length ?? 0) > 0;
}

export default function OfflineDialog({ open, onClose, customers, offlineDevices }: OfflineDialogProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetailsItem | null>(null);

  function backToList() {
    setSelectedCustomer(null);
    setSearch('');
    setPage(0);
  }
  const rowsPerPage = 5;

  const offlineClients = useMemo(() => {
    let list = customers.filter(c => hasOffline(c, offlineDevices));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => b.deviceCount - a.deviceCount);
  }, [customers, offlineDevices, search]);
  const pageRows = offlineClients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const devices = selectedCustomer ? (offlineDevices[selectedCustomer.customerId] ?? []) : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedCustomer && (
            <IconButton size="small" onClick={backToList}>
              <ArrowBack fontSize="small" />
            </IconButton>
          )}
          {selectedCustomer ? `Impresoras Desincronizadas - ${selectedCustomer.name}` : 'Clientes con Equipos Offline'}
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent>
        {!selectedCustomer ? (
          <>
            <TextField
              fullWidth size="small" placeholder="Buscar cliente..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                },
              }}
              sx={{ mb: 2, mt: 1 }}
            />
            <List disablePadding>
              {pageRows.map(c => (
                <ListItemButton key={c.customerId} onClick={() => setSelectedCustomer(c)} divider>
                  <ListItemText
                    primary={c.name}
                    secondary={`${offlineDevices[c.customerId]?.length ?? 0} equipos desincronizados`}
                  />
                  <Circle sx={{ fontSize: 10, color: 'error.main', mx: 1 }} />
                </ListItemButton>
              ))}
              {pageRows.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  Sin clientes con equipos offline
                </Typography>
              )}
            </List>
            <TablePagination
              component="div"
              count={offlineClients.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[rowsPerPage]}
              labelRowsPerPage=""
            />
          </>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Serie</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Modelo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Días Desincronizado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.map(d => (
                  <TableRow key={d.serialNumber}>
                    <TableCell>{d.serialNumber ?? '—'}</TableCell>
                    <TableCell>{d.model ?? '—'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={d.daysSinceLastContact != null ? `${d.daysSinceLastContact} días` : '—'}
                        color={d.daysSinceLastContact != null && d.daysSinceLastContact > 7 ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {devices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        Sin equipos desincronizados
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}
