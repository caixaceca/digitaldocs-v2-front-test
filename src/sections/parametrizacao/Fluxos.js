import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import { Card, Stack, Table, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// utils
import { normalizeText } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, closeModal } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbar } from '../../components/SearchToolbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { Checked, AddItem, UpdateItem, ViewItem } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
//
import { FluxoForm } from './ParametrizacaoForm';

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
  const { mail, cc } = useSelector((state) => state.intranet);
  const { fluxos, isOpenModal, isLoading } = useSelector((state) => state.digitaldocs);

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

  const [filterSearch, setFilterSearch] = useSearchParams();

  useEffect(() => {
    if (mail && cc?.perfil_id) {
      dispatch(getAll('fluxos', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, cc?.perfil_id, mail]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleViewRow = (id) => {
    navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/fluxo/${id}`);
  };

  const dataFiltered = applySortFilter({ fluxos, comparator: getComparator(order, orderBy), filterSearch });
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
          {fluxos.length > 1 && (
            <SearchToolbar filterSearch={filterSearch} onFilterSearch={handleFilterSearch} tab="fluxos" />
          )}
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
                        <TableCell align="center" width={125}>
                          <Stack direction="row" spacing={1}>
                            <RoleBasedGuard roles={['fluxo-110', 'fluxo-111', 'Todo-110', 'Todo-111']}>
                              <UpdateItem item="fluxo" id={row?.id} />
                            </RoleBasedGuard>
                            <ViewItem handleView={() => handleViewRow(row?.id)} />
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
      </RoleBasedGuard>
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ fluxos, comparator, filterSearch }) {
  const stabilizedThis = fluxos.map((el, index) => [el, index]);
  const filter = filterSearch.get('filter');

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  fluxos = stabilizedThis.map((el) => el[0]);

  if (filter) {
    fluxos = fluxos.filter(
      (row) =>
        (row?.assunto && normalizeText(row?.assunto).indexOf(normalizeText(filter)) !== -1) ||
        (row?.modelo && normalizeText(row?.modelo).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return fluxos;
}
