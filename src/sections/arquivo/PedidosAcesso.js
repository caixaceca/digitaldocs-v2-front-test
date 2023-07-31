import { useEffect } from 'react';
import { useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
// @mui
import { Fab, Card, Table, Tooltip, TableRow, TableBody, TableCell, Typography, TableContainer } from '@mui/material';
// utils
import { ptDateTime } from '../../utils/formatTime';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, resetItem } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbar } from '../../components/SearchToolbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { applySortFilter } from '../parametrizacao/applySortFilter';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Colaborador', align: 'left' },
  { id: 'processo', label: 'ID Processo', align: 'left' },
  { id: 'criado_em', label: 'Data do pedido', align: 'center' },
  { id: 'empty', width: 50 },
];

// ----------------------------------------------------------------------

export default function PedidosAcesso() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filter, setFilter] = useSearchParams();
  const { pedidosAcesso, isLoading } = useSelector((state) => state.digitaldocs);
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);

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

  useEffect(() => {
    if (mail && cc?.perfil_id) {
      dispatch(getAll('pedidosAcesso', { perfilId: cc?.perfil_id, mail }));
    }
  }, [dispatch, cc?.perfil_id, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

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
    dados: pedidosAcessoLabel,
    filter: filter.get('filter'),
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <RoleBasedGuard hasContent roles={['arquivo-100', 'arquivo-110', 'arquivo-111']}>
      <HeaderBreadcrumbs
        action=""
        heading="Pedidos de acesso"
        links={[{ name: '', href: '' }]}
        sx={{ color: 'text.secondary', m: 0, px: 1 }}
      />
      <Card sx={{ p: 1 }}>
        {pedidosAcessoLabel.length > 1 && <SearchToolbar tab="pedidos" filter={filter} setFilter={setFilter} />}
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
                      <TableCell align="center" width={50}>
                        {row?.criado_em && (
                          <Typography variant="body2" noWrap>
                            {ptDateTime(row?.criado_em)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
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
