// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

// ----------------------------------------------------------------------

export function Carregando1() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Skeleton variant="circular" sx={{ width: 20, height: 20, mr: 1 }} />
      <Skeleton variant="circular" sx={{ width: 20, height: 20, mr: 1 }} />
      <Skeleton variant="circular" sx={{ width: 20, height: 20, mr: 1 }} />
      <Skeleton variant="circular" sx={{ width: 20, height: 20, mr: 1 }} />
    </Box>
  );
}

export function Carregando2() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Skeleton variant="circular" sx={{ width: 12, height: 12, mr: 0.5 }} />
      <Skeleton variant="circular" sx={{ width: 12, height: 12, mr: 0.5 }} />
      <Skeleton variant="circular" sx={{ width: 12, height: 12, mr: 0.5 }} />
      <Skeleton variant="circular" sx={{ width: 12, height: 12, mr: 0.5 }} />
    </Box>
  );
}

export function PieChart() {
  return <Skeleton variant="circular" sx={{ width: 280, height: 280 }} />;
}

export function BarChart() {
  return (
    <Stack direction="row" alignItems="end" sx={{ py: 10 }}>
      <Skeleton variant="rectangular" sx={{ width: 40, height: 100, borderRadius: 0.75, mr: 2 }} />
      <Skeleton variant="rectangular" sx={{ width: 40, height: 160, borderRadius: 0.75, mr: 2 }} />
      <Skeleton variant="rectangular" sx={{ width: 40, height: 200, borderRadius: 0.75, mr: 2 }} />
      <Skeleton variant="rectangular" sx={{ width: 40, height: 300, borderRadius: 0.75, mr: 2 }} />
      <Skeleton variant="rectangular" sx={{ width: 40, height: 200, borderRadius: 0.75, mr: 2 }} />
      <Skeleton variant="rectangular" sx={{ width: 40, height: 50, borderRadius: 0.75, mr: 2 }} />
    </Stack>
  );
}
