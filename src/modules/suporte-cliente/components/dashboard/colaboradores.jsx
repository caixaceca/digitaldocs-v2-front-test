import { useEffect, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import useTable from '@/hooks/useTable';
import { dispatch, useSelector } from '@/redux/store';
import { getInSuporte } from '@/redux/slices/suporte-cliente';
// Components
import { Avaliacao } from './table-dashboard';
import Scrollbar from '@/components/Scrollbar';
import { SkeletonTable } from '@/components/skeleton';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '@/components/table';

// ---------------------------------------------------------------------------------------------------------------------

export default function DashColaboradores({ department, data, periodo }) {
  const {
    page,
    order,
    dense,
    onSort,
    orderBy,
    setPage,
    rowsPerPage,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({ defaultRowsPerPage: 10, defaultOrderBy: 'rating' });

  const { dashutilizadores, isLoading } = useSelector((state) => state.suporte);

  const fetchTickets = useCallback(() => {
    const year = data.getFullYear();
    const month = periodo === 'Mensal' ? data.getMonth() + 1 : '';
    dispatch(
      getInSuporte('dashutilizadores', {
        year,
        page,
        month,
        department,
        size: rowsPerPage,
        reset: { dados: {} },
        sortDirection: order,
      })
    );
  }, [data, department, order, page, periodo, rowsPerPage]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, data, periodo]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const isNotFound = !dashutilizadores?.indicators_by_employee?.length;

  return (
    <Card sx={{ p: 1 }}>
      <Scrollbar>
        <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
          <Table size={dense ? 'small' : 'medium'}>
            <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headLabel} />
            <TableBody>
              {isLoading && isNotFound ? (
                <SkeletonTable row={10} column={5} />
              ) : (
                dashutilizadores?.indicators_by_employee?.map((row, index) => (
                  <TableRow hover key={`colaborador_${index}`}>
                    <TableCell>{row.employee}</TableCell>
                    <TableCell align="center">{row.totalActions}</TableCell>
                    <TableCell align="center">{row.closed}</TableCell>
                    <TableCell align="center">{row.resolved}</TableCell>
                    <Avaliacao rating={row.rating} />
                  </TableRow>
                ))
              )}
            </TableBody>

            {!isLoading && isNotFound && (
              <TableSearchNotFound message="Não foi encontrado nenhum registo disponível..." />
            )}
          </Table>
        </TableContainer>
      </Scrollbar>

      {!isNotFound && dashutilizadores?.total_elements > rowsPerPage && (
        <TablePaginationAlt
          page={page}
          dense={dense}
          rowsPerPage={rowsPerPage}
          onChangePage={onChangePage}
          onChangeDense={onChangeDense}
          count={dashutilizadores?.total_elements}
          onChangeRowsPerPage={onChangeRowsPerPage}
        />
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const headLabel = [
  { id: '', label: 'Colaborador' },
  { id: '', label: 'Trabalhados', align: 'center' },
  { id: '', label: 'Fechados', align: 'center' },
  { id: '', label: 'Resolvidos', align: 'center' },
  { id: '', label: 'Média avaliação', align: 'center' },
];
