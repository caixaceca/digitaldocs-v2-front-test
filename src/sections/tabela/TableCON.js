import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fCurrency } from '../../utils/formatNumber';
import { normalizeText, noDados, baralharString } from '../../utils/formatText';
import { ptDate, ptDateTime, getDataLS, dataValido } from '../../utils/formatTime';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// Components
import { RHFDateIF } from '../../components/hook-form';
import { SkeletonTable } from '../../components/skeleton';
import { Checked, Criado, Registos } from '../../components/Panel';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { ExportExcel, DefaultAction } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// _mock
import { dis } from '../../_mock';

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
    if (mail && item === 'con') {
      dispatch(
        getAll('con', {
          mail,
          dataFim: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
          dataInicio: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
        })
      );
    }
  }, [dispatch, mail, item, datai, dataf]);

  useEffect(() => {
    if (mail && item === 'pjf') {
      dispatch(getAll('pjf', { mail, pagina: 0, reset: true }));
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
      dispatch(getAll('pjf', { mail, pagina: processosInfo?.proxima_pagina, reset: false }));
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
              <Stack>
                <ExportExcel
                  table="tabel-con"
                  sheet={title}
                  filename={`${title} ${dataValido(datai) && item === 'con' ? format(datai, 'yyyy-MM-dd') : ''} - ${
                    dataValido(dataf) && item === 'con' ? format(dataf, 'yyyy-MM-dd') : ''
                  }`}
                />
              </Stack>
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

        {!isNotFound && (
          <Table id="tabel-con" sx={{ display: 'none' }}>
            <TableHead>
              <TableRow>
                {Object.keys(dataFiltered?.[0])
                  ?.filter((item) => item !== 'id')
                  ?.map((row) => (
                    <TableCell key={`${row}_cabecalho`}>{row}</TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dataFiltered?.map((row, index) => (
                <TableRow key={`dados_${index}`}>
                  {Object.keys(dataFiltered?.[0])
                    ?.filter((item) => item !== 'id')
                    ?.map((reg) => (
                      <TableCell key={`${reg}_dados`}>
                        {(reg === 'residente' && <>{row[reg] ? 'Sim' : 'Não'}</>) ||
                          (reg === 'titular_ordenador' && <>{row[reg] ? 'Sim' : 'Não'}</>) ||
                          (reg === 'criado_em' && <>{row[reg] ? ptDateTime(row[reg]) : ''}</>) ||
                          (reg === 'tipo_doc_idp' && (
                            <>{dis?.find((di) => di?.id === row[reg])?.label || row[reg]}</>
                          )) ||
                          (reg === 'tipo_doc_ids' && (
                            <>{dis?.find((di) => di?.id === row[reg])?.label || row[reg]}</>
                          )) ||
                          row[reg]}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
