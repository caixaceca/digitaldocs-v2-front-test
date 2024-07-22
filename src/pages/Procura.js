import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { ptDateTime, fYear } from '../utils/formatTime';
import { normalizeText, entidadesParse, noDados } from '../utils/formatText';
// hooks
import useTable, { getComparator, applySort } from '../hooks/useTable';
// redux
import { getAll } from '../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../redux/store';
// hooks
import useSettings from '../hooks/useSettings';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// components
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import { DefaultAction } from '../components/Actions';
import { SkeletonTable } from '../components/skeleton';
import Panel, { Criado, Registos } from '../components/Panel';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
import { SearchToolbarProcura } from '../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'entrada', label: 'Nº', align: 'left' },
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
  const [uo, setUo] = useState(localStorage.getItem('uoFSearch') || null);
  const [search, setSearch] = useState(localStorage.getItem('filterSearch') || '');
  const [estado, setEstado] = useState(localStorage.getItem('estadoSearch') || null);
  const [assunto, setAssunto] = useState(localStorage.getItem('assuntoSearch') || null);
  const { mail, cc, uos, colaboradores } = useSelector((state) => state.intranet);
  const { pesquisa, pesquisaInfo, isLoading } = useSelector((state) => state.digitaldocs);
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
    defaultRowsPerPage: Number(localStorage.getItem('rowsPerPage') || (fromAgencia && 100) || 25),
  });

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uo, search, assunto, estado, pesquisa]);

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
    uo,
    search,
    estado,
    assunto,
    newPesquisa,
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  const handleView = (id, isCC) => {
    if (isCC) {
      navigate(`${PATH_DIGITALDOCS.processos.root}/cc/${id}?from=Pesquisa`);
    } else {
      navigate(`${PATH_DIGITALDOCS.processos.root}/${id}?from=Pesquisa`);
    }
  };

  const verMais = () => {
    if (mail && cc?.perfil_id) {
      if (localStorage.getItem('tipoPesquisa') === 'avancada') {
        dispatch(
          getAll('pesquisa avancada', {
            mail,
            perfilId: cc?.perfil_id,
            pagina: pesquisaInfo?.proxima_pagina,
            uo: localStorage.getItem('uoSearch') || '',
            conta: localStorage.getItem('conta') || '',
            entrada: localStorage.getItem('entrada') || '',
            cliente: localStorage.getItem('cliente') || '',
            entidade: localStorage.getItem('entidade') || '',
            noperacao: localStorage.getItem('noperacao') || '',
          })
        );
      } else if (cc?.uo_id) {
        dispatch(
          getAll('pesquisa global', {
            mail,
            uoID: cc?.uo_id,
            perfilId: cc?.perfil_id,
            pagina: pesquisaInfo?.proxima_pagina,
            chave: localStorage.getItem('chave'),
            historico: localStorage.getItem('procHistorico') === 'true',
          })
        );
      }
    }
  };

  return (
    <Page title="Pesquisa | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          sx={{ color: 'text.secondary' }}
          action={<Registos info={pesquisaInfo} total={pesquisa?.length} handleClick={verMais} />}
          heading={
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'start', md: 'center' }} spacing={1}>
              <Typography variant="h4">Resultado da procura [{pesquisa?.length || 0}]:</Typography>
              {localStorage.getItem('tipoPesquisa') === 'avancada' ? (
                <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap" sx={{ pt: 0.5 }}>
                  {localStorage.getItem('uoSearch') && (
                    <Panel
                      label="U.O"
                      children={
                        <Typography noWrap>
                          {uos?.find((row) => row?.id === Number(localStorage.getItem('uoSearch')))?.label}
                        </Typography>
                      }
                    />
                  )}
                  {localStorage.getItem('entrada') && (
                    <Panel
                      label="Nº entrada"
                      children={<Typography noWrap>{localStorage.getItem('entrada')}</Typography>}
                    />
                  )}
                  {localStorage.getItem('conta') && (
                    <Panel
                      label="Nº conta"
                      children={<Typography noWrap>{localStorage.getItem('conta')}</Typography>}
                    />
                  )}
                  {localStorage.getItem('cliente') && (
                    <Panel
                      label="Nº cliente"
                      children={<Typography noWrap>{localStorage.getItem('cliente')}</Typography>}
                    />
                  )}
                  {localStorage.getItem('entidade') && (
                    <Panel
                      label="Nº entidade"
                      children={<Typography noWrap>{localStorage.getItem('entidade')}</Typography>}
                    />
                  )}
                  {localStorage.getItem('noperacao') && (
                    <Panel
                      label="Nº operação"
                      children={<Typography noWrap>{localStorage.getItem('noperacao')}</Typography>}
                    />
                  )}
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap" sx={{ pt: 0.5 }}>
                  <Box component="span" sx={{ color: 'text.primary' }}>
                    {localStorage.getItem('chave')}
                  </Box>
                  {localStorage.getItem('procHistorico') === 'true' && <Label>Histórico</Label>}
                </Stack>
              )}
            </Stack>
          }
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'Processos', href: PATH_DIGITALDOCS.processos.root },
            { name: 'Procurar' },
          ]}
        />

        <Card sx={{ p: 1 }}>
          <SearchToolbarProcura
            uo={uo}
            setUo={setUo}
            search={search}
            estado={estado}
            assunto={assunto}
            setSearch={setSearch}
            setEstado={setEstado}
            setAssunto={setAssunto}
            estadosList={estadosList}
            assuntosList={assuntosList}
            uosorigemList={uosorigemList}
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
                        <TableCell>{`${row.entrada}${row.criado_em ? `/${fYear(row.criado_em)}` : ''}`}</TableCell>
                        <TableCell>{row.assunto}</TableCell>
                        <TableCell>{row?.titular ? row.titular : noDados()}</TableCell>
                        <TableCell>{row.conta || row.cliente || row?.entidades || noDados()}</TableCell>
                        <TableCell>{row.estado}</TableCell>
                        <TableCell sx={{ width: 10 }}>
                          {row?.criado_em && <Criado tipo="time" value={ptDateTime(row.criado_em)} />}
                          {row?.uo && (
                            <Criado tipo="company" value={row?.tipo === 'Agências' ? `Agência ${row?.uo}` : row?.uo} />
                          )}
                          {row?.colaborador && <Criado tipo="user" value={row.colaborador} baralhar />}
                        </TableCell>
                        <TableCell align="center" width={50}>
                          <DefaultAction
                            label="DETALHES"
                            handleClick={() => handleView(row?.id, row?.credito_colaborador)}
                          />
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

function applySortFilter({ newPesquisa, comparator, uo, search, estado, assunto }) {
  newPesquisa = applySort(newPesquisa, comparator);

  if (assunto) {
    newPesquisa = newPesquisa.filter((row) => row?.assunto === assunto);
  }
  if (estado) {
    newPesquisa = newPesquisa.filter((row) => row?.estado === estado);
  }
  if (uo) {
    newPesquisa = newPesquisa.filter((row) => row?.uo === uo);
  }
  if (search) {
    newPesquisa = newPesquisa.filter(
      (row) =>
        (row?.entrada && normalizeText(row?.entrada).indexOf(normalizeText(search)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(search)) !== -1) ||
        (row?.conta && normalizeText(row?.conta).indexOf(normalizeText(search)) !== -1) ||
        (row?.entidades && normalizeText(row?.entidades).indexOf(normalizeText(search)) !== -1) ||
        (row?.cliente && normalizeText(row?.cliente).indexOf(normalizeText(search)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(search)) !== -1) ||
        (row?.noperacao && normalizeText(row?.noperacao).indexOf(normalizeText(search)) !== -1)
    );
  }

  return newPesquisa;
}
