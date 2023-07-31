import PropTypes from 'prop-types';
import { Box, Switch, TablePagination, FormControlLabel } from '@mui/material';

// ----------------------------------------------------------------------

TablePaginationAlt.propTypes = {
  dense: PropTypes.bool,
  page: PropTypes.number,
  count: PropTypes.number,
  onChangePage: PropTypes.func,
  rowsPerPage: PropTypes.number,
  onChangeDense: PropTypes.func,
  onChangeRowsPerPage: PropTypes.func,
};

export default function TablePaginationAlt({
  page,
  dense,
  count,
  rowsPerPage,
  onChangePage,
  onChangeDense,
  onChangeRowsPerPage,
}) {
  return (
    <Box sx={{ position: 'relative' }}>
      <TablePagination
        page={page}
        count={count}
        component="div"
        showLastButton
        showFirstButton
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        onRowsPerPageChange={onChangeRowsPerPage}
      />

      <FormControlLabel
        control={<Switch checked={dense} onChange={onChangeDense} />}
        label="Compacto"
        sx={{ px: 3, py: 1.5, top: 0, position: { md: 'absolute' } }}
      />
    </Box>
  );
}
