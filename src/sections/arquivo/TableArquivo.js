import { format } from 'date-fns';
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
import TableContainer from '@mui/material/TableContainer';
// utils
import { ptDateTime, getDataLS, dataValido } from '../../utils/formatTime';
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
import { RHFDateIF } from '../../components/hook-form';
import ItemAnalytic from '../../components/ItemAnalytic';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { Criado, Registos } from '../../components/Panel';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
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
  { id: '', width: 10 },
];

const TABLE_HEAD_PEDIDOS = [
  { id: 'nome', label: 'Colaborador', align: 'left' },
  { id: 'processo_id', label: 'ID Processo', align: 'left' },
  { id: 'criado_em', label: 'Data do pedido', align: 'center' },
  { id: '', width: 10 },
];

const TABLE_HEAD_RESTAUROS = [
  { id: 'numero_entrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'conta', label: 'Cliente/Conta', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'estado_atual', label: 'Estado', align: 'left' },
  { id: 'criado_em	', label: 'Criado', width: 10, align: 'left' },
  { id: '', width: 10 },
];

// ----------------------------------------------------------------------

TableArquivo.propTypes = { tab: PropTypes.string };

export default function TableArquivo({ tab }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [datai, setDatai] = useState(getDataLS('dataIArq', null));
  const [dataf, setDataf] = useState(getDataLS('dataFArq', null));
  const [filter, setFilter] = useState(localStorage.getItem('filterArq') || '');
  const { mail, perfilId, colaboradores } = useSelector((state) => state.intranet);
  const { arquivos, pedidos, restauros, processosInfo, indicadoresArquivo, isLoading } = useSelector(
    (state) => state.digitaldocs
  );

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
  } = useTable({
    defaultOrder: 'desc',
    defaultOrderBy: (tab === 'restauros' && 'id') || (tab === 'pedidosAcesso' && 'data_last_transicao') || 'criado_em',
  });

  useEffect(() => {
    dispatch(
      getAll(tab, {
        mail,
        perfilId,
        pagina: 0,
        dataf: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
        datai: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
      })
    );
    if (mail && perfilId && tab === 'arquivos') {
      dispatch(getAll('indicadores arquivos', { mail, perfilId }));
    }
  }, [dispatch, perfilId, datai, dataf, tab, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados:
      (tab === 'arquivos' && arquivos) ||
      (tab === 'restauros' && restauros) ||
      (tab === 'pedidosAcesso' && pedidosList(pedidos, colaboradores)) ||
      [],
  });
  const isNotFound = !dataFiltered.length;

  const handleView = (id) => {
    navigate(`${PATH_DIGITALDOCS.arquivo.root}/${id}?from=Arquivos`);
  };

  const mostrarMais = () => {
    dispatch(
      getAll(tab, {
        mail,
        perfilId,
        pagina: processosInfo?.proxima_pagina,
        dataf: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
        datai: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
      })
    );
  };

  return (
    <RoleBasedGuard hasContent roles={['arquivo-100', 'arquivo-110', 'arquivo-111']}>
      <HeaderBreadcrumbs
        sx={{ color: 'text.secondary', px: 1 }}
        heading={
          (tab === 'arquivos' && 'Processos arquivados') ||
          (tab === 'pedidosAcesso' && 'Pedidos de acesso') ||
          (tab === 'restauros' && 'Histórico de restauros')
        }
        action={
          tab === 'restauros' && (
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1}>
              <Registos info={processosInfo} total={restauros?.length} handleClick={() => mostrarMais()} />
              <RHFDateIF
                clearable
                datai={datai}
                dataf={dataf}
                labeli="dataIArq"
                labelf="dataFArq"
                setDatai={setDatai}
                setDataf={setDataf}
              />
            </Stack>
          )
        }
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
        <SearchToolbarSimple item="filterArq" filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={
                  (tab === 'pedidosAcesso' && TABLE_HEAD_PEDIDOS) ||
                  (tab === 'restauros' && TABLE_HEAD_RESTAUROS) ||
                  TABLE_HEAD_ARQUIVOS
                }
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={(tab === 'pedidosAcesso' && 4) || (tab === 'restauros' && 7) || 5} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <>
                      {(tab === 'restauros' && (
                        <TableRow hover key={`${tab}_${index}`}>
                          <TableCell>{row.numero_entrada}</TableCell>
                          <TableCell>{row?.titular ? baralharString(row.titular) : noDados()}</TableCell>
                          <TableCell>
                            {(row?.conta && baralharString(row?.conta)) ||
                              (row?.cliente && baralharString(row?.cliente)) ||
                              (row?.entidades && baralharString(entidadesParse(row?.entidades))) ||
                              noDados()}
                          </TableCell>
                          <TableCell>{row?.assunto ? row?.assunto : noDados()}</TableCell>
                          <TableCell>{row?.estado_atual ? row?.estado_atual : noDados()}</TableCell>
                          <TableCell>
                            {(row?.criado_em || row?.trabalhado_em) && (
                              <Criado caption tipo="data" value={ptDateTime(row.criado_em || row?.trabalhado_em)} />
                            )}
                            {row?.criado_por && <Criado tipo="user" value={row.criado_por} baralhar caption />}
                          </TableCell>
                          <TableCell align="center">
                            <DefaultAction label="DETALHES" handleClick={() => handleView(row?.processo_id)} />
                          </TableCell>
                        </TableRow>
                      )) ||
                        (tab === 'pedidosAcesso' && (
                          <TableRow hover key={`${tab}_${index}`}>
                            <TableCell>{baralharString(row?.nome)}</TableCell>
                            <TableCell>{row?.processo_id}</TableCell>
                            <TableCell align="center" width={50}>
                              {row?.criado_em && ptDateTime(row?.criado_em)}
                            </TableCell>
                            <TableCell align="center">
                              <DefaultAction label="DETALHES" handleClick={() => handleView(row?.processo_id)} />
                            </TableCell>
                          </TableRow>
                        )) || (
                          <TableRow hover key={`${tab}_${index}`}>
                            <TableCell>{row.referencia}</TableCell>
                            <TableCell>{row?.titular ? baralharString(row.titular) : noDados()}</TableCell>
                            <TableCell>
                              {row?.entidades ? baralharString(entidadesParse(row?.entidades)) : noDados()}
                            </TableCell>
                            <TableCell align="center">
                              {row?.data_last_transicao ? (
                                <Criado value={ptDateTime(row?.data_last_transicao)} />
                              ) : (
                                noDados()
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <DefaultAction label="DETALHES" handleClick={() => handleView(row?.id)} />
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
    </RoleBasedGuard>
  );
}

// ----------------------------------------------------------------------

function pedidosList(dados, colaboradores) {
  const pedidos = [];
  dados?.forEach((row) => {
    const colaborador = colaboradores?.find((colab) => colab?.perfil_id === row.perfil_id);
    pedidos.push({ ...row, nome: colaborador?.perfil?.displayName || row.perfil_id });
  });
  return pedidos;
}
