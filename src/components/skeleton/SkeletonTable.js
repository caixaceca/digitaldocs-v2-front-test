import PropTypes from 'prop-types';
// @mui
import { TableRow, TableCell, Skeleton } from '@mui/material';

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
