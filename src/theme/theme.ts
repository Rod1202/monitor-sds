import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0066FF',
    },
    success: {
      main: '#2E7D32',
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#F9A825',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1C1E',
      secondary: '#5F6368',
    },
  },
  typography: {
    fontFamily: ['Roboto', 'Inter', 'sans-serif'].join(','),
    h1: { fontSize: '24px', fontWeight: 600 },
    h2: { fontSize: '20px', fontWeight: 600 },
    subtitle1: { fontSize: '16px', fontWeight: 500 },
    subtitle2: { fontSize: '14px', fontWeight: 500 },
    body1: { fontSize: '14px', fontWeight: 400 },
    body2: { fontSize: '12px', fontWeight: 400 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0,0,0,0.08), 0px 1px 2px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 3px rgba(0,0,0,0.08), 0px 1px 2px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 3px 6px rgba(0,0,0,0.12), 0px 2px 4px rgba(0,0,0,0.08)',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: false,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#FAFBFC',
          },
        },
      },
    },
  },
});

export default theme;
