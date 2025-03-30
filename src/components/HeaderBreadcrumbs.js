import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
//
import Breadcrumbs from './Breadcrumbs';

// ----------------------------------------------------------------------

HeaderBreadcrumbs.propTypes = {
  sx: PropTypes.object,
  links: PropTypes.array,
  action: PropTypes.node,
  heading: PropTypes.string.isRequired,
};

export default function HeaderBreadcrumbs({ links, action, heading, sx, ...other }) {
  return (
    <Box sx={{ mb: 3, color: 'text.secondary', ...sx }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={1}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0, textAlign: { xs: 'center', sm: 'left' } }}>
            {heading}
          </Typography>
          {links && <Breadcrumbs links={links} {...other} />}
        </Box>

        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>
    </Box>
  );
}
