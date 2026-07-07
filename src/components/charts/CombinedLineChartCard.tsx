import { useState } from 'react';
import { Card, CardContent, Typography, Box, ToggleButton, ToggleButtonGroup, Skeleton } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
interface CombinedSeries {
  weekly: { labels: string[]; a: number[]; b: number[] };
  month: { labels: string[]; a: number[]; b: number[] };
  year: { labels: string[]; a: number[]; b: number[] };
}

interface CombinedLineChartCardProps {
  title: string;
  data: CombinedSeries;
  seriesALabel: string;
  seriesAColor: string;
  seriesBLabel: string;
  seriesBColor: string;
  loading?: boolean;
}

const periods = [
  { key: 'weekly' as const, label: 'Semana' },
  { key: 'month' as const, label: 'Mes' },
  { key: 'year' as const, label: 'Año' },
];

export default function CombinedLineChartCard({
  title, data, seriesALabel, seriesAColor, seriesBLabel, seriesBColor, loading,
}: CombinedLineChartCardProps) {
  const [period, setPeriod] = useState<'weekly' | 'month' | 'year'>('weekly');

  const current = data[period];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle1">{title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 14, height: 3, borderRadius: 1, bgcolor: seriesAColor }} />
              <Typography variant="caption" color="text.secondary">{seriesALabel}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 14, height: 3, borderRadius: 1, bgcolor: seriesBColor }} />
              <Typography variant="caption" color="text.secondary">{seriesBLabel}</Typography>
            </Box>
          </Box>
          <ToggleButtonGroup
            size="small"
            value={period}
            exclusive
            onChange={(_e, val) => val && setPeriod(val)}
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none', fontSize: 12, px: 1.5, py: 0.5,
                border: 'none', borderRadius: '8px!important', mx: 0.3,
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: 'background.paper', color: 'primary.main',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.08)',
                },
              },
            }}
          >
            {periods.map((p) => (
              <ToggleButton key={p.key} value={p.key}>{p.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {loading ? (
            <Skeleton variant="rectangular" sx={{ height: '100%', minHeight: 200, borderRadius: 2 }} />
          ) : (
            <LineChart
              xAxis={[{ scaleType: 'point', data: current.labels }]}
              series={[
                { data: current.a, label: seriesALabel, color: seriesAColor, showMark: false, area: true },
                { data: current.b, label: seriesBLabel, color: seriesBColor, showMark: false },
              ]}
              height={220}
              slotProps={{ legend: { hidden: true } } as never}
              margin={{ top: 10, right: 10, bottom: 30, left: 40 }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
