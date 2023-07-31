import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import { Card, Stack, Table, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromIntranet } from '../../redux/slices/intranet';
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
import { EstadoForm } from './ParametrizacaoForm';
import { applySortFilter } from './applySortFilter';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', align: 'left' },
  { id: 'is_inicial', label: 'Inicial', align: 'center' },
  { id: 'is_final', label: 'Final', align: 'center' },
  { id: 'empty' },
];

// ----------------------------------------------------------------------

export default function Estados() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useSearchParams('');
  const { mail, perfis, cc } = useSelector((state) => state.intranet);
  const { estados, isOpenModal, isLoading } = useSelector((state) => state.digitaldocs);

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
  } = useTable({ defaultOrderBy: 'nome', defaultOrder: 'asc' });

  useEffect(() => {
    if (mail && cc?.perfil_id) {
      dispatch(getAll('estados', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, cc?.perfil_id, mail]);

  useEffect(() => {
    if (mail && cc?.perfil_id && perfis.length === 0) {
      dispatch(getFromIntranet('perfis', { mail }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, cc?.perfil_id, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleView = (id) => {
    navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/estado/${id}`);
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const dataFiltered = applySortFilter({
    dados: estados,
    filter: filter.get('filter'),
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Estados"
        links={[{ name: '' }]}
        action={
          <RoleBasedGuard roles={['estado-110', 'estado-111', 'Todo-110', 'Todo-111']}>
            <AddItem />
          </RoleBasedGuard>
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />

      <RoleBasedGuard hasContent roles={['estado-110', 'estado-111', 'Todo-110', 'Todo-111']}>
        <Card sx={{ p: 1 }}>
          {estados.length > 1 && <SearchToolbar filter={filter} setFilter={setFilter} tab="estados" />}
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
                          <TableCell>{row.nome}</TableCell>
                          <TableCell align="center">
                            <Checked check={row.is_inicial} />
                          </TableCell>
                          <TableCell align="center">
                            <Checked check={row.is_final} />
                          </TableCell>
                          <TableCell align="right" width={130}>
                            <Stack direction="row" spacing={1} justifyContent="right">
                              {row.nome !== 'Arquivo' && <UpdateItem item="estado" id={row.id} />}
                              <ViewItem estado handleView={() => handleView(row?.id)} />
                            </Stack>
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
              page={page}
              dense={dense}
              rowsPerPage={rowsPerPage}
              count={dataFiltered.length}
              onChangePage={onChangePage}
              onChangeDense={onChangeDense}
              onChangeRowsPerPage={onChangeRowsPerPage}
            />
          )}
        </Card>

        <EstadoForm isOpenModal={isOpenModal} onCancel={handleCloseModal} />
      </RoleBasedGuard>
    </>
  );
}
