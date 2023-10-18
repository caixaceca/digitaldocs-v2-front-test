import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import { DocIllustration } from '../../assets';

// ----------------------------------------------------------------------

SearchNotFoundSmall.propTypes = {
  message: PropTypes.string.isRequired,
};

export default function SearchNotFoundSmall({ message }) {
  return (
    <Stack
      justifyContent="center"
      align="center"
      sx={{ py: 2, typography: 'body2', fontStyle: 'italic', color: 'text.secondary' }}
    >
      <DocIllustration sx={{ height: 130, mb: { xs: 2, sm: 3 } }} />
      {message}
    </Stack>
  );
}
