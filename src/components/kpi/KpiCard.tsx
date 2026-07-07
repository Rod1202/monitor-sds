import { Card, CardContent, Typography, Box, Chip, CircularProgress } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  chip?: { label: string; color: 'success' | 'error' | 'warning' | 'primary' | 'default' };
  progress?: { value: number; color: 'success' | 'error' | 'warning' | 'primary' };
  trend?: 'up' | 'down';
  trendValue?: string;
  subtitle?: string;
  onClick?: () => void;
}

export default function KpiCard({ label, value, icon, iconBgColor = '#0066FF', iconColor = '#fff', chip, progress, trend, trendValue, subtitle, onClick }: KpiCardProps) {
  const clickable = !!onClick;
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        '&:hover': clickable ? { boxShadow: 4, transform: 'translateY(-2px)' } : {},
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          {icon && (
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: 2,
              bgcolor: iconBgColor, color: iconColor,
            }}>
              {icon}
            </Box>
          )}
          {progress !== undefined && (
            <Box sx={{ position: 'relative', width: 44, height: 44 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={44}
                thickness={4}
                sx={{ color: 'grey.200', position: 'absolute' }}
              />
              <CircularProgress
                variant="determinate"
                value={progress.value}
                size={44}
                thickness={4}
                color={progress.color}
              />
            </Box>
          )}
        </Box>
        <Typography variant="h1" sx={{ mb: 0.5 }}>
          {value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {chip && (
            <Chip label={chip.label} color={chip.color} size="small" sx={{ height: 20, fontSize: 10 }} />
          )}
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: trend === 'up' ? 'success.main' : 'error.main' }}>
              <TrendingUp sx={{ fontSize: 16 }} />
              {trendValue && (
                <Typography variant="body2" sx={{ color: 'inherit' }}>
                  {trendValue}
                </Typography>
              )}
            </Box>
          )}
        </Box>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.3 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
