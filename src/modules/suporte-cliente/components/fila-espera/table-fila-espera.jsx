import { useState, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { ptDate } from '@/utils/formatTime';
import { normalizeText } from '@/utils/formatText';
import { concelhoToEnum } from '../configuracoes/utils';
import { DAYS_OF_WEEK, EXCEPTION_TYPES } from './form-fila-espera';
import useTable, { getComparator, applySort } from '@/hooks/useTable';
// redux
import { useDispatch, useSelector } from '@/redux/store';
import { getInSuporte, setModal } from '@/redux/slices/suporte-cliente';
// Components
import { noDados } from '@/components/Panel';
import Scrollbar from '@/components/Scrollbar';
import { DefaultAction } from '@/components/Actions';
import { SkeletonTable } from '@/components/skeleton';
import { SearchToolbarSimple } from '@/components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '@/components/table';
//
import { HorarioForm, ExcecaoForm, Eliminar } from './form-fila-espera';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableFilaEspera({ item }) {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('');

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
  } = useTable({ defaultOrderBy: item === 'horario' ? 'dayOfWeek' : 'date', defaultOrder: 'asc' });

  const { horario, excecoes, modalSuporte, isLoading } = useSelector((state) => state.suporte);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, filter]);

  useEffect(() => {
    dispatch(getInSuporte(item));
  }, [dispatch, item]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados: (item === 'excecoes' && excecoes) || (item === 'horario' && horario) || [],
  });
  const isNotFound = !dataFiltered.length;

  const onClose = () => dispatch(setModal({}));
  const viewItem = (modal, dados) => {
    const getdetail = item === 'prompts' && modal !== 'delete';
    dispatch(setModal({ modal, dados: getdetail ? null : dados, isEdit: modal === 'update' }));
    if (getdetail)
      dispatch(getInSuporte(modal === 'detalhes' ? 'prompt' : 'presets', { id: dados?.id, item: 'selectedItem' }));
  };

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item={`filter${item}`} filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(item)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={(item === 'horario' && 5) || 7} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      {item === 'horario' ? (
                        <>
                          <TableCell>{row?.departmentName || noDados('(Não definido)')}</TableCell>
                          <TableCell>
                            {DAYS_OF_WEEK?.find(({ id }) => id === row?.dayOfWeek)?.label || noDados('(Não definido)')}
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>
                            {EXCEPTION_TYPES?.find(({ id }) => id === row?.type)?.label || noDados('(Não definido)')}
                          </TableCell>
                          <TableCell align="center">{ptDate(row?.date) || noDados('(Não definido)')}</TableCell>
                          <TableCell>{row?.description || noDados('(Não definido)')}</TableCell>
                          <TableCell>{row?.departmentName || noDados('(Não definido)')}</TableCell>
                          <TableCell>
                            {concelhoToEnum?.find(({ id }) => id === row?.council)?.label || noDados('(Não definido)')}
                          </TableCell>
                        </>
                      )}
                      <TableCell align="center">{row?.opensAt || noDados('(Não definido)')}</TableCell>
                      <TableCell align="center">{row?.closesAt || noDados('(Não definido)')}</TableCell>
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.75}>
                          <DefaultAction small label="EDITAR" onClick={() => viewItem('update', row)} />
                          <DefaultAction small label="ELIMINAR" onClick={() => viewItem('eliminar', row)} />
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

      {modalSuporte === 'eliminar' && <Eliminar onClose={onClose} item={item} />}
      {(modalSuporte === 'add' || modalSuporte === 'update') && (
        <>
          {item === 'horario' && <HorarioForm onClose={onClose} />}
          {item === 'excecoes' && <ExcecaoForm onClose={onClose} />}
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function applySortFilter({ dados, filter, comparator }) {
  dados = applySort(dados, comparator);

  if (filter) {
    const normalizedFilter = normalizeText(filter);
    dados = dados.filter(
      ({ council, description, departmentName }) =>
        (council && normalizeText(council).indexOf(normalizedFilter) !== -1) ||
        (description && normalizeText(description).indexOf(normalizedFilter) !== -1) ||
        (departmentName && normalizeText(departmentName).indexOf(normalizedFilter) !== -1)
    );
  }

  return dados;
}

// ---------------------------------------------------------------------------------------------------------------------

function headerTable(item) {
  return [
    ...(item === 'horario'
      ? [
          { id: 'departmentName', label: 'Agência' },
          { id: 'dayOfWeek', label: 'Dia da semana' },
        ]
      : [
          { id: 'type', label: 'Estado' },
          { id: 'date', label: 'Data', align: 'center' },
          { id: 'description', label: 'Descrição' },
          { id: 'departmentName', label: 'Agência' },
          { id: 'council', label: 'Concelho' },
        ]),
    { id: 'opensAt', label: 'Abertura', align: 'center' },
    { id: 'closesAt', label: 'Fecho', align: 'center' },
    { id: '', width: 10 },
  ];
}
