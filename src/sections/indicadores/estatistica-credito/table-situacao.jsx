import sumBy from 'lodash/sumBy';
import { useState, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
// utils
import { useSelector } from '../../../redux/store';
import { normalizeText } from '../../../utils/formatText';
import { fCurrency, fConto, fNumber } from '../../../utils/formatNumber';
// components
import { EmptyRow } from './resumo';
import { Segmento, SegmentoStd } from './table-content';
import { SkeletonTable } from '../../../components/skeleton';
import { SearchToolbarSimple } from '../../../components/SearchToolbar';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableSituacaoCredito({ from }) {
  const [filter, setFilter] = useState('');
  const { isLoading, estCredito, moeda } = useSelector((state) => state.indicadores);
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
        ({fNumber(dadosFrom.length)}) -{' '}
        {moeda === 'Escudo' ? fCurrency(sumBy(dadosFrom, total)) : fConto(sumBy(dadosFrom, total), true)}
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
