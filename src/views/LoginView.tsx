import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, CircularProgress, Dialog,
  DialogContent, Fade, Button,
} from '@mui/material';
import { setCache } from '../utils/cache';

interface LoginViewProps {
  onAuthenticated: () => void;
}

const PRELOAD_URLS = [
  '/api/dashboard?view=status',
  '/api/dashboard?view=alerts',
  '/api/dashboard?view=customers',
  '/api/dashboard?view=customer-details',
];

async function preloadData(onProgress: (pct: number) => void) {
  let completed = 0;
  const results = await Promise.allSettled(
    PRELOAD_URLS.map(async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed: ${url}`);
      const data = await res.json();
      setCache(url, data);
      completed++;
      onProgress(Math.round((completed / PRELOAD_URLS.length) * 100));
    }),
  );
  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    console.warn(`${failed.length} preload request(s) failed — continuing with cached or live data`);
  }
}

export default function LoginView({ onAuthenticated }: LoginViewProps) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const validatePin = useCallback((pinDigits: string[]) => {
    const pin = pinDigits.join('');
    const validPin = import.meta.env.VITE_APP_PIN || '2026';
    if (pin !== validPin) {
      setError('PIN incorrecto');
      setDigits(['', '', '', '']);
      inputsRef.current[0]?.focus();
      return false;
    }
    return true;
  }, []);

  const startLoading = useCallback(() => {
    setError('');
    setLoading(true);
    setProgress(0);
    preloadData(setProgress).then(() => {
      onAuthenticated();
    });
  }, [onAuthenticated]);

  const handleDigitChange = useCallback((index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    setError('');
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }

    if (value && index === 3) {
      if (validatePin(newDigits)) {
        startLoading();
      }
    }
  }, [digits, validatePin, startLoading]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      inputsRef.current[index - 1]?.focus();
    }
  }, [digits]);

  const handleButtonClick = useCallback(() => {
    if (validatePin(digits)) {
      startLoading();
    }
  }, [digits, validatePin, startLoading]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#F5F7FA',
          px: 2,
        }}
      >
        <Fade in timeout={400}>
          <Card
            sx={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 4,
              boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box
                component="img"
                src="/logoMT.avif"
                alt="Monitor SDS"
                sx={{ height: 56, width: 'auto', mb: 3 }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ingrese su PIN de acceso
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
                {digits.map((d, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 52, height: 68,
                      border: '2px solid',
                      borderColor: error ? 'error.main' : d ? '#0066FF' : '#E0E0E0',
                      borderRadius: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: d ? '#F0F6FF' : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      ref={el => { inputsRef.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      style={{
                        width: '100%', height: '100%', border: 'none', outline: 'none',
                        background: 'transparent', textAlign: 'center',
                        fontSize: 28, fontWeight: 700, fontFamily: 'inherit',
                        color: '#1A1C1E', caretColor: '#0066FF',
                      }}
                    />
                  </Box>
                ))}
              </Box>

              {error && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleButtonClick}
                sx={{
                  bgcolor: '#0066FF', py: 1.5, fontSize: 16, fontWeight: 600,
                  textTransform: 'none', borderRadius: 2,
                  '&:hover': { bgcolor: '#0052CC' },
                }}
              >
                Validar
              </Button>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
                Power by Rodrigo Carbonel
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      </Box>

      <Dialog
        open={loading}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(4px)',
              bgcolor: 'rgba(0,0,0,0.3)',
            },
          },
          paper: {
            sx: {
              borderRadius: 4,
              boxShadow: '0px 8px 32px rgba(0,0,0,0.12)',
              maxWidth: 380,
            },
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 5, px: 4 }}>
          <CircularProgress size={56} thickness={4} sx={{ color: '#0066FF', mb: 2 }} />
          <Typography variant="h1" sx={{ fontSize: 18, fontWeight: 600, mb: 0.5 }}>
            Cargando datos...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Obteniendo información del dashboard
          </Typography>
          <Box
            sx={{
              width: '100%', height: 6, bgcolor: '#E0E0E0', borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${progress}%`, height: '100%', bgcolor: '#0066FF',
                borderRadius: 3, transition: 'width 0.4s ease',
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {progress}%
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}
