import { m } from 'framer-motion';
// @mui
import { styled } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';
//
import Logo from './Logo';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  right: 0,
  bottom: 0,
  zIndex: 99999,
  width: '100%',
  height: '100%',
  position: 'fixed',
  display: 'flex',
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
      <CircularProgress size={120} thickness={1} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <m.div
          animate={{ scale: [1, 0.9, 0.9, 1, 1], opacity: [1, 0.48, 0.48, 1, 1] }}
          transition={{ duration: 2, ease: 'easeInOut', repeatDelay: 1, repeat: Infinity }}
        >
          <Logo disabledLink sx={{ width: 50, height: 50 }} />
        </m.div>
      </Box>
    </Box>
  );
}
