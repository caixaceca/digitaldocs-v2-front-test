import PropTypes from 'prop-types';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DocIllustration404 } from '../../assets';

// ----------------------------------------------------------------------

SearchNotFound.propTypes = { message: PropTypes.string, noShadow: PropTypes.bool };

export default function SearchNotFound({ message, noShadow = false }) {
  return (
    <Card sx={{ boxShadow: noShadow && 'none' }}>
      <Stack
        align="center"
        justifyContent="center"
        sx={{ py: { md: 7, xs: 3 }, fontStyle: 'italic', color: 'text.secondary' }}
      >
        <DocIllustration404 sx={{ height: 450 }} />
        <Typography variant="h6">{message}</Typography>
      </Stack>
    </Card>
  );
}
