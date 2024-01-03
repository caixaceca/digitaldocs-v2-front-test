import PropTypes from 'prop-types';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------

FormLoading.propTypes = { rows: PropTypes.number };

export function FormLoading({ rows = 0 }) {
  return (
    <Stack justifyContent="right" spacing={3} sx={{ mt: 3 }}>
      {rows > 0 ? (
        <>
          {[...Array(rows)].map((z, y) => (
            <Skeleton key={y} variant="text" sx={{ height: 50, transform: 'none', width: 1, borderRadius: 1 }} />
          ))}
          <Skeleton variant="text" sx={{ height: 100, transform: 'none', width: 1, borderRadius: 1 }} />
        </>
      ) : (
        <>
          <Skeleton variant="text" sx={{ height: 80, width: 1, transform: 'scale(1)' }} />
          <Skeleton variant="text" sx={{ height: 110, width: 1, transform: 'scale(1)' }} />
          <Skeleton variant="text" sx={{ height: 140, width: 1, transform: 'scale(1)' }} />
        </>
      )}
      <Stack direction="row" justifyContent="right" spacing={1.5}>
        <Skeleton variant="text" sx={{ height: 40, width: 95, transform: 'scale(1)' }} />
        <Skeleton variant="text" sx={{ height: 40, width: 95, transform: 'scale(1)' }} />
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function SkeletonPedidoCredito() {
  return (
    <Grid container spacing={3}>
      {[...Array(8)].map((row, index) => (
        <Grid item xs={12} md={3} key={`index_${index}`}>
          <Skeleton variant="text" height={90} sx={{ transform: 'none' }} />
        </Grid>
      ))}
      {[...Array(5)].map((row, index) => (
        <Grid item xs={12} key={`index1_${index}`}>
          <Skeleton variant="text" height={45} sx={{ transform: 'none' }} />
        </Grid>
      ))}
    </Grid>
  );
}
