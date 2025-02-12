import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
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
import { fToNow, ptDateTime, formatDate } from '../../utils/formatTime';
import { normalizeText, noDados, baralharString, contaCliEnt } from '../../utils/formatText';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, getSuccess } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import { Criado, Registos } from '../../components/Panel';
import { SkeletonTable } from '../../components/skeleton';
import { AddItem, DefaultAction } from '../../components/Actions';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarProcessos } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'entrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'estado', label: 'Estado', align: 'left' },
  { id: 'transitado_em', label: 'Última transição', align: 'center', width: 170 },
  { id: '', width: 10 },
];

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
  const [filter, setFilter] = useState(localStorage.getItem('filterP') || '');
  const [motivo, setMotivo] = useState(localStorage.getItem('motivoP') || null);
  const [segmento, setSegmento] = useState(localStorage.getItem('segmento') || null);
  const { mail, perfilId, colaboradores } = useSelector((state) => state.intranet);
  const { isLoading, processosInfo, processos } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes, colaboradoresGestor, meuAmbiente, meuFluxo } = useSelector((state) => state.parametrizacao);
  const fluxoId = useMemo(() => meuFluxo?.id, [meuFluxo?.id]);
  const estadoId = useMemo(() => meuAmbiente?.id, [meuAmbiente?.id]);
  const motivosList = useMemo(() => (from === 'Pendentes' ? dadosList(processos) : []), [from, processos]);
  const colaboradoresList = useMemo(
    () =>
      colaboradores
        ?.filter((row) => colaboradoresGestor?.includes(row?.perfil_id))
        ?.map((item) => ({ id: item?.perfil_id, label: item?.perfil?.displayName })),
    [colaboradores, colaboradoresGestor]
  );
  const [colaborador, setColaborador] = useState(
    colaboradoresList?.find((row) => row?.id === Number(localStorage.getItem('colaboradorP'))) ||
      colaboradoresList?.find((row) => row?.id === perfilId) ||
      null
  );
  const colaboradorId = useMemo(() => colaborador?.id, [colaborador?.id]);

  useEffect(() => {
    if (colaboradoresList?.includes(colaborador?.id)) {
      setColaborador(colaboradoresList?.find((row) => row?.id === perfilId));
    }
  }, [colaborador?.id, colaboradoresList, perfilId]);

  useEffect(() => {
    if (meusAmbientes?.length > 0) {
      dispatch(getSuccess({ item: 'processos', dados: [] }));
      dispatch(getAll(from, { fluxoId, estadoId, colaboradorId, segmento, pagina: 0 }));
    }
  }, [dispatch, estadoId, fluxoId, colaboradorId, segmento, from, meusAmbientes?.length]);

  const dataFiltered = applySortFilter({
    from,
    motivo,
    filter,
    dados: processos,
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, segmento, colaborador?.id, meuAmbiente?.id, meuFluxo?.id]);

  const verMais = () => {
    dispatch(
      getAll(from, {
        mail,
        fluxoId,
        estadoId,
        perfilId,
        segmento,
        colaboradorId,
        pagina: processosInfo?.proxima_pagina,
      })
    );
  };

  return (
    <>
      <HeaderBreadcrumbs
        heading={from}
        sx={{ px: 1 }}
        action={
          <Stack direction="row" spacing={1.5}>
            <Registos info={processosInfo} total={processos?.length} handleClick={() => verMais()} />
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
                  <SkeletonTable column={7} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${row?.id}_${index}`}>
                      <TableCell>
                        {row?.entrada}
                        {row?.criado_em ? `/${formatDate(row?.criado_em, 'yyyy')}` : ''}
                      </TableCell>
                      <TableCell>{row?.titular ? baralharString(row?.titular) : noDados()}</TableCell>
                      <TableCell>{contaCliEnt(row)}</TableCell>
                      <TableCell>{row?.assunto ? row?.assunto : meuFluxo?.assunto}</TableCell>
                      <TableCell sx={{ maxWidth: 400 }}>
                        {row?.estado && <Typography variant="body2">{row?.estado}</Typography>}
                        {row?.motivo && <Label>{row?.motivo}</Label>}
                        {row?.observacao && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                            {row?.observacao}
                          </Typography>
                        )}
                      </TableCell>
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
    if (row?.observacao === 'Para levantamento do pedido' && !motivosList.includes('Levantamento do pedido')) {
      motivosList.push('Levantamento do pedido');
    } else if (row?.motivo && !motivosList.includes(row?.motivo)) {
      motivosList.push(row?.motivo);
    }
  });
  return motivosList;
}

// ----------------------------------------------------------------------

function applySortFilter({ dados, comparator, filter, motivo, from }) {
  dados = applySort(dados, comparator);

  if (from === 'Pendentes' && motivo === 'Levantamento do pedido') {
    dados = dados.filter((row) => row?.observacao && row?.observacao === 'Para levantamento do pedido');
  }

  if (from === 'Pendentes' && motivo && motivo !== 'Levantamento do pedido') {
    dados = dados.filter(
      (row) => row?.motivo && row?.motivo === motivo && row?.observacao !== 'Para levantamento do pedido'
    );
  }

  if (filter) {
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
  }

  return dados;
}

export function colorProcesso(cor) {
  return (
    (cor?.toLowerCase() === 'verde' && 'text.success') ||
    (cor?.toLowerCase() === 'vermelha' && 'text.error') ||
    (cor?.toLowerCase() === 'amarela' && 'text.warning')
  );
}
