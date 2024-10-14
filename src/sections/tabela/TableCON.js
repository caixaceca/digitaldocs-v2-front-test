import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fCurrency } from '../../utils/formatNumber';
import { normalizeText, noDados, baralharString } from '../../utils/formatText';
import { ptDate, ptDateTime, getDataLS, dataValido, dataLabel } from '../../utils/formatTime';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// Components
import { RHFDateIF } from '../../components/hook-form';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { Checked, Criado, Registos } from '../../components/Panel';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { ExportarDados } from '../../components/ExportDados/ToExcell/DadosControle';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD_CON = [
  { id: 'nome_cliente', label: 'Cliente', align: 'left' },
  { id: 'titular_ordenador', label: 'Ordenador', align: 'center' },
  { id: 'conta_processo', label: 'Nº de conta', align: 'right' },
  { id: 'Valor', label: 'Valor', align: 'right' },
  { id: 'cdg_operacao', label: 'Cod. operação', align: 'right' },
  { id: 'data_entrada', label: 'Data', align: 'center' },
  { id: 'empty', width: 10 },
];

const TABLE_HEAD_JF = [
  { id: 'referencia', label: 'Referência', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'origem', label: 'Origem', align: 'left' },
  { id: 'doc_1', label: 'Doc. identificação', align: 'left' },
  { id: 'operacao', label: 'Operação', align: 'left' },
  { id: 'data_entrada', label: 'Registo', align: 'left' },
  { id: 'empty', width: 10 },
];

// ----------------------------------------------------------------------

TableCON.propTypes = { item: PropTypes.string };

export default function TableCON({ item = 'con' }) {
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
  } = useTable({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mail } = useSelector((state) => state.intranet);
  const { con, pjf, processosInfo, isLoading } = useSelector((state) => state.digitaldocs);
  const [dataf, setDataf] = useState(getDataLS('dataFCon', new Date()));
  const [filter, setFilter] = useState(localStorage.getItem('filterCon') || '');
  const title = (item === 'pjf' && 'Processos Judiciais e Fiscais') || 'Comunicação Operação Numerário';
  const [datai, setDatai] = useState(
    getDataLS('dataICon', new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  );

  useEffect(() => {
    if (mail && item === 'con' && dataValido(datai) && dataValido(dataf)) {
      dispatch(getAll('con', { mail, dataFim: format(dataf, 'yyyy-MM-dd'), dataInicio: format(datai, 'yyyy-MM-dd') }));
    }
  }, [dispatch, mail, item, datai, dataf]);

  useEffect(() => {
    if (mail && item === 'pjf') {
      dispatch(getAll('pjf', { mail, pagina: 0 }));
    }
  }, [dispatch, mail, item]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    filter,
    dados: (item === 'pjf' && pjf) || con,
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  const mostrarMais = () => {
    if (mail && item === 'pjf' && processosInfo?.proxima_pagina) {
      dispatch(getAll('pjf', { mail, pagina: processosInfo?.proxima_pagina }));
    }
  };

  const handleView = (id) => {
    navigate(`${PATH_DIGITALDOCS.processos.root}/${id}?from=Controle`);
  };

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={title}
        action={
          <Stack direction="row" alignItems="center" spacing={1}>
            {item === 'con' && (
              <RHFDateIF
                datai={datai}
                dataf={dataf}
                labeli="dataICon"
                labelf="dataFCon"
                setDatai={setDatai}
                setDataf={setDataf}
              />
            )}
            {item === 'pjf' && <Registos info={processosInfo} total={pjf?.length} handleClick={() => mostrarMais()} />}
            {!isNotFound && (
              <ExportarDados
                tabela={item === 'pjf' ? 'PJF' : 'CON'}
                dados={dataFiltered}
                titulo={
                  (item === 'pjf' && 'Processos Judiciais e Fiscais') ||
                  `Comunicação de operações de Numerário  - ${dataLabel(datai, dataf)}`
                }
              />
            )}
          </Stack>
        }
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item="filterCon" filter={filter} setFilter={setFilter} />
        <TableContainer sx={{ position: 'relative' }}>
          <Table size={dense ? 'small' : 'medium'}>
            <TableHeadCustom
              order={order}
              onSort={onSort}
              orderBy={orderBy}
              headLabel={(item === 'pjf' && TABLE_HEAD_JF) || TABLE_HEAD_CON}
            />
            <TableBody>
              {isLoading && isNotFound ? (
                <SkeletonTable column={7} row={10} />
              ) : (
                dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow hover key={`${row?.id}_${index}`}>
                    {(item === 'pjf' && (
                      <>
                        <TableCell>{row?.referencia}</TableCell>
                        <TableCell>{row?.titular ? baralharString(row?.titular) : noDados()}</TableCell>
                        <TableCell>{row?.origem || noDados()}</TableCell>
                        <TableCell>
                          {!row?.doc_1 && !row?.doc_2 && noDados()}
                          {row?.doc_1 && <Criado value={row.doc_1} baralhar />}
                          {row?.doc_2 && <Criado value={row.doc_2} baralhar />}
                        </TableCell>
                        <TableCell>
                          {!row?.operacao && !row?.valor && noDados()}
                          {row?.operacao && <Criado value={row.operacao} />}
                          {row?.valor && <Criado value={fCurrency(row.valor)} />}
                        </TableCell>
                        <TableCell>
                          {row?.criado_em && <Criado caption tipo="data" value={ptDateTime(row.criado_em)} />}
                          {row?.estado && <Criado caption tipo="company" value={row.estado} />}
                        </TableCell>
                      </>
                    )) || (
                      <>
                        <TableCell>{baralharString(row?.nome_cliente)}</TableCell>
                        <TableCell align="center" width={10}>
                          <Checked check={row.titular_ordenador} />
                        </TableCell>
                        <TableCell align="right">{baralharString(row?.conta_processo)}</TableCell>
                        <TableCell align="right">{row?.valor ? fCurrency(row?.valor) : noDados()}</TableCell>
                        <TableCell align="right">{row?.cdg_operacao || noDados()}</TableCell>
                        <TableCell align="center">
                          {row?.data_entrada ? ptDate(row?.data_entrada) : noDados()}
                        </TableCell>
                      </>
                    )}
                    <TableCell align="center">
                      <DefaultAction label="DETALHES" handleClick={() => handleView(row?.processo_id || row?.id)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

            {!isLoading && isNotFound && (
              <TableSearchNotFound message="Não foi encontrado nenhum registo disponível..." />
            )}
          </Table>
        </TableContainer>

        {!isNotFound && dataFiltered.length > 10 && (
          <TablePaginationAlt
            page={page}
            dense={dense}
            rowsPerPage={rowsPerPage}
            count={dataFiltered.length}
            onChangePage={onChangePage}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        )}
      </Card>
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ dados, comparator, filter }) {
  dados = applySort(dados, comparator);
  if (filter) {
    dados = dados.filter(
      (row) =>
        (row?.conta_processo && normalizeText(row?.conta_processo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nome_cliente && normalizeText(row?.nome_cliente).indexOf(normalizeText(filter)) !== -1) ||
        (row?.cdg_operacao && normalizeText(row?.cdg_operacao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.ordenador && normalizeText(row?.ordenador).indexOf(normalizeText(filter)) !== -1) ||
        (row?.operacao && normalizeText(row?.operacao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(filter)) !== -1) ||
        (row?.origem && normalizeText(row?.origem).indexOf(normalizeText(filter)) !== -1) ||
        (row?.docid && normalizeText(row?.docid).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nif && normalizeText(row?.nif).indexOf(normalizeText(filter)) !== -1)
    );
  }
  return dados;
}
