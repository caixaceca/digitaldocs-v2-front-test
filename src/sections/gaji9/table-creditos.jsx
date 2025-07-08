import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fCurrency } from '../../utils/formatNumber';
import { UosAcesso } from '../../utils/validarAcesso';
import { setItemValue } from '../../utils/formatObject';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, getSuccess, setModal } from '../../redux/slices/gaji9';
// Components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { noDados, newLineText } from '../../components/Panel';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { DefaultAction, MaisProcessos } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { PropostaForm } from './form-credito';
import { applySortFilter, labelTitular } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableCredito() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [balcao, setBalcao] = useState(null);
  const [filter, setFilter] = useState(localStorage.getItem('filterCredito') || '');
  const [codigo, setCodigo] = useState(localStorage.getItem('codioContrato') || '');
  const [cliente, setCliente] = useState(localStorage.getItem('clienteCredito') || '');
  const [proposta, setProposta] = useState(localStorage.getItem('propostaContrato') || '');

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
  } = useTable({ defaultOrderBy: 'designacao', defaultOrder: 'asc' });

  const { cc, uos } = useSelector((state) => state.intranet);
  const { isAdmin, isAuditoria } = useSelector((state) => state.parametrizacao);
  const { isLoading, modalGaji9, creditos, infoPag } = useSelector((state) => state.gaji9);

  const balcoes = useMemo(
    () =>
      UosAcesso(
        uos?.filter(({ tipo }) => tipo === 'Agências'),
        cc,
        isAdmin || isAuditoria || cc?.uo_tipo !== 'Agências',
        [],
        'balcao'
      ),
    [cc, isAdmin, isAuditoria, uos]
  );

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, creditos]);

  useEffect(() => {
    if (balcao?.id) {
      if (codigo) setItemValue('', setCodigo, 'codioContrato');
      if (cliente) setItemValue('', setCliente, 'clienteContrato');
      if (proposta) setItemValue('', setProposta, 'propostaContrato');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balcao?.id]);

  useEffect(() => {
    if ((cliente || proposta || codigo) && balcao?.id) setItemValue(null, setBalcao, 'balcaoCred', true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente, proposta, codigo]);

  useEffect(() => {
    if (localStorage.getItem('balcaoCred') && balcoes?.length > 0) {
      const balcao = balcoes?.find(({ id }) => id === Number(localStorage.getItem('balcaoCred')));
      if (balcao) setItemValue(balcao, setBalcao, 'balcaoCred', true);
    }
  }, [balcoes]);

  const dataFiltered = applySortFilter({ filter, dados: creditos, comparator: getComparator(order, orderBy) });
  const isNotFound = !dataFiltered.length;

  const handleProcurar = (cursor) => {
    const reset = cursor ? null : { val: [] };
    dispatch(getSuccess({ item: 'credito', dados: null }));
    dispatch(getFromGaji9('creditos', { balcao: balcao?.id, cliente, codigo, proposta, cursor, reset }));
  };

  return (
    <Stack spacing={3}>
      <Card sx={{ p: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ flexGrow: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexGrow: 1 }}>
              <Autocomplete
                fullWidth
                value={balcao}
                options={balcoes}
                getOptionLabel={(option) => option?.label}
                renderInput={(params) => <TextField {...params} label="Balcão" />}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(event, newValue) => setItemValue(newValue, setBalcao, 'balcaoCred', true)}
              />
              <TextField
                fullWidth
                label="Cliente"
                value={cliente}
                onChange={(event) => setItemValue(event.target.value, setCliente, 'clienteContrato')}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                label="Código"
                value={codigo}
                onChange={(event) => setItemValue(event.target.value, setCodigo, 'codioContrato')}
              />
              <TextField
                fullWidth
                label="Proposta"
                value={proposta}
                onChange={(event) => setItemValue(event.target.value, setProposta, 'propostaContrato')}
              />
            </Stack>
          </Stack>
          {(balcao?.id || codigo || proposta || cliente) && (
            <DefaultAction label="PROCURAR" onClick={() => handleProcurar(0)} />
          )}
        </Stack>
      </Card>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item="filterCredito" filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={[
                  { id: 'codigo', label: 'Código' },
                  { id: 'titular', label: 'Titular' },
                  { id: 'cliente', label: 'Cliente' },
                  { id: 'componente', label: 'Componente' },
                  { id: 'finalidade', label: 'Finalidade' },
                  { id: 'montante', label: 'Montante', align: 'right' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={7} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`credito_${index}`}>
                      <TableCell>
                        {row?.codigo || noDados('Não definido')}
                        {row?.numero_proposta && (
                          <Typography variant="body2" noWrap>
                            <Typography variant="caption" component="span" sx={{ color: 'text.secondary' }}>
                              Nº proposta:{' '}
                            </Typography>
                            {row?.numero_proposta}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{row?.titular}</TableCell>
                      <TableCell>
                        {labelTitular(row?.tipo_titular, row?.consumidor)}
                        {row?.cliente && (
                          <Typography variant="body2" noWrap>
                            <Typography variant="caption" component="span" sx={{ color: 'text.secondary' }}>
                              Nº :{' '}
                            </Typography>
                            {row?.cliente}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{row?.rotulo || row?.componente}</TableCell>
                      <TableCell>{newLineText(row?.finalidade) || noDados('Não definido')}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" noWrap>
                          {row?.montante ? fCurrency(row?.montante) : noDados('Não definido')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          <DefaultAction
                            label="DETALHES"
                            onClick={() => navigate(`${PATH_DIGITALDOCS.gaji9.root}/credito/${row?.id}`)}
                          />
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
      {page + 1 === Math.ceil(dataFiltered.length / rowsPerPage) && infoPag?.mais && infoPag?.proximo && (
        <MaisProcessos verMais={() => handleProcurar(infoPag?.proximo)} />
      )}

      {modalGaji9 === 'form-proposta' && <PropostaForm onClose={() => dispatch(setModal())} />}
    </Stack>
  );
}
