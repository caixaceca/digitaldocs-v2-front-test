import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TablePagination from '@mui/material/TablePagination';
import FormControlLabel from '@mui/material/FormControlLabel';

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
    <Stack
      spacing={1}
      alignItems="center"
      justifyContent="space-between"
      direction={{ xs: 'column', md: 'row' }}
      sx={{ px: 1, py: 0.5, borderTop: (theme) => `1px solid ${theme.palette.grey[500_32]}` }}
    >
      <FormControlLabel control={<Switch checked={dense} onChange={onChangeDense} />} label="Compacto" sx={{ pl: 1 }} />
      <TablePagination
        page={page}
        count={count}
        showLastButton
        showFirstButton
        component="div"
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        onRowsPerPageChange={onChangeRowsPerPage}
        sx={{ border: 'none', mt: '0px!important' }}
      />
    </Stack>
  );
}
