import { Card, CardContent, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

interface InfoCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export default function InfoCard({ label, value, unit, icon, iconBgColor = '#0066FF', iconColor = '#fff' }: InfoCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
          <Typography variant="h1" component="span">{value}</Typography>
          {unit && (
            <Typography variant="subtitle2" component="span" color="text.secondary" sx={{ ml: 0.5 }}>
              {unit}
            </Typography>
          )}
        </Box>
        <Box sx={{
          width: 48, height: 48, borderRadius: 2,
          bgcolor: iconBgColor, color: iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
}
