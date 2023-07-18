import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// @mui
import { Card, Table, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// utils
import { normalizeText } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, closeModal } from '../../redux/slices/digitaldocs';
// Components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { AddItem, UpdateItem } from '../../components/Actions';
import { SearchToolbar } from '../../components/SearchToolbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
//
import { MotivoPendenciaForm } from './ParametrizacaoForm';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'motivo', label: 'Motivo', align: 'left' },
  { id: ' obs', label: 'Observação', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function MotivosPendencias() {
  const dispatch = useDispatch();
  const [filterSearch, setFilterSearch] = useSearchParams();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { motivosPendencias, isOpenModal, isLoading } = useSelector((state) => state.digitaldocs);

  const {
    page,
    dense,
    order,
    orderBy,
    setPage,
    rowsPerPage,
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: 'motivo', defaultOrder: 'asc' });

  useEffect(() => {
    if (mail && cc?.perfil_id) {
      dispatch(getAll('motivos pendencias', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, mail, cc?.perfil_id]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const dataFiltered = applySortFilter({ motivosPendencias, comparator: getComparator(order, orderBy), filterSearch });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Motivos de pendências"
        links={[{ name: '' }]}
        action={
          <RoleBasedGuard roles={['Todo-110', 'Todo-111']}>
            <AddItem />
          </RoleBasedGuard>
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />

      <RoleBasedGuard hasContent roles={['Todo-110', 'Todo-111']}>
        <Card sx={{ p: 1 }}>
          {motivosPendencias.length > 1 && (
            <SearchToolbar filterSearch={filterSearch} onFilterSearch={handleFilterSearch} tab="motivospendencias" />
          )}
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
                          <TableCell>{row.motivo}</TableCell>
                          <TableCell>{row.obs}</TableCell>
                          <TableCell align="center" width={50}>
                            <RoleBasedGuard roles={['Todo-110', 'Todo-111']}>
                              <UpdateItem dados={row} />
                            </RoleBasedGuard>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>

                {!isLoading && isNotFound && (
                  <TableSearchNotFound message="Não foi encontrado nenhum motivo disponível..." />
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

        <MotivoPendenciaForm isOpenModal={isOpenModal} onCancel={handleCloseModal} />
      </RoleBasedGuard>
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ motivosPendencias, comparator, filterSearch }) {
  const stabilizedThis = motivosPendencias.map((el, index) => [el, index]);
  const text = filterSearch.get('filter');

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  motivosPendencias = stabilizedThis.map((el) => el[0]);

  if (text) {
    motivosPendencias = motivosPendencias.filter(
      (row) =>
        (row?.motivo && normalizeText(row?.motivo).indexOf(normalizeText(text)) !== -1) ||
        (row?.obs && normalizeText(row?.obs).indexOf(normalizeText(text)) !== -1)
    );
  }

  return motivosPendencias;
}
