import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import { Card, Stack, Table, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, closeModal, closeParecer } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbar } from '../../components/SearchToolbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { Checked, AddItem, UpdateItem, ViewItem, CloneItem } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
//
import { applySortFilter } from './applySortFilter';
import { FluxoForm, ClonarFluxoForm } from './ParametrizacaoForm';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'modelo', label: 'Modelo', align: 'left' },
  { id: 'is_interno', label: 'Interno', align: 'center' },
  { id: 'is_credito', label: 'Crédito', align: 'center' },
  { id: 'is_ativo', label: 'Ativo', align: 'center' },
  { id: 'empty' },
];

// ----------------------------------------------------------------------

export default function Fluxos() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filter, setFilter] = useSearchParams();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { fluxos, isOpenModal, isOpenParecer, isLoading } = useSelector((state) => state.digitaldocs);

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
  } = useTable({ defaultOrderBy: 'assunto', defaultOrder: 'asc' });

  useEffect(() => {
    if (mail && cc?.perfil_id) {
      dispatch(getAll('fluxos', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, cc?.perfil_id, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleCloseClone = () => {
    dispatch(closeParecer());
  };

  const handleViewRow = (id) => {
    navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/fluxo/${id}`);
  };

  const dataFiltered = applySortFilter({
    dados: fluxos,
    filter: filter.get('filter'),
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Fluxos"
        links={[{ name: '' }]}
        action={
          <RoleBasedGuard roles={['fluxo-110', 'fluxo-111', 'Todo-110', 'Todo-111']}>
            <AddItem />
          </RoleBasedGuard>
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />

      <RoleBasedGuard hasContent roles={['fluxo-110', 'fluxo-111', 'Todo-110', 'Todo-111']}>
        <Card sx={{ p: 1 }}>
          {fluxos.length > 1 && <SearchToolbar filter={filter} setFilter={setFilter} tab="fluxos" />}
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
                <TableBody>
                  {isLoading && isNotFound ? (
                    <SkeletonTable column={6} row={10} />
                  ) : (
                    dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                      <TableRow hover key={row.id}>
                        <TableCell>{row.assunto}</TableCell>
                        <TableCell>{row.modelo}</TableCell>
                        <TableCell align="center">
                          <Checked check={row.is_interno} />
                        </TableCell>
                        <TableCell align="center">
                          <Checked check={row.is_credito} />
                        </TableCell>
                        <TableCell align="center">
                          <Checked check={row.is_ativo} />
                        </TableCell>
                        <TableCell align="center" width={10}>
                          <Stack direction="row" spacing={0.75}>
                            <RoleBasedGuard roles={['fluxo-110', 'fluxo-111', 'Todo-110', 'Todo-111']}>
                              <UpdateItem item="fluxo" id={row?.id} />
                              <CloneItem item="fluxo" id={row?.id} />
                            </RoleBasedGuard>
                            <ViewItem handleClick={() => handleViewRow(row?.id)} />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>

                {!isLoading && isNotFound && (
                  <TableSearchNotFound message="Não foi encontrado nenhum fluxo disponível..." />
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

        <FluxoForm isOpenModal={isOpenModal} onCancel={handleCloseModal} />
        <ClonarFluxoForm isOpenModal={isOpenParecer} onCancel={handleCloseClone} />
      </RoleBasedGuard>
    </>
  );
}
