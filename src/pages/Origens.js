import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import OrigemForm from '../sections/digitaldocs/OrigemForm';
// guards
import RoleBasedGuard from '../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'designacao', label: 'Designação', align: 'left' },
  { id: 'seguimento', label: 'Segmento', align: 'left' },
  { id: 'tipo', label: 'Tipo', align: 'left' },
  { id: 'ilha', label: 'Localização', align: 'left' },
  { id: 'email', label: 'Email', align: 'left' },
  { id: 'telefone', label: 'Telefone', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function Origens() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { origens, isOpenModal, isLoading } = useSelector((state) => state.digitaldocs);

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
      dispatch(getAll('origens', { mail, perfilId: currentColaborador?.perfil_id }));
    }
  }, [dispatch, currentColaborador?.perfil_id, mail]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleUpdate = (id) => {
    dispatch(getItem('origem', { id, mail, from: 'origens', perfilId: currentColaborador?.perfil_id }));
  };

  const handleAdd = () => {
    dispatch(openModal());
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const dataFiltered = applySortFilter({
    origens,
    comparator: getComparator(order, orderBy),
    filterSearch,
  });
  const isNotFound = !dataFiltered.length;

  return (
    <Page title="Origens | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading="Origens"
          links={[{ name: 'Indicadores', href: PATH_DIGITALDOCS.root }, { name: 'Origens' }]}
          action={
            <RoleBasedGuard roles={['origem-110', 'origem-111', 'Todo-110', 'Todo-111']}>
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

        <RoleBasedGuard hasContent roles={['origem-110', 'origem-111', 'Todo-110', 'Todo-111']}>
          <Card sx={{ p: 1 }}>
            <SearchToolbar filterSearch={filterSearch} onFilterSearch={handleFilterSearch} />
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
                <Table size={dense ? 'small' : 'medium'}>
                  <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
                  <TableBody>
                    {isLoading && isNotFound ? (
                      <SkeletonTable column={7} row={10} />
                    ) : (
                      dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                        const key = row.id;
                        return (
                          <TableRow hover key={key}>
                            <TableCell>{row.designacao}</TableCell>
                            <TableCell>{row.seguimento}</TableCell>
                            <TableCell>{row.tipo}</TableCell>
                            <TableCell>
                              {row.ilha} - {row.cidade}
                            </TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{row.telefone}</TableCell>
                            <TableCell align="center" width={50}>
                              <RoleBasedGuard roles={['origem-110', 'origem-111', 'Todo-110', 'Todo-111']}>
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
                    <TableSearchNotFound message="Não foi encontrada nenhuma origem disponível..." />
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

          <OrigemForm isOpenModal={isOpenModal} onCancel={handleCloseModal} />
        </RoleBasedGuard>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ origens, comparator, filterSearch }) {
  const stabilizedThis = origens.map((el, index) => [el, index]);
  const text = filterSearch.get('filter');

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  origens = stabilizedThis.map((el) => el[0]);

  if (text) {
    origens = origens.filter(
      (item) =>
        item?.designacao.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
        item?.seguimento.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
        item?.tipo.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
        item?.ilha.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
        item?.cidade.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
        item?.email.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
        item?.telefone.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1
    );
  }

  return origens;
}
