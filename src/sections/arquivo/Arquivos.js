import { useEffect } from 'react';
import { useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
// @mui
import {
  Fab,
  Card,
  Stack,
  Table,
  Divider,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
} from '@mui/material';
// utils
import { ptDateTime } from '../../utils/formatTime';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, getArquivos } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbar2 } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// sections
import ArquivoAnalytic from './ArquivoAnalytic';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'referencia', label: 'Referência', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Entidade(s)', align: 'left' },
  { id: 'data_last_transicao', label: 'Data', align: 'center' },
  { id: 'empty' },
];

// ----------------------------------------------------------------------

export default function Arquivos() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
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

  const [filterSearch, setFilterSearch] = useSearchParams();

  useEffect(() => {
    if (mail && currentColaborador?.perfil_id) {
      dispatch(getArquivos('arquivados', currentColaborador?.perfil_id, mail));
      dispatch(getAll('indicadores arquivos', { mail, perfilId: currentColaborador?.perfil_id }));
    }
  }, [dispatch, currentColaborador?.perfil_id, mail]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleViewRow = (processo) => {
    navigate({
      pathname: `${PATH_DIGITALDOCS.arquivo.root}/${processo?.id}`,
      search: createSearchParams({ from: 'arquivo' }).toString(),
    });
  };

  const dataFiltered = applySortFilter({
    arquivos,
    comparator: getComparator(order, orderBy),
    filterSearch,
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
        {dataFiltered.length > 1 && (
          <SearchToolbar2 origem="arquivos" filterSearch={filterSearch} onFilterSearch={handleFilterSearch} />
        )}
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={5} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    let _entidades = '';
                    row?.entidades?.split(';')?.forEach((_row, index) => {
                      _entidades += row?.entidades?.split(';')?.length - 1 === index ? _row : `${_row} / `;
                    });
                    return (
                      <TableRow hover key={row.referencia}>
                        <TableCell>{row.referencia}</TableCell>
                        <TableCell>
                          {row?.titular ? (
                            row.titular
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                              Não identificado
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{_entidades}</TableCell>
                        <TableCell align="center">
                          {row?.data_last_transicao ? ptDateTime(row?.data_last_transicao) : ' - - - - - '}
                        </TableCell>
                        <TableCell align="center" width={100}>
                          <Tooltip title="DETALHES" arrow>
                            <Fab color="success" size="small" variant="soft" onClick={() => handleViewRow(row)}>
                              <SvgIconStyle src="/assets/icons/view.svg" />
                            </Fab>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
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

// ----------------------------------------------------------------------

function applySortFilter({ arquivos, comparator, filterSearch }) {
  const stabilizedThis = arquivos.map((el, index) => [el, index]);
  const text = filterSearch.get('filter');

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  arquivos = stabilizedThis.map((el) => el[0]);

  if (text) {
    arquivos = arquivos.filter(
      (item) =>
        (item?.referencia && item?.referencia.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (item?.titular && item?.titular.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (item?.entidades && item?.entidades.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1)
    );
  }

  return arquivos;
}
