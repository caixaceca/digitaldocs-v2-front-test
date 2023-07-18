import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import {
  Box,
  Card,
  Table,
  Stack,
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
import { normalizeText, entidadesParse, noDados, parametrosPesquisa } from '../utils/normalizeText';
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
import { ViewItem } from '../components/Actions';
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
  const [params] = useSearchParams();
  const [filterUo, setFilterUo] = useState(null);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState(null);
  const [filterAssunto, setFilterAssunto] = useState(null);
  const { pesquisa, isLoading } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, cc, uos } = useSelector((state) => state.intranet);
  const fromAgencia = cc?.uo?.tipo === 'Agências';

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
    defaultDense: cc?.id === 362,
    defaultOrder: cc?.id === 362 ? 'desc' : 'asc',
  });

  useEffect(() => {
    if (mail && cc?.perfil_id && cc?.uo_id && params) {
      if (params?.get('avancada') === 'false') {
        dispatch(
          getAll('pesquisa v2', { mail, uoID: cc?.uo_id, perfilId: cc?.perfil_id, chave: params?.get('chave') })
        );
      } else {
        dispatch(
          getAll('pesquisa avancada', {
            mail,
            perfilID: cc?.perfil_id,
            uoID: params?.get('uoId'),
            conta: params?.get('conta'),
            datai: params?.get('datai'),
            dataf: params?.get('dataf'),
            cliente: params?.get('cliente'),
            entidade: params?.get('entidade'),
            nentrada: params?.get('nentrada'),
            noperacao: params?.get('noperacao'),
            perfilDono: params?.get('perfilId'),
          })
        );
      }
    }
  }, [dispatch, params, cc?.perfil_id, cc?.uo_id, mail]);

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
    navigate(`${PATH_DIGITALDOCS.processos.root}/${id}?from=procurar${parametrosPesquisa(params)}`);
  };

  const newPesquisa = [];
  const estadosList = [];
  const assuntosList = [];
  const uosorigemList = [];
  pesquisa?.forEach((row) => {
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
      entidades: entidadesParse(row?.entidades),
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
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
              <Typography variant="h4">Resultado da procura [{pesquisa?.length || 0}]:</Typography>
              {params?.get('avancada') === 'false' ? (
                <Box component="span" sx={{ color: 'text.primary' }}>
                  {params?.get('chave')}
                </Box>
              ) : (
                <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap" sx={{ pt: 0.5 }}>
                  {params?.get('uoId') && (
                    <Panel label="Agência/U.O">
                      <Typography noWrap>
                        {uos?.find((row) => row?.id?.toString() === params?.get('uoId')?.toString())?.label}
                      </Typography>
                    </Panel>
                  )}
                  {params?.get('perfilId') && (
                    <Panel label="Criado por">
                      <Typography noWrap>
                        {
                          colaboradores?.find(
                            (row) => row?.perfil_id?.toString() === params?.get('perfilId')?.toString()
                          )?.perfil?.displayName
                        }
                      </Typography>
                    </Panel>
                  )}
                  {params?.get('conta') && (
                    <Panel label="Nº conta">
                      <Typography noWrap>{params?.get('conta')}</Typography>
                    </Panel>
                  )}
                  {params?.get('cliente') && (
                    <Panel label="Nº cliente">
                      <Typography noWrap>{params?.get('cliente')}</Typography>
                    </Panel>
                  )}
                  {params?.get('entidade') && (
                    <Panel label="Nº entidade">
                      <Typography noWrap>{params?.get('entidade')}</Typography>
                    </Panel>
                  )}
                  {params?.get('nentrada') && (
                    <Panel label="Nº entrada">
                      <Typography noWrap>{params?.get('nentrada')}</Typography>
                    </Panel>
                  )}
                  {params?.get('noperacao') && (
                    <Panel label="Nº operação">
                      <Typography noWrap>{params?.get('noperacao')}</Typography>
                    </Panel>
                  )}
                  {params?.get('datai') && params?.get('dataf') && (
                    <Panel label="Data">
                      <Typography noWrap>
                        {ptDate(params?.get('datai'))} - {ptDate(params?.get('dataf'))}
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
          {newPesquisa.length > 1 && (
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
                    dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                      <TableRow hover key={row.id}>
                        <TableCell>{row.nentrada}</TableCell>
                        <TableCell>{row.assunto}</TableCell>
                        <TableCell>{row?.titular ? row.titular : noDados()}</TableCell>
                        <TableCell>{row.conta || row.cliente || row?.entidades || noDados()}</TableCell>
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
                          <ViewItem handleView={() => handleViewRow(row?.id)} />
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
      (row) =>
        (row?.nentrada && normalizeText(row?.nentrada).indexOf(normalizeText(filterSearch)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(filterSearch)) !== -1) ||
        (row?.conta && normalizeText(row?.conta).indexOf(normalizeText(filterSearch)) !== -1) ||
        (row?.cliente && normalizeText(row?.cliente).indexOf(normalizeText(filterSearch)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(filterSearch)) !== -1) ||
        (row?.noperacao && normalizeText(row?.noperacao).indexOf(normalizeText(filterSearch)) !== -1)
    );
  }

  return newPesquisa;
}
