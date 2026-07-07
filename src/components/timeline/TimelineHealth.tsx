import { Box, Typography, Tooltip } from '@mui/material';

interface TimelineEvent {
  date: string;
  label: string;
  type: 'sync_lost' | 'recovery' | 'no_contact' | 'duplicate' | 'discovery';
}

const eventColors: Record<string, string> = {
  sync_lost: '#D32F2F',
  recovery: '#2E7D32',
  no_contact: '#F9A825',
  duplicate: '#D32F2F',
  discovery: '#0066FF',
};

const eventIcons: Record<string, string> = {
  sync_lost: '✕',
  recovery: '✓',
  no_contact: '!',
  duplicate: '◎',
  discovery: '✦',
};

interface TimelineHealthProps {
  events: TimelineEvent[];
}

export default function TimelineHealth({ events }: TimelineHealthProps) {
  if (events.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
        <Typography variant="body2">No hay eventos en la línea de tiempo</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', py: 3, px: 2 }}>
      <Box sx={{
        position: 'absolute', top: '50%', left: 24, right: 24, height: 2,
        bgcolor: 'grey.300', transform: 'translateY(-50%)',
      }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        {events.map((event, i) => (
          <Tooltip key={i} title={`${event.label} — ${event.date}`} arrow>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '50%',
                bgcolor: eventColors[event.type],
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
                border: '3px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
              }}>
                {eventIcons[event.type]}
              </Box>
              <Typography variant="caption" sx={{ fontSize: 10, textAlign: 'center', maxWidth: 80, lineHeight: 1.2 }}>
                {event.date}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}
