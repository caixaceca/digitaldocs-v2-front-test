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
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
// utils
import { ptDateTime, ptDate } from '../utils/formatTime';
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
import Panel from '../components/Panel';
import Scrollbar from '../components/Scrollbar';
import SvgIconStyle from '../components/SvgIconStyle';
import { SkeletonTable } from '../components/skeleton';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
import { SearchToolbarProcura } from '../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nentrada', label: 'Nº', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'estado', label: 'Estado', align: 'left' },
  { id: 'criado_em', label: 'Criado' },
  { id: 'empty' },
];

// ----------------------------------------------------------------------

export default function Procura() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [parametros] = useSearchParams();
  const [filterUo, setFilterUo] = useState(null);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState(null);
  const [filterAssunto, setFilterAssunto] = useState(null);
  const { pesquisa, isLoading } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, currentColaborador, uos } = useSelector((state) => state.intranet);
  const fromAgencia = currentColaborador?.uo?.tipo === 'Agências';

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
  } = useTable({
    defaultOrderBy: 'noOrderDefault',
    defaultRowsPerPage: fromAgencia ? 100 : 25,
    defaultDense: currentColaborador?.id === 362,
    defaultOrder: currentColaborador?.id === 362 ? 'desc' : 'asc',
  });

  useEffect(() => {
    if (mail && currentColaborador?.perfil_id && currentColaborador?.uo_id && parametros) {
      if (parametros?.get('avancada') === 'false') {
        dispatch(
          getAll('pesquisa v2', {
            mail,
            chave: parametros?.get('chave'),
            uoID: currentColaborador?.uo_id,
            perfilId: currentColaborador?.perfil_id,
          })
        );
      } else {
        dispatch(
          getAll('pesquisa avancada', {
            mail,
            uoID: parametros?.get('uoId'),
            conta: parametros?.get('conta'),
            datai: parametros?.get('datai'),
            dataf: parametros?.get('dataf'),
            cliente: parametros?.get('cliente'),
            entidade: parametros?.get('entidade'),
            nentrada: parametros?.get('nentrada'),
            noperacao: parametros?.get('noperacao'),
            perfilID: currentColaborador?.perfil_id,
            perfilDono: parametros?.get('perfilId'),
          })
        );
      }
    }
  }, [dispatch, parametros, currentColaborador?.perfil_id, currentColaborador?.uo_id, mail]);

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
    if (parametros?.get('avancada') === 'false') {
      navigate({
        pathname: PATH_DIGITALDOCS.processos.procurar,
        search: createSearchParams({
          from: 'procurar',
          avancada: 'false',
          chave: parametros?.get('chave'),
        }).toString(),
      });
    } else {
      navigate({
        pathname: `${PATH_DIGITALDOCS.processos.root}/${id}`,
        search: createSearchParams({
          from: 'procurar',
          avancada: 'true',
          uoId: parametros?.get('uoId'),
          conta: parametros?.get('conta'),
          datai: parametros?.get('datai'),
          dataf: parametros?.get('dataf'),
          cliente: parametros?.get('cliente'),
          entidade: parametros?.get('entidade'),
          nentrada: parametros?.get('nentrada'),
          perfilId: parametros?.get('perfilId'),
          noperacao: parametros?.get('noperacao'),
        }).toString(),
      });
    }
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

  console.log(colaboradores);

  return (
    <Page title="Pesquisa | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
              <Typography variant="h4">Resultado da procura [{pesquisa?.length || 0}]:</Typography>
              {parametros?.get('avancada') === 'false' ? (
                <Box component="span" sx={{ color: 'text.primary' }}>
                  {parametros?.get('chave')}
                </Box>
              ) : (
                <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
                  {parametros?.get('uoId') && (
                    <Panel label="U.O">
                      <Typography noWrap>
                        {uos?.find((row) => row?.id?.toString() === parametros?.get('uoId')?.toString())?.label}
                      </Typography>
                    </Panel>
                  )}
                  {parametros?.get('perfilId') && (
                    <Panel label="Criado por">
                      <Typography noWrap>
                        {
                          colaboradores?.find(
                            (row) => row?.perfil_id?.toString() === parametros?.get('perfilId')?.toString()
                          )?.perfil?.displayName
                        }
                      </Typography>
                    </Panel>
                  )}
                  {parametros?.get('conta') && (
                    <Panel label="Nº conta">
                      <Typography noWrap>{parametros?.get('conta')}</Typography>
                    </Panel>
                  )}
                  {parametros?.get('cliente') && (
                    <Panel label="Nº cliente">
                      <Typography noWrap>{parametros?.get('cliente')}</Typography>
                    </Panel>
                  )}
                  {parametros?.get('entidade') && (
                    <Panel label="Nº entidade">
                      <Typography noWrap>{parametros?.get('entidade')}</Typography>
                    </Panel>
                  )}
                  {parametros?.get('nentrada') && (
                    <Panel label="Nº entrada">
                      <Typography noWrap>{parametros?.get('nentrada')}</Typography>
                    </Panel>
                  )}
                  {parametros?.get('noperacao') && (
                    <Panel label="Nº operação">
                      <Typography noWrap>{parametros?.get('noperacao')}</Typography>
                    </Panel>
                  )}
                  {parametros?.get('datai') && parametros?.get('dataf') && (
                    <Panel label="Data">
                      <Typography noWrap>
                        {ptDate(parametros?.get('datai'))} - {ptDate(parametros?.get('dataf'))}
                      </Typography>
                    </Panel>
                  )}
                </Stack>
              )}
            </Stack>
          }
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'Processos', href: PATH_DIGITALDOCS.processos.root },
            { name: 'Procurar' },
          ]}
          action=""
          sx={{ color: 'text.secondary' }}
        />

        <Card sx={{ p: 1 }}>
          {dataFiltered.length > 1 && (
            <SearchToolbarProcura
              filterUo={filterUo}
              estadosList={estadosList}
              assuntosList={assuntosList}
              filterSearch={filterSearch}
              filterEstado={filterEstado}
              onFilterUo={handleFilterUo}
              filterAssunto={filterAssunto}
              uosorigemList={uosorigemList}
              onFilterSearch={handleFilterSearch}
              onFilterEstado={handleFilterEstado}
              onFilterAssunto={handleFilterAssunto}
            />
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
                      let _entidades = '';
                      row?.entidades?.split(';')?.forEach((_row, index) => {
                        _entidades += row?.entidades?.split(';')?.length - 1 === index ? _row : `${_row} / `;
                      });
                      return (
                        <TableRow hover key={row.id}>
                          <TableCell>{row.nentrada}</TableCell>
                          <TableCell>{row.assunto}</TableCell>
                          <TableCell>
                            {row?.titular ? (
                              row.titular
                            ) : (
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                Não identificado
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {(row?.conta && row.conta) || (row?.cliente && row.cliente) || _entidades || (
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                Não identificado
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{row.estado}</TableCell>
                          <TableCell sx={{ width: 10 }}>
                            {row?.criado_em && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <AccessTimeOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
                                <Typography noWrap variant="body2">
                                  {ptDateTime(row.criado_em)}
                                </Typography>
                              </Stack>
                            )}
                            {row?.uo && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <BusinessOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
                                <Typography noWrap variant="body2">
                                  {row?.tipo === 'Agências' ? `Agência ${row?.uo}` : row?.uo}
                                </Typography>
                              </Stack>
                            )}
                            {row?.colaborador && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <AccountCircleOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
                                <Typography noWrap variant="body2">
                                  {row.colaborador}
                                </Typography>
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
                      );
                    })
                  )}
                </TableBody>

                {!isLoading && isNotFound && (
                  <TableSearchNotFound message="Não foi encontrado nenhum processo disponível..." />
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
        (item?.nentrada && item?.nentrada.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1) ||
        (item?.titular && item?.titular.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1) ||
        (item?.conta && item?.conta.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1) ||
        (item?.cliente && item?.cliente.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1) ||
        (item?.titular && item?.titular.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1) ||
        (item?.noperacao && item?.noperacao.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1)
    );
  }

  return newPesquisa;
}
