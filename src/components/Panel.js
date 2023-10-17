import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
//
import Label from './Label';

// ----------------------------------------------------------------------

Panel.propTypes = { sx: PropTypes.object, label: PropTypes.string, children: PropTypes.node };

export default function Panel({ label, children, sx }) {
  return (
    <Stack
      direction="row"
      alignItems="stretch"
      sx={{
        p: 0.5,
        pl: 1,
        flexGrow: 1,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.neutral',
        border: (theme) => `dashed 1px ${theme.palette.divider}`,
        ...sx,
      }}
    >
      <Stack component="span" direction="row" alignItems="center" sx={{ mr: 1, color: 'text.primary' }}>
        <Typography noWrap variant="body2">
          {label}
        </Typography>
      </Stack>

      <Label variant="filled" sx={{ textTransform: 'none', py: 1.75 }}>
        {children}
      </Label>
    </Stack>
  );
}
