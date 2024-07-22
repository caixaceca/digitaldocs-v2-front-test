import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { ptDateTime } from '../../utils/formatTime';
import { entidadesParse, noDados, baralharString } from '../../utils/formatText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Scrollbar from '../../components/Scrollbar';
import ItemAnalytic from '../../components/ItemAnalytic';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { applySortFilter } from '../parametrizacao/applySortFilter';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const TABLE_HEAD_ARQUIVOS = [
  { id: 'referencia', label: 'Referência', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Entidade(s)', align: 'left' },
  { id: 'data_last_transicao', label: 'Data', align: 'center', width: 10 },
  { id: 'empty', width: 10 },
];

const TABLE_HEAD_PEDIDOS = [
  { id: 'nome', label: 'Colaborador', align: 'left' },
  { id: 'processo_id', label: 'ID Processo', align: 'left' },
  { id: 'criado_em', label: 'Data do pedido', align: 'center' },
  { id: 'empty', width: 10 },
];

// ----------------------------------------------------------------------

TableArquivo.propTypes = { tab: PropTypes.string };

export default function TableArquivo({ tab }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState(localStorage.getItem('filterA') || '');
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const { arquivos, pedidosAcesso, indicadoresArquivo, isLoading } = useSelector((state) => state.digitaldocs);

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
  } = useTable({ defaultOrderBy: tab === 'pedidos' ? 'criado_em' : 'data_last_transicao', defaultOrder: 'desc' });

  useEffect(() => {
    if (mail && cc?.perfil_id && tab === 'arquivos') {
      dispatch(getAll('arquivados', { mail, perfilId: cc?.perfil_id }));
      dispatch(getAll('indicadores arquivos', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, cc?.perfil_id, tab, mail]);

  useEffect(() => {
    if (mail && cc?.perfil_id && tab === 'pedidos') {
      dispatch(getAll('pedidosAcesso', { perfilId: cc?.perfil_id, mail }));
    }
  }, [dispatch, cc?.perfil_id, tab, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleView = (id) => {
    navigate(`${PATH_DIGITALDOCS.arquivo.root}/${id}?from=Arquivos`);
  };

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados: tab === 'arquivos' ? arquivos : pedidos(pedidosAcesso, colaboradores),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <RoleBasedGuard hasContent roles={['arquivo-100', 'arquivo-110', 'arquivo-111']}>
      {tab === 'arquivos' && (
        <Card sx={{ mb: 3 }}>
          <Scrollbar>
            <Stack
              sx={{ py: 2 }}
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            >
              <ItemAnalytic title="Total" color="success.main" total={indicadoresArquivo?.total} />
              <ItemAnalytic
                title="Últimos 24H"
                total={indicadoresArquivo?.totallast24}
                percent={(indicadoresArquivo?.totallast24 * 100) / indicadoresArquivo?.total}
              />
              <ItemAnalytic
                title="Neste mês"
                total={indicadoresArquivo?.totalmes}
                percent={(indicadoresArquivo?.totalmes * 100) / indicadoresArquivo?.total}
              />
              <ItemAnalytic
                title="Neste ano"
                total={indicadoresArquivo?.totalano}
                percent={(indicadoresArquivo?.totalano * 100) / indicadoresArquivo?.total}
              />
            </Stack>
          </Scrollbar>
        </Card>
      )}
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item="filterA" filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={tab === 'arquivos' ? TABLE_HEAD_ARQUIVOS : TABLE_HEAD_PEDIDOS}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={tab === 'arquivos' ? 5 : 4} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <>
                      {tab === 'arquivos' ? (
                        <TableRow hover key={`${tab}_${index}`}>
                          <TableCell>{row.referencia}</TableCell>
                          <TableCell>{row?.titular ? baralharString(row.titular) : noDados()}</TableCell>
                          <TableCell>
                            {(row?.entidades && baralharString(entidadesParse(row?.entidades))) || noDados()}
                          </TableCell>
                          <TableCell align="center">
                            {row?.data_last_transicao && (
                              <Typography variant="body2" noWrap>
                                {ptDateTime(row?.data_last_transicao)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <DefaultAction label="DETALHES" handleClick={() => handleView(row?.id)} />
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow hover key={`${tab}_${index}`}>
                          <TableCell>{baralharString(row?.nome)}</TableCell>
                          <TableCell>{row?.processo_id}</TableCell>
                          <TableCell align="center" width={50}>
                            {row?.criado_em && (
                              <Typography variant="body2" noWrap>
                                {ptDateTime(row?.criado_em)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <DefaultAction label="DETALHES" handleClick={() => handleView(row?.processo_id)} />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum processo arquivado disponível..." />
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
    </RoleBasedGuard>
  );
}

// ----------------------------------------------------------------------

function pedidos(dados, colaboradores) {
  const pedidos = [];
  dados?.forEach((row) => {
    const colaborador = colaboradores?.find((colab) => colab?.perfil_id === row.perfil_id);
    if (colaborador) {
      pedidos.push({ ...row, nome: colaborador?.perfil?.displayName });
    }
  });
  return pedidos;
}
