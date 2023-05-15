import { useSearchParams } from 'react-router-dom';
// @mui
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { Card, Table, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbar } from '../../components/SearchToolbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

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
  const [filterSearch, setFilterSearch] = useSearchParams();
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

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const dataFiltered = applySortFilter({
    estadosByFluxo,
    comparator: getComparator(order, orderBy),
    filterSearch,
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
        {dataFiltered.length > 1 && <SearchToolbar filterSearch={filterSearch} onFilterSearch={handleFilterSearch} />}
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
                          {row.is_inicial ? (
                            <CheckCircleOutlineOutlinedIcon sx={{ color: 'success.main' }} />
                          ) : (
                            <CloseOutlinedIcon sx={{ color: 'focus.main' }} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {row.is_final ? (
                            <CheckCircleOutlineOutlinedIcon sx={{ color: 'success.main' }} />
                          ) : (
                            <CloseOutlinedIcon sx={{ color: 'focus.main' }} />
                          )}
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

// ----------------------------------------------------------------------

function applySortFilter({ estadosByFluxo, comparator, filterSearch }) {
  const filter = filterSearch.get('filter');
  const stabilizedThis = estadosByFluxo.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  estadosByFluxo = stabilizedThis.map((el) => el[0]);

  if (filter) {
    estadosByFluxo = estadosByFluxo.filter(
      (item) => item?.nome && item?.nome.toString().toLowerCase().indexOf(filter.toLowerCase()) !== -1
    );
  }

  return estadosByFluxo;
}
