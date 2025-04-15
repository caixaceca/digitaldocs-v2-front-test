import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
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
import { noDados } from '../../utils/formatText';
import { fCurrency } from '../../utils/formatNumber';
import { balcoesList } from '../../utils/formatObject';
import { setDefaultBalcao } from '../../utils/setItem';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, setModal } from '../../redux/slices/gaji9';
// Components
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple, SearchAutocomplete } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { PropostaForm } from './form-credito';
import { applySortFilter } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableCredito() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [balcao, setBalcao] = useState(null);
  const [filter, setFilter] = useState(localStorage.getItem('filterCredito') || '');

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

  const { isLoading, modalGaji9, creditos } = useSelector((state) => state.gaji9);
  const { cc, uos } = useSelector((state) => state.intranet);
  const balcoes = useMemo(() => balcoesList(uos), [uos]);

  useEffect(() => {
    setDefaultBalcao(balcao, cc?.uo, balcoes, setBalcao, 'balcaoCred');
  }, [balcao, balcoes, cc?.uo, setBalcao]);

  useEffect(() => {
    if (balcao?.id) dispatch(getFromGaji9('creditos', { balcao: balcao.id, resetLista: true }));
  }, [dispatch, balcao?.id]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({ filter, comparator: getComparator(order, orderBy), dados: creditos });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <Card sx={{ p: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <SearchAutocomplete
            label="Balcão"
            value={balcao}
            dados={balcoes}
            disableClearable
            valuel="balcaoCred"
            setValue={setBalcao}
          />
          <Stack sx={{ flexGrow: 1, width: 1 }}>
            <SearchToolbarSimple item="filterCredito" filter={filter} setFilter={setFilter} />
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
                  { id: 'cliente', label: 'Cliente' },
                  { id: 'titular	', label: 'Titular' },
                  { id: 'tipo_titular	', label: 'Tipo titular' },
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
                      <TableCell>{row?.cliente || noDados('Não definido')}</TableCell>
                      <TableCell>{row?.titular}</TableCell>
                      <TableCell>
                        {row?.tipo_titular}
                        {row?.consumidor ? ' (Consumidor)' : ''}
                      </TableCell>
                      <TableCell>{row?.rotulo || row?.componente}</TableCell>
                      <TableCell>{row?.finalidade || noDados('Não definido')}</TableCell>
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

      {modalGaji9 === 'form-proposta' && <PropostaForm onCancel={() => dispatch(setModal())} />}
    </>
  );
}
