import { useState, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Typography, Chip, IconButton, InputAdornment,
} from '@mui/material';
import { Close, Search } from '@mui/icons-material';
import type { CustomerDetailsItem } from '../../types';

interface ClientesDialogProps {
  open: boolean;
  onClose: () => void;
  customers: CustomerDetailsItem[];
  filter?: 'all' | 'ACTIVE' | 'EXPIRED';
  title: string;
}

const STATUS_CHIP: Record<string, { label: string; color: 'success' | 'error' }> = {
  ACTIVE: { label: 'Activo', color: 'success' },
  EXPIRED: { label: 'Expirado', color: 'error' },
};

export default function ClientesDialog({ open, onClose, customers, filter = 'all', title }: ClientesDialogProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const filtered = useMemo(() => {
    let list = customers;
    if (filter !== 'all') list = list.filter(c => c.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => b.deviceCount - a.deviceCount);
  }, [customers, filter, search]);

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  function formatDate(d: string | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent>
        {filter !== 'EXPIRED' && (
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
              },
            }}
            sx={{ mb: 2, mt: 1 }}
          />
        )}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha de Creación</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Impresoras</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map(c => (
                <TableRow key={c.customerId} hover>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{formatDate(c.createdDate)}</TableCell>
                  <TableCell align="center">{c.deviceCount}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={STATUS_CHIP[c.status]?.label ?? c.status}
                      color={STATUS_CHIP[c.status]?.color ?? 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No se encontraron clientes
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
          labelRowsPerPage=""
        />
      </DialogContent>
    </Dialog>
  );
}
