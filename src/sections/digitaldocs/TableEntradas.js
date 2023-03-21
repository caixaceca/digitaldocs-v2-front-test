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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
// utils
import { format } from 'date-fns';
import { ptDateTime, fYear } from '../../utils/formatTime';
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
  { id: 'nentrada', label: 'Número', align: 'left' },
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
  const [estado, setEstado] = useState(null);
  const [assunto, setAssunto] = useState(null);
  const [colaborador, setColaborador] = useState(null);
  const [dataFim, setDataFim] = useState(new Date());
  const [dataInicio, setDataInicio] = useState(new Date());
  const [filterSearch, setFilterSearch] = useSearchParams();
  const { uos } = useSelector((state) => state.uo);
  const { entradas, meusAmbientes, isLoading } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, currentColaborador } = useSelector((state) => state.colaborador);
  const perfilId = currentColaborador?.perfil_id;
  const [uoId, setUoId] = useState(currentColaborador?.uo_id);

  const minhasUos = [];
  meusAmbientes?.forEach((row) => {
    if (row?.nome?.includes('Gerência')) {
      const uo = uos?.find((_uo) => _uo?.id === row?.uo_id);
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
  } = useTable({ defaultOrderBy: 'nentrada', defaultOrder: 'desc' });

  useEffect(() => {
    if (currentColaborador?.uo_id) {
      setUoId(currentColaborador?.uo_id);
    }
  }, [dispatch, currentColaborador?.uo_id]);

  useEffect(() => {
    if (mail && perfilId && uoId && dataInicio && dataFim) {
      dispatch(
        getAll('entradas', {
          mail,
          uoId,
          perfilId,
          dataFim: format(dataFim, 'yyyy-MM-dd'),
          dataInicio: format(dataInicio, 'yyyy-MM-dd'),
        })
      );
    }
  }, [dispatch, perfilId, uoId, dataInicio, dataFim, mail]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleFilterAssunto = (event) => {
    setAssunto(event);
    setPage(0);
  };

  const handleFilterEstado = (event) => {
    setEstado(event);
    setPage(0);
  };

  const handleFilterColaborador = (event) => {
    setColaborador(event);
    setPage(0);
  };

  const handleViewRow = (id) => {
    navigate({
      pathname: `${PATH_DIGITALDOCS.controle.root}/${id}`,
      search: createSearchParams({ from: 'entradas' }).toString(),
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
    if (!assuntosList.includes(row?.assunto)) {
      assuntosList.push(row?.assunto);
    }
    newEntradas.push({
      ...row,
      colaborador: colaborador?.perfil?.displayName,
      numEntrada: `${row?.nentrada}/${uoId}/${fYear(row?.criado_em || new Date())}`,
    });
  });

  const dataFiltered = applySortFilter({
    newEntradas,
    comparator: getComparator(order, orderBy),
    filterSearch,
    colaborador,
    estado,
    assunto,
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
                renderInput={(params) => <TextField {...params} label="U.O" margin="none" />}
              />
            )}
            <Stack direction="row" alignItems="center" spacing={1}>
              <DatePicker
                disableFuture
                value={dataInicio}
                label="Data início"
                onChange={(newValue) => setDataInicio(newValue)}
                renderInput={(params) => <TextField size="small" {...params} sx={{ minWidth: 160 }} />}
              />
              <DatePicker
                disableFuture
                value={dataFim}
                label="Data fim"
                onChange={(newValue) => setDataFim(newValue)}
                renderInput={(params) => <TextField size="small" {...params} sx={{ minWidth: 160 }} />}
              />
            </Stack>
          </Stack>
        }
        sx={{ color: 'text.secondary', m: 0, px: 1 }}
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarEntradas
          estado={estado}
          assunto={assunto}
          colaborador={colaborador}
          estadosList={estadosList}
          assuntosList={assuntosList}
          filterSearch={filterSearch}
          onFilterSearch={handleFilterSearch}
          onFilterEstado={handleFilterEstado}
          onFilterAssunto={handleFilterAssunto}
          colaboradoresList={colaboradoresList}
          onFilterColaborador={handleFilterColaborador}
          tab="entradas"
        />
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
                        <TableCell>{row.numEntrada}</TableCell>
                        <TableCell>{row.titular}</TableCell>
                        <TableCell>
                          {(row?.conta && row.conta) || (row?.cliente && row.cliente) || _entidades}
                        </TableCell>
                        <TableCell>{row?.assunto}</TableCell>
                        <TableCell>{row?.nome}</TableCell>
                        <TableCell>
                          {row?.criado_em && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <AccessTimeOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
                              <Typography variant="body2">{row?.criado_em ? ptDateTime(row.criado_em) : ''}</Typography>
                            </Stack>
                          )}
                          {row?.colaborador && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <AccountCircleOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
                              <Typography variant="body2">{row.colaborador}</Typography>
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

        {!isNotFound && (
          <TablePaginationAlt
            dense={dense}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
            onChangePage={onChangePage}
            page={page}
            rowsPerPage={rowsPerPage}
            count={dataFiltered.length}
          />
        )}
      </Card>
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ newEntradas, comparator, filterSearch, colaborador, assunto, estado }) {
  const stabilizedThis = newEntradas.map((el, index) => [el, index]);
  const text = filterSearch.get('filter');

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  newEntradas = stabilizedThis.map((el) => el[0]);

  if (colaborador) {
    newEntradas = newEntradas.filter((row) => row?.colaborador === colaborador);
  }
  if (estado) {
    newEntradas = newEntradas.filter((row) => row?.nome === estado);
  }
  if (assunto) {
    newEntradas = newEntradas.filter((row) => row?.assunto === assunto);
  }
  if (text) {
    newEntradas = newEntradas.filter(
      (row) =>
        (row?.numEntrada && row?.numEntrada.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.conta && row?.conta.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.cliente && row?.cliente.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.titular && row?.titular.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.entidades && row?.entidades.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1)
    );
  }

  return newEntradas;
}
