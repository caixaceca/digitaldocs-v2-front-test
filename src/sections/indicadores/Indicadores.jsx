import sumBy from 'lodash/sumBy';
import { useState, useMemo } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
// utils
import { useSelector } from '@/redux/store';
import { setItemValue } from '@/utils/formatObject';
import { getIntranetFile } from '@/utils/formatFile';
import { fYear, fMonthYear } from '@/utils/formatTime';
import { fNumber, fPercent } from '@/utils/formatNumber';
// components
import { BoxMask } from '@/components/Panel';
import GridItem from '@/components/GridItem';
import { BarChart } from '@/components/skeleton';
import { SearchNotFound } from '@/components/table';
import CustomAvatar from '@/components/custom-avatar';
//
import { Cabecalho } from './cabecalho-filtrar';
import { Todos, Media, Maximo } from '@/assets';
import { EntradasTrabalhados } from './entrados-trabalhados';
import { DuracaoEquipa, Conclusao, Execucao } from './Duracao';
import { Criacao, DevolvidosTipos, Origem } from './TotalProcessos';
import { EntradaTrabalhado, ProcessosTrabalhados, Colaboradores } from './SGQ';

// ---------------------------------------------------------------------------------------------------------------------

export function TotalProcessos() {
  const { indicadores } = useSelector((state) => state.indicadores);
  const [top, setTop] = useState(localStorage.getItem('top') || 'Todos');
  const [vista, setVista] = useState(localStorage.getItem('vista') || 'Mensal');
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabTotal') || 'data');
  const indicadoresList = useMemo(() => (Array.isArray(indicadores) ? indicadores : []), [indicadores]);

  const tabsList = [
    { value: 'data', label: 'Data', component: <Criacao vista={vista} indicadores={indicadoresList} /> },
    { value: 'entradas', label: 'Entradas', component: <DevolvidosTipos indicadores={indicadoresList} /> },
    { value: 'criacao', label: 'Criação', component: <EntradasTrabalhados indicadores={indicadoresList} /> },
    { value: 'trabalhados', label: 'Trabalhados', component: <EntradasTrabalhados indicadores={indicadoresList} /> },
    { value: 'devolucoes', label: 'Devoluções', component: <DevolvidosTipos indicadores={indicadoresList} dev /> },
    { value: 'origem', label: 'Origem', component: <Origem top={top} indicadores={indicadoresList} /> },
    { value: 'tipos', label: 'Fluxos', component: <DevolvidosTipos indicadores={indicadoresList} /> },
  ];

  const handleChangeTab = async (event, newValue) => setItemValue(newValue, setCurrentTab, 'tabTotal');

  return (
    <>
      <Cabecalho
        top={top}
        vista={vista}
        setTop={setTop}
        tab={currentTab}
        tabsList={tabsList}
        setVista={setVista}
        currentTab={currentTab}
        changeTab={handleChangeTab}
        title={`Total de processos - ${tabsList?.find(({ value }) => value === currentTab)?.label}`}
      />
      <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Duracao() {
  const { indicadores } = useSelector((state) => state.indicadores);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tadDuracao') || 'conclusao');
  const indicadoresList = useMemo(() => (Array.isArray(indicadores) ? indicadores : []), [indicadores]);

  const tabsList = [
    { value: 'equipa', label: 'Estado/U.O', component: <DuracaoEquipa indicadores={indicadoresList} /> },
    { value: 'execucao', label: 'Tempo de execução', component: <Execucao indicadores={indicadoresList} /> },
    { value: 'conclusao', label: 'Conclusão', component: <Conclusao indicadores={indicadoresList} /> },
  ];

  return (
    <>
      <Cabecalho
        tab={currentTab}
        tabsList={tabsList}
        currentTab={currentTab}
        changeTab={(event, newValue) => setItemValue(newValue, setCurrentTab, 'tadDuracao')}
        title={`Duração dos processos - ${tabsList?.find(({ value }) => value === currentTab)?.label}`}
      />
      <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

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

  return (
    <>
      <Cabecalho
        tab={currentTab}
        tabsList={tabsList}
        currentTab={currentTab}
        title={`SGQ - ${tabsList?.find(({ value }) => value === currentTab)?.label}`}
        changeTab={(event, newValue) => setItemValue(newValue, setCurrentTab, 'tabSgq')}
      />
      <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------

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
          <Typography variant="h6">
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

// ---------------------------------------------------------------------------------------------------------------------

export function ColaboradorCard({ colaboradorDados, total, assuntos, detail }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const totalColaborador = sumBy(colaboradorDados?.processos, 'total');
  const colaborador = colaboradores?.find(({ perfil_id: pid }) => pid === colaboradorDados.item);

  return (
    <GridItem md={6} lg={4}>
      <Card sx={{ height: 1, p: 1 }}>
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{ py: 1.5, bgcolor: detail && 'background.neutral', borderRadius: 1 }}
        >
          <CustomAvatar
            name={colaborador?.nome}
            src={getIntranetFile('colaborador', colaborador?.foto_anexo)}
            sx={{ width: 50, height: 50, boxShadow: (theme) => theme.customShadows.z8 }}
          />
          <Stack>
            <Typography variant="subtitle1" noWrap>
              {colaborador?.nome}
            </Typography>
            <Stack spacing={1} direction="row" alignItems="center" sx={{ color: 'text.success' }}>
              <Typography variant="h6">{fNumber(totalColaborador)}</Typography>
              <Typography sx={{ opacity: 0.75 }}>({fPercent((totalColaborador * 100) / total)})</Typography>
            </Stack>
          </Stack>
        </Stack>
        {detail && (
          <Stack sx={{ p: 1 }}>
            {colaboradorDados?.processos?.map(({ total, assunto }) => {
              const percentagem = (total * 100) / totalColaborador;
              const totalAssunto = assuntos?.find(({ item }) => item === assunto);
              return (
                <Stack key={assunto} spacing={0.5} sx={{ width: 1, mt: 3 }}>
                  <Stack spacing={0.5} direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                      {assunto}
                    </Typography>
                    <Stack
                      spacing={0.75}
                      direction="row"
                      alignItems="center"
                      divider={<Divider orientation="vertical" flexItem />}
                    >
                      <Typography variant="subtitle1">&nbsp;{fNumber(total)}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {fPercent((total * 100) / sumBy(totalAssunto?.processos, 'total'))}
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
    </GridItem>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function TableIndicadores({ label, label1, dados, total = 0, percentagem = false, vista = '' }) {
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
                <>{vista === 'Anual' ? fYear(row?.criado_em) : vista === 'Mensal' && fMonthYear(row?.criado_em)}</>
              ) : (
                row?.assunto || row?.label
              )}
            </TableCell>
            <TableCell align="right">
              {label1 === 'Média em dias' ? fNumber(row?.total || row?.dias, 2) : fNumber(row?.total || row?.dias)}
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

// ---------------------------------------------------------------------------------------------------------------------

export function TabView({ vista, setVista, exportar = null }) {
  return (
    <Stack direction="row" justifyContent="right" alignItems="center" spacing={1}>
      <Tabs value={vista} onChange={(event, newValue) => setItemValue(newValue, setVista, 'tabView')}>
        {['Gráfico', 'Tabela'].map((tab) => (
          <Tab key={tab} label={tab} value={tab} sx={{ px: 0.5 }} />
        ))}
      </Tabs>
      {exportar}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

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
