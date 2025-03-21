import PropTypes from 'prop-types';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import { DocIllustration, DocIllustration404 } from '../../assets';

// ----------------------------------------------------------------------

SearchNotFound.propTypes = { message: PropTypes.string, height: PropTypes.number };

export default function SearchNotFound({ message = '', height = 250 }) {
  return (
    <Stack
      align="center"
      justifyContent="center"
      sx={{ py: { xs: 3, sm: 7 }, typography: 'body2', fontStyle: 'italic', color: 'text.secondary' }}
    >
      <DocIllustration sx={{ height, mb: { xs: 5, sm: 10 } }} />
      {message}
    </Stack>
  );
}

// ----------------------------------------------------------------------

SearchNotFoundSmall.propTypes = { message: PropTypes.string.isRequired };

export function SearchNotFoundSmall({ message }) {
  return (
    <Stack
      align="center"
      justifyContent="center"
      sx={{ py: 3, typography: 'body2', fontStyle: 'italic', color: 'text.secondary' }}
    >
      <DocIllustration sx={{ height: 130, mb: { xs: 2, sm: 3 } }} />
      {message}
    </Stack>
  );
} // ----------------------------------------------------------------------

SearchNotFound404.propTypes = { message: PropTypes.string, noShadow: PropTypes.bool };

export function SearchNotFound404({ message, noShadow = false }) {
  return (
    <Card sx={{ boxShadow: noShadow && 'none' }}>
      <Stack
        align="center"
        justifyContent="center"
        sx={{ py: { md: 7, xs: 3 }, fontStyle: 'italic', color: 'text.secondary' }}
      >
        <DocIllustration404 sx={{ height: 450 }} />
        <Typography variant="subtitle1">{message}</Typography>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

TableSearchNotFound.propTypes = { message: PropTypes.string, height: PropTypes.number };

export function TableSearchNotFound({ message, height = 220 }) {
  return (
    <TableBody>
      <TableRow>
        <TableCell
          align="center"
          colSpan={11}
          sx={{
            typography: 'body2',
            fontStyle: 'italic',
            color: 'text.secondary',
            border: 'none !important',
            py: height === 99 ? 2 : 7,
          }}
        >
          <DocIllustration sx={{ height, mb: { xs: height === 99 ? 1 : 4, sm: height === 99 ? 2 : 7 } }} />
          {message}
        </TableCell>
      </TableRow>
    </TableBody>
  );
}
