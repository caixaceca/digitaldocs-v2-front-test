import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
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
import { ptDateTime, fYear } from '../../utils/formatTime';
import { normalizeText, entidadesParse, noDados } from '../../utils/formatText';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, resetProcesso } from '../../redux/slices/digitaldocs';
// hooks
import useSettings from '../../hooks/useSettings';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import Panel, { Criado, Registos } from '../../components/Panel';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarProcura } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'entrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'estado', label: 'Estado', align: 'left' },
  { id: 'criado_em', label: 'Criado' },
  { id: '', width: 10 },
];

// ----------------------------------------------------------------------

export default function PageProcura() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [uo, setUo] = useState(localStorage.getItem('uoFSearch') || null);
  const [search, setSearch] = useState(localStorage.getItem('filterSearch') || '');
  const [estado, setEstado] = useState(localStorage.getItem('estadoSearch') || null);
  const [assunto, setAssunto] = useState(localStorage.getItem('assuntoSearch') || null);
  const { mail, perfilId, uos } = useSelector((state) => state.intranet);
  const { pesquisa, processosInfo, isLoading } = useSelector((state) => state.digitaldocs);

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
    defaultRowsPerPage: Number(localStorage.getItem('rowsPerPage') || 25),
  });

  useEffect(() => {
    dispatch(resetProcesso());
  }, [dispatch]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uo, search, assunto, estado, pesquisa]);

  const dados = useMemo(() => setDados({ pesquisa, uos }), [pesquisa, uos]);

  const dataFiltered = applySortFilter({
    uo,
    search,
    estado,
    assunto,
    dados: dados?.dados,
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  const verMais = () => {
    if (mail && perfilId) {
      if (localStorage.getItem('tipoPesquisa') === 'avancada') {
        dispatch(
          getAll('pesquisa avancada', {
            mail,
            perfilId,
            pagina: processosInfo?.proxima_pagina,
            uo: localStorage.getItem('uoSearch') || '',
            conta: localStorage.getItem('conta') || '',
            entrada: localStorage.getItem('entrada') || '',
            cliente: localStorage.getItem('cliente') || '',
            entidade: localStorage.getItem('entidade') || '',
            noperacao: localStorage.getItem('noperacao') || '',
            historico: localStorage.getItem('procHistorico') === 'true',
          })
        );
      } else {
        dispatch(
          getAll('pesquisa global', {
            mail,
            perfilId,
            pagina: processosInfo?.proxima_pagina,
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
          action={<Registos info={processosInfo} total={pesquisa?.length} handleClick={() => verMais()} />}
          heading={
            <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
              <Typography variant="h4">Procura:</Typography>
              {localStorage.getItem('procHistorico') === 'true' && <Label sx={{ mt: 0.5 }}>Histórico</Label>}
              {localStorage.getItem('tipoPesquisa') === 'avancada' ? (
                <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
                  <Panel
                    label="U.O"
                    value={uos?.find((row) => row?.id === Number(localStorage.getItem('uoSearch')))?.label}
                  />
                  <Panel label="Nº entrada" value={localStorage.getItem('entrada')} />
                  <Panel label="Nº operação" value={localStorage.getItem('noperacao')} />
                  <Panel label="Nº entidade" value={localStorage.getItem('entidade')} />
                  <Panel label="Nº cliente" value={localStorage.getItem('cliente')} />
                  <Panel label="Nº conta" value={localStorage.getItem('conta')} />
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
                  <Box component="span" sx={{ color: 'text.primary' }}>
                    {localStorage.getItem('chave')}
                  </Box>
                </Stack>
              )}
            </Stack>
          }
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'Processos', href: PATH_DIGITALDOCS.filaTrabalho.root },
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
            estadosList={dados?.estados}
            assuntosList={dados?.assuntos}
            uosorigemList={dados?.uosOrigem}
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
                        <TableCell>{row?.titular ? row.titular : noDados()}</TableCell>
                        <TableCell>{row.conta || row.cliente || row?.entidades || noDados()}</TableCell>
                        <TableCell>{row.assunto}</TableCell>
                        <TableCell>
                          {localStorage.getItem('procHistorico') === 'true' ? 'Histórico' : row.estado}
                        </TableCell>
                        <TableCell sx={{ width: 10 }}>
                          {row?.criado_em && <Criado tipo="time" value={ptDateTime(row.criado_em)} />}
                          {row?.uo && (
                            <Criado tipo="company" value={row?.tipo === 'Agências' ? `Agência ${row?.uo}` : row?.uo} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <DefaultAction
                            label="DETALHES"
                            handleClick={() =>
                              navigate(`${PATH_DIGITALDOCS.filaTrabalho.root}/${row?.id}?from=Pesquisa`)
                            }
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

function setDados({ pesquisa = [], uos = [] }) {
  const uosMap = new Map(uos.map((uo) => [uo.id, uo]));

  const estadosSet = new Set();
  const assuntosSet = new Set();
  const uosOrigemSet = new Set();

  const dados = pesquisa.map((row) => {
    const uo = uosMap.get(row?.uo_origem_id);
    if (uo) uosOrigemSet.add(uo.label);
    estadosSet.add(row?.estado);
    assuntosSet.add(row?.assunto);

    return { ...row, uo: uo?.label, tipo: uo?.tipo, entidades: entidadesParse(row?.entidades) };
  });

  return {
    dados,
    estados: Array.from(estadosSet),
    assuntos: Array.from(assuntosSet),
    uosOrigem: Array.from(uosOrigemSet),
  };
}

// ----------------------------------------------------------------------

function applySortFilter({ dados, comparator, uo, search, estado, assunto }) {
  dados = applySort(dados, comparator);

  if (assunto) dados = dados.filter((row) => row?.assunto === assunto);
  if (estado) dados = dados.filter((row) => row?.estado === estado);
  if (uo) dados = dados.filter((row) => row?.uo === uo);

  if (search) {
    dados = dados.filter(
      (row) =>
        (row?.conta && normalizeText(row?.conta).indexOf(normalizeText(search)) !== -1) ||
        (row?.entrada && normalizeText(row?.entrada).indexOf(normalizeText(search)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(search)) !== -1) ||
        (row?.cliente && normalizeText(row?.cliente).indexOf(normalizeText(search)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(search)) !== -1) ||
        (row?.noperacao && normalizeText(row?.noperacao).indexOf(normalizeText(search)) !== -1) ||
        (row?.entidades && normalizeText(row?.entidades).indexOf(normalizeText(search)) !== -1)
    );
  }

  return dados;
}
