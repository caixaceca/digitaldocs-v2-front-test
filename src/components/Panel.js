import PropTypes from 'prop-types';
// @mui
import { Stack, Typography } from '@mui/material';

// ----------------------------------------------------------------------

Panel.propTypes = { sx: PropTypes.object, label: PropTypes.string, children: PropTypes.node };

export default function Panel({ label, children, sx }) {
  return (
    <Stack
      direction="row"
      alignItems="stretch"
      sx={{
        flexGrow: 1,
        borderRadius: 0.5,
        overflow: 'hidden',
        border: (theme) => `solid 1px ${theme.palette.divider}`,
        ...sx,
      }}
    >
      <Stack
        component="span"
        direction="row"
        alignItems="center"
        sx={{
          px: 1,
          color: 'text.secondary',
          bgcolor: 'background.neutral',
          borderRight: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      >
        <Typography noWrap variant="subtitle2">
          {label}
        </Typography>
      </Stack>

      <Stack component="span" direction="row" alignItems="center" sx={{ px: 1, py: 0.5, color: 'text.primary' }}>
        {children}
      </Stack>
    </Stack>
  );
}
