import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { estadoInicial } from '../../utils/validarAcesso';
import { fToNow, ptDateTime } from '../../utils/formatTime';
import { normalizeText, entidadesParse, noDados, shuffleString } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, resetItem, selectItem } from '../../redux/slices/digitaldocs';
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
//
import { ColocarPendente } from '../processo/form/IntervencaoForm';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nentrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'estado', label: 'Estado', align: 'left' },
  { id: 'transitado_em', label: 'Última transição', align: 'center', width: 170 },
  { id: 'empty', width: 50 },
];

// ----------------------------------------------------------------------

TableProcessos.propTypes = { from: PropTypes.string };

export default function TableProcessos({ from }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const { isLoading, processosInfo, processos } = useSelector((state) => state.digitaldocs);
  const [filter, setFilter] = useState(localStorage.getItem('filterP') || '');
  const [motivo, setMotivo] = useState(localStorage.getItem('motivoP') || null);
  const [segmento, setSegmento] = useState(localStorage.getItem('segmento') || null);
  const { meuAmbiente, meusAmbientes, meuFluxo } = useSelector((state) => state.parametrizacao);
  const fluxoId = meuFluxo?.id;
  const perfilId = cc?.perfil_id;
  const estadoId = meuAmbiente?.id;
  const fromAgencia = cc?.uo?.tipo === 'Agências';
  const title =
    (from === 'tarefas' && 'Lista de tarefas') ||
    (from === 'finalizados' && 'Finalizados') ||
    (from === 'executados' && 'Executados') ||
    (from === 'atribuidos' && 'Atribuídos') ||
    (from === 'agendados' && 'Agendados') ||
    (from === 'pendentes' && 'Pendentes') ||
    (from === 'retidos' && 'Retidos') ||
    from;

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
    defaultRowsPerPage: Number(localStorage.getItem('rowsPerPage') || (fromAgencia && 100) || 25),
  });

  useEffect(() => {
    if (mail && perfilId) {
      dispatch(resetItem('processos'));
      dispatch(getAll(from, { mail, fluxoId, estadoId, perfilId, segmento, pagina: 0 }));
    }
  }, [dispatch, estadoId, fluxoId, perfilId, segmento, from, mail]);

  const newList = [];
  const colaboradoresList = [];
  processos?.forEach((row) => {
    const colaborador = colaboradores?.find((colaborador) => Number(colaborador.perfil_id) === Number(row?.perfil_id));
    if (colaborador && !colaboradoresList.includes(colaborador?.perfil?.displayName)) {
      colaboradoresList.push(colaborador?.perfil?.displayName);
    }
    newList.push({ ...row, colaborador: colaborador?.perfil?.displayName || '' });
  });
  const [colaborador, setColaborador] = useState(
    colaboradoresList?.find((row) => row === localStorage.getItem('colaboradorP')) || null
  );

  const dataFiltered = applySortFilter({
    from,
    motivo,
    filter,
    newList,
    colaborador,
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, segmento, colaborador, meuAmbiente?.id, meuFluxo?.id]);

  const verMais = () => {
    if (mail && perfilId && processosInfo?.proxima_pagina) {
      dispatch(getAll(from, { mail, fluxoId, estadoId, perfilId, segmento, pagina: processosInfo?.proxima_pagina }));
    }
  };

  const handleAdd = () => {
    navigate(PATH_DIGITALDOCS.processos.novoProcesso);
  };

  const handleView = (id, isCC) => {
    if (isCC) {
      navigate(`${PATH_DIGITALDOCS.processos.root}/cc/${id}`);
    } else {
      navigate(`${PATH_DIGITALDOCS.processos.root}/${id}`);
    }
  };

  const handlePendente = (item) => {
    dispatch(selectItem(item));
  };

  return (
    <>
      <HeaderBreadcrumbs
        heading={title}
        links={[{ name: '' }]}
        sx={{ color: 'text.secondary', px: 1 }}
        action={
          <Stack direction="row" spacing={1.5}>
            <Registos info={processosInfo} total={processos?.length} handleClick={verMais} />
            {estadoInicial(meusAmbientes) && <AddItem button handleClick={handleAdd} />}
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
          setSegmento={setSegmento}
          colaborador={colaborador}
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
                      <TableCell>{row?.entrada}</TableCell>
                      <TableCell>{row?.titular ? shuffleString(row?.titular) : noDados()}</TableCell>
                      <TableCell>
                        {(row?.conta && shuffleString(row?.conta)) ||
                          (row?.cliente && shuffleString(row?.cliente)) ||
                          (row?.entidades && shuffleString(entidadesParse(row?.entidades))) ||
                          noDados()}
                      </TableCell>
                      <TableCell>{row?.assunto ? row?.assunto : meuFluxo?.assunto}</TableCell>
                      <TableCell>
                        {row?.estado && <Typography variant="body2">{row?.estado}</Typography>}
                        {row?.motivo && <Label>{row?.motivo}</Label>}
                        {row?.observacao && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                            {row?.observacao}
                          </Typography>
                        )}
                        {row?.colaborador && <Label>{shuffleString(row?.colaborador)}</Label>}
                      </TableCell>
                      <TableCell align="center" sx={{ width: 10 }}>
                        {row?.transitado_em && (
                          <>
                            <Criado tipo="date" value={ptDateTime(row?.transitado_em)} />
                            <Criado
                              tipo="time"
                              value={fToNow(row?.transitado_em)}
                              sx={{ color: colorProcesso(row?.cor) }}
                            />
                          </>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {from === 'tarefas' && row?.estado?.includes('Atendimento') && (
                            <DefaultAction color="inherit" label="PENDENTE" handleClick={() => handlePendente(row)} />
                          )}
                          <DefaultAction
                            label="DETALHES"
                            handleClick={() => handleView(row?.id, row?.credito_colaborador)}
                          />
                        </Stack>
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
      <ColocarPendente />
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ newList, comparator, filter, colaborador, motivo, from }) {
  newList = applySort(newList, comparator);

  if ((from === 'atribuidos' || from === 'retidos') && colaborador) {
    newList = newList.filter((row) => row?.colaborador === colaborador);
  }

  if (from === 'pendentes' && motivo === 'Levantamento do pedido') {
    newList = newList.filter(
      (row) =>
        row?.assunto?.includes('Cartão') ||
        row?.assunto?.includes('Extrato') ||
        row?.assunto?.includes('Declarações') ||
        row?.assunto?.includes('Cheques - Requisição')
    );
  }

  if (from === 'pendentes' && motivo === 'Outros') {
    newList = newList.filter(
      (row) =>
        !row?.assunto?.includes('Cartão') &&
        !row?.assunto?.includes('Extrato') &&
        !row?.assunto?.includes('Declarações') &&
        !row?.assunto?.includes('Cheques - Requisição')
    );
  }

  if (filter) {
    newList = newList.filter(
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

  return newList;
}

export function colorProcesso(cor) {
  return (
    (cor?.toLowerCase() === 'verde' && 'text.success') ||
    (cor?.toLowerCase() === 'vermelha' && 'text.error') ||
    (cor?.toLowerCase() === 'amarela' && 'text.warning')
  );
}
