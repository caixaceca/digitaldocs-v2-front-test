import PropTypes from 'prop-types';
// @mui
import { Stack, Typography } from '@mui/material';
import { DocIllustration404 } from '../../assets';

// ----------------------------------------------------------------------

SearchNotFound.propTypes = { message: PropTypes.string.isRequired };

export default function SearchNotFound({ message }) {
  return (
    <Stack
      justifyContent="center"
      align="center"
      sx={{ typography: 'body2', fontStyle: 'italic', color: 'text.secondary' }}
    >
      <DocIllustration404 sx={{ height: 450 }} />
      <Typography variant="h6">{message}</Typography>
    </Stack>
  );
}
