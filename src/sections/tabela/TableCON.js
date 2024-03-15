import PropTypes from 'prop-types';
import { add, format } from 'date-fns';
import { useEffect, useState } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { fCurrency } from '../../utils/formatNumber';
import { ptDate, ptDateTime } from '../../utils/formatTime';
import { normalizeText, dataValido, setDataUtil } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// Components
import Scrollbar from '../../components/Scrollbar';
import { ExportExcel } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { Checked, Criado, Registos } from '../../components/Panel';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// _mock
import { dis, estadosCivis } from '../../_mock';

// ----------------------------------------------------------------------

const TABLE_HEAD_CON = [
  { id: 'titular_ordenador', label: 'Titular', align: 'center' },
  { id: 'ordenador', label: 'Ordenador', align: 'left' },
  { id: 'docid', label: 'Doc. identificação', align: 'left' },
  { id: 'nif', label: 'NIF', align: 'left' },
  { id: 'data_nascimento', label: 'Data nascimento', align: 'left' },
  { id: 'estado_civil', label: 'Estado civil', align: 'left' },
  { id: 'pai', label: 'Pai', align: 'left' },
  { id: 'mae', label: 'Mãe', align: 'left' },
];

const TABLE_HEAD_JF = [
  { id: 'referencia', label: 'Referência', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'origem', label: 'Origem', align: 'left' },
  { id: 'doc_1', label: 'Doc. identificação', align: 'left' },
  { id: 'operacao', label: 'Operação', align: 'left' },
  { id: 'estado', label: 'Estado', align: 'left' },
  { id: 'criado_em', label: 'Registo', align: 'left' },
];

// ----------------------------------------------------------------------

TableCON.propTypes = { isCon: PropTypes.bool };

export default function TableCON({ isCon = false }) {
  const dispatch = useDispatch();
  const { mail } = useSelector((state) => state.intranet);
  const { con, pjf, pjfInfo, isLoading } = useSelector((state) => state.digitaldocs);
  const [filter, setFilter] = useState(localStorage.getItem('filterCon') || '');
  const title = isCon ? 'Comunicação Operação Numerário' : 'Processos Judiciais e Fiscais';
  const [datai, setDatai] = useState(
    localStorage.getItem('dataICon')
      ? add(new Date(localStorage.getItem('dataICon')), { hours: 2 })
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [dataf, setDataf] = useState(
    localStorage.getItem('dataFCon') ? add(new Date(localStorage.getItem('dataFCon')), { hours: 2 }) : new Date()
  );

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

  useEffect(() => {
    if (mail && isCon) {
      dispatch(
        getAll('con', {
          mail,
          dataFim: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
          dataInicio: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
        })
      );
    }
  }, [dispatch, mail, isCon, datai, dataf]);

  useEffect(() => {
    if (mail && !isCon) {
      dispatch(getAll('pjf', { mail, pagina: 0, reset: true }));
    }
  }, [dispatch, mail, isCon]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({ dados: isCon ? con : pjf, filter, comparator: getComparator(order, orderBy) });
  const isNotFound = !dataFiltered.length;

  const mostrarMais = () => {
    if (mail && !isCon && pjfInfo?.proxima_pagina) {
      dispatch(getAll('pjf', { mail, pagina: pjfInfo?.proxima_pagina, reset: false }));
    }
  };

  return (
    <>
      <HeaderBreadcrumbs
        heading={title}
        links={[{ name: '' }]}
        sx={{ color: 'text.secondary', px: 1 }}
        action={
          <Stack direction="row" alignItems="center" spacing={1}>
            {isCon ? (
              <>
                <DatePicker
                  value={datai}
                  label="Data inicial"
                  slotProps={{ textField: { fullWidth: true, size: 'small', sx: { width: 160 } } }}
                  onChange={(newValue) => setDataUtil(newValue, setDatai, 'dataICon', setDataf, 'dataFCon', dataf)}
                />
                <DatePicker
                  value={dataf}
                  minDate={datai}
                  disabled={!datai}
                  label="Data final"
                  slotProps={{ textField: { fullWidth: true, size: 'small', sx: { width: 160 } } }}
                  onChange={(newValue) => setDataUtil(newValue, setDataf, 'dataFCon', '', '', '')}
                />
              </>
            ) : (
              <Registos info={pjfInfo} total={pjf?.length} handleClick={mostrarMais} />
            )}
            {!isNotFound && (
              <Stack>
                <ExportExcel
                  table="tabel-con"
                  sheet={title}
                  filename={`${title} ${dataValido(datai) && isCon ? format(datai, 'yyyy-MM-dd') : ''} - ${
                    dataValido(dataf) && isCon ? format(dataf, 'yyyy-MM-dd') : ''
                  }`}
                />
              </Stack>
            )}
          </Stack>
        }
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item="filterCon" filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={isCon ? TABLE_HEAD_CON : TABLE_HEAD_JF}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={isCon ? 8 : 7} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow key={`${row?.id}_${index}`} hover>
                      {isCon ? (
                        <>
                          <TableCell align="center" width={10}>
                            <Checked check={row.titular_ordenador} />
                          </TableCell>
                          <TableCell>{row?.ordenador}</TableCell>
                          <TableCell>{row?.docid}</TableCell>
                          <TableCell>{row?.nif}</TableCell>
                          <TableCell>{row?.data_nascimento ? ptDate(row?.data_nascimento) : ''}</TableCell>
                          <TableCell>
                            {estadosCivis?.find((item) => item?.id === row?.estado_civil)?.label || row?.estado_civil}
                          </TableCell>
                          <TableCell>{row?.pai}</TableCell>
                          <TableCell>{row?.mae}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{row?.referencia}</TableCell>
                          <TableCell>{row?.titular}</TableCell>
                          <TableCell>{row?.origem}</TableCell>
                          <TableCell>
                            {row?.doc_1 && <Criado value={row.doc_1} />}
                            {row?.doc_1 && <Criado value={row.doc_2} />}
                          </TableCell>
                          <TableCell>
                            {row?.operacao && <Criado value={row.operacao} />}
                            {row?.valor && <Criado value={fCurrency(row.valor)} />}
                          </TableCell>
                          <TableCell>{row?.estado}</TableCell>
                          <TableCell>
                            {row?.data_entrada && <Criado tipo="date" value={ptDate(row.data_entrada)} />}
                            {row?.criado_em && <Criado tipo="time" value={ptDateTime(row.criado_em)} />}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum registo disponível..." />
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

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
              {isCon ? (
                <TableRow>
                  <TableCell>Titular</TableCell>
                  <TableCell>Ordenador</TableCell>
                  <TableCell>Tipo doc. identificação</TableCell>
                  <TableCell>Doc. identificação</TableCell>
                  <TableCell>NIF</TableCell>
                  <TableCell>Estado civil</TableCell>
                  <TableCell>Data nascimento</TableCell>
                  <TableCell>Pai</TableCell>
                  <TableCell>Mãe</TableCell>
                  <TableCell>Local/País nascimento</TableCell>
                  <TableCell>Nacionalidade</TableCell>
                  <TableCell>Profissão</TableCell>
                  <TableCell>Beneficiário residente</TableCell>
                  <TableCell>Morada</TableCell>
                  <TableCell>Local de trabalho</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Telemóvel</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Origem dos fundos</TableCell>
                  <TableCell>Finalidade dos fundos</TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell>Referência</TableCell>
                  <TableCell>Titular</TableCell>
                  <TableCell>Origem</TableCell>
                  <TableCell>Documento 1</TableCell>
                  <TableCell>Documento 2</TableCell>
                  <TableCell>Operação</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Data entrada</TableCell>
                  <TableCell>Data registo</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              )}
            </TableHead>
            <TableBody>
              {dataFiltered?.map((row, index) =>
                isCon ? (
                  <TableRow key={`con_${index}`}>
                    <TableCell>{row.titular_ordenador ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>{row?.ordenador}</TableCell>
                    <TableCell>{dis?.find((item) => item?.id === row?.tipo_docid)?.label || row?.tipo_docid}</TableCell>
                    <TableCell>{row?.docid}</TableCell>
                    <TableCell>{row?.nif}</TableCell>
                    <TableCell>
                      {estadosCivis?.find((item) => item?.id === row?.estado_civil)?.label || row?.estado_civil}
                    </TableCell>
                    <TableCell>{row?.data_nascimento}</TableCell>
                    <TableCell>{row?.pai}</TableCell>
                    <TableCell>{row?.mae}</TableCell>
                    <TableCell>{row?.local_pais_nascimento}</TableCell>
                    <TableCell>{row?.nacionalidade}</TableCell>
                    <TableCell>{row?.profissao}</TableCell>
                    <TableCell>{row?.residente ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>{row?.morada}</TableCell>
                    <TableCell>{row?.local_trabalho}</TableCell>
                    <TableCell>{row?.telefone}</TableCell>
                    <TableCell>{row?.telemovel}</TableCell>
                    <TableCell>{row?.email}</TableCell>
                    <TableCell>{row?.origem_fundo}</TableCell>
                    <TableCell>{row?.finalidade_fundo}</TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={`pjf_${index}`}>
                    <TableCell>{row?.referencia}&nbsp;</TableCell>
                    <TableCell>{row?.titular}</TableCell>
                    <TableCell>{row?.origem}</TableCell>
                    <TableCell>{row?.doc_1}&nbsp;</TableCell>
                    <TableCell>{row?.doc_2}&nbsp;</TableCell>
                    <TableCell>{row?.operacao}</TableCell>
                    <TableCell>{row?.valor ? fCurrency(row?.valor) : ''}</TableCell>
                    <TableCell>{row?.data_entrada ? ptDate(row?.data_entrada) : ''}</TableCell>
                    <TableCell>{row?.criado_em ? ptDateTime(row?.criado_em) : ''}</TableCell>
                    <TableCell>{row?.estado}</TableCell>
                  </TableRow>
                )
              )}
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
        (row?.referencia && normalizeText(row?.referencia).indexOf(normalizeText(filter)) !== -1) ||
        (row?.ordenador && normalizeText(row?.ordenador).indexOf(normalizeText(filter)) !== -1) ||
        (row?.operacao && normalizeText(row?.operacao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(filter)) !== -1) ||
        (row?.origem && normalizeText(row?.origem).indexOf(normalizeText(filter)) !== -1) ||
        (row?.docid && normalizeText(row?.docid).indexOf(normalizeText(filter)) !== -1) ||
        (row?.pai && normalizeText(row?.pai).indexOf(normalizeText(filter)) !== -1) ||
        (row?.mae && normalizeText(row?.mae).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nif && normalizeText(row?.nif).indexOf(normalizeText(filter)) !== -1)
    );
  }
  return dados;
}
