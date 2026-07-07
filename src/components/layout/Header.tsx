import { useMemo } from 'react';
import { AppBar, Toolbar, TextField, InputAdornment, Tabs, Tab, Box, Autocomplete } from '@mui/material';
import { Search } from '@mui/icons-material';
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
      </Toolbar>
    </AppBar>
  );
}
