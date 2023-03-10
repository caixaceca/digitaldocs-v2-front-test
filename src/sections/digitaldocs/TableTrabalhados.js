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
  TableContainer,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { format } from 'date-fns';
import { ptDateTime } from '../../utils/formatTime';
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
import ArquivoAnalytic from './ArquivoAnalytic';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Número', align: 'left' },
  { id: 'referencia', label: 'Referência', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'nome', label: 'Estado', align: 'left' },
  { id: 'trabalhado_em', label: 'Trabalhado em', align: 'center' },
  { id: 'empty' },
];

// ----------------------------------------------------------------------

export default function TableTrabalhados() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [data, setData] = useState(new Date());
  const [filterSearch, setFilterSearch] = useSearchParams();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { trabalhados, trabalhadosUo, isLoading } = useSelector((state) => state.digitaldocs);
  const [ambiente, setAmbiente] = useState(null);
  const [colaborador, setColaborador] = useState(
    currentColaborador ? { id: currentColaborador?.perfil_id, label: currentColaborador?.perfil?.displayName } : null
  );
  const total = trabalhadosUo?.length || 0;
  const subtotal = trabalhados?.length || 0;

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
  } = useTable({ defaultOrderBy: 'trabalhado_em', defaultOrder: currentColaborador?.id === 362 ? 'desc' : 'asc' });

  useEffect(() => {
    dispatch(resetItem('trabalhados'));
    if (mail && data) {
      dispatch(
        getAll('trabalhados', {
          mail,
          estadoId: ambiente?.id,
          perfilId: colaborador?.id,
          uoId: currentColaborador?.uo_id,
          data: format(data, 'yyyy-MM-dd'),
        })
      );
    }
  }, [dispatch, colaborador?.id, ambiente?.id, currentColaborador?.uo_id, data, mail]);

  useEffect(() => {
    dispatch(resetItem('trabalhados'));
    if (mail && data) {
      dispatch(getAll('trabalhadosUo', { mail, uoId: currentColaborador?.uo_id, data: format(data, 'yyyy-MM-dd') }));
    }
  }, [dispatch, currentColaborador?.uo_id, data, mail]);

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
        links={[{ name: 'Indicadores', href: PATH_DIGITALDOCS.root }, { name: 'Trabalhados' }]}
        action={
          <DatePicker
            label="Data"
            inputFormat="dd/MM/yyyy"
            value={data}
            onChange={(_data) => setData(_data)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        }
        sx={{ color: 'text.secondary', m: 0, p: 1, pt: 0 }}
      />
      <Card sx={{ mb: 3 }}>
        <Scrollbar>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            sx={{ py: 2 }}
          >
            <ArquivoAnalytic
              title={`Total - ${currentColaborador?.uo?.label}`}
              total={total}
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
      <Card sx={{ p: 1 }}>
        <SearchToolbarTrabalhados
          ambiente={ambiente}
          colaborador={colaborador}
          filterSearch={filterSearch}
          onFilterSearch={handleFilterSearch}
          onFilterAmbiente={handleFilterAmbiente}
          onFilterColaborador={handleFilterColaborador}
          tab="trabalhados"
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
                      <TableRow hover key={row.referencia}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.referencia}</TableCell>
                        <TableCell>
                          {(row?.conta && row.conta) || (row?.cliente && row.cliente) || _entidades}
                        </TableCell>
                        <TableCell>{row?.assunto}</TableCell>
                        <TableCell>{row?.nome}</TableCell>
                        <TableCell align="center">
                          {row?.trabalhado_em ? ptDateTime(row?.trabalhado_em) : ' - - - - - '}
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
        (row?.id && row?.id.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.referencia && row?.referencia.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
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
