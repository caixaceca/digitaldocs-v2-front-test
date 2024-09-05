import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
import { format, add } from 'date-fns';
import { useEffect, useState, useMemo } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import { useTheme } from '@mui/material/styles';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
// utils
import { getFile } from '../../utils/getFile';
import { setItemValue, baralharString } from '../../utils/formatText';
import { fNumber, fPercent, fNumber2, fData } from '../../utils/formatNumber';
import { UosAcesso, EstadosAcesso, ColaboradoresAcesso } from '../../utils/validarAcesso';
import { fYear, fMonthYear, ptDate, getDataLS, dataValido, setDataUtil } from '../../utils/formatTime';
// hooks
import useToggle from '../../hooks/useToggle';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getIndicadores } from '../../redux/slices/indicadores';
// components
import MyAvatar from '../../components/MyAvatar';
import { BarChart } from '../../components/skeleton';
import Panel, { BoxMask } from '../../components/Panel';
import { SearchNotFound } from '../../components/table';
import Chart, { useChart } from '../../components/chart';
import { DTFechar, ExportExcel } from '../../components/Actions';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
//
import { Todos, Media, Maximo } from '../../assets';
import { DuracaoEquipa, Conclusao, Execucao } from './Duracao';
import { EntradaTrabalhado, ProcessosTrabalhados, Colaboradores } from './SGQ';
import { Criacao, EntradasTrabalhados, DevolvidosTipos, Origem } from './TotalProcessos';

// --------------------------------------------------------------------------------------------------------------------------------------------

Cabecalho.propTypes = {
  tab: PropTypes.string,
  top: PropTypes.string,
  setTop: PropTypes.func,
  title: PropTypes.string,
  periodo: PropTypes.string,
  changeTab: PropTypes.func,
  tabsList: PropTypes.array,
  setPeriodo: PropTypes.func,
  currentTab: PropTypes.string,
};

export function Cabecalho({ title, tab, top, periodo, setTop, setPeriodo, tabsList = [], currentTab = '', changeTab }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const [datai, setDatai] = useState(getDataLS('dataIIndic', null));
  const [dataf, setDataf] = useState(getDataLS('dataFIndic', null));
  const [origem, setOrigem] = useState(localStorage.getItem('origem') || 'Interna');
  const [entrada, setEntrada] = useState(localStorage.getItem('entrada') === 'true');
  const [momento, setMomento] = useState(localStorage.getItem('momento') || 'Criação no sistema');
  const [agrEntradas, setAgrEntradas] = useState(localStorage.getItem('agrEntradas') || 'Balcão');
  const [agrupamento, setAgrupamento] = useState(localStorage.getItem('agrupamento') || 'Unidade orgânica');
  const [ano, setAno] = useState(
    localStorage.getItem('anoIndic') ? add(new Date(localStorage.getItem('anoIndic')), { hours: 2 }) : new Date()
  );
  const { mail, perfilId, cc, uos, colaboradores } = useSelector((state) => state.intranet);
  const { isAdmin, meusAmbientes, fluxos, estados } = useSelector((state) => state.parametrizacao);

  const fluxosList = useMemo(() => fluxos?.map((row) => ({ id: row?.id, label: row?.assunto })), [fluxos]);
  const [fluxo, setFluxo] = useState(
    fluxosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('fluxoIndic'))) || null
  );

  const uosList = useMemo(() => UosAcesso(uos, cc, isAdmin, meusAmbientes, 'id'), [cc, isAdmin, meusAmbientes, uos]);
  const [uo, setUo] = useState(
    uosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('uoIndic'))) ||
      uosList?.find((row) => Number(row?.id) === Number(cc?.uo?.id)) ||
      null
  );

  const balcoesList = useMemo(
    () => UosAcesso(uos, cc, isAdmin, meusAmbientes, 'balcao'),
    [cc, isAdmin, meusAmbientes, uos]
  );
  const [balcao, setBalcao] = useState(
    balcoesList?.find((row) => Number(row?.id) === Number(localStorage.getItem('balcaoIndic'))) ||
      balcoesList?.find((row) => Number(row?.id) === Number(cc?.uo?.id)) ||
      null
  );

  const estadosList = useMemo(
    () => EstadosAcesso(uos, cc, isAdmin, estados, meusAmbientes),
    [cc, estados, isAdmin, meusAmbientes, uos]
  );
  const [estado, setEstado] = useState(
    estadosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('estadoIndic'))) || null
  );

  const colaboradoresList = useMemo(
    () =>
      uo?.id && tab !== 'execucao' && tab !== 'conclusao'
        ? ColaboradoresAcesso(colaboradores, cc, isAdmin, meusAmbientes)?.filter((row) => row?.uoId === uo?.id)
        : ColaboradoresAcesso(colaboradores, cc, isAdmin, meusAmbientes),
    [cc, colaboradores, isAdmin, meusAmbientes, tab, uo?.id]
  );
  const [perfil, setPerfil] = useState(
    colaboradoresList?.find((row) => Number(row?.id) === Number(localStorage.getItem('colaboradorIndic'))) ||
      colaboradoresList?.find((row) => Number(row?.id) === Number(perfilId)) ||
      null
  );

  useEffect(() => {
    if (!uo && uosList && (localStorage.getItem('uoIndic') || cc?.uo?.id)) {
      setUo(
        uosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('uoIndic'))) ||
          uosList?.find((row) => Number(row?.id) === Number(cc?.uo?.id))
      );
      localStorage.setItem('uoIndic', localStorage.getItem('uoIndic') || cc?.uo?.id || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uosList, cc?.uo?.id]);

  useEffect(() => {
    if (!perfil?.id && colaboradoresList && (localStorage.getItem('colaboradorIndic') || perfilId)) {
      setPerfil(
        colaboradoresList?.find((row) => Number(row?.id) === Number(localStorage.getItem('colaboradorIndic'))) ||
          colaboradoresList?.find((row) => Number(row?.id) === Number(perfilId))
      );
      localStorage.setItem('colaboradorIndic', localStorage.getItem('colaboradorIndic') || perfilId || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colaboradoresList, perfilId]);

  useEffect(() => {
    if (!fluxo && fluxosList && localStorage.getItem('fluxoIndic')) {
      setFluxo(fluxosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('fluxoIndic'))));
    }
  }, [fluxosList, fluxo]);

  useEffect(() => {
    if (!estado && estadosList && localStorage.getItem('estadoIndic')) {
      setEstado(estadosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('estadoIndic'))));
    }
  }, [estadosList, estado]);

  useEffect(() => {
    if (mail && perfilId && tab) {
      dispatch(
        getIndicadores(tab, {
          mail,
          origem,
          entrada,
          periodo,
          perfilId,
          uo: uo?.id,
          agrEntradas,
          fluxo: fluxo?.id,
          balcao: balcao?.id,
          perfil: perfil?.id,
          estado: estado?.id,
          ano: dataValido(ano) ? format(ano, 'yyyy') : '',
          momento: momento === 'Criação no sistema' ? 'c' : 'e',
          datai: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
          dataf: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
          agrupamento: agrupamento === 'Colaborador' ? 'perfil' : 'uo',
        })
      );
    }
  }, [
    tab,
    ano,
    mail,
    datai,
    dataf,
    balcao,
    estado,
    uo?.id,
    origem,
    entrada,
    periodo,
    momento,
    dispatch,
    perfilId,
    fluxo?.id,
    perfil?.id,
    agrupamento,
    agrEntradas,
  ]);

  const haveColaborador =
    tab === 'acao' ||
    tab === 'data' ||
    tab === 'tipos' ||
    tab === 'execucao' ||
    tab === 'conclusao' ||
    tab === 'totalTrabalhados';
  const haveEstado =
    tab === 'execucao' ||
    tab === 'devolucoes' ||
    tab === 'trabalhados' ||
    (tab === 'equipa' && agrEntradas === 'Estado') ||
    (tab === 'entradas' && agrEntradas === 'Estado') ||
    (tab === 'colaboradores' && agrEntradas === 'Estado') ||
    (tab === 'entradaTrabalhado' && agrEntradas === 'Estado') ||
    ((tab === 'totalTrabalhados' || tab === 'acao') && agrEntradas === 'Estado');
  const havePeriodo =
    tab === 'criacao' ||
    tab === 'entradas' ||
    tab === 'trabalhados' ||
    tab === 'devolucoes' ||
    tab === 'tipos' ||
    tab === 'conclusao';

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={title}
        action={
          <Button variant="contained" endIcon={<FilterListOutlinedIcon />} onClick={onOpen}>
            Filtrar
          </Button>
        }
      />

      {currentTab && (
        <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={changeTab} sx={{ mb: 1.5 }} />
      )}

      <Stack direction="row" justifyContent="center" sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" flexWrap="wrap" gap={1}>
          {tab === 'conclusao' && momento && <Panel label="Momento" value={momento} />}
          {tab === 'origem' && (agrupamento || top !== 'Todos') && (
            <>
              {agrupamento && <Panel label="Agrupamento" value={agrupamento} />}
              {top !== 'Todos' && <Panel value={top} />}
            </>
          )}
          {tab === 'data' && periodo && <Panel label="Período" value={periodo} />}
          {(tab === 'acao' ||
            tab === 'equipa' ||
            tab === 'colaboradores' ||
            tab === 'totalTrabalhados' ||
            tab === 'entradaTrabalhado') &&
            ano &&
            dataValido(ano) && <Panel label="Ano" value={format(ano, 'yyyy')} />}

          {(tab === 'data' ||
            tab === 'tipos' ||
            tab === 'criacao' ||
            ((tab === 'acao' ||
              tab === 'equipa' ||
              tab === 'entradaTrabalhado' ||
              tab === 'totalTrabalhados' ||
              tab === 'colaboradores') &&
              agrEntradas === 'Balcão')) &&
            uo?.label && <Panel label="Balcão/U.O" value={uo?.label} />}
          {tab === 'entradas' && balcao?.label && agrEntradas === 'Balcão' && (
            <Panel label="Balcão" value={balcao?.label} />
          )}
          {haveEstado && estado?.label && <Panel label="Estado" value={estado?.label} />}
          {haveColaborador && perfil?.label && <Panel label="Colaborador" value={perfil?.label} />}
          {tab === 'devolucoes' && origem && <Panel label="Origem" value={origem} />}
          {(tab === 'conclusao' || tab === 'execucao') && fluxo?.label && (
            <Panel label="Assunto" value={balcao?.fluxo} />
          )}
          {(tab === 'entradaTrabalhado' || tab === 'totalTrabalhados' || tab === 'acao') && entrada && (
            <Panel value={tab === 'entradaTrabalhado' ? 'Distinto' : 'Entrada'} />
          )}
          {havePeriodo && (datai || dataf) && (
            <Panel
              label={(datai && dataf && 'Período') || (datai && 'Desde') || (dataf && 'Até')}
              value={
                (datai && dataf && `${ptDate(datai)}-${ptDate(dataf)}`) ||
                (datai && ptDate(datai)) ||
                (dataf && ptDate(dataf))
              }
            />
          )}
        </Stack>
      </Stack>

      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DTFechar title="Filtrar" handleClick={() => onClose()} />
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 3 }}>
            {tab === 'devolucoes' && (
              <FilterRG localS="origem" value={origem} setValue={setOrigem} options={['Interna', 'Externa']} />
            )}
            {tab === 'conclusao' && (
              <FilterRG
                localS="momento"
                value={momento}
                setValue={setMomento}
                options={['Criação no sistema', 'Data de entrada']}
              />
            )}
            {(tab === 'acao' ||
              tab === 'equipa' ||
              tab === 'entradas' ||
              tab === 'colaboradores' ||
              tab === 'totalTrabalhados' ||
              tab === 'entradaTrabalhado') && (
              <FilterRG
                localS="agrEntradas"
                value={agrEntradas}
                setValue={setAgrEntradas}
                options={['Balcão', 'Estado']}
              />
            )}
            {tab === 'origem' && (
              <>
                <FilterRG
                  localS="agrupamento"
                  value={agrupamento}
                  setValue={setAgrupamento}
                  options={['Unidade orgânica', 'Colaborador']}
                />
                <FilterRG localS="top" value={top} setValue={setTop} options={['Todos', 'Top 5', 'Top 10', 'Top 20']} />
              </>
            )}
            {tab === 'data' && (
              <FilterRG
                label="Período"
                localS="periodo"
                value={periodo}
                setValue={setPeriodo}
                options={['Mensal', 'Anual']}
              />
            )}
            {(tab === 'acao' ||
              tab === 'equipa' ||
              tab === 'colaboradores' ||
              tab === 'totalTrabalhados' ||
              tab === 'entradaTrabalhado') && (
              <DatePicker
                value={ano}
                label="Ano"
                disableFuture
                views={['year']}
                onChange={(newValue) => setDataUtil(newValue, setAno, 'anoIndic', null, '', null)}
              />
            )}
            {(tab === 'data' ||
              tab === 'tipos' ||
              tab === 'criacao' ||
              ((tab === 'acao' ||
                tab === 'equipa' ||
                tab === 'colaboradores' ||
                tab === 'totalTrabalhados' ||
                tab === 'entradaTrabalhado') &&
                agrEntradas === 'Balcão')) && (
              <FilterAutocomplete
                value={uo}
                setValue={setUo}
                options={uosList}
                label="Unidade orgânica"
                disableClearable={tab === 'criacao'}
              />
            )}
            {tab === 'entradas' && agrEntradas === 'Balcão' && (
              <FilterAutocomplete
                value={balcao}
                label="Balcão"
                disableClearable
                setValue={setBalcao}
                options={balcoesList}
              />
            )}
            {haveEstado && (
              <FilterAutocomplete
                label="Estado"
                value={estado}
                setValue={setEstado}
                options={estadosList}
                disableClearable={haveEstado && !perfil && !fluxo}
              />
            )}
            {haveColaborador && (
              <FilterAutocomplete
                value={perfil}
                label="Colaborador"
                setValue={setPerfil}
                options={colaboradoresList}
                disableClearable={tab === 'execucao' && !estado && !fluxo}
              />
            )}
            {(tab === 'conclusao' || tab === 'execucao') && (
              <FilterAutocomplete
                value={fluxo}
                setValue={setFluxo}
                options={fluxosList}
                label="Assunto"
                disableClearable={tab === 'execucao' && !perfil && !estado}
              />
            )}
            {(tab === 'entradaTrabalhado' || tab === 'totalTrabalhados' || tab === 'acao') && (
              <FilterSwitch
                value={entrada}
                localS="entrada"
                setValue={setEntrada}
                label={tab === 'entradaTrabalhado' ? 'Distinto' : 'Entrada'}
              />
            )}
            {havePeriodo && (
              <Stack direction="row" spacing={1}>
                <DatePicker
                  disableFuture
                  value={datai}
                  label="Data inicial"
                  slotProps={{ field: { clearable: true }, textField: { fullWidth: true } }}
                  onChange={(newValue) => setDataUtil(newValue, setDatai, 'dataIIndic', setDataf, 'dataFIndic', dataf)}
                />
                <DatePicker
                  disableFuture
                  value={dataf}
                  minDate={datai}
                  disabled={!datai}
                  label="Data final"
                  slotProps={{ field: { clearable: true }, textField: { fullWidth: true } }}
                  onChange={(newValue) => setDataUtil(newValue, setDataf, 'dataFIndic', '', '', '')}
                />
              </Stack>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FileSystem() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { fileSystem, isLoading } = useSelector((state) => state.indicadores);
  const isNotFound = !fileSystem.length;
  const chartColors = [theme.palette.primary.main, theme.palette.primary.dark];
  const chartOptions = useChart({
    chart: { offsetY: -16, sparkline: { enabled: true } },
    grid: { padding: { top: 24, bottom: 24 } },
    legend: { show: false },
    plotOptions: {
      radialBar: {
        endAngle: 90,
        startAngle: -90,
        hollow: { size: '56%' },
        dataLabels: {
          name: { offsetY: 8 },
          value: { offsetY: -50 },
          total: {
            label: `Usado de ${fData(500000000000)}`,
            color: theme.palette.text.disabled,
            fontSize: theme.typography.body2.fontSize,
            fontWeight: theme.typography.body2.fontWeight,
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [chartColors].map((colors) => [
          { offset: 0, color: colors[0] },
          { offset: 75, color: colors[1] },
        ]),
      },
    },
  });

  const total = { tipo: 'Total', qnt: 0, tamanho: 0, file: 'folder' };
  const pdf = { tipo: 'Pdf', qnt: 0, tamanho: 0, file: 'format_pdf' };
  const outros = { tipo: 'Outros', qnt: 0, tamanho: 0, file: 'file' };
  const word = { tipo: 'Word', qnt: 0, tamanho: 0, file: 'format_word' };
  const imagem = { tipo: 'Img', qnt: 0, tamanho: 0, file: 'format_image' };
  const excel = { tipo: 'Excel', qnt: 0, tamanho: 0, file: 'format_excel' };

  fileSystem?.forEach((row) => {
    total.qnt += row.quantidade;
    total.tamanho += row.tamanhoMB * 1000000;
    if (row.tipo === 'application/pdf') {
      pdf.qnt += row.quantidade;
      pdf.tamanho += row.tamanhoMB * 1000000;
    } else if (row.tipo.includes('image/')) {
      imagem.qnt += row.quantidade;
      imagem.tamanho += row.tamanhoMB * 1000000;
    } else if (
      row.tipo === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      row.tipo.includes('excel')
    ) {
      excel.qnt += row.quantidade;
      excel.tamanho += row.tamanhoMB * 1000000;
    } else if (
      row.tipo === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      row.tipo.includes('msword')
    ) {
      word.qnt += row.quantidade;
      word.tamanho += row.tamanhoMB * 1000000;
    } else {
      outros.qnt += row.quantidade;
      outros.tamanho += row.tamanhoMB * 1000000;
    }
  });

  useEffect(() => {
    if (mail && perfilId) {
      dispatch(getIndicadores('fileSystem', { mail, perfilId }));
    }
  }, [dispatch, perfilId, mail]);

  return (
    <Card>
      <IndicadorItem
        isLoading={isLoading}
        isNotFound={isNotFound}
        children={
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Chart
                height={500}
                type="radialBar"
                options={chartOptions}
                series={[((total?.tamanho * 100) / 500000000000).toFixed(2)]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={2}>
                {[total, pdf, imagem, excel, word, outros].map(
                  (folder) =>
                    folder.qnt > 0 && (
                      <Card
                        key={folder.tipo}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          boxShadow: 'none',
                          border: `solid 1px ${theme.palette.divider}`,
                          '&:hover': { bgcolor: 'background.neutral', boxShadow: theme.customShadows.z2 },
                        }}
                      >
                        <Stack spacing={2} direction="row" alignItems="center">
                          <Box
                            component="img"
                            sx={{ width: 45, height: 45 }}
                            src={`/assets/icons/file_format/${folder.file}.svg`}
                          />

                          <Stack spacing={0.5} flexGrow={1}>
                            <Typography variant="subtitle1">{folder.tipo}</Typography>
                            <Stack direction="row" alignContent="center" spacing={0.5}>
                              <Typography variant="body2">{fNumber(folder.qnt)} </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', typography: 'body2' }}>
                                {folder.qnt > 1 ? 'ficheiros' : 'ficheiro'}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={0.5}>
                            <Typography variant="h6"> {fData(folder.tamanho)} </Typography>
                            {folder.tipo !== 'Total' && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', typography: 'body2' }}>
                                ({fPercent((folder.tamanho * 100) / total.tamanho)})
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      </Card>
                    )
                )}
              </Stack>
            </Grid>
          </Grid>
        }
      />
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function TotalProcessos() {
  const { indicadores } = useSelector((state) => state.indicadores);
  const [top, setTop] = useState(localStorage.getItem('top') || 'Todos');
  const [periodo, setPeriodo] = useState(localStorage.getItem('periodo') || 'Mensal');
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabTotal') || 'data');
  const indicadoresList = useMemo(() => (Array.isArray(indicadores) ? indicadores : []), [indicadores]);

  const tabsList = [
    { value: 'data', label: 'Data', component: <Criacao periodo={periodo} indicadores={indicadoresList} /> },
    { value: 'entradas', label: 'Entradas', component: <DevolvidosTipos indicadores={indicadoresList} /> },
    { value: 'criacao', label: 'Criação', component: <EntradasTrabalhados indicadores={indicadoresList} /> },
    { value: 'trabalhados', label: 'Trabalhados', component: <EntradasTrabalhados indicadores={indicadoresList} /> },
    { value: 'devolucoes', label: 'Devoluções', component: <DevolvidosTipos indicadores={indicadoresList} dev /> },
    { value: 'origem', label: 'Origem', component: <Origem top={top} indicadores={indicadoresList} /> },
    { value: 'tipos', label: 'Fluxos', component: <DevolvidosTipos indicadores={indicadoresList} /> },
  ];

  const handleChangeTab = async (event, newValue) => {
    setItemValue(newValue, setCurrentTab, 'tabTotal');
  };

  return (
    <>
      <Cabecalho
        top={top}
        setTop={setTop}
        tab={currentTab}
        periodo={periodo}
        tabsList={tabsList}
        setPeriodo={setPeriodo}
        currentTab={currentTab}
        changeTab={handleChangeTab}
        title={`Total de processos - ${tabsList?.find((row) => row?.value === currentTab)?.label}`}
      />

      {tabsList.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function Duracao() {
  const { indicadores } = useSelector((state) => state.indicadores);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tadDuracao') || 'conclusao');
  const indicadoresList = useMemo(() => (Array.isArray(indicadores) ? indicadores : []), [indicadores]);

  const tabsList = [
    { value: 'equipa', label: 'Estado/U.O', component: <DuracaoEquipa indicadores={indicadoresList} /> },
    { value: 'execucao', label: 'Tempo de execução', component: <Execucao indicadores={indicadoresList} /> },
    { value: 'conclusao', label: 'Conclusão', component: <Conclusao indicadores={indicadoresList} /> },
  ];

  const handleChangeTab = async (event, newValue) => {
    setItemValue(newValue, setCurrentTab, 'tadDuracao');
  };

  return (
    <>
      <Cabecalho
        tab={currentTab}
        tabsList={tabsList}
        currentTab={currentTab}
        changeTab={handleChangeTab}
        title={`Duração dos processos - ${tabsList?.find((row) => row?.value === currentTab)?.label}`}
      />

      {tabsList.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function SGQ() {
  const { indicadores } = useSelector((state) => state.indicadores);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabSgq') || 'totalTrabalhados');
  const entradas = useMemo(
    () => (Array.isArray(indicadores?.objeto_entrada) ? indicadores?.objeto_entrada : []),
    [indicadores?.objeto_entrada]
  );
  const saidas = useMemo(
    () => (Array.isArray(indicadores?.objeto_saida) ? indicadores?.objeto_saida : []),
    [indicadores?.objeto_saida]
  );
  const indicadoresList = useMemo(() => (Array.isArray(indicadores) ? indicadores : []), [indicadores]);

  const tabsList = [
    {
      value: 'totalTrabalhados',
      label: 'Trabalhados',
      component: <ProcessosTrabalhados indicadores={indicadoresList} />,
    },
    {
      value: 'acao',
      label: 'Ação',
      component: <ProcessosTrabalhados indicadores={indicadoresList} acao />,
    },
    {
      value: 'entradaTrabalhado',
      label: 'Entrada/Trabalhado',
      component: <EntradaTrabalhado entradas={entradas} saidas={saidas} />,
    },
    {
      value: 'colaboradores',
      label: 'Colaboradores',
      component: <Colaboradores entradas={entradas} saidas={saidas} />,
    },
  ];

  const handleChangeTab = async (event, newValue) => {
    setItemValue(newValue, setCurrentTab, 'tabSgq');
  };

  return (
    <>
      <Cabecalho
        tab={currentTab}
        tabsList={tabsList}
        currentTab={currentTab}
        changeTab={handleChangeTab}
        title={`SGQ - ${tabsList?.find((row) => row?.value === currentTab)?.label}`}
      />

      {tabsList.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

IndicadorItem.propTypes = { children: PropTypes.node, isLoading: PropTypes.bool, isNotFound: PropTypes.bool };

export function IndicadorItem({ isLoading = false, isNotFound = false, children = null }) {
  return (
    <CardContent>
      {isLoading ? (
        <BarChart />
      ) : (
        <>{isNotFound ? <SearchNotFound message="Nenhum registo encontrado..." /> : children}</>
      )}
    </CardContent>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

CardInfo.propTypes = {
  dev: PropTypes.bool,
  title: PropTypes.string,
  label: PropTypes.string,
  total: PropTypes.number,
  conclusao: PropTypes.bool,
  percentagem: PropTypes.number,
};

export function CardInfo({ title, label, total, conclusao = false, dev = false, percentagem = -1 }) {
  const iconOptions = { width: 50, height: 50, opacity: 0.48 };
  const color =
    (title === 'Média' && 'info') ||
    (((title === 'Mais processos' && !dev) || (title === 'Menos processos' && dev) || title === 'Menor duração') &&
      'success') ||
    (((title === 'Menos processos' && !dev) || (title === 'Mais processos' && dev) || title === 'Maior duração') &&
      'error') ||
    'focus';
  return (
    <Card
      sx={{
        height: 1,
        display: 'flex',
        boxShadow: 'none',
        alignItems: 'center',
        color: `${color}.darker`,
        bgcolor: `${color}.lighter`,
      }}
    >
      <BoxMask sx={{ maskSize: 'revert', maskRepeat: 'no-repeat', maskPositionX: 'right', maskPositionY: 'bottom' }} />
      <Stack sx={{ p: 3 }}>
        <Stack>
          <Typography variant="subtitle2">{title}</Typography>
          {label && (
            <Typography variant="subtitle1" sx={{ color: `${color}.main`, py: 0.5 }} noWrap>
              {label}
            </Typography>
          )}
          <Typography variant="h4">
            {conclusao ? `${total?.toFixed(2)} ${total > 1 ? 'dias' : 'dia'}` : fNumber(total)}
          </Typography>
        </Stack>
        <Stack direction="column" sx={{ position: 'absolute', right: 10 }} justifyContent="center" alignItems="center">
          {(title === 'Média' && <Media sx={iconOptions} />) ||
            (color === 'success' && <Maximo sx={iconOptions} />) ||
            (color === 'error' && <Maximo sx={{ ...iconOptions, transform: 'rotate(180deg)' }} />) || (
              <Todos sx={iconOptions} />
            )}
          {percentagem > -1 && <Typography variant="caption">{fPercent(percentagem)}</Typography>}
        </Stack>
      </Stack>
    </Card>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ColaboradorCard.propTypes = {
  detail: PropTypes.bool,
  total: PropTypes.number,
  assuntos: PropTypes.array,
  colaboradorDados: PropTypes.object,
};

export function ColaboradorCard({ colaboradorDados, total, assuntos, detail }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const totalColaborador = sumBy(colaboradorDados?.processos, 'total');
  const colaborador = colaboradores?.find((row) => row.perfil_id === colaboradorDados.item);

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Card sx={{ height: 1, p: 1 }}>
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{ py: 1.5, bgcolor: detail && 'background.neutral', borderRadius: 1 }}
        >
          <MyAvatar
            alt={colaborador?.perfil?.displayName}
            src={getFile('colaborador', colaborador?.foto_disk)}
            sx={{ width: 50, height: 50, boxShadow: (theme) => theme.customShadows.z8 }}
          />
          <Stack>
            <Typography variant="subtitle1" noWrap>
              {baralharString(colaborador?.perfil?.displayName)}
            </Typography>
            <Stack spacing={1} direction="row" alignItems="center" sx={{ color: 'text.success' }}>
              <Typography variant="h6">{fNumber(totalColaborador)}</Typography>
              <Typography sx={{ opacity: 0.75 }}>({fPercent((totalColaborador * 100) / total)})</Typography>
            </Stack>
          </Stack>
        </Stack>
        {detail && (
          <Stack sx={{ p: 1 }}>
            {colaboradorDados?.processos?.map((row) => {
              const percentagem = (row?.total * 100) / totalColaborador;
              const totalAssunto = assuntos?.find((assunto) => assunto?.item === row?.assunto);
              return (
                <Stack key={row.assunto} spacing={0.5} sx={{ width: 1, mt: 3 }}>
                  <Stack spacing={0.5} direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                      {row?.assunto}
                    </Typography>
                    <Stack
                      spacing={0.75}
                      direction="row"
                      alignItems="center"
                      divider={<Divider orientation="vertical" flexItem />}
                    >
                      <Typography variant="subtitle1">&nbsp;{fNumber(row?.total)}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {fPercent((row?.total * 100) / sumBy(totalAssunto?.processos, 'total'))}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.success', opacity: 0.75 }}>
                        {fPercent(percentagem)}
                      </Typography>
                    </Stack>
                  </Stack>
                  <LinearProgress variant="determinate" value={percentagem} color="success" />
                </Stack>
              );
            })}
          </Stack>
        )}
      </Card>
    </Grid>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TableExport.propTypes = {
  dados: PropTypes.array,
  total: PropTypes.number,
  label: PropTypes.string,
  label1: PropTypes.string,
  periodo: PropTypes.string,
  percentagem: PropTypes.bool,
};

export function TableExport({ label, label1, dados, total = 0, percentagem = false, periodo = '' }) {
  return (
    <Table id="table-to-xls-tipo">
      <TableHead>
        <TableRow>
          <TableCell>{label}</TableCell>
          <TableCell align="right">{label1}</TableCell>
          {percentagem && <TableCell align="right">Percentagem</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {dados?.map((row, index) => (
          <TableRow key={`table_row_export_${index}`} hover>
            <TableCell>
              {row?.criado_em ? (
                <>{periodo === 'Anual' ? fYear(row?.criado_em) : periodo === 'Mensal' && fMonthYear(row?.criado_em)}</>
              ) : (
                row?.assunto || row?.label
              )}
            </TableCell>
            <TableCell align="right">
              {label1 === 'Média em dias' ? fNumber2(row?.total || row?.dias) : fNumber(row?.total || row?.dias)}
            </TableCell>
            {percentagem && <TableCell align="right">{fPercent((row?.total * 100) / total)}</TableCell>}
          </TableRow>
        ))}
        {label1 !== 'Média em dias' && (
          <TableRow hover>
            <TableCell>
              <Typography variant="subtitle1">Total</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle1">{fNumber(total)}</Typography>
            </TableCell>
            {percentagem && <TableCell align="right"> </TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TabView.propTypes = { vista: PropTypes.string, setVista: PropTypes.func };

export function TabView({ vista, setVista }) {
  return (
    <Stack direction="row" justifyContent="right" alignItems="center" spacing={1}>
      <Tabs
        value={vista}
        sx={{ minHeight: '35px' }}
        onChange={(event, newValue) => setItemValue(newValue, setVista, 'tabView')}
      >
        {['Gráfico', 'Tabela'].map((tab) => (
          <Tab key={tab} label={tab} value={tab} sx={{ px: 0.5, minHeight: '35px' }} />
        ))}
      </Tabs>
      {vista === 'Tabela' && <ExportExcel icon filename="Indicadores" table="table-to-xls-tipo" />}
    </Stack>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

FilterAutocomplete.propTypes = {
  label: PropTypes.string,
  value: PropTypes.object,
  options: PropTypes.array,
  setValue: PropTypes.func,
};

function FilterAutocomplete({ label, value, options, setValue, ...other }) {
  const localS =
    (label === 'Estado' && 'estadoIndic') ||
    (label === 'Unidade orgânica' && 'uoIndic') ||
    (label === 'Assunto' && 'fluxoIndic') ||
    (label === 'Colaborador' && 'colaboradorIndic') ||
    '';
  return (
    <Autocomplete
      fullWidth
      value={value}
      options={options}
      getOptionLabel={(option) => option?.label}
      renderInput={(params) => <TextField {...params} label={label} />}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      onChange={(event, newValue) => setItemValue(newValue, setValue, localS, true)}
      {...other}
    />
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

FilterRG.propTypes = {
  value: PropTypes.string,
  localS: PropTypes.string,
  options: PropTypes.array,
  setValue: PropTypes.func,
};

function FilterRG({ localS, value, setValue, options = [] }) {
  return (
    <Stack>
      <RadioGroup
        row
        value={value}
        sx={{ justifyContent: 'center' }}
        onChange={(event, newValue) => setItemValue(newValue, setValue, localS)}
      >
        {options?.map((row) => (
          <FormControlLabel key={row} value={row} label={row} control={<Radio size="small" />} />
        ))}
      </RadioGroup>
    </Stack>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

FilterSwitch.propTypes = {
  value: PropTypes.bool,
  label: PropTypes.string,
  localS: PropTypes.string,
  setValue: PropTypes.func,
};

export function FilterSwitch({ label, value, setValue, localS = '' }) {
  return (
    <FormControlLabel
      label={label}
      sx={{ pr: 2, justifyContent: 'center' }}
      control={
        <Switch
          checked={value}
          onChange={(event, value) => {
            setValue(value);
            if (localS) {
              localStorage.setItem(localS, value === true ? 'true' : 'false');
            }
          }}
        />
      }
    />
  );
}

// ----------------------------------------------------------------------

export function dadosResumo(dados, item, label) {
  const total = sumBy(dados, item);
  const maximo = Math.max(...dados?.map((row) => row[item]));
  const minimo = Math.min(...dados?.map((row) => row[item]));
  return [
    ...[
      label === 'assunto'
        ? { label: 'Total', valor: total, desc: '' }
        : { label: 'Média', valor: total / dados?.length, desc: '' },
    ],
    {
      valor: maximo,
      percentagem: (maximo * 100) / total,
      desc: dados?.find((row) => row[item] === maximo)?.[label],
      label: item === 'dias' ? 'Maior duração' : 'Mais processos',
    },
    {
      valor: minimo,
      percentagem: (minimo * 100) / total,
      desc: dados?.find((row) => row[item] === minimo)?.[label],
      label: item === 'dias' ? 'Menor duração' : 'Menos processos',
    },
  ];
}
