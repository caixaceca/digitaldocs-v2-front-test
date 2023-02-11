import { useEffect } from 'react';
import PropTypes from 'prop-types';
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
  TableContainer,
} from '@mui/material';
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
  { id: 'id', label: 'Número', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'ContaCliente/Entidade(s)', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'nome', label: 'Estado', align: 'left' },
  { id: 'data_last_transicao', label: 'Modificado em', align: 'center' },
  { id: 'empty' },
];

// ----------------------------------------------------------------------

TableProcessos.propTypes = { from: PropTypes.string };

export default function TableProcessos({ from }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filterSearch, setFilterSearch] = useSearchParams();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { processos, isLoading, meuAmbiente, meuFluxo } = useSelector((state) => state.digitaldocs);
  const title =
    (from === 'devolvidosEquipa' && 'Devolvidos da equipa') ||
    (from === 'devolvidosPessoal' && 'Devolvidos pessoal') ||
    (from === 'minhastarefas' && 'Tarefas da equipa') ||
    (from === 'meuspendentes' && 'Tarefas pendentes') ||
    (from === 'finalizados' && 'Finalizados') ||
    (from === 'executados' && 'Executados') ||
    (from === 'agendados' && 'Agendados') ||
    '';

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
  } = useTable({ defaultOrderBy: 'data_last_transicao', defaultOrder: 'asc' });

  useEffect(() => {
    if (mail && meuAmbiente?.id && meuFluxo?.id && currentColaborador?.perfil_id) {
      dispatch(
        getAll(from, {
          mail,
          fluxoId: meuFluxo?.id,
          estadoId: meuAmbiente?.id,
          perfilId: currentColaborador?.perfil_id,
        })
      );
    }
  }, [dispatch, meuAmbiente?.id, meuFluxo?.id, currentColaborador?.perfil_id, from, mail]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleViewRow = (id) => {
    navigate({ pathname: `${PATH_DIGITALDOCS.processos.root}/${id}`, search: createSearchParams({ from }).toString() });
  };

  const dataFiltered = applySortFilter({ processos, comparator: getComparator(order, orderBy), filterSearch });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading={title}
        links={[{ name: 'Indicadores', href: PATH_DIGITALDOCS.root }, { name: title }]}
        action={
          meuAmbiente?.is_inicial && (
            <Button
              variant="soft"
              component={RouterLink}
              to={PATH_DIGITALDOCS.processos.novoProcesso}
              startIcon={<SvgIconStyle src="/assets/icons/add.svg" sx={{ width: 20 }} />}
            >
              Adicionar
            </Button>
          )
        }
        sx={{ color: 'text.secondary', m: 0, p: 1, pt: 0 }}
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarProcessos filterSearch={filterSearch} onFilterSearch={handleFilterSearch} origem={from} />
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
                        <TableCell>
                          <Stack direction="row" alignrows="center">
                            {from !== 'arquivados' && (
                              <SvgIconStyle
                                src="/assets/icons/dot.svg"
                                sx={{
                                  ml: -1.5,
                                  mt: -0.5,
                                  width: 30,
                                  height: 30,
                                  color:
                                    (row?.cor === 'verde' && 'text.success') ||
                                    (row?.cor === 'vermelha' && 'text.error') ||
                                    (row?.cor === 'amarela' && 'text.warning') ||
                                    'text.focus',
                                }}
                              />
                            )}
                            <Stack>{row.id}</Stack>
                          </Stack>
                        </TableCell>
                        <TableCell>{row.titular}</TableCell>
                        <TableCell>
                          {(row?.conta && row.conta) || (row?.cliente && row.cliente) || _entidades}
                        </TableCell>
                        <TableCell>{row?.assunto ? row.assunto : meuFluxo.assunto}</TableCell>
                        <TableCell>{row?.nome ? row.nome : meuAmbiente.nome}</TableCell>
                        <TableCell align="center">
                          {row?.data_last_transicao ? ptDateTime(row?.data_last_transicao) : ' - - - - - '}
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

function applySortFilter({ processos, comparator, filterSearch }) {
  const stabilizedThis = processos.map((el, index) => [el, index]);
  const text = filterSearch.get('filter');

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  processos = stabilizedThis.map((el) => el[0]);

  if (text) {
    processos = processos.filter(
      (row) =>
        (row?.id && row?.id.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.assunto && row?.assunto.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.nome && row?.nome.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.conta && row?.conta.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.cliente && row?.cliente.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.titular && row?.titular.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.entidades && row?.entidades.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1)
    );
  }

  return processos;
}
