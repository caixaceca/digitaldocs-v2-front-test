import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { ptDateTime, fToNow, fYear } from '../../utils/formatTime';
import { normalizeText, entidadesParse } from '../../utils/formatText';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getListaProcessos, resetProcesso } from '../../redux/slices/digitaldocs';
// hooks
import useSettings from '../../hooks/useSettings';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import Panel, { Criado, noDados } from '../../components/Panel';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarProcura } from '../../components/SearchToolbar';
import { DefaultAction, MaisProcessos } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

// ---------------------------------------------------------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'entrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Cliente/Entidade', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'estado', label: 'Estado', align: 'left' },
  { id: 'criado_em', label: 'Criado' },
  { id: '', width: 10 },
];

// ---------------------------------------------------------------------------------------------------------------------

export default function PageProcura() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [uo, setUo] = useState(localStorage.getItem('uoFSearch') || null);
  const [search, setSearch] = useState(localStorage.getItem('filterSearch') || '');
  const [estado, setEstado] = useState(localStorage.getItem('estadoSearch') || null);
  const [assunto, setAssunto] = useState(localStorage.getItem('assuntoSearch') || null);
  const { uos } = useSelector((state) => state.intranet);
  const { pesquisa, cursor, isLoading } = useSelector((state) => state.digitaldocs);

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
    defaultOrderBy: 'criado_em',
    defaultRowsPerPage: Number(localStorage.getItem('rowsPerPage') || 25),
  });

  useEffect(() => {
    dispatch(resetProcesso());
  }, [dispatch]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uo, search, assunto, estado, pesquisa]);

  const setDados = useCallback(({ pesquisa = [], uos = [] }) => {
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
  }, []);

  const dados = useMemo(() => setDados({ pesquisa, uos }), [pesquisa, uos, setDados]);

  const applySortFilter = useCallback(({ dados, comparator, uo, search, estado, assunto }) => {
    const sortedData = applySort(dados, comparator);
    const normalizedSearch = normalizeText(search);
    return sortedData.filter((row) => {
      const matchesAssunto = !assunto || row?.assunto === assunto;
      const matchesEstado = !estado || row?.estado === estado;
      const matchesUo = !uo || row?.uo === uo;
      const matchesSearch =
        !search ||
        (row?.conta && normalizeText(row?.conta).includes(normalizedSearch)) ||
        (row?.entrada && normalizeText(row?.entrada).includes(normalizedSearch)) ||
        (row?.titular && normalizeText(row?.titular).includes(normalizedSearch)) ||
        (row?.cliente && normalizeText(row?.cliente).includes(normalizedSearch)) ||
        (row?.noperacao && normalizeText(row?.noperacao).includes(normalizedSearch)) ||
        (row?.entidades && normalizeText(row?.entidades).includes(normalizedSearch));
      return matchesAssunto && matchesEstado && matchesUo && matchesSearch;
    });
  }, []);

  const dataFiltered = useMemo(
    () =>
      applySortFilter({
        dados: dados?.dados,
        comparator: getComparator(order, orderBy),
        uo,
        search,
        estado,
        assunto,
      }),
    [dados, order, orderBy, uo, search, estado, assunto, applySortFilter]
  );
  const isNotFound = !dataFiltered.length;

  const verMais = () => {
    const avancada = localStorage.getItem('tipoPesquisa') === 'avancada';
    dispatch(
      getListaProcessos(avancada ? 'pesquisaAvancada' : 'pesquisaGlobal', {
        cursor,
        item: 'pesquisa',
        fromArquivo: localStorage.getItem('fromArquivo'),
        chave: avancada ? '' : localStorage.getItem('chave'),
        uo: avancada ? localStorage.getItem('uoSearch') : '',
        conta: avancada ? localStorage.getItem('conta') : '',
        entrada: avancada ? localStorage.getItem('entrada') : '',
        cliente: avancada ? localStorage.getItem('cliente') : '',
        entidade: avancada ? localStorage.getItem('entidade') : '',
        noperacao: avancada ? localStorage.getItem('noperacao') : '',
      })
    );
  };

  return (
    <Page title="Pesquisa | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          sx={{ color: 'text.secondary' }}
          heading={
            <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
              <Typography variant="h5">Procura:</Typography>
              {localStorage.getItem('fromArquivo') === 'true' && <Label sx={{ mt: 0.5 }}>Arquivo</Label>}
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
            options={{
              ...{ uo, search, estado, assunto, setUo, setSearch, setEstado, setAssunto },
              ...{ estadosList: dados?.estados, assuntosList: dados?.assuntos, uosorigemList: dados?.uosOrigem },
            }}
          />
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
                <TableBody>
                  {isLoading && isNotFound ? (
                    <SkeletonTable column={7} row={10} />
                  ) : (
                    dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <TableRow hover key={`processo_${row.id}_${index}`}>
                        <TableCell>{`${row.entrada}${row.criado_em ? `/${fYear(row.criado_em)}` : ''}`}</TableCell>
                        <TableCell>{row?.titular ? row.titular : noDados()}</TableCell>
                        <TableCell>{row.conta || row.cliente || row?.entidades || noDados()}</TableCell>
                        <TableCell>{row.assunto}</TableCell>
                        <TableCell>
                          {row.estado}
                          {row?.transitado_em && (
                            <Stack direction="row" useFlexGap flexWrap="wrap">
                              <Criado caption tipo="data" value={ptDateTime(row.transitado_em)} />
                              <Criado
                                caption
                                tipo="time"
                                sx={{ color: 'text.secondary' }}
                                value={fToNow(row.transitado_em)}
                              />
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell sx={{ width: 10 }}>
                          {row?.uo && (
                            <Criado tipo="company" value={row?.tipo === 'Agências' ? `Agência ${row?.uo}` : row?.uo} />
                          )}
                          {row?.criado_em && <Criado caption tipo="data" value={ptDateTime(row.criado_em)} />}
                        </TableCell>
                        <TableCell align="center">
                          <DefaultAction
                            label="DETALHES"
                            onClick={() => navigate(`${PATH_DIGITALDOCS.filaTrabalho.root}/${row?.id}?from=Pesquisa`)}
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
        {page + 1 === Math.ceil(dataFiltered.length / rowsPerPage) && cursor && <MaisProcessos verMais={verMais} />}
      </Container>
    </Page>
  );
}
