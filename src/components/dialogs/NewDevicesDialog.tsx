import { useState, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Typography, Box,
  IconButton, List, ListItemButton, ListItemText, TextField, InputAdornment,
} from '@mui/material';
import { Close, ArrowBack, Search } from '@mui/icons-material';
import type { CustomerDetailsItem, NewDeviceInfo } from '../../types';

interface NewDevicesDialogProps {
  open: boolean;
  onClose: () => void;
  customers: CustomerDetailsItem[];
  newDevices: Record<number, NewDeviceInfo[]>;
}

function hasNewDevices(c: CustomerDetailsItem, devices: Record<number, NewDeviceInfo[]>): boolean {
  return (devices[c.customerId]?.length ?? 0) > 0;
}

export default function NewDevicesDialog({ open, onClose, customers, newDevices }: NewDevicesDialogProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetailsItem | null>(null);
  const rowsPerPage = 10;

  const clientsWithNew = useMemo(() => {
    let list = customers.filter(c => hasNewDevices(c, newDevices));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => (newDevices[b.customerId]?.length ?? 0) - (newDevices[a.customerId]?.length ?? 0));
  }, [customers, newDevices, search]);

  function backToList() {
    setSelectedCustomer(null);
    setSearch('');
    setPage(0);
  }

  const pageRows = clientsWithNew.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const devices = selectedCustomer ? (newDevices[selectedCustomer.customerId] ?? []) : [];

  function formatDate(d: string | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedCustomer && (
            <IconButton size="small" onClick={backToList}>
              <ArrowBack fontSize="small" />
            </IconButton>
          )}
          {selectedCustomer ? `Nuevos Equipos - ${selectedCustomer.name}` : 'Clientes con Equipos Nuevos'}
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
                    secondary={`${newDevices[c.customerId]?.length ?? 0} equipos nuevos`}
                  />
                </ListItemButton>
              ))}
              {pageRows.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  Sin clientes con equipos nuevos este mes
                </Typography>
              )}
            </List>
            <TablePagination
              component="div"
              count={clientsWithNew.length}
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
                  <TableCell sx={{ fontWeight: 600 }}>Día Descubierto</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.map(d => (
                  <TableRow key={d.serialNumber}>
                    <TableCell>{d.serialNumber ?? '—'}</TableCell>
                    <TableCell>{d.model ?? '—'}</TableCell>
                    <TableCell>{formatDate(d.discoveryDate)}</TableCell>
                    <TableCell>{d.ipAddress ?? '—'}</TableCell>
                  </TableRow>
                ))}
                {devices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        Sin equipos nuevos
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
