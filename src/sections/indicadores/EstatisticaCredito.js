import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import ReactHTMLTableToExcel from 'react-html-table-to-excel-3';
// @mui
import {
  Tab,
  Box,
  Tabs,
  Card,
  Grid,
  Stack,
  Table,
  Button,
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
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled, alpha, useTheme } from '@mui/material/styles';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import AssignmentReturnedOutlinedIcon from '@mui/icons-material/AssignmentReturnedOutlined';
// utils
import { format, add } from 'date-fns';
import { bgGradient } from '../../utils/cssStyles';
import { getFileThumb } from '../../utils/getFileFormat';
import { ptDate, fMonthYear } from '../../utils/formatTime';
import { getComparator, applySort } from '../../hooks/useTable';
import { fCurrency, fPercent, fNumber } from '../../utils/formatNumber';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getIndicadores } from '../../redux/slices/digitaldocs';
// components
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { BarChart, SkeletonTable } from '../../components/skeleton';

// ----------------------------------------------------------------------

const headStyle = { border: 'none', typography: 'h6' };

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
  const [currentTab, setCurrentTab] = useState('resumo');
  const { mail, cc, uos } = useSelector((state) => state.intranet);
  const perfilId = cc?.perfil_id;
  useEffect(() => {
    if (cc) {
      setUo({ id: cc?.uo?.id, label: cc?.uo?.label });
    }
  }, [cc]);

  const VIEW_TABS = [
    { value: 'resumo', label: 'Resumo', component: <Totais /> },
    {
      value: 'Entradas',
      label: 'Entradas',
      component: <TableEstatistica from="entrada" uo={uo?.label} data={fMonthYear(data)} />,
    },
    {
      value: 'Aprovados',
      label: 'Aprovados',
      component: <TableEstatistica from="aprovado" uo={uo?.label} data={fMonthYear(data)} />,
    },
    {
      value: 'Contratados',
      label: 'Contratados',
      component: <TableEstatistica from="contratado" uo={uo?.label} data={fMonthYear(data)} />,
    },
    {
      value: 'Indeferidos',
      label: 'Indeferidos',
      component: <TableEstatistica from="indeferido" uo={uo?.label} data={fMonthYear(data)} />,
    },
    {
      value: 'Desistidos',
      label: 'Desistidos',
      component: <TableEstatistica from="desistido" uo={uo?.label} data={fMonthYear(data)} />,
    },
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
              disableClearable
              sx={{ minWidth: 170 }}
              getOptionLabel={(option) => option?.label}
              onChange={(event, newValue) => setUo(newValue)}
              options={applySort(
                uos?.map((row) => ({ id: row?.id, label: row?.label })),
                getComparator('asc', 'label')
              )}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={(params) => <TextField {...params} fullWidth label="Agência/U.O" />}
            />
            <DatePicker
              label="Data"
              disableFuture
              value={data}
              views={['month', 'year']}
              onChange={(newValue) => setData(newValue)}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
            {currentTab !== 'resumo' && (
              <Stack>
                <ReactHTMLTableToExcel
                  id="table-xls-button-tipo"
                  table="tabel-estatistica-credito"
                  className="MuiButtonBase-root-MuiButton-root"
                  sheet={`${currentTab}`}
                  filename={`Estatística de Crédito ${currentTab} - ${uo?.label} -  ${fMonthYear(data)}`}
                  buttonText={
                    <Button variant="soft" startIcon={getFileThumb('file.xlsx')}>
                      Exportar
                    </Button>
                  }
                />
              </Stack>
            )}
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
  const { isLoading, estatisticaCredito } = useSelector((state) => state.digitaldocs);
  // Entradas
  const totalEntrada = sumBy(estatisticaCredito?.entrada, 'montantes');
  const entradaEmp = sumDados(estatisticaCredito?.entrada, 'Empresa', 'montantes');
  const entradaPart = sumDados(estatisticaCredito?.entrada, 'Particular', 'montantes');
  const entradaPi = sumDados(estatisticaCredito?.entrada, 'Produtor Individual', 'montantes');
  const entradaEp = sumDados(estatisticaCredito?.entrada, 'Entidade Pública', 'montantes');

  // Aprovados
  const totalAprovado = sumBy(estatisticaCredito?.aprovado, 'montante_aprovado');
  const aprovadoEmp = sumDados(estatisticaCredito?.aprovado, 'Empresa', 'montante_aprovado');
  const aprovadoPart = sumDados(estatisticaCredito?.aprovado, 'Particular', 'montante_aprovado');
  const aprovadoPi = sumDados(estatisticaCredito?.aprovado, 'Produtor Individual', 'montante_aprovado');
  const aprovadoEp = sumDados(estatisticaCredito?.aprovado, 'Entidade Pública', 'montante_aprovado');

  // Contratados
  const totalContratado = sumBy(estatisticaCredito?.contratado, 'montante_contratado');
  const contratadoEmp = sumDados(estatisticaCredito?.contratado, 'Empresa', 'montante_contratado');
  const contratadoPart = sumDados(estatisticaCredito?.contratado, 'Particular', 'montante_contratado');
  const contratadoPi = sumDados(estatisticaCredito?.contratado, 'Produtor Individual', 'montante_contratado');
  const contratadoEp = sumDados(estatisticaCredito?.contratado, 'Entidade Pública', 'montante_contratado');

  // Indeferido/Desistido
  const totalID =
    sumBy(estatisticaCredito?.indeferido, 'montantes') + sumBy(estatisticaCredito?.desistido, 'montantes');
  const idEmp =
    sumDados(estatisticaCredito?.indeferido, 'Empresa', 'montantes') +
    sumDados(estatisticaCredito?.desistido, 'Empresa', 'montantes');
  const idPart =
    sumDados(estatisticaCredito?.indeferido, 'Particular', 'montantes') +
    sumDados(estatisticaCredito?.desistido, 'Particular', 'montantes');
  const idPi =
    sumDados(estatisticaCredito?.indeferido, 'Produtor Individual', 'montantes') +
    sumDados(estatisticaCredito?.desistido, 'Produtor Individual', 'montantes');
  const idEp =
    sumDados(estatisticaCredito?.indeferido, 'Entidade Pública', 'montantes') +
    sumDados(estatisticaCredito?.desistido, 'Entidade Pública', 'montantes');

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
          <CardResumo label="Indeferido/Desistido" total={totalID} />
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
                    <TableCell align="right">Indeferido/Desistido</TableCell>
                    <TableCell align="right"> </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRowResumo
                    label="Empresa"
                    total={{ totalEntrada, totalAprovado, totalContratado, totalID }}
                    dados={{ entrada: entradaEmp, aprovado: aprovadoEmp, contratado: contratadoEmp, id: idEmp }}
                  />
                  <TableRowResumo
                    label="Particular"
                    total={{ totalEntrada, totalAprovado, totalContratado, totalID }}
                    dados={{ entrada: entradaPart, aprovado: aprovadoPart, contratado: contratadoPart, id: idPart }}
                  />
                  <TableRowResumo
                    label="Produtor Individual"
                    total={{ totalEntrada, totalAprovado, totalContratado, totalID }}
                    dados={{ entrada: entradaPi, aprovado: aprovadoPi, contratado: contratadoPi, id: idPi }}
                  />
                  <TableRowResumo
                    label="Entidade Pública"
                    total={{ totalEntrada, totalAprovado, totalContratado, totalID }}
                    dados={{ entrada: entradaEp, aprovado: aprovadoEp, contratado: contratadoEp, id: idEp }}
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

TableEstatistica.propTypes = { from: PropTypes.string, uo: PropTypes.string, data: PropTypes.string };

export function TableEstatistica({ from, uo, data }) {
  const { isLoading, estatisticaCredito } = useSelector((state) => state.digitaldocs);
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

  // console.log(estatisticaCredito);

  // const dados = [];

  return (
    <Card sx={{ p: 1 }}>
      <Scrollbar>
        <TableContainer sx={{ minWidth: 1000, position: 'relative', overflow: 'hidden', mb: 1 }}>
          <Table size="small" id="tabel-estatistica-credito">
            <TableHead>
              <TableRow hover>
                <TableCell colSpan={2} align="right" sx={{ ...headStyle, borderBottomLeftRadius: '0px !important' }}>
                  Unidade orgânica
                </TableCell>
                <TableCell
                  align="left"
                  sx={{ ...headStyle, borderBottomRightRadius: '0px !important', color: 'text.primary' }}
                  colSpan={(from === 'entrada' && 7) || (from === 'contratado' && 11) || 6}
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
                  colSpan={(from === 'entrada' && 7) || (from === 'contratado' && 11) || 6}
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
                  colSpan={(from === 'entrada' && 7) || (from === 'contratado' && 11) || 6}
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
                  colSpan={(from === 'entrada' && 9) || (from === 'contratado' && 13) || 8}
                >
                  {' '}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Segmento</TableCell>
                <TableCell>Linha de crédito</TableCell>
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
            <TableBody>
              {isLoading ? (
                <SkeletonTable column={(from === 'entrada' && 9) || (from === 'contratado' && 13) || 8} row={10} />
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
  const lenght = dados?.length || 0;
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
  const cell =
    (from === 'entrada' && 6) ||
    (from === 'aprovado' && 4) ||
    (from === 'contratado' && 9) ||
    ((from === 'desistido' || from === 'indeferido') && 5);
  return (
    <>
      {nivel !== 1 && lenght !== 0 && (
        <TableRow>
          <TableCell colSpan={(from === 'entrada' && 8) || (from === 'contratado' && 12) || 7}> </TableCell>
        </TableRow>
      )}
      <TableRow sx={{ backgroundColor: (nivel === 1 && 'background.neutral') || 'success.light' }}>
        <TableCell colSpan={nivel === 1 ? cell : cell + 1}>{}</TableCell>
        <TableCell align="right" sx={{ typography: (nivel === 1 && 'subtitle2') || 'subtitle1', whiteSpace: 'nowrap' }}>
          {fNumber(total)}
        </TableCell>
        {(from === 'aprovado' || from === 'contratado') && (
          <TableCell
            align="right"
            sx={{ typography: (nivel === 1 && 'subtitle2') || 'subtitle1', whiteSpace: 'nowrap' }}
          >
            {fNumber(total1)}
          </TableCell>
        )}
      </TableRow>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

FirstRowSegmento.propTypes = {
  from: PropTypes.string,
  dados: PropTypes.object,
  linha: PropTypes.string,
  lenght: PropTypes.number,
  lenght1: PropTypes.number,
  segmento: PropTypes.string,
};

function FirstRowSegmento({ segmento, linha, dados, lenght, from, lenght1 }) {
  return (
    <TableRow hover>
      <TableCell rowSpan={lenght} sx={{ pl: '12px !important' }}>
        <Typography variant="subtitle2">{segmento}</Typography>
      </TableCell>
      {segmento === 'Entidades Públicas' || segmento === 'Garantias Bancárias' ? (
        <TableCell rowSpan={lenght - 1} sx={{ pl: '12px !important' }}>
          {}
        </TableCell>
      ) : (
        <TableCell rowSpan={lenght1 > 0 ? lenght1 + 1 : 2} sx={{ pl: '12px !important' }}>
          <Typography variant="subtitle2">{linha}</Typography>
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
      <TableCell rowSpan={lenght > 0 ? lenght + 1 : 2} sx={{ pl: '12px !important' }}>
        <Typography variant="subtitle2">{linha}</Typography>
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
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

CardResumo.propTypes = { total: PropTypes.number, label: PropTypes.string };

function CardResumo({ total, label }) {
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
              (label === 'Contratado' && <HandshakeOutlinedIcon sx={{ width: 30, height: 30 }} />) || (
                <DoDisturbIcon sx={{ width: 30, height: 30 }} />
              )}
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

TableRowResumo.propTypes = { total: PropTypes.object, label: PropTypes.string, dados: PropTypes.object };

function TableRowResumo({ dados, label, total }) {
  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="subtitle2">{label}</Typography>
      </TableCell>
      <TableCell align="right">{fCurrency(dados?.entrada)}</TableCell>
      <TableCell align="right" width={10}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {fPercent((dados?.entrada * 100) / total?.totalEntrada)}
        </Typography>
      </TableCell>
      <TableCell align="right">{fCurrency(dados?.aprovado)}</TableCell>
      <TableCell align="right" width={10}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {fPercent((dados?.aprovado * 100) / total?.totalAprovado)}
        </Typography>
      </TableCell>
      <TableCell align="right">{fCurrency(dados?.contratado)}</TableCell>
      <TableCell align="right" width={10}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {fPercent((dados?.contratado * 100) / total?.totalContratado)}
        </Typography>
      </TableCell>
      <TableCell align="right">{fCurrency(dados?.id)}</TableCell>
      <TableCell align="right" width={10}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {fPercent((dados?.id * 100) / total?.totalID)}
        </Typography>
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
  const particularOutros = dados?.filter((row) => row?.segmento === 'Particular' && row?.linha === 'Outros');
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

// ----------------------------------------------------------------------

function sumDados(dados, segmento, column) {
  return sumBy(
    dados?.filter((row) => row?.segmento === segmento),
    column
  );
}
