import { useState } from 'react';
import { Card, CardContent, Typography, Box, TablePagination } from '@mui/material';

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

interface BarChartCardProps {
  title: string;
  items: BarItem[];
  maxBar?: number;
}

export default function BarChartCard({ title, items, maxBar }: BarChartCardProps) {
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const maxValue = maxBar ?? Math.max(...items.map((i) => i.value), 1);
  const pageItems = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>{title}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
          {pageItems.map((item) => (
            <Box key={item.label}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>{item.label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.value.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${(item.value / maxValue) * 100}%`,
                    height: '100%',
                    bgcolor: item.color || 'primary.main',
                    borderRadius: 1,
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
        {items.length > rowsPerPage && (
          <TablePagination
            component="div"
            count={items.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
            labelRowsPerPage=""
          />
        )}
      </CardContent>
    </Card>
  );
}
