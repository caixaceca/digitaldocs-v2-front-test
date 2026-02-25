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
import { transicoesList } from '../../utils/formatObject';
// hooks
import useTable, { applySort, getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao, setModal } from '../../redux/slices/parametrizacao';
// Components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchTransicao } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableTransicoes() {
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
  } = useTable({ defaultOrder: 'desc', defaultOrderBy: 'id' });
  const dispatch = useDispatch();
  const [modo, setModo] = useState(localStorage.getItem('modoTransicao') || null);
  const [origem, setOrigem] = useState(localStorage.getItem('origemTransicao') || null);
  const [destino, setDestino] = useState(localStorage.getItem('destinoTransicao') || null);

  const { fluxo, estados, isLoading } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, origem, destino]);

  const transicoes = useMemo(() => transicoesList(fluxo?.transicoes, estados, false), [estados, fluxo?.transicoes]);
  const estadosList = useMemo(
    () => [...new Set(transicoes.flatMap((item) => [item.estado_inicial, item.estado_final]))],
    [transicoes]
  );

  const dataFiltered = applySortFilter({
    comparator: getComparator(order, orderBy),
    ...{ modo, origem, destino, dados: transicoes },
  });
  const isNotFound = !dataFiltered.length;

  const openModal = (modal, dados) => {
    const id = dados?.id;
    const dadosModal = modal === 'eliminar-item' ? dados : null;
    dispatch(setModal({ item: modal, isEdit: true, dados: dadosModal }));
    if (modal !== 'eliminar-item') dispatch(getFromParametrizacao('transicao', { id, item: 'selectedItem' }));
  };

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchTransicao options={{ modo, origem, destino, setModo, setOrigem, setDestino, estadosList }} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={[
                  { id: 'estado_inicial', label: 'Origem' },
                  { id: 'estado_final', label: 'Destino' },
                  { id: 'modo', label: 'Modo', align: 'center' },
                  { id: 'prazoemdias', label: 'Prazo', align: 'center' },
                  { id: '', width: 10 },
                ]}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={5} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`transicao_${index}`}>
                      <TableCell>{row.estado_inicial}</TableCell>
                      <TableCell>{row.estado_final}</TableCell>
                      <TableCell align="center">
                        <Label
                          color={
                            (row?.is_after_devolucao && 'info') || (row?.modo === 'Seguimento' && 'success') || 'error'
                          }
                        >
                          {`${row?.modo}${row?.is_after_devolucao ? ' - DD' : ''}`}
                        </Label>
                      </TableCell>
                      <TableCell align="center">
                        {row.prazoemdias > 1 ? `${row.prazoemdias} dias` : `${row.prazoemdias} dia`}
                      </TableCell>
                      <TableCell align="center" width={50}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          <DefaultAction small label="ELIMINAR" onClick={() => openModal('eliminar-item', row)} />
                          <DefaultAction small label="EDITAR" onClick={() => openModal('form-transicoes', row)} />
                          <DefaultAction small label="DETALHES" onClick={() => openModal('detalhes-fluxo', row)} />
                        </Stack>
                      </TableCell>
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

// ---------------------------------------------------------------------------------------------------------------------

export function applySortFilter({ dados, modo, origem, destino, comparator }) {
  dados = applySort(dados, comparator);

  if (modo === 'Seguimento depois devolução')
    dados = dados?.filter(({ is_after_devolucao: dd, modo: modoRow }) => dd && modoRow === 'Seguimento');
  else if (modo) dados = dados?.filter(({ is_after_devolucao: dd, modo: modoRow }) => !dd && modoRow === modo);
  if (origem) dados = dados?.filter(({ estado_inicial: estadoInicial }) => estadoInicial === origem);
  if (destino) dados = dados?.filter(({ estado_final: estadoFinal }) => estadoFinal === destino);

  return dados;
}
