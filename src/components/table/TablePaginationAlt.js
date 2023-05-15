import PropTypes from 'prop-types';
import { Box, Switch, TablePagination, FormControlLabel } from '@mui/material';

// ----------------------------------------------------------------------

TablePaginationAlt.propTypes = {
  dense: PropTypes.bool,
  onChangeDense: PropTypes.func,
  onChangeRowsPerPage: PropTypes.func,
  onChangePage: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  count: PropTypes.number,
};

export default function TablePaginationAlt({
  dense,
  onChangeDense,
  onChangeRowsPerPage,
  onChangePage,
  page,
  rowsPerPage,
  count,
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
        onRowsPerPageChange={onChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100, { value: count, label: 'Todos' }]}
      />

      <FormControlLabel
        control={<Switch checked={dense} onChange={onChangeDense} />}
        label="Compacto"
        sx={{ px: 3, py: 1.5, top: 0, position: { md: 'absolute' } }}
      />
    </Box>
  );
}
