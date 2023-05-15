import { useEffect } from 'react';
import { useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
// @mui
import { Fab, Card, Table, Tooltip, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// utils
import { ptDateTime } from '../../utils/formatTime';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getArquivos, resetItem } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbar2 } from '../../components/SearchToolbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Colaborador', align: 'left' },
  { id: 'processo', label: 'Processo', align: 'left' },
  { id: 'criado_em', label: 'Data do pedido', align: 'center' },
  { id: 'empty' },
];

// ----------------------------------------------------------------------

export default function PedidosAcesso() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pedidosAcesso, isLoading } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador, colaboradores } = useSelector((state) => state.intranet);

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
  } = useTable({ defaultOrderBy: 'id' });

  const [filterSearch, setFilterSearch] = useSearchParams();

  useEffect(() => {
    if (mail && currentColaborador?.perfil_id) {
      dispatch(getArquivos('pedidosAcesso', currentColaborador?.perfil_id, mail));
    }
  }, [dispatch, currentColaborador?.perfil_id, mail]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleViewRow = (id) => {
    dispatch(resetItem('processo'));
    navigate({
      pathname: `${PATH_DIGITALDOCS.arquivo.root}/${id}`,
      search: createSearchParams({ from: 'arquivo' }).toString(),
    });
  };

  const pedidosAcessoLabel = [];
  pedidosAcesso?.forEach((row) => {
    const colaborador = colaboradores?.find((colab) => colab?.perfil_id === row.perfil_id);
    if (colaborador) {
      pedidosAcessoLabel.push({
        criado_em: row?.criado_em,
        uo: colaborador?.uo?.label,
        processo: row?.processo_id,
        processo_id: row?.processo_id,
        nome: colaborador?.perfil?.displayName,
      });
    }
  });

  const dataFiltered = applySortFilter({
    pedidosAcessoLabel,
    comparator: getComparator(order, orderBy),
    filterSearch,
  });
  const isNotFound = !dataFiltered.length;

  return (
    <RoleBasedGuard hasContent roles={['arquivo-100', 'arquivo-110', 'arquivo-111']}>
      <HeaderBreadcrumbs
        heading="Pedidos de acesso"
        links={[{ name: '', href: '' }]}
        action=""
        sx={{ color: 'text.secondary', m: 0, px: 1 }}
      />
      <Card sx={{ p: 1 }}>
        {dataFiltered.length > 1 && (
          <SearchToolbar2 origem="pedidos" filterSearch={filterSearch} onFilterSearch={handleFilterSearch} />
        )}
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={4} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow hover key={row.criado_em}>
                      <TableCell>{row.nome}</TableCell>
                      <TableCell>{row.processo}</TableCell>
                      <TableCell align="center">{row?.criado_em && ptDateTime(row?.criado_em)}</TableCell>
                      <TableCell align="center" width={50}>
                        <Tooltip title="VER PROCESSO" arrow>
                          <Fab
                            color="success"
                            size="small"
                            variant="soft"
                            onClick={() => handleViewRow(row?.processo_id)}
                          >
                            <SvgIconStyle src="/assets/icons/view.svg" />
                          </Fab>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum pedido disponível..." />
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        {!isNotFound && dataFiltered.length > 10 && (
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
    </RoleBasedGuard>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ pedidosAcessoLabel, comparator, filterSearch }) {
  const stabilizedThis = pedidosAcessoLabel.map((el, index) => [el, index]);
  const text = filterSearch.get('filter');

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  pedidosAcessoLabel = stabilizedThis.map((el) => el[0]);

  if (text) {
    pedidosAcessoLabel = pedidosAcessoLabel.filter(
      (item) =>
        (item?.nome && item?.nome.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (item?.processo && item?.processo.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1)
    );
  }

  return pedidosAcessoLabel;
}
