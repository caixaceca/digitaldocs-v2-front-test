import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { Box, Fab, Stack, Typography } from '@mui/material';
// components
import SvgIconStyle from './SvgIconStyle';

// ----------------------------------------------------------------------

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const goTop = () => {
    window.scrollTo(0, 0);
  };

  const [scrollPosition, setScrollPosition] = useState(0);
  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollPosition > 600 ? (
    <Box sx={{ top: 12, bottom: 12, right: 0, position: 'fixed', zIndex: 200 }}>
      <Box sx={{ right: 75, bottom: 10, position: 'absolute' }}>
        <Fab color="inherit" onClick={goTop} sx={{ width: 49, height: 49 }}>
          <Stack alignItems="center">
            <SvgIconStyle src="/assets/icons/arrow-ios-upward.svg" sx={{ width: 28, height: 28 }} />
            <Typography variant="caption" sx={{ fontWeight: 900, pb: 1, mt: -0.5 }}>
              TOPO
            </Typography>
          </Stack>
        </Fab>
      </Box>
    </Box>
  ) : null;
}
