import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// @mui
import { Card, Table, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import { Checked } from '../../components/Actions';
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbar } from '../../components/SearchToolbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { applySortFilter } from './applySortFilter';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', align: 'left' },
  { id: 'is_inicial', label: 'Inicial', align: 'center' },
  { id: 'is_final', label: 'Final', align: 'center' },
];

// ----------------------------------------------------------------------

export default function Estado() {
  const estadosId = [];
  const estadosByFluxo = [];
  const [filter, setFilter] = useSearchParams();
  const { fluxo, estados, isLoading } = useSelector((state) => state.digitaldocs);

  fluxo?.transicoes?.forEach((row) => {
    if (!estadosId.includes(row?.estado_inicial_id)) {
      estadosId.push(row.estado_inicial_id);
    }
    if (!estadosId.includes(row?.estado_final_id)) {
      estadosId.push(row.estado_final_id);
    }
  });

  estadosId?.forEach((row) => {
    const estado = estados.find((_row) => _row?.id === row);
    estadosByFluxo.push(estado);
  });

  const {
    page,
    dense,
    order,
    orderBy,
    setPage,
    rowsPerPage,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: 'id' });

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    dados: estadosByFluxo,
    filter: filter.get('filter'),
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Estados"
        links={[
          { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
          { name: 'Parametrização', href: `${PATH_DIGITALDOCS.parametrizacao.tabs}?tab=fluxos&filter=` },
          { name: 'Estados' },
        ]}
        action=""
        sx={{ color: 'text.secondary', px: 1 }}
      />
      <Card sx={{ p: 1 }}>
        {estadosByFluxo.length > 1 && <SearchToolbar filter={filter} setFilter={setFilter} />}
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={3} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const key = row.id;
                    return (
                      <TableRow hover key={key}>
                        <TableCell>{row.nome}</TableCell>
                        <TableCell align="center">
                          <Checked check={row.is_inicial} />
                        </TableCell>
                        <TableCell align="center">
                          <Checked check={row.is_final} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum estado disponível..." />
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        {!isNotFound && dataFiltered.length > 10 && (
          <TablePaginationAlt
            dense={dense}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
            onChangePage={onChangePage}
            page={page}
            rowsPerPage={rowsPerPage}
            count={dataFiltered.length}
          />
        )}
      </Card>
    </>
  );
}
