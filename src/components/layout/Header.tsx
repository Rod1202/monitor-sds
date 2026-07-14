import { useState, useMemo, useCallback } from 'react';
import { AppBar, Toolbar, TextField, InputAdornment, Tabs, Tab, Box, Autocomplete, IconButton, Tooltip, Snackbar, Alert, CircularProgress } from '@mui/material';
import { Search, Sync } from '@mui/icons-material';
import { useCustomerSearch } from '../../hooks/useCustomerSearch';

interface HeaderProps {
  tabValue: number;
  onTabChange: (_event: React.SyntheticEvent, newValue: number) => void;
  onCustomerSelect: (customerId: number, customerName: string) => void;
  searchKey: number;
}

export default function Header({ tabValue, onTabChange, onCustomerSelect, searchKey }: HeaderProps) {
  const { customers, loading } = useCustomerSearch();
  const activeCustomers = useMemo(() => customers.filter(c => c.status === 'ACTIVE'), [customers]);

  const [syncing, setSyncing] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({ open: false, severity: 'success', message: '' });

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch('/.netlify/functions/sync-snapshot', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al sincronizar');
      setSnackbar({ open: true, severity: 'success', message: `Sync completado — ${data.snapshotsInserted} dispositivos guardados` });
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: err instanceof Error ? err.message : 'Error de red' });
    } finally {
      setSyncing(false);
    }
  }, []);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 3, px: { xs: 2, md: 3 } }}>
        <Box
          component="img"
          src="/logoMT.avif"
          alt="Monitor SDS"
          sx={{ height: 36, width: 'auto' }}
        />

        <Autocomplete
          key={searchKey}
          size="small"
          options={activeCustomers}
          loading={loading}
          filterOptions={(options, { inputValue }) =>
            options.filter(c =>
              c.name.toLowerCase().includes(inputValue.toLowerCase()) ||
              String(c.customerId).includes(inputValue),
            ).slice(0, 50)
          }
          onChange={(_, value) => {
            if (value) {
              onCustomerSelect(value.customerId, value.name);
            }
          }}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(o, v) => o.customerId === v.customerId}
          noOptionsText="Sin resultados"
          slotProps={{ paper: { sx: { borderRadius: 2, mt: 0.5 } } }}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <Box component="li" key={key} {...rest} sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1 }}>
                <span>{option.name}</span>
                <span style={{ color: '#888', fontSize: 12 }}>#{option.customerId}</span>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Buscar cliente..."
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps.input,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F1F3F6',
                  borderRadius: '28px',
                  '& fieldset': { border: 'none' },
                },
              }}
            />
          )}
          sx={{
            flex: 1,
            maxWidth: 500,
            mx: 'auto',
            '& .MuiAutocomplete-clearIndicator': { display: 'none' },
          }}
        />

        <Tabs
          value={tabValue}
          onChange={onTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              minWidth: 100,
            },
          }}
        >
          <Tab label="Estatus" />
          <Tab label="Alertas" />
        </Tabs>

        <Tooltip title="Forzar sincronización ahora">
          <IconButton onClick={handleSync} disabled={syncing} size="small">
            {syncing ? <CircularProgress size={20} /> : <Sync />}
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}
