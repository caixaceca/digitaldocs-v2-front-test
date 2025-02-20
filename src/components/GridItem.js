import PropTypes from 'prop-types';
// @mui
import Grid from '@mui/material/Grid';

// ----------------------------------------------------------------------

GridItem.propTypes = {
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number,
  children: PropTypes.node,
};

export default function GridItem({ xs = 12, sm = xs, md = sm, lg = md, xl = lg, children }) {
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      {children}
    </Grid>
  );
}
