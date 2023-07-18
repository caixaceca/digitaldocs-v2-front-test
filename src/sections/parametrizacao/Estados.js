import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { Fab, Card, Stack, Table, Tooltip, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// utils
import { normalizeText } from '../../utils/normalizeText';
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
import { Checked, AddItem, UpdateItem } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
//
import { EstadoForm } from './ParametrizacaoForm';

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

  const [filterSearch, setFilterSearch] = useSearchParams('');

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

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleView = (id) => {
    navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/estado/${id}`);
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const dataFiltered = applySortFilter({ estados, comparator: getComparator(order, orderBy), filterSearch });
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
          {estados.length > 1 && (
            <SearchToolbar filterSearch={filterSearch} onFilterSearch={handleFilterSearch} tab="estados" />
          )}
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
                              <Tooltip title="Colaboradores associados" arrow>
                                <Fab color="success" size="small" variant="soft" onClick={() => handleView(row?.id)}>
                                  <SwapHorizOutlinedIcon sx={{ height: 28, width: 28 }} />
                                </Fab>
                              </Tooltip>
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

// ----------------------------------------------------------------------

function applySortFilter({ estados, comparator, filterSearch }) {
  const stabilizedThis = estados.map((el, index) => [el, index]);
  const text = filterSearch.get('filter');

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  estados = stabilizedThis.map((el) => el[0]);

  if (text) {
    estados = estados.filter((row) => row?.nome && normalizeText(row?.nome).indexOf(normalizeText(text)) !== -1);
  }

  return estados;
}
