// @mui
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TablePagination from '@mui/material/TablePagination';
import FormControlLabel from '@mui/material/FormControlLabel';

// ---------------------------------------------------------------------------------------------------------------------

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
      alignItems="center"
      spacing={{ xs: 0, sm: 1 }}
      justifyContent="space-between"
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ borderTop: (theme) => `1px solid ${theme.palette.grey['500_32']}` }}
    >
      <FormControlLabel control={<Switch checked={dense} onChange={onChangeDense} />} label="Compacto" />
      <TablePagination
        page={page}
        count={count}
        showLastButton
        showFirstButton
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        onRowsPerPageChange={onChangeRowsPerPage}
        sx={{ border: 'none', mt: '0px !important' }}
      />
    </Stack>
  );
}
