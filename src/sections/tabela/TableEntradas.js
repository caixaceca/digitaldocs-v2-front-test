import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
// @mui
import {
  Fab,
  Card,
  Table,
  Stack,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  Typography,
  Autocomplete,
  TableContainer,
} from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
// utils
import { add, format } from 'date-fns';
import { ptDateTime } from '../../utils/formatTime';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarEntradas } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nentrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'nome', label: 'Estado', align: 'left' },
  { id: 'criado_em', label: 'Criado', align: 'left' },
  { id: 'empty' },
];

// ----------------------------------------------------------------------

export default function TableEntradas() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useSearchParams({
    estado: '',
    assunto: '',
    colaborador: '',
    tab: 'entradas',
    filterSearch: '',
    datai: format(new Date(), 'yyyy-MM-dd'),
    dataf: format(new Date(), 'yyyy-MM-dd'),
  });
  const [data, setData] = useState([
    filter?.get('datai') || format(new Date(), 'yyyy-MM-dd'),
    filter?.get('dataf') || format(new Date(), 'yyyy-MM-dd'),
  ]);
  const { entradas, meusAmbientes, isLoading } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, currentColaborador, uos } = useSelector((state) => state.intranet);
  const perfilId = currentColaborador?.perfil_id;
  const [uoId, setUoId] = useState(currentColaborador?.uo_id);
  const fromAgencia = currentColaborador?.uo?.tipo === 'Agências';

  const minhasUos = [];
  meusAmbientes?.forEach((row) => {
    if (row?.nome?.includes('Gerência')) {
      const uo = uos?.find((uo) => uo?.id === row?.uo_id);
      minhasUos?.push({ id: row?.uo_id, label: uo?.label });
    }
  });

  const {
    page,
    dense,
    order,
    orderBy,
    setPage,
    rowsPerPage,
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrder: 'desc',
    defaultOrderBy: 'nentrada',
    defaultRowsPerPage: fromAgencia ? 100 : 25,
    defaultDense: currentColaborador?.id === 362,
  });

  useEffect(() => {
    if (currentColaborador?.uo_id) {
      setUoId(currentColaborador?.uo_id);
    }
  }, [dispatch, currentColaborador?.uo_id]);

  useEffect(() => {
    if (mail && perfilId && uoId) {
      dispatch(getAll('entradas', { mail, uoId, perfilId, dataInicio: data[0], dataFim: data[1] }));
    }
  }, [dispatch, perfilId, uoId, mail, data]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleViewRow = (id) => {
    navigate({
      pathname: `${PATH_DIGITALDOCS.controle.root}/${id}`,
      search: createSearchParams({
        from: 'entradas',
        datai: filter?.get('datai'),
        dataf: filter?.get('dataf'),
        estado: filter?.get('estado'),
        assunto: filter?.get('assunto'),
        colaborador: filter?.get('colaborador'),
        filterSearch: filter?.get('filterSearch'),
      }).toString(),
    });
  };

  const newEntradas = [];
  const estadosList = [];
  const assuntosList = [];
  const colaboradoresList = [];
  entradas?.forEach((row) => {
    const colaborador = colaboradores?.find((colaborador) => Number(colaborador.perfil_id) === Number(row?.dono));
    if (colaborador && !colaboradoresList.includes(colaborador?.perfil?.displayName)) {
      colaboradoresList.push(colaborador?.perfil?.displayName);
    }
    if (!estadosList.includes(row?.nome)) {
      estadosList.push(row?.nome);
    }
    if (row?.nome === 'Arquivo' && !estadosList.includes('Excepto Arquivo')) {
      estadosList.push('Excepto Arquivo');
    }
    if (!assuntosList.includes(row?.assunto)) {
      assuntosList.push(row?.assunto);
    }
    newEntradas.push({
      ...row,
      colaborador: colaborador?.perfil?.displayName,
      // numEntrada: `${row?.nentrada}/${uoId}/${fYear(row?.criado_em || new Date())}`,
    });
  });

  const dataFiltered = applySortFilter({
    newEntradas,
    estado: filter?.get('estado'),
    assunto: filter?.get('assunto'),
    colaborador: filter?.get('colaborador'),
    filterSearch: filter?.get('filterSearch'),
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Entradas"
        links={[{ name: '' }]}
        action={
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
            {minhasUos?.length > 1 && (
              <Autocomplete
                fullWidth
                size="small"
                disableClearable
                options={minhasUos}
                value={minhasUos?.find((row) => row?.id === uoId)}
                onChange={(event, newValue) => setUoId(newValue?.id)}
                renderInput={(params) => (
                  <TextField {...params} label="U.O" margin="none" sx={{ width: { md: 200 } }} />
                )}
              />
            )}
            <DateRangePicker
              disableFuture
              slots={{ field: SingleInputDateRangeField }}
              value={[add(new Date(data[0]), { hours: 2 }), add(new Date(data[1]), { hours: 2 })]}
              slotProps={{ textField: { fullWidth: true, size: 'small', label: 'Data', sx: { minWidth: 220 } } }}
              onChange={(newValue) => {
                setFilter({
                  tab: 'entradas',
                  estado: filter?.get('estado'),
                  assunto: filter?.get('assunto'),
                  colaborador: filter?.get('colaborador'),
                  filterSearch: filter?.get('filterSearch'),
                  datai: format(new Date(newValue?.[0]), 'yyyy-MM-dd'),
                  dataf: format(new Date(newValue?.[1]), 'yyyy-MM-dd'),
                });
                setData([format(new Date(newValue?.[0]), 'yyyy-MM-dd'), format(new Date(newValue?.[1]), 'yyyy-MM-dd')]);
              }}
            />
            {(data[0] !== format(new Date(), 'yyyy-MM-dd') || data[1] !== format(new Date(), 'yyyy-MM-dd')) && (
              <Stack>
                <Tooltip title="Hoje" arrow>
                  <Fab
                    color="inherit"
                    size="small"
                    variant="soft"
                    onClick={() => {
                      setFilter({
                        tab: 'entradas',
                        estado: filter?.get('estado'),
                        assunto: filter?.get('assunto'),
                        datai: format(new Date(), 'yyyy-MM-dd'),
                        dataf: format(new Date(), 'yyyy-MM-dd'),
                        colaborador: filter?.get('colaborador'),
                        filterSearch: filter?.get('filterSearch'),
                      });
                      setData([format(new Date(), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')]);
                    }}
                  >
                    <TodayIcon />
                  </Fab>
                </Tooltip>
              </Stack>
            )}
          </Stack>
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />
      <Card sx={{ p: 1 }}>
        {dataFiltered.length > 1 && (
          <SearchToolbarEntradas
            tab="entradas"
            filter={filter}
            setFilter={setFilter}
            estadosList={estadosList}
            assuntosList={assuntosList}
            colaboradoresList={colaboradoresList}
          />
        )}
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={7} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    let _entidades = '';
                    row?.entidades?.split(';')?.forEach((_row, index) => {
                      _entidades += row?.entidades?.split(';')?.length - 1 === index ? _row : `${_row} / `;
                    });
                    return (
                      <TableRow hover key={row.id}>
                        <TableCell>{row.nentrada}</TableCell>
                        <TableCell>
                          {row?.titular ? (
                            row.titular
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                              Não identificado
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {(row?.conta && row.conta) || (row?.cliente && row.cliente) || _entidades || (
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                              Não identificado
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{row?.assunto}</TableCell>
                        <TableCell>{row?.nome}</TableCell>
                        <TableCell sx={{ width: 10 }}>
                          {row?.criado_em && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <AccessTimeOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
                              <Typography noWrap variant="body2">
                                {row?.criado_em ? ptDateTime(row.criado_em) : ''}
                              </Typography>
                            </Stack>
                          )}
                          {row?.colaborador && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <AccountCircleOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
                              <Typography noWrap variant="body2">
                                {row.colaborador}
                              </Typography>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell align="center" width={50}>
                          <Tooltip title="DETALHES" arrow>
                            <Fab color="success" size="small" variant="soft" onClick={() => handleViewRow(row?.id)}>
                              <SvgIconStyle src="/assets/icons/view.svg" />
                            </Fab>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhuma entrada disponível..." />
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
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ newEntradas, comparator, filterSearch, colaborador, assunto, estado }) {
  const stabilizedThis = newEntradas.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  newEntradas = stabilizedThis.map((el) => el[0]);

  if (colaborador) {
    newEntradas = newEntradas.filter((row) => row?.colaborador === colaborador);
  }
  if (estado && estado !== 'Excepto Arquivo') {
    newEntradas = newEntradas.filter((row) => row?.nome === estado);
  }
  if (estado === 'Excepto Arquivo') {
    newEntradas = newEntradas.filter((row) => row?.nome !== 'Arquivo');
  }
  if (assunto) {
    newEntradas = newEntradas.filter((row) => row?.assunto === assunto);
  }
  if (filterSearch) {
    newEntradas = newEntradas.filter(
      (row) =>
        (row?.nentrada && row?.nentrada.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1) ||
        (row?.conta && row?.conta.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1) ||
        (row?.cliente && row?.cliente.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1) ||
        (row?.titular && row?.titular.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1) ||
        (row?.entidades && row?.entidades.toString().toLowerCase().indexOf(filterSearch.toLowerCase()) !== -1)
    );
  }

  return newEntradas;
}
