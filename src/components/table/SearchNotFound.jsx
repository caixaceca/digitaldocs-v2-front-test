// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import { DocIllustration, DocIllustration404 } from '../../assets';

// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------

export function SearchNotFoundSmall({ message, xs }) {
  return (
    <Stack
      align="center"
      justifyContent="center"
      sx={{ py: xs ? 1.5 : 3, typography: xs ? 'caption' : 'body2', fontStyle: 'italic', color: 'text.secondary' }}
    >
      <DocIllustration sx={{ height: xs ? 80 : 130, mb: { xs: xs ? 1 : 2, sm: xs ? 2 : 3 } }} />
      {message}
    </Stack>
  );
} // ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------

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
            py: height === 99 ? 3 : 7,
          }}
        >
          <DocIllustration sx={{ height, mb: { xs: height === 99 ? 2 : 4, sm: height === 99 ? 3 : 7 } }} />
          {message}
        </TableCell>
      </TableRow>
    </TableBody>
  );
}
