// @mui
import { Grid, Card, Skeleton, CardContent } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonNormativa() {
  return (
    <Card>
      <CardContent>
        <Grid container spacing={5}>
          <Grid item xs={12} md={5}>
            <Skeleton variant="text" sx={{ width: 0.5, height: 50 }} />
            <Skeleton variant="text" sx={{ width: 0.75, height: 50 }} />
            <Skeleton variant="text" sx={{ width: 0.85, height: 50 }} />
            <Skeleton variant="text" sx={{ width: 0.5, height: 50 }} />
            <Skeleton variant="text" sx={{ width: 0.25, height: 50 }} />
            <Skeleton variant="text" sx={{ height: 50 }} />
            <Skeleton variant="text" sx={{ height: 50 }} />
            <Skeleton variant="text" sx={{ height: 130, transform: 'scale(1)', mb: 3, mt: 2 }} />
            <Skeleton variant="text" sx={{ height: 130, transform: 'scale(1)' }} />
          </Grid>

          <Grid item xs={12} md={7}>
            <Skeleton variant="text" sx={{ height: 500, transform: 'scale(1)', mb: 1 }} />
            <Skeleton variant="text" sx={{ height: 50 }} />
            <Skeleton variant="text" sx={{ height: 50 }} />
            <Skeleton variant="text" sx={{ height: 50 }} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
