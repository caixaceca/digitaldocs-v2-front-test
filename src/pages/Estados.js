import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// @mui
import {
  Fab,
  Card,
  Table,
  Button,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  Container,
  TableContainer,
} from '@mui/material';
// hooks
import useTable, { getComparator } from '../hooks/useTable';
// redux
import { getPerfis } from '../redux/slices/colaborador';
import { useDispatch, useSelector } from '../redux/store';
import { getAll, getItem, openModal, closeModal } from '../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SvgIconStyle from '../components/SvgIconStyle';
import { SkeletonTable } from '../components/skeleton';
import { SearchToolbar } from '../components/SearchToolbar';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../components/table';
// sections
import EstadoForm from '../sections/digitaldocs/EstadoForm';
// guards
import RoleBasedGuard from '../guards/RoleBasedGuard';

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
  const { themeStretch } = useSettings();
  const { mail, perfis, currentColaborador } = useSelector((state) => state.colaborador);
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
  } = useTable({ defaultOrderBy: 'id' });

  const [filterSearch, setFilterSearch] = useSearchParams('');

  useEffect(() => {
    if (mail && currentColaborador?.perfil_id) {
      dispatch(getAll('estados', { mail, perfilId: currentColaborador?.perfil_id }));
    }
    if (mail && perfis.length === 0) {
      dispatch(getPerfis(mail));
    }
  }, [dispatch, perfis, currentColaborador?.perfil_id, mail]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleAdd = () => {
    dispatch(openModal());
  };

  const handleUpdate = (id) => {
    dispatch(getItem('estado', { id, mail, from: 'estados', perfilId: currentColaborador?.perfil_id }));
  };

  const handleView = (id) => {
    navigate(`${PATH_DIGITALDOCS.estados.root}/${id}`);
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const dataFiltered = applySortFilter({
    estados,
    comparator: getComparator(order, orderBy),
    filterSearch,
  });
  const isNotFound = !dataFiltered.length;

  return (
    <Page title="Estados | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading="Estados"
          links={[{ name: 'Indicadores', href: PATH_DIGITALDOCS.root }, { name: 'Estados' }]}
          action={
            <RoleBasedGuard roles={['estado-110', 'estado-111', 'Todo-110', 'Todo-111']}>
              <Button
                variant="soft"
                startIcon={<SvgIconStyle src="/assets/icons/add.svg" sx={{ width: 20 }} />}
                onClick={handleAdd}
              >
                Adicionar
              </Button>
            </RoleBasedGuard>
          }
          sx={{ color: 'text.secondary' }}
        />

        <RoleBasedGuard hasContent roles={['estado-110', 'estado-111', 'Todo-110', 'Todo-111']}>
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
                            <TableCell>{row.nome}</TableCell>
                            <TableCell align="center">
                              <SvgIconStyle
                                src={row.is_inicial ? '/assets/icons/checkmark-circle.svg' : '/assets/icons/close.svg'}
                                sx={{
                                  width: 20,
                                  height: 20,
                                  color: 'success.main',
                                  ...(!row.is_inicial && { color: 'focus.main' }),
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <SvgIconStyle
                                src={row.is_final ? '/assets/icons/checkmark-circle.svg' : '/assets/icons/close.svg'}
                                sx={{
                                  width: 20,
                                  height: 20,
                                  color: 'success.main',
                                  ...(!row.is_final && { color: 'focus.main' }),
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" width={130}>
                              {row.nome !== 'Arquivo' && (
                                <>
                                  <Tooltip title="Editar" arrow>
                                    <Fab
                                      size="small"
                                      variant="soft"
                                      color="warning"
                                      onClick={() => handleUpdate(row.id)}
                                    >
                                      <SvgIconStyle src="/assets/icons/editar.svg" />
                                    </Fab>
                                  </Tooltip>{' '}
                                </>
                              )}
                              <Tooltip title="Colaboradores associados" arrow>
                                <Fab color="success" size="small" variant="soft" onClick={() => handleView(row?.id)}>
                                  <SvgIconStyle src="/assets/icons/swap.svg" />
                                </Fab>
                              </Tooltip>
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

          <EstadoForm isOpenModal={isOpenModal} onCancel={handleCloseModal} />
        </RoleBasedGuard>
      </Container>
    </Page>
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
    estados = estados.filter((item) => item?.nome.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1);
  }

  return estados;
}
