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
import { normalizeText, dataValido, setDataUtil, shuffleString } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// Components
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

const TABLE_HEAD_RECONCILIACAO = [
  { id: 'cdg_swift', label: 'Código SWIFT', align: 'left' },
  { id: 'numero_sequencia_msg', label: 'Nº seq. msg.', align: 'left' },
  { id: 'referencia', label: 'Referência', align: 'left' },
  { id: 'campo', label: 'Campo', align: 'left' },
  { id: 'indice_ocorrencia', label: 'Índice', align: 'left' },
  { id: 'comprimento', label: 'Comprimento', align: 'left' },
  { id: 'valor_numerico', label: 'Valor numérico', align: 'left' },
  { id: 'moeda', label: 'Moeda', align: 'left' },
  { id: 'tipo_operacao', label: 'Tipo operação', align: 'left' },
  { id: 'data_valor', label: 'Data valor', align: 'left' },
  { id: 'data_registo', label: 'Data registo', align: 'left' },
  { id: 'ref1', label: 'Ref. 1', align: 'left' },
  { id: 'ref2', label: 'Ref. 2', align: 'left' },
  { id: 'descritivo', label: 'Descritivo', align: 'left' },
  { id: 'nota', label: 'Nota', align: 'left' },
  { id: 'saldo_apos_movimento', label: 'Saldo após', align: 'left' },
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
  const { mail, cc } = useSelector((state) => state.intranet);
  const { con, pjf, reconciliacao, pjfInfo, isLoading } = useSelector((state) => state.digitaldocs);
  const [filter, setFilter] = useState(localStorage.getItem('filterCon') || '');
  const title =
    (item === 'reconciliacao' && 'Reconciliação') ||
    (item === 'pjf' && 'Processos Judiciais e Fiscais') ||
    'Comunicação Operação Numerário';
  const [datai, setDatai] = useState(
    localStorage.getItem('dataICon')
      ? add(new Date(localStorage.getItem('dataICon')), { hours: 2 })
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [dataf, setDataf] = useState(
    localStorage.getItem('dataFCon') ? add(new Date(localStorage.getItem('dataFCon')), { hours: 2 }) : new Date()
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
    if (mail && item === 'reconciliacao') {
      dispatch(getAll('reconciliacao', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, mail, item, cc?.perfil_id]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados: (item === 'reconciliacao' && reconciliacao) || (item === 'pjf' && pjf) || con,
  });
  const isNotFound = !dataFiltered.length;

  const mostrarMais = () => {
    if (mail && item === 'pjf' && pjfInfo?.proxima_pagina) {
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
            {item === 'con' && (
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
            )}
            {item === 'pjf' && <Registos info={pjfInfo} total={pjf?.length} handleClick={mostrarMais} />}
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
              headLabel={
                (item === 'reconciliacao' && TABLE_HEAD_RECONCILIACAO) ||
                (item === 'pjf' && TABLE_HEAD_JF) ||
                TABLE_HEAD_CON
              }
            />
            <TableBody>
              {isLoading && isNotFound ? (
                <SkeletonTable column={(item === 'reconciliacao' && 16) || (item === 'pjf' && 8) || 7} row={10} />
              ) : (
                dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow
                    hover
                    key={`${row?.id}_${index}`}
                    sx={{ '& .MuiTableCell-body': item === 'reconciliacao' && { typography: 'caption' } }}
                  >
                    {(item === 'reconciliacao' && (
                      <>
                        <TableCell sx={{ typography: 'caption' }}>{shuffleString(row?.cdg_swift)}</TableCell>
                        <TableCell>{shuffleString(row?.numero_sequencia_msg)}</TableCell>
                        <TableCell>{shuffleString(row?.referencia)}</TableCell>
                        <TableCell>{shuffleString(row?.campo)}</TableCell>
                        <TableCell>{shuffleString(row?.indice_ocorrencia)}</TableCell>
                        <TableCell>{shuffleString(row?.comprimento)}</TableCell>
                        <TableCell>{shuffleString(row?.valor_numerico)}</TableCell>
                        <TableCell>{shuffleString(row?.moeda)}</TableCell>
                        <TableCell>{shuffleString(row?.tipo_operacao)}</TableCell>
                        <TableCell>{shuffleString(row?.data_valor)}</TableCell>
                        <TableCell>{shuffleString(row?.data_registo)}</TableCell>
                        <TableCell>{shuffleString(row?.ref1)}</TableCell>
                        <TableCell>{shuffleString(row?.ref2)}</TableCell>
                        <TableCell>{shuffleString(row?.descritivo)}</TableCell>
                        <TableCell>{shuffleString(row?.nota)}</TableCell>
                        <TableCell>{shuffleString(row?.saldo_apos_movimento)}</TableCell>
                      </>
                    )) ||
                      (item === 'pjf' && (
                        <>
                          <TableCell>{row?.referencia}</TableCell>
                          <TableCell>{shuffleString(row?.titular)}</TableCell>
                          <TableCell>{row?.origem}</TableCell>
                          <TableCell>
                            {row?.doc_1 && <Criado value={row.doc_1} shuffle />}
                            {row?.doc_1 && <Criado value={row.doc_2} shuffle />}
                          </TableCell>
                          <TableCell>
                            {row?.operacao && <Criado value={row.operacao} />}
                            {row?.valor && <Criado value={fCurrency(row.valor)} />}
                          </TableCell>
                          <TableCell>{row?.estado}</TableCell>
                          <TableCell>
                            {row?.data_entrada && <Criado tipo="data" value={ptDate(row.data_entrada)} />}
                            {row?.criado_em && <Criado tipo="time" value={ptDateTime(row.criado_em)} />}
                          </TableCell>
                        </>
                      )) || (
                        <>
                          <TableCell align="center" width={10}>
                            <Checked check={row.titular_ordenador} />
                          </TableCell>
                          <TableCell>{shuffleString(row?.ordenador)}</TableCell>
                          <TableCell>{shuffleString(row?.docid)}</TableCell>
                          <TableCell>{shuffleString(row?.nif)}</TableCell>
                          <TableCell>{row?.data_nascimento ? ptDate(row?.data_nascimento) : ''}</TableCell>
                          <TableCell>
                            {estadosCivis?.find((item) => item?.id === row?.estado_civil)?.label || row?.estado_civil}
                          </TableCell>
                          <TableCell>{shuffleString(row?.pai)}</TableCell>
                          <TableCell>{shuffleString(row?.mae)}</TableCell>
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
              {(item === 'reconciliacao' && (
                <TableRow>
                  <TableCell>Códio Swift</TableCell>
                  <TableCell>Nº seq, msg.</TableCell>
                  <TableCell>Referência</TableCell>
                  <TableCell>Chave</TableCell>
                  <TableCell>Comprimento</TableCell>
                  <TableCell>Valor numérico</TableCell>
                  <TableCell>Moeda</TableCell>
                  <TableCell>Mãe</TableCell>
                  <TableCell>Tipo operação</TableCell>
                  <TableCell>Data valor</TableCell>
                  <TableCell>Data registo</TableCell>
                  <TableCell>Referência 1</TableCell>
                  <TableCell>Referência 2</TableCell>
                  <TableCell>Descritivo</TableCell>
                  <TableCell>Nota</TableCell>
                  <TableCell>Saldo após</TableCell>
                </TableRow>
              )) ||
                (item === 'pjf' && (
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
                )) || (
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
                )}
            </TableHead>
            <TableBody>
              {dataFiltered?.map(
                (row, index) =>
                  (item === 'reconciliacao' && (
                    <TableRow key={`creconciliacao_${index}`}>
                      <TableCell>{shuffleString(row?.cdg_swift)}</TableCell>
                      <TableCell>{shuffleString(row?.numero_sequencia_msg)}</TableCell>
                      <TableCell>{shuffleString(row?.referencia)}</TableCell>
                      <TableCell>{shuffleString(row?.campo)}</TableCell>
                      <TableCell>{shuffleString(row?.indice_ocorrencia)}</TableCell>
                      <TableCell>{shuffleString(row?.comprimento)}</TableCell>
                      <TableCell>{shuffleString(row?.valor_numerico)}</TableCell>
                      <TableCell>{shuffleString(row?.moeda)}</TableCell>
                      <TableCell>{shuffleString(row?.tipo_operacao)}</TableCell>
                      <TableCell>{shuffleString(row?.data_valor)}</TableCell>
                      <TableCell>{shuffleString(row?.data_registo)}</TableCell>
                      <TableCell>{shuffleString(row?.ref1)}</TableCell>
                      <TableCell>{shuffleString(row?.ref2)}</TableCell>
                      <TableCell>{shuffleString(row?.descritivo)}</TableCell>
                      <TableCell>{shuffleString(row?.nota)}</TableCell>
                      <TableCell>{shuffleString(row?.saldo_apos_movimento)}</TableCell>
                    </TableRow>
                  )) ||
                  (item === 'pjf' && (
                    <TableRow key={`pjf_${index}`}>
                      <TableCell>{row?.referencia}&nbsp;</TableCell>
                      <TableCell>{shuffleString(row?.titular)}</TableCell>
                      <TableCell>{row?.origem}</TableCell>
                      <TableCell>{shuffleString(row?.doc_1)}&nbsp;</TableCell>
                      <TableCell>{shuffleString(row?.doc_2)}&nbsp;</TableCell>
                      <TableCell>{row?.operacao}</TableCell>
                      <TableCell>{row?.valor ? fCurrency(row?.valor) : ''}</TableCell>
                      <TableCell>{row?.data_entrada ? ptDate(row?.data_entrada) : ''}</TableCell>
                      <TableCell>{row?.criado_em ? ptDateTime(row?.criado_em) : ''}</TableCell>
                      <TableCell>{row?.estado}</TableCell>
                    </TableRow>
                  )) || (
                    <TableRow key={`con_${index}`}>
                      <TableCell>{row.titular_ordenador ? 'Sim' : 'Não'}</TableCell>
                      <TableCell>{shuffleString(row?.ordenador)}</TableCell>
                      <TableCell>
                        {dis?.find((item) => item?.id === row?.tipo_docid)?.label || row?.tipo_docid}
                      </TableCell>
                      <TableCell>{shuffleString(row?.docid)}</TableCell>
                      <TableCell>{shuffleString(row?.nif)}</TableCell>
                      <TableCell>
                        {estadosCivis?.find((item) => item?.id === row?.estado_civil)?.label || row?.estado_civil}
                      </TableCell>
                      <TableCell>{row?.data_nascimento}</TableCell>
                      <TableCell>{shuffleString(row?.pai)}</TableCell>
                      <TableCell>{shuffleString(row?.mae)}</TableCell>
                      <TableCell>{row?.local_pais_nascimento}</TableCell>
                      <TableCell>{row?.nacionalidade}</TableCell>
                      <TableCell>{row?.profissao}</TableCell>
                      <TableCell>{row?.residente ? 'Sim' : 'Não'}</TableCell>
                      <TableCell>{row?.morada}</TableCell>
                      <TableCell>{row?.local_trabalho}</TableCell>
                      <TableCell>{shuffleString(row?.telefone)}</TableCell>
                      <TableCell>{shuffleString(row?.telemovel)}</TableCell>
                      <TableCell>{shuffleString(row?.email)}</TableCell>
                      <TableCell>{row?.origem_fundo}</TableCell>
                      <TableCell>{row?.finalidade_fundo}</TableCell>
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
        (row?.numero_sequencia_msg && normalizeText(row?.numero_sequencia_msg).indexOf(normalizeText(filter)) !== -1) ||
        (row?.tipo_operacao && normalizeText(row?.tipo_operacao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.referencia && normalizeText(row?.referencia).indexOf(normalizeText(filter)) !== -1) ||
        (row?.cdg_swift && normalizeText(row?.cdg_swift).indexOf(normalizeText(filter)) !== -1) ||
        (row?.ordenador && normalizeText(row?.ordenador).indexOf(normalizeText(filter)) !== -1) ||
        (row?.operacao && normalizeText(row?.operacao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(filter)) !== -1) ||
        (row?.origem && normalizeText(row?.origem).indexOf(normalizeText(filter)) !== -1) ||
        (row?.docid && normalizeText(row?.docid).indexOf(normalizeText(filter)) !== -1) ||
        (row?.moeda && normalizeText(row?.moeda).indexOf(normalizeText(filter)) !== -1) ||
        (row?.valor && normalizeText(row?.valor).indexOf(normalizeText(filter)) !== -1) ||
        (row?.pai && normalizeText(row?.pai).indexOf(normalizeText(filter)) !== -1) ||
        (row?.mae && normalizeText(row?.mae).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nif && normalizeText(row?.nif).indexOf(normalizeText(filter)) !== -1)
    );
  }
  return dados;
}
