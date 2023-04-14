import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
// @mui
import {
  Fab,
  Card,
  Stack,
  Table,
  Button,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
// utils
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
import { SearchToolbarProcessos } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nentrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'nome', label: 'Estado', align: 'left' },
  { id: 'data_last_transicao', label: 'Modificado em', align: 'center' },
  { id: 'empty' },
];

const TABLE_HEAD_PENDECIA = [
  { id: 'nentrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'motivo', label: 'Motivo', align: 'left' },
  { id: 'data_last_transicao', label: 'Modificado em', align: 'center' },
  { id: 'empty' },
];

// ----------------------------------------------------------------------

TableProcessos.propTypes = { from: PropTypes.string };

export default function TableProcessos({ from }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [segmento, setSegmento] = useState(null);
  const [filterSearch, setFilterSearch] = useSearchParams();
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { processos, isLoading, meuAmbiente, meusAmbientes, meuFluxo } = useSelector((state) => state.digitaldocs);
  const title =
    (from === 'devolvidosEquipa' && 'Devolvidos da equipa') ||
    (from === 'devolvidosPessoal' && 'Devolvidos pessoal') ||
    (from === 'tarefas' && 'Lista de tarefas') ||
    (from === 'finalizados' && 'Finalizados') ||
    (from === 'executados' && 'Executados') ||
    (from === 'agendados' && 'Agendados') ||
    (from === 'pendentes' && 'Pendentes') ||
    (from === 'retidos' && 'Retidos') ||
    from;

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
    defaultOrderBy: 'data_last_transicao',
    defaultOrder: currentColaborador?.id === 362 ? 'desc' : 'asc',
  });

  useEffect(() => {
    if (mail && meuAmbiente?.id && meuFluxo?.id && currentColaborador?.perfil_id) {
      setPage(0);
      dispatch(
        getAll(from, {
          mail,
          fluxoId: meuFluxo?.id,
          estadoId: meuAmbiente?.id,
          perfilId: currentColaborador?.perfil_id,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, meuAmbiente?.id, meuFluxo?.id, currentColaborador?.perfil_id, from, mail]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleFilterSegmento = (event) => {
    setSegmento(event);
    setPage(0);
  };

  const handleViewRow = (id) => {
    navigate({ pathname: `${PATH_DIGITALDOCS.processos.root}/${id}`, search: createSearchParams({ from }).toString() });
  };

  const podeAdicionar = () => {
    let i = 0;
    while (i < meusAmbientes?.length) {
      if (meusAmbientes[i]?.is_inicial) {
        return true;
      }
      i += 1;
    }
    return false;
  };

  const dataFiltered = applySortFilter({
    processos,
    comparator: getComparator(order, orderBy),
    filterSearch,
    segmento,
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading={title}
        links={[{ name: '' }]}
        action={
          podeAdicionar() && (
            <Button
              variant="soft"
              component={RouterLink}
              to={PATH_DIGITALDOCS.processos.novoProcesso}
              startIcon={<AddCircleIcon />}
            >
              Adicionar
            </Button>
          )
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarProcessos
          filterSearch={filterSearch}
          onFilterSearch={handleFilterSearch}
          segmento={segmento}
          onFilterSegmento={handleFilterSegmento}
          origem={from}
        />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                orderBy={orderBy}
                headLabel={from === 'pendentes' ? TABLE_HEAD_PENDECIA : TABLE_HEAD}
                onSort={onSort}
              />
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
                        <TableCell>
                          <Stack direction="row" spacing={0.5} alignrows="center">
                            <FiberManualRecordIcon
                              sx={{
                                mt: 0.15,
                                ml: -1.5,
                                width: 18,
                                height: 18,
                                color:
                                  (row?.cor === 'verde' && 'text.success') ||
                                  (row?.cor === 'vermelha' && 'text.error') ||
                                  (row?.cor === 'amarela' && 'text.warning') ||
                                  'text.focus',
                              }}
                            />
                            <Stack>{row.nentrada}</Stack>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {row.titular ? (
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
                        <TableCell>{row?.assunto ? row.assunto : meuFluxo.assunto}</TableCell>
                        <TableCell>
                          {(from === 'pendentes' && row?.motivo) || (row?.nome && row.nome) || meuAmbiente.nome}
                        </TableCell>
                        <TableCell align="center">
                          {row?.data_last_transicao ? ptDateTime(row?.data_last_transicao) : ''}
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
                <TableSearchNotFound message="Não foi encontrado nenhum processo disponível..." />
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

function applySortFilter({ processos, comparator, filterSearch, segmento }) {
  const stabilizedThis = processos.map((el, index) => [el, index]);
  const text = filterSearch.get('filter');

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  processos = stabilizedThis.map((el) => el[0]);

  if (segmento === 'Particulares') {
    processos = processos.filter((row) => row?.segcliente === 'P');
  }
  if (segmento === 'Empresas') {
    processos = processos.filter((row) => row?.segcliente === 'E');
  }

  if (text) {
    processos = processos.filter(
      (row) =>
        (row?.nentrada && row?.nentrada.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.assunto && row?.assunto.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.nome && row?.nome.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.conta && row?.conta.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.cliente && row?.cliente.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.titular && row?.titular.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.motivo && row?.motivo.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.entidades && row?.entidades.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1)
    );
  }

  return processos;
}
