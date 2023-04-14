import PropTypes from 'prop-types';
// @mui
import { Card, Stack, Typography } from '@mui/material';
import { DocIllustration404 } from '../../assets';

// ----------------------------------------------------------------------

SearchNotFound.propTypes = { message: PropTypes.string.isRequired };

export default function SearchNotFound({ message }) {
  return (
    <Card sx={{ px: 3, py: 5 }}>
      <Stack
        justifyContent="center"
        align="center"
        sx={{ typography: 'body2', fontStyle: 'italic', color: 'text.secondary' }}
      >
        <DocIllustration404 sx={{ height: { xs: 300, sm: 450 } }} />
        <Typography variant="h6" sx={{ pb: 5 }}>
          {message}
        </Typography>
      </Stack>
    </Card>
  );
}
