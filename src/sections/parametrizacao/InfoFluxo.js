import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fPercent } from '../../utils/formatNumber';
import { transicoesList } from '../../utils/formatObject';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao, openModal, getSuccess } from '../../redux/slices/parametrizacao';
// Components
import Label from '../../components/Label';
import Markdown from '../../components/Markdown';
import Scrollbar from '../../components/Scrollbar';
import { CellChecked } from '../../components/Panel';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { UpdateItem, DefaultAction } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import {
  FluxoForm,
  ChecklistForm,
  TransicaoForm,
  ClonarFluxoForm,
  NotificacaoForm,
  RegraTransicaoForm,
} from './ParametrizacaoForm';
import { applySortFilter } from './applySortFilter';
import { Detalhes, DetalhesContent } from './Detalhes';
import { dadosComColaborador, EstadoDetail } from './TableParametrizacao';

// ----------------------------------------------------------------------

InfoFluxo.propTypes = { onClose: PropTypes.func };

export default function InfoFluxo({ onClose }) {
  const { fluxo, isOpenView, isOpenModal } = useSelector((state) => state.parametrizacao);

  return (
    <>
      <Card sx={{ p: 3, pt: 1 }}>
        <DetalhesContent dados={fluxo} item="Fluxo" />
      </Card>
      {isOpenModal && <FluxoForm onCancel={() => onClose()} />}
      {isOpenView && <ClonarFluxoForm onCancel={() => onClose()} />}
    </>
  );
}

// ----------------------------------------------------------------------

TableInfoFluxo.propTypes = { item: PropTypes.string, transicao: PropTypes.object, onClose: PropTypes.func };

export function TableInfoFluxo({ item, transicao = null, onClose }) {
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
    defaultOrder: item === 'transicoes' ? 'desc' : 'asc',
    defaultOrderBy: item === 'transicoes' ? 'id' : 'nome',
  });
  const dispatch = useDispatch();
  const { colaboradores, uos } = useSelector((state) => state.intranet);
  const [filter, setFilter] = useState(localStorage.getItem(`filter_${item}`) || '');
  const { fluxo, estados, checklist, notificacoes, regrasTransicao, isOpenModal, isOpenView, isLoading } = useSelector(
    (state) => state.parametrizacao
  );

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados:
      (item === 'checklist' && checklist) ||
      (item === 'notificacoes' && notificacoes) ||
      (item === 'estados' && estadosList(fluxo?.transicoes, estados, uos)) ||
      (item === 'transicoes' && transicoesList(fluxo?.transicoes, estados)) ||
      (item === 'regrasTransicao' && dadosComColaborador(regrasTransicao, colaboradores)) ||
      [],
  });
  const isNotFound = !dataFiltered.length;

  const handleView = (dados) => {
    dispatch(openModal('view'));
    if (item === 'notificacoes' && dados?.id) {
      dispatch(getFromParametrizacao('destinatarios', { id: dados?.id }));
    }
    if (item === 'checklist') {
      dispatch(getFromParametrizacao('checklistitem', { id: dados?.id }));
    } else {
      dispatch(getSuccess({ item: 'selectedItem', dados }));
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
                  <SkeletonTable column={(item === 'transicoes' && 5) || (item === 'checklist' && 3) || 4} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      {(item === 'transicoes' && (
                        <>
                          <TableCell>{row.estado_inicial}</TableCell>
                          <TableCell>{row.estado_final}</TableCell>
                          <TableCell align="center">
                            <Label color={row?.modo === 'Seguimento' ? 'success' : 'error'}>{row?.modo}</Label>
                          </TableCell>
                          <TableCell align="center">
                            {row.prazoemdias > 1 ? `${row.prazoemdias} dias` : `${row.prazoemdias} dia`}
                          </TableCell>
                        </>
                      )) ||
                        (item === 'estados' && <EstadoDetail row={row} />) ||
                        (item === 'checklist' && <TableCell>{row?.designacao || row?.tipo_documento}</TableCell>) ||
                        (item === 'notificacoes' && (
                          <>
                            <TableCell>{row.assunto}</TableCell>
                            <TableCell>
                              <Markdown own children={row.corpo} />
                            </TableCell>
                            <TableCell>{row.via}</TableCell>
                          </>
                        )) ||
                        (item === 'regrasTransicao' && (
                          <>
                            <TableCell>{row.nome}</TableCell>
                            <TableCell align="center">{fPercent(row.percentagem)}</TableCell>
                          </>
                        ))}
                      {(item === 'checklist' || item === 'regrasTransicao') && <CellChecked check={row.ativo} />}
                      {item !== 'estados' && (
                        <TableCell align="center" width={50}>
                          <Stack direction="row" spacing={0.5} justifyContent="right">
                            {fluxo?.is_ativo && (
                              <>
                                {(item === 'transicoes' || item === 'notificacoes') && (
                                  <UpdateItem dados={{ dados: row }} />
                                )}
                                {item === 'checklist' && <UpdateItem dados={{ item: 'checklistitem', id: row?.id }} />}
                              </>
                            )}
                            <DefaultAction handleClick={() => handleView(row)} label="DETALHES" />
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

      {isOpenView && <Detalhes item={item} closeModal={() => onClose()} />}
      {isOpenModal && (
        <>
          {item === 'checklist' && <ChecklistForm onCancel={() => onClose()} fluxo={fluxo} />}
          {item === 'transicoes' && <TransicaoForm onCancel={() => onClose()} fluxoId={fluxo?.id} />}
          {item === 'regrasTransicao' && <RegraTransicaoForm onCancel={() => onClose()} transicao={transicao} />}
          {item === 'notificacoes' && (
            <NotificacaoForm onCancel={() => onClose()} transicao={transicao} fluxo={fluxo} />
          )}
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function estadosList(transicoes, estados, uos) {
  const estadosId = [];
  const estadosL = [];
  transicoes?.forEach((row) => {
    if (!estadosId.includes(row?.estado_inicial_id)) {
      estadosId.push(row.estado_inicial_id);
      const estado = estados.find((_row) => _row?.id === row?.estado_inicial_id);
      estadosL.push({ ...estado, uo: uos?.find((item) => item?.id === estado?.uo_id)?.label || estado?.uo_id });
    }
    if (!estadosId.includes(row?.estado_final_id)) {
      estadosId.push(row.estado_final_id);
      const estado = estados.find((_row) => _row?.id === row?.estado_final_id);
      estadosL.push({ ...estado, uo: uos?.find((item) => item?.id === estado?.uo_id)?.label || estado?.uo_id });
    }
  });
  return estadosL;
}

function headerTable(item) {
  return [
    ...((item === 'transicoes' && [
      { id: 'estado_inicial', label: 'Origem', align: 'left' },
      { id: 'estado_final', label: 'Destino', align: 'left' },
      { id: 'modo', label: 'Modo', align: 'center' },
      { id: 'prazoemdias', label: 'Prazo', align: 'center' },
    ]) ||
      (item === 'estados' && [
        { id: 'nome', label: 'Nome', align: 'left' },
        { id: 'uo', label: 'U.O', align: 'left' },
        { id: 'is_inicial', label: 'Inicial', align: 'center' },
        { id: 'is_final', label: 'Final', align: 'center' },
      ]) ||
      (item === 'checklist' && [
        { id: 'designacao	', label: 'Designação', align: 'left' },
        { id: 'ativo', label: 'Ativo', align: 'center' },
      ]) ||
      (item === 'notificacoes' && [
        { id: 'assunto', label: 'Assunto', align: 'left' },
        { id: 'corpo', label: 'Corpo', align: 'left' },
        { id: 'via', label: 'Via', align: 'left' },
      ]) ||
      (item === 'regrasTransicao' && [
        { id: 'nome', label: 'Colaborador', align: 'left' },
        { id: 'percentagem', label: 'Percentagem', align: 'center' },
        { id: 'ativo', label: 'Ativo', align: 'center' },
      ]) ||
      []),
    ...(item !== 'estados' ? [{ id: '', width: 10 }] : []),
  ];
}
