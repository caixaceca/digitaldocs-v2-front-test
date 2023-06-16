import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import {
  Fab,
  Card,
  Stack,
  Table,
  Divider,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  Typography,
  TableContainer,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { format } from 'date-fns';
import { ptDateTime } from '../../utils/formatTime';
import { entidadesParse, noDados } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, resetItem } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarTrabalhados } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// sections
import ArquivoAnalytic from '../arquivo/ArquivoAnalytic';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nentrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'nome', label: 'Estado', align: 'left' },
  { id: 'trabalhado_em', label: 'Trabalhado em', align: 'center' },
  { id: 'empty', width: 50 },
];

// ----------------------------------------------------------------------

export default function TableTrabalhados() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [data, setData] = useState(new Date());
  const [filterSearch, setFilterSearch] = useSearchParams();
  const { mail, cc, uos } = useSelector((state) => state.intranet);
  const { trabalhados, trabalhadosUo, isLoading } = useSelector((state) => state.digitaldocs);
  const [ambiente, setAmbiente] = useState(null);
  const [colaborador, setColaborador] = useState(
    cc
      ? {
          id: cc?.perfil_id,
          label: cc?.perfil?.displayName,
          uoId: cc?.uo_id,
        }
      : null
  );
  const total = trabalhadosUo?.length || 0;
  const subtotal = trabalhados?.length || 0;
  const fromAgencia = cc?.uo?.tipo === 'Agências';
  const uoId = ambiente?.uoId || colaborador?.uoId || cc?.uo_id;
  const uo = uos?.find((row) => row?.id === uoId);

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
    defaultOrderBy: 'trabalhado_em',
    defaultRowsPerPage: fromAgencia ? 100 : 25,
    defaultDense: cc?.id === 362,
    defaultOrder: cc?.id === 362 ? 'desc' : 'asc',
  });

  useEffect(() => {
    if (cc?.perfil_id) {
      setColaborador({
        id: cc?.perfil_id,
        label: cc?.perfil?.displayName,
        uoId: cc?.uo_id,
      });
    }
  }, [dispatch, cc]);

  useEffect(() => {
    dispatch(resetItem('trabalhados'));
    if (mail && data && (ambiente?.id || colaborador?.id || uoId)) {
      dispatch(
        getAll('trabalhados', {
          mail,
          uoId,
          estadoId: ambiente?.id,
          perfilId: colaborador?.id,
          data: format(data, 'yyyy-MM-dd'),
        })
      );
    }
  }, [dispatch, colaborador?.id, ambiente?.id, uoId, data, mail]);

  useEffect(() => {
    dispatch(resetItem('trabalhados'));
    if (mail && data && uoId) {
      dispatch(getAll('trabalhadosUo', { mail, uoId, data: format(data, 'yyyy-MM-dd') }));
    }
  }, [dispatch, uoId, data, mail]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleFilterAmbiente = (event) => {
    setAmbiente(event);
  };

  const handleFilterColaborador = (event) => {
    setColaborador(event);
  };

  const handleViewRow = (id) => {
    navigate({ pathname: `${PATH_DIGITALDOCS.controle.root}/${id}`, search: 'trabalhados' });
  };

  const dataFiltered = applySortFilter({ trabalhados, comparator: getComparator(order, orderBy), filterSearch });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Processos trabalhados"
        links={[{ name: '' }]}
        action={
          <DatePicker
            label="Data"
            value={data}
            onChange={(_data) => setData(_data)}
            renderInput={(params) => <TextField {...params} />}
            slotProps={{ textField: { fullWidth: true, size: 'small', sx: { maxWidth: 170 } } }}
          />
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />
      {total !== 0 && subtotal !== 0 && (
        <Card sx={{ mb: 3 }}>
          <Scrollbar>
            <Stack
              sx={{ py: 2 }}
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            >
              <ArquivoAnalytic
                title={uo ? uo?.label : cc?.uo?.label}
                total={uoId ? total : subtotal}
                icon="/assets/icons/navbar/process.svg"
                color="success.main"
              />
              {colaborador?.label && (
                <ArquivoAnalytic
                  title={colaborador?.label}
                  total={subtotal}
                  percent={subtotal === 0 || total === 0 ? 0 : (subtotal * 100) / total}
                />
              )}
              {ambiente?.label && (
                <ArquivoAnalytic
                  title={ambiente?.label}
                  total={subtotal}
                  percent={subtotal === 0 || total === 0 ? 0 : (subtotal * 100) / total}
                />
              )}
            </Stack>
          </Scrollbar>
        </Card>
      )}
      <Card sx={{ p: 1 }}>
        {trabalhados.length > 1 && (
          <SearchToolbarTrabalhados
            tab="trabalhados"
            ambiente={ambiente}
            colaborador={colaborador}
            filterSearch={filterSearch}
            onFilterSearch={handleFilterSearch}
            onFilterAmbiente={handleFilterAmbiente}
            onFilterColaborador={handleFilterColaborador}
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
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow hover key={row.referencia}>
                      <TableCell>{row.nentrada}</TableCell>
                      <TableCell>{row.titular || noDados()}</TableCell>
                      <TableCell>{row.conta || row.cliente || entidadesParse(row?.entidades) || noDados()}</TableCell>
                      <TableCell>{row?.assunto}</TableCell>
                      <TableCell>{row?.nome}</TableCell>
                      <TableCell align="center" sx={{ width: 10 }}>
                        <Typography noWrap variant="body2">
                          {row?.trabalhado_em && ptDateTime(row.trabalhado_em)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="DETALHES" arrow>
                          <Fab color="success" size="small" variant="soft" onClick={() => handleViewRow(row?.id)}>
                            <SvgIconStyle src="/assets/icons/view.svg" />
                          </Fab>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
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

function applySortFilter({ trabalhados, comparator, filterSearch }) {
  const stabilizedThis = trabalhados.map((el, index) => [el, index]);
  const text = filterSearch.get('filter');

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  trabalhados = stabilizedThis.map((el) => el[0]);

  if (text) {
    trabalhados = trabalhados.filter(
      (row) =>
        (row?.nentrada && row?.nentrada.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.assunto && row?.assunto.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.nome && row?.nome.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.conta && row?.conta.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.cliente && row?.cliente.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.titular && row?.titular.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.entidades && row?.entidades.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1)
    );
  }

  return trabalhados;
}
