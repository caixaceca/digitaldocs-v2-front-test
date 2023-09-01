import { useEffect } from 'react';
import { useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
// @mui
import { Card, Stack, Table, Divider, TableRow, TableBody, TableCell, Typography, TableContainer } from '@mui/material';
// utils
import { ptDateTime } from '../../utils/formatTime';
import { entidadesParse, noDados } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Scrollbar from '../../components/Scrollbar';
import { ViewItem } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbar } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import ArquivoAnalytic from './ArquivoAnalytic';
import { applySortFilter } from '../parametrizacao/applySortFilter';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'referencia', label: 'Referência', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Entidade(s)', align: 'left' },
  { id: 'data_last_transicao', label: 'Data', align: 'center', width: 50 },
  { id: 'empty', width: 50 },
];

// ----------------------------------------------------------------------

export default function Arquivos() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filter, setFilter] = useSearchParams();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { arquivos, indicadoresArquivo, isLoading } = useSelector((state) => state.digitaldocs);

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
  } = useTable({ defaultOrderBy: 'data_last_transicao', defaultOrder: 'desc' });

  useEffect(() => {
    if (mail && cc?.perfil_id) {
      dispatch(getAll('arquivados', { mail, perfilId: cc?.perfil_id }));
      dispatch(getAll('indicadores arquivos', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, cc?.perfil_id, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleViewRow = (id) => {
    navigate({
      pathname: `${PATH_DIGITALDOCS.arquivo.root}/${id}`,
      search: createSearchParams({ from: 'arquivo' }).toString(),
    });
  };

  const dataFiltered = applySortFilter({
    dados: arquivos,
    filter: filter.get('filter'),
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <RoleBasedGuard hasContent roles={['arquivo-100', 'arquivo-110', 'arquivo-111']}>
      <Card sx={{ mb: 3 }}>
        <Scrollbar>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            sx={{ py: 2 }}
          >
            <ArquivoAnalytic
              title="Total"
              total={indicadoresArquivo?.total}
              icon="/assets/icons/archive.svg"
              color="success.main"
            />
            <ArquivoAnalytic
              title="Últimos 24H"
              total={indicadoresArquivo?.totallast24}
              percent={(indicadoresArquivo?.totallast24 * 100) / indicadoresArquivo?.total}
            />
            <ArquivoAnalytic
              title="Neste mês"
              total={indicadoresArquivo?.totalmes}
              percent={(indicadoresArquivo?.totalmes * 100) / indicadoresArquivo?.total}
            />
            <ArquivoAnalytic
              title="Neste ano"
              total={indicadoresArquivo?.totalano}
              percent={(indicadoresArquivo?.totalano * 100) / indicadoresArquivo?.total}
            />
          </Stack>
        </Scrollbar>
      </Card>
      <Card sx={{ p: 1 }}>
        {arquivos.length > 1 && <SearchToolbar tab="arquivos" filter={filter} setFilter={setFilter} />}
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={5} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow hover key={row.referencia}>
                      <TableCell>{row.referencia}</TableCell>
                      <TableCell>{row?.titular ? row.titular : noDados()}</TableCell>
                      <TableCell>{entidadesParse(row?.entidades) || noDados()}</TableCell>
                      <TableCell align="center">
                        {row?.data_last_transicao && (
                          <Typography variant="body2" noWrap>
                            {ptDateTime(row?.data_last_transicao)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <ViewItem handleClick={() => handleViewRow(row?.id)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum processo arquivado disponível..." />
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
    </RoleBasedGuard>
  );
}
