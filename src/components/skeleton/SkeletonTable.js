import PropTypes from 'prop-types';
// @mui
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

SkeletonTable.propTypes = {
  column: PropTypes.number,
  row: PropTypes.number,
};

export default function SkeletonTable({ column, row }) {
  return (
    <>
      {[...Array(row)].map((x, i) => (
        <TableRow key={i}>
          {[...Array(column)].map((z, y) => (
            <TableCell key={y}>
              <Skeleton variant="text" height={35} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
