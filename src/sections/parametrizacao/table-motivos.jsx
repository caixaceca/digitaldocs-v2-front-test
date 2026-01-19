import { useState, useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
// utils
import { setItemValue } from '../../utils/formatObject';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { openModal, getSuccess, closeModal, getFromParametrizacao } from '../../redux/slices/parametrizacao';
// Components
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { Detalhes } from './Detalhes';
import { applySortFilter } from './applySortFilter';
import { MotivoTransicaoForm, MotivoPendenciaForm } from './ParametrizacaoForm';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableMotivos({ transicao = false }) {
  const dispatch = useDispatch();

  const [fluxo, setFluxo] = useState(null);
  const [filter, setFilter] = useState('');
  const [modo, setModo] = useState('Devolução');

  const { isLoading, isOpenView, isOpenModal, motivosTransicao, motivosPendencia } = useSelector(
    (state) => state.parametrizacao
  );

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
  } = useTable({ defaultOrder: 'asc', defaultOrderBy: 'motivo' });

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transicao, filter]);

  useEffect(() => {
    const item = transicao ? 'motivosTransicao' : 'motivosPendencia';
    dispatch(getFromParametrizacao(item, { fluxoId: fluxo?.id, modo }));
  }, [dispatch, transicao, fluxo, modo]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados: transicao ? motivosTransicao : motivosPendencia,
  });
  const isNotFound = !dataFiltered.length;

  const handleView = (dados, modal) => {
    dispatch(openModal(modal));
    if (transicao) dispatch(getFromParametrizacao('motivoTransicao', { id: dados?.id, item: 'selectedItem' }));
    else dispatch(getSuccess({ item: 'selectedItem', dados }));
  };

  return (
    <>
      <Card sx={{ p: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          {transicao && (
            <Stack direction="row" spacing={1} sx={{ minWidth: 400 }}>
              <Autocomplete
                fullWidth
                value={modo}
                disableClearable
                sx={{ maxWidth: 150 }}
                options={['Devolução', 'Seguimento']}
                onChange={(event, newValue) => setModo(newValue)}
                renderInput={(params) => <TextField {...params} label="Modo" />}
              />
              <Fluxos fluxo={fluxo} setFluxo={setFluxo} />
            </Stack>
          )}
          <Stack sx={{ flexGrow: 1 }}>
            <SearchToolbarSimple filter={filter} setFilter={setFilter} />
          </Stack>
        </Stack>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={[
                  { id: transicao ? 'designacao' : 'motivo', label: 'Motivo' },
                  { id: '', width: 10 },
                ]}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={3} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`motivo_${index}`}>
                      <TableCell>{row?.motivo || row?.designacao}</TableCell>
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          <DefaultAction small label="EDITAR" onClick={() => handleView(row, 'update')} />
                          <DefaultAction small onClick={() => handleView(row, 'view')} label="DETALHES" />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum registo disponível..." />
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        {!isNotFound && dataFiltered.length > 10 && (
          <TablePaginationAlt
            page={page}
            dense={dense}
            rowsPerPage={rowsPerPage}
            count={dataFiltered.length}
            onChangePage={onChangePage}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        )}
      </Card>

      {isOpenView && (
        <Detalhes
          closeModal={() => dispatch(closeModal())}
          item={transicao ? 'motivosTransicao' : 'motivosPendencia'}
        />
      )}
      {isOpenModal && (
        <>
          {!transicao && <MotivoPendenciaForm onClose={() => dispatch(closeModal())} />}
          {transicao && <MotivoTransicaoForm onClose={() => dispatch(closeModal())} />}
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Fluxos({ fluxo = null, setFluxo }) {
  const { fluxos } = useSelector((state) => state.parametrizacao);

  const fluxosList = useMemo(
    () => fluxos?.filter(({ is_ativo: ativo }) => ativo)?.map(({ id, assunto }) => ({ id, label: assunto })) || [],
    [fluxos]
  );

  useEffect(() => {
    if (localStorage.getItem('fluxoRegras'))
      setFluxo(fluxosList.find(({ id }) => Number(id) === Number(localStorage.getItem('fluxoRegras'))) || null);
  }, [fluxosList, setFluxo]);

  return (
    <Autocomplete
      fullWidth
      options={fluxosList}
      value={fluxo || null}
      renderInput={(params) => <TextField {...params} label="Fluxo" />}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      onChange={(event, newValue) => setItemValue(newValue, setFluxo, 'fluxoRegras', true)}
    />
  );
}
