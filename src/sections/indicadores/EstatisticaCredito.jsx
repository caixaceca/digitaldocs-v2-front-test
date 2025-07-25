import sumBy from 'lodash/sumBy';
import { useEffect, useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import AssignmentReturnedOutlinedIcon from '@mui/icons-material/AssignmentReturnedOutlined';
// utils
import {
  ptDate,
  dataLabel,
  getDataLS,
  dataValido,
  formatDate,
  setDataUtil,
  ultimoDiaDoMes,
} from '../../utils/formatTime';
import { bgGradient } from '../../utils/cssStyles';
import { UosAcesso } from '../../utils/validarAcesso';
import { normalizeText } from '../../utils/formatText';
import { setItemValue } from '../../utils/formatObject';
import { fCurrency, fPercent, fNumber } from '../../utils/formatNumber';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getEstatisticaCredito } from '../../redux/slices/indicadores';
// components
import { BoxMask } from '../../components/Panel';
import GridItem from '../../components/GridItem';
import { RHFDateIF } from '../../components/hook-form';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { BarChart, SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import ExportarEstatisticaCred from '../../components/ExportDados/ToExcell/EstatisticaCredito';

// ---------------------------------------------------------------------------------------------------------------------

const frSegmentoStyle = { pl: '12px !important', typography: 'subtitle2' };

// ---------------------------------------------------------------------------------------------------------------------

export default function EstatisticaCredito() {
  const dispatch = useDispatch();
  const { perfilId, cc, uos } = useSelector((state) => state.intranet);
  const { meusAmbientes, isAdmin, isAuditoria } = useSelector((state) => state.parametrizacao);

  const [data, setData] = useState(getDataLS('dataEst', new Date()));
  const [dataf, setDataf] = useState(getDataLS('dataFEst', new Date()));
  const [vista, setVista] = useState(localStorage.getItem('vistaEst') || 'Mensal');
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabEst') || 'Resumo');
  const [datai, setDatai] = useState(
    getDataLS('dataIEst', new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  );
  const uosList = useMemo(
    () =>
      UosAcesso(
        uos?.filter(({ tipo }) => tipo === 'Agências'),
        cc,
        isAdmin || isAuditoria,
        meusAmbientes,
        'id'
      ),
    [cc, isAdmin, isAuditoria, meusAmbientes, uos]
  );
  const [uo, setUo] = useState(
    uosList?.find(({ id }) => Number(id) === Number(localStorage.getItem('uoEst'))) ||
      uosList?.find(({ id }) => Number(id) === Number(cc?.uo_id)) || { id: -1, label: 'Caixa' }
  );

  const tabsList = useMemo(
    () => [
      { value: 'Resumo', component: <Totais /> },
      ...(vista === 'Mensal' && uo?.id > 0
        ? [
            { value: 'Entradas', component: <TableEstatistica from="entrada" /> },
            { value: 'Aprovados', component: <TableEstatistica from="aprovado" /> },
            { value: 'Contratados', component: <TableEstatistica from="contratado" /> },
            { value: 'Indeferidos', component: <TableEstatistica from="indeferido" /> },
            { value: 'Desistidos', component: <TableEstatistica from="desistido" /> },
          ]
        : []),
    ],
    [uo?.id, vista]
  );

  const handleChangeTab = async (event, newValue) => {
    setItemValue(newValue, setCurrentTab, 'tabEst');
  };

  useEffect(() => {
    if (!currentTab || !tabsList?.map(({ value }) => value)?.includes(currentTab))
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'tabEst', false);
  }, [tabsList, currentTab]);

  useEffect(() => {
    if (perfilId && vista === 'Mensal' && uo?.id && dataValido(data)) {
      const mes = formatDate(data, 'M');
      const ano = formatDate(data, 'yyyy');
      const intervalo = `?data_inicio=${formatDate(data, 'yyyy-MM')}-01&data_final=${formatDate(data, 'yyyy-MM')}-${ultimoDiaDoMes(data)}`;
      dispatch(getEstatisticaCredito('estCreditoMensal', { uoID: uo?.id, mes, ano, intervalo }));
    }
  }, [dispatch, perfilId, data, uo?.id, vista]);

  useEffect(() => {
    if (perfilId && vista === 'Intervalo' && uo?.id && dataValido(datai) && dataValido(dataf)) {
      const intervalo = `?data_inicio=${formatDate(datai, 'yyyy-MM-dd')}&data_final=${formatDate(dataf, 'yyyy-MM-dd')}`;
      dispatch(getEstatisticaCredito('estCreditoIntervalo', { uoID: uo?.id, intervalo }));
    }
  }, [dispatch, perfilId, datai, dataf, uo, vista]);

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading="Estatística de crédito"
        action={
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {vista === 'Mensal' && currentTab !== 'Resumo' ? (
                ''
              ) : (
                <Autocomplete
                  fullWidth
                  size="small"
                  value={vista}
                  disableClearable
                  sx={{ width: { xs: 190, md: 120 } }}
                  options={['Mensal', 'Intervalo']}
                  renderInput={(params) => <TextField {...params} fullWidth label="Vista" />}
                  onChange={(event, newValue) => setItemValue(newValue, setVista, 'vistaEst', false)}
                />
              )}
              <Autocomplete
                fullWidth
                value={uo}
                size="small"
                disableClearable
                getOptionLabel={(option) => option?.label}
                sx={{ width: { md: 200 }, minWidth: 150 }}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(event, newValue) => setItemValue(newValue, setUo, 'uoEst', true)}
                renderInput={(params) => <TextField {...params} fullWidth label="Agência/U.O" />}
                options={[
                  ...(vista === 'Mensal' && currentTab !== 'Resumo'
                    ? []
                    : [
                        { id: -1, label: 'Caixa' },
                        { id: -2, label: 'DCN' },
                        { id: -3, label: 'DCS' },
                      ]),
                  ...uosList,
                ]}
              />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              {vista === 'Mensal' ? (
                <DatePicker
                  label="Data"
                  value={data}
                  maxDate={new Date()}
                  views={['month', 'year']}
                  minDate={new Date('2020-01-01')}
                  onChange={(newValue) => setDataUtil(newValue, setData, 'dataEst', '', '', '')}
                  slotProps={{ textField: { fullWidth: true, size: 'small', sx: { maxWidth: 175 } } }}
                />
              ) : (
                <RHFDateIF options={{ datai, dataf, setDatai, setDataf, labeli: 'dataIEst', labelf: 'dataFEst' }} />
              )}
              <ExportarEstatisticaCred
                vista={vista}
                uo={uo?.label}
                periodo={vista === 'Mensal' ? formatDate(data, "MMMM 'de' yyyy") : dataLabel(datai, dataf)}
              />
            </Stack>
          </Stack>
        }
      />
      <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={handleChangeTab} />
      <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Totais() {
  const { isLoading, resumoEstCredito } = useSelector((state) => state.indicadores);
  const { qtdEnt, qtdAp, qtdCont, qtdId, valEnt, valorAp, valCont, valId } = dadosResumo(resumoEstCredito, '', '');

  return (
    <Grid container spacing={3}>
      {isLoading ? (
        <GridItem>
          <Card>
            <BarChart />
          </Card>
        </GridItem>
      ) : (
        <>
          <CardResumo label="Entrada" qtd={qtdEnt} total={valEnt} />
          <CardResumo label="Aprovado" qtd={qtdAp} total={valorAp} />
          <CardResumo label="Contratado" qtd={qtdCont} total={valCont} />
          <CardResumo label="Indeferido/Desistido" qtd={qtdId} total={valId} />
          <GridItem>
            <Card sx={{ p: 1 }}>
              <TableContainer>
                <Table size="small" id="tabel-estatistica-credito">
                  <TableHead>
                    <TableRow>
                      <TableCell rowSpan={2}>Segmento</TableCell>
                      <TableCell rowSpan={2}>Linha de crédito</TableCell>
                      <TableCell colSpan={2} align="center">
                        Entradas
                      </TableCell>
                      <TableCell colSpan={2} align="center">
                        Aprovados
                      </TableCell>
                      <TableCell colSpan={2} align="center">
                        Contratados
                      </TableCell>
                      <TableCell colSpan={2} align="center" sx={{ borderBottomRightRadius: '0px !important' }}>
                        Indeferidos/Desistidos
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="right" sx={{ borderRadius: '0px !important' }}>
                        Qtd
                      </TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell align="right">Qtd</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell align="right">Qtd</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell align="right">Qtd</TableCell>
                      <TableCell align="right" sx={{ borderTopRightRadius: '0px !important' }}>
                        Valor
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <EmptyRow />
                    <TotaisLinha first segmento="Empresa" linha="Construção" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Empresa" linha="Tesouraria" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Empresa" linha="Investimento" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Empresa" dados={resumoEstCredito} />
                    <EmptyRow />
                    <TotaisLinha first segmento="Particular" linha="Habitação" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Particular" linha="CrediCaixa" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Particular" linha="Outros" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Particular" dados={resumoEstCredito} />
                    <EmptyRow />
                    <TotaisLinha first segmento="Produtor Individual" linha="Tesouraria" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Produtor Individual" linha="Investimento" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Produtor Individual" linha="Micro-Crédito" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Produtor Individual" dados={resumoEstCredito} />
                    <EmptyRow />
                    <TotaisLinha first segmento="Entidade Pública" dados={resumoEstCredito} />
                    <EmptyRow />
                    <TotaisLinha first linha="Garantia Bancária" dados={resumoEstCredito} />
                    <EmptyRow />
                  </TableBody>
                  <TableBody>
                    <EmptyRow segmento />
                    <TotaisLinha linha="Tesouraria" dados={resumoEstCredito} />
                    <TotaisLinha linha="Investimento" dados={resumoEstCredito} />
                    <EmptyRow />
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </GridItem>
        </>
      )}
    </Grid>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function TableEstatistica({ from }) {
  const [filter, setFilter] = useState('');
  const { isLoading, estCredito } = useSelector((state) => state.indicadores);
  const { entrada, aprovado, desistido, contratado, indeferido } = estCredito || {};

  const total = useMemo(
    () =>
      ((from === 'entrada' || from === 'desistido' || from === 'indeferido') && 'montantes') ||
      (from === 'aprovado' && 'montante_aprovado') ||
      (from === 'contratado' && 'montante_contratado'),
    [from]
  );
  const dadosFrom = useMemo(
    () =>
      (from === 'entrada' && entrada) ||
      (from === 'aprovado' && aprovado) ||
      (from === 'desistido' && desistido) ||
      (from === 'contratado' && contratado) ||
      (from === 'indeferido' && indeferido) ||
      [],
    [aprovado, contratado, desistido, entrada, from, indeferido]
  );
  const {
    piTesouraria,
    piInvestimento,
    piMicrocredito,
    particularOutros,
    garantiaBancaria,
    entidadesPublicas,
    empresaConstrucao,
    empresaTesouraria,
    empresaInvestimento,
    particularHabitacao,
    particularCrediCaixa,
  } = filterDados(dadosFrom, filter);

  return (
    <Card sx={{ p: 1 }}>
      <SearchToolbarSimple filter={filter} setFilter={setFilter} />
      <Stack
        sx={{ p: 1.5, borderRadius: 1, textAlign: 'center', bgcolor: 'background.neutral', typography: 'subtitle1' }}
      >
        TOTAL DE CRÉDITOS{' '}
        {(from === 'entrada' && 'ENTRADOS') ||
          (from === 'aprovado' && 'APROVADOS') ||
          (from === 'contratado' && 'CONTRATADOS') ||
          (from === 'indeferido' && 'INDEFERIDOS') ||
          (from === 'desistido' && 'DESISTIDOS')}{' '}
        ({fNumber(dadosFrom.length)}) - {fCurrency(sumBy(dadosFrom, total))}
      </Stack>
      <TableContainer sx={{ mt: 1 }}>
        <Table size="small" id="tabel-estatistica-credito">
          <TableHead>
            <TableRow>
              <TableCell>Segmento</TableCell>
              <TableCell>Linha de crédito</TableCell>
              <TableCell align="right">Nº</TableCell>
              <TableCell>Proponente</TableCell>
              <TableCell>
                Data de{' '}
                {((from === 'entrada' || from === 'indeferido' || from === 'desistido') && 'entrada') ||
                  (from === 'aprovado' && 'aprovação') ||
                  (from === 'contratado' && 'contratação')}
              </TableCell>
              <TableCell>Sector de atividade</TableCell>
              {(from === 'entrada' || from === 'indeferido' || from === 'desistido') && (
                <TableCell>Finalidade</TableCell>
              )}
              {(from === 'entrada' || from === 'aprovado') && <TableCell>Situação</TableCell>}
              {from === 'entrada' && <TableCell>Nº proposta</TableCell>}
              {from === 'contratado' && (
                <>
                  <TableCell>Finalidade</TableCell>
                  <TableCell>Prazo amortização</TableCell>
                  <TableCell>Taxa juro</TableCell>
                  <TableCell>Garantia</TableCell>
                  <TableCell>Escalão decisão</TableCell>
                  <TableCell>Nº de cliente</TableCell>
                </>
              )}
              {(from === 'indeferido' || from === 'desistido') && (
                <TableCell>Data de {from === 'indeferido' ? 'indeferimento' : 'desistência'}</TableCell>
              )}
              {(from === 'entrada' || from === 'aprovado' || from === 'indeferido' || from === 'desistido') && (
                <TableCell align="right">Montante solicitado</TableCell>
              )}
              {(from === 'aprovado' || from === 'contratado') && <TableCell align="right">Montante aprovado</TableCell>}
              {from === 'contratado' && <TableCell align="right">Montante contratado</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <SkeletonTable column={(from === 'entrada' && 10) || (from === 'contratado' && 14) || 9} row={10} />
            ) : (
              <>
                {/* EMPESAS */}
                <EmptyRow />
                <Segmento
                  from={from}
                  linha1="Construção"
                  linha2="Tesouraria"
                  linha3="Investimento"
                  segmento="Empresas"
                  linha1Dados={empresaConstrucao}
                  linha2Dados={empresaTesouraria}
                  linha3Dados={empresaInvestimento}
                />
                <EmptyRow />
                {/* PARTICULARES */}
                <Segmento
                  from={from}
                  linha1="Habitação"
                  linha2="CrediCaixa"
                  linha3="Outros"
                  segmento="Particular"
                  linha1Dados={particularHabitacao}
                  linha2Dados={particularCrediCaixa}
                  linha3Dados={particularOutros}
                />
                <EmptyRow />
                {/* PRODUTOR INDIVIDUAL */}
                <Segmento
                  from={from}
                  linha1="Tesouraria"
                  linha2="Investimento"
                  linha3="Micro-Crédito"
                  segmento="Produtor Individual"
                  linha1Dados={piTesouraria}
                  linha2Dados={piInvestimento}
                  linha3Dados={piMicrocredito}
                />
                <EmptyRow />
                {/* ENTIDADES PÚBLICAS */}
                <SegmentoStd from={from} dados={entidadesPublicas} segmento="Entidades Públicas" />
                <EmptyRow />
                {/* GARANTIAS BANCÁRIAS */}
                <SegmentoStd from={from} dados={garantiaBancaria} segmento="Garantias Bancárias" />
                <EmptyRow />
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Segmento({ from, linha1, linha2, linha3, segmento, linha1Dados, linha2Dados, linha3Dados }) {
  const lengthLinha1 = linha1Dados?.length > 1 ? linha1Dados?.length : 0;
  const lengthLinha2 = linha2Dados?.length > 1 ? linha2Dados?.length : 0;
  const lengthLinha3 = linha3Dados?.length > 1 ? linha3Dados?.length : 0;
  return (
    <>
      <FirstRowSegmento
        from={from}
        linha={linha1}
        segmento={segmento}
        length1={lengthLinha1}
        dados={linha1Dados?.[0]}
        length={lengthLinha1 + lengthLinha2 + lengthLinha3 + 4}
      />
      {lengthLinha1 > 1 && (
        <>
          {linha1Dados.map(
            (row, index) =>
              index !== 0 && (
                <TableRow hover key={row?.id}>
                  <DadosCell dados={row} from={from} index={index + 1} />
                </TableRow>
              )
          )}
          <TableRowTotal
            nivel={1}
            from={from}
            total={sumBy(linha1Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')}
            total1={sumBy(linha1Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')}
          />
        </>
      )}

      {/* LINHA 2 */}
      <FirstRowLinha linha={linha2} dados={linha2Dados?.[0]} length={lengthLinha2} from={from} />
      {lengthLinha2 > 1 && (
        <>
          {linha2Dados.map(
            (row, index) =>
              index !== 0 && (
                <TableRow hover key={row?.id}>
                  <DadosCell dados={row} from={from} index={index + 1} />
                </TableRow>
              )
          )}
          <TableRowTotal
            nivel={1}
            from={from}
            total={sumBy(linha2Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')}
            total1={sumBy(linha2Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')}
          />
        </>
      )}

      {/* LINHA 3 */}
      <FirstRowLinha linha={linha3} dados={linha3Dados?.[0]} length={lengthLinha3} from={from} />
      {lengthLinha3 > 1 && (
        <>
          {linha3Dados.map(
            (row, index) =>
              index !== 0 && (
                <TableRow hover key={row?.id}>
                  <DadosCell dados={row} from={from} index={index + 1} />
                </TableRow>
              )
          )}
          <TableRowTotal
            nivel={1}
            from={from}
            total={sumBy(linha3Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')}
            total1={sumBy(linha3Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')}
          />
        </>
      )}
      <TableRowTotal
        nivel={2}
        from={from}
        length={linha1Dados?.length + linha2Dados?.length + linha3Dados?.length}
        color={
          (segmento === 'Empresa' && 'grey.500_16') ||
          (segmento === 'Particular' && 'grey.500_24') ||
          (segmento === 'Produtor Individual' && 'grey.500_32') ||
          'background.neutral'
        }
        total={
          sumBy(linha1Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes') +
          sumBy(linha2Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes') +
          sumBy(linha3Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')
        }
        total1={
          sumBy(linha1Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado') +
          sumBy(linha2Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado') +
          sumBy(linha3Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')
        }
      />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function SegmentoStd({ from, segmento, dados }) {
  const length = dados?.length;
  return (
    <>
      <FirstRowSegmento
        from={from}
        dados={dados?.[0]}
        segmento={segmento}
        total={length === 0}
        length={length > 0 ? length + 1 : 1}
      />
      {length > 1 &&
        dados.map(
          (row, index) =>
            index !== 0 && (
              <TableRow hover key={row?.id}>
                <TableCell> </TableCell>
                <DadosCell dados={row} from={from} index={index + 1} />
              </TableRow>
            )
        )}
      {length > 0 && (
        <TableRowTotal
          nivel={2}
          from={from}
          total={sumBy(dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')}
          total1={sumBy(dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function TableRowTotal({ total, total1 = 0, nivel, from, color = '', empty = false, length = -1 }) {
  const cell =
    (from === 'entrada' && 7) ||
    (from === 'aprovado' && 5) ||
    (from === 'contratado' && 10) ||
    ((from === 'desistido' || from === 'indeferido') && 6);
  return empty ? (
    <>
      <TableCell colSpan={nivel === 1 ? cell : cell + 1} sx={{ backgroundColor: color }}>
        {}
      </TableCell>
      <TableCell align="right" sx={{ typography: 'subtitle2', backgroundColor: color }}>
        {nivel === 1 ? fNumber(0) : <b>{fNumber(0)}</b>}
      </TableCell>
      {(from === 'aprovado' || from === 'contratado') && (
        <TableCell align="right" sx={{ typography: 'subtitle2', backgroundColor: color }}>
          {nivel === 1 ? fNumber(0) : <b>{fNumber(0)}</b>}
        </TableCell>
      )}
    </>
  ) : (
    <TableRow hover sx={{ backgroundColor: (nivel === 1 && 'background.paper') || color }}>
      {length > -1 ? (
        <>
          <TableCell>{}</TableCell>
          <TableCell align="right" sx={{ typography: 'subtitle1' }}>
            {length}
          </TableCell>
          <TableCell colSpan={cell - 1}>{}</TableCell>
        </>
      ) : (
        <TableCell colSpan={nivel === 1 ? cell : cell + 1}>{}</TableCell>
      )}
      <TableCell align="right" sx={{ typography: (nivel === 1 && 'subtitle2') || 'subtitle1', whiteSpace: 'nowrap' }}>
        {nivel === 1 ? fNumber(total) : <b>{fNumber(total)}</b>}
      </TableCell>
      {(from === 'aprovado' || from === 'contratado') && (
        <TableCell align="right" sx={{ typography: (nivel === 1 && 'subtitle2') || 'subtitle1', whiteSpace: 'nowrap' }}>
          {nivel === 1 ? fNumber(total1) : <b>{fNumber(total1)}</b>}
        </TableCell>
      )}
    </TableRow>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function FirstRowSegmento({ segmento, linha, dados, total = false, length, from, length1 }) {
  const color =
    (segmento === 'Empresa' && 'grey.500_16') ||
    (segmento === 'Particular' && 'grey.500_24') ||
    (segmento === 'Produtor Individual' && 'grey.500_32') ||
    'background.neutral';
  return (
    <TableRow hover sx={{ borderColor: 'background.paper' }}>
      <TableCell rowSpan={length} sx={{ ...frSegmentoStyle, bgcolor: color }}>
        <b>{segmento}</b>
      </TableCell>
      {segmento === 'Entidades Públicas' || segmento === 'Garantias Bancárias' ? (
        <TableCell sx={{ backgroundColor: total && 'background.neutral' }}> </TableCell>
      ) : (
        <TableCell rowSpan={length1 > 1 ? length1 + 1 : 1} sx={{ ...frSegmentoStyle }}>
          <b>{linha}</b>
        </TableCell>
      )}
      <DadosCell dados={dados} from={from} total={total} />
    </TableRow>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function FirstRowLinha({ linha, dados, length, from }) {
  return (
    <TableRow hover>
      <TableCell rowSpan={length > 1 ? length + 1 : 1} sx={{ ...frSegmentoStyle }}>
        <b>{linha}</b>
      </TableCell>
      <DadosCell dados={dados} from={from} />
    </TableRow>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function DadosCell({ dados, from, index = 1, total }) {
  return dados ? (
    <>
      <TableCell align="right" sx={{ pl: '12px !important' }}>
        {fNumber(index)}
      </TableCell>
      <TableCell>{dados?.titular}</TableCell>
      {(from === 'entrada' || from === 'desistido' || from === 'indeferido') && (
        <TableCell>{ptDate(dados?.data_entrada)}</TableCell>
      )}
      {from === 'aprovado' && <TableCell>{ptDate(dados?.data_aprovacao)}</TableCell>}
      {from === 'contratado' && <TableCell>{ptDate(dados?.data_contratacao)}</TableCell>}
      <TableCell>{dados?.setor_atividade}</TableCell>
      {from !== 'aprovado' && <TableCell>{dados?.finalidade}</TableCell>}
      {(from === 'entrada' || from === 'aprovado') && <TableCell>{dados?.situacao_final_mes}</TableCell>}
      {from === 'entrada' && <TableCell>{dados?.nproposta}</TableCell>}
      {from === 'contratado' && (
        <>
          <TableCell>{`${dados?.prazo_amortizacao ?? '--'}${dados?.prazo_amortizacao?.includes('meses') ? '' : ' meses'}`}</TableCell>
          <TableCell>{dados?.taxa_juro && fPercent(dados?.taxa_juro)}</TableCell>
          <TableCell>{dados?.garantia}</TableCell>
          <TableCell>{dados?.escalao_decisao}</TableCell>
          <TableCell>{dados?.cliente}</TableCell>
        </>
      )}
      {from === 'indeferido' && <TableCell>{ptDate(dados?.data_indeferido)}</TableCell>}
      {from === 'desistido' && <TableCell>{ptDate(dados?.data_desistido)}</TableCell>}
      {from !== 'contratado' && (
        <TableCell align="right" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fNumber(dados?.montantes)}
        </TableCell>
      )}
      {(from === 'aprovado' || from === 'contratado') && (
        <TableCell align="right" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fNumber(dados?.montante_aprovado)}
        </TableCell>
      )}
      {from === 'contratado' && (
        <TableCell align="right" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fNumber(dados?.montante_contratado)}
        </TableCell>
      )}
    </>
  ) : (
    <TableRowTotal nivel={1} from={from} empty color={total ? 'background.neutral' : ''} />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function CardResumo({ total, label, qtd }) {
  const theme = useTheme();
  const color =
    (label === 'Entrada' && 'focus') ||
    (label === 'Aprovado' && 'success') ||
    (label === 'Contratado' && 'primary') ||
    'error';
  return (
    <GridItem sm={6} lg={3}>
      <Card
        sx={{
          p: 2.5,
          height: 1,
          display: 'flex',
          boxShadow: 'none',
          justifyContent: 'space-between',
          color: theme.palette[color].darker,
          bgcolor: theme.palette[color].lighter,
        }}
      >
        <BoxMask sx={{ maskSize: 'revert', maskRepeat: 'no-repeat', maskPositionX: 'right' }} />
        <Stack>
          <Typography variant="subtitle2">{label}</Typography>
          <Typography variant="body2" sx={{ color: theme.palette[color].main, py: 0.5 }}>
            <b>{fNumber(qtd)}</b> processo{qtd > 1 ? 's' : ''}
          </Typography>
          <Typography variant="h6">{fCurrency(total)}</Typography>
        </Stack>
        <Stack
          sx={{
            top: 10,
            right: 10,
            width: 45,
            height: 45,
            opacity: 0.64,
            borderRadius: '50%',
            alignItems: 'center',
            position: 'absolute',
            justifyContent: 'center',
            color: theme.palette[color].dark,
            ...bgGradient({
              direction: '135deg',
              startColor: `${alpha(theme.palette[color].dark, 0.05)} 0%`,
              endColor: `${alpha(theme.palette[color].darker, 0.32)} 100%`,
            }),
          }}
        >
          {(label === 'Entrada' && <AssignmentReturnedOutlinedIcon sx={{ width: 30, height: 30 }} />) ||
            (label === 'Aprovado' && <TaskAltOutlinedIcon sx={{ width: 30, height: 30 }} />) ||
            (label === 'Contratado' && <HandshakeOutlinedIcon sx={{ width: 30, height: 30 }} />) || (
              <DoDisturbIcon sx={{ width: 30, height: 30 }} />
            )}
        </Stack>
      </Card>
    </GridItem>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function TotaisLinha({ first = false, segmento = '', linha = '', dados }) {
  const color =
    (segmento === 'Empresa' && 'grey.500_16') ||
    (segmento === 'Particular' && 'grey.500_24') ||
    (segmento === 'Produtor Individual' && 'grey.500_32') ||
    'grey.500_48';
  const subTotal =
    !linha && (segmento === 'Empresa' || segmento === 'Particular' || segmento === 'Produtor Individual');
  return (
    <TableRow hover sx={{ bgcolor: subTotal && color, '& .MuiTableCell-root': { fontWeight: subTotal && 900 } }}>
      {first && (
        <TableCell rowSpan={linha && segmento ? 4 : 1} sx={{ bgcolor: color, fontWeight: 900 }}>
          {segmento || linha}
        </TableCell>
      )}
      {!segmento && (linha === 'Tesouraria' || linha === 'Investimento') && (
        <TableCell sx={{ border: 'none' }}> </TableCell>
      )}
      <TableCell
        sx={{ fontWeight: 900, pl: '12px !important', bgcolor: first && !linha && !segmento && 'grey.500_48' }}
      >
        {(segmento && linha) || (!segmento && (linha === 'Tesouraria' || linha === 'Investimento')) ? linha : ''}
      </TableCell>
      <TableRowTotais dados={dadosResumo(dados, segmento, linha)} />
    </TableRow>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function TableRowTotais({ dados }) {
  return ['qtdEnt', 'valEnt', 'qtdAp', 'valorAp', 'qtdCont', 'valCont', 'qtdId', 'valId']?.map((row) => (
    <TableCell key={row} align="right">
      {fNumber(dados[row])}
    </TableCell>
  ));
}

// ---------------------------------------------------------------------------------------------------------------------

function EmptyRow({ segmento }) {
  return (
    <TableRow>
      <TableCell sx={{ p: segmento ? 3 : 0.25, border: segmento && 'none' }}> </TableCell>
      <TableCell colSpan={20} sx={{ p: segmento ? 3 : 0.25 }}>
        {' '}
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function filterDados(dados, filter) {
  if (filter) {
    const normalizedFilter = normalizeText(filter);
    dados = dados.filter(
      ({ titular, cliente }) =>
        (titular && normalizeText(titular).indexOf(normalizedFilter) !== -1) ||
        (cliente && normalizeText(cliente).indexOf(normalizedFilter) !== -1)
    );
  }

  return {
    empresaConstrucao: dados?.filter(({ segmento, linha }) => segmento === 'Empresa' && linha === 'Construção'),
    empresaTesouraria: dados?.filter(({ segmento, linha }) => segmento === 'Empresa' && linha === 'Tesouraria'),
    empresaInvestimento: dados?.filter(({ segmento, linha }) => segmento === 'Empresa' && linha === 'Investimento'),
    particularHabitacao: dados?.filter(({ segmento, linha }) => segmento === 'Particular' && linha === 'Habitação'),
    particularCrediCaixa: dados?.filter(({ segmento, linha }) => segmento === 'Particular' && linha === 'CrediCaixa'),
    particularOutros: dados?.filter(({ segmento, linha }) => segmento === 'Particular' && linha === 'Outros'),
    piTesouraria: dados?.filter(({ segmento, linha }) => segmento === 'Produtor Individual' && linha === 'Tesouraria'),
    piInvestimento: dados?.filter(
      ({ segmento, linha }) => segmento === 'Produtor Individual' && linha === 'Investimento'
    ),
    piMicrocredito: dados?.filter(
      ({ segmento, linha }) => segmento === 'Produtor Individual' && linha === 'Micro-Crédito'
    ),
    entidadesPublicas: dados?.filter(({ segmento }) => segmento === 'Entidade Pública'),
    garantiaBancaria: dados?.filter(({ linha }) => linha === 'Garantia Bancária'),
  };
}

// ---------------------------------------------------------------------------------------------------------------------

function dadosResumo(dados, segmento, linha) {
  const entradas = dadosPorItem(dados?.entrada, segmento, linha);
  const aprovados = dadosPorItem(dados?.aprovado, segmento, linha);
  const contratados = dadosPorItem(dados?.contratado, segmento, linha);
  const indeferidos = dadosPorItem(dados?.indeferido, segmento, linha);
  const desistidos = dadosPorItem(dados?.desistido, segmento, linha);

  return {
    qtdEnt: sumBy(entradas, 'total'),
    valEnt: sumBy(entradas, 'montantes'),
    qtdAp: sumBy(aprovados, 'total'),
    valorAp: sumBy(aprovados, 'montante_aprovado'),
    qtdCont: sumBy(contratados, 'total'),
    valCont: sumBy(contratados, 'montante_contratado'),
    qtdId: sumBy(indeferidos, 'total') + sumBy(desistidos, 'total'),
    valId: sumBy(indeferidos, 'montantes') + sumBy(desistidos, 'montantes'),
  };
}

function dadosPorItem(dados, segmento, linha) {
  return (
    (segmento && linha && dados?.filter(({ segmento: seg, linha: lin }) => seg === segmento && lin === linha)) ||
    (segmento && dados?.filter(({ segmento: seg, linha: lin }) => seg === segmento && lin !== 'Garantia Bancária')) ||
    (linha && dados?.filter(({ segmento: seg, linha: lin }) => linha === lin && seg !== 'Entidade Pública')) ||
    dados
  );
}
