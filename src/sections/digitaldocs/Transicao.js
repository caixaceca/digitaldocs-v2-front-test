import { useSearchParams } from 'react-router-dom';
// @mui
import { Fab, Card, Table, Button, Tooltip, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { openModal, closeModal, getItem } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbar } from '../../components/SearchToolbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import TransicaoForm from './TransicaoForm';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'estado_inicial', label: 'Estado de origem', align: 'left' },
  { id: 'estado_final', label: 'Estado de destino', align: 'left' },
  { id: 'modo', label: 'Modo', align: 'left' },
  { id: 'prazoemdias', label: 'Prazo', align: 'center' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function Transicao() {
  const dispatch = useDispatch();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
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

  const handleUpdate = (id) => {
    dispatch(getItem('tansicao', { id, mail, from: 'transicoes', perfilId: currentColaborador?.perfil_id }));
  };

  const handleAdd = () => {
    dispatch(openModal());
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const dataFiltered = applySortFilter({
    transicoes,
    comparator: getComparator(order, orderBy),
    filterSearch,
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Transições"
        links={[
          { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
          { name: 'Fluxos', href: PATH_DIGITALDOCS.fluxos.root },
          { name: 'Transições' },
        ]}
        action={
          <RoleBasedGuard roles={['transicao-110', 'transicao-111', 'Todo-110', 'Todo-111']}>
            <Button
              variant="soft"
              startIcon={<SvgIconStyle src="/assets/icons/add.svg" sx={{ width: 20 }} />}
              onClick={handleAdd}
            >
              Adicionar
            </Button>
          </RoleBasedGuard>
        }
        sx={{ color: 'text.secondary', m: 0, p: 1, pt: 0 }}
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbar filterSearch={filterSearch} onFilterSearch={handleFilterSearch} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={4} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const key = row.id;
                    return (
                      <TableRow hover key={key}>
                        <TableCell>{row.estado_inicial}</TableCell>
                        <TableCell>{row.estado_final}</TableCell>
                        <TableCell>{row.modo}</TableCell>
                        <TableCell align="center">
                          {row.prazoemdias > 1 ? `${row.prazoemdias} dias` : `${row.prazoemdias} dia`}
                        </TableCell>
                        <TableCell align="center" width={50}>
                          <RoleBasedGuard hasContent roles={['transicao-110', 'transicao-111', 'Todo-110', 'Todo-111']}>
                            <Tooltip title="Editar" arrow>
                              <Fab size="small" variant="soft" color="warning" onClick={() => handleUpdate(row.id)}>
                                <SvgIconStyle src="/assets/icons/editar.svg" />
                              </Fab>
                            </Tooltip>
                          </RoleBasedGuard>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum transição disponível..." />
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        {!isNotFound && (
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
        (item.estado_inicial && item?.estado_inicial.toString().toLowerCase().indexOf(filter.toLowerCase()) !== -1) ||
        (item.estado_final && item?.estado_final.toString().toLowerCase().indexOf(filter.toLowerCase()) !== -1)
    );
  }

  return transicoes;
}
