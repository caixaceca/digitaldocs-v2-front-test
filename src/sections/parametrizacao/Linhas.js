import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// @mui
import { Card, Table, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// utils
import { newLineText } from '../../utils/normalizeText';
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
import { LinhaForm } from './ParametrizacaoForm';
import { applySortFilter } from './applySortFilter';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'linha', label: 'Linha', align: 'left' },
  { id: 'descricao', label: 'Descrição', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function Linhas() {
  const dispatch = useDispatch();
  const [filter, setFilter] = useSearchParams();
  const { mail, cc } = useSelector((state) => state.intranet);
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
  } = useTable({ defaultOrderBy: 'linha', defaultOrder: 'asc' });

  useEffect(() => {
    if (mail && cc?.perfil_id) {
      dispatch(getAll('linhas', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, cc?.perfil_id, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const dataFiltered = applySortFilter({
    dados: linhas,
    filter: filter.get('filter'),
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Linhas de crédito"
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
          {linhas.length > 1 && <SearchToolbar filter={filter} setFilter={setFilter} tab="linhasCredito" />}
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
                          <TableCell>{newLineText(row.descricao)}</TableCell>
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
                  <TableSearchNotFound message="Não foi encontrada nenhuma linha de crédito disponível..." />
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

        <LinhaForm isOpenModal={isOpenModal} onCancel={handleCloseModal} />
      </RoleBasedGuard>
    </>
  );
}