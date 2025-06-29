// @mui
import Grid from '@mui/material/Grid';

// ---------------------------------------------------------------------------------------------------------------------

export default function GridItem({ xs = 12, sm = xs, md = sm, lg = md, xl = lg, children }) {
  return <Grid size={{ xs, sm, md, lg, xl }}>{children}</Grid>;
}
