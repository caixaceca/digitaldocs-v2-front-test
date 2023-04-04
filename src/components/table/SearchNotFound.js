import PropTypes from 'prop-types';
// @mui
import { Stack } from '@mui/material';
import { DocIllustration } from '../../assets';

// ----------------------------------------------------------------------

SearchNotFound.propTypes = { message: PropTypes.string.isRequired };

export default function SearchNotFound({ message }) {
  return (
    <Stack
      justifyContent="center"
      align="center"
      sx={{ py: 7, typography: 'body2', fontStyle: 'italic', color: 'text.secondary' }}
    >
      <DocIllustration sx={{ height: 250, mb: { xs: 5, sm: 10 } }} />
      {message}
    </Stack>
  );
}
