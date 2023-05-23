import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import {
  Tab,
  Box,
  Tabs,
  Card,
  Grid,
  Stack,
  Table,
  TableRow,
  TableCell,
  TextField,
  TableBody,
  TableHead,
  Typography,
  CardContent,
  Autocomplete,
  TableContainer,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled, alpha, useTheme } from '@mui/material/styles';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import AssignmentReturnedOutlinedIcon from '@mui/icons-material/AssignmentReturnedOutlined';
// utils
import { format, add } from 'date-fns';
import { ptDate } from '../../utils/formatTime';
import { bgGradient } from '../../utils/cssStyles';
import { fCurrency, fPercent } from '../../utils/formatNumber';
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getIndicadores } from '../../redux/slices/digitaldocs';
// components
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { BarChart, SkeletonTable } from '../../components/skeleton';

// ----------------------------------------------------------------------

const TabsWrapperStyle = styled('div')(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('md')]: { paddingRight: theme.spacing(3) },
}));

const IconWrapperStyle = styled('div')(() => ({
  margin: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// --------------------------------------------------------------------------------------------------------------------------------------------

export default function EstatisticaCredito() {
  const dispatch = useDispatch();
  const [uo, setUo] = useState(null);
  const [data, setData] = useState(new Date());
  const [currentTab, setCurrentTab] = useState('resume');
  const { mail, currentColaborador, uos } = useSelector((state) => state.intranet);
  const perfilId = currentColaborador?.perfil_id;
  useEffect(() => {
    if (currentColaborador) {
      setUo({ id: currentColaborador?.uo?.id, label: currentColaborador?.uo?.label });
    }
  }, [currentColaborador]);
  const uosList = [];
  uos?.forEach((row) => {
    uosList.push({ id: row?.id, label: row?.label });
  });

  const VIEW_TABS = [
    { value: 'resume', label: 'Resume', component: <Totais /> },
    { value: 'entrada', label: 'Entradas', component: <Entradas /> },
    { value: 'aprovado', label: 'Aprovados', component: <Aprovados /> },
    { value: 'contratado', label: 'Contratados', component: <Contratados /> },
  ];

  const handleChangeTab = async (event, newValue) => {
    setCurrentTab(newValue);
  };

  useEffect(() => {
    if (mail && perfilId && uo?.id && data) {
      const mes = format(add(data, { hours: 2 }), 'M');
      const ano = format(add(data, { hours: 2 }), 'yyyy');
      dispatch(getIndicadores('estatisticaCredito', { mail, perfilId, uoID: uo?.id, mes, ano }));
    }
  }, [dispatch, perfilId, data, uo?.id, mail]);

  return (
    <>
      <HeaderBreadcrumbs
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1}>
            <Autocomplete
              fullWidth
              value={uo}
              size="small"
              getOptionLabel={(option) => option?.label}
              onChange={(event, newValue) => setUo(newValue)}
              options={applySort(uosList, getComparator('asc', 'label'))}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={(params) => <TextField {...params} fullWidth label="U.O" />}
            />
            <DatePicker
              label="Data"
              disableFuture
              value={data}
              views={['month', 'year']}
              onChange={(newValue) => setData(newValue)}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Stack>
        }
        links={[{ name: '' }]}
        heading="Estatística de crédito"
        sx={{ color: 'text.secondary', px: 1 }}
      />
      <Card sx={{ mb: 3, height: 50, position: 'relative' }}>
        <TabsWrapperStyle>
          <Tabs
            value={currentTab}
            scrollButtons="auto"
            variant="scrollable"
            allowScrollButtonsMobile
            onChange={handleChangeTab}
          >
            {VIEW_TABS.map((tab) => (
              <Tab disableRipple key={tab.value} value={tab.value} label={tab.label} sx={{ px: 0.5 }} />
            ))}
          </Tabs>
        </TabsWrapperStyle>
      </Card>
      {VIEW_TABS.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function Totais() {
  const { isLoading, entradasCredito, creditosAprovados, creditosContratados } = useSelector(
    (state) => state.digitaldocs
  );
  // Entradas
  const totalEntrada = sumBy(
    entradasCredito?.filter((row) => row?.linha !== 'Garantia Bancária'),
    'montantes'
  );
  const entradaEmp = sumBy(
    entradasCredito?.filter((row) => row?.segmento === 'Empresa' && row?.linha !== 'Garantia Bancária'),
    'montantes'
  );
  const entradaPart = sumBy(
    entradasCredito?.filter((row) => row?.segmento === 'Particular' && row?.linha !== 'Garantia Bancária'),
    'montantes'
  );
  const entradaPi = sumBy(
    entradasCredito?.filter((row) => row?.segmento === 'Produtor Individual' && row?.linha !== 'Garantia Bancária'),
    'montantes'
  );
  const entradaEp = sumBy(
    entradasCredito?.filter((row) => row?.segmento === 'Entidade Pública'),
    'montantes'
  );
  const entradaGb = sumBy(
    entradasCredito?.filter((row) => row?.linha === 'Garantia Bancária'),
    'montantes'
  );

  // Aprovados
  const totalAprovado = sumBy(
    creditosAprovados?.filter((row) => row?.linha !== 'Garantia Bancária'),
    'montante_aprovado'
  );
  const aprovadoEmp = sumBy(
    creditosAprovados?.filter((row) => row?.segmento === 'Empresa' && row?.linha !== 'Garantia Bancária'),
    'montante_aprovado'
  );
  const aprovadoPart = sumBy(
    creditosAprovados?.filter((row) => row?.segmento === 'Particular' && row?.linha !== 'Garantia Bancária'),
    'montante_aprovado'
  );
  const aprovadoPi = sumBy(
    creditosAprovados?.filter((row) => row?.segmento === 'Produtor Individual' && row?.linha !== 'Garantia Bancária'),
    'montante_aprovado'
  );
  const aprovadoEp = sumBy(
    creditosAprovados?.filter((row) => row?.segmento === 'Entidade Pública'),
    'montante_aprovado'
  );
  const aprovadoGb = sumBy(
    creditosAprovados?.filter((row) => row?.linha === 'Garantia Bancária'),
    'montante_aprovado'
  );

  // Contratados
  const totalContratado = sumBy(
    creditosContratados?.filter((row) => row?.linha !== 'Garantia Bancária'),
    'montante_contratado'
  );
  const contratadoEmp = sumBy(
    creditosContratados?.filter((row) => row?.segmento === 'Empresa' && row?.linha !== 'Garantia Bancária'),
    'montante_contratado'
  );
  const contratadoPart = sumBy(
    creditosContratados?.filter((row) => row?.segmento === 'Particular' && row?.linha !== 'Garantia Bancária'),
    'montante_contratado'
  );
  const contratadoPi = sumBy(
    creditosContratados?.filter((row) => row?.segmento === 'Produtor Individual' && row?.linha !== 'Garantia Bancária'),
    'montante_contratado'
  );
  const contratadoEp = sumBy(
    creditosContratados?.filter((row) => row?.segmento === 'Entidade Pública'),
    'montante_contratado'
  );
  const contratadoGb = sumBy(
    creditosContratados?.filter((row) => row?.linha === 'Garantia Bancária'),
    'montante_contratado'
  );

  return (
    <Grid container spacing={3}>
      {isLoading ? (
        <Grid item xs={12}>
          <Card>
            <Stack direction="row" justifyContent="center">
              <BarChart />
            </Stack>
          </Card>
        </Grid>
      ) : (
        <>
          <CardResumo label="Entrada" total={totalEntrada} />
          <CardResumo label="Aprovado" total={totalAprovado} />
          <CardResumo label="Contratado" total={totalContratado} />
          <Grid item xs={12}>
            <Card sx={{ p: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell> </TableCell>
                    <TableCell align="right">Entrada</TableCell>
                    <TableCell align="right"> </TableCell>
                    <TableCell align="right">Aprovado</TableCell>
                    <TableCell align="right"> </TableCell>
                    <TableCell align="right">Contratado</TableCell>
                    <TableCell align="right"> </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRowResumo
                    label="Empresa"
                    total={{ totalEntrada, totalAprovado, totalContratado }}
                    dados={{ entrada: entradaEmp, aprovado: aprovadoEmp, contratado: contratadoEmp }}
                  />
                  <TableRowResumo
                    label="Particular"
                    total={{ totalEntrada, totalAprovado, totalContratado }}
                    dados={{ entrada: entradaPart, aprovado: aprovadoPart, contratado: contratadoPart }}
                  />
                  <TableRowResumo
                    label="Produtor Individual"
                    total={{ totalEntrada, totalAprovado, totalContratado }}
                    dados={{ entrada: entradaPi, aprovado: aprovadoPi, contratado: contratadoPi }}
                  />
                  <TableRowResumo
                    label="Entidade Pública"
                    total={{ totalEntrada, totalAprovado, totalContratado }}
                    dados={{ entrada: entradaEp, aprovado: aprovadoEp, contratado: contratadoEp }}
                  />
                  <TableRowResumo
                    label="Garantia Bancária"
                    dados={{ entrada: entradaGb, aprovado: aprovadoGb, contratado: contratadoGb }}
                  />
                </TableBody>
              </Table>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function Entradas() {
  const { isLoading, entradasCredito } = useSelector((state) => state.digitaldocs);
  const dados = filterDados(entradasCredito);

  return (
    <Card sx={{ p: 1 }}>
      <Scrollbar>
        <TableContainer sx={{ minWidth: 1200, position: 'relative', overflow: 'hidden', mb: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Segmento</TableCell>
                <TableCell>Linha de crédito</TableCell>
                <TableCell>Proponente</TableCell>
                <TableCell>Data de entrada</TableCell>
                <TableCell>Sector de atividade</TableCell>
                <TableCell>Montante solicitado</TableCell>
                <TableCell>Finalidade</TableCell>
                <TableCell>Situação final do mês</TableCell>
                <TableCell>Nº proposta</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <SkeletonTable column={9} row={10} />
              ) : (
                <>
                  {/* EMPESAS */}
                  <Segmento
                    from="entrada"
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
                    from="entrada"
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
                    from="entrada"
                    linha1="Tesouraria"
                    linha2="Investimento"
                    linha3="Micro-Crédito"
                    segmento="Produtor Individual"
                    linha1Dados={dados?.piTesouraria}
                    linha2Dados={dados?.piInvestimento}
                    linha3Dados={dados?.piMicrocredito}
                  />

                  {/* ENTIDADES PÚBLICAS */}
                  <SegmentoStd from="entrada" dados={dados?.entidadesPublicas} segmento="Entidades Públicas" />

                  {/* GARANTIAS BANCÁRIAS */}
                  <SegmentoStd from="entrada" dados={dados?.garantiaBancaria} segmento="Garantias Bancárias" />
                </>
              )}
              <TableRow>
                <TableCell colSpan={20}>
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 3, p: 3, backgroundColor: 'success.main', borderRadius: 1 }}
                  >
                    <Typography variant="h5">TOTAL DE CRÉDITOS ENTRADOS: </Typography>
                    <Typography variant="h5">
                      {fCurrency(
                        sumBy(dados?.empresaInvestimento, 'montantes') +
                          sumBy(dados?.empresaConstrucao, 'montantes') +
                          sumBy(dados?.empresaTesouraria, 'montantes') +
                          sumBy(dados?.particularHabitacao, 'montantes') +
                          sumBy(dados?.particularCrediCaixa, 'montantes') +
                          sumBy(dados?.particularOutros, 'montantes') +
                          sumBy(dados?.piTesouraria, 'montantes') +
                          sumBy(dados?.piInvestimento, 'montantes') +
                          sumBy(dados?.piMicrocredito, 'montantes') +
                          sumBy(dados?.entidadesPublicas, 'montantes')
                      )}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function Aprovados() {
  const { isLoading, creditosAprovados } = useSelector((state) => state.digitaldocs);
  const dados = filterDados(creditosAprovados);

  return (
    <Card sx={{ p: 1 }}>
      <Scrollbar>
        <TableContainer sx={{ minWidth: 1000, position: 'relative', overflow: 'hidden', mb: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Segmento</TableCell>
                <TableCell>Linha de crédito</TableCell>
                <TableCell>Proponente</TableCell>
                <TableCell>Data de aprovação</TableCell>
                <TableCell>Sector de atividade</TableCell>
                <TableCell>Montante solicitado</TableCell>
                <TableCell>Montante aprovado</TableCell>
                <TableCell>Situação final do mês</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <SkeletonTable column={9} row={10} />
              ) : (
                <>
                  {/* EMPESAS */}
                  <Segmento
                    from="aprovado"
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
                    from="aprovado"
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
                    from="aprovado"
                    linha1="Tesouraria"
                    linha2="Investimento"
                    linha3="Micro-Crédito"
                    segmento="Produtor Individual"
                    linha1Dados={dados?.piTesouraria}
                    linha2Dados={dados?.piInvestimento}
                    linha3Dados={dados?.piMicrocredito}
                  />

                  {/* ENTIDADES PÚBLICAS */}
                  <SegmentoStd from="aprovado" dados={dados?.entidadesPublicas} segmento="Entidades Públicas" />

                  {/* GARANTIAS BANCÁRIAS */}
                  <SegmentoStd from="aprovado" dados={dados?.garantiaBancaria} segmento="Garantias Bancárias" />
                </>
              )}
              <TableRow>
                <TableCell colSpan={20}>
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 3, p: 3, backgroundColor: 'success.main', borderRadius: 1 }}
                  >
                    <Typography variant="h5">TOTAL DE CRÉDITOS APROVADOS: </Typography>
                    <Typography variant="h5">
                      {fCurrency(
                        sumBy(dados?.empresaInvestimento, 'montante_aprovado') +
                          sumBy(dados?.empresaConstrucao, 'montante_aprovado') +
                          sumBy(dados?.empresaTesouraria, 'montante_aprovado') +
                          sumBy(dados?.particularCrediCaixa, 'montante_aprovado') +
                          sumBy(dados?.particularCrediCaixa, 'montante_aprovado') +
                          sumBy(dados?.particularOutros, 'montante_aprovado') +
                          sumBy(dados?.piTesouraria, 'montante_aprovado') +
                          sumBy(dados?.piInvestimento, 'montante_aprovado') +
                          sumBy(dados?.piMicrocredito, 'montante_aprovado') +
                          sumBy(dados?.entidadesPublicas, 'montante_aprovado')
                      )}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function Contratados() {
  const { isLoading, creditosContratados } = useSelector((state) => state.digitaldocs);
  const dados = filterDados(creditosContratados);

  return (
    <Card sx={{ p: 3 }}>
      <Scrollbar>
        <TableContainer sx={{ minWidth: 1400, position: 'relative', overflow: 'hidden', mb: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Segmento</TableCell>
                <TableCell>Linha de crédito</TableCell>
                <TableCell>Proponente</TableCell>
                <TableCell>Data de contratação</TableCell>
                <TableCell>Sector de atividade</TableCell>
                <TableCell>Montante aprovado</TableCell>
                <TableCell>Montante contratado</TableCell>
                <TableCell>Finalidade</TableCell>
                <TableCell>Prazo amortização</TableCell>
                <TableCell>Taxa juro</TableCell>
                <TableCell>Garantia</TableCell>
                <TableCell>Escalão decisão</TableCell>
                <TableCell>Nº cliente</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <SkeletonTable column={9} row={10} />
              ) : (
                <>
                  {/* EMPESAS */}
                  <Segmento
                    from="contratado"
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
                    from="contratado"
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
                    from="contratado"
                    linha1="Tesouraria"
                    linha2="Investimento"
                    linha3="Micro-Crédito"
                    segmento="Produtor Individual"
                    linha1Dados={dados?.piTesouraria}
                    linha2Dados={dados?.piInvestimento}
                    linha3Dados={dados?.piMicrocredito}
                  />

                  {/* ENTIDADES PÚBLICAS */}
                  <SegmentoStd from="contratado" dados={dados?.entidadesPublicas} segmento="Entidades Públicas" />

                  {/* GARANTIAS BANCÁRIAS */}
                  <SegmentoStd from="contratado" dados={dados?.garantiaBancaria} segmento="Garantias Bancárias" />
                </>
              )}
              <TableRow>
                <TableCell colSpan={20}>
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 3, p: 3, backgroundColor: 'success.main', borderRadius: 1 }}
                  >
                    <Typography variant="h5">TOTAL DE CRÉDITOS CONTRATADOS: </Typography>
                    <Typography variant="h5">
                      {fCurrency(
                        sumBy(dados?.empresaInvestimento, 'montante_contratado') +
                          sumBy(dados?.empresaConstrucao, 'montante_contratado') +
                          sumBy(dados?.empresaTesouraria, 'montante_contratado') +
                          sumBy(dados?.particularCrediCaixa, 'montante_contratado') +
                          sumBy(dados?.particularCrediCaixa, 'montante_contratado') +
                          sumBy(dados?.particularOutros, 'montante_contratado') +
                          sumBy(dados?.piTesouraria, 'montante_contratado') +
                          sumBy(dados?.piInvestimento, 'montante_contratado') +
                          sumBy(dados?.piMicrocredito, 'montante_contratado') +
                          sumBy(dados?.entidadesPublicas, 'montante_contratado')
                      )}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
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
  const lenghtLinha1 = linha1Dados?.length > 0 ? linha1Dados?.length : 1;
  const lenghtLinha2 = linha2Dados?.length > 0 ? linha2Dados?.length : 1;
  const lenghtLinha3 = linha3Dados?.length > 0 ? linha3Dados?.length : 1;
  return (
    <>
      <FirstRowSegmento
        from={from}
        linha={linha1}
        segmento={segmento}
        lenght1={lenghtLinha1}
        dados={linha1Dados?.[0]}
        lenght={lenghtLinha1 + lenghtLinha2 + lenghtLinha3 + 5}
      />
      {lenghtLinha1 > 1 &&
        linha1Dados.map(
          (row, index) =>
            index !== 0 && (
              <TableRow hover key={row?.id}>
                <DadosCell dados={row} from={from} />
              </TableRow>
            )
        )}
      <TableRowTotal
        nivel={1}
        from={from}
        total={sumBy(linha1Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')}
        total1={sumBy(linha1Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')}
      />

      {/* LINHA 2 */}
      <FirstRowLinha linha={linha2} dados={linha2Dados?.[0]} lenght={lenghtLinha2} from={from} />
      {lenghtLinha2 > 1 &&
        linha2Dados.map(
          (row, index) =>
            index !== 0 && (
              <TableRow hover key={row?.id}>
                <DadosCell dados={row} from={from} />
              </TableRow>
            )
        )}
      <TableRowTotal
        nivel={1}
        from={from}
        total={sumBy(linha2Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')}
        total1={sumBy(linha2Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')}
      />

      {/* LINHA 3 */}
      <FirstRowLinha linha={linha3} dados={linha3Dados?.[0]} lenght={lenghtLinha3} from={from} />
      {lenghtLinha3 > 1 &&
        linha3Dados.map(
          (row, index) =>
            index !== 0 && (
              <TableRow hover key={row?.id}>
                <DadosCell dados={row} from={from} />
              </TableRow>
            )
        )}
      <TableRowTotal
        nivel={1}
        from={from}
        total={sumBy(linha3Dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')}
        total1={sumBy(linha3Dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')}
      />
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
  const lenght = dados?.length;
  return (
    <>
      <FirstRowSegmento from={from} segmento={segmento} dados={dados?.[0]} lenght={lenght + 2} noLinha={lenght === 0} />
      {lenght > 1 &&
        dados.map(
          (row, index) =>
            index !== 0 && (
              <TableRow hover key={row?.id}>
                <DadosCell dados={row} from={from} />
              </TableRow>
            )
        )}
      <TableRowTotal
        nivel={2}
        from={from}
        lenght={lenght}
        total={sumBy(dados, from === 'contratado' ? 'montante_aprovado' : 'montantes')}
        total1={sumBy(dados, from === 'contratado' ? 'montante_contratado' : 'montante_aprovado')}
      />
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TableRowTotal.propTypes = {
  total: PropTypes.number,
  total1: PropTypes.number,
  nivel: PropTypes.number,
  lenght: PropTypes.number,
  from: PropTypes.string,
};

function TableRowTotal({ total, total1 = 0, nivel, lenght = 1, from }) {
  return (
    <>
      {nivel !== 1 && lenght !== 0 && (
        <TableRow>
          <TableCell colSpan={20}> </TableCell>
        </TableRow>
      )}
      <TableRow sx={{ backgroundColor: (nivel === 1 && 'background.neutral') || 'success.light' }}>
        <TableCell colSpan={(nivel === 1 && 3) || 4}> </TableCell>
        {from === 'entrada' && (
          <TableCell colSpan={4}>
            <Typography variant={(nivel === 1 && 'subtitle2') || 'subtitle1'} noWrap>
              {fCurrency(total)}
            </Typography>
          </TableCell>
        )}
        {(from === 'aprovado' || from === 'contratado') && (
          <>
            <TableCell>
              <Typography variant={(nivel === 1 && 'subtitle2') || 'subtitle1'} noWrap>
                {fCurrency(total)}
              </Typography>
            </TableCell>
            <TableCell colSpan={from === 'contratado' ? 7 : 2}>
              <Typography variant={(nivel === 1 && 'subtitle2') || 'subtitle1'} noWrap>
                {fCurrency(total1)}
              </Typography>
            </TableCell>
          </>
        )}
      </TableRow>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

FirstRowSegmento.propTypes = {
  dados: PropTypes.object,
  linha: PropTypes.string,
  lenght: PropTypes.number,
  lenght1: PropTypes.number,
  segmento: PropTypes.string,
  noLinha: PropTypes.bool,
  from: PropTypes.string,
};

function FirstRowSegmento({ segmento, linha, dados, lenght, from, lenght1, noLinha = false }) {
  return (
    <TableRow hover>
      <TableCell rowSpan={lenght} sx={{ pl: '12px !important', typography: 'subtitle2' }}>
        {segmento}
      </TableCell>
      {!noLinha && (
        <TableCell rowSpan={lenght1 > 0 ? lenght1 + 1 : 2} sx={{ pl: '12px !important', typography: 'subtitle2' }}>
          {linha}
        </TableCell>
      )}
      <DadosCell dados={dados} from={from} />
    </TableRow>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

FirstRowLinha.propTypes = {
  dados: PropTypes.object,
  linha: PropTypes.string,
  from: PropTypes.string,
  lenght: PropTypes.number,
};

function FirstRowLinha({ linha, dados, lenght, from }) {
  return (
    <TableRow hover>
      <TableCell rowSpan={lenght > 0 ? lenght + 1 : 2} sx={{ pl: '12px !important', typography: 'subtitle2' }}>
        {linha}
      </TableCell>
      <DadosCell dados={dados} from={from} />
    </TableRow>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

DadosCell.propTypes = { dados: PropTypes.object, from: PropTypes.string };

function DadosCell({ dados, from }) {
  return (
    <>
      <TableCell sx={{ pl: '12px !important' }}>{dados?.titular}</TableCell>
      {from === 'entrada' && <TableCell>{dados?.data_entrada && ptDate(dados?.data_entrada)}</TableCell>}
      {from === 'aprovado' && <TableCell>{dados?.data_aprovacao && ptDate(dados?.data_aprovacao)}</TableCell>}
      {from === 'contratado' && <TableCell>{dados?.data_contratacao && ptDate(dados?.data_contratacao)}</TableCell>}
      <TableCell>{dados?.setor_atividade}</TableCell>
      {(from === 'entrada' || from === 'aprovado') && (
        <TableCell>
          <Typography variant="body2" noWrap>
            {dados?.montantes && fCurrency(dados?.montantes)}
          </Typography>
        </TableCell>
      )}
      {(from === 'aprovado' || from === 'contratado') && (
        <TableCell>
          <Typography variant="body2" noWrap>
            {dados?.montante_aprovado && fCurrency(dados?.montante_aprovado)}
          </Typography>
        </TableCell>
      )}
      {from === 'contratado' && (
        <TableCell>
          <Typography variant="body2" noWrap>
            {dados?.montante_contratado && fCurrency(dados?.montante_contratado)}
          </Typography>
        </TableCell>
      )}
      {(from === 'entrada' || from === 'contratado') && <TableCell>{dados?.finalidade}</TableCell>}
      {(from === 'entrada' || from === 'aprovado') && <TableCell>{dados?.situacao_final_mes}</TableCell>}
      {from === 'entrada' && <TableCell>{dados?.nproposta}</TableCell>}
      {from === 'contratado' && (
        <>
          <TableCell>{dados?.prazo_amortizacao}</TableCell>
          <TableCell>{dados?.taxa_juro && fPercent(dados?.taxa_juro)}</TableCell>
          <TableCell>{dados?.garantia}</TableCell>
          <TableCell>{dados?.escalao_decisao}</TableCell>
          <TableCell>{dados?.numero}</TableCell>
        </>
      )}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

CardResumo.propTypes = { total: PropTypes.number, label: PropTypes.string };

function CardResumo({ total, label }) {
  const theme = useTheme();
  const color =
    (label === 'Entrada' && 'success') || (label === 'Aprovado' && 'warning') || (label === 'Contratado' && 'focus');
  return (
    <Grid item xs={12} sm={4}>
      <Card
        sx={{
          boxShadow: 0,
          textAlign: 'center',
          color: (theme) => theme.palette[color].darker,
          bgcolor: (theme) => theme.palette[color].lighter,
        }}
      >
        <CardContent>
          <IconWrapperStyle
            sx={{
              mb: 3,
              p: 2.5,
              width: 64,
              height: 64,
              borderRadius: '50%',
              color: theme.palette[color].dark,
              ...bgGradient({
                direction: '135deg',
                startColor: `${alpha(theme.palette[color].dark, 0)} 0%`,
                endColor: `${alpha(theme.palette[color].dark, 0.24)} 100%`,
              }),
            }}
          >
            {(label === 'Entrada' && <AssignmentReturnedOutlinedIcon sx={{ width: 30, height: 30 }} />) ||
              (label === 'Aprovado' && <TaskAltOutlinedIcon sx={{ width: 30, height: 30 }} />) ||
              (label === 'Contratado' && <HandshakeOutlinedIcon sx={{ width: 30, height: 30 }} />)}
          </IconWrapperStyle>
          <Typography variant="h4">{fCurrency(total)}</Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.64 }}>
            {label}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TableRowResumo.propTypes = {
  total: PropTypes.object,
  label: PropTypes.string,
  dados: PropTypes.object,
};

function TableRowResumo({ dados, label, total }) {
  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="subtitle2">{label}</Typography>
      </TableCell>
      <TableCell align="right">{fCurrency(dados?.entrada)}</TableCell>
      <TableCell align="right" width={10}>
        {label !== 'Garantia Bancária' && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {fPercent((dados?.entrada * 100) / total?.totalEntrada)}
          </Typography>
        )}
      </TableCell>
      <TableCell align="right">{fCurrency(dados?.aprovado)}</TableCell>
      <TableCell align="right" width={10}>
        {label !== 'Garantia Bancária' && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {fPercent((dados?.aprovado * 100) / total?.totalAprovado)}
          </Typography>
        )}
      </TableCell>
      <TableCell align="right">{fCurrency(dados?.contratado)}</TableCell>
      <TableCell align="right" width={10}>
        {label !== 'Garantia Bancária' && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {fPercent((dados?.contratado * 100) / total?.totalContratado)}
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
}

// ----------------------------------------------------------------------

function filterDados(dados) {
  // Empresas
  const empresaConstrucao = dados?.filter((row) => row?.segmento === 'Empresa' && row?.linha === 'Construção');
  const empresaTesouraria = dados?.filter((row) => row?.segmento === 'Empresa' && row?.linha === 'Tesouraria');
  const empresaInvestimento = dados?.filter((row) => row?.segmento === 'Empresa' && row?.linha === 'Investimento');
  // Particulares
  const particularHabitacao = dados?.filter((row) => row?.segmento === 'Particular' && row?.linha === 'Habitação');
  const particularCrediCaixa = dados?.filter((row) => row?.segmento === 'Particular' && row?.linha === 'CrediCaixa');
  const particularOutros = dados?.filter((row) => row?.segmento === 'Particular' && row?.linha === 'Investimento');
  // Produtores Individuais
  const piTesouraria = dados?.filter((row) => row?.segmento === 'Produtor Individual' && row?.linha === 'Tesouraria');
  const piInvestimento = dados?.filter(
    (row) => row?.segmento === 'Produtor Individual' && row?.linha === 'Investimento'
  );
  const piMicrocredito = dados?.filter(
    (row) => row?.segmento === 'Produtor Individual' && row?.linha === 'Micro-Crédito'
  );
  // Entidades Públicas
  const entidadesPublicas = dados?.filter((row) => row?.segmento === 'Entidade Pública');
  // Entidades Públicas
  const garantiaBancaria = dados?.filter((row) => row?.linha === 'Garantia Bancária');

  return {
    empresaConstrucao,
    empresaTesouraria,
    empresaInvestimento,
    particularHabitacao,
    particularCrediCaixa,
    particularOutros,
    piTesouraria,
    piInvestimento,
    piMicrocredito,
    entidadesPublicas,
    garantiaBancaria,
  };
}
