import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fToNow, ptDateTime } from '../../utils/formatTime';
import { normalizeText, noDados, baralharString, contaCliEnt } from '../../utils/formatText';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getListaProcessos } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import { Criado } from '../../components/Panel';
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { AddItem, DefaultAction } from '../../components/Actions';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarProcessos } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

// ----------------------------------------------------------------------

TableProcessos.propTypes = { from: PropTypes.string };

export default function TableProcessos({ from }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    page,
    dense,
    order,
    onSort,
    orderBy,
    setPage,
    rowsPerPage,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrder: 'asc',
    defaultOrderBy: 'transitado_em',
    defaultRowsPerPage: Number(localStorage.getItem('rowsPerPage') || 25),
  });
  const [colaborador, setColaborador] = useState(null);
  const [filter, setFilter] = useState(localStorage.getItem('filterP') || '');
  const [motivo, setMotivo] = useState(localStorage.getItem('motivoP') || null);
  const [segmento, setSegmento] = useState(localStorage.getItem('segmento') || null);

  const { colaboradores } = useSelector((state) => state.intranet);
  const { isLoading, processosInfo, processos } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes, meuAmbiente, meuFluxo } = useSelector((state) => state.parametrizacao);

  const perfisProcessos = useMemo(() => [...new Set(processos.map((p) => p.perfil_id))], [processos]);
  const motivosList = useMemo(() => (from === 'Pendentes' ? dadosList(processos) : []), [from, processos]);
  const colaboradoresList = useMemo(
    () =>
      colaboradores
        ?.filter((row) => perfisProcessos?.includes(row?.perfil_id))
        ?.map((item) => ({ id: item?.perfil_id, label: item?.nome })),
    [colaboradores, perfisProcessos]
  );

  const carregarProcessos = useCallback(
    (item, estadoId, fluxoId, segmento, perfilId, cursor) => {
      dispatch(
        getListaProcessos(item, {
          cursor,
          item: 'processos',
          segmento: item === 'Tarefas' && segmento ? segmento : '',
          fluxoId: (item === 'Tarefas' || item === 'Pendentes') && fluxoId ? fluxoId : '',
          estadoId: (item === 'Tarefas' || item === 'Pendentes') && estadoId ? estadoId : '',
          perfilId: (item === 'Atribuídos' || item === 'Retidos') && perfilId ? perfilId : '',
          situacao: { Agendados: 'agendado', Executados: 'executado', Finalizados: 'finalizado' }[item] || '',
        })
      );
    },
    [dispatch]
  );

  useEffect(() => {
    if (meusAmbientes?.length > 0) carregarProcessos(from, meuAmbiente?.id, meuFluxo?.id, segmento, colaborador?.id, 0);
  }, [dispatch, carregarProcessos, from, segmento, colaborador?.id, meuAmbiente?.id, meuFluxo?.id, meusAmbientes]);

  const dataFiltered = applySortFilter({
    from,
    motivo,
    filter,
    comparator: getComparator(order, orderBy),
    dados: processos?.map((row) => ({
      ...row,
      colaborador: colaboradores?.find(({ perfil_id: pid }) => row?.perfil_id === pid)?.nome,
    })),
  });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, segmento, colaborador?.id, meuAmbiente?.id, meuFluxo?.id]);

  const verMais = () => {
    carregarProcessos(from, meuAmbiente?.id, meuFluxo?.id, segmento, colaborador?.id, processosInfo);
  };

  // ----------------------------------------------------------------------

  const TABLE_HEAD = [
    { id: 'entrada', label: 'Nº', align: 'right', width: 10 },
    { id: 'titular', label: 'Titular' },
    { id: 'entidades', label: 'Cliente/Entidade' },
    { id: 'assunto', label: 'Assunto' },
    { id: 'estado', label: 'Estado' },
    ...(from === 'Pendentes' ? [{ id: 'motivo', label: 'Motivo' }] : []),
    { id: 'transitado_em', label: 'Última transição', align: 'center', width: 170 },
    { id: '', width: 10 },
  ];

  return (
    <>
      <HeaderBreadcrumbs
        heading={from}
        sx={{ px: 1 }}
        action={
          <Stack direction="row" spacing={1.5}>
            {processosInfo && <DefaultAction button label="Mais processos" handleClick={() => verMais()} />}
            {!meuAmbiente?.observador && meuAmbiente?.isinicial && (
              <AddItem button handleClick={() => navigate(PATH_DIGITALDOCS.filaTrabalho.novoProcesso)} />
            )}
          </Stack>
        }
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarProcessos
          tab={from}
          motivo={motivo}
          filter={filter}
          segmento={segmento}
          setMotivo={setMotivo}
          setFilter={setFilter}
          meuAmbiente={meuAmbiente}
          setSegmento={setSegmento}
          colaborador={colaborador}
          motivosList={motivosList}
          setColaborador={setColaborador}
          colaboradoresList={colaboradoresList}
        />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={TABLE_HEAD} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={from === 'Pendentes' || from === 'Atribuídos' ? 8 : 7} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${row?.id}_${index}`}>
                      <TableCell align="right">{row?.entrada}</TableCell>
                      <TableCell>{row?.titular ? baralharString(row?.titular) : noDados()}</TableCell>
                      <TableCell>{contaCliEnt(row)}</TableCell>
                      <TableCell>{row?.assunto ? row?.assunto : meuFluxo?.assunto}</TableCell>
                      <TableCell>{row?.estado}</TableCell>
                      {from === 'Pendentes' && (
                        <TableCell sx={{ maxWidth: { xs: 400, lg: 300 } }}>
                          {row?.motivo && <Typography variant="body2">{row?.motivo}</Typography>}
                          {row?.observacao && (
                            <Typography sx={{ typography: 'caption', color: 'text.secondary' }}>
                              {row?.observacao}
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      <TableCell align="center" sx={{ width: 10 }}>
                        {row?.transitado_em && (
                          <>
                            <Criado caption tipo="data" value={ptDateTime(row?.transitado_em)} />
                            <Criado
                              caption
                              tipo="time"
                              value={fToNow(row?.transitado_em)}
                              sx={{ color: colorProcesso(row?.cor) }}
                            />
                          </>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <DefaultAction
                          label="DETALHES"
                          handleClick={() => navigate(`${PATH_DIGITALDOCS.filaTrabalho.root}/${row?.id}`)}
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
    </>
  );
}

// ----------------------------------------------------------------------

function dadosList(processos) {
  const motivosList = [];
  processos?.forEach((row) => {
    if (row?.observacao === 'Para levantamento do pedido' && !motivosList.includes('Levantamento do pedido'))
      motivosList.push('Levantamento do pedido');
    else if (row?.motivo && !motivosList.includes(row?.motivo)) motivosList.push(row?.motivo);
  });
  return motivosList;
}

// ----------------------------------------------------------------------

function applySortFilter({ dados, comparator, filter, motivo, from }) {
  dados = applySort(dados, comparator);

  if (from === 'Pendentes' && motivo === 'Levantamento do pedido')
    dados = dados.filter((row) => row?.observacao && row?.observacao === 'Para levantamento do pedido');

  if (from === 'Pendentes' && motivo && motivo !== 'Levantamento do pedido')
    dados = dados.filter(
      (row) => row?.motivo && row?.motivo === motivo && row?.observacao !== 'Para levantamento do pedido'
    );

  if (filter)
    dados = dados.filter(
      (row) =>
        (row?.conta && normalizeText(row?.conta).indexOf(normalizeText(filter)) !== -1) ||
        (row?.motivo && normalizeText(row?.motivo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.entrada && normalizeText(row?.entrada).indexOf(normalizeText(filter)) !== -1) ||
        (row?.assunto && normalizeText(row?.assunto).indexOf(normalizeText(filter)) !== -1) ||
        (row?.cliente && normalizeText(row?.cliente).indexOf(normalizeText(filter)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(filter)) !== -1) ||
        (row?.entidades && normalizeText(row?.entidades).indexOf(normalizeText(filter)) !== -1)
    );

  return dados;
}

export function colorProcesso(cor) {
  return (
    (cor?.toLowerCase() === 'verde' && 'text.success') ||
    (cor?.toLowerCase() === 'vermelha' && 'text.error') ||
    (cor?.toLowerCase() === 'amarela' && 'text.warning')
  );
}
