import SimpleBarReact from 'simplebar-react';
// @mui
import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

// ---------------------------------------------------------------------------------------------------------------------

const RootStyle = styled('div')(() => ({ flexGrow: 1, height: '100%', overflow: 'hidden' }));

const SimpleBarStyle = styled(SimpleBarReact)(({ theme }) => ({
  maxHeight: '100%',
  '& .simplebar-scrollbar': {
    '&:before': { backgroundColor: alpha(theme.palette.grey[600], 0.48) },
    '&.simplebar-visible:before': { opacity: 1 },
  },
  '& .simplebar-track.simplebar-vertical': { width: 10 },
  '& .simplebar-track.simplebar-horizontal .simplebar-scrollbar': { height: 12 },
  '& .simplebar-mask': { zIndex: 'inherit' },
}));

// ---------------------------------------------------------------------------------------------------------------------

export default function Scrollbar({ children, sx, ...other }) {
  const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile) {
    return (
      <Box sx={{ overflowX: 'auto', ...sx }} {...other}>
        {children}
      </Box>
    );
  }

  return (
    <RootStyle>
      <SimpleBarStyle timeout={500} clickOnTrack={false} sx={sx} {...other}>
        {children}
      </SimpleBarStyle>
    </RootStyle>
  );
}
