import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// @mui
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Fab, Card, Table, Button, Tooltip, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, openModal, closeModal, selectItem } from '../../redux/slices/digitaldocs';
// Components
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbar } from '../../components/SearchToolbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
//
import { LinhaForm } from './ParametrizacaoForm';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'linha', label: 'Linha', align: 'left' },
  { id: 'descricao', label: 'Descrição', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function Linhas() {
  const dispatch = useDispatch();
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { linhas, isOpenModal, isLoading } = useSelector((state) => state.digitaldocs);

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
      dispatch(getAll('linhas', { mail, perfilId: currentColaborador?.perfil_id }));
    }
  }, [dispatch, currentColaborador?.perfil_id, mail]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleUpdate = (item) => {
    dispatch(selectItem(item));
  };

  const handleAdd = () => {
    dispatch(openModal());
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const dataFiltered = applySortFilter({ linhas, comparator: getComparator(order, orderBy), filterSearch });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Linhas de crédito"
        links={[{ name: '' }]}
        action={
          <RoleBasedGuard roles={['Todo-110', 'Todo-111']}>
            <Button variant="soft" startIcon={<AddCircleIcon />} onClick={handleAdd}>
              Adicionar
            </Button>
          </RoleBasedGuard>
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />

      <RoleBasedGuard hasContent roles={['Todo-110', 'Todo-111']}>
        <Card sx={{ p: 1 }}>
          {linhas.length > 1 && (
            <SearchToolbar filterSearch={filterSearch} onFilterSearch={handleFilterSearch} tab="linhasCredito" />
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
                          <TableCell>{row.linha}</TableCell>
                          <TableCell>{row.descricao}</TableCell>
                          <TableCell align="center" width={50}>
                            <RoleBasedGuard roles={['Todo-110', 'Todo-111']}>
                              <Tooltip title="Editar" arrow>
                                <Fab size="small" variant="soft" color="warning" onClick={() => handleUpdate(row)}>
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
                  <TableSearchNotFound message="Não foi encontrada nenhuma linha de crédito disponível..." />
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

        <LinhaForm isOpenModal={isOpenModal} onCancel={handleCloseModal} />
      </RoleBasedGuard>
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ linhas, comparator, filterSearch }) {
  const stabilizedThis = linhas.map((el, index) => [el, index]);
  const text = filterSearch.get('filter');

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  linhas = stabilizedThis.map((el) => el[0]);

  if (text) {
    linhas = linhas.filter(
      (item) =>
        item?.linha.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
        item?.descricao.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1
    );
  }

  return linhas;
}
