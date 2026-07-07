import { useState, useMemo, useCallback, useRef } from 'react';
import {
  Card, CardContent, Typography, Box, ToggleButton, ToggleButtonGroup,
  Select, MenuItem, FormControl, Skeleton,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import type { Charts, PeriodCount } from '../../types';

interface DashboardLineChartProps {
  charts: Charts;
  loading?: boolean;
}

type ChartView = 'discovered' | 'desync' | 'combined';
type PeriodView = 'weekly' | 'month' | 'year';

const chartTabs: { key: ChartView; label: string }[] = [
  { key: 'discovered', label: 'Equipos Descubiertos' },
  { key: 'desync', label: 'Equipos Desincronizados' },
  { key: 'combined', label: 'Registrados vs Descubiertos' },
];

const periodTabs: { key: PeriodView; label: string }[] = [
  { key: 'weekly', label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'year', label: 'Año' },
];

const MONTHS_ABBR_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic',
];

function formatPeriodLabel(period: string, view: PeriodView): string {
  if (view === 'month') {
    const m = period.match(/^(\d{4})-(\d{2})$/);
    if (m) {
      const month = parseInt(m[2], 10);
      if (month >= 1 && month <= 12) {
        return `${MONTHS_ABBR_ES[month - 1]}-${m[1]}`;
      }
    }
  }
  if (view === 'weekly') {
    const m = period.match(/-W(\d+)$/);
    if (m) return `W${m[1]}`;
  }
  return period;
}

function getYear(p: string): number {
  const m = p.match(/^(\d{4})/);
  return m ? parseInt(m[1], 10) : 0;
}

function filterPeriodByYear(data: PeriodCount[], year: number | null): PeriodCount[] {
  if (year === null) return data;
  return data.filter((d: PeriodCount) => getYear(d.period) === year);
}

function mergePeriods(a: PeriodCount[], b: PeriodCount[]) {
  const keys = new Set([...a.map((d: PeriodCount) => d.period), ...b.map((d: PeriodCount) => d.period)]);
  const sorted = [...keys].sort();
  const mapA = new Map(a.map((d: PeriodCount) => [d.period, d.count]));
  const mapB = new Map(b.map((d: PeriodCount) => [d.period, d.count]));
  return {
    labels: sorted,
    a: sorted.map(k => mapA.get(k) ?? 0),
    b: sorted.map(k => mapB.get(k) ?? 0),
  };
}

function collectYears(...series: PeriodCount[][]): number[] {
  const set = new Set<number>();
  for (const data of series) {
    for (const d of data) {
      const y = getYear(d.period);
      if (y > 0) set.add(y);
    }
  }
  return [...set].sort((a, b) => b - a);
}

function calcVariations(values: number[]): (number | null)[] {
  const result: (number | null)[] = [null];
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    result.push(prev === 0 ? null : ((values[i] - prev) / prev) * 100);
  }
  return result;
}

export default function DashboardLineChart({ charts, loading }: DashboardLineChartProps) {
  const [chartView, setChartView] = useState<ChartView>('discovered');
  const [period, setPeriod] = useState<PeriodView>('weekly');

  const years = useMemo(() => {
    const result = collectYears(
      charts.discoveredWeekly, charts.discoveredMonthly, charts.discoveredYearly,
      charts.desyncWeekly, charts.desyncMonthly, charts.desyncYearly,
      charts.registeredWeekly, charts.registeredMonthly, charts.registeredYearly,
    );
    return result;
  }, [charts]);

  const [selectedYear, setSelectedYear] = useState<number | null>(
    years.length > 0 ? years[0] : null,
  );

  const { series, xLabels, variations } = useMemo(() => {
    const discovered = (y: number | null) => ({
      weekly: filterPeriodByYear(charts.discoveredWeekly, y),
      month: filterPeriodByYear(charts.discoveredMonthly, y),
      year: filterPeriodByYear(charts.discoveredYearly, y),
    });
    const desync = (y: number | null) => ({
      weekly: filterPeriodByYear(charts.desyncWeekly, y),
      month: filterPeriodByYear(charts.desyncMonthly, y),
      year: filterPeriodByYear(charts.desyncYearly, y),
    });
    const registered = (y: number | null) => ({
      weekly: filterPeriodByYear(charts.registeredWeekly, y),
      month: filterPeriodByYear(charts.registeredMonthly, y),
      year: filterPeriodByYear(charts.registeredYearly, y),
    });

    if (chartView === 'discovered') {
      const d = discovered(selectedYear)[period];
      const vals = d.map((v: PeriodCount) => v.count);
      return {
        series: [{ id: 'discovered', data: vals, label: 'Descubiertos', color: '#0066FF' }],
        xLabels: d.map((v: PeriodCount) => formatPeriodLabel(v.period, period)),
        variations: { discovered: calcVariations(vals) },
      };
    }

    if (chartView === 'desync') {
      const d = desync(selectedYear)[period];
      const vals = d.map((v: PeriodCount) => v.count);
      return {
        series: [{ id: 'desync', data: vals, label: 'Desincronizados', color: '#D32F2F' }],
        xLabels: d.map((v: PeriodCount) => formatPeriodLabel(v.period, period)),
        variations: { desync: calcVariations(vals) },
      };
    }

    const reg = registered(selectedYear);
    const disc = discovered(selectedYear);
    const merged = mergePeriods(reg[period], disc[period]);
    return {
      series: [
        { id: 'registered', data: merged.a, label: 'Registrados', color: '#0066FF' },
        { id: 'discovered', data: merged.b, label: 'Descubiertos', color: '#727687' },
      ],
      xLabels: merged.labels.map(l => formatPeriodLabel(l, period)),
      variations: {
        registered: calcVariations(merged.a),
        discovered: calcVariations(merged.b),
      },
    };
  }, [chartView, period, selectedYear, charts]);

  const variationsRef = useRef(variations);
  variationsRef.current = variations;

  const CustomMark = useCallback(function CustomMark(props: any) {
    const { x, y, dataIndex, color } = props;
    const seriesVariations = (variationsRef.current as unknown as Record<string, (number | null)[]>)[props.seriesId as string];
    const variation = seriesVariations?.[dataIndex];

    if (variation == null || dataIndex === 0) {
      return <circle cx={x} cy={y} r={4} fill={color} />;
    }

    const isUp = variation >= 0;
    const label = `${isUp ? '\u25B2' : '\u25BC'}${Math.abs(variation).toFixed(1)}%`;

    return (
      <g>
        <circle cx={x} cy={y} r={4} fill={color} />
        <text
          x={x}
          y={y - 12}
          textAnchor="middle"
          fontSize={9}
          fontWeight={600}
          fill={isUp ? '#2E7D32' : '#D32F2F'}
        >
          {label}
        </text>
      </g>
    );
  }, []);

  const angle = 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={selectedYear != null ? String(selectedYear) : ''}
              onChange={e => setSelectedYear(e.target.value === '' ? null : Number(e.target.value))}
              displayEmpty
            >
              <MenuItem value="">Todos</MenuItem>
              {years.map(y => (
                <MenuItem key={y} value={String(y)}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            size="small"
            value={chartView}
            exclusive
            onChange={(_e, val) => val && setChartView(val)}
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none', fontSize: 13, fontWeight: 500,
                px: 2, py: 0.5,
                border: '1px solid', borderColor: 'divider',
                borderRadius: '8px!important', mx: 0.3,
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: 'primary.main', color: 'white',
                  borderColor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              },
            }}
          >
            {chartTabs.map(t => (
              <ToggleButton key={t.key} value={t.key}>{t.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <ToggleButtonGroup
            size="small"
            value={period}
            exclusive
            onChange={(_e, val) => val && setPeriod(val)}
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none', fontSize: 12, px: 1.5, py: 0.3,
                border: 'none', borderRadius: '8px!important', mx: 0.3,
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: 'background.paper', color: 'primary.main',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.08)',
                },
              },
            }}
          >
            {periodTabs.map(p => (
              <ToggleButton key={p.key} value={p.key}>{p.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {loading ? (
            <Skeleton variant="rectangular" sx={{ height: '100%', minHeight: 250, borderRadius: 2 }} />
          ) : series.length > 0 && series[0].data.length > 0 ? (
            <LineChart
              xAxis={[{
                scaleType: 'point',
                data: xLabels,
                tickLabelStyle: { fontSize: 9, angle },
              }]}
              yAxis={[{
                disableLine: true,
                disableTicks: true,
                tickLabelStyle: { display: 'none' },
              }]}
              series={series.map(s => ({
                ...s,
                showMark: true,
                valueFormatter: (value: number | null, ctx: { dataIndex: number }) => {
                  const sv = (variations as unknown as Record<string, (number | null)[]>)[s.id as string];
                  const v = sv?.[ctx.dataIndex];
                  if (v != null && ctx.dataIndex > 0) {
                    const d = v >= 0 ? '\u25B2' : '\u25BC';
                    return `${value ?? ''}  ${d} ${Math.abs(v).toFixed(1)}%`;
                  }
                  return value != null ? String(value) : '';
                },
              }))}
              slots={{ mark: CustomMark } as never}
              height={300}
              slotProps={{ legend: { hidden: chartView !== 'combined' } } as never}
              margin={{ top: 25, right: chartView === 'combined' ? 80 : 10, bottom: 40, left: 10 }}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
              <Typography variant="body2" color="text.secondary">Sin datos para el período seleccionado</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
