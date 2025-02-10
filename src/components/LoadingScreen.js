import { m } from 'framer-motion';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
//
import Logo from './Logo';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  right: 0,
  bottom: 0,
  zIndex: 99999,
  width: '100%',
  height: '100%',
  display: 'flex',
  position: 'fixed',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
}));

// ----------------------------------------------------------------------

export default function LoadingScreen({ ...other }) {
  return (
    <RootStyle {...other}>
      <Loading />
    </RootStyle>
  );
}

// ----------------------------------------------------------------------

export function Loading() {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress size={120} thickness={2} />
      <Box
        sx={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          position: 'absolute',
          justifyContent: 'center',
        }}
      >
        <m.div
          animate={{ opacity: [1, 0.5, 0.75, 1, 1, 0.75, 0.5, 1] }}
          transition={{ duration: 2, ease: 'easeInOut', repeatDelay: 1, repeat: Infinity }}
        >
          <Logo disabledLink sx={{ width: 50, height: 50 }} />
        </m.div>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function LoadingPanel({ ...other }) {
  return (
    <Stack direction="column" alignItems="center" justifyContent="center" sx={{ height: 1 }}>
      <Loading />
      <Typography sx={{ color: 'text.secondary', mt: 3 }}>{other?.msg}</Typography>
    </Stack>
  );
}
