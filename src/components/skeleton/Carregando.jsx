// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
//
import GridItem from '../GridItem';

// ---------------------------------------------------------------------------------------------------------------------

export function Carregando1({ ball = 4, wh = 20 }) {
  return (
    <Stack direction="row" justifyContent="center" sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {[...Array(ball)].map((row, index) => (
          <Skeleton variant="circular" sx={{ width: wh, height: wh, mr: 1 }} key={`index_${index}`} />
        ))}
      </Box>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SkeletonContainer({ height = { xs: 400, sm: 760 } }) {
  return (
    <GridItem children={<Skeleton variant="rectangular" sx={{ height, borderRadius: 2, transform: 'scale(1)' }} />} />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SkeletonBar({ column, height = 50 }) {
  return (
    <Stack spacing={2}>
      {[...Array(column)].map((row, index) => (
        <Skeleton key={`bar_${index}`} variant="text" height={height} sx={{ transform: 'none' }} />
      ))}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function PieChart() {
  return <Skeleton variant="circular" sx={{ width: 280, height: 280 }} />;
}

// ---------------------------------------------------------------------------------------------------------------------

export function BarChart() {
  return (
    <Stack direction="row" alignItems="end" justifyContent="center" sx={{ py: 10 }}>
      <Skeleton variant="rectangular" sx={{ width: 40, height: 100, borderRadius: 0.75, mr: 2 }} />
      <Skeleton variant="rectangular" sx={{ width: 40, height: 160, borderRadius: 0.75, mr: 2 }} />
      <Skeleton variant="rectangular" sx={{ width: 40, height: 200, borderRadius: 0.75, mr: 2 }} />
      <Skeleton variant="rectangular" sx={{ width: 40, height: 300, borderRadius: 0.75, mr: 2 }} />
      <Skeleton variant="rectangular" sx={{ width: 40, height: 200, borderRadius: 0.75, mr: 2 }} />
      <Skeleton variant="rectangular" sx={{ width: 40, height: 50, borderRadius: 0.75, mr: 2 }} />
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FormLoading({ rows = 0 }) {
  return (
    <Stack justifyContent="right" spacing={3} sx={{ mt: 3 }}>
      {rows > 0 ? (
        <>
          {[...Array(rows)].map((_, index) => (
            <Skeleton
              variant="text"
              key={`sk_${index}`}
              sx={{ height: 50, transform: 'none', width: 1, borderRadius: 1 }}
            />
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

// ---------------------------------------------------------------------------------------------------------------------

export function SkeletonEntidade() {
  return (
    <>
      <GridItem children={<Skeleton variant="text" height={140} sx={{ transform: 'none' }} />} />
      <GridItem children={<Skeleton variant="text" height={45} sx={{ transform: 'none' }} />} />
      {[...Array(2)].map((row, index) => (
        <GridItem
          sm={6}
          key={`entidade_${index}`}
          children={<Skeleton variant="text" height={500} sx={{ transform: 'none' }} />}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SkeletonProcesso() {
  return (
    <Grid container spacing={5} sx={{ pt: 2 }}>
      <GridItem md={5}>
        <Skeleton variant="text" sx={{ width: 0.5, height: 50 }} />
        <Skeleton variant="text" sx={{ width: 0.75, height: 50 }} />
        <Skeleton variant="text" sx={{ width: 0.85, height: 50 }} />
        <Skeleton variant="text" sx={{ width: 0.5, height: 50 }} />
        <Skeleton variant="text" sx={{ width: 0.25, height: 50 }} />
        <Skeleton variant="text" sx={{ height: 50 }} />
        <Skeleton variant="text" sx={{ height: 50 }} />
        <Skeleton variant="text" sx={{ height: 130, transform: 'scale(1)', mb: 3, mt: 2 }} />
        <Skeleton variant="text" sx={{ height: 130, transform: 'scale(1)' }} />
      </GridItem>

      <GridItem md={7}>
        <Skeleton variant="text" sx={{ height: 500, transform: 'scale(1)', mb: 1 }} />
        <Skeleton variant="text" sx={{ height: 50 }} />
        <Skeleton variant="text" sx={{ height: 50 }} />
        <Skeleton variant="text" sx={{ height: 50 }} />
      </GridItem>
    </Grid>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SkeletonTable({ column, row }) {
  return [...Array(row)].map((_, index) => (
    <TableRow key={`row_${index}`}>
      {[...Array(column)].map((_, index1) => (
        <TableCell key={`column_${index}_${index1}`} sx={{ minWidth: 80 }}>
          <Skeleton variant="rectangular" sx={{ height: 25, borderRadius: 1, transform: 'scale(1)' }} />
        </TableCell>
      ))}
    </TableRow>
  ));
}

// ---------------------------------------------------------------------------------------------------------------------

export function TicketSkeleton() {
  return (
    <Stack spacing={2} sx={{ pt: 3 }}>
      <Skeleton variant="text" height={36} sx={{ width: { xs: '90%', sm: '40%' }, transform: 'none' }} />
      <Skeleton variant="text" height={18} sx={{ width: { xs: '60%', sm: '25%' }, transform: 'none' }} />
      <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1 }} />
      <Stack direction="row" spacing={1}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
      </Stack>
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DashboardTicketSkeleton() {
  return (
    <Grid container spacing={3}>
      {[...Array(4)].map((_, index) => (
        <GridItem key={`card_${index}`} xs={6} lg={3}>
          <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 2 }} />
        </GridItem>
      ))}
      {[...Array(2)].map(() => (
        <>
          <GridItem sm={6} md={7}>
            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
          </GridItem>
          <GridItem sm={6} md={5}>
            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
          </GridItem>
        </>
      ))}
    </Grid>
  );
}
