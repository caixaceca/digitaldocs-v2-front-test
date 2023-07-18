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
import { OrigemForm } from './ParametrizacaoForm';

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
  const { mail, cc } = useSelector((state) => state.intranet);
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
  } = useTable({ defaultOrderBy: 'designacao', defaultOrder: 'asc' });

  const [filterSearch, setFilterSearch] = useSearchParams();

  useEffect(() => {
    if (mail && cc?.perfil_id) {
      dispatch(getAll('origens', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, cc?.perfil_id, mail]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const dataFiltered = applySortFilter({ origens, comparator: getComparator(order, orderBy), filterSearch });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Origens"
        links={[{ name: '' }]}
        action={
          <RoleBasedGuard roles={['origem-110', 'origem-111', 'Todo-110', 'Todo-111']}>
            <AddItem />
          </RoleBasedGuard>
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />

      <RoleBasedGuard hasContent roles={['origem-110', 'origem-111', 'Todo-110', 'Todo-111']}>
        <Card sx={{ p: 1 }}>
          {origens.length > 1 && (
            <SearchToolbar filterSearch={filterSearch} onFilterSearch={handleFilterSearch} tab="origens" />
          )}
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
                              <UpdateItem item="origem" id={row?.id} />
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

        <OrigemForm isOpenModal={isOpenModal} onCancel={handleCloseModal} />
      </RoleBasedGuard>
    </>
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
        (item?.designacao && normalizeText(item?.designacao).indexOf(normalizeText(text)) !== -1) ||
        (item?.seguimento && normalizeText(item?.seguimento).indexOf(normalizeText(text)) !== -1) ||
        (item?.tipo && normalizeText(item?.tipo).indexOf(normalizeText(text)) !== -1) ||
        (item?.ilha && normalizeText(item?.ilha).indexOf(normalizeText(text)) !== -1) ||
        (item?.cidade && normalizeText(item?.cidade).indexOf(normalizeText(text)) !== -1) ||
        (item?.email && normalizeText(item?.email).indexOf(normalizeText(text)) !== -1) ||
        (item?.telefone && normalizeText(item?.telefone).indexOf(normalizeText(text)) !== -1)
    );
  }

  return origens;
}
