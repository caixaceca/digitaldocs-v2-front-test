import { useSearchParams } from 'react-router-dom';
// @mui
import { Card, Table, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// utils
import { normalizeText } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { closeModal } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbar } from '../../components/SearchToolbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { Checked, AddItem, UpdateItem } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
//
import { TransicaoForm } from './ParametrizacaoForm';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'estado_inicial', label: 'Estado de origem', align: 'left' },
  { id: 'estado_final', label: 'Estado de destino', align: 'left' },
  { id: 'modo', label: 'Modo', align: 'left' },
  { id: 'prazoemdias', label: 'Prazo', align: 'center' },
  { id: 'is_after_devolucao', label: 'Depois devolução', align: 'center' },
  { id: 'is_paralelo', label: 'Paralelo', align: 'center' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function Transicao() {
  const dispatch = useDispatch();
  const { fluxo, estados, isOpenModal, isLoading } = useSelector((state) => state.digitaldocs);
  const transicoes = [];
  fluxo?.transicoes?.forEach((row) => {
    transicoes.push({
      ...row,
      estado_inicial: estados?.find((_row) => _row.id === row.estado_inicial_id)?.nome,
      estado_final: estados?.find((_row) => _row.id === row.estado_final_id)?.nome,
    });
  });

  const {
    page,
    order,
    dense,
    orderBy,
    setPage,
    rowsPerPage,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: 'id' });

  const [filterSearch, setFilterSearch] = useSearchParams();

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const dataFiltered = applySortFilter({ transicoes, comparator: getComparator(order, orderBy), filterSearch });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Transições"
        links={[
          { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
          { name: 'Parametrização', href: `${PATH_DIGITALDOCS.parametrizacao.tabs}?tab=fluxos&filter=` },
          { name: 'Transições' },
        ]}
        action={
          <RoleBasedGuard roles={['transicao-110', 'transicao-111', 'Todo-110', 'Todo-111']}>
            <AddItem />
          </RoleBasedGuard>
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />
      <Card sx={{ p: 1 }}>
        {transicoes.length > 1 && <SearchToolbar filterSearch={filterSearch} onFilterSearch={handleFilterSearch} />}
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={7} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow hover key={row.id}>
                      <TableCell>{row.estado_inicial}</TableCell>
                      <TableCell>{row.estado_final}</TableCell>
                      <TableCell>{row.modo}</TableCell>
                      <TableCell align="center">
                        {row.prazoemdias > 1 ? `${row.prazoemdias} dias` : `${row.prazoemdias} dia`}
                      </TableCell>
                      <TableCell align="center">
                        <Checked check={row.is_after_devolucao} />
                      </TableCell>
                      <TableCell align="center">
                        <Checked check={row.is_paralelo} />
                      </TableCell>
                      <TableCell align="center" width={50}>
                        <RoleBasedGuard hasContent roles={['transicao-110', 'transicao-111', 'Todo-110', 'Todo-111']}>
                          <UpdateItem item="transicao" id={row?.id} />
                        </RoleBasedGuard>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum transição disponível..." />
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        {!isNotFound && dataFiltered.length > 10 && (
          <TablePaginationAlt
            page={page}
            dense={dense}
            rowsPerPage={rowsPerPage}
            onChangePage={onChangePage}
            count={dataFiltered.length}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        )}
      </Card>

      <TransicaoForm onCancel={handleCloseModal} fluxoId={fluxo?.id} isOpenModal={isOpenModal} />
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ transicoes, comparator, filterSearch }) {
  const filter = filterSearch.get('filter');
  const stabilizedThis = transicoes.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  transicoes = stabilizedThis.map((el) => el[0]);

  if (filter) {
    transicoes = transicoes.filter(
      (item) =>
        (item.estado_inicial && normalizeText(item?.estado_inicial).indexOf(normalizeText(filter)) !== -1) ||
        (item.estado_final && normalizeText(item?.estado_final).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return transicoes;
}
