import sumBy from 'lodash/sumBy';
import { useState, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
// utils
import { useSelector } from '../../../redux/store';
import { normalizeText } from '../../../utils/formatText';
import { fCurrency, fConto, fNumber } from '../../../utils/formatNumber';
// components
import { EmptyRow } from './resumo';
import NaoClassificados from './nao-classificados';
import { Segmento, SegmentoStd } from './table-content';
import { SkeletonTable } from '../../../components/skeleton';
import { SearchToolbarSimple } from '../../../components/SearchToolbar';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableSituacaoCredito({ from }) {
  const [filter, setFilter] = useState('');
  const [font, setFont] = useState('caption');
  const { isLoading, estCredito, moeda } = useSelector((state) => state.indicadores);
  const { entrada, aprovado, desistido, contratado, indeferido } = estCredito || {};

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

  const itemMontante =
    (from === 'aprovado' && 'montante_aprovado') || (from === 'contratado' && 'montante_contratado') || 'montantes';
  const total = useMemo(() => sumBy(dadosFrom, itemMontante), [dadosFrom, itemMontante]);
  const totalPrev = useMemo(
    () =>
      (from === 'aprovado' && sumBy(dadosFrom, 'montantes')) ||
      (from === 'contratado' && sumBy(dadosFrom, 'montante_aprovado')) ||
      0,
    [dadosFrom, from]
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
    naoClassificados,
  } = filterDados(Array.isArray(dadosFrom) ? dadosFrom : [], filter);

  return (
    <Card sx={{ p: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Stack sx={{ flexGrow: 1 }}>
          <SearchToolbarSimple filter={filter} setFilter={setFilter} />
        </Stack>
        <Tooltip title={font === 'caption' ? 'Aumentar fonte' : 'Diminuir fonte'}>
          <IconButton onClick={() => setFont(font === 'caption' ? 'body1' : 'caption')}>
            {font === 'caption' ? <TextIncreaseIcon /> : <TextDecreaseIcon />}
          </IconButton>
        </Tooltip>
      </Stack>
      <Stack
        sx={{
          p: 1.5,
          borderRadius: 1,
          textAlign: 'center',
          bgcolor: 'background.neutral',
          typography: font === 'caption' ? 'subtitle2' : 'subtitle1',
        }}
      >
        TOTAL DE CRÉDITOS{' '}
        {(from === 'entrada' && 'ENTRADOS') ||
          (from === 'aprovado' && 'APROVADOS') ||
          (from === 'contratado' && 'CONTRATADOS') ||
          (from === 'indeferido' && 'INDEFERIDOS') ||
          (from === 'desistido' && 'DESISTIDOS')}{' '}
        ({fNumber(dadosFrom.length)}) - {moeda === 'Escudo' ? fCurrency(total) : fConto(total, true)}
        {(from === 'aprovado' || from === 'contratado') && totalPrev !== total && <CellMontante from={from} />}
      </Stack>
      <TableContainer
        sx={{
          mt: 1,
          '& .MuiTableCell-root': { typography: font },
          '& .MuiTableHead-root .MuiTableCell-root': { fontWeight: 'bold' },
        }}
      >
        <Table size="small" id="tabel-estatistica-credito">
          <TableHead>
            <TableRow>
              <TableCell>Segmento</TableCell>
              <TableCell>Linha</TableCell>
              <TableCell align="right">Nº</TableCell>
              <TableCell>Proponente</TableCell>
              <TableCell align="center">
                Data{' '}
                {((from === 'entrada' || from === 'indeferido' || from === 'desistido') && 'entrada') ||
                  (from === 'aprovado' && 'aprovação') ||
                  (from === 'contratado' && 'contratação')}
              </TableCell>
              <TableCell>Sector atividade</TableCell>
              {(from === 'entrada' || from === 'indeferido' || from === 'desistido') && (
                <TableCell>Finalidade</TableCell>
              )}
              {(from === 'entrada' || from === 'aprovado') && <TableCell>Situação</TableCell>}
              {from === 'entrada' && <TableCell align="right">Nº proposta</TableCell>}
              {from === 'contratado' && (
                <>
                  <TableCell>Finalidade</TableCell>
                  <TableCell align="right">Prazo</TableCell>
                  <TableCell align="right">Taxa</TableCell>
                  <TableCell>Garantia</TableCell>
                  <TableCell align="center">Decisor</TableCell>
                  <TableCell align="right">Nº cliente</TableCell>
                </>
              )}
              {(from === 'indeferido' || from === 'desistido') && (
                <TableCell align="center">Data {from === 'indeferido' ? 'indeferimento' : 'desistência'}</TableCell>
              )}
              {(from === 'entrada' || from === 'aprovado' || from === 'indeferido' || from === 'desistido') && (
                <TableCell align="right">Solicitado</TableCell>
              )}
              {(from === 'aprovado' || from === 'contratado') && <TableCell align="right">Aprovado</TableCell>}
              {from === 'contratado' && <TableCell align="right">Contratado</TableCell>}
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
      {naoClassificados.length > 0 && (
        <NaoClassificados naoClassificados={naoClassificados} from={from} moeda={moeda} />
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function CellMontante({ from }) {
  return (
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      <Typography variant="caption" component="span" sx={{ color: 'error.main' }}>
        *
      </Typography>{' '}
      O montante <b>{from === 'aprovado' ? 'solicitado' : 'aprovado'}</b> difere do montante{' '}
      <b>{from === 'aprovado' ? 'aprovado' : 'contratado'}</b>
    </Typography>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function filterDados(dados, filter) {
  const filtrados = filter
    ? dados.filter(({ titular, cliente }) => {
        const normalizedFilter = normalizeText(filter);
        const t = titular ? normalizeText(titular) : '';
        const c = cliente ? normalizeText(cliente) : '';
        return t.includes(normalizedFilter) || c.includes(normalizedFilter);
      })
    : dados;

  const resultado = Object.keys(categorias).reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {});

  const { classificados, naoClassificados } = filtrados.reduce(
    (acc, item) => {
      const categoriaEncontrada = Object.entries(categorias).find(
        ([, cond]) => (!cond.segmento || cond.segmento === item.segmento) && (!cond.linha || cond.linha === item.linha)
      );

      if (categoriaEncontrada) {
        const [chave] = categoriaEncontrada;
        acc.classificados[chave].push(item);
      } else acc.naoClassificados.push(item);

      return acc;
    },
    { classificados: { ...resultado }, naoClassificados: [] }
  );

  return { ...classificados, naoClassificados };
}

export const categorias = {
  empresaConstrucao: { segmento: 'Empresa', linha: 'Construção' },
  empresaTesouraria: { segmento: 'Empresa', linha: 'Tesouraria' },
  empresaInvestimento: { segmento: 'Empresa', linha: 'Investimento' },
  particularHabitacao: { segmento: 'Particular', linha: 'Habitação' },
  particularCrediCaixa: { segmento: 'Particular', linha: 'CrediCaixa' },
  particularOutros: { segmento: 'Particular', linha: 'Outros' },
  piTesouraria: { segmento: 'Produtor Individual', linha: 'Tesouraria' },
  piInvestimento: { segmento: 'Produtor Individual', linha: 'Investimento' },
  piMicrocredito: { segmento: 'Produtor Individual', linha: 'Micro-Crédito' },
  entidadesPublicas: { segmento: 'Entidade Pública' },
  garantiaBancaria: { linha: 'Garantia Bancária' },
};
