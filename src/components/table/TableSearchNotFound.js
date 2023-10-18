import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
//
import { DocIllustration } from '../../assets';

// ----------------------------------------------------------------------

TableSearchNotFound.propTypes = { message: PropTypes.string.isRequired };

export default function TableSearchNotFound({ message }) {
  return (
    <TableBody>
      <TableRow>
        <TableCell
          align="center"
          colSpan={11}
          sx={{ py: 7, typography: 'body2', fontStyle: 'italic', color: 'text.secondary', border: 'none !important' }}
        >
          <DocIllustration sx={{ height: 220, mb: { xs: 4, sm: 7 } }} />
          {message}
        </TableCell>
      </TableRow>
    </TableBody>
  );
}
