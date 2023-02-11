import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
// @mui
import {
  Box,
  Fab,
  Card,
  Table,
  Stack,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// utils
import { ptDateTime } from '../utils/formatTime';
// hooks
import useTable, { getComparator } from '../hooks/useTable';
// redux
import { getAll } from '../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../redux/store';
// hooks
import useSettings from '../hooks/useSettings';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// components
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SvgIconStyle from '../components/SvgIconStyle';
import { SkeletonTable } from '../components/skeleton';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
import { SearchToolbarProcura } from '../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Número', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'estado', label: 'Estado', align: 'left' },
  { id: 'criado_em', label: 'Criado' },
  { id: 'empty' },
];

// ----------------------------------------------------------------------

export default function Procura() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { themeStretch, themeMode } = useSettings();
  const { uos } = useSelector((state) => state.uo);
  const { pesquisa, isLoading } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, currentColaborador } = useSelector((state) => state.colaborador);

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

  const [filterUo, setFilterUo] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterAssunto, setFilterAssunto] = useState('');
  const [chave] = useSearchParams();
  const _chave = chave?.get('chave');

  useEffect(() => {
    if (mail && currentColaborador?.perfil_id && _chave) {
      dispatch(getAll('pesquisa', { mail, perfilId: currentColaborador?.perfil_id, chave: _chave }));
    }
  }, [dispatch, _chave, currentColaborador?.perfil_id, mail]);

  const handleFilterUo = (value) => {
    setFilterUo(value);
    setPage(0);
  };
  const handleFilterSearch = (value) => {
    setFilterSearch(value);
    setPage(0);
  };
  const handleFilterEstado = (value) => {
    setFilterEstado(value);
    setPage(0);
  };
  const handleFilterAssunto = (value) => {
    setFilterAssunto(value);
    setPage(0);
  };

  const handleViewRow = (id) => {
    navigate({
      pathname: `${PATH_DIGITALDOCS.processos.root}/${id}`,
      search: createSearchParams({ from: 'procurar' }).toString(),
    });
  };

  const newPesquisa = [];
  const estadosList = [];
  const assuntosList = [];
  const uosorigemList = [];
  pesquisa?.forEach((row) => {
    let _entidades = '';
    row?.entidades?.split(';')?.forEach((_row, index) => {
      _entidades += row?.entidades?.split(';')?.length - 1 === index ? _row : `${_row} / `;
    });
    const uo = uos?.find((uo) => uo?.id === row?.uo_origem_id);
    const colaborador = colaboradores?.find((colaborador) => colaborador?.perfil_id === row?.dono);
    if (uo && !uosorigemList.includes(uo?.label)) {
      uosorigemList.push(uo?.label);
    }
    if (!estadosList.includes(row?.estado)) {
      estadosList.push(row?.estado);
    }
    if (!assuntosList.includes(row?.assunto)) {
      assuntosList.push(row?.assunto);
    }
    newPesquisa?.push({
      ...row,
      uo: uo?.label,
      tipo: uo?.tipo,
      entidades: _entidades,
      colaborador: colaborador?.perfil?.displayName,
    });
  });

  const dataFiltered = applySortFilter({
    newPesquisa,
    comparator: getComparator(order, orderBy),
    filterUo,
    filterSearch,
    filterEstado,
    filterAssunto,
  });
  const isNotFound = !dataFiltered.length;

  return (
    <Page title="Pesquisa | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={
            <>
              Resultado da procura [{pesquisa?.length || 0}]:
              <Box component="span" sx={{ color: theme.palette.grey[themeMode === 'light' ? 800 : 50], pl: 1 }}>
                {_chave}
              </Box>
            </>
          }
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'Processos', href: PATH_DIGITALDOCS.processos.root },
            { name: `Procurar: ${_chave}` },
          ]}
          action=""
          sx={{ color: 'text.secondary' }}
        />

        <Card sx={{ p: 1 }}>
          <SearchToolbarProcura
            estadosList={estadosList}
            assuntosList={assuntosList}
            uosorigemList={uosorigemList}
            filterUo={filterUo}
            filterSearch={filterSearch}
            filterEstado={filterEstado}
            filterAssunto={filterAssunto}
            onFilterUo={handleFilterUo}
            onFilterSearch={handleFilterSearch}
            onFilterEstado={handleFilterEstado}
            onFilterAssunto={handleFilterAssunto}
          />
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
                <TableBody>
                  {isLoading && isNotFound ? (
                    <SkeletonTable column={7} row={10} />
                  ) : (
                    dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                      <TableRow hover key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.assunto}</TableCell>
                        <TableCell>{row.titular}</TableCell>
                        <TableCell>
                          {(row?.conta && row.conta) || (row?.cliente && row.cliente) || row?.entidades}
                        </TableCell>
                        <TableCell>{row.estado}</TableCell>
                        <TableCell>
                          {row?.criado_em && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <SvgIconStyle
                                src="/assets/icons/header/clock.svg"
                                sx={{ width: 15, height: 15, color: 'text.secondary' }}
                              />
                              <Typography variant="body2">{ptDateTime(row.criado_em)}</Typography>
                            </Stack>
                          )}
                          {row?.uo && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <SvgIconStyle
                                src="/assets/icons/office.svg"
                                sx={{ width: 15, height: 15, color: 'text.secondary' }}
                              />
                              <Typography variant="body2">
                                {row?.tipo === 'Agências' ? `Agência ${row?.uo}` : row?.uo}
                              </Typography>
                            </Stack>
                          )}
                          {row?.colaborador && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <SvgIconStyle
                                src="/assets/icons/user.svg"
                                sx={{ width: 16, height: 16, color: 'text.secondary' }}
                              />
                              <Typography variant="body2">{row.colaborador}</Typography>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell align="center" width={50}>
                          <Tooltip title="DETALHES" arrow>
                            <Fab color="success" size="small" variant="soft" onClick={() => handleViewRow(row?.id)}>
                              <SvgIconStyle src="/assets/icons/view.svg" />
                            </Fab>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>

                {!isLoading && isNotFound && (
                  <TableSearchNotFound message="Não foi encontrado nenhum processo disponível..." />
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
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ newPesquisa, comparator, filterUo, filterSearch, filterEstado, filterAssunto }) {
  const stabilizedThis = newPesquisa.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  newPesquisa = stabilizedThis.map((el) => el[0]);

  if (filterAssunto) {
    newPesquisa = newPesquisa.filter((row) => row?.assunto === filterAssunto);
  }
  if (filterEstado) {
    newPesquisa = newPesquisa.filter((row) => row?.estado === filterEstado);
  }
  if (filterUo) {
    newPesquisa = newPesquisa.filter((row) => row?.uo === filterUo);
  }
  if (filterSearch) {
    newPesquisa = newPesquisa.filter(
      (item) =>
        item?.id.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1 ||
        item?.titular.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1 ||
        item?.conta.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1 ||
        item?.cliente.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1 ||
        item?.titular.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1 ||
        item?.noperacao.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1
    );
  }

  return newPesquisa;
}
