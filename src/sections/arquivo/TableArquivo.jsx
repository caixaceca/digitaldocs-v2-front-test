import { format } from 'date-fns';
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { entidadesParse, baralharString } from '../../utils/formatText';
import { ptDateTime, getDataLS, dataValido, setDataUtil } from '../../utils/formatTime';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getIndicadores } from '../../redux/slices/indicadores';
import { getListaProcessos } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Scrollbar from '../../components/Scrollbar';
import ItemAnalytic from '../../components/ItemAnalytic';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { DefaultAction, MaisProcessos } from '../../components/Actions';
import { Criado, ColaboradorInfo, noDados } from '../../components/Panel';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { applySortFilter } from '../parametrizacao/applySortFilter';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ---------------------------------------------------------------------------------------------------------------------

const TABLE_HEAD_ARQUIVOS = [
  { id: 'referencia', label: 'Referência' },
  { id: 'titular', label: 'Titular' },
  { id: 'entidades', label: 'Entidade(s)' },
  { id: 'assunto', label: 'Assunto' },
  { id: 'uo', label: 'U.O' },
  { id: 'data_arquivamento', label: 'Data arquivo', align: 'center' },
  { id: '', width: 10 },
];

const TABLE_HEAD_PEDIDOS = [
  { id: 'nome', label: 'Colaborador' },
  { id: 'processo_id', label: 'ID Processo' },
  { id: 'criado_em', label: 'Data do pedido', align: 'center' },
  { id: '', width: 10 },
];

// ---------------------------------------------------------------------------------------------------------------------

export default function TableArquivo({ tab }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { indicadoresArquivo } = useSelector((state) => state.indicadores);
  const { perfilId, colaboradores, uos } = useSelector((state) => state.intranet);
  const { arquivos, pedidosAcesso, cursor, isLoading } = useSelector((state) => state.digitaldocs);
  const [filter, setFilter] = useState(localStorage.getItem('filterArq') || '');
  const [data, setData] = useState(getDataLS('dataArq', new Date(new Date().getFullYear(), 0, 1)));

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
  } = useTable({});

  useEffect(() => {
    if (perfilId) {
      dispatch(getListaProcessos(tab, { cursor: 0, apartir: dataValido(data) ? format(data, 'yyyy-MM-dd') : '' }));
      if (tab === 'arquivos') dispatch(getIndicadores('indicadoresArquivo', { item: 'indicadoresArquivo' }));
    }
  }, [data, dispatch, perfilId, tab]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados: pedidosList(tab === 'pedidosAcesso' ? pedidosAcesso : arquivos, colaboradores, uos),
  });
  const isNotFound = !dataFiltered.length;

  const handleView = (id) => {
    navigate(`${PATH_DIGITALDOCS.arquivo.root}/${id}?from=Arquivos`);
  };

  const mostrarMais = () => {
    dispatch(getListaProcessos(tab, { cursor, apartir: dataValido(data) ? format(data, 'yyyy-MM-dd') : '' }));
  };

  return (
    <RoleBasedGuard hasContent roles={['arquivo-100', 'arquivo-110', 'arquivo-111']}>
      <HeaderBreadcrumbs
        sx={{ color: 'text.secondary', px: 1 }}
        heading={(tab === 'arquivos' && 'Processos arquivados') || (tab === 'pedidosAcesso' && 'Pedidos de acesso')}
      />
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
        <SearchToolbarSimple item="filterArq" filter={filter} setFilter={setFilter}>
          {tab === 'arquivos' && (
            <DatePicker
              value={data}
              label="Apartir de"
              maxDate={new Date()}
              slotProps={{ textField: { fullWidth: true, sx: { maxWidth: 170 } } }}
              onChange={(newValue) => setDataUtil(newValue, setData, 'dataArq', '', '', '')}
            />
          )}
        </SearchToolbarSimple>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={(tab === 'pedidosAcesso' && TABLE_HEAD_PEDIDOS) || TABLE_HEAD_ARQUIVOS}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={(tab === 'pedidosAcesso' && 4) || 7} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <>
                      {(tab === 'pedidosAcesso' && (
                        <TableRow hover key={`${tab}_pa_${index}`}>
                          <TableCell>
                            <ColaboradorInfo id={row?.cid} nome={row?.nome} label={row?.uoColab} foto={row?.foto} />
                          </TableCell>
                          <TableCell>{row?.processo_id}</TableCell>
                          <TableCell align="center" width={50}>
                            <Typography noWrap variant="body2">
                              {row?.criado_em && ptDateTime(row?.criado_em)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <DefaultAction label="DETALHES" onClick={() => handleView(row?.processo_id)} />
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow hover key={`${tab}_arq_${index}`}>
                          <TableCell>{row.referencia}</TableCell>
                          <TableCell>{row?.titular ? baralharString(row.titular) : noDados()}</TableCell>
                          <TableCell>
                            {row?.entidades ? baralharString(entidadesParse(row?.entidades)) : noDados()}
                          </TableCell>
                          <TableCell>{row.assunto}</TableCell>
                          <TableCell width={10}>
                            {row?.uo && <Criado value={row?.uo} />}
                            {row?.balcao && <Criado value={`Balcão: ${row.balcao}`} caption />}
                          </TableCell>
                          <TableCell align="center" width={10}>
                            {row?.data_arquivamento ? <Criado value={ptDateTime(row?.data_arquivamento)} /> : noDados()}
                          </TableCell>
                          <TableCell align="center">
                            <DefaultAction label="DETALHES" onClick={() => handleView(row?.id)} />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum processo disponível..." />
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
      {page + 1 === Math.ceil(dataFiltered.length / rowsPerPage) && cursor && (
        <MaisProcessos verMais={() => mostrarMais()} />
      )}
    </RoleBasedGuard>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function pedidosList(dados, colaboradores, uos) {
  const pedidos = [];
  dados?.forEach((row) => {
    const uo = uos?.find(({ id }) => Number(id) === Number(row.uo_id));
    const colaborador = colaboradores?.find(({ perfil_id: pid }) => pid === row.perfil_id);
    pedidos.push({
      ...row,
      balcao: uo?.balcao,
      cid: colaborador?.id,
      uo: uo?.label || row?.uo_id,
      foto: colaborador?.foto_anexo,
      uoColab: colaborador?.uo_label,
      nome: colaborador?.nome || row.perfil_id,
    });
  });
  return pedidos;
}
