import PropTypes from 'prop-types';
import { useEffect, useState, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { transicoesList, transicaoDesc } from '../../utils/formatObject';
// hooks
import useTable, { applySort, getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao, getSuccess, setModal } from '../../redux/slices/parametrizacao';
// Components
import Markdown from '../../components/Markdown';
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { CellChecked, noDados } from '../../components/Panel';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { applySortFilter } from './applySortFilter';
import { EstadoDetail } from './TableParametrizacao';

// ----------------------------------------------------------------------

TableInfoFluxo.propTypes = { item: PropTypes.string };

export default function TableInfoFluxo({ item }) {
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
  } = useTable({});
  const dispatch = useDispatch();
  const { uos } = useSelector((state) => state.intranet);
  const [filter, setFilter] = useState(localStorage.getItem(`filter_${item}`) || '');
  const { fluxo, estados, checklist, notificacoes, isLoading } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    setFilter(localStorage.getItem(`filter_${item}`) || '');
  }, [item]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);
  const transicoes = useMemo(() => transicoesList(fluxo?.transicoes, estados, false), [estados, fluxo?.transicoes]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados:
      (item === 'checklist' && checklist) ||
      (item === 'notificacoes' && notificacoes) ||
      (item === 'estados' && estadosList(fluxo?.transicoes, estados, uos)) ||
      [],
  });
  const isNotFound = !dataFiltered.length;

  const openModal = (modal, dados) => {
    const id = dados?.id;
    const dadosModal = item === 'notificacoes' || modal === 'eliminar-item' ? dados : null;
    dispatch(setModal({ item: modal, isEdit: true, dados: dadosModal }));
    if (modal !== 'eliminar-item') {
      if (item === 'checklist') dispatch(getFromParametrizacao('checklistitem', { id, item: 'selectedItem' }));
      if (item === 'notificacoes') {
        dispatch(getSuccess({ item: 'destinatarios', dados: [] }));
        dispatch(getFromParametrizacao('destinatarios', { id }));
      }
    }
  };

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item={`filter_${item}`} filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(item)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={(item === 'notificacoes' && 4) || 5} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      {(item === 'estados' && <EstadoDetail row={row} />) ||
                        (item === 'checklist' && (
                          <>
                            <TableCell>{row?.designacao || row?.tipo_documento}</TableCell>
                            <TableCell>
                              {transicaoDesc(transicoes?.find(({ id }) => id === row?.transicao_id)) ||
                                noDados('(Não definido)')}
                            </TableCell>
                            <CellChecked check={row.obrigatorio} />
                          </>
                        )) ||
                        (item === 'notificacoes' && (
                          <>
                            <TableCell>
                              <Markdown own children={row.corpo} />
                            </TableCell>
                            <TableCell>{row.via}</TableCell>
                          </>
                        ))}
                      {(item === 'checklist' || item === 'notificacoes') && <CellChecked check={row.ativo} />}
                      {item !== 'estados' && (
                        <TableCell align="center" width={50}>
                          <Stack direction="row" spacing={0.5} justifyContent="right">
                            {fluxo?.is_ativo && (
                              <>
                                {item !== 'checklist' && (
                                  <DefaultAction
                                    small
                                    label="ELIMINAR"
                                    onClick={() => openModal('eliminar-item', row)}
                                  />
                                )}
                                <DefaultAction small label="EDITAR" onClick={() => openModal(`form-${item}`, row)} />
                              </>
                            )}
                            <DefaultAction small label="DETALHES" onClick={() => openModal('detalhes-fluxo', row)} />
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
              {!isLoading && isNotFound && <TableSearchNotFound message="Nenhum registo disponível.." />}
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

export function estadosList(dados = [], estados = [], uos = []) {
  const estadosProcessados = new Set();
  const estadosLista = [];

  const estadosMap = new Map(estados.map((estado) => [estado.id, estado]));
  const uosMap = new Map(uos.map((uo) => [uo.id, { label: uo.label, balcao: uo.balcao }]));

  const processarEstado = (id) => {
    if (!id || estadosProcessados.has(id)) return;

    const estado = estadosMap.get(id);
    if (!estado) return;

    const uoData = uosMap.get(estado.uo_id) ?? { label: estado.uo_id, balcao: null };
    estadosLista.push({ ...estado, uo: uoData.label, balcao: uoData.balcao });
    estadosProcessados.add(id);
  };

  dados.forEach(({ estado_inicial_id: ei, estado_final_id: ef }) => {
    processarEstado(ei);
    processarEstado(ef);
  });

  return applySort(estadosLista, getComparator('asc', 'label'));
}

function headerTable(item) {
  const estados = [
    { id: 'nome', label: 'Nome' },
    { id: 'uo', label: 'U.O' },
    { id: 'balcao', label: 'Nº de balcão' },
    { id: 'is_inicial', label: 'Inicial', align: 'center' },
    { id: 'is_final', label: 'Final', align: 'center' },
  ];
  const checklist = [
    { id: 'designacao	', label: 'Designação' },
    { id: '', label: 'Transição' },
    { id: 'obrigatorio', label: 'Obrigatório', align: 'center' },
    { id: 'ativo', label: 'Ativo', align: 'center' },
  ];
  const notificacoes = [
    { id: 'corpo', label: 'Corpo' },
    { id: 'via', label: 'Via' },
    { id: 'ativo', label: 'Ativo', align: 'center' },
  ];

  const header = [
    ...((item === 'estados' && estados) ||
      (item === 'checklist' && checklist) ||
      (item === 'notificacoes' && notificacoes) ||
      []),
    ...(item !== 'estados' ? [{ id: '', width: 10 }] : []),
  ];

  return header;
}
