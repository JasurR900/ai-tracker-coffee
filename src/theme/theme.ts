'use client';

import { createTheme } from '@mui/material/styles';

export const colors = {
  navy: '#1B1B6D',
  navyDark: '#14145C',
  heading: '#161645',
  orange: '#F94C10',
  orangeDeep: '#F04E23',
  bg: '#F4F5F9',
  card: '#FFFFFF',
  textSecondary: '#8E92A3',
  textMuted: '#B4B7C3',
  divider: '#ECEDF2',
  selectedBg: '#EDEDF7',
  protein: '#C64A5B',
  carbs: '#B07B4F',
  fats: '#7BB241',
  track: '#E8E9EF',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: colors.navy, dark: colors.navyDark },
    secondary: { main: colors.orange },
    background: { default: colors.bg, paper: colors.card },
    text: {
      primary: colors.heading,
      secondary: colors.textSecondary,
    },
    divider: colors.divider,
  },
  typography: {
    fontFamily: 'var(--font-manrope), "Manrope", "Segoe UI", sans-serif',
    h1: { fontWeight: 800, fontSize: 28, color: colors.heading },
    h2: { fontWeight: 800, fontSize: 24, color: colors.heading },
    h3: { fontWeight: 800, fontSize: 20, color: colors.heading },
    subtitle1: { fontWeight: 700, fontSize: 16 },
    body1: { fontSize: 15 },
    body2: { fontSize: 13.5, color: colors.textSecondary },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 14, boxShadow: 'none' },
        contained: {
          '&.MuiButton-colorPrimary': {
            backgroundColor: colors.navy,
            '&:hover': { backgroundColor: colors.navyDark, boxShadow: 'none' },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: '0 6px 24px rgba(23, 26, 78, 0.06)' },
      },
    },
  },
});
