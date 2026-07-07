import { useState } from 'react';
import { Card, CardContent, Typography, Box, ToggleButton, ToggleButtonGroup, Skeleton } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

interface PeriodData {
  label: string;
  value: number;
}

interface LineSeries {
  data: number[];
  label: string;
  color: string;
}

interface LineChartCardProps {
  title: string;
  weekly: PeriodData[];
  month: PeriodData[];
  year: PeriodData[];
  seriesLabel: string;
  seriesColor: string;
  secondarySeries?: { label: string; data: number[]; color: string };
  labels?: string[];
  loading?: boolean;
  alertState?: boolean;
}

const periods = [
  { key: 'weekly', label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'year', label: 'Año' },
];

export default function LineChartCard({
  title, weekly, month, year, seriesLabel, seriesColor,
  secondarySeries, labels: externalLabels, loading, alertState,
}: LineChartCardProps) {
  const [period, setPeriod] = useState<'weekly' | 'month' | 'year'>('weekly');

  const periodMap = { weekly, month, year };
  const current = periodMap[period];

  const dataValues = current.map((d) => d.value);
  const xLabels = externalLabels || current.map((d) => d.label);

  const series: LineSeries[] = [
    { data: dataValues, label: seriesLabel, color: seriesColor },
  ];

  if (secondarySeries) {
    series.push({
      data: secondarySeries.data,
      label: secondarySeries.label,
      color: secondarySeries.color,
    });
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1">{title}</Typography>
            {alertState && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: 'error.main', color: 'white', px: 1, py: 0.2,
                  borderRadius: 1, fontWeight: 700, fontSize: 10,
                }}
              >
                ALERT STATE
              </Typography>
            )}
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
                  bgcolor: 'background.paper',
                  color: 'primary.main',
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
              xAxis={[{ scaleType: 'point', data: xLabels }]}
              series={series.map((s) => ({
                data: s.data,
                label: s.label,
                color: s.color,
                showMark: false,
                area: true,
              }))}
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
