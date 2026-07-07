import { Card, CardContent, Typography, Box, LinearProgress, Divider } from '@mui/material';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartCardProps {
  title: string;
  segments: DonutSegment[];
  total?: number;
  totalLabel?: string;
}

function pct(v: number, t: number): string {
  if (t === 0) return '0%';
  return `${((v / t) * 100).toFixed(1)}%`;
}

function pctNum(v: number, t: number): number {
  if (t === 0) return 0;
  return (v / t) * 100;
}

export default function DonutChartCard({ title, segments, total, totalLabel }: DonutChartCardProps) {
  const totalValue = total ?? segments.reduce((sum, s) => sum + s.value, 0);
  const circumference = 2 * Math.PI * 16;
  let offset = 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 5, p: 3 }}>
        <Box sx={{ position: 'relative', width: 200, height: 200, flexShrink: 0 }}>
          <svg viewBox="0 0 36 36" width="200" height="200">
            <circle cx="18" cy="18" r="16" fill="none" stroke="#f0f0f0" strokeWidth="3.5" />
            {segments.map((seg) => {
              const dashLength = circumference * (seg.value / totalValue);
              const dashOffset = -offset;
              offset += dashLength;
              return (
                <circle
                  key={seg.label}
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="3.5"
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 18 18)"
                />
              );
            })}
          </svg>
          <Box sx={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography variant="h2" sx={{ fontWeight: 700 }}>{totalValue.toLocaleString()}</Typography>
            <Typography variant="body2" color="text.secondary">{totalLabel || 'Total'}</Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, width: '100%' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>{title}</Typography>
          <Divider sx={{ mb: 1.5 }} />
          {segments.map((seg) => {
            const p = pctNum(seg.value, totalValue);
            return (
              <Box key={seg.label} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: seg.color, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>{seg.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {seg.value.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={p}
                    sx={{
                      flex: 1, height: 8, borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': { bgcolor: seg.color, borderRadius: 4 },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 42, textAlign: 'right' }}>
                    {pct(seg.value, totalValue)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
