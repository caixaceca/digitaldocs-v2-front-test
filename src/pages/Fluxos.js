import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
// hooks
import useTable, { getComparator } from '../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getAll, openModal, closeModal, getItem } from '../redux/slices/digitaldocs';
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
import FluxoForm from '../sections/digitaldocs/FluxoForm';
// guards
import RoleBasedGuard from '../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'modelo', label: 'Modelo', align: 'left' },
  { id: 'is_interno', label: 'Interno', align: 'center' },
  { id: 'empty' },
];

// ----------------------------------------------------------------------

export default function Fluxos() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { themeStretch } = useSettings();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
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
  } = useTable({ defaultOrderBy: 'id' });

  const [filterSearch, setFilterSearch] = useSearchParams();

  useEffect(() => {
    if (mail && currentColaborador?.perfil_id) {
      dispatch(getAll('fluxos', { mail, perfilId: currentColaborador?.perfil_id }));
    }
  }, [dispatch, currentColaborador?.perfil_id, mail]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleAdd = () => {
    dispatch(openModal());
  };

  const handleUpdate = (id) => {
    dispatch(getItem('fluxo', { id, mail, from: 'fluxos', perfilId: currentColaborador?.perfil_id }));
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleViewRow = (id) => {
    navigate(`${PATH_DIGITALDOCS.fluxos.root}/${id}`);
  };

  const dataFiltered = applySortFilter({
    fluxos,
    comparator: getComparator(order, orderBy),
    filterSearch,
  });
  const isNotFound = !dataFiltered.length;

  return (
    <Page title="Fluxos | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading="Fluxos"
          links={[{ name: 'Indicadores', href: PATH_DIGITALDOCS.root }, { name: 'Fluxos' }]}
          action={
            <RoleBasedGuard roles={['fluxo-110', 'fluxo-111', 'Todo-110', 'Todo-111']}>
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

        <RoleBasedGuard hasContent roles={['fluxo-110', 'fluxo-111', 'Todo-110', 'Todo-111']}>
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
                      dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                        <TableRow hover key={row.id}>
                          <TableCell>{row.assunto}</TableCell>
                          <TableCell>{row.modelo}</TableCell>
                          <TableCell align="center">
                            {row.is_interno ? (
                              <CheckCircleOutlineOutlinedIcon sx={{ color: 'success.main' }} />
                            ) : (
                              <CloseOutlinedIcon sx={{ color: 'focus.main' }} />
                            )}
                          </TableCell>
                          <TableCell align="center" width={125}>
                            <RoleBasedGuard roles={['estado-110', 'estado-111', 'Todo-110', 'Todo-111']}>
                              <Tooltip title="EDITAR" arrow>
                                <Fab size="small" variant="soft" color="warning" onClick={() => handleUpdate(row.id)}>
                                  <SvgIconStyle src="/assets/icons/editar.svg" />
                                </Fab>
                              </Tooltip>{' '}
                            </RoleBasedGuard>
                            <Tooltip title="DETALHES" arrow>
                              <Fab color="success" size="small" variant="soft" onClick={() => handleViewRow(row.id)}>
                                <SvgIconStyle src="/assets/icons/view.svg" />
                              </Fab>
                            </Tooltip>
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

          <FluxoForm isOpenModal={isOpenModal} onCancel={handleCloseModal} />
        </RoleBasedGuard>
      </Container>
    </Page>
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
      (_row) =>
        (_row?.assunto && _row?.assunto.toString().toLowerCase().indexOf(filter.toLowerCase()) !== -1) ||
        (_row?.modelo && _row?.modelo.toString().toLowerCase().indexOf(filter.toLowerCase()) !== -1)
    );
  }

  return fluxos;
}
