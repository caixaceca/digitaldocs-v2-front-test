import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
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
import { format, add } from 'date-fns';
import { bgGradient } from '../../utils/cssStyles';
import { UosAcesso } from '../../utils/validarAcesso';
import { setItemValue } from '../../utils/formatText';
import { fCurrency, fPercent, fNumber } from '../../utils/formatNumber';
import { ptDate, fMonthYear, getDataLS, dataValido, setDataUtil } from '../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getIndicadores, resetItem } from '../../redux/slices/indicadores';
// components
import { BoxMask } from '../../components/Panel';
import { RHFDateIF } from '../../components/hook-form';
import { ExportExcel } from '../../components/Actions';
import { TableSearchNotFound } from '../../components/table';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { BarChart, SkeletonTable } from '../../components/skeleton';

// ----------------------------------------------------------------------

const headStyle = { border: 'none', typography: 'h6' };
const frResumoStyle = { pl: '12px !important', fontWeight: 900 };
const frSegmentoStyle = { pl: '12px !important', typography: 'subtitle2' };
const linhaStyle = { fontWeight: 900, backgroundColor: 'background.neutral' };
const borderStyle = { borderTop: '4px solid transparent', borderColor: 'background.paper' };

// --------------------------------------------------------------------------------------------------------------------------------------------

export default function EstatisticaCredito() {
  const dispatch = useDispatch();
  const { mail, perfilId, cc, uos } = useSelector((state) => state.intranet);
  const { meusAmbientes, isAdmin } = useSelector((state) => state.parametrizacao);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabEst') || 'Resumo');
  const [data, setData] = useState(getDataLS('dataEst', new Date()));
  const [dataf, setDataf] = useState(getDataLS('dataFEst', new Date()));
  const [datai, setDatai] = useState(
    getDataLS('dataIEst', new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  );
  const uosList = useMemo(
    () =>
      UosAcesso(
        uos?.filter((item) => item?.tipo === 'Agências'),
        cc,
        isAdmin,
        meusAmbientes,
        'id'
      ),
    [cc, isAdmin, meusAmbientes, uos]
  );
  const [uo, setUo] = useState(null);

  useEffect(() => {
    if (!uo && uosList && (localStorage.getItem('uoEst') || cc?.uo?.id)) {
      setUo(
        uosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('uoEst'))) ||
          uosList?.find((row) => Number(row?.id) === Number(cc?.uo?.id)) ||
          null
      );
    }
  }, [uosList, uo, cc?.uo?.id]);

  const tabsList = [
    { value: 'Resumo', component: <Totais /> },
    { value: 'Entradas', component: <TableEstatistica from="entrada" uo={uo?.label} data={fMonthYear(data)} /> },
    { value: 'Aprovados', component: <TableEstatistica from="aprovado" uo={uo?.label} data={fMonthYear(data)} /> },
    { value: 'Contratados', component: <TableEstatistica from="contratado" uo={uo?.label} data={fMonthYear(data)} /> },
    { value: 'Indeferidos', component: <TableEstatistica from="indeferido" uo={uo?.label} data={fMonthYear(data)} /> },
    { value: 'Desistidos', component: <TableEstatistica from="desistido" uo={uo?.label} data={fMonthYear(data)} /> },
  ];

  const handleChangeTab = async (event, newValue) => {
    setItemValue(newValue, setCurrentTab, 'tabEst');
  };

  useEffect(() => {
    dispatch(resetItem('estatisticaCredito'));
    if (mail && perfilId && uo?.id && data && currentTab !== 'Resumo') {
      const mes = format(add(data, { hours: 2 }), 'M');
      const ano = format(add(data, { hours: 2 }), 'yyyy');
      dispatch(getIndicadores('estatisticaCredito', { mail, fase: currentTab, perfilId, uoID: uo?.id, mes, ano }));
    }
  }, [dispatch, currentTab, perfilId, data, uo, mail]);

  useEffect(() => {
    dispatch(resetItem('estatisticaCredito'));
    const dataI = dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '';
    const dataF = dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '';
    if (mail && uo?.id && currentTab === 'Resumo') {
      if (uo?.id === -1 || uo?.id === -2 || uo?.id === -3) {
        dispatch(getIndicadores('resumoEstCredCaixa', { mail, dataI, dataF, uoID: uo?.label }));
      } else {
        dispatch(getIndicadores('resumoEstCredAg', { mail, uoID: uo?.id, dataI, dataF }));
      }
    }
  }, [dispatch, currentTab, datai, dataf, uo, mail]);

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading="Estatística de crédito"
        action={
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
            <Autocomplete
              fullWidth
              value={uo}
              size="small"
              disableClearable
              sx={{ minWidth: 200 }}
              getOptionLabel={(option) => option?.label}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={(params) => <TextField {...params} fullWidth label="Agência/U.O" />}
              options={[{ id: -1, label: 'Caixa' }, { id: -2, label: 'DCN' }, { id: -3, label: 'DCS' }, ...uosList]}
              onChange={(event, newValue) => setItemValue(newValue, setUo, 'uoEst', true)}
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              {currentTab === 'Resumo' ? (
                <RHFDateIF
                  datai={datai}
                  dataf={dataf}
                  labeli="dataIEst"
                  labelf="dataFEst"
                  setDatai={setDatai}
                  setDataf={setDataf}
                />
              ) : (
                <DatePicker
                  label="Data"
                  value={data}
                  disableFuture
                  views={['month', 'year']}
                  onChange={(newValue) => setDataUtil(newValue, setData, 'dataEst', '', '', '')}
                  slotProps={{ textField: { fullWidth: true, size: 'small', sx: { width: 180 } } }}
                />
              )}
            </Stack>
            {((uo?.label !== 'Caixa' && uo?.label !== 'DCN' && uo?.label !== 'DCS') || currentTab === 'Resumo') && (
              <ExportExcel
                sheet={`${currentTab}`}
                table="tabel-estatistica-credito"
                filename={`Estatística de Crédito ${currentTab} - ${uo?.label} -  ${fMonthYear(data)}`}
              />
            )}
          </Stack>
        }
      />
      <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={handleChangeTab} sx={{ mb: 3 }} />
      {tabsList.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function Totais() {
  const { isLoading, estatisticaCredito } = useSelector((state) => state.indicadores);

  return (
    <Grid container spacing={3}>
      {isLoading ? (
        <Grid item xs={12}>
          <Card>
            <BarChart />
          </Card>
        </Grid>
      ) : (
        <>
          <CardResumo
            label="Entrada"
            qtd={sumBy(estatisticaCredito?.entrada, 'total')}
            total={sumBy(estatisticaCredito?.entrada, 'montantes')}
          />
          <CardResumo
            label="Aprovado"
            qtd={sumBy(estatisticaCredito?.aprovado, 'total')}
            total={sumBy(estatisticaCredito?.aprovado, 'montante_aprovado')}
          />
          <CardResumo
            label="Contratado"
            qtd={sumBy(estatisticaCredito?.contratado, 'total')}
            total={sumBy(estatisticaCredito?.contratado, 'montante_contratado')}
          />
          <CardResumo
            label="Indeferido/Desistido"
            qtd={sumBy(estatisticaCredito?.indeferido, 'total') + sumBy(estatisticaCredito?.desistido, 'total')}
            total={
              sumBy(estatisticaCredito?.indeferido, 'montantes') + sumBy(estatisticaCredito?.desistido, 'montantes')
            }
          />
          <Grid item xs={12}>
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
                      <TableCell
                        align="right"
                        sx={{ borderTopLeftRadius: '0px !important', borderBottomLeftRadius: '0px !important' }}
                      >
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
                    <TotaisLinha first segmento="Empresa" linha="Construção" dados={estatisticaCredito} />
                    <TotaisLinha segmento="Empresa" linha="Tesouraria" dados={estatisticaCredito} />
                    <TotaisLinha segmento="Empresa" linha="Investimento" dados={estatisticaCredito} />
                    <TotaisLinha first segmento="Particular" linha="Habitação" dados={estatisticaCredito} />
                    <TotaisLinha segmento="Particular" linha="CrediCaixa" dados={estatisticaCredito} />
                    <TotaisLinha segmento="Particular" linha="Outros" dados={estatisticaCredito} />
                    <TotaisLinha first segmento="Produtor Individual" linha="Tesouraria" dados={estatisticaCredito} />
                    <TotaisLinha segmento="Produtor Individual" linha="Investimento" dados={estatisticaCredito} />
                    <TotaisLinha segmento="Produtor Individual" linha="Microcrédito" dados={estatisticaCredito} />
                    <TotaisLinha first segmento="Entidade Pública" dados={estatisticaCredito} />
                    <TotaisLinha first segmento="Garantia Bancária" dados={estatisticaCredito} />
                  </TableBody>
                  <TableHead>
                    <TableRow sx={{ ...borderStyle }}>
                      <TableCell colSpan={2}>TOTAL ACUMULADO</TableCell>
                      <TableCell align="right">{fNumber(sumBy(estatisticaCredito?.entrada, 'total'))}</TableCell>
                      <TableCell align="right">{fNumber(sumBy(estatisticaCredito?.entrada, 'montantes'))}</TableCell>
                      <TableCell align="right">{fNumber(sumBy(estatisticaCredito?.aprovado, 'total'))}</TableCell>
                      <TableCell align="right">
                        {fNumber(sumBy(estatisticaCredito?.aprovado, 'montante_aprovado'))}
                      </TableCell>
                      <TableCell align="right">{fNumber(sumBy(estatisticaCredito?.contratado, 'total'))}</TableCell>
                      <TableCell align="right">
                        {fNumber(sumBy(estatisticaCredito?.contratado, 'montante_contratado'))}
                      </TableCell>
                      <TableCell align="right">
                        {fNumber(
                          sumBy(estatisticaCredito?.indeferido, 'total') + sumBy(estatisticaCredito?.desistido, 'total')
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {fNumber(
                          sumBy(estatisticaCredito?.indeferido, 'montantes') +
                            sumBy(estatisticaCredito?.desistido, 'montantes')
                        )}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TableEstatistica.propTypes = { from: PropTypes.string, uo: PropTypes.string, data: PropTypes.string };

export function TableEstatistica({ from, uo, data }) {
  const { isLoading, estatisticaCredito } = useSelector((state) => state.indicadores);
  const total =
    ((from === 'entrada' || from === 'desistido' || from === 'indeferido') && 'montantes') ||
    (from === 'aprovado' && 'montante_aprovado') ||
    (from === 'contratado' && 'montante_contratado');
  const dados = filterDados(
    (from === 'entrada' && estatisticaCredito?.entrada) ||
      (from === 'aprovado' && estatisticaCredito?.aprovado) ||
      (from === 'desistido' && estatisticaCredito?.desistido) ||
      (from === 'contratado' && estatisticaCredito?.contratado) ||
      (from === 'indeferido' && estatisticaCredito?.indeferido)
  );

  return (
    <Card sx={{ p: 1 }}>
      {uo !== 'Caixa' && uo !== 'DCN' && uo !== 'DCS' ? (
        <TableContainer sx={{ mb: 0.5 }}>
          <Table size="small" id="tabel-estatistica-credito">
            <TableHead>
              <TableRow hover>
                <TableCell colSpan={2} align="right" sx={{ ...headStyle, borderBottomLeftRadius: '0px !important' }}>
                  Unidade orgânica
                </TableCell>
                <TableCell
                  align="left"
                  sx={{ ...headStyle, borderBottomRightRadius: '0px !important', color: 'text.primary' }}
                  colSpan={(from === 'entrada' && 8) || (from === 'contratado' && 12) || 7}
                >
                  {uo}
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell colSpan={2} align="right" sx={{ ...headStyle, borderRadius: '0px !important' }}>
                  Mês/Ano
                </TableCell>
                <TableCell
                  align="left"
                  sx={{ ...headStyle, borderRadius: '0px !important', color: 'text.primary' }}
                  colSpan={(from === 'entrada' && 8) || (from === 'contratado' && 12) || 7}
                >
                  {data}
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell colSpan={2} align="right" sx={{ ...headStyle, borderTopLeftRadius: '0px !important' }}>
                  Total {from}
                </TableCell>
                <TableCell
                  align="left"
                  sx={{ ...headStyle, borderTopRightRadius: '0px !important', color: 'text.primary' }}
                  colSpan={(from === 'entrada' && 8) || (from === 'contratado' && 12) || 7}
                >
                  {fNumber(
                    sumBy(dados?.empresaInvestimento, total) +
                      sumBy(dados?.empresaConstrucao, total) +
                      sumBy(dados?.empresaTesouraria, total) +
                      sumBy(dados?.particularHabitacao, total) +
                      sumBy(dados?.particularCrediCaixa, total) +
                      sumBy(dados?.particularOutros, total) +
                      sumBy(dados?.piTesouraria, total) +
                      sumBy(dados?.piInvestimento, total) +
                      sumBy(dados?.piMicrocredito, total) +
                      sumBy(dados?.entidadesPublicas, total) +
                      sumBy(dados?.garantiaBancaria, total)
                  )}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  sx={{ border: 'none', backgroundColor: 'transparent' }}
                  colSpan={(from === 'entrada' && 10) || (from === 'contratado' && 14) || 9}
                >
                  {' '}
                </TableCell>
              </TableRow>
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
                {(from === 'aprovado' || from === 'contratado') && (
                  <TableCell align="right">Montante aprovado</TableCell>
                )}
                {from === 'contratado' && <TableCell align="right">Montante contratado</TableCell>}
              </TableRow>
            </TableHead>
            {uo !== 'Caixa' && uo !== 'DCN' && uo !== 'DCS' && (
              <TableBody>
                {isLoading ? (
                  <SkeletonTable column={(from === 'entrada' && 10) || (from === 'contratado' && 14) || 9} row={10} />
                ) : (
                  <>
                    {/* EMPESAS */}
                    <Segmento
                      from={from}
                      linha1="Construção"
                      linha2="Tesouraria"
                      linha3="Investimento"
                      segmento="Empresas"
                      linha1Dados={dados?.empresaConstrucao}
                      linha2Dados={dados?.empresaTesouraria}
                      linha3Dados={dados?.empresaInvestimento}
                    />
                    {/* PARTICULARES */}
                    <Segmento
                      from={from}
                      linha1="Habitação"
                      linha2="CrediCaixa"
                      linha3="Outros"
                      segmento="Particular"
                      linha1Dados={dados?.particularHabitacao}
                      linha2Dados={dados?.particularCrediCaixa}
                      linha3Dados={dados?.particularOutros}
                    />
                    {/* PRODUTOR INDIVIDUAL */}
                    <Segmento
                      from={from}
                      linha1="Tesouraria"
                      linha2="Investimento"
                      linha3="Micro-Crédito"
                      segmento="Produtor Individual"
                      linha1Dados={dados?.piTesouraria}
                      linha2Dados={dados?.piInvestimento}
                      linha3Dados={dados?.piMicrocredito}
                    />
                    {/* ENTIDADES PÚBLICAS */}
                    <SegmentoStd from={from} dados={dados?.entidadesPublicas} segmento="Entidades Públicas" />
                    {/* GARANTIAS BANCÁRIAS */}
                    <SegmentoStd from={from} dados={dados?.garantiaBancaria} segmento="Garantias Bancárias" />
                  </>
                )}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      ) : (
        <Stack direction="row" justifyContent="center">
          <TableSearchNotFound message="Para visualizar os detalhes seleciona uma Agência específica" />
        </Stack>
      )}
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Segmento.propTypes = {
  from: PropTypes.string,
  linha1: PropTypes.string,
  linha2: PropTypes.string,
  linha3: PropTypes.string,
  segmento: PropTypes.string,
  linha1Dados: PropTypes.array,
  linha2Dados: PropTypes.array,
  linha3Dados: PropTypes.array,
};

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

// --------------------------------------------------------------------------------------------------------------------------------------------

SegmentoStd.propTypes = { from: PropTypes.string, segmento: PropTypes.string, dados: PropTypes.array };

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

// --------------------------------------------------------------------------------------------------------------------------------------------

TableRowTotal.propTypes = {
  empty: PropTypes.bool,
  from: PropTypes.string,
  neutral: PropTypes.bool,
  total: PropTypes.number,
  nivel: PropTypes.number,
  total1: PropTypes.number,
};

function TableRowTotal({ total, total1 = 0, nivel, from, neutral, empty = false }) {
  const cell =
    (from === 'entrada' && 7) ||
    (from === 'aprovado' && 5) ||
    (from === 'contratado' && 10) ||
    ((from === 'desistido' || from === 'indeferido') && 6);
  return empty ? (
    <>
      <TableCell colSpan={nivel === 1 ? cell : cell + 1} sx={{ backgroundColor: neutral && 'background.neutral' }}>
        {}
      </TableCell>
      <TableCell align="right" sx={{ typography: 'subtitle2', backgroundColor: neutral && 'background.neutral' }}>
        {nivel === 1 ? fNumber(0) : <b>{fNumber(0)}</b>}
      </TableCell>
      {(from === 'aprovado' || from === 'contratado') && (
        <TableCell align="right" sx={{ typography: 'subtitle2', backgroundColor: neutral && 'background.neutral' }}>
          {nivel === 1 ? fNumber(0) : <b>{fNumber(0)}</b>}
        </TableCell>
      )}
    </>
  ) : (
    <TableRow sx={{ backgroundColor: (nivel === 1 && 'background.paper') || 'background.neutral' }}>
      <TableCell colSpan={nivel === 1 ? cell : cell + 1}>{}</TableCell>
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

// --------------------------------------------------------------------------------------------------------------------------------------------

FirstRowSegmento.propTypes = {
  total: PropTypes.bool,
  from: PropTypes.string,
  dados: PropTypes.object,
  linha: PropTypes.string,
  length: PropTypes.number,
  length1: PropTypes.number,
  segmento: PropTypes.string,
};

function FirstRowSegmento({ segmento, linha, dados, total = false, length, from, length1 }) {
  return (
    <TableRow hover sx={{ ...borderStyle }}>
      <TableCell rowSpan={length} sx={{ ...frSegmentoStyle, backgroundColor: 'background.neutral' }}>
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

// --------------------------------------------------------------------------------------------------------------------------------------------

FirstRowLinha.propTypes = {
  from: PropTypes.string,
  dados: PropTypes.object,
  linha: PropTypes.string,
  length: PropTypes.number,
};

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

// --------------------------------------------------------------------------------------------------------------------------------------------

DadosCell.propTypes = {
  total: PropTypes.bool,
  from: PropTypes.string,
  index: PropTypes.number,
  dados: PropTypes.object,
};

function DadosCell({ dados, from, index = 1, total }) {
  return dados ? (
    <>
      <TableCell align="right" sx={{ pl: '12px !important' }}>
        {fNumber(index)}
      </TableCell>
      <TableCell>{dados?.titular}</TableCell>
      {(from === 'entrada' || from === 'desistido' || from === 'indeferido') && (
        <TableCell>{dados?.data_entrada && ptDate(dados?.data_entrada)}</TableCell>
      )}
      {from === 'aprovado' && <TableCell>{dados?.data_aprovacao && ptDate(dados?.data_aprovacao)}</TableCell>}
      {from === 'contratado' && <TableCell>{dados?.data_contratacao && ptDate(dados?.data_contratacao)}</TableCell>}
      <TableCell>{dados?.setor_atividade}</TableCell>
      {from !== 'aprovado' && <TableCell>{dados?.finalidade}</TableCell>}
      {(from === 'entrada' || from === 'aprovado') && <TableCell>{dados?.situacao_final_mes}</TableCell>}
      {from === 'entrada' && <TableCell>{dados?.nproposta}</TableCell>}
      {from === 'contratado' && (
        <>
          <TableCell>{dados?.prazo_amortizacao}</TableCell>
          <TableCell>{dados?.taxa_juro && fPercent(dados?.taxa_juro)}</TableCell>
          <TableCell>{dados?.garantia}</TableCell>
          <TableCell>{dados?.escalao_decisao}</TableCell>
          <TableCell>{dados?.cliente}</TableCell>
        </>
      )}
      {from === 'indeferido' && <TableCell>{dados?.data_indeferido && ptDate(dados?.data_indeferido)}</TableCell>}
      {from === 'desistido' && <TableCell>{dados?.data_desistido && ptDate(dados?.data_desistido)}</TableCell>}
      {from !== 'contratado' && (
        <TableCell align="right">
          <Typography variant="body2" noWrap>
            {dados?.montantes && fNumber(dados?.montantes)}
          </Typography>
        </TableCell>
      )}
      {(from === 'aprovado' || from === 'contratado') && (
        <TableCell align="right">
          <Typography variant="body2" noWrap>
            {dados?.montante_aprovado && fNumber(dados?.montante_aprovado)}
          </Typography>
        </TableCell>
      )}
      {from === 'contratado' && (
        <TableCell align="right">
          <Typography variant="body2" noWrap>
            {dados?.montante_contratado && fNumber(dados?.montante_contratado)}
          </Typography>
        </TableCell>
      )}
    </>
  ) : (
    <TableRowTotal nivel={1} from={from} empty neutral={total} />
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

CardResumo.propTypes = { qtd: PropTypes.number, total: PropTypes.number, label: PropTypes.string };

function CardResumo({ total, label, qtd }) {
  const theme = useTheme();
  const color =
    (label === 'Entrada' && 'focus') ||
    (label === 'Aprovado' && 'success') ||
    (label === 'Contratado' && 'primary') ||
    'error';
  return (
    <Grid item xs={12} sm={6} lg={3}>
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
          <Typography variant="h5">{fCurrency(total)}</Typography>
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
    </Grid>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TotaisLinha.propTypes = {
  first: PropTypes.bool,
  dados: PropTypes.array,
  linha: PropTypes.string,
  segmento: PropTypes.string,
};

function TotaisLinha({ first = false, segmento, linha = '', dados }) {
  return (
    <TableRow hover sx={first ? borderStyle : null}>
      {first && (
        <TableCell rowSpan={linha ? 3 : 1} sx={{ ...linhaStyle }}>
          {segmento}
        </TableCell>
      )}
      <TableCell sx={{ ...frResumoStyle }}>{linha}</TableCell>
      <TableRowTotais dados={dadosResumo(dados, segmento, linha, !linha)} />
    </TableRow>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TableRowTotais.propTypes = { dados: PropTypes.object };

function TableRowTotais({ dados }) {
  return (
    <>
      <TableCell align="right">{fNumber(dados?.qtdEnt)}</TableCell>
      <TableCell align="right">{fNumber(dados?.valorEnt)}</TableCell>
      <TableCell align="right">{fNumber(dados?.qtdAp)}</TableCell>
      <TableCell align="right">{fNumber(dados?.valorAp)}</TableCell>
      <TableCell align="right">{fNumber(dados?.qtdCont)}</TableCell>
      <TableCell align="right">{fNumber(dados?.valorCont)}</TableCell>
      <TableCell align="right">{fNumber(dados?.qtdId)}</TableCell>
      <TableCell align="right">{fNumber(dados?.valorId)}</TableCell>
    </>
  );
}

// ----------------------------------------------------------------------

function filterDados(dados) {
  return {
    empresaConstrucao: dados?.filter((row) => row?.segmento === 'Empresa' && row?.linha === 'Construção'),
    empresaTesouraria: dados?.filter((row) => row?.segmento === 'Empresa' && row?.linha === 'Tesouraria'),
    empresaInvestimento: dados?.filter((row) => row?.segmento === 'Empresa' && row?.linha === 'Investimento'),
    particularHabitacao: dados?.filter((row) => row?.segmento === 'Particular' && row?.linha === 'Habitação'),
    particularCrediCaixa: dados?.filter((row) => row?.segmento === 'Particular' && row?.linha === 'CrediCaixa'),
    particularOutros: dados?.filter((row) => row?.segmento === 'Particular' && row?.linha === 'Outros'),
    piTesouraria: dados?.filter((row) => row?.segmento === 'Produtor Individual' && row?.linha === 'Tesouraria'),
    piInvestimento: dados?.filter((row) => row?.segmento === 'Produtor Individual' && row?.linha === 'Investimento'),
    piMicrocredito: dados?.filter((row) => row?.segmento === 'Produtor Individual' && row?.linha === 'Micro-Crédito'),
    entidadesPublicas: dados?.filter((row) => row?.segmento === 'Entidade Pública'),
    garantiaBancaria: dados?.filter((row) => row?.linha === 'Garantia Bancária'),
  };
}

// ----------------------------------------------------------------------

function dadosResumo(dados, segmento, linha, std) {
  const entradas = dadosRes(dados?.entrada, segmento, linha, std);
  const aprovados = dadosRes(dados?.aprovado, segmento, linha, std);
  const contratados = dadosRes(dados?.contratado, segmento, linha, std);
  const indeferidos = dadosRes(dados?.indeferido, segmento, linha, std);
  const desistidos = dadosRes(dados?.desistido, segmento, linha, std);

  return {
    qtdEnt: sumBy(entradas, 'total'),
    valorEnt: sumBy(entradas, 'montantes'),
    qtdAp: sumBy(aprovados, 'total'),
    valorAp: sumBy(aprovados, 'montante_aprovado'),
    qtdCont: sumBy(contratados, 'total'),
    valorCont: sumBy(contratados, 'montante_contratado'),
    qtdId: sumBy(indeferidos, 'total') + sumBy(desistidos, 'total'),
    valorId: sumBy(indeferidos, 'montantes') + sumBy(desistidos, 'montantes'),
  };
}

function dadosRes(dados, segmento, linha, std) {
  return std
    ? dados?.filter((row) => row?.segmento === segmento || row?.linha === linha)
    : dados?.filter((row) => row?.segmento === segmento && row?.linha === linha);
}
